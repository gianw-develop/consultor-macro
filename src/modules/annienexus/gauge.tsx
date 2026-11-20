"use client";
import { useId } from "react";
export function Gauge({label,value,tone,real=false}:{label:string;value:number|null;tone:string;real?:boolean}){
 const id=useId();const angle=Math.PI-(value??.5)*Math.PI;const endX=90+58*Math.cos(angle),endY=82-58*Math.sin(angle);
 return <svg className="gauge" viewBox="0 0 180 112" role="img" aria-label={value===null?"Indicador sin lectura actual":label+(real?"":" · demostración cualitativa")}>
 <defs><linearGradient id={id+"arc"}><stop stopColor="#f16664"/><stop offset=".48" stopColor="#f3cb72"/><stop offset="1" stopColor="#68ebc6"/></linearGradient><radialGradient id={id+"metal"}><stop offset=".62" stopColor="#091d2c"/><stop offset="1" stopColor="#6b8d9b" stopOpacity=".23"/></radialGradient><filter id={id+"glow"}><feGaussianBlur stdDeviation="1.7"/></filter></defs>
 <path d="M20 82A70 70 0 0 1 160 82L142 82A52 52 0 0 0 38 82Z" fill={"url(#"+id+"metal)"}/><path d="M20 82A70 70 0 0 1 160 82" stroke={"url(#"+id+"arc)"} strokeWidth="1.5" fill="none"/><path d="M24 82A66 66 0 0 1 156 82" stroke="#8dd7f3" opacity=".12" strokeWidth="1" fill="none"/>
 {Array.from({length:13},(_,i)=>{const a=Math.PI-i*Math.PI/12;return <line key={i} x1={90+59*Math.cos(a)} y1={82-59*Math.sin(a)} x2={90+64*Math.cos(a)} y2={82-64*Math.sin(a)} stroke="var(--muted)" opacity=".72"/>;})}
 {value!==null?<><line x1="90" y1="82" x2={endX} y2={endY} stroke={tone} strokeWidth="4" opacity=".6" filter={"url(#"+id+"glow)"}/><line x1="90" y1="82" x2={endX} y2={endY} stroke={tone} strokeWidth="2.6" strokeLinecap="round"/><circle cx="90" cy="82" r="3.5" fill={tone}/><circle cx="90" cy="82" r="1.3" fill="#fff9"/></>:<text x="90" y="72" textAnchor="middle" className="gauge-missing">—</text>}
 <text x="18" y="103" fontSize="8" fill="var(--red)">{real?"BAJA":"DETERIORO"}</text><text x="90" y="38" fontSize="8" textAnchor="middle" fill="var(--muted)">PLANO</text><text x="164" y="103" fontSize="8" textAnchor="end" fill="var(--green)">{real?"SUBE":"MEJORA"}</text></svg>;
}
