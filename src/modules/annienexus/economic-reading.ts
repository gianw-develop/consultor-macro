/** AWNexus visual translation of documented observations, not a trading model.
 * No weights, probability, inferred missing values or votes from overlapping series.
 */
export type Tone = "green" | "red" | "neutral" | "mixed";
export type ReadingPoint = { period: string; value: number | null };
export type ReadingSource = { name: string; url: string; publishedAt: string | null; checkedAt: string; revision?: string };
export type ReadingSeries = { id: string; name: string; unit: string; frequency: "week" | "month" | "quarter" | "day"; points: ReadingPoint[]; source: ReadingSource };
export type Teaching = { lesson: string; mentorship: string; fragment: string; anchor: string; topic: string; rule: string };
export type Signal = {
 id: string; name: string; tone: Tone; direction: "up" | "down" | "flat" | "missing";
 stage: string; value: number | null; unit: string; period: string | null;
 comparison: string; explanation: string; limits: string[]; sources: ReadingSource[]; teaching: Teaching;
 observations: { label: string; value: number | null; unit: string; period: string }[];
};
export type ReadingInput = {
 cut: string; review: { state: "expansion" | "adverse"; evidenceKey: string; cut: string; reviewedAt: string; expiresAt: string; rationale: string; contradictions: string[] } | null; claims: ReadingSeries; retail: ReadingSeries; money: ReadingSeries;
 cli: ReadingSeries; cliG7: ReadingSeries; cliG20: ReadingSeries;
 lei: ReadingSeries; cei: ReadingSeries; gdp: ReadingSeries; inflation: ReadingSeries; inflationAnnual: ReadingSeries;
 nfp: ReadingSeries; laborContext: { unemployment:ReadingSeries; participation:ReadingSeries; hours:ReadingSeries } | null; treasury2: ReadingSeries; treasury10: ReadingSeries;
 ceiSixMonth: number | null; ceiComponentsSixMonth: (number | null)[];
 fedTarget: { lower: number | null; upper: number | null; period: string; source: ReadingSource };
};
export type EconomicReading = {
 version: 1; cut: string; evaluatedAt: string; signals: Signal[];
 body: { tone: Tone; title: string; explanation: string; evidence: string[]; limits: string[]; sources: ReadingSource[]; reviewedAt: string | null; expiresAt: string | null };
 axes: { growth: string; inflation: string; regime: string };
 warnings: string[];
};
export const ECONOMIC_COLORS: Record<Tone,string> = {green:"#42d7a1",red:"#fa6978",neutral:"#81aabc",mixed:"#e8b957"};
export const teaching = {
 early: {lesson:"source-12",mentorship:"2",fragment:"source-12-L632",anchor:"tema-76",topic:"Los tres pilares tempranos",rule:"Tres pilares tempranos: solicitudes, ventas reales y crecimiento de M1 real a seis meses. Contrastar dirección y continuidad; una observación no cambia el régimen."},
 cli: {lesson:"source-3",mentorship:"3",fragment:"source-3-L253",anchor:"tema-140",topic:"Nivel y dirección del CLI",rule:"Leer el nivel del CLI frente a 100 y su dirección por separado. Estar bajo tendencia no significa contracción absoluta."},
 employment: {lesson:"source-4",mentorship:"4",fragment:"source-4-L103",anchor:"tema-47",topic:"Empleo y fase del ciclo",rule:"NFP confirma la actividad: leer cambios, medias y revisiones junto al contexto laboral, sin convertir un mes en régimen."},
 activity: {lesson:"source-3",mentorship:"3",fragment:"source-3-L194",anchor:"tema-98",topic:"Señales tempranas y actividad presente",rule:"Los adelantados avisan; la actividad coincidente ayuda a confirmar o contradecir. No confundir ambos papeles."},
 inflation: {lesson:"source-1",mentorship:"9 · en curso",fragment:"source-1-L22",anchor:"tema-3",topic:"Origen de la inflación",rule:"Separar presiones de demanda y de oferta; leer inflación junto a actividad y reacción de la Fed."},
 bonds: {lesson:"source-13",mentorship:"7",fragment:"source-13-L130",anchor:"tema-32",topic:"Precio y rendimiento del bono",rule:"Precio y rendimiento del bono normalmente se mueven en sentidos opuestos. La causa y el régimen cambian la interpretación."},
} satisfies Record<string,Teaching>;
export const number = (v:number|null,d=2) => v===null||!Number.isFinite(v)?"Sin dato":v.toLocaleString("es-ES",{maximumFractionDigits:d});
const sign = (v:number|null):Signal["direction"] => v===null?"missing":v>1e-9?"up":v< -1e-9?"down":"flat";
function consecutive(a:string,b:string,f:ReadingSeries["frequency"]) {
 if(f==="quarter") { const [ay,aq]=a.split("-Q").map(Number),[by,bq]=b.split("-Q").map(Number); return by*4+bq-ay*4-aq===1; }
 const prior=new Date(a+(f==="month"?"-01T00:00:00Z":"T00:00:00Z"));
 if(f==="month") {prior.setUTCMonth(prior.getUTCMonth()+1);return prior.toISOString().slice(0,7)===b;}
 const days=(Date.parse(b)-prior.getTime())/86400000;
 return f==="week"?days===7:days>0&&days<=4; // Trading-day adjacency only; never used as economic persistence.
}
export function readingPeriod(period:string|null,frequency?:ReadingSeries["frequency"]):string {
 if(!period)return "sin dato";
 const quarter=/^(\d{4})-Q([1-4])$/.exec(period);
 if(quarter)return `${quarter[2]}.º trimestre de ${quarter[1]}`;
 const month=/^\d{4}-\d{2}$/.test(period);
 const date=new Date(period+(month?"-01T00:00:00Z":"T00:00:00Z"));
 if(!Number.isFinite(date.getTime()))return "periodo no válido";
 const text=date.toLocaleDateString("es-ES",{timeZone:"UTC",year:"numeric",month:"long",...(month?{}:{day:"numeric" as const})});
 return frequency==="week"?`semana terminada el ${text}`:text;
}
const finite=(value:number|null):value is number=>value!==null&&Number.isFinite(value);
function sensiblePeriod(period:string,frequency:ReadingSeries["frequency"],at:string) {
 if(frequency==="quarter") {const match=/^(\d{4})-Q([1-4])$/.exec(period);return !!match&&Date.UTC(Number(match[1]),Number(match[2])*3,1)<=Date.parse(at);}
 const month=frequency==="month";
 if(!(month?/^\d{4}-\d{2}$/:/^\d{4}-\d{2}-\d{2}$/).test(period))return false;
 const date=new Date(period+(month?"-01T00:00:00Z":"T00:00:00Z"));
 if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,month?7:10)!==period)return false;
 const end=month?Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,1):date.getTime();
 return end<=Date.parse(at);
}
function sourceUsable(source:ReadingSource,at:string) {
 const checked=Date.parse(source.checkedAt),published=source.publishedAt?Date.parse(source.publishedAt):null;
 return !!source.name&&/^https:\/\//.test(source.url)&&Number.isFinite(checked)&&checked<=Date.parse(at)&&
  (published===null||(Number.isFinite(published)&&published<=checked));
}
function usable(series:ReadingSeries,at:string) {
 const points=series.points;
 return !!series.id&&!!series.unit&&sourceUsable(series.source,at)&&
  points.every(p=>(p.value===null||Number.isFinite(p.value))&&sensiblePeriod(p.period,series.frequency,at))&&
  points.every((p,i)=>!i||p.period>points[i-1].period);
}
function changeLast(s:ReadingSeries,at:string) {
 if(!usable(s,at))return null;const a=s.points.at(-2),b=s.points.at(-1);
 const delta=!a||!b||a.value===null||b.value===null||!consecutive(a.period,b.period,s.frequency)?null:b.value-a.value;return finite(delta)?delta:null;
}
function run(s:ReadingSeries,at:string):number {
 const d=sign(changeLast(s,at));if(d==="missing"||d==="flat")return 0;
 let n=0;for(let end=s.points.length;end>1;end--){if(sign(changeLast({...s,points:s.points.slice(0,end)},at))!==d)break;n++;}return n;
}
function base(id:string,s:ReadingSeries,t:Teaching,at:string):Signal {
 const last=s.points.at(-1);const valid=usable(s,at);return {id,name:s.name,tone:"neutral",direction:"missing",stage:"Sin comparación",value:valid?last?.value??null:null,unit:s.unit,period:last?.period??null,comparison:"Falta una comparación válida.",explanation:"No se rellena la observación ausente.",limits:[],sources:[s.source],teaching:t,observations:[]};
}
function deltaSignal(id:string,s:ReadingSeries,t:Teaching,at:string,inverse=false):Signal {
 const result=base(id,s,t,at),delta=changeLast(s,at),d=sign(delta),n=run(s,at);
 result.direction=d;result.tone=d==="missing"||d==="flat"?"neutral":(d==="up")!==inverse?"green":"red";
 result.stage=d==="missing"?"Sin comparación":d==="flat"?"Sin cambio":n>1?`${n} cambios consecutivos` :"Indicio · última comparación";
 result.comparison=`${number(result.value)} frente a ${number(s.points.at(-2)?.value??null)} ${s.unit} (${readingPeriod(s.points.at(-2)?.period??null,s.frequency)}); diferencia ${number(delta)}.`;
 result.observations=(usable(s,at)?s.points.slice(-6):[]).map(p=>({label:s.name,...p,unit:s.unit}));
 return result;
}
export function activityEvidenceKey(input:ReadingInput):string {
 const {review: _review,...evidence}=input;
 void _review;
 return JSON.stringify(evidence);
}
export function evaluateEconomicReading(input:ReadingInput,at:string):EconomicReading {
 const claims=deltaSignal("claims",input.claims,teaching.early,at,true);
 claims.explanation=claims.direction==="down"?"Baja la media de solicitudes: menos despidos declarados, un alivio laboral temprano.":claims.direction==="up"?"Sube la media de solicitudes: más despidos declarados, una alerta laboral temprana.":"La media no muestra una dirección evaluable.";
 claims.limits=["No mide nuevas contrataciones. Forma parte del LEI y no suma un voto independiente.","El recuento de cambios describe lo observado; no establece un umbral de persistencia del profesor."];
 // Retail input is a real monthly rate: sign describes purchases, not acceleration of the rate.
 const retail=base("retail",input.retail,teaching.early,at);const rd=sign(retail.value);
 retail.direction=rd;retail.tone=rd==="missing"||rd==="flat"?"neutral":rd==="up"?"green":"red";retail.stage="Indicio · cambio mensual";
 retail.comparison=`Compras reales frente al mes anterior: ${number(retail.value)} %. Mes anterior: ${number(input.retail.points.at(-2)?.value??null)} %.`;
 retail.explanation=rd==="up"?"Las compras minoristas crecen descontando el IPC; el último mes aporta alivio al consumo.":rd==="down"?"Las compras minoristas caen descontando el IPC; el último mes muestra deterioro.":"No hay cambio real evaluable.";
 retail.limits=["No cubre todo el consumo. IPC general como ajuste aproximado de precios; cálculo de AWNexus.","Un rebote no demuestra una tendencia persistente. Ventas también están en CEI: no son otro voto."];
 retail.observations=(usable(input.retail,at)?input.retail.points.slice(-6):[]).map(p=>({label:"Cambio mensual real",...p,unit:"%"}));
 const money=deltaSignal("money",input.money,teaching.early,at);
 money.explanation=money.direction==="down"?`Pierde impulso el crecimiento semestral del dinero real. Su nivel sigue ${money.value!==null&&money.value>0?"sobre cero":"sin expansión positiva"}; perder impulso no equivale a contracción.`:money.direction==="up"?"Mejora el crecimiento semestral del dinero real; se distingue la mejora de estar ya sobre cero.":"No hay cambio semestral comparable.";
 money.limits=["No se comparan extremos que crucen el cambio de definición de mayo de 2020. Huecos conservados.","El cruce bajo cero es una alerta de clase pendiente de validación; no activa recesión ni operación."];
 const cli=deltaSignal("cli",input.cli,teaching.cli,at);
 cli.explanation=`CLI de EE. UU.: ${number(cli.value)} frente a la tendencia 100; ${cli.direction==="up"?"sube":cli.direction==="down"?"baja":"dirección no concluyente"}. El nivel relativo y el movimiento son cosas distintas.`;
 cli.limits=["No es una tasa de crecimiento del PIB. G7 y G20 tienen ámbitos distintos y se solapan.","No se usa el nivel 100 para declarar contracción absoluta ni se fija un ángulo del cuadrante."];
 if(!input.cli.source.publishedAt)cli.limits.push("La API no informa la fecha original de publicación. Dirección del corte consultado, no confirmación histórica en tiempo real.");
 for(const s of [input.cliG7,input.cliG20])cli.observations.push({label:s.name,period:s.points.at(-1)?.period??"",value:usable(s,at)?s.points.at(-1)?.value??null:null,unit:s.unit});
 const lei=base("lei",input.lei,teaching.activity,at);lei.direction=sign(lei.value);lei.tone=lei.direction==="up"?"green":lei.direction==="down"?"red":"neutral";lei.stage="Indicio · último mes";
 lei.observations=(usable(input.lei,at)?input.lei.points:[]).map(p=>({label:"Cambio mensual LEI",...p,unit:input.lei.unit}));
 lei.comparison=`Última variación mensual ${number(lei.value)} %; anterior ${number(input.lei.points.at(-2)?.value??null)} %.`;
 lei.explanation="LEI: conjunto de señales tempranas. El color describe su último cambio; no confirma un giro ni una recesión.";
 lei.limits=["Tasas redondeadas; tres meses casi planos no se transforman en una dirección cierta.","Incluye solicitudes, bolsa y curva: no se suman de nuevo como confirmaciones independientes."];
 const inflation=deltaSignal("inflation",input.inflation,teaching.inflation,at,true);
 inflation.explanation=inflation.direction==="up"?"La tasa mensual del IPC aumenta: más presión de precios en esta comparación.":inflation.direction==="down"?"La tasa mensual del IPC disminuye: alivio de presión en esta comparación; no garantiza una desinflación sostenida.":"No hay dirección de precios suficientemente comparable.";
 inflation.limits=["IPC general, no subyacente ni Sticky CPI. No se infiere la causa con esta serie.","El color es presión o alivio de precios, no efecto favorable o desfavorable sobre las acciones."];
 const nfp=base("employment",input.nfp,teaching.employment,at);
 const average=(months:number,offset=0)=>{const p=offset?input.nfp.points.slice(0,-offset):input.nfp.points;if(!usable(input.nfp,at)||p.length<=months)return null;const window=p.slice(-months-1);if(window.some((q,i)=>q.value===null||(i>0&&!consecutive(window[i-1].period,q.period,"month"))))return null;const result=(window.at(-1)!.value!-window[0].value!)/months;return Number.isFinite(result)?result:null;};
 const n3=average(3),n6=average(6);nfp.value=average(1);nfp.unit="mil empleos / mes";nfp.direction=sign(n3);nfp.tone=n3===null||n6===null?"neutral":n3>0&&n6>0?"green":n3<0&&n6<0?"red":"mixed";
 nfp.stage="Medias 3 y 6 meses";nfp.comparison=`Media 3 meses ${number(n3)}; media 6 meses ${number(n6)} mil empleos / mes.`;
 nfp.explanation="Creación o pérdida de empleos observada. Las medias son ventanas ya publicadas en Principal; no votos independientes del CEI.";
 nfp.limits=["No basta para valorar calidad, horas, salarios, participación o desempleo. Datos revisables."];
 nfp.observations=[{label:"Media 3 meses",value:n3,unit:nfp.unit,period:nfp.period??""},{label:"Media 6 meses",value:n6,unit:nfp.unit,period:nfp.period??""}];
 // A positive payroll average is a level of net hiring, not improvement.
 const context=input.laborContext;
 if(context&&Object.values(context).every(s=>usable(s,at)&&s.points.at(-1)?.period===nfp.period)){
  const u=changeLast(context.unemployment,at),part=changeLast(context.participation,at),hours=changeLast(context.hours,at);
  const prior=average(3,1);
  const slowing=n3!==null&&prior!==null&&n3<prior;
  nfp.tone=n3===null||n6===null||prior===null||u===null||part===null||hours===null?"neutral":(n3>0&&(u>0||slowing))||((n3>0)!==(n6>0))?"mixed":n3<0&&n6<0&&u>0?"red":n3>0&&n6>0&&u<=0&&part>=0&&hours>=0&&!slowing?"green":"mixed";
  nfp.stage=nfp.tone==="mixed"?"Indicio laboral mixto":"Lectura laboral descriptiva";
  nfp.explanation=`Media de creación neta: ${number(n3)} mil en 3 meses frente a ${number(prior)} en la ventana anterior. Desempleo ${number(context.unemployment.points.at(-1)?.value??null)} % (${number(u)} pp), participación ${number(context.participation.points.at(-1)?.value??null)} % (${number(part)} pp), horas ${number(context.hours.points.at(-1)?.value??null)}. ${slowing?"Menor impulso no equivale a destrucción neta.":"El signo de la media no basta para declarar mejora."}`;
  nfp.observations.push(...Object.values(context).map(s=>({label:s.name,period:s.points.at(-1)!.period,value:s.points.at(-1)!.value,unit:s.unit})));
  nfp.sources.push(context.unemployment.source);
 }else{nfp.tone="neutral";nfp.stage="Confirmación laboral incompleta";nfp.limits.push("Falta contexto compatible de desempleo, participación y horas; las medias positivas no se convierten en fortaleza confirmada.");}
 const annual=input.inflationAnnual;
 if(usable(annual,at)&&annual.points.at(-1)?.period===inflation.period){
  inflation.observations.push(...annual.points.slice(-2).map(p=>({label:"IPC general interanual",...p,unit:annual.unit})));
  inflation.limits.push(`La tasa interanual pasa de ${number(annual.points.at(-2)?.value??null)} % a ${number(annual.points.at(-1)?.value??null)} %. Un repunte mensual no demuestra aceleración anual. PCE y persistencia no se agregan sin una comparación común.`);
 }else inflation.limits.push("Falta una comparación interanual compatible; no se infiere a partir del dato mensual.");
 const bonds=deltaSignal("bonds",input.treasury10,teaching.bonds,at);bonds.name="Bonos y Fed";bonds.tone="neutral";bonds.stage="Causa sin resolver";
 const y2=usable(input.treasury2,at)?input.treasury2.points.at(-1):null,y10=input.treasury10.points.at(-1);const spread=y2?.period===y10?.period&&y2?.value!=null&&bonds.value!==null?bonds.value-y2.value:null;
 bonds.explanation=`10 años menos 2 años: ${number(spread)} puntos porcentuales. El movimiento no distingue por sí solo inflación, crecimiento o demanda de bonos.`;
 bonds.limits=["Sin causa documentada no se pinta como mejora o deterioro. Precio y rendimiento no son lo mismo.","Ni una curva positiva ni una bajada de tipos clasifican el régimen; no se aplica el umbral +2/0 como diagnóstico."];
 const fedValid=sourceUsable(input.fedTarget.source,at)&&sensiblePeriod(input.fedTarget.period,"day",at)&&finite(input.fedTarget.lower)&&finite(input.fedTarget.upper)&&input.fedTarget.lower<=input.fedTarget.upper;
 bonds.sources.push(input.fedTarget.source);bonds.observations=[{label:"Rendimiento 2 años",value:y2?.value??null,period:y2?.period??"",unit:"%"},{label:"Rendimiento 10 años",value:bonds.value,period:bonds.period??"",unit:"%"},{label:"Diferencial 10–2",value:spread,period:bonds.period??"",unit:"pp"},{label:"Fed · límite inferior",value:fedValid?input.fedTarget.lower:null,period:input.fedTarget.period,unit:"%"},{label:"Fed · límite superior",value:fedValid?input.fedTarget.upper:null,period:input.fedTarget.period,unit:"%"}];
 const signals=[claims,retail,money,cli,lei,inflation,nfp,bonds];
 // Broad observed activity only. CEI components are compatibility checks, not votes;
 // NFP, sales and leading series NEVER vote into the body. No recession dating.
 const c=input.cei.points.slice(-3),g=input.gdp.points.slice(-2),components=input.ceiComponentsSixMonth;
 const ready=usable(input.cei,at)&&usable(input.gdp,at)&&c.length===3&&g.length===2&&components.length===4&&[...c,...g].every(p=>p.value!==null)&&components.every(v=>v===-1||v===0||v===1)&&input.ceiSixMonth!==null&&Number.isFinite(input.ceiSixMonth)&&c.every((p,i)=>!i||consecutive(c[i-1].period,p.period,"month"))&&consecutive(g[0].period,g[1].period,"quarter");
 const expansion=ready&&c.every(p=>p.value!>0)&&g.every(p=>p.value!>0)&&components.every(v=>v!>0)&&input.ceiSixMonth!>0;
 const adverse=ready&&c.every(p=>p.value!<0)&&g.every(p=>p.value!<0)&&components.every(v=>v!<0)&&input.ceiSixMonth!<0;
 const reviewed=!!input.review&&input.review.cut===input.cut&&input.review.evidenceKey===activityEvidenceKey(input)&&Date.parse(input.review.reviewedAt)>=Date.parse(input.cut)&&Date.parse(input.review.reviewedAt)<=Date.parse(at)&&Date.parse(input.review.expiresAt)>Date.parse(at);
 const broadDirections=[...c.map(p=>p.value),...g.map(p=>p.value),...components,input.ceiSixMonth];
 const conflicting=ready&&broadDirections.some(v=>v!>0)&&broadDirections.some(v=>v!<0);
 const tone:Tone=reviewed&&input.review?.state==="expansion"&&expansion?"green":reviewed&&input.review?.state==="adverse"&&adverse?"red":conflicting?"mixed":"neutral";
 const body={tone,title:tone==="green"?"Actividad expansiva observada":tone==="red"?"Contracción de actividad observada":tone==="mixed"?"Actividad con señales mixtas":"Estado general no concluyente",explanation:tone==="green"?"PIB real y CEI muestran crecimiento en sus ventanas observadas. Las alertas tempranas pueden deteriorarse sin borrar esa expansión.":tone==="red"?"PIB real y CEI muestran caída amplia en sus ventanas observadas. Una vena de alivio no confirma todavía recuperación.":tone==="mixed"?"Las ventanas de actividad no son concordantes. Las venas conservan sus lecturas propias.":"Falta una revisión vigente y compatible con estos datos. No significa que la economía se haya vuelto mixta; las venas conservan sus lecturas propias.",evidence:[`PIB real: ${g.map(p=>`${readingPeriod(p.period)}: ${number(p.value)} % anualizado`).join("; ")}.`,`CEI: ${c.map(p=>`${readingPeriod(p.period)}: ${number(p.value)} % mensual`).join("; ")}; seis meses ${number(input.ceiSixMonth)} %.`,`Componentes CEI: ${components.filter(v=>v!==null&&v>0).length}/4 al alza en seis meses; no son votos añadidos.`],limits:[reviewed?`Lectura revisada por AWNexus; vigencia indicada abajo, salvo cambios de datos. ${input.review!.rationale}`:"Revisión cualitativa ausente, vencida o vinculada a otros datos. Esto no demuestra contradicción económica. No se automatiza el color general.",...(reviewed?input.review!.contradictions:[]),"Los tres meses de CEI, dos trimestres de PIB y cuatro componentes describen las pruebas de esta revisión; no son un umbral automático enseñado en el curso.","PIB y CEI comparten economía subyacente. No se suman puntos ni se cuentan otra vez NFP o ventas.","Ventanas de meses y trimestres con retraso y revisiones. No mide la sesión actual ni certifica recesión, beneficios o dirección de los índices."],sources:[input.cei.source,input.gdp.source],reviewedAt:input.review?.reviewedAt??null,expiresAt:input.review?.expiresAt??null};
 return {version:1,cut:input.cut,evaluatedAt:at,signals,body,axes:{growth:cli.explanation,inflation:inflation.explanation,regime:"Sin posición exacta: no hay una regla documentada de ángulo ni una clasificación conjunta validada."},warnings:signals.filter(s=>s.value===null).map(s=>`${s.name}: falta observación válida.`)};
}
