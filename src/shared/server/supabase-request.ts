import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { applicationOrigin, authConfiguration, emailAllowed } from "./auth-config";
export function requestAuth(request: Request) {
  const config = authConfiguration();
  if (!config) return null;
  const input = request instanceof NextRequest ? request : new NextRequest(request.url, {headers: request.headers});
  const changes = new Map<string, {name:string;value:string;options:CookieOptions}>();
  const client = createServerClient(config.url, config.key, {
    cookieOptions: { httpOnly: true, secure: new URL(applicationOrigin(request)).protocol === "https:", sameSite: "lax", path: "/", maxAge: 60*60*24*7 },
    cookies: {
      getAll() { return input.cookies.getAll(); },
      setAll(cookies) { for (const cookie of cookies) { input.cookies.set(cookie.name,cookie.value); changes.set(cookie.name,cookie); } },
    },
  });
  return { client, input,
    apply(response: NextResponse) {
      for (const {name,value,options} of changes.values()) response.cookies.set(name,value,options);
      response.headers.set("Cache-Control","private, no-store, max-age=0");
      response.headers.set("Pragma","no-cache");
      return response;
    },
    /** Sesión validada localmente con la clave pública ES256 del proyecto (sin llamada de red por petición). */
    async claims() {
      const {data,error} = await client.auth.getClaims();
      if (error || !data?.claims) return null;
      return data.claims as { sub?: string; email?: string; is_anonymous?: boolean };
    },
    async user() {
      const {data,error} = await client.auth.getUser();
      if (error || !data.user) return null;
      return data.user;
    },
  };
}
export async function authorizedUser(auth: NonNullable<ReturnType<typeof requestAuth>>) {
  const user = await auth.user();
  return user?.email_confirmed_at && emailAllowed(user.email) ? user : null;
}
/**
 * Comprobación rápida para navegar: firma del token verificada localmente (ES256) y correo en la lista.
 * Supabase no emite sesión a correos sin confirmar y el registro está cerrado, así que no hace falta
 * consultar al servidor en cada página. Las escrituras (apuntes) siguen usando authorizedUser.
 */
export async function authorizedSession(auth: NonNullable<ReturnType<typeof requestAuth>>) {
  const claims = await auth.claims();
  return claims?.sub && !claims.is_anonymous && emailAllowed(claims.email) ? { id: claims.sub, email: claims.email! } : null;
}
