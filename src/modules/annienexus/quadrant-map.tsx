"use client";

import { ATLAS_ZONES, type AtlasZone } from "./quadrant-atlas-data";
import type { ClockReading } from "./regime-clock";
import { PhaseClock } from "./quadrant-clock";
import type { QuadrantPoint } from "./quadrant-data";

function CurveIcon({ curve }: { curve: AtlasZone["curve"] }) {
  const paths = { hump: "M10 48Q31 7 58 48", flat: "M10 32H58", inverted: "M10 14L58 49", normal: "M10 49L58 14" };
  return <svg className="atlas-curve" viewBox="0 0 68 62" role="img" aria-label={{hump:"Curva de tipos con joroba",flat:"Curva de tipos plana",inverted:"Curva de tipos invertida descendente",normal:"Curva de tipos normal ascendente"}[curve]}><path d="M8 8V52H61" className="atlas-curve-axis" /><path d={paths[curve]} className="atlas-curve-line" /></svg>;
}

export function QuadrantMap({ demo, point, playToken, provenance, reduceMotion, onToggleReducedMotion, onInspect, onShowDemo, orientation }: {
  orientation?: ClockReading; demo: boolean; point: QuadrantPoint | null; playToken: number; provenance: string; reduceMotion: boolean; onToggleReducedMotion: () => void; onInspect: () => void; onShowDemo: () => void;
}) {
  return <div className="regime-atlas">
    <header className="atlas-heading"><span>MENTORÍA 8 · MAPA INTEGRADO</span><h3>Regímenes económicos y curva de tipos</h3><p>Crecimiento e inflación cuentan la historia; los bonos ayudan a contrastarla.</p><small>Curvas: rendimiento —interés del bono— ↑ · plazo →</small></header>
    <div className="atlas-y-top">Inflación al alza ↑ <span>los precios aceleran</span></div>
    <div className="atlas-composition">
      <div className="atlas-side atlas-side-left">{[ATLAS_ZONES[0],ATLAS_ZONES[2]].map(g => <aside className={"atlas-note " + g.tone} key={g.zone}><h4>● ¿Qué es?</h4><p>{g.meaning}</p></aside>)}</div>
      <div className="atlas-stage">
        <div className="atlas-cards">{ATLAS_ZONES.map(g => <article className={"atlas-card " + g.tone} key={g.zone}>
          <header><CurveIcon curve={g.curve} /><div><h4>{g.title}</h4><p>{g.relation}</p></div></header>
          <div className="atlas-curve-caption"><strong>{g.curveLabel}</strong><span>{g.curveMeaning}</span></div>
          <section className="atlas-characteristics"><h5>Características</h5><ul>{g.characteristics.map(line => <li key={line}>{line}</li>)}</ul></section>
          <section className="atlas-assets"><h5>{g.assetLabel}</h5><ul>{g.assets.map(asset => <li key={asset}>{asset}</li>)}</ul></section>
          <p className="atlas-mobile-meaning"><strong>Qué significa.</strong> {g.meaning}</p>
        </article>)}</div>
        <div className="atlas-cross" aria-hidden="true"><span/><span/></div>
        <div className="atlas-x-labels"><span>← Crecimiento desacelera</span><span>Crecimiento acelera →</span></div>
        <PhaseClock key={(demo ? "demo" : "cut") + playToken + ":" + point?.x + ":" + point?.y} demo={demo} point={point} orientation={orientation} playOnMount={demo && playToken > 0} provenance={provenance} reduceMotion={reduceMotion} onToggleReducedMotion={onToggleReducedMotion} onInspect={onInspect} onShowDemo={onShowDemo} />
      </div>
      <div className="atlas-side atlas-side-right">{[ATLAS_ZONES[1],ATLAS_ZONES[3]].map(g => <aside className={"atlas-note " + g.tone} key={g.zone}><h4>● ¿Qué es?</h4><p>{g.meaning}</p></aside>)}</div>
    </div>
    <div className="atlas-y-bottom">Inflación a la baja ↓ <span>los precios suben más despacio; no necesariamente caen</span></div>
    <div className="atlas-process"><span><b>01</b> Identifica <small>Crecimiento + inflación.</small></span><span><b>02</b> Analiza <small>CLI: indicador adelantado; nivel y dirección.</small></span><span><b>03</b> Contrasta <small>Fed, bonos, crédito y beneficios.</small></span><span><b>04</b> Confirma <small>Dow, S&amp;P 500 y Nasdaq-100.</small></span></div>
    <p className="atlas-footnote">Curvas y activos: asociaciones orientativas del material, no clasificación automática. * Menor impulso e inflación no prueban crisis. El oro depende también de tipos, dólar y necesidad de efectivo.</p>
  </div>;
}
