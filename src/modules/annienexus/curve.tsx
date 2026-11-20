"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useDemo } from "../../shared/ui/demo-provider";
import { Tag } from "../../shared/ui/primitives";
import { Icon } from "../../shared/ui/icons";
import { MATURITIES, isOld, type MacroSnapshot } from "./macro-data";
const examples = { ascending: [3.6,3.65,3.7,3.8,3.9,4.05,4.12,4.2,4.4,4.55], inverted: [4.7,4.65,4.6,4.5,4.35,4.15,4,3.9,3.95,4.05] };
const visibleMaturities = MATURITIES.map((label,sourceIndex)=>({label,sourceIndex})).filter(({label})=>["2A","5A","10A","20A","30A"].includes(label));
const percent = (value:number) => value.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})+" %";
const date = (value:string) => new Date(value+"T12:00:00Z").toLocaleDateString("es-ES",{timeZone:"UTC"});
export function YieldCurve({data,now}:{data:MacroSnapshot["treasury"];now:string}) {
 const { demo } = useDemo(); const id = useId();
 const chartRef=useRef<SVGSVGElement>(null);
 const [chartWidth,setChartWidth]=useState(550);
 useEffect(()=>{
  const chart=chartRef.current;if(!chart)return;
  const observer=new ResizeObserver(()=>{
   const {width,height}=chart.getBoundingClientRect();
   if(width>0&&height>0)setChartWidth(Math.max(280,width/height*245));
  });
  observer.observe(chart);return()=>observer.disconnect();
 },[]);
 const plotLeft=45,plotRight=chartWidth-12;
 const [shape,setShape] = useState<keyof typeof examples>("ascending");
 const latest=data?.rows[0];
 const values = demo?examples[shape]:latest?.values;
 const plotted=values?visibleMaturities.map(({sourceIndex})=>values[sourceIndex]):undefined;
 const all=plotted??[3,5];
 const min=Math.floor((Math.min(...all)-.15)*2)/2,max=Math.ceil((Math.max(...all)+.15)*2)/2;
 const x = (i:number) => plotLeft+i*(plotRight-plotLeft)/(visibleMaturities.length-1), y = (v:number) => 206-(v-min)/(max-min)*170;
 const path = (series:number[]) => series.map((v,i)=>(i?"L":"M")+x(i)+" "+y(v)).join(" ");
 const spread = values?values[7]-values[3]:null;
 const old=latest?isOld(latest.date,now,7):false;
 return <section className="panel curve-panel">
  <div className="section-heading"><h2>Curva y ciclo.</h2><p className="curve-subtitle">Necesita confirmación de actividad y crédito.</p><Tag tone="amber">{demo?"CIFRAS ILUSTRATIVAS":latest?old?"CORTE ANTIGUO":"DATO OFICIAL":"SIN DATOS"}</Tag></div>
  <div className="curve-tools"><strong>Rendimientos del Tesoro de EE. UU.</strong>{demo&&<div className="segmented" aria-label="Forma ilustrativa de la curva" role="group"><button aria-pressed={shape==="ascending"} onClick={()=>setShape("ascending")}>Ascendente</button><button aria-pressed={shape==="inverted"} onClick={()=>setShape("inverted")}>Invertida</button></div>}</div>
  <div className="curve-plot-layout"><div className="curve-plot"><span className="axis-definition">Rendimiento (%) · plazos espaciados por categoría</span><div className="curve-chart-scroll"><svg ref={chartRef} viewBox={"0 0 "+chartWidth+" 245"} className="yield-chart" role="img" aria-label={demo?"Curva de rendimientos hipotética":latest?"Curva oficial del "+date(latest.date)+", plazos de dos, cinco, diez, veinte y treinta años":"Curva pendiente de datos"}>
   <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#25abf5" stopOpacity=".13"/><stop offset="1" stopColor="#25abf5" stopOpacity="0"/></linearGradient></defs>
   {Array.from({length:5},(_,i)=>min+(max-min)*i/4).map(v=><g key={v}><line x1={plotLeft} x2={plotRight} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray="3 4"/><text x="31" y={y(v)+4} textAnchor="end">{v.toFixed(1)}</text></g>)}
   {visibleMaturities.map(({label},i)=><g key={label}><line x1={x(i)} x2={x(i)} y1="36" y2="206" stroke="var(--line)" opacity=".5"/><text x={x(i)} y="231" textAnchor="middle">{label}</text></g>)}
   {plotted&&<><path d={path(plotted)+" L"+plotRight+" 206 L"+plotLeft+" 206Z"} fill={"url(#"+id+")"}/><path d={path(plotted)} fill="none" stroke="#4fb9ff" strokeWidth="2.8"/>{plotted.map((v,i)=><g key={i}><circle cx={x(i)} cy={y(v)} r="4.2" fill="#5cb9ff"><title>{visibleMaturities[i].label+": "+v.toFixed(2)+"% · "+(demo?"hipotético":latest?.date)}</title></circle><text className="curve-point-value" x={x(i)+(i===plotted.length-1?4:0)} y={y(v)-13} textAnchor={i===plotted.length-1?"end":"middle"}>{percent(v)}</text></g>)}</>}
  </svg></div><div className="curve-legend curve-legend-single"><span><i/>{demo?"Ejemplo hipotético":latest?"Último dato oficial cargado · "+date(latest.date):"Sin observaciones"}</span></div></div>
  <aside className="curve-comparison"><div><strong>10A − 2A</strong><b>{spread===null?"—":(spread>0?"+":"")+spread.toFixed(2)+" pp"}</b><span>{spread===null?"Fuente pendiente":Math.round(spread*100)+" puntos básicos"}</span><small>pp: puntos porcentuales. 100 puntos básicos equivalen a 1 pp.</small></div><a className="button" href="https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value=2026" target="_blank" rel="noreferrer">Ver Tesoro <Icon name="arrow"/></a></aside></div>
  <p className="explain-note"><Icon name="info" size={21}/><span>Rendimiento: interés que ofrece el bono en relación con su precio; normalmente se mueven al revés. {spread===null?"No hay observaciones conectadas.":spread>=0?"El plazo de diez años ofrece más que el de dos. Esto no identifica por sí solo la fase del ciclo.":"El rendimiento a dos años supera al de diez; no fecha ni confirma por sí solo una recesión."}</span></p>
  {!demo&&data&&<details className="curve-data"><summary>Fechas, valores y cálculo</summary><p>Curva diaria de rendimientos par: estimaciones oficiales para bonos hipotéticos emitidos a su valor nominal. Consultada el {new Date(data.source.fetchedAt).toLocaleString("es-ES",{timeZone:"Europe/Madrid"})} (Madrid). No son cotizaciones en vivo. Hora exacta de publicación no incluida. {old?"Han pasado más de siete días desde la observación: actualiza el corte.":""}</p><div className="table-scroll"><table><thead><tr><th>Plazo</th><th>{latest?.date}</th></tr></thead><tbody>{visibleMaturities.map(({label,sourceIndex})=><tr key={label}><th>{label}</th><td>{values?percent(values[sourceIndex]):"—"}</td></tr>)}</tbody></table></div><p>10A − 2A = rendimiento de diez años menos rendimiento de dos años. M = meses; A = años. La línea corresponde a esta fecha de observación; no es un precio de bono ni un promedio mensual.</p></details>}
  <Link className="source-link" href="/annienexus/formacion?leccion=source-5">Marco de curva · clase 6 (archivo 5) →</Link>
 </section>;
}
