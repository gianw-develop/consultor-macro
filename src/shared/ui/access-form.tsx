"use client";
import { useState, type FormEvent } from "react";
import { Brand } from "./brand";

type Step = "email" | "code";
const NOTICE: Record<string, string> = {
  "enlace-invalido": "Enlace caducado. Pide otro.",
};

export function AccessForm({ configured, destination = "/annienexus", notice }: { configured: boolean; destination?: string; notice?: string }) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(notice ? NOTICE[notice] ?? "" : "");
  const [busy, setBusy] = useState(false);

  async function send(body: Record<string, string>) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/auth/entry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result as { ok?: boolean; message?: string };
    } catch (error) {
      setMessage(error instanceof Error && error.message ? error.message : "Sin conexión.");
      return null;
    } finally { setBusy(false); }
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (step === "email") {
      const address = String(form.get("email") ?? "").trim();
      setEmail(address);
      const result = await send({ action: "send-code", email: address });
      if (result) setStep("code");
      return;
    }
    const result = await send({ action: "verify-code", email, code: String(form.get("code") ?? "") });
    if (result?.ok) window.location.replace(destination);
  }

  return <main className="main-content access-page" id="main-content"><section className="panel access-panel">
    <span className="brand"><Brand /></span>
    <h1>{step === "code" ? "Revisa tu correo" : "Acceso"}</h1>
    {!configured ? <p role="status">Acceso no disponible.</p> :
      <form onSubmit={submit}>
        {step !== "code" && <label>Correo<input type="email" name="email" autoComplete="email" defaultValue={email} required disabled={busy} /></label>}
        {step === "code" && <label>Código<input type="text" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" maxLength={10} required autoFocus disabled={busy} /></label>}
        <button className="button primary" disabled={busy}>{busy ? "…" : step === "email" ? "Enviar código" : "Entrar"}</button>
        <p role="status">{message}</p>
        {step === "code" && <button className="access-switch" type="button" disabled={busy} onClick={() => { setMessage(""); setStep("email"); }}>Pedir otro</button>}
      </form>}
  </section></main>;
}
