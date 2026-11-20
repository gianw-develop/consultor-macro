"use client";
import { useEffect, useRef, useState } from "react";

type ChartSeries = { name: string; values: (number | null)[]; color: string; dashed?: boolean };
export function PillarChart({ labels, series, title, bars = false, digits = 1, suffix = "", zero = false, pointLabels = false, labelMultiplier = 1 }: { labels: string[]; series: ChartSeries[]; title: string; bars?: boolean; digits?: number; suffix?: string; zero?: boolean; pointLabels?: boolean; labelMultiplier?: number }) {
 const host=useRef<HTMLDivElement>(null),[width,setWidth]=useState(520);
 useEffect(()=>{const el=host.current;if(!el)return;const observer=new ResizeObserver(([entry])=>setWidth(Math.max(240,entry.contentRect.width)));observer.observe(el);return()=>observer.disconnect();},[]);
 const values=series.flatMap(s=>s.values).filter((v):v is number=>v!==null&&Number.isFinite(v)),rawMin=values.length?Math.min(...values):0,rawMax=values.length?Math.max(...values):1;
 const min=bars||zero?Math.min(0,rawMin):rawMin-(rawMax-rawMin||1)*.18,max=Math.max(zero?0:rawMax,rawMax)+(rawMax-(bars||zero?Math.min(0,rawMin):rawMin)||1)*.22;
 const top=24,bottom=144,left=40,right=width-24;
 const x=(i:number)=>left+(right-left)*(i+.5)/labels.length;
 const y=(v:number)=>bottom-(v-min)/(max-min)*(bottom-top);
 const format=(n:number)=>n.toLocaleString("es-ES",{minimumFractionDigits:digits,maximumFractionDigits:digits});
 return <div className="pillar-chart" ref={host}>
  <svg viewBox={`0 0 ${width} 172`} role="img" aria-label={title}>
   <title>{title}</title>
   {[min,(min+max)/2,max].map((tick,i)=><g key={i}><line x1={left} x2={right} y1={y(tick)} y2={y(tick)} className="pillar-grid"/><text x={left-7} y={y(tick)+4} textAnchor="end">{format(tick)}</text></g>)}
   {(bars||zero)&&<line x1={left} x2={right} y1={y(0)} y2={y(0)} className="pillar-zero"/>}
   {series.map((s,seriesIndex)=><g key={s.name}>
    {!bars&&<path d={s.values.map((v,i)=>v===null?"":`${i===0||s.values[i-1]===null?"M":"L"}${x(i)},${y(v)}`).join(" ")} fill="none" stroke={s.color} strokeWidth="2.5" strokeDasharray={s.dashed?"6 4":undefined}/>}
    {s.values.map((v,i)=>v===null?null:<g key={i}>{bars?<><rect x={x(i)-Math.min(20,(right-left)/labels.length*.25)} y={Math.min(y(0),y(v))} width={Math.min(40,(right-left)/labels.length*.5)} height={Math.max(1,Math.abs(y(0)-y(v)))} rx="3" fill={s.color}/><text x={x(i)} y={y(v)-8} textAnchor="middle" className="pillar-value" style={v<0?{fill:"var(--bg)"}:undefined}>{format(v)}{suffix}</text></>:<><circle cx={x(i)} cy={y(v)} r="3.5" fill={s.color}/>{pointLabels&&<text x={x(i)} y={y(v)+(series.length===1||v>(series[1-seriesIndex]?.values[i]??v)||(v===series[1-seriesIndex]?.values[i]&&seriesIndex===0)?-10:18)} textAnchor="middle" className="pillar-point-value" style={{fill:s.color}}>{Math.round(v*labelMultiplier).toLocaleString("es-ES")}</text>}</>}</g>)}
   </g>)}
   {labels.map((label,i)=><text key={label} x={x(i)} y="168" textAnchor="middle">{label}</text>)}
  </svg>
  {!bars&&<div className="pillar-legend">{series.map(s=><span key={s.name}><i style={{borderColor:s.color,borderTopStyle:s.dashed?"dashed":"solid"}}/>{s.name}</span>)}</div>}
 </div>;
}
