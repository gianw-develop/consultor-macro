"use client";
import Link from "next/link";
import { tcbData, TCB_URL } from "./reviewed-observations";
import { ECONOMIC_COLORS, type Signal } from "./economic-reading";
import employment from "./employment-release.json";
import type { MacroSnapshot, MonthlySeries } from "./macro-data";
import { change, direction, isOld, persistence } from "./macro-data";
import { Gauge } from "./gauge";

const release = TCB_URL;
const leiComponents = ["Horas semanales en manufacturas", "Solicitudes iniciales de desempleo (se interpretan al revés: más solicitudes empeoran el índice)", "Pedidos de bienes de consumo y materiales", "Nuevos pedidos ISM: encuesta a fabricantes", "Pedidos de bienes de capital, sin defensa ni aviones", "Permisos para nuevas viviendas", "S&P 500: ya está incluido; no sumar otro voto", "Índice de crédito: condiciones para obtener financiación", "Rendimiento a 10 años menos tipo de fondos federales", "Expectativas de los consumidores sobre la economía"];
const ceiComponents = ["Empleo no agrícola: la misma familia que NFP; no es otro voto", "Ingreso personal real sin transferencias públicas", "Producción industrial", "Ventas de fabricantes y comercios"];
const fmt = (v: number | null, digits = 2) => { if (v === null) return "—"; const rounded = Math.abs(v) < .5 * 10 ** -digits ? 0 : v; return (rounded > 0 ? "+" : "") + rounded.toLocaleString("es-ES", { maximumFractionDigits: digits, minimumFractionDigits: digits }); };
const date = (v: string) => new Date(v.length === 7 ? v + "-01T00:00:00Z" : v).toLocaleDateString("es-ES", { timeZone: "UTC", ...(v.length === 7 ? { month: "short", year: "numeric" } as const : {}) });

export function MacroInstrument({ index, cli, snapshot, now, employmentReading }: { index: number; cli: "G7" | "G20"; snapshot: MacroSnapshot | null; now: string; employmentReading?:Signal }) {
  const series: MonthlySeries | null = index === 0 ? snapshot?.cli?.[cli] ?? null : index === 3 ? snapshot?.nfp ?? null : null;
  const monthly = index === 0 || index === 3;
  const last = series?.points.at(-1);
  const changes = [1, 3, 6].map(n => series ? change(series.points, n, index === 3) : null);
  const tcbSeries=index===1?tcbData.lei:tcbData.cei;
  const tcb={level:tcbSeries.level,one:tcbSeries.rates.at(-1)!,three:(tcbSeries.rates.reduce((a,b)=>a*(1+b/100),1)-1)*100,six:tcbSeries.six};
  const period = monthly ? last?.period : tcbData.period;
  const stale = period ? isOld(period, now, 100) : false;
  // Rounded monthly rates: show a direction only when rounding cannot reverse it.
  const lower = (tcbSeries.rates.reduce((a,b)=>a*(1+(b-.05)/100),1)-1)*100;
  const upper = (tcbSeries.rates.reduce((a,b)=>a*(1+(b+.05)/100),1)-1)*100;
  const d = monthly ? direction(changes[1], index === 3 ? .001 : .01) : lower > 0 ? "up" : upper < 0 ? "down" : "missing";
  const value = stale || !period || d === "missing" ? null : d === "up" ? .75 : d === "down" ? .25 : .5;
  const employmentMixed=index===3&&employmentReading?.tone==="mixed";
  const color = index===3?ECONOMIC_COLORS[employmentReading?.tone??"neutral"]:d === "up" ? "var(--green)" : d === "down" ? "var(--red)" : "var(--amber)";
  const label = !period ? "Sin observaciones" : stale ? "Corte antiguo" : index === 3 ? (employmentMixed?"Empleo · señales mixtas":employmentReading?.stage??"Empleo sin confirmar") : d === "up" ? "Sube en tres meses" : d === "down" ? "Baja en tres meses" : d === "missing" ? "Dirección incierta por redondeo" : "Sin cambio apreciable";
  const acceleration = series && index === 0 ? (() => { const earlier = series.points.slice(0, -3); const prior = change(earlier, 3); return changes[1] === null || prior === null ? null : changes[1] - prior; })() : null;
  const revisions = snapshot?.revisions.filter(r => r.series === series?.id) ?? [];
  return <>
    <Gauge label={label + "; posición por dirección, sin puntuación"} value={value} tone={color} real />
    <strong className="gauge-label" style={{ color }}>{label}</strong>
    <p className="instrument-observation">{period ? <><time dateTime={period}>{date(period)}</time> · {monthly ? index === 0 ? `${last!.value.toFixed(2)} · tendencia = 100` : `${fmt(changes[0], 0)} mil empleos en el mes` : `${tcb.level.toFixed(1)} · base 2016 = 100`}</> : "Fuente no disponible"}</p>
    <div className="gauge-periods">{[1, 3, 6].map((n, i) => <span key={n}>{n}m {monthly ? fmt(changes[i], index === 3 ? 1 : 2) : `${n === 3 ? "≈" : ""}${fmt([tcb.one, tcb.three, tcb.six][i], 1)}%`}</span>)}</div>
    <p className="micro instrument-units">{index === 0 ? "Cambios en puntos de índice" : index === 3 ? "Miles de empleos/mes · medias a 3 y 6m" : "Variaciones acumuladas · 3m aproximados"}</p>
    {(index===1||index===2)&&<p className="micro">Septiembre preliminar · publicado 22/10; julio y agosto revisados. Próxima publicación prevista: 19/11.</p>}
    <details><summary>Datos, método y componentes <span>＋</span></summary>
      {series ? <>
        <p><a href={series.source.url} target="_blank" rel="noreferrer">{series.source.name} ↗</a></p>
        <p>Consultado el {date(series.source.fetchedAt)}. {index===3&&period===employment.period?"Publicado el 2/10/2026 a las 14:30 Madrid; tablas B1 y A1 contrastadas.":"Fecha original de publicación no disponible en esta captura."} Se muestra la versión disponible al consultar, no lo que se conocía históricamente.</p>
        {index === 0 ? <><p>G7: economías desarrolladas. G20: cobertura global. Se solapan y no se suman. Un nivel sobre 100 indica actividad por encima de su tendencia; subir y estar sobre 100 son cosas distintas.</p><p>{persistence(series.points)} cambios mensuales consecutivos en la dirección actual. Cambio del avance trimestral: {fmt(acceleration)} puntos frente al trimestre anterior. No es una predicción.</p><p>Cruce de 100 este mes: {series.points.length < 2 ? "no evaluable" : (last!.value - 100) * (series.points.at(-2)!.value - 100) < 0 ? "sí" : "no"}.</p></> : <><p>Empleo no agrícola ajustado por estacionalidad: elimina patrones habituales del calendario. Medias calculadas con meses consecutivos, a partir de los niveles oficiales. {last?.preliminary ? "El último dato es preliminar y puede revisarse." : "Los niveles pueden revisarse."}</p><p>Media de 3 meses {fmt(changes[1], 1)} mil; media de 6 meses {fmt(changes[2], 1)} mil. CEI ya incluye empleo: estas cifras explican ese componente.</p>{period===employment.period&&<p>{employment.summary} Medias calculadas desde los niveles revisados, no concatenando cambios antiguos. <a href={employment.url} target="_blank" rel="noreferrer">BLS · publicación del 2/10/2026 ↗</a></p>}{period === "2026-08" && <p><a href="https://www.bls.gov/news.release/archives/empsit_09042026.htm" target="_blank" rel="noreferrer">Publicación del 4/9/2026 ↗</a>: junio pasó de +20 a +31 mil; julio, de −23 a +21 mil. Revisión conjunta: +55 mil. Es una revisión de cambios mensuales, distinta de las revisiones de niveles registradas entre consultas.</p>}</>}
        <p>Revisiones de niveles desde la consulta anterior: {revisions.length ? revisions.map(r => `${r.period}: ${r.previous} → ${r.current}`).join("; ") : "ninguna detectada o primera captura; no implica ausencia de revisiones históricas"}.</p>
        <div className="table-scroll"><table><caption>Últimos niveles oficiales · {series.unit}</caption><thead><tr><th>Mes</th><th>Nivel</th><th>Estado</th></tr></thead><tbody>{series.points.slice(-7).map(p => <tr key={p.period}><td>{p.period}</td><td>{p.value.toLocaleString("es-ES", { maximumFractionDigits: 5 })}</td><td>{p.preliminary ? "Preliminar" : "Versión consultada"}</td></tr>)}</tbody></table></div>
      </> : monthly ? <p>No hay una captura válida. La aguja queda sin lectura.</p> : <>
        <p><a href={release} target="_blank" rel="noreferrer">Conference Board · publicación 22/10/2026 ↗</a>. Corte mensual de septiembre, leído de la publicación; no es un flujo automático. El nivel 100 es la base de 2016, no una frontera de expansión.</p>
        <p>Variación a 3 meses: producto de las tres tasas mensuales publicadas, menos uno. Son tasas redondeadas: el resultado es aproximado; la aguja solo indica dirección si el redondeo no puede invertirla. La cifra de 6 meses procede directamente del informe.</p>
        <ul>{(index === 1 ? leiComponents : ceiComponents).map(c => <li key={c}>{c}</li>)}</ul>
        {index===1&&<p>Discrepancia con la diapositiva de la mentoría 3: el LEI oficial usa diez años menos fondos federales; el material del curso menciona diez años menos tres meses. Aquí se muestra la definición oficial y Formación conserva la del curso.</p>}<p>Algunos componentes se estiman al publicar y se revisan después. Los valores de cada componente y el historial completo no están conectados. No se calcula una puntuación común.</p>
      </>}
      <p>Aguja: dirección a 3 meses, con posiciones fijas. No mide fuerza, probabilidad ni conveniencia de invertir. {stale ? "Este corte necesita actualización." : ""}</p>
    </details>
    <Link className="source-link" href={"/annienexus/formacion?leccion="+(index===3?"source-4":"source-3")}>Enseñanza · mentoría {index===3?4:3} →</Link>
  </>;
}
