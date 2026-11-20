"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Brand } from "./brand";
import { DotMatrix } from "./dot-matrix";
import "./access.css";

const NOTICE: Record<string, string> = { "enlace-invalido": "ENLACE CADUCADO" };

export function AccessForm({ configured, destination = "/annienexus", notice }: { configured: boolean; destination?: string; notice?: string }) {
  const [message, setMessage] = useState(notice ? NOTICE[notice] ?? "" : "");
  const [busy, setBusy] = useState(false);
  const [granted, setGranted] = useState(false);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => setClock(new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/New_York", hour12: false }).format(new Date()));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/auth/entry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "login", email: String(data.get("email") ?? "").trim(), password: String(data.get("password") ?? "") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setGranted(true);
      setTimeout(() => window.location.replace(destination), 600);
    } catch (error) {
      setMessage((error instanceof Error && error.message ? error.message : "Sin conexión").toUpperCase().replace(/\.$/, ""));
      setBusy(false);
    }
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
          <form onSubmit={submit}>
            <label className="term-label" htmlFor="term-email">CORREO</label>
            <div className="term-field"><span aria-hidden="true">&gt;</span><input id="term-email" type="email" name="email" autoComplete="username" required disabled={busy || granted} autoFocus spellCheck={false} /></div>
            <label className="term-label" htmlFor="term-password">CLAVE</label>
            <div className="term-field"><span aria-hidden="true">&gt;</span><input id="term-password" type="password" name="password" autoComplete="current-password" required maxLength={512} disabled={busy || granted} /><i className="term-caret" aria-hidden="true" /></div>
            <button className="term-go" disabled={busy || granted}>{busy ? "VERIFICANDO…" : "ENTRAR"} <kbd>↵</kbd></button>
            {granted && <p className="term-status ok" role="status">■ ACCESO CONCEDIDO</p>}
            {message && <p className="term-status err" role="status">■ {message}</p>}
          </form>}
      </div>
      <footer className="term-foot"><span>■ CONEXIÓN CIFRADA</span><span>SESIÓN PRIVADA</span></footer>
    </section>
  </main>;
}
