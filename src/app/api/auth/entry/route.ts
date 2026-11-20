import { NextResponse } from "next/server";
import { emailAllowed, sameOrigin } from "../../../../shared/server/auth-config";
import { requestAuth } from "../../../../shared/server/supabase-request";

// Acceso con correo autorizado + clave. No se crean cuentas desde aquí (registro cerrado
// en Supabase) y el error es el mismo para correo o clave incorrectos.
const DENIED = "Correo o clave incorrectos.";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  const auth = requestAuth(request);
  if (!auth) return NextResponse.json({ error: "Acceso no disponible." }, { status: 503 });
  const raw = await request.text();
  if (raw.length > 10000) return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  let input; try { input = JSON.parse(raw); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  if (!input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  const { email, password, action } = input as Record<string, unknown>;
  if (action !== "login" || typeof email !== "string" || email.length > 320 || typeof password !== "string" || !password || password.length > 512)
    return auth.apply(NextResponse.json({ error: DENIED }, { status: 401 }));
  const address = email.trim().toLowerCase();
  if (!emailAllowed(address)) return auth.apply(NextResponse.json({ error: DENIED }, { status: 401 }));
  const { error } = await auth.client.auth.signInWithPassword({ email: address, password });
  if (error) {
    console.info(`[acceso] clave rechazada: ${error.status ?? "?"} ${error.code ?? error.name}`);
    if (error.status === 429) return auth.apply(NextResponse.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 }));
    return auth.apply(NextResponse.json({ error: DENIED }, { status: 401 }));
  }
  return auth.apply(NextResponse.json({ ok: true }));
}
