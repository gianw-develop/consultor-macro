import { NextResponse } from "next/server";
import { requestAuth } from "../../../shared/server/supabase-request";
import { applicationOrigin } from "../../../shared/server/auth-config";

// Enlace de acceso del correo. Un fallo no deja una sesión a medias: vuelve al acceso con aviso.
export async function GET(request: Request) {
  const origin = applicationOrigin(request);
  const auth = requestAuth(request), code = new URL(request.url).searchParams.get("code");
  const failed = NextResponse.redirect(new URL("/acceso?estado=enlace-invalido", origin));
  if (!auth || !code || code.length > 512) return failed;
  try {
    const { error } = await auth.client.auth.exchangeCodeForSession(code);
    return auth.apply(error ? failed : NextResponse.redirect(new URL("/annienexus", origin)));
  } catch {
    return auth.apply(failed);
  }
}
