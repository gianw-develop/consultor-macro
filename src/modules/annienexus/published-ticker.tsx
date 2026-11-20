"use client";
import { useState } from "react";
import { recentRetailRates, weeklyClaims } from "./economic-pillars-data";
import employment from "./employment-release.json";
import { m1Growth } from "./m1-data";
const percent=(v:number|null)=>v===null?"Sin dato":`${v>0?"+":""}${v.toLocaleString("es-ES",{maximumFractionDigits:2,minimumFractionDigits:2})} %`;
const retail=recentRetailRates.at(-1)!;
const numericDirection=(value:number|null):"up"|"down"|undefined=>value===null||value===0?undefined:value>0?"up":"down";
const items: {name:string;value:string;period:string;url?:string;change?:string;direction?:"up"|"down"}[]=[
 {name:"Empleo NFP",value:"+29.000",period:"Septiembre · publicado 2 oct 2026",url:employment.url},
 {name:"Desempleo",value:"4,2 %",change:"+0,1 pp · frente a agosto",direction:"up",period:"Septiembre · participación 61,8 %"},
 {name:"Dow Jones",value:"Cotización pendiente",period:"Proveedor de cotizaciones no conectado"},
 {name:"Tipo objetivo de la Fed",value:"3,75–4,00 %",period:"28 oct 2026 · mantiene el rango objetivo",url:"https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm"},
 {name:"Solicitudes iniciales",value:weeklyClaims.at(-1)!.initial.toLocaleString("es-ES"),change:"−1.000 · anterior revisado",direction:"down",period:"Semana 24 oct · publicado 29 oct 2026"},
 {name:"ISM · actividad industrial",value:"55,5",period:"Octubre · publicado 2 nov 2026"},
 {name:"ISM · índice de precios",value:"75,2",change:"−2,7 puntos · mensual",direction:"down",period:"Octubre · publicado 2 nov 2026"},
 {name:"Ventas nominales · mensual",value:"",change:percent(retail.nominal),direction:numericDirection(retail.nominal),period:"Septiembre · revisión 15 oct 2026"},
 {name:"Ventas reales · mensual",value:"",change:percent(retail.real),direction:numericDirection(retail.real),period:"Septiembre · cálculo con revisión 15 oct 2026"},
 {name:"M1 real · seis meses",value:"",change:percent(m1Growth.at(-1)!.value),direction:numericDirection(m1Growth.at(-1)!.value),period:"Septiembre · M1 publicado 27 oct 2026"},
 {name:"IPC · inflación mensual",value:"",change:"+0,6 %",direction:"up",period:"Septiembre · publicado 14 oct 2026"},
 {name:"PIB real · tasa anualizada",value:"",change:"+3,4 %",direction:"up",period:"3.º trimestre · avance publicado 29 oct 2026"}
];
export function PublishedTicker(){
 const [paused,setPaused]=useState(false);
 return <section className={`published-ticker${paused?" is-paused":""}`} aria-label="Últimos datos publicados, no en vivo">
  <div className="ticker-heading"><span>Últimos datos publicados <b>· no en vivo</b></span><details className="ticker-color-info"><summary>ⓘ Color</summary><p>Color indica subida o bajada, no impacto favorable o desfavorable. Verde: cambio positivo; rojo: negativo. Niveles y datos informativos en blanco.</p></details><button type="button" aria-pressed={paused} aria-label={paused?"Reanudar movimiento de cifras":"Pausar movimiento de cifras"} onClick={()=>setPaused(!paused)}>{paused?"▶ Reanudar":"Ⅱ Pausar"}</button></div>
  <div className="ticker-window" tabIndex={0} aria-label="Cifras publicadas; el movimiento se pausa al enfocar">
   <div className="ticker-track">{[false,true].map(copy=><ul key={String(copy)} aria-hidden={copy||undefined}>{items.map(item=><li key={item.name}><span>{!copy&&item.url?<a href={item.url} target="_blank" rel="noreferrer">{item.name} ↗</a>:<>{item.name}{item.url?" ↗":""}</>}</span><div className="ticker-figures">{item.value&&<strong className={/\d/.test(item.value)?"ticker-numeric":"ticker-status"}>{item.value}</strong>}{item.change&&<span className={`ticker-change ${item.direction||""}${!item.value?" ticker-primary-change":""}`}><span className="ticker-numeric">{item.change.split(" · ")[0]}</span>{item.change.includes(" · ")&&<span className="ticker-comparison"> · {item.change.split(" · ").slice(1).join(" · ")}</span>}</span>}</div><small>{item.period}</small></li>)}</ul>)}</div>
  </div>
 </section>;
}
