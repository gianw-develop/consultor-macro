import Link from "next/link";
import type { ClockReading } from "./regime-clock";
import { madridEventTime, madridEventDateTime } from "./economic-calendar";
export function QuadrantEvidence({orientation}:{orientation:ClockReading}){
 const r=orientation.review;
 return <div className="quadrant-point-detail quadrant-dialog-body">
  <p className="quadrant-snapshot-note"><strong>{orientation.label}.</strong> {orientation.explanation}</p>
  {r && <>
    <h4>{r.title}</h4>
    <p><strong>Lectura del {madridEventDateTime(r.cut)} (Madrid).</strong> Horizonte: semanas y meses, no la sesión de hoy.</p>
    <p>La manecilla señala el sector superior derecho de forma provisional. Resume el impulso adelantado estadounidense y el último repunte mensual de precios. <strong>No confirma que toda la economía esté en boom inflacionario.</strong></p>
    <div className="quadrant-evidence-columns"><section><h4>Crecimiento · lado derecho</h4><p>{r.growth}</p></section><section><h4>Inflación · lado superior</h4><p>{r.inflation}</p></section></div>
    <h4>Por qué sigue siendo provisional</h4><ul>{r.contradictions.map(t=><li key={t}>{t}</li>)}</ul>
    <details className="economic-detail"><summary>Datos, periodos y fuentes</summary>{r.evidence.map(e=><section className="clock-source" key={e.name}><h4>{e.name}</h4><p className="micro">Observado: {e.period}</p><p><strong>{e.comparison}</strong></p><p>{e.reading}</p><p className="micro">Publicación: {e.publishedAt?madridEventTime(e.publishedAt):"fecha original no disponible"} · consulta: {madridEventTime(e.checkedAt)} (Madrid), 2026.</p><a href={e.url} target="_blank" rel="noreferrer">Fuente oficial ↗</a></section>)}</details>
    <h4>Qué haría cambiar la orientación</h4><ul>{r.changes.map(t=><li key={t}>{t}</li>)}</ul>
    <p className="micro">Revisión realizada: {madridEventTime(r.reviewedAt)} · siguiente revisión requerida: {madridEventDateTime(r.reviewBy)} (Madrid). Después se conserva la última orientación con su fecha, pendiente de revisión.</p>
    <details className="economic-detail"><summary>Criterio de lectura y representación</summary><p>{r.rationale}</p><p>La inclinación de 45° representa el nombre del sector. No mide cercanía a una frontera, intensidad, probabilidad ni velocidad. La manecilla no gira por el paso del tiempo. El halo central atraviesa los dos ejes para mostrar que las contradicciones siguen abiertas.</p><p>La antigua combinación automática de ventanas de tres meses no se utiliza. Esta revisión tampoco prorroga el diagnóstico general del Cerebro.</p></details>
  </>}
  <h4>Marco recibido</h4><p>La mentoría 8 separa la dirección del crecimiento y de la inflación; el CLI —indicador adelantado del ciclo— orienta la lectura de crecimiento y la curva de tipos aporta contraste. La ubicación mencionada en la grabación pertenece a ese momento histórico.</p>
  <Link className="source-link" href="/annienexus/formacion?leccion=source-0">Abrir el marco de los cuatro regímenes →</Link>
 </div>;
}
