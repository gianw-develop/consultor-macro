import { NextResponse } from "next/server";
import { applicationOrigin, emailAllowed, sameOrigin } from "../../../../shared/server/auth-config";
import { requestAuth } from "../../../../shared/server/supabase-request";

// Acceso solo con correo autorizado + código de un solo uso (sin contraseñas). El código caduca al usarse o a los 10 minutos.
// Nunca se crean cuentas desde aquí (shouldCreateUser:false) y la respuesta al pedir
// un código es idéntica para correos autorizados y no autorizados (no revela cuáles existen).
const SENT = "Si el correo está autorizado, te llegará un código de acceso en unos segundos. Revisa también el correo no deseado.";
const CODE = /^\d{6,10}$/;

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  const auth = requestAuth(request);
  if (!auth) return NextResponse.json({ error: "Acceso pendiente de configuración." }, { status: 503 });
  const raw = await request.text();
  if (raw.length > 10000) return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  let input; try { input = JSON.parse(raw); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  if (!input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  const { email, code, action } = input as Record<string, unknown>;
  if (typeof email !== "string" || email.length > 320 || !["send-code", "verify-code"].includes(String(action)))
    return auth.apply(NextResponse.json({ error: "No se pudo acceder con esos datos." }, { status: 400 }));
  const address = email.trim().toLowerCase();

  if (action === "send-code") {
    if (emailAllowed(address)) {
      await auth.client.auth.signInWithOtp({ email: address, options: { shouldCreateUser: false, emailRedirectTo: new URL("/auth/callback", applicationOrigin(request)).href } });
    }
    return auth.apply(NextResponse.json({ message: SENT }));
  }
  if (action === "verify-code") {
    if (typeof code !== "string" || !CODE.test(code.trim()) || !emailAllowed(address))
      return auth.apply(NextResponse.json({ error: "Código no válido o caducado. Pide uno nuevo." }, { status: 401 }));
    const { error } = await auth.client.auth.verifyOtp({ email: address, token: code.trim(), type: "email" });
    return auth.apply(NextResponse.json(error ? { error: "Código no válido o caducado. Pide uno nuevo." } : { ok: true }, { status: error ? 401 : 200 }));
  }
  return auth.apply(NextResponse.json({ error: "No se pudo acceder con esos datos." }, { status: 400 }));
}
