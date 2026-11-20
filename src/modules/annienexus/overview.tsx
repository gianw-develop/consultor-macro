"use client";
import Link from 'next/link';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import brief from './daily-brief.json';
import {useDemo} from '../../shared/ui/demo-provider';
import {HORIZONS,HORIZON_LABELS} from '../../contracts/core';
import {Icon} from '../../shared/ui/icons';
import {EconomicContext} from './economic-context';
import {DataAvailability} from './data-availability';
import {YieldCurve} from './curve';
import {MacroInstrument} from './macro-instrument';
import {GDP_NEXT_LABEL} from './reviewed-observations';
import {FED_TARGET,FED_NEXT_DECISION,FED_CALENDAR_URL} from './sectors-data';
import {madridEventTime} from './economic-calendar';
import {weeklyClaims,INFLATION_RELEASED_AT,INFLATION_URL} from './economic-pillars-data';
import {agendaEvents,agendaHorizon,evaluateFreshness,overdueEvents,upcomingEvents,daysBetween,type FreshnessState,type FreshnessSummary} from './freshness';
import type {MacroSnapshot} from './macro-data';
import type {EconomicReading,ReadingInput} from './economic-reading';
import type {ClockReading} from './regime-clock';
import {ResultsMonitor} from './results-monitor';
import './overview.css';

type OverviewData=Pick<ReadingInput,'gdp'|'inflation'|'inflationAnnual'>;
const fmt=(v:number|null|undefined)=>typeof v==='number'&&Number.isFinite(v)?v.toLocaleString('es-ES',{maximumFractionDigits:2}):'—';
const signed=(v:number|null|undefined)=>typeof v==='number'&&Number.isFinite(v)?`${v>0?'+':v<0?'−':''}${fmt(Math.abs(v))}`:'—';
const monthLabel=(period:string|undefined)=>{const m=period?.match(/^(\d{4})-(\d{2})$/);return m?new Date(Date.UTC(+m[1],+m[2]-1,15)).toLocaleDateString('es-ES',{month:'long',year:'numeric',timeZone:'UTC'}):'—';};
const ago=(from:string|null|undefined,now:string)=>{const d=from?daysBetween(from,now):null;return d===null?'—':d===0?'hoy':d===1?'hace 1 día':`hace ${d} días`;};
const STATE_LABEL:Record<FreshnessState,string>={current:'Vigente',pending:'Dato nuevo sin incorporar',expired:'Caducada'};
function StatePill({state,children}:{state:FreshnessState;children?:ReactNode}){return <span className={`state-pill ${state}`}><span aria-hidden="true"/>{children??STATE_LABEL[state]}</span>;}
const dated=(value:string)=>new Date(value).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric',timeZone:'Europe/Madrid'});
const zones=[
 {id:'growth_down_prices_up',title:'Estanflación',text:'Crecimiento débil · inflación sube',tone:'stagflation'},
 {id:'growth_prices_up',title:'Expansión inflacionaria',text:'Crecimiento mejora · inflación sube',tone:'expansion'},
 {id:'growth_prices_easing',title:'Crisis deflacionaria',text:'Crecimiento e inflación bajan',tone:'contraction'},
 {id:'growth_up_prices_easing',title:'Expansión desinflacionaria',text:'Crecimiento mejora · inflación baja',tone:'disinflation'},
] as const;

function RegimeMap({clock,now}:{clock:ClockReading;now:string}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [time,setTime]=useState(now);
 useEffect(()=>{const timer=setInterval(()=>setTime(new Date().toISOString()),60000);return()=>clearInterval(timer);},[]);
 const point=clock.angle===null?null:{left:`${50+50*Math.sin(clock.angle*Math.PI/180)}%`,top:`${50-50*Math.cos(clock.angle*Math.PI/180)}%`};
 const current=clock.status==='provisional'&&!!clock.review&&Date.parse(time)<Date.parse(clock.review.reviewBy);
 return <section className="panel home-regime" aria-labelledby="home-regime-title">
  <div className="home-panel-heading"><h2 id="home-regime-title"><span>02 /</span> Crecimiento e inflación</h2><button onClick={()=>dialog.current?.showModal()}>Ver evidencia ↗</button></div>
  <div className="home-axis vertical">Inflación al alza ↑</div>
  <div className="home-quadrants">
   {zones.map(zone=>{const active=clock.zone===zone.id;return <div key={zone.id} className={`home-zone ${zone.tone}${active?` active${current?'':' historical'}`:''}`} aria-current={active?'true':undefined}><h3>{zone.title}</h3><p>{zone.text}</p>{active&&<span className="home-zone-tag">{current?'Fase revisada':'Última fase revisada'}</span>}</div>;})}
   <div className="home-regime-rail">
    <span className="home-rail-center" aria-hidden="true">EE. UU.</span>
    {point&&<button className={`home-position ${current?'':'historical'}`} style={point} onClick={()=>dialog.current?.showModal()} aria-label={`${current?'Orientación provisional':'Última orientación fechada'} de EE. UU. en ${zones.find(zone=>zone.id===clock.zone)?.title}. Ver datos y límites.`}><span className="home-position-dot" aria-hidden="true"/><span className="home-position-label">{current?"Posición revisada":"Última revisión"}</span></button>}
   </div>
  </div>
  <div className="home-axis horizontal"><span>← Crecimiento pierde fuerza</span><span>Crecimiento mejora →</span></div>
  <div className="home-axis vertical">↓ Inflación a la baja</div>
  <button className="home-regime-note" onClick={()=>dialog.current?.showModal()}><Icon name="info"/><span>{clock.review?`${dated(clock.review.cut)} · ${current?'lectura provisional, señales mixtas':'última orientación; requiere revisión'}`:'Posición pendiente de revisión'}<small>Riel orientativo · transición entre fases sin confirmar. Ver evidencia.</small></span></button>
  <dialog ref={dialog} className="home-dialog" aria-labelledby="home-point-title"><div className="home-dialog-heading"><h2 id="home-point-title">Qué representa el punto</h2><button className="button" onClick={()=>dialog.current?.close()}>Cerrar</button></div><p>{current?clock.explanation.replace('La manecilla','El punto'):'Se conserva la última orientación fechada; no representa una lectura actual.'}</p><p>El círculo es una guía visual. El punto se coloca en el centro del arco de la zona revisada: no mide intensidad ni cuánto falta para cambiar de fase. Solo cambia de zona con una nueva revisión; no gira con el paso del tiempo. La dirección y la proximidad a otra fase requieren una regla documentada y evidencia adicional. No hay una trayectoria histórica conectada.</p>{clock.review&&<><p><b>Crecimiento:</b> {clock.review.growth}</p><p><b>Inflación:</b> {clock.review.inflation}</p><p>En esa revisión histórica, el PIB trimestral crecía a menor ritmo mientras el CLI —indicador adelantado del ciclo— sube en otra ventana. Son señales mixtas, no una aceleración general confirmada.</p><p className="small muted">Revisado: {dated(clock.review.reviewedAt)} · próxima revisión: {madridEventTime(clock.review.reviewBy)} (Madrid). No se renueva automáticamente al abrir esta página.</p><ul>{clock.review.evidence.map(e=><li key={e.name}><b>{e.name} · {e.period}:</b> {e.comparison} {e.reading} <a href={e.url} target="_blank" rel="noreferrer">Fuente ↗</a></li>)}</ul><h3>Contradicciones</h3><ul>{clock.review.contradictions.map(s=><li key={s}>{s}</li>)}</ul></>}<p className="small muted">Mapa de las mentorías 8 y 15. Inflación bajando no implica caída general de precios; desaceleración no demuestra por sí sola recesión. La orientación del corte es una revisión editorial, no un diagnóstico actual atribuido al profesor.</p></dialog>
 </section>;
}

function SignalTable({data,clock}:{data:OverviewData;clock:ClockReading}){
 const [selected,setSelected]=useState<string|null>(null);
 const gdp=data.gdp.points.at(-1), previous=data.gdp.points.at(-2);
 const cli=clock.review?.evidence.find(e=>e.name.startsWith('CLI'));
 const sales=clock.review?.evidence.find(e=>e.name.startsWith('Ventas reales'));
 const prices=clock.review?.evidence.find(e=>e.name.startsWith('IPC'));
 const rows=[
  {id:'gdp',name:'PIB real',value:gdp?.value==null?'Dato no disponible':`${signed(gdp.value)} % anualizado`,period:gdp?.period.replace(/(\d{4})-Q(\d)/,'$2T $1')??'—',detail:`PIB: producción de bienes y servicios, descontando la inflación. Lectura del corte: ${fmt(gdp?.value)} % anualizado, frente a ${fmt(previous?.value)} % anterior.`,url:data.gdp.source.url},
  {id:'cli',name:'CLI EE. UU.',value:cli?'Sube':'Sin revisión',period:cli?.period??'—',detail:cli?`${cli.comparison} ${cli.reading}`:'Sin evidencia en este corte.',url:cli?.url},
  {id:'sales',name:'Ventas reales',value:sales?'+0,12 % mensual':'Sin revisión',period:sales?.period??'—',detail:sales?`${sales.comparison} ${sales.reading}`:'Sin evidencia en este corte.',url:sales?.url},
  {id:'prices',name:'IPC',value:prices?'Más presión':'Sin revisión',period:prices?.period??'—',detail:prices?`${prices.comparison} ${prices.reading}`:'Sin evidencia en este corte.',url:prices?.url},
 ];
 const active=rows.find(row=>row.id===selected);
 const stale=clock.status!=='provisional';
 return <section className="home-signals" aria-labelledby="home-signals-title"><h2 id="home-signals-title">Señales del corte</h2>{stale&&clock.review&&<p className="home-signals-stale" role="status">Lecturas de la revisión del {dated(clock.review.cut)}, vencida el {dated(clock.review.reviewBy)}. Pueden haber cambiado.</p>}<div className="home-signal-scroll"><table><thead><tr><th scope="col">Indicador</th><th scope="col">Lectura</th><th scope="col">Periodo</th></tr></thead><tbody>{rows.map(row=><tr key={row.id} data-selected={selected===row.id} onClick={()=>setSelected(row.id)}><th scope="row"><button aria-pressed={selected===row.id} aria-controls="home-signal-detail" onClick={()=>setSelected(row.id)}><span aria-hidden="true">{selected===row.id?'▸':'·'}</span>{row.name}</button></th><td>{row.value}</td><td>{row.period}</td></tr>)}</tbody></table></div><p className="home-signal-help">CLI: indicador adelantado del ciclo. Ámbar: fila seleccionada.</p><div id="home-signal-detail" className="home-signal-detail" aria-live="polite">{active?<><strong>{active.name} · </strong>{active.detail}{active.url&&<> <a href={active.url} target="_blank" rel="noreferrer">Fuente ↗</a></>}</>:'Selecciona una fila para consultar su lectura y fuente.'}</div></section>;
}


function TodayBrief({clock,freshness,now}:{clock:ClockReading;freshness:FreshnessSummary;now:string}){
 const zone=zones.find(z=>z.id===clock.zone);
 const regime=freshness.items.find(i=>i.id==='regime');
 const upcoming=upcomingEvents(now).slice(0,2), overdue=overdueEvents(now), horizon=agendaHorizon();
 const verdict=freshness.state==='current'?'La lectura está al día.':freshness.state==='pending'?'Hay publicaciones oficiales posteriores al corte: úsala como contexto, no como lectura actual.':'La fase del ciclo necesita una nueva revisión antes de apoyarte en ella.';
 return <section className="panel home-today" aria-labelledby="home-today-title">
  <div className="home-panel-heading"><h2 id="home-today-title"><span>00 /</span> Lectura de hoy</h2><StatePill state={freshness.state}>{freshness.state==='current'?'Corte vigente':`Corte del ${dated(freshness.cutAt)} · ${ago(freshness.cutAt,now)}`}</StatePill></div>
  <div className="home-today-grid">
   <div className="home-today-main">
    <p className="eyebrow">Fase orientativa · EE. UU.</p>
    <p className={`home-today-phase ${zone?.tone??''}`}>{zone?.title??'Sin fase revisada'}{regime&&<StatePill state={regime.state}>{regime.state==='expired'?regime.note:'Revisión vigente'}</StatePill>}</p>
    <h1>{brief.title}</h1>
    <p className="home-today-chain"><b>Por qué importa para el SPX:</b> {brief.chain}</p>
    <p className={`home-today-verdict ${freshness.state}`} role="status">{verdict}</p>
   </div>
   <div className="home-today-watch">
    <h2>Qué vigilar</h2>
    {upcoming.length?<ul>{upcoming.map(e=><li key={e.id}><a href={e.url} target="_blank" rel="noreferrer"><time dateTime={e.scheduledAt}>{madridEventTime(e.scheduledAt)}</time><span>{e.title}</span><small>{e.period} · Madrid</small></a></li>)}</ul>
     :<p className="home-empty">No hay publicaciones futuras cargadas.{horizon&&<> La agenda llega hasta el {dated(horizon)}.</>}</p>}
    {overdue.length>0&&<><h3>Publicadas sin incorporar ({overdue.length})</h3><ul className="overdue">{overdue.slice(-4).reverse().map(e=><li key={e.id}><a href={e.url} target="_blank" rel="noreferrer"><time dateTime={e.scheduledAt}>{madridEventTime(e.scheduledAt)}</time><span>{e.title}</span></a></li>)}</ul></>}
   </div>
   <div className="home-today-fresh">
    <h2>Vigencia de los datos</h2>
    <ul>{freshness.items.map(i=><li key={i.id} data-state={i.state}><span className="dot" aria-hidden="true"/><span><b>{i.label}</b><small>{i.note}</small></span><span className="sr-only">{STATE_LABEL[i.state]}</span></li>)}</ul>
    <p className="small muted">La web no recibe datos en vivo: cada corte se revisa y se publica a mano.</p>
   </div>
  </div>
 </section>;
}

function Agenda({now,onAll}:{now:string;onAll:()=>void}){
 const all=agendaEvents(), upcoming=upcomingEvents(now,all), overdue=overdueEvents(now,all), horizon=agendaHorizon(all);
 return <section className="panel home-agenda" aria-labelledby="home-agenda-title">
  <div className="home-strip-title"><Icon name="source" size={28}/><h2 id="home-agenda-title">Agenda</h2></div>
  <div className="home-agenda-col"><h3>Próximas</h3>{upcoming.length?upcoming.slice(0,3).map(e=><a key={e.id} href={e.url} target="_blank" rel="noreferrer"><time dateTime={e.scheduledAt}>{madridEventTime(e.scheduledAt)}</time><span>{e.title}</span><small>{e.period} · Madrid</small></a>):<p className="home-empty">Sin publicaciones futuras cargadas{horizon?` (agenda hasta el ${dated(horizon)})`:''}.</p>}</div>
  <div className="home-agenda-col overdue"><h3>Publicadas sin incorporar</h3>{overdue.length?overdue.slice(-3).reverse().map(e=><a key={e.id} href={e.url} target="_blank" rel="noreferrer"><time dateTime={e.scheduledAt}>{madridEventTime(e.scheduledAt)}</time><span>{e.title}</span><small>Resultado por verificar</small></a>):<p className="home-empty">Ninguna: todo lo publicado está incorporado.</p>}</div>
  <button className="source-link" onClick={onAll}>Todos los datos y fuentes ＋</button>
 </section>;
}

export function Overview({snapshot,now,reading,clockReading,data}:{snapshot:MacroSnapshot|null;now:string;reading:EconomicReading;clockReading:ClockReading;data:OverviewData}){
 const {horizon,setHorizon}=useDemo();
 const [allOpen,setAllOpen]=useState(false);
 const [cli,setCli]=useState<"G7"|"G20">("G7");
 const details=useRef<HTMLDetailsElement>(null);
 const gdp=data.gdp.points.at(-1),previousGdp=data.gdp.points.at(-2),inflation=data.inflation.points.at(-1),annual=data.inflationAnnual?.points.at(-1),previousAnnual=data.inflationAnnual?.points.at(-2);
 const nfp=snapshot?.nfp?.points??[], nfpLast=nfp.at(-1), nfpPrev=nfp.at(-2), nfpChange=nfpLast&&nfpPrev?nfpLast.value-nfpPrev.value:null;
 const claims=weeklyClaims.at(-1), claimsPrev=weeklyClaims.at(-2);
 const fed=`${FED_TARGET.lower.toFixed(2).replace('.',',')}–${FED_TARGET.upper.toFixed(2).replace('.',',')} %`;
 const freshness=evaluateFreshness(now,brief.checkedAt,clockReading,{gdp:`${signed(gdp?.value)} %`,cpi:`${signed(annual?.value)} % anual`,fed,claims:claims?`${fmt(claims.initial)}`:'—',payrolls:nfpChange===null?'—':`${signed(nfpChange)} mil`});
 const item=(id:string)=>freshness.items.find(i=>i.id===id)!;
 const steps=[{icon:'bars',name:'Crecimiento',detail:'PIB real y señales adelantadas'},{icon:'coins',name:'Inflación',detail:'Precios de bienes y servicios'},{icon:'bank',name:'Tipos',detail:'Coste del dinero y condiciones'},{icon:'source',name:'Beneficios',detail:'Márgenes y resultados'},{icon:'trend',name:'SPX',detail:'Valoración y comportamiento'}];
 function showAll(){setAllOpen(true);requestAnimationFrame(()=>details.current?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));}
 return <main id="main-content" className="main-content home-overview">
  <div className="home-topline"><p><strong>Panorama macro</strong> · Estados Unidos</p><div><p className="micro">Datos revisados · {dated(brief.checkedAt)}</p><div className="home-horizons" role="group" aria-label="Horizonte de análisis">{HORIZONS.map(h=><button key={h} aria-pressed={horizon===h} onClick={()=>setHorizon(h)}>{HORIZON_LABELS[h]}</button>)}</div></div></div>
  <TodayBrief clock={clockReading} freshness={freshness} now={now}/>
  <section className="panel home-metrics" aria-label="Crecimiento, inflación, empleo y tipos">
   <article><Icon name="bars" size={34}/><div><h2>Crecimiento · PIB real</h2><strong>{signed(gdp?.value)} %</strong><p>{gdp?.period.replace(/(\d{4})-Q(\d)/, "$2.º trimestre $1")} · tasa anualizada</p><p className="small">Anterior: {signed(previousGdp?.value)} % · {gdp?.value!=null&&previousGdp?.value!=null?(gdp.value>previousGdp.value?"acelera":gdp.value<previousGdp.value?"se modera":"sin cambio"):"sin comparación"}</p><StatePill state={item('gdp').state}>{item('gdp').note}</StatePill><a href={data.gdp.source.url} target="_blank" rel="noreferrer">BEA · publicado {data.gdp.source.publishedAt?dated(data.gdp.source.publishedAt):"—"} · próximo {GDP_NEXT_LABEL} ↗</a></div></article>
   <article><Icon name="coins" size={34}/><div><h2>Inflación · IPC</h2><strong>{signed(annual?.value)} % <span>anual</span></strong><p>{monthLabel(inflation?.period)} · {signed(inflation?.value)} % mensual</p><p className="small">Anterior: {signed(previousAnnual?.value)} % anual · {annual?.value!=null&&previousAnnual?.value!=null?(annual.value>previousAnnual.value?"más presión de precios":annual.value<previousAnnual.value?"menos presión de precios":"sin cambio"):"sin comparación"}</p><StatePill state={item('cpi').state}>{item('cpi').note}</StatePill><a href={INFLATION_URL} target="_blank" rel="noreferrer">BLS · publicado {dated(INFLATION_RELEASED_AT)} ↗</a></div></article>
   <article><Icon name="people" size={34}/><div><h2>Empleo · NFP</h2><strong>{nfpChange===null?'—':`${signed(nfpChange)} mil`}</strong><p>{monthLabel(nfpLast?.period)} · empleos netos{nfpLast?.preliminary?' (preliminar)':''}</p><p className="small">Solicitudes semanales: {claims?fmt(claims.initial):'—'}{claims&&claimsPrev?` (${signed(claims.initial-claimsPrev.initial)})`:''}</p><StatePill state={item('payrolls').state}>{item('payrolls').note}</StatePill><a href={snapshot?.nfp?.source.url??'https://www.bls.gov/ces/'} target="_blank" rel="noreferrer">BLS · empleo no agrícola ↗</a></div></article>
   <article><Icon name="bank" size={34}/><div><h2>Tipos · Fed</h2><strong>{fed}</strong><p>Rango objetivo · {FED_TARGET.action.toLowerCase()} el {dated(`${FED_TARGET.decision}T12:00:00Z`)}</p><p className="small">Coste del dinero; no mide la inflación</p><StatePill state={item('fed').state}>{item('fed').state==='current'?`Próxima reunión: ${dated(FED_NEXT_DECISION)}`:item('fed').note}</StatePill><a href={FED_CALENDAR_URL} target="_blank" rel="noreferrer">Calendario de la Reserva Federal ↗</a></div></article>
  </section>
  <div className="home-hero-grid"><section className="panel home-story"><div className="home-panel-heading"><h2><span>01 /</span> Lectura económica</h2></div><p className="home-story-lead">{brief.lead}</p><ol className="home-causal-chain" aria-label="Relación entre economía y S&P 500">{steps.map(step=><li key={step.name}><span className="home-step-icon"><Icon name={step.icon} size={32}/></span><h2>{step.name}</h2><p>{step.detail}</p></li>)}</ol><SignalTable data={data} clock={clockReading}/><p className="home-horizon-reading" aria-live="polite"><b>{HORIZON_LABELS[horizon]}{freshness.cutAgeDays?` · lectura del ${dated(brief.checkedAt)}`:''}:</b> {brief.horizons[horizon]}</p></section><RegimeMap clock={clockReading} now={now}/></div>
  <section className="home-evidence-grid" aria-label="Qué sostiene y qué cambia la lectura">{[
   {title:'Qué apoya',icon:'up',tone:'support',bullets:['Ventas reales aún positivas','CLI: actividad adelantada al alza'],text:brief.supports},
   {title:'Qué contradice',icon:'down',tone:'contradiction',bullets:['Inflación acelerándose','Consumo lento y empleo mensual débil'],text:brief.contradictions},
   {title:'Qué cambiaría',icon:'source',tone:'change',bullets:['Persistencia de los datos','Respuesta de sectores y SPX'],text:brief.changes}
  ].map((item,index)=><article className={`panel home-evidence ${item.tone}`} key={item.title}><div><div className="home-panel-heading"><h2><span>0{index+3} /</span> {item.title}</h2></div><ul>{item.bullets.map(b=><li key={b}>{b}</li>)}</ul><details><summary>Ver evidencia <span>＋</span></summary><p>{item.text}</p><p className="small">CLI: indicador que busca anticipar giros del ciclo; no es la tasa de crecimiento del PIB. La lectura es del corte mostrado, no una reacción intradía verificada.</p>{brief.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.label} ↗ </a>)}<button className="source-link" onClick={showAll}>Abrir series y fechas →</button></details></div></article>)}</section>
  <ResultsMonitor snapshot={snapshot} now={now}/>
  <section className="panel home-confirmation" aria-label="Confirmación de mercado"><div className="home-strip-title"><Icon name="bars" size={30}/><h2>Confirmación de mercado</h2></div><div><h3>XLP / XLY</h3><p>Defensivo frente a cíclico</p></div><div><h3>SPX</h3><p>Respuesta del índice</p></div><p className="home-pending">Ratio XLP/XLY y SPX por conectar.</p><Link className="button" href="/radar">Abrir Sectores y tipos →</Link></section>
  <Agenda now={now} onAll={showAll}/>
  <details ref={details} className="panel home-all-data" open={allOpen} onToggle={e=>setAllOpen(e.currentTarget.open)}><summary>Todos los datos, agenda y fuentes <span>＋</span></summary><div><DataAvailability now={now}/><EconomicContext now={now}/><section className="home-instruments" aria-label="Indicadores compuestos y empleo">{['CLI · señales adelantadas','LEI · señales tempranas','CEI · actividad presente','NFP · empleo no agrícola'].map((name,index)=><article className="panel" key={name}><h2>{name}</h2>{index===0&&<div className="segmented compact-tabs" role="group" aria-label="Cobertura del CLI">{(["G7","G20"] as const).map(group=><button key={group} aria-pressed={cli===group} onClick={()=>setCli(group)}>{group}</button>)}</div>}<MacroInstrument index={index} cli={cli} snapshot={snapshot} now={now} employmentReading={reading.signals.find(s=>s.id==='employment')}/></article>)}</section><YieldCurve data={snapshot?.treasury??null} now={now}/>{snapshot?.warnings.map(w=><p className="small muted" role="status" key={w}>{w}</p>)}</div></details>
 </main>;
}
