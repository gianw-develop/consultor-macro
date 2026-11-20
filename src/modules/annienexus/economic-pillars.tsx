"use client";
import Link from "next/link";
import { SectionHeading, Tag } from "../../shared/ui/primitives";
import { PillarChart } from "./pillar-chart";
import { cpiMonthlyRates, monthlyRate, nominalRetail, realRetail, weeklyClaims, recentRetailRates, pillarMonthLabel } from "./economic-pillars-data";
import { M1_AVAILABLE_FROM, M1_CHECKED_AT, m1Growth, m1RealPoints, m1SixMonthGrowth, realM1 } from "./m1-data";
import { madridEventTime } from "./economic-calendar";
const number=(value:number,digits=0)=>value.toLocaleString("es-ES",{minimumFractionDigits:digits,maximumFractionDigits:digits});
const pct=(value:number|null,digits=2)=>value===null?"Sin dato":`${value>0?"+":""}${number(value,digits)} %`;
const retail=realRetail.filter(p=>p.period>="2026-03"),last=retail.at(-1)!,previous=retail.at(-2)!;
const realPoints=realRetail.map(p=>({period:p.period,value:p.real}));

export function InflationPillar(){return <article className="panel pillar-panel">
 <SectionHeading title="IPC · inflación"><Tag tone="blue">Septiembre 2026</Tag></SectionHeading>
 <p className="small muted">IPC: precios que pagan los consumidores. General, con alimentos y energía.</p>
 <div className="pillar-metrics"><div><span>Frente a agosto</span><strong>+0,6 %</strong><small>Agosto: +0,4 % mensual</small></div><div><span>Frente a septiembre de 2025</span><strong>+3,7 %</strong><small>Agosto: +3,4 % interanual</small></div></div>
 <p className="micro">Cambio mensual · % · ajustado por estacionalidad</p>
 <PillarChart title="IPC general, variación mensual de marzo a septiembre de 2026: 0,9; 0,6; 0,5; menos 0,4; 0,1; 0,4; 0,6 por ciento" labels={["mar","abr","may","jun","jul","ago","sep"]} series={[{name:"IPC mensual",values:cpiMonthlyRates.map(p=>p.value!),color:"#ffca54"}]} bars/>
 <p className="small">Los precios aceleran en el mes y en el año. Más presión de costes puede complicar que bajen los tipos de interés.</p>
 <details className="economic-detail"><summary>ⓘ Cómo leer · inflación <span>＋</span></summary>
 <p className="small">La gasolina subió un 9,1 % mensual. El IPC subyacente —sin alimentos ni energía— fue +0,3 % mensual, igual que en agosto, y +2,6 % anual frente a +2,4 %.</p>
 <p className="micro">La variación mensual está ajustada por patrones estacionales; la anual oficial no. Se muestran por separado y no se mezclan al calcular ventas reales. Septiembre publicado el 14/10; verificado el 15/10/2026.</p>
 <div className="pillar-table-wrap"><table><caption>IPC general · cambio mensual publicado</caption><thead><tr><th scope="col">Mes de 2026</th><th scope="col">Cambio</th></tr></thead><tbody>{cpiMonthlyRates.map(p=><tr key={p.period}><th scope="row">{p.period}</th><td>{pct(p.value,1)}</td></tr>)}</tbody></table></div>
 </details>
 <p className="source-line">Observado: septiembre · publicado: 14/10/2026 · verificado: 15/10 · <a href="https://www.bls.gov/news.release/archives/cpi_10142026.htm" target="_blank" rel="noreferrer">BLS ↗</a></p>
 <Link className="source-link" href="/annienexus/formacion?leccion=source-1">Marco de clase · mentoría 9 en curso →</Link>
 </article>}

export function RetailPillar(){return <article className="panel pillar-panel">
 <SectionHeading title="2 · Ventas minoristas reales"><Tag tone="blue">Septiembre 2026</Tag></SectionHeading>
 <p className="small muted">Compras en comercios y restauración descontando inflación. Ayudan a seguir el consumo, aunque no lo cubren todo. Nominal: dinero gastado; real: poder de compra.</p>
 <div className="pillar-metrics"><div><span>Nominal · cambio mensual</span><strong>{pct(monthlyRate(nominalRetail))}</strong><small>Agosto revisado: {pct(monthlyRate(nominalRetail.slice(0,-1)))}</small></div><div><span>Real · cálculo mensual</span><strong>{pct(monthlyRate(realPoints))}</strong><small>Agosto revisado: {pct(monthlyRate(realPoints.slice(0,-1)))}</small></div></div>
 <p className="micro">Datos mensuales · cambio frente al mes anterior (%)<br/>Últimos tres meses publicados; septiembre y revisiones de julio/agosto incorporados. Consulta del 21/10 Madrid.</p>
 <PillarChart title="Ventas nominales y reales: variaciones mensuales de julio, agosto y septiembre de 2026" labels={recentRetailRates.map(p=>pillarMonthLabel(p.period))} series={[{name:"Nominal",values:recentRetailRates.map(p=>p.nominal),color:"#56baff"},{name:"Real · cálculo propio",values:recentRetailRates.map(p=>p.real),color:"#ffca54",dashed:true}]} zero/>
 <div className="pillar-table-wrap"><table><caption>Cambio mensual · %</caption><thead><tr><th scope="col">Mes</th><th scope="col">Nominal</th><th scope="col">Real</th></tr></thead><tbody>{recentRetailRates.map(p=><tr key={p.period}><th scope="row">{pillarMonthLabel(p.period)}</th><td>{pct(p.nominal)}</td><td>{pct(p.real)}</td></tr>)}</tbody></table></div>
 <p className="small">Septiembre aumenta un 0,77 % en dinero gastado y aproximadamente un 0,12 % descontando el IPC. El crecimiento real se modera frente al 0,89 % de agosto revisado.</p>
 <details className="economic-detail"><summary>ⓘ Cómo leer · ventas <span>＋</span></summary>
 <p className="small">Ventas nominales: {number(last.nominal!)} millones de dólares; agosto revisado: {number(previous.nominal!)}. Publicación del 15/10; julio y agosto revisados en esta versión.</p>
 <p className="small">Nivel real = ventas nominales ÷ índice IPC × 100. Con IPC base 1982–84 = 100, el resultado son millones de dólares de esa base: {number(last.real!,1)} en septiembre frente a {number(previous.real!,1)} en agosto.</p>
 <p className="small">Cambio real exacto = (1 + cambio nominal) ÷ (1 + inflación del mismo mes) − 1. Se usan tasas en decimal y niveles sin redondear; no se resta el IPC al dinero gastado.</p>
 <p className="micro">Cálculo propio con RSAFS (Census vía FRED) y CPIAUCSL (BLS vía FRED). Ambas mensuales y ajustadas por estacionalidad. El IPC general es una aproximación al deflactor del comercio: no mide el volumen exacto de cada producto ni todo el consumo. No se mezcla la antigua serie real RRSFS, que seguía fechada el 16/09.</p>
 <div className="pillar-table-wrap"><table><caption>Niveles usados · millones de dólares; IPC base 1982–84</caption><thead><tr><th scope="col">Mes</th><th scope="col">Nominal</th><th scope="col">IPC</th><th scope="col">Real calculado</th></tr></thead><tbody>{retail.map(p=><tr key={p.period}><th scope="row">{p.period}</th><td>{number(p.nominal!)}</td><td>{number(p.cpi!,3)}</td><td>{number(p.real!,1)}</td></tr>)}</tbody></table></div>
 </details>
 <p className="source-line">Observado: septiembre · publicado/revisado: 15/10/2026 · consultado: 21/10 Madrid<br/><a href="https://fred.stlouisfed.org/series/RSAFS" target="_blank" rel="noreferrer">Census / FRED · ventas ↗</a> · <a href="https://fred.stlouisfed.org/series/CPIAUCSL" target="_blank" rel="noreferrer">BLS / FRED · IPC ↗</a></p>
 <Link className="source-link" href="/annienexus/formacion?leccion=source-12">Indicador enseñado · mentoría 2 →</Link>
 </article>}

export function ClaimsPillar(){return <article className="panel pillar-panel">
 <SectionHeading title="1 · Solicitudes iniciales"><Tag tone="blue">24 oct 2026</Tag></SectionHeading>
 <p className="small muted">Primeras peticiones semanales de subsidio por desempleo. Una tendencia menor suele indicar menos despidos; la media de cuatro semanas suaviza los saltos.</p>
 <div className="pillar-metrics"><div><span>Última semana</span><strong>194.000</strong><small>Anterior revisado: 195.000 · −1.000</small></div><div><span>Media de cuatro semanas</span><strong>196.750</strong><small>Anterior revisado: 198.000 · −1.250</small></div></div>
 <p className="micro">Septiembre–octubre · miles de solicitudes · último informe del 29/10</p>
 <PillarChart title="Solicitudes iniciales y media de cuatro semanas del 26 de septiembre al 24 de octubre de 2026" labels={["26 sep","3 oct","10 oct","17 oct","24 oct"]} digits={0} pointLabels labelMultiplier={1000} series={[{name:"Solicitudes iniciales",values:weeklyClaims.map(p=>p.initial/1000),color:"#56baff"},{name:"Media 4 semanas",values:weeklyClaims.map(p=>p.average/1000),color:"#ffca54",dashed:true}]}/>
 <p className="small">Las solicitudes bajan de 195.000 a 194.000. La media cae de 198.000 a 196.750. Menos primeras peticiones es una señal laboral favorable, pero una semana no confirma una tendencia.</p>
 <details className="economic-detail"><summary>ⓘ Cómo leer · solicitudes <span>＋</span></summary>
 <div className="pillar-table-wrap"><table><caption>Datos ajustados por estacionalidad · DOL, último informe 29/10</caption><thead><tr><th scope="col">Semana terminada</th><th scope="col">Iniciales</th><th scope="col">Media 4 semanas</th></tr></thead><tbody>{weeklyClaims.map(p=><tr key={p.period}><th scope="row">{p.period}</th><td>{number(p.initial)}</td><td>{number(p.average)}</td></tr>)}</tbody></table></div>
 <p className="small">La semana del 17/10 se revisó de 194.000 a 195.000 y su media de 197.750 a 198.000. Última semana: 24/10, publicada el 29/10; se conservan las semanas anteriores con sus revisiones conocidas. Siguiente publicación prevista: 5/11, 14:30 Madrid.</p>
 <p className="micro">No son la tasa de desempleo ni los empleos creados. La media incluye la semana indicada y las tres anteriores. Las solicitudes forman parte del LEI —índice que reúne señales de actividad futura— y no se cuentan de nuevo como una confirmación independiente.</p>
 </details>
 <p className="source-line">Observado: hasta el 24/10 · publicado: 29/10/2026 · verificado: 4/11 Madrid · <a href="https://www.dol.gov/ui/data.pdf" target="_blank" rel="noreferrer">DOL · informe semanal ↗</a></p>
 <Link className="source-link" href="/annienexus/formacion?leccion=source-12">Indicador enseñado · mentoría 2 →</Link>
 </article>}

export function MoneyPillar(){
 const current=m1Growth.at(-1)!,previous=m1Growth.at(-2)!;
 const observed=realM1.at(-1)!;
 return <article className="panel pillar-panel">
 <SectionHeading title="3 · Crecimiento de M1 real"><Tag tone="blue">Septiembre 2026</Tag></SectionHeading>
 <p className="small muted">M1: efectivo y depósitos fácilmente utilizables. Su crecimiento real mide el cambio de poder de compra, descontando inflación.</p>
 <div className="pillar-metrics"><div><span>Cambio en seis meses</span><strong>{pct(current.value)}</strong><small>Marzo → septiembre 2026</small></div><div><span>Comparación anterior</span><strong>{pct(previous.value)}</strong><small>Febrero → agosto 2026</small></div></div>
 <p className="micro">Crecimiento en seis meses · % · sin anualizar<br/>Cada punto compara su mes con seis meses antes.</p>
 <PillarChart title="Crecimiento semestral de M1 real de marzo a septiembre de 2026. Abril sin dato, no cero" labels={["mar 26","abr 26","may 26","jun 26","jul 26","ago 26","sep 26"]} series={[{name:"M1 real · seis meses",values:m1Growth.map(p=>p.value),color:"#56baff"}]} zero/>
 <p className="micro">Abril: sin dato porque falta el IPC de octubre de 2025. El hueco no es cero.</p>
 <p className="small">M1 gana poder de compra, a mayor ritmo semestral que en agosto revisado. No implica más gasto ni compras de acciones.</p>
 <details className="economic-detail"><summary>ⓘ Cómo leer · M1 real <span>＋</span></summary>
 <p className="micro">M1 cambió de definición en mayo de 2020 al incluir depósitos de ahorro. Ese salto estadístico no se interpreta como dinero nuevo entrando al mercado.</p>
 <p className="small">Cálculo propio: M1 real = M1SL ÷ CPIAUCSL × 100. Ambas series son mensuales y ajustadas por patrones estacionales. Crecimiento semestral = (nivel real actual ÷ nivel real de seis meses antes − 1) × 100; no es crecimiento anual ni una previsión.</p>
 <p className="small">Septiembre: M1 nominal {number(observed.nominal!,1)} miles de millones de dólares; IPC {number(observed.cpi!,3)} (1982–84 = 100); nivel real {number(observed.real!,2)} miles de millones de dólares con poder de compra de esa base.</p>
 <div className="pillar-table-wrap"><table><caption>M1 real · comparación semestral del mismo corte</caption><thead><tr><th scope="col">Mes</th><th scope="col">Nivel real</th><th scope="col">Seis meses</th></tr></thead><tbody>{realM1.filter(p=>p.period>="2026-03").map(p=><tr key={p.period}><th scope="row">{pillarMonthLabel(p.period)}</th><td>{p.real===null?"Sin dato":number(p.real,2)}</td><td>{pct(m1SixMonthGrowth(m1RealPoints,p.period))}</td></tr>)}</tbody></table></div>
 <p className="micro">Corte H.6 del 27/10, comprobado el 29/10, con revisiones de agosto de 2025 a agosto de 2026; no reconstruye lo que se sabía en cada fecha histórica. No se comparan extremos que atraviesen la ruptura de mayo de 2020. La ventana de seis meses describe una tendencia; no valida una capacidad predictiva universal.</p>
 <p className="micro">M1 publicado el 27/10/2026; IPC el 14/10/2026. Ambos insumos disponibles desde {M1_AVAILABLE_FROM}. Consulta: {madridEventTime(M1_CHECKED_AT)} (Madrid). <a href="https://www.federalreserve.gov/releases/h6/h6_technical_qa.htm" target="_blank" rel="noreferrer">Fed · cambio de definición ↗</a> · <a href="https://www.bls.gov/cpi/additional-resources/2025-federal-government-shutdown-impact-cpi-faq.htm" target="_blank" rel="noreferrer">BLS · IPC ausente ↗</a></p>
 </details>
 <p className="source-line">Observado: septiembre · M1 publicado: 27/10/2026<br/>Comprobado el 29/10 Madrid. Agosto revisado: +1,15 % en seis meses (antes +1,16 %).<br/><a href="https://www.federalreserve.gov/releases/h6/20261027/" target="_blank" rel="noreferrer">Fed · H.6 ↗</a> · <a href="https://fred.stlouisfed.org/series/M1SL" target="_blank" rel="noreferrer">FRED · M1SL ↗</a> · <a href="https://fred.stlouisfed.org/series/CPIAUCSL" target="_blank" rel="noreferrer">BLS / FRED · IPC ↗</a></p>
 <Link className="source-link" href="/annienexus/formacion?leccion=source-12">Indicador enseñado · mentoría 2 →</Link>
 </article>;
}
