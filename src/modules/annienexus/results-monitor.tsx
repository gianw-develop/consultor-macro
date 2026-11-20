"use client";
import {useState} from 'react';
import type {MacroSnapshot} from './macro-data';
import {change} from './macro-data';
import {weeklyClaims,pillarMonthLabel,CLAIMS_RELEASED_AT,CLAIMS_URL} from './economic-pillars-data';
import {FED_DECISIONS} from './sectors-data';
import {ECONOMIC_EVENTS,NEXT_WEEK_EVENTS,madridEventTime,eventStatus} from './economic-calendar';

const number=(value:number,digits=0)=>value.toLocaleString('es-ES',{minimumFractionDigits:digits,maximumFractionDigits:digits});
const date=(value:string)=>new Date(value+'T00:00:00Z').toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});
function Difference({value,digits=0}:{value:number|null;digits?:number}){return <span className={value===null||value===0?'':value>0?'result-up':'result-down'}>{value===null?'—':`${value>0?'↑ +':value<0?'↓ ':''}${number(value,digits)}`}</span>;}

export function ResultsMonitor({snapshot,now}:{snapshot:MacroSnapshot|null;now:string}){
 const [area,setArea]=useState<'G7'|'USA'|'G20'>('G7');
 const [selectedMonth,setSelectedMonth]=useState<string|null>(null);
 const [selectedWeek,setSelectedWeek]=useState<string|null>(null);
 const series=snapshot?.cli?.[area];
 const monthly=series?.points.slice(-6)??[];
 const selected=monthly.find(p=>p.period===selectedMonth);
 const week=weeklyClaims.find(p=>p.period===selectedWeek);
 const fedNext=[...ECONOMIC_EVENTS,...NEXT_WEEK_EVENTS].find(e=>e.title==='Fed · decisión de tipos'&&eventStatus(e,now)==='Programado');
 return <section className="results-monitor" aria-labelledby="results-title">
  <div className="results-heading"><h2 id="results-title">Resultados publicados</h2><p>CLI mensual · solicitudes semanales · Fed por decisión. Cada serie conserva su fecha.</p></div>
  <div className="results-grid">
   <article className="panel results-panel"><div className="home-panel-heading"><h2><span>06 /</span> CLI · ciclo adelantado</h2></div>
    <div className="segmented results-areas" role="group" aria-label="Área del CLI mensual">{(['G7','USA','G20'] as const).map(key=><button key={key} aria-pressed={key===area} onClick={()=>{setArea(key);setSelectedMonth(null);}}>{key==='USA'?'EE. UU.':key}</button>)}</div>
    <p className="results-description">Busca anticipar giros del ciclo. Nivel 100 = tendencia; no es crecimiento del PIB.</p>{snapshot?.warnings.filter(w=>w.startsWith("OCDE · comprobación")).map(w=><p className="results-source" role="status" key={w}>{w}</p>)}
    {series?<><div className="results-table"><table><caption>Últimos seis meses · {area==='USA'?'EE. UU.':area}</caption><thead><tr><th scope="col">Mes</th><th scope="col">Nivel</th><th scope="col">Cambio mensual</th></tr></thead><tbody>{monthly.map(p=><tr key={p.period} data-selected={selectedMonth===p.period} onClick={()=>setSelectedMonth(p.period)}><th scope="row"><button aria-pressed={selectedMonth===p.period} aria-controls="cli-month-detail" onClick={()=>setSelectedMonth(p.period)}>{selectedMonth===p.period?'▸ ':''}{pillarMonthLabel(p.period)}</button></th><td>{number(p.value,4)}</td><td><Difference value={change(series.points.filter(v=>v.period<=p.period),1)} digits={4}/></td></tr>)}</tbody></table></div><p id="cli-month-detail" aria-live="polite" className="results-detail">{selected?`${pillarMonthLabel(selected.period)}: ${number(selected.value,4)}. Cambio expresado en puntos de índice, no en porcentaje.`:'Selecciona un mes para consultar el nivel. Los meses pueden revisarse.'}</p><p className="results-source">Consultado: {madridEventTime(series.source.fetchedAt)} Madrid, {series.source.fetchedAt.slice(0,4)}. {series.source.publishedAt?`Publicado: ${date(series.source.publishedAt.slice(0,10))}.`:'Fecha original de publicación no disponible en la captura.'} <a href={series.source.url} target="_blank" rel="noreferrer">OCDE ↗</a></p></>:<p className="results-detail">No hay una captura válida del CLI.</p>}
   </article>
   <article className="panel results-panel"><div className="home-panel-heading"><h2><span>07 /</span> Subsidio de desempleo</h2></div><p className="results-description">Solicitudes iniciales: personas que piden la ayuda por primera vez. Publicación semanal.</p>
    <div className="results-table"><table><caption>Semanas terminadas · último informe {date(CLAIMS_RELEASED_AT.slice(0,10))}</caption><thead><tr><th scope="col">Semana</th><th scope="col">Solicitudes</th><th scope="col">Cambio</th></tr></thead><tbody>{weeklyClaims.map((p,i)=><tr key={p.period} data-selected={selectedWeek===p.period} onClick={()=>setSelectedWeek(p.period)}><th scope="row"><button aria-pressed={selectedWeek===p.period} aria-controls="claims-week-detail" onClick={()=>setSelectedWeek(p.period)}>{selectedWeek===p.period?'▸ ':''}{date(p.period)}</button></th><td>{number(p.initial)}</td><td><Difference value={i?p.initial-weeklyClaims[i-1].initial:null}/></td></tr>)}</tbody></table></div>
    <p id="claims-week-detail" className="results-detail" aria-live="polite">{week?`Semana del ${date(week.period)}. Media de cuatro semanas: ${number(week.average)} solicitudes. Esta media suaviza los saltos de una semana.`:'Selecciona una semana para ver su media de cuatro semanas.'}</p>
    <p className="results-description">Las dos últimas semanas se comparan directamente; no se suman como una publicación quincenal. Más solicitudes puede indicar debilidad laboral, pero una semana aislada no confirma una tendencia.</p>
    <p className="results-source">Datos ajustados por patrones del calendario. Siguiente publicación prevista: 5 nov. <a href={CLAIMS_URL} target="_blank" rel="noreferrer">Departamento de Trabajo ↗</a></p>
   </article>
   <article className="panel results-panel"><div className="home-panel-heading"><h2><span>08 /</span> Tipo oficial · Fed</h2></div><p className="results-description">Rango objetivo de los fondos federales: referencia del coste del dinero a corto plazo. No es un índice de inflación.</p>
    <div className="results-table"><table><caption>Decisiones verificadas de la Reserva Federal</caption><thead><tr><th scope="col">Decisión</th><th scope="col">Rango</th><th scope="col">Acción</th></tr></thead><tbody>{FED_DECISIONS.map(row=><tr key={row.decision}><th scope="row"><a href={row.source} target="_blank" rel="noreferrer">{date(row.decision)} ↗</a></th><td>{number(row.lower,2)}–{number(row.upper,2)} %</td><td>{row.action}</td></tr>)}</tbody></table></div>
    <p className="results-description">pp: puntos porcentuales. El 16 de septiembre subió de 3,50–3,75 % a 3,75–4,00 %. El 28 de octubre mantuvo ese rango, por 10 votos a 2. Las decisiones siguen el calendario de reuniones.</p>
    {fedNext&&<p className="results-detail"><strong>Próxima decisión prevista:</strong> {madridEventTime(fedNext.scheduledAt)} Madrid · {eventStatus(fedNext,now)}.</p>}
    <p className="results-source">Decisión de octubre contrastada el 29 oct 2026; julio y septiembre conservan su comprobación del 21 oct. <a href="https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" target="_blank" rel="noreferrer">Calendario de la Fed ↗</a></p>
   </article>
  </div>
  <p className="results-legend">↑ Verde = aumento numérico · ↓ Rojo = descenso numérico · Ámbar = selección. Subir no siempre es favorable: depende del indicador.</p>
 </section>;
}
