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
// Lectura: sesión firmada (ES256) verificada localmente y correo en la lista; sin llamada de red por petición.
export const sessionProvider: SessionProvider = { async resolve(request) {
  const { requestAuth, authorizedSession } = await import("./supabase-request");
  const auth = requestAuth(request);
  if (!auth) return { state: "unconfigured" };
  const session = await authorizedSession(auth);
  if (!session) return { state: "anonymous" };
  const {data,error} = await auth.client.auth.getClaims();
  if(error || !data?.claims?.exp) return {state:"anonymous"};
  return {state:"authenticated",userId:session.id,expiresAt:new Date(data.claims.exp*1000).toISOString(),capabilities:["annienexus:read","radar:read"]};
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
