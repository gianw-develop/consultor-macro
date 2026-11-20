"use client";
import { useState } from "react";
import Link from "next/link";
import brief from "./daily-brief.json";
import dynamic from "next/dynamic";
import { HorizonControls } from "../../shared/ui/horizon-controls";
import { Tag, SectionHeading } from "../../shared/ui/primitives";
import { Icon } from "../../shared/ui/icons";
import { INDEX_CARDS } from "./demo";
import { ECONOMIC_COLORS, type EconomicReading } from "./economic-reading";
import { ActivityEvidence, SignalEvidence, readingDate } from "./reading-evidence";
const BrainScene = dynamic(() => import("./brain-scene").then(m => m.BrainScene), { ssr: false, loading: () => <div className="brain-canvas-wrap"><p className="canvas-status">Preparando visor 3D…</p></div> });
export function Brain({reading}:{reading:EconomicReading}) {
  const [channel, setChannel] = useState(0), [paused, setPaused] = useState(false), [reduced, setReduced] = useState(false), [reset, setReset] = useState(0), [turn, setTurn] = useState(0);
  const selected = reading.signals[channel];
  const visual={body:reading.body.tone,veins:reading.signals.map(s=>s.tone)};
  return <main id="main-content" className="main-content brain-page">
    <div className="page-heading"><div><h1>Entiende qué conecta la historia.</h1><p className="lead">{brief.title}</p></div><HorizonControls /></div>
    <p className="small muted">{brief.summary}</p>
    <div className="brain-layout">
      <section className="panel brain-stage">
        <SectionHeading title="Cerebro del mercado">{(()=>{const age=(Date.parse(reading.evaluatedAt)-Date.parse(reading.cut))/864e5;const stale=!Number.isFinite(age)||age>10;return <Tag tone={stale?"amber":reading.body.tone==="green"?"green":"amber"}>{stale?`CORTE ANTIGUO · ${Number.isFinite(age)?Math.floor(age):"?"} DÍAS`:"DATOS CONECTADOS"}</Tag>;})()}</SectionHeading>
        <div className="brain-legend"><i style={{background:ECONOMIC_COLORS[reading.body.tone]}}/><strong>{reading.body.title}</strong><br/>Venas: cambios por familia.</div>
        <div className="brain-art">
          <BrainScene visual={visual} channel={channel} paused={paused || reduced} resetToken={reset} turn={turn} />
          <svg className="brain-orbits" viewBox="0 0 960 510" aria-hidden="true"><ellipse cx="470" cy="265" rx="405" ry="208" transform="rotate(-9 470 265)" /><path d="M84 226l-9 13 15-4 M863 378l-12-3 5 13" /></svg>
          {reading.signals.slice(0,3).map((signal,i)=><button key={signal.id} className={"brain-callout "+["inflation","fed","bonds"][i]} style={{color:ECONOMIC_COLORS[signal.tone]}} onClick={()=>setChannel(i)} aria-pressed={channel===i}><i style={{background:ECONOMIC_COLORS[signal.tone]}}/><strong>{["Solicitudes","Ventas reales","M1 real"][i]}</strong><small>{signal.tone==="green"?"INDICIO DE MEJORA":signal.tone==="red"?"INDICIO DE DETERIORO":"SIN CONFIRMACIÓN"}</small></button>)}
        </div>
        <div className="brain-controls">
          <button className="button" onClick={() => setTurn(t => t + 1)} aria-label="Girar cerebro a la derecha"><Icon name="reset" />Girar vista</button>
          <button className="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? "▶ Reanudar" : "Ⅱ Pausar"}</button>
          <button className="button" onClick={() => setReset(r => r + 1)}><Icon name="reset" />Restablecer</button>
          <button className="button reduce-motion" onClick={() => setReduced(!reduced)} aria-pressed={reduced}>Movimiento reducido</button>
        </div>
      </section>
      <aside className="panel brain-inspector">
        <SectionHeading title="Qué estamos explorando" />
        <div className="reading-tabs" role="group" aria-label="Familia económica">{reading.signals.map((signal,i)=><button key={signal.id} aria-pressed={channel===i} onClick={()=>setChannel(i)}><i style={{background:ECONOMIC_COLORS[signal.tone]}}/>{["Solicitudes","Ventas reales","M1 real","CLI EE. UU.","LEI","IPC","Empleo","Bonos / Fed"][i]}</button>)}</div>
        <SignalEvidence signal={selected}/>
        <p className="micro reading-selection-note">Seleccionar resalta una familia; no cambia su estado ni el del cuerpo.</p>
      </aside>
    </div>
    <section className="panel brain-reading"><ActivityEvidence reading={reading}/><p className="small muted">Verde: mejora de la familia o actividad expansiva respaldada. Rojo: deterioro. Ámbar: contradicción. Azul gris: dato, causa o revisión insuficientes. No son órdenes de compra o venta.</p></section>
    <div className="index-grid brain-indices">{INDEX_CARDS.map(item => <Link href={"/annienexus#thesis-" + item.id} className="panel" key={item.id}><div className="section-heading"><h2>{item.name}</h2><Icon name="chevron" /></div><div className="index-summary"><span className="round-icon"><Icon name="trend" size={30} /></span><div><strong>Por confirmar</strong><p>Tesis sin evaluar</p></div></div></Link>)}</div>
    <div className="panel change-story"><strong>Corte compartido:</strong><span>{readingDate(reading.cut)} (Madrid). Principal, Cerebro y cuadrante usan la misma evaluación. Las tesis de los índices siguen sin confirmar.</span></div>
    <details className="credits"><summary>Modelo 3D, límites y procedencia</summary><p>Las venas representan familias económicas, no anatomía ni actividad cerebral. Sus colores proceden de observaciones; su recorrido conserva el diseño aprobado. Se respeta la preferencia de movimiento reducido del dispositivo. Geometría: Kristen Browne y Heidi Schlehlein, Human Reference Atlas, Brain Male v1.3 (2023), a partir de Allen Human Reference Atlas. Materiales, iluminación y conexiones adaptados para AWNexus. <a href="https://doi.org/10.48539/HBM929.XKCL.339" target="_blank" rel="noreferrer">Fuente HRA ↗</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>.</p></details>
  </main>;
}
