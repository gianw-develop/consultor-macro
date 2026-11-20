"use client";
import Link from 'next/link';
import {useState} from 'react';
import {SECTORS,FED_TARGET,type SectorSymbol} from '../../modules/annienexus/sectors-data';
import type {MacroSnapshot} from '../../modules/annienexus/macro-data';
import {TradingViewEmbed} from './tradingview-embed';
import './sectors.css';
export function SectorsWorkspace({snapshot}:{snapshot:MacroSnapshot|null}){
 const [selected,setSelected]=useState<SectorSymbol[]>(['XLY','XLP']);
 const [message,setMessage]=useState('');
 const row=snapshot?.treasury?.rows[0];
 function toggle(symbol:SectorSymbol){
  if(selected.includes(symbol)){if(selected.length===2){setMessage('Conserva dos sectores para compararlos en porcentajes. Añade un tercero antes de retirar uno.');return;}setSelected(selected.filter(s=>s!==symbol));}
  else{if(selected.length===3){setMessage('Puedes comparar hasta tres sectores. Retira uno antes de añadir otro.');return;}setSelected([...selected,symbol]);}setMessage('');
 }
 const quotes={width:'100%',height:'100%',symbolsGroups:[{name:'Sectores del S&P 500',symbols:SECTORS.map(s=>({name:`AMEX:${s.symbol}`,displayName:`${s.symbol} · ${s.name}`}))}],showSymbolLogo:false,isTransparent:false,colorTheme:'dark',locale:'es'};
 const chart={autosize:true,symbol:`AMEX:${selected[0]}`,interval:'D',timezone:'America/New_York',theme:'dark',style:'2',locale:'es',allow_symbol_change:false,calendar:false,details:false,hide_side_toolbar:true,hide_top_toolbar:true,hide_volume:true,save_image:false,withdateranges:false,backgroundColor:'#061d29',gridColor:'rgba(78,133,157,0.18)',compareSymbols:selected.slice(1).map(symbol=>({symbol:`AMEX:${symbol}`,position:'SameScale'})),studies:[]};
 const fmt=(n:number|undefined)=>n!==undefined&&Number.isFinite(n)?n.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}):'Sin dato';
 return <main id="main-content" className="main-content sectors-page">
  <div className="page-heading"><div><h1>Sectores y tipos</h1><p className="lead">Compara sectores y sigue el coste del dinero.</p></div><span className="tag amber">DATOS CON RETARDO</span></div>
  <p className="sector-preview-note">Precios y gráficos de TradingView con retardo. La comparación automática XLP/XLY aún no está disponible.</p>
  <div className="sectors-layout"><section className="panel sector-table-panel"><div className="section-heading"><h2>Sectores · cotizaciones</h2><span className="small muted">USD · datos con retardo</span></div>
   <div className="sector-quotes"><TradingViewEmbed kind="market-quotes" config={quotes} label="Cotizaciones de los seis sectores"/></div>
   <p className="small muted">Orden fijo, no clasificación por rendimiento. Cambio% muestra la variación de la sesión frente al cierre anterior.</p>
   <div className="sector-selection"><h3>Compara dos o tres sectores</h3><div className="sector-buttons">{SECTORS.map(s=><button key={s.symbol} className={`sector-choice ${s.family}`} aria-pressed={selected.includes(s.symbol)} onClick={()=>toggle(s.symbol)}><strong>{s.symbol}</strong><span>{s.name}</span><small>{s.family==='cyclical'?'Cíclico':'Defensivo'}</small></button>)}</div><p role="status" className="sector-selection-status">{message||'El color identifica la familia; no indica si el precio sube o baja.'}</p></div>
  </section><section className="panel sector-chart-panel"><div className="section-heading"><h2>Comparar evolución</h2><a href="#sector-method" className="source-link">Cómo leerlo ⓘ</a></div>
   <div className="sector-chart-controls"><span className="tag amber">DIARIO · PORCENTAJES</span><span className="small muted">{selected.join(' · ')}</span></div>
   <div className="sector-history"><TradingViewEmbed key={selected.join('-')} kind="advanced-chart" config={chart} label="Comparación diaria de sectores"/></div><p className="small muted">Un punto por sesión. El porcentaje se calcula desde el inicio del tramo visible, no frente al día anterior. Amplía o desplaza el gráfico para cambiar el tramo.</p><p className="small muted">El proveedor actualiza las cotizaciones con retardo; el punto de hoy puede cambiar hasta el cierre. Los días sin sesión no añaden un nuevo cierre.</p>
  </section></div>
  <div className="sector-context-grid"><section className="panel"><span className="sector-context-icon" aria-hidden="true">▥</span><div><h2>Tipo de la Fed</h2><strong className="sector-big-number">{fmt(FED_TARGET.lower)}–{fmt(FED_TARGET.upper)}%</strong><p>Rango objetivo · decisión 28/10/2026</p><a className="source-link" target="_blank" rel="noopener noreferrer" href={FED_TARGET.source}>Comunicado oficial ↗</a></div></section>
   <section className="panel"><span className="sector-context-icon" aria-hidden="true">▤</span><div><h2>Bonos del Tesoro</h2><strong className="sector-big-number">2A {fmt(row?.values[3])}% <span>│</span> 10A {fmt(row?.values[7])}%</strong><p>Rendimiento, no precio · {row?.date??'Sin observación'}</p>{snapshot?.treasury&&<a className="source-link" href={snapshot.treasury.source.url} target="_blank" rel="noopener noreferrer">Fuente y fecha del Tesoro ↗</a>}</div></section>
   <section className="panel"><span className="sector-context-icon" aria-hidden="true">♧</span><div><h2>Madera y forestal</h2><strong className="sector-big-number">WOOD</strong><p>Candidato por confirmar · empresas forestales.</p><a className="source-link" href="https://www.ishares.com/us/products/239752/ishares-global-timber-forestry-etf" target="_blank" rel="noopener noreferrer">No es el futuro de madera ↗</a></div></section></div>
  <details id="sector-method" className="panel sector-method"><summary>Cómo leer los sectores, el ratio y los tipos <span>+</span></summary><div>
   <p><b>XLP/XLY:</b> consumo básico dividido entre consumo discrecional. Si sube, XLP lidera en términos relativos; si baja, XLY lidera. Esto no mide directamente entradas o salidas de dinero.</p>
   <p>Verde: familia cíclica, más sensible a la actividad. Naranja: familia defensiva, vinculada a necesidades más estables. Correspondencia con los fragmentos de mentoría 13; no son señales de compra o venta.</p>
   <p>El rendimiento a dos años expresa lo que ofrece un bono; no es el tipo oficial que decide la Fed. El precio del bono y su rendimiento normalmente se mueven en sentidos opuestos.</p>
   <p>TradingView muestra precios de Cboe One con retardo para acciones y ETF de EE. UU. No se rotulan como cierre oficial consolidado de NYSE Arca. Conservamos su marca. El gráfico usa intervalo diario y comparación porcentual de dos o tres sectores. La tabla conserva el orden configurado y no se reordena automáticamente. La actualización del proveedor no equivale a una descarga diaria almacenada por AWNexus. El widget no permite exportar los datos: el ratio automático XLP/XLY, la base común calculada por AWNexus y los ajustes de dividendos siguen pendientes de una fuente con permiso.</p>
   <a className="source-link" href="https://www.tradingview.com/widget-docs/markets/north-america/" target="_blank" rel="noopener noreferrer">Cobertura del proveedor ↗</a><Link className="source-link" href="/annienexus/formacion">Abrir formación y mis apuntes →</Link>
  </div></details>
 </main>;
}
