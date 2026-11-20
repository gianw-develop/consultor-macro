"use client";
import { useRef, useState } from "react";
import { useNotebookActions } from "./notebook";
export function NotebookTransfer() {
  const {exportNotebook,restoreNotebook,local}=useNotebookActions();
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  function download() {
    try {
    const blob = new Blob([exportNotebook()], { type: "application/json" });
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = "annienexus-apuntes-" + new Date().toISOString().slice(0,10) + ".json"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Descarga solicitada. Comprueba la carpeta de descargas; contiene tus apuntes personales.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo leer el cuaderno. No se ha modificado nada."); }
  }
  return <details className="notebook-transfer"><summary>Copia y recuperación</summary><p>La copia completa conserva también apuntes fuera de la selección visible. Descárgala para guardarlos fuera del navegador. Al importar, se añaden sin borrar los existentes.</p><div className="note-transfer-actions"><button type="button" className="button" onClick={download}>Descargar copia</button><button type="button" className="button" onClick={() => input.current?.click()}>Importar copia</button></div><input ref={input} type="file" accept=".json,application/json" className="sr-only" aria-label="Copia de apuntes" onChange={async e => { const file = e.target.files?.[0]; e.target.value=""; if (!file) return; try { if(file.size>1100000) throw new Error("El archivo es demasiado grande."); const count=await restoreNotebook(await file.text()); setMessage("Copia integrada: "+count+(local?" apuntes en este navegador.":" apuntes en tu cuenta.")); } catch(error) { setMessage(error instanceof Error?error.message:"No se pudo recuperar la copia."); } }}/><p role="status">{message}</p></details>;
}
