import { systemClock, type Clock } from "../../contracts/core";
import { apiResponse, unavailable } from "./envelope";
export type Capability = "annienexus:read" | "radar:read";
export type SessionState =
  | { state: "unconfigured" }
  | { state: "anonymous" }
  | { state: "authenticated"; userId: string; expiresAt: string; capabilities: Capability[] };
export interface SessionProvider {
  resolve(request: Request): Promise<SessionState>;
}
// Identity is verified with Supabase; only confirmed, explicitly allowed accounts enter.
export const sessionProvider: SessionProvider = { async resolve(request) {
  const { requestAuth, authorizedUser } = await import("./supabase-request");
  const auth = requestAuth(request);
  if (!auth) return { state: "unconfigured" };
  const user = await authorizedUser(auth);
  if (!user) return { state: "anonymous" };
  const {data,error} = await auth.client.auth.getClaims();
  if(error || !data?.claims?.exp) return {state:"anonymous"};
  return {state:"authenticated",userId:user.id,expiresAt:new Date(data.claims.exp*1000).toISOString(),capabilities:["annienexus:read","radar:read"]};
} };
export async function authorizeRead(
  request: Request, capability: Capability,
  provider: SessionProvider = sessionProvider, clock: Clock = systemClock,
): Promise<Response | null> {
  let session: SessionState;
  try { session = await provider.resolve(request); }
  catch { return apiResponse(unavailable(null, "No se pudo verificar la sesión.", clock), 503); }
  if (session.state === "unconfigured") {
    return apiResponse(unavailable(null, "Acceso pendiente de configuración.", clock), 503);
  }
  if (session.state === "anonymous") {
    return apiResponse(unavailable(null, "Se requiere una sesión válida.", clock), 401);
  }
  const expiry = Date.parse(session.expiresAt);
  if (!session.userId || !Number.isFinite(expiry) || expiry <= clock().getTime()) {
    return apiResponse(unavailable(null, "Se requiere una sesión válida.", clock), 401);
  }
  if (!session.capabilities.includes(capability)) {
    return apiResponse(unavailable(null, "Acceso no autorizado para este módulo.", clock), 403);
  }
  return null;
}
