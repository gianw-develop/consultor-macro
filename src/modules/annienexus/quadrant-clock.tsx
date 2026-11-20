"use client";

import { useId, useState, useSyncExternalStore, type CSSProperties } from "react";
import type { ClockReading } from "./regime-clock";
import { madridEventTime } from "./economic-calendar";
import { demoPhaseAngle, type QuadrantPoint } from "./quadrant-data";

const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const motionSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function PhaseClock({ demo, point, playOnMount, provenance, reduceMotion, onToggleReducedMotion, onInspect, orientation }: {
  orientation?: ClockReading; demo: boolean; point: QuadrantPoint | null; playOnMount: boolean; provenance: string; reduceMotion: boolean; onToggleReducedMotion: () => void; onInspect: () => void; onShowDemo: () => void;
}) {
  const provenanceId = useId();
  const systemReduced = useSyncExternalStore(subscribeMotion, motionSnapshot, () => false);
  const [playback, setPlayback] = useState<"idle" | "running" | "paused" | "done">(() => playOnMount ? (reduceMotion || (typeof window !== "undefined" && motionSnapshot()) ? "done" : "running") : "idle");
  const [run, setRun] = useState(0);
  const reduced = reduceMotion || systemReduced;
  const example = demo && playback !== "idle";
  const angle = example ? -35 : demo ? demoPhaseAngle(true, point) : orientation?.angle ?? null;
  const animate = example && !reduced && (playback === "running" || playback === "paused");
  const phaseName = point ? ({growth_prices_up:"Boom inflacionario",growth_down_prices_up:"Estanflación",growth_prices_easing:"Crisis deflacionaria*",growth_up_prices_easing:"Boom desinflacionario",transition:"Frontera del ejemplo"}[point.zone]) : "Sin fase";
  const play = () => { setRun(v => v + 1); setPlayback(reduced ? "done" : "running"); };
  return <div className="phase-clock-block" data-mode={demo ? "demonstration" : "dated-cut"}>
    <button className={"phase-dial" + (!demo ? " phase-dial-reviewed" : "")} onClick={onInspect} aria-haspopup="dialog" aria-describedby={provenanceId} aria-label={demo ? "Abrir evidencia de la brújula didáctica" : `${orientation?.label ?? "Sin revisión"}: ${orientation?.review?.title ?? "datos ausentes"}. Abrir fecha, evidencias y contradicciones`}>
      <svg className="phase-ring" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="88" className="phase-ring-base" />
        {!demo && angle !== null && <>
          <path d="M100 100 L100 18 A82 82 0 0 1 182 100 Z" transform={`rotate(${angle-45} 100 100)`} className="phase-provisional-sector"/>
          <circle cx="100" cy="100" r="34" className="phase-uncertainty"/>
          <g className={"phase-reviewed-hand"+(orientation?.status === "historical" ? " phase-historical" : "")} transform={`rotate(${angle} 100 100)`}>
            <path d="M100 100V29" className="phase-needle"/><path d="M94 39L100 25L106 39" className="phase-needle-tip"/>
          </g>
          <circle cx="100" cy="100" r="5" className="phase-hub"/>
          <text x="100" y="153" className="phase-country">EE. UU.</text><text x="100" y="167" className="phase-country-small">{orientation?.status === "historical" ? "ÚLTIMA FECHADA" : "PROVISIONAL"}</text>
        </>}
        <path d="M14 96A86 86 0 0 1 96 14" stroke="var(--amber)" /><path d="M104 14A86 86 0 0 1 186 96" stroke="var(--green)" />
        <path d="M186 104A86 86 0 0 1 104 186" stroke="var(--blue)" /><path d="M96 186A86 86 0 0 1 14 104" stroke="var(--red)" />
        {[0,90,180,270].map(a => <path key={a} d="M100 3V10" transform={`rotate(${a} 100 100)`} className="phase-tick" />)}
      </svg>
      {demo && angle !== null && <span key={run} className={"phase-rotor" + (animate ? " phase-roll" : "")} style={{ transform: `rotate(${angle}deg)`, "--phase-from": "35deg", "--phase-to": "-35deg", animationPlayState: playback === "paused" ? "paused" : "running" } as CSSProperties} onAnimationEnd={() => setPlayback("done")}><span className="phase-hand" /><span className="phase-dot" /></span>}
      {(demo || angle === null) && <span className="phase-center"><span>{example ? "GIRO DIDÁCTICO" : demo ? "EJEMPLO FICTICIO" : "RÉGIMEN COMPLETO"}</span><strong>{example ? "Transición" : demo ? phaseName : "Sin posición"}</strong><small>{example ? "Sin destino real asignado" : demo ? "Punto sobre el círculo" : "Marco docente recibido"}</small></span>}
    </button>
    <div className="phase-clock-controls">
      {!demo ? <><strong className="phase-reviewed-label">{orientation?.label ?? "Revisión no disponible"}</strong><span className="phase-reviewed-date">{orientation?.review ? `${madridEventTime(orientation.review.cut)} de 2026 · Madrid` : "Sin fecha"}</span><button onClick={onInspect} aria-haspopup="dialog">Pulsar para ver por qué</button></> : <><button onClick={play}>{playback === "idle" ? "Ver giro de ejemplo" : "Repetir giro"}</button>{animate && <button onClick={() => setPlayback(playback === "paused" ? "running" : "paused")}>{playback === "paused" ? "Reanudar" : "Pausar"}</button>}{example && <button onClick={() => setPlayback("idle")}>Volver a la fecha</button>}<button aria-pressed={reduced} disabled={systemReduced} onClick={() => { onToggleReducedMotion(); if (!reduceMotion && playback !== "idle") setPlayback("done"); }}>Reducir movimiento{systemReduced ? " · sistema" : ""}</button></>}
    </div>
    <p className="phase-provenance" id={provenanceId}>{example ? "Escenario sintético sin fecha ni fuente económica real. " : ""}{provenance}</p>
    <p className="phase-clock-caption" aria-live="polite">{example ? "DEMO: boom inflacionario → estanflación. " + (reduced ? "Vista estática por movimiento reducido." : playback === "running" ? "Giro único en curso." : playback === "paused" ? "Giro pausado." : "Ejemplo terminado; no se repite solo.") : demo ? "La orientación resume las diferencias ficticias de la fecha elegida; no mide velocidad ni certeza." : (orientation?.explanation ?? "Falta una revisión de ambos ejes.")}</p>
  </div>;
}
