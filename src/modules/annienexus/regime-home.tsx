"use client";
import { useState } from "react";
import { PHASE_LABEL, BORDER_ZONE, crossTo, type Phase, type RegimeReading } from "./regime-engine";
import type { SignalRow } from "./regime-signals";
import { MARKET_STATE_LABEL, type MarketReading } from "./market-stress";
import type { MacroSnapshot } from "./macro-data";
import { ResultsMonitor } from "./results-monitor";
import { DataAvailability } from "./data-availability";
import { EconomicContext } from "./economic-context";
import { YieldCurve } from "./curve";
import "./regime.css";

const TONE: Record<Phase, string> = {
  inflationary_expansion: "expansion", disinflationary_expansion: "disinflation",
  stagflation: "stagflation", deflationary_crisis: "contraction",
};
const STAGE: Record<RegimeReading["stage"], string> = {
  transition: "EN TRANSICIÓN", early: "RECIÉN INICIADA", mature: "MADURA", consolidated: "CONSOLIDADA",
};
const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const month = (period: string) => MONTHS[Number(period.slice(5, 7)) - 1] ?? period;
const num = (v: number) => v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signed = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${num(Math.abs(v))}`;
const SCALE = 35; // ±1 = 35 % desde el centro: deja libres las esquinas para los nombres
const pos = (v: number) => 50 + v * SCALE;
const MARK = { driver: "◆", true: "✓", false: "✕", null: "○" } as const;

function Distance({ label, value, velocity, nearest }: { label: string; value: number; velocity: number; nearest: boolean }) {
  const d = Math.abs(value), close = d < BORDER_ZONE;
  const state = close ? "cerca de cruzar" : nearest ? "frontera más cercana" : "lejos de cruzar";
  const toward = Math.sign(velocity) === -Math.sign(value) && velocity !== 0;
  return <div className={`rg-distance${close ? " close" : nearest ? " nearest" : ""}`}>
    <div className="rg-distance-head"><span>{label}</span><span className="rg-num">{num(d)} · {state}</span></div>
    <div className="rg-bar" role="img" aria-label={`${label}: ${num(d)} sobre 1, ${state}`}><span style={{ width: `${Math.min(100, d * 100)}%` }} /><i style={{ left: `${BORDER_ZONE * 100}%` }} /></div>
    <p>Último mes: {velocity > 0 ? "▲" : velocity < 0 ? "▼" : "="} {signed(velocity)}. {velocity === 0 ? "Sin cambio." : toward ? "Se acerca a la frontera." : "Se aleja de la frontera."}</p>
  </div>;
}

export function RegimeHome({ reading, signals, snapshot, now, fetchedAt, liveCount, totalCount, market, marketSource, coherence }: { reading: RegimeReading; signals: SignalRow[]; snapshot: MacroSnapshot | null; now: string; fetchedAt: string; liveCount: number; totalCount: number; market: MarketReading | null; marketSource: string; coherence: { agrees: boolean; text: string } | null }) {
  const [open, setOpen] = useState(false);
  const pctf = (v: number | null) => v === null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
  const { point, stage, monthsInPhase, nearestBorder, velocity, confidence } = reading;
  const trail = reading.trail.slice(-6); // medio año: suficiente para ver el giro sin enredar el mapa
  const prev = trail.at(-2);
  const crossed = prev && prev.phase !== point.phase;
  const groups = [
    { id: "growth", title: "Crecimiento", tone: "expansion" },
    { id: "inflation", title: "Inflación", tone: "stagflation" },
    { id: "market", title: "Mercado", tone: "disinflation" },
  ] as const;
  const marketSignals = signals.filter(s => s.axis === "market" && s.agrees !== null);
  const marketText = marketSignals.length === 0 ? "Sin datos de mercado conectados." : marketSignals.every(s => s.agrees) ? "El mercado confirma la lectura." : marketSignals.some(s => s.agrees) ? "El mercado confirma solo en parte." : "El mercado todavía no confirma la lectura.";
  return <main id="main-content" className="main-content rg">
    <div className="rg-status" role="status">
      <span>Datos hasta <b>{month(point.period)}</b> · consultados el {new Date(fetchedAt).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" })} (Madrid)</span>
      <span className={liveCount === totalCount ? "" : "warn"}>{liveCount} de {totalCount} señales con datos oficiales en vivo · se renuevan cada hora (mercado: 15 min)</span>
    </div>

    {market ? <section className={`rg-market-now ${market.state}`} aria-labelledby="rg-mkt-title">
      <div className="rg-mkt-head">
        <h2 id="rg-mkt-title" className="rg-eyebrow">Mercado ahora · cierre {market.asOf ? new Date(market.asOf + "T12:00:00Z").toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" }) : "—"}</h2>
        <span className={`rg-mkt-state ${market.state}`}>{MARKET_STATE_LABEL[market.state].toUpperCase()}</span>
      </div>
      <div className="rg-mkt-tiles">
        {market.indexes.map(ix => <div key={ix.id} className="rg-mkt-tile"><span>{ix.label}</span><b className="rg-num">{ix.last.toLocaleString("es-ES", { maximumFractionDigits: 0 })}</b><small className={`rg-num ${(ix.week ?? 0) < 0 ? "dn" : "up"}`}>Semana {pctf(ix.week)}</small><small className="rg-num">Desde máximo {pctf(ix.fromHigh)}</small></div>)}
        {market.vix && <div className="rg-mkt-tile"><span>VIX · miedo</span><b className={`rg-num ${market.vix.last >= 30 ? "dn" : market.vix.last >= 22 ? "warn" : ""}`}>{market.vix.last.toLocaleString("es-ES", { maximumFractionDigits: 1 })}</b><small className="rg-num">Semana {pctf(market.vix.week)}</small><small>{market.vix.last >= 30 ? "Pánico" : market.vix.last >= 22 ? "Tensión" : "Calma"}</small></div>}
      </div>
      {coherence && <p className={`rg-coherence ${coherence.agrees ? "ok" : "no"}`}><b>{coherence.agrees ? "Coherente." : "El mercado no confirma."}</b> {coherence.text}</p>}
      <p className="rg-mkt-src">Fuente: {marketSource}. El mapa usa datos mensuales (más lentos); este bloque, cierres diarios.</p>
    </section> : <p className="rg-mkt-src">Mercado ahora: sin datos de índices en este momento.</p>}

    <div className="rg-hero">
      <section className="rg-map-wrap" aria-labelledby="rg-map-title">
        <h2 id="rg-map-title" className="rg-eyebrow">Dónde está la economía · EE. UU.</h2>
        <p className="rg-axis top">Inflación acelera ↑</p>
        <div className="rg-map-row">
          <p className="rg-axis left">← Crecimiento se frena</p>
          <div className="rg-map" role="img" aria-label={`Mapa de régimen. ${month(point.period)}: ${PHASE_LABEL[point.phase]}, a ${num(Math.abs(point.x))} del eje de crecimiento y ${num(Math.abs(point.y))} del de inflación.${crossed ? ` El mes anterior estaba en ${PHASE_LABEL[prev.phase].toLowerCase()}.` : ""}`}>
            <span className="q stagflation" /><span className="q expansion" /><span className="q contraction" /><span className="q disinflation" />
            <span className="band v" style={{ left: `${pos(-BORDER_ZONE)}%`, width: `${BORDER_ZONE * SCALE * 2}%` }} />
            <span className="band h" style={{ top: `${pos(-BORDER_ZONE)}%`, height: `${BORDER_ZONE * SCALE * 2}%` }} />
            <span className="axis v" /><span className="axis h" />
            <b className="ql tl stagflation">Estanflación</b><b className="ql tr expansion">Expansión inflacionaria</b>
            <b className="ql bl contraction">Crisis deflacionaria</b><b className="ql br disinflation">Expansión desinflacionaria</b>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={trail.map(p => `${pos(p.x)},${pos(-p.y)}`).join(" ")} /></svg>
            {trail.map((p, i) => {
              const last = i === trail.length - 1;
              return <span key={p.period} className={`pt${last ? " now" : ""}`} style={{ left: `${pos(p.x)}%`, top: `${pos(-p.y)}%` }}>
                <span className="dot" />{last && <span className="halo" />}
                <span className={`lbl${i % 2 ? " alt" : ""}`}>{month(p.period)}{last ? " · HOY" : ""}</span>
              </span>;
            })}
          </div>
          <p className="rg-axis right">Crecimiento acelera →</p>
        </div>
        <p className="rg-axis bottom">Inflación se modera ↓</p>
        <p className="rg-caption">Horizontal: impulso del CLI G7 (cambio en 3 meses). Vertical: IPC de 3 meses anualizado frente al anual. Franja rayada: a menos de {num(BORDER_ZONE)} de cruzar.</p>
      </section>

      <section className="rg-diagnosis" aria-labelledby="rg-phase">
        <h2 className="rg-eyebrow">Diagnóstico</h2>
        <h1 id="rg-phase" className={TONE[point.phase]}>{PHASE_LABEL[point.phase]}</h1>
        <div className="rg-chips">
          <span className={`chip ${TONE[point.phase]}`}>{STAGE[stage]} · {monthsInPhase} {monthsInPhase === 1 ? "MES" : "MESES"}</span>
          <span className="chip">{confidence.agree} DE {confidence.total} SEÑALES CONFIRMAN</span>
          {coherence && !coherence.agrees && <span className="chip alert">EL MERCADO NO CONFIRMA</span>}
        </div>
        <p className="rg-lead">{reading.detail}</p>
        <div className="rg-block">
          <h3 className="rg-eyebrow">Qué tan cerca está de cambiar</h3>
          <Distance label="Crecimiento" value={point.x} velocity={velocity.x} nearest={nearestBorder.axis === "growth"} />
          <Distance label="Inflación" value={point.y} velocity={velocity.y} nearest={nearestBorder.axis === "inflation"} />
        </div>
        <div className="rg-scenarios">
          {(["inflation", "growth"] as const).map(axis => {
            const next = crossTo(point.phase, axis);
            return <div key={axis} className={TONE[next]}>
              <p className="rg-eyebrow">Si {axis === "inflation" ? "la inflación" : "el crecimiento"} cambia de sentido</p>
              <p>→ {PHASE_LABEL[next]}</p>
            </div>;
          })}
        </div>
      </section>
    </div>

    <section className="rg-signals" aria-labelledby="rg-signals-title">
      <div className="rg-signals-head"><h2 id="rg-signals-title" className="rg-eyebrow">Las señales · qué mueve el punto y qué lo confirma</h2><span>◆ mueve el punto · ✓ confirma · ✕ contradice · ○ sin datos</span></div>
      <div className="rg-cols">
        {groups.map(gr => <div key={gr.id}>
          <h3 className={gr.tone}>{gr.title}</h3>
          <ul>{signals.filter(s => s.axis === gr.id).map(s => {
            const mark = s.role === "driver" ? MARK.driver : MARK[String(s.agrees) as "true" | "false" | "null"];
            const state = s.role === "driver" ? "driver" : s.agrees === null ? "none" : s.agrees ? "yes" : "no";
            return <li key={s.id} data-state={state}>
              <span className="mk" aria-label={state === "driver" ? "Mueve el punto" : state === "yes" ? "Confirma" : state === "no" ? "Contradice" : "Sin datos"}>{mark}</span>
              <span><b>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a> : s.label}</b>{!s.live && s.value !== "sin datos" && <em className="rg-tag">revisado</em>}<small>{s.reading} · {s.note}</small></span>
              <span className="rg-num">{s.value}</span>
            </li>;
          })}</ul>
          {gr.id === "market" && <p className="rg-market">{marketText}</p>}
        </div>)}
      </div>
    </section>

    <details className="rg-all" open={open} onToggle={e => setOpen(e.currentTarget.open)}>
      <summary>Todos los datos, agenda y fuentes <span>＋</span></summary>
      {open && <div className="rg-all-body"><ResultsMonitor snapshot={snapshot} now={now} /><DataAvailability now={now} /><EconomicContext now={now} /><YieldCurve data={snapshot?.treasury ?? null} now={now} /></div>}
    </details>
    <p className="rg-foot">Método v1: el punto solo lo mueven el CLI G7 (OCDE) y el IPC (FRED). Las demás señales confirman o contradicen. «Revisado» = dato sin fuente gratuita en vivo, verificado a mano. Describe el presente, no predice fechas.</p>
  </main>;
}
