"use client";
import {useRef,useState} from "react";
import {Tag} from "../../shared/ui/primitives";
import {QuadrantMap} from "./quadrant-map";
import {QuadrantEvidence} from "./quadrant-evidence";

import type { EconomicReading } from "./economic-reading";
import type { ClockReading } from "./regime-clock";
import { ActivityEvidence } from "./reading-evidence";
export function EconomicQuadrant({reading,clockReading}:{reading:EconomicReading;clockReading:ClockReading}){
 const [expanded,setExpanded]=useState(true);
 const detailRef=useRef<HTMLDialogElement>(null);
 const inspect=()=>detailRef.current?.showModal();
 return <section className="panel economic-quadrant" id="economic-quadrant" aria-labelledby="quadrant-heading">
  <header className="quadrant-summary"><span className="quadrant-mini" aria-hidden="true"><i/><i/><i/><i/></span><div className="quadrant-summary-copy"><h2 id="quadrant-heading">Brújula de régimen.</h2><p>{clockReading.review?.title ?? clockReading.label}</p></div><div className="quadrant-summary-state"><Tag tone="amber">{clockReading.label.toUpperCase()}</Tag><button className="button" aria-expanded={expanded} aria-controls="quadrant-content" onClick={()=>setExpanded(!expanded)}>{expanded?"− Minimizar cuadrante":"+ Restaurar cuadrante"}</button></div></header>
  <div className="quadrant-content" id="quadrant-content" hidden={!expanded}>
   <div className="quadrant-toolbar"><span className="eyebrow">CRECIMIENTO × INFLACIÓN</span><span className="small muted">Aguja discontinua: orientación cualitativa; no fase confirmada.</span></div>
   <div className="quadrant-live-axes"><p>{clockReading.review?.growth ?? reading.axes.growth}</p><p>{clockReading.review?.inflation ?? reading.axes.inflation}</p></div>
   <QuadrantMap reduceMotion={true} onToggleReducedMotion={()=>{}} demo={false} point={null} orientation={clockReading} playToken={0} provenance="Ángulo fijo por sector: convención gráfica. El halo cruza ambos ejes porque hay señales contrapuestas; no mide distancia, probabilidad ni trayectoria." onInspect={inspect} onShowDemo={()=>{}}/>
   <dialog className="quadrant-dialog" ref={detailRef} aria-labelledby="quadrant-point-title"><header className="quadrant-dialog-heading"><div><span className="eyebrow">LECTURA FECHADA Y CONTRADICCIONES</span><h3 id="quadrant-point-title">Qué señala la manecilla</h3></div><button className="button" onClick={()=>detailRef.current?.close()} aria-label="Cerrar evidencia">Cerrar ×</button></header><QuadrantEvidence orientation={clockReading}/><details className="quadrant-body-context"><summary>Estado separado de la actividad general</summary><ActivityEvidence reading={reading}/></details></dialog>
  </div>
 </section>;
}
