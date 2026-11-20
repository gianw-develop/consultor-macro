"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Brand } from "./brand";
import { DotMatrix } from "./dot-matrix";
import "./access.css";

type Step = "email" | "code" | "granted";
const NOTICE: Record<string, string> = { "enlace-invalido": "ENLACE CADUCADO" };
const DIGITS = 6;

export function AccessForm({ configured, destination = "/annienexus", notice }: { configured: boolean; destination?: string; notice?: string }) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(notice ? NOTICE[notice] ?? "" : "");
  const [busy, setBusy] = useState(false);
  const [clock, setClock] = useState("");
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const tick = () => setClock(new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/New_York", hour12: false }).format(new Date()));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  async function send(body: Record<string, string>) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/auth/entry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result as { ok?: boolean };
    } catch (error) {
      setMessage((error instanceof Error && error.message ? error.message : "Sin conexión").toUpperCase().replace(/\.$/, ""));
      return null;
    } finally { setBusy(false); }
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (step === "email") {
      const address = String(new FormData(e.currentTarget).get("email") ?? "").trim();
      setEmail(address);
      if (await send({ action: "send-code", email: address })) setStep("code");
      return;
    }
    const result = await send({ action: "verify-code", email, code });
    if (result?.ok) { setStep("granted"); setTimeout(() => window.location.replace(destination), 700); }
    else setCode("");
  }
  function onCode(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, DIGITS);
    setCode(digits);
    if (digits.length === DIGITS) requestAnimationFrame(() => form.current?.requestSubmit());
  }

  return <main className="term-access" id="main-content">
    <DotMatrix />
    <div className="term-vignette" aria-hidden="true" />
    <section className="term-box" aria-labelledby="term-title">
      <header className="term-bar"><span>AWNEXUS TERMINAL</span><span className="term-clock" aria-label="Hora de Nueva York">NY {clock}</span></header>
      <div className="term-body">
        <span className="term-brand"><Brand /></span>
        <h1 id="term-title" className="sr-only">Acceso</h1>
        {!configured ? <p className="term-status err" role="status">ACCESO NO DISPONIBLE</p> :
          <form ref={form} onSubmit={submit} noValidate={step === "code"}>
            {step === "email" && <>
              <label className="term-label" htmlFor="term-email">CORREO</label>
              <div className="term-field"><span aria-hidden="true">&gt;</span><input id="term-email" type="email" name="email" autoComplete="email" defaultValue={email} required disabled={busy} autoFocus spellCheck={false} /><i className="term-caret" aria-hidden="true" /></div>
              <button className="term-go" disabled={busy}>{busy ? "ENVIANDO…" : "ENVIAR CÓDIGO"} <kbd>↵</kbd></button>
            </>}
            {step === "code" && <>
              <label className="term-label" htmlFor="term-code">CÓDIGO</label>
              <div className="term-code">
                <input id="term-code" name="code" value={code} onChange={e => onCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={DIGITS} aria-describedby="term-code-help" autoFocus disabled={busy} />
                <div className="term-slots" aria-hidden="true">{Array.from({ length: DIGITS }, (_, i) => <span key={i} data-on={i === code.length && !busy ? "" : undefined}>{code[i] ?? ""}</span>)}</div>
              </div>
              <p id="term-code-help" className="sr-only">Código de {DIGITS} dígitos enviado a tu correo</p>
              <button className="term-go" disabled={busy || code.length < DIGITS}>{busy ? "VERIFICANDO…" : "ENTRAR"} <kbd>↵</kbd></button>
              <button type="button" className="term-link" disabled={busy} onClick={() => { setMessage(""); setCode(""); setStep("email"); }}>PEDIR OTRO</button>
            </>}
            {step === "granted" && <p className="term-status ok" role="status">■ ACCESO CONCEDIDO</p>}
            {message && <p className="term-status err" role="status">■ {message}</p>}
          </form>}
      </div>
      <footer className="term-foot"><span>■ CONEXIÓN CIFRADA</span><span>SESIÓN PRIVADA</span></footer>
    </section>
  </main>;
}
