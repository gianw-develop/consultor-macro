"use client";
import { HORIZONS, HORIZON_LABELS } from "../../contracts/core";
import { useDemo } from "./demo-provider";
export function HorizonControls() {
  const { horizon, setHorizon } = useDemo();
  return <div className="context-bar"><span className="horizon-caption">Horizonte de análisis</span><div className="horizon-group" role="group" aria-label="Horizonte de análisis">{HORIZONS.map((h) => <button key={h} aria-pressed={horizon === h} onClick={() => setHorizon(h)}>{HORIZON_LABELS[h]}</button>)}</div><div className="demo-switch"><span className="status-dot"/><span>Datos fechados · tesis pendiente</span></div></div>;
}
