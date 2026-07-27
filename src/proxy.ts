import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/auth";

// Red de seguridad ademas del chequeo que ya hace cada route handler:
// si se agrega una ruta nueva bajo /api y alguien olvida copiar el
// chequeo de sesion, esto la protege igual.
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!validateSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/dashboard/:path*", "/api/liquidaciones/:path*", "/api/10x/:path*"],
};
