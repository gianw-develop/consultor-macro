"use client";
import { useState } from "react";
import { CALCULATOR_INSTRUMENTS, emptyTargets } from "./calculator-data";
import { approximatePrice, FTMO_SOURCE, REFERENCE_DATE, referenceFactor, SIMPLE_REFERENCES } from "./calculator-reference-data";
import "./level-calculator.css";

const format = (value:number, digits=2) => value.toLocaleString("es-ES", {minimumFractionDigits:digits, maximumFractionDigits:digits});
const date = (value:string) => new Date(value).toLocaleString("es-ES", {timeZone:"Europe/Madrid",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"});
export function LevelCalculator() {
  const [targets,setTargets] = useState(emptyTargets);
  return <main id="main-content" className="main-content calculator-page">
    <div className="page-heading"><div><span className="eyebrow">CONVERSOR DE NIVELES</span><h1>Tu precio → tu CFD</h1><p className="lead">Escribe tu nivel y obtén una equivalencia aproximada en FTMO.</p></div></div>
    <div className="calc-toolbar"><span>Referencias del <time dateTime={REFERENCE_DATE}>29/10/2026</time> · cálculo aproximado</span><span className="small muted">Sin cotizaciones en vivo</span></div>
    <section className="panel calculator-conversions" aria-label="Conversiones de niveles">
      {CALCULATOR_INSTRUMENTS.map(item => {
        const result = approximatePrice(item.symbol, targets[item.symbol]);
        return <div className="calculator-row" key={item.symbol}>
          <div className="calculator-symbol">{item.symbol}<small>{item.kind}</small></div>
          <div className="calculator-target"><label className="sr-only" htmlFor={`target-${item.symbol}`}>Precio objetivo {item.symbol}</label><input id={`target-${item.symbol}`} type="text" inputMode="decimal" autoComplete="off" maxLength={30} placeholder="Tu precio" value={targets[item.symbol]} aria-invalid={!!result.error} aria-describedby={`note-${item.symbol}`} onChange={e=>setTargets(current=>({...current,[item.symbol]:e.target.value}))}/></div>
          <span className="calculator-arrow" aria-hidden="true">→</span>
          <div className="calculator-answer"><output htmlFor={`target-${item.symbol}`} aria-live="polite" aria-label={`Equivalente ${item.destination} desde ${item.symbol}`}>{result.value===null?"—":`≈ ${format(result.value)}`}</output><span>{item.destination} <small>· {item.unit}</small></span><p id={`note-${item.symbol}`} className="calculator-note">{result.error || (item.symbol==="SPX" ? "Aproximación 1:1 · sin ajustar la diferencia de FTMO" : `Factor de referencia × ${format(referenceFactor(item.symbol),5)}`)}</p></div>
        </div>;
      })}
    </section>
    <div className="calculator-bottom"><p>Calcula al escribir y funciona con MT5 cerrado. Las referencias son fijas: no se actualizan solas y la equivalencia puede variar con el mercado.</p><button className="button" onClick={()=>setTargets(emptyTargets())}>Limpiar</button></div>
    <details className="calculator-details"><summary>Referencias y cómo se calcula <span aria-hidden="true">＋</span></summary>
      <p>DIA, GLD y QQQ: tu nivel × precio medio de FTMO ÷ precio del ETF de referencia. El precio medio es el promedio de compra y venta publicados. Son observaciones próximas, pero no sincronizadas; el precio del ETF corresponde a la sesión previa a la apertura.</p>
      <p>SPX: un punto se traslada como un punto de US500.cash. No se aplica una diferencia inventada: el último dato del índice es del día anterior y el CFD ya estaba cotizando. Es una aproximación nominal, no un ajuste medido entre ambos precios.</p>
      <div className="calc-table"><table><thead><tr><th>Conversión</th><th>Referencia de origen</th><th>Referencia FTMO</th></tr></thead><tbody>{CALCULATOR_INSTRUMENTS.map(item=>{
        const ref=SIMPLE_REFERENCES[item.symbol];
        return <tr key={item.symbol}><td>{item.symbol} → {item.destination}</td><td><a href={ref.source} target="_blank" rel="noreferrer">{format(ref.origin)}</a><small>{date(ref.originAt)} · Madrid{item.symbol==="SPX"?" · último dato, no usado como factor":" · preapertura"}</small></td><td><a href={FTMO_SOURCE} target="_blank" rel="noreferrer">{format((ref.bid+ref.ask)/2,3)}</a><small>Venta / compra: {format(ref.bid)} / {format(ref.ask)}<br/>Observado: {date(ref.observedAt)} · Madrid</small></td></tr>;
      })}</tbody></table></div>
      <p className="small">Fuente de destino: ticker público de FTMO; no es una conexión a tu cuenta. FTMO no muestra la hora exacta de cada tick en esa tabla. Los resultados son niveles de precio en puntos o USD/onza, no valor monetario de pips ni cálculo de lotes. Los dos decimales sirven para mostrar el resultado, no certifican el paso mínimo de tu cuenta.</p>
    </details>
  </main>;
}
