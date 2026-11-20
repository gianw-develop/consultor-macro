/** Price-level translation only. No broker feed, trading or macro regime rules. */
export const CALCULATOR_INSTRUMENTS = [
  {symbol:"SPX", destination:"US500.cash", kind:"Índice", method:"basis", unit:"puntos"},
  {symbol:"DIA", destination:"US30.cash", kind:"ETF", method:"affine", unit:"puntos"},
  {symbol:"GLD", destination:"XAUUSD", kind:"ETF", method:"affine", unit:"USD/onza"},
  {symbol:"QQQ", destination:"US100.cash", kind:"ETF", method:"affine", unit:"puntos"},
] as const;
export type CalculatorSymbol = typeof CALCULATOR_INSTRUMENTS[number]["symbol"];
export const LEVEL_TYPES = ["Nivel", "Call Wall", "Put Wall", "Gamma Flip / Q Flip", "GEX", "DEX", "Soporte", "Resistencia", "Liquidez", "Open Interest", "Flujo institucional"] as const;
export type LevelType = typeof LEVEL_TYPES[number];
export type Level = {symbol:CalculatorSymbol; price:number; type:LevelType};
export type Quote = {at:string; source:string; sessionStart:string; sessionEnd:string; bid?:number; ask?:number; value?:number};
export type QuotePair = {origin:Quote; cfd:Quote};
export type Calibration = {
  version:1; symbol:CalculatorSymbol; destination:string; venue:"FTMO";
  /** No futures proxy: requires a separate, explicitly supported contract/basis model. */
  market:"cash"; tickSize:number; specificationSource:string; specificationAt:string;
  continuity:string; evidence:"manual"; pairs:QuotePair[];
};
export const POLICY = {maxAgeMs:120_000, maxSkewMs:2_000, windowMs:3_600_000, maxSpreadBps:10, maxErrorBps:10, minSpanFraction:0.001} as const;
export type Conversion = {value:number|null; error:string; estimatedError?:number; low?:number; high?:number; at?:string; sources?:string[]; method?:string; count?:number; range?:[number,number]; reference?:number; tickSize?:number};
export const initialCalibration = ():Partial<Record<CalculatorSymbol,Calibration>> => ({});
export function emptyTargets():Record<CalculatorSymbol,string> {return {SPX:"",DIA:"",GLD:"",QQQ:""};}
export function instrument(symbol:unknown) {return CALCULATOR_INSTRUMENTS.find(i=>i.symbol===symbol);}
/** Reject ambiguous thousands notation (7.700 / 7,700); require 7700 or 7700.00. */
export function parseCalculatorPrice(raw:string):number|null {
  const v=raw.trim();
  if(!/^\d+(?:[.,]\d+)?$/.test(v) || /^[1-9]\d{0,2}[.,]\d{3}$/.test(v))return null;
  const n=Number(v.replace(",","."));return Number.isFinite(n)&&n>0?n:null;
}
function finite(n:unknown):n is number {return typeof n==="number"&&Number.isFinite(n)&&n>0;}
function record(v:unknown):v is Record<string,unknown> {return !!v&&typeof v==="object"&&!Array.isArray(v);}
function text(v:unknown):v is string {return typeof v==="string"&&v.trim().length>0&&v.length<=300;}
function time(v:unknown):number {
  return typeof v==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+-]\d\d:\d\d)$/.test(v)?Date.parse(v):NaN;
}
const nyDateFormat=new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"});
const nySessionFormat=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
function nyDay(t:number) {return nyDateFormat.format(t);}
function regularUS(t:number) {
  const p=nySessionFormat.formatToParts(t);
  const val=(k:string)=>p.find(x=>x.type===k)!.value;
  const m=Number(val("hour"))*60+Number(val("minute"));
  return !["Sat","Sun"].includes(val("weekday"))&&m>=570&&m<960;
}
function quote(v:unknown,index:boolean,now:number):{mid:number; half:number; at:number; source:string} {
  if(!record(v)||!text(v.source))throw Error("Falta la fuente de una cotización.");
  const at=time(v.at),start=time(v.sessionStart),end=time(v.sessionEnd);
  if(![at,start,end].every(Number.isFinite)||at>now||now-at>POLICY.windowMs)throw Error("Cotización antigua, futura o fecha sin zona horaria.");
  if(start>at||end<=at||now<start||now>=end||end-start>24*3_600_000)throw Error("Sesión cerrada o ventana de negociación inválida. Verifica festivos y cierres especiales.");
  if(index){if(!finite(v.value)||v.bid!==undefined||v.ask!==undefined)throw Error("El índice requiere su valor publicado, no un bid/ask inventado.");return {mid:v.value,half:0,at,source:v.source};}
  if(!finite(v.bid)||!finite(v.ask)||v.ask<v.bid||v.value!==undefined)throw Error("ETF y CFD requieren bid y ask válidos (ask ≥ bid).");
  const mid=(v.bid+v.ask)/2,half=(v.ask-v.bid)/2;
  if(half*2/mid*10_000>POLICY.maxSpreadBps)throw Error("Spread demasiado amplio: más de 10 puntos básicos (0,10 %).");
  return {mid,half,at,source:v.source};
}
function fit(xs:number[],ys:number[],basis:boolean) {
  const mx=xs.reduce((a,b)=>a+b)/xs.length,my=ys.reduce((a,b)=>a+b)/ys.length;
  const xx=xs.reduce((a,b)=>a+(b-mx)**2,0);
  if(!basis&&xx<=0)throw Error("No hay variación suficiente para calibrar el ETF.");
  const slope=basis?1:xs.reduce((a,b,i)=>a+(b-mx)*(ys[i]-my),0)/xx;
  if(!finite(slope))throw Error("Relación de precios inestable o invertida.");
  return {slope,predict:(x:number)=>my+slope*(x-mx)};
}
/** All input is untrusted, including agent JSON. Manual evidence is NEVER called feed-verified. */
export function convertLevel(level:Level, calibration:unknown, now=Date.now(), side:"mid"|"bid"|"ask"="mid"):Conversion {
  try {
    const ins=instrument(level?.symbol);
    if(!ins||!finite(level.price)||!LEVEL_TYPES.includes(level.type)||!["mid","bid","ask"].includes(side)||!Number.isFinite(now))throw Error("Nivel, instrumento, tipo o lado de precio inválido.");
    if(!record(calibration))throw Error("Sin calibración. Añade cotizaciones emparejadas en Ajustes.");
    const c=calibration;
    if(c.version!==1||c.symbol!==ins.symbol||c.destination!==ins.destination||c.venue!=="FTMO"||c.market!=="cash"||c.evidence!=="manual")throw Error("La calibración no corresponde al instrumento y CFD FTMO. No se admiten futuros ni fuentes sustitutas.");
    if(!finite(c.tickSize)||c.tickSize<0.000001||c.tickSize>100||Math.abs(c.tickSize*1e6-Math.round(c.tickSize*1e6))>1e-6||!text(c.specificationSource)||!text(c.continuity))throw Error("Faltan tick mínimo, fuente de especificaciones o identificación de la serie/plataforma.");
    const specAt=time(c.specificationAt);
    if(!Number.isFinite(specAt)||specAt>now||now-specAt>7*86_400_000)throw Error("Verifica las especificaciones FTMO: fecha ausente o de más de 7 días.");
    const tickSize=c.tickSize;
    const basis=ins.method==="basis",minimum=basis?4:6;
    if(!Array.isArray(c.pairs)||c.pairs.length<minimum||c.pairs.length>100)throw Error(`Se necesitan entre ${minimum} y 100 pares sincronizados; los dos últimos validan el modelo.`);
    if(!regularUS(now))throw Error("Fuera de la sesión regular de EE. UU.; no se mezcla un índice/ETF cerrado con un CFD abierto.");
    const points=c.pairs.map((p:unknown)=>{
      if(!record(p))throw Error("Par de cotizaciones inválido.");
      const a=quote(p.origin,basis,now),b=quote(p.cfd,false,now);
      if([b.mid-b.half,b.mid+b.half].some(v=>Math.abs(v/tickSize-Math.round(v/tickSize))>1e-5))throw Error("Cotización CFD incompatible con su tick mínimo. Verifica la especificación y la fuente.");
      if(Math.abs(a.at-b.at)>POLICY.maxSkewMs)throw Error("Cotizaciones desincronizadas: diferencia superior a 2 segundos.");
      if(!regularUS(a.at)||!regularUS(b.at)||nyDay(a.at)!==nyDay(now)||nyDay(b.at)!==nyDay(now))throw Error("Mezcla de sesiones o fechas: toma todos los pares en la misma sesión regular.");
      return {x:a.mid,y:b.mid,hx:a.half,hy:b.half,at:Math.max(a.at,b.at),oldest:Math.min(a.at,b.at),skew:Math.abs(a.at-b.at),a:a.source,b:b.source};
    }).sort((a,b)=>a.at-b.at);
    if(new Set(points.map(p=>p.a)).size!==1||new Set(points.map(p=>p.b)).size!==1)throw Error("No mezcles proveedores/plataformas en una calibración.");
    if(points.some((p,i)=>i>0&&p.at-points[i-1].at<1000))throw Error("Pares duplicados o separados por menos de un segundo.");
    const last=points.at(-1)!;
    if(now-last.oldest>POLICY.maxAgeMs)throw Error("Calibración vencida: el último par supera 2 minutos. Actualiza las cotizaciones.");
    const train=points.slice(0,-2),check=points.slice(-2),xs=train.map(p=>p.x),ys=train.map(p=>p.y);
    const min=Math.min(...xs),max=Math.max(...xs),range=max-min;
    const maxHalf=Math.max(...points.map(p=>p.hx));
    if(range<Math.max(last.x*POLICY.minSpanFraction,maxHalf*40))throw Error("Muestra demasiado estrecha frente al precio o spread; recopila más puntos distintos.");
    if(level.price<min||level.price>max||check.some(p=>p.x<min||p.x>max))throw Error(`Fuera del rango validable (${min.toFixed(2)}–${max.toFixed(2)}). Amplía la muestra; no se extrapola.`);
    const model=fit(xs,ys,basis);
    const loo=train.map((p,i)=>{const other=train.filter((_,j)=>i!==j);return fit(other.map(q=>q.x),other.map(q=>q.y),basis);});
    const slopeRisk=Math.max(...loo.map(m=>Math.abs(m.predict(level.price)-model.predict(level.price))));
    const residual=Math.max(...points.map(p=>Math.abs(p.y-model.predict(p.x))),...train.map((p,i)=>Math.abs(p.y-loo[i].predict(p.x))));
    const spread=Math.max(...points.map(p=>p.hy+model.slope*p.hx));
    // Observed local speed is a safety allowance, NOT a guarantee against future jumps.
    const speed=Math.max(...points.slice(1).map((p,i)=>Math.abs(p.y-points[i].y)/(p.at-points[i].at)));
    const lag=speed*(now-last.oldest+Math.max(...points.map(p=>p.skew)));
    const sideShift=side==="bid"?-last.hy:side==="ask"?last.hy:0;
    const predicted=model.predict(level.price)+sideShift;
    const tick=c.tickSize;
    const value=Number((Math.round(predicted/tick)*tick).toFixed(6));
    const rawError=residual+slopeRisk+spread+lag+tick/2;
    const estimatedError=Number((Math.ceil(rawError/tick)*tick).toFixed(6));
    if(!finite(value)||!finite(estimatedError)||estimatedError/value*10_000>POLICY.maxErrorBps)throw Error("Error estimado excesivo o modelo inestable (más de 0,10 %). Recalibra con mejores datos.");
    return {value,error:"",estimatedError,low:Number((Math.floor((value-estimatedError)/tick)*tick).toFixed(6)),high:Number((Math.ceil((value+estimatedError)/tick)*tick).toFixed(6)),at:new Date(last.oldest).toISOString(),sources:[last.a,last.b],method:basis?"Diferencia de base validada":"Ajuste lineal local validado",count:points.length,range:[min,max],reference:last.y+sideShift,tickSize:tick};
  } catch(e) {return {value:null,error:e instanceof Error?e.message:"Calibración inválida."};}
}
export function parseLevels(raw:string):Level[] {
  if(raw.length>100_000)throw Error("Entrada demasiado grande.");
  let values:unknown;
  if(raw.trim().startsWith("{")){
    const p:unknown=JSON.parse(raw);
    if(!record(p)||p.version!==1||!Array.isArray(p.levels))throw Error("JSON esperado: {version:1, levels:[{symbol,price,type}]}. GEX/DEX deben ser precios, no importes de exposición.");
    values=p.levels;
  } else {
    values=raw.split(/\r?\n/).filter(v=>v.trim()).map((line,i)=>{
      const parts=line.split(";").map(v=>v.trim());
      const price=(parts.length===2||parts.length===3)?parseCalculatorPrice(parts[1]):null;
      if(price===null)throw Error(`Línea ${i+1}: usa símbolo;precio sin separadores de miles. Ejemplo: SPX;7700.`);
      return {symbol:parts[0],price,type:parts[2]??"Nivel"};
    });
  }
  if(!Array.isArray(values)||values.length===0||values.length>200)throw Error("Introduce entre 1 y 200 niveles.");
  return values.map((v:unknown)=>{
    if(!record(v)||!instrument(v.symbol)||!finite(v.price)||!LEVEL_TYPES.includes(v.type as LevelType)||Object.keys(v).some(k=>!["symbol","price","type"].includes(k)))throw Error("Cada nivel requiere solo symbol, price numérico positivo y type admitido. No se convierten cantidades GEX/DEX.");
    return {symbol:v.symbol as CalculatorSymbol,price:v.price,type:v.type as LevelType};
  });
}
export function readCalibration(raw:string,symbol:CalculatorSymbol):Calibration {
  if(raw.length>200_000)throw Error("Calibración demasiado grande.");
  const c:unknown=JSON.parse(raw);
  if(!record(c)||c.version!==1||c.symbol!==symbol||!Array.isArray(c.pairs))throw Error(`Se esperaba una calibración versión 1 para ${symbol}.`);
  // Full validation is performed on every conversion, not merely at import time.
  return c as Calibration;
}
export function calibrationTemplate(symbol:CalculatorSymbol):string {
  const ins=instrument(symbol)!;
  const q={at:"",source:"",sessionStart:"",sessionEnd:""};
  return JSON.stringify({version:1,symbol,destination:ins.destination,venue:"FTMO",market:"cash",tickSize:null,specificationSource:"",specificationAt:"",continuity:"",evidence:"manual",pairs:[{origin:{...q,...(ins.kind==="Índice"?{value:null}:{bid:null,ask:null})},cfd:{...q,bid:null,ask:null}}]},null,2);
}
