import { NextRequest, NextResponse } from "next/server";
import { applicationOrigin, localPreview } from "./shared/server/auth-config";
import { authorizedUser, requestAuth } from "./shared/server/supabase-request";
import { safePostLoginPath } from "./shared/auth-destination";
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (localPreview() && ["127.0.0.1","localhost","[::1]"].includes(request.nextUrl.hostname)) return NextResponse.next();
  // Only UI code, fonts and access routes are public. Private documents are server assets.
  if (path.startsWith("/_next/static/") || path.startsWith("/fonts/") || path.startsWith("/brand/") || path === "/icon.svg" || path === "/acceso" || path === "/auth/callback" || path === "/api/auth/entry" || path === "/api/auth/logout") return NextResponse.next();
  const auth=requestAuth(request);
  if (!auth) return new NextResponse("AWNexus: acceso pendiente de configuración.",{status:503,headers:{"Cache-Control":"no-store"}});
  try {
    const user=await authorizedUser(auth);
    if (!user) {
      const accessUrl = new URL("/acceso", applicationOrigin(request));
      accessUrl.searchParams.set("next", safePostLoginPath(path));
      const response=path.startsWith("/api/") || path.startsWith("/_next/") || /\.[a-z0-9]+$/i.test(path)
        ? NextResponse.json({error:"Se requiere una cuenta autorizada."},{status:401})
        : NextResponse.redirect(accessUrl);
      return auth.apply(response);
    }
    const response=auth.apply(NextResponse.next({request:auth.input}));
    // Recursos estáticos privados (modelo 3D, imágenes): caché solo en el navegador del usuario autorizado.
    if(/^\/annienexus\/.+\.(gz|bin|png|jpg|webp|json|yaml)$/i.test(path)) response.headers.set("Cache-Control","private, max-age=86400");
    return response;
  } catch { return auth.apply(NextResponse.json({error:"No se pudo verificar el acceso."},{status:503})); }
}
