import { FED_TARGET } from "./sectors-data";
import type { MacroSnapshot, MonthlySeries } from "./macro-data";
import { recentRetailRates, weeklyClaims, cpiMonthlyRates, PILLARS_CHECKED_AT, RETAIL_RELEASED_AT, RETAIL_REVISED_AT, CPI_RELEASED_AT, INFLATION_RELEASED_AT, INFLATION_CHECKED_AT, INFLATION_URL, CLAIMS_RELEASED_AT, CLAIMS_CHECKED_AT, CLAIMS_URL, CLAIMS_REVISION } from "./economic-pillars-data";
import { m1Growth, M1_CHECKED_AT, M1_AVAILABLE_FROM } from "./m1-data";
import type { ReadingInput, ReadingSeries, ReadingSource } from "./economic-reading";
import employmentRelease from "./employment-release.json";
import activityReview from "./activity-review.json";

import { TCB_URL, TCB_CHECKED_AT, GDP_URL, GDP_RELEASED_AT, GDP_CHECKED_AT, tcbData, gdpData } from "./reviewed-observations";
const reviewedAt="2026-10-20T23:15:45Z";
const source=(name:string,url:string,publishedAt:string|null,checkedAt:string,revision?:string):ReadingSource=>({name,url,publishedAt,checkedAt,revision});
function monthly(s:MonthlySeries|null|undefined,id:string,name:string):ReadingSeries {
 return {id:s?.id??id,name,unit:s?.unit??"puntos de índice; tendencia = 100",frequency:"month",points:s?.points??[],source:s?{name:s.source.name,url:s.source.url,publishedAt:s.source.publishedAt,checkedAt:s.source.fetchedAt,revision:"Versión revisada consultada; no es una serie de lo conocido históricamente."}:source("Fuente ausente","",null,reviewedAt)};
}
export function makeReadingInput(snapshot:MacroSnapshot|null):ReadingInput {
 const tcbSource=source("Conference Board · LEI y CEI",TCB_URL,tcbData.releasedAt,TCB_CHECKED_AT,"Julio y agosto revisados; septiembre preliminar. LEI julio +0,2→+0,3 %. Algunas series componentes son estimaciones del proveedor.");
 const nfp=monthly(snapshot?.nfp,"CES0000000001","NFP · empleo observado");
 if(nfp.points.at(-1)?.period==="2026-08")nfp.source={...nfp.source,url:"https://www.bls.gov/news.release/archives/empsit_09042026.htm",publishedAt:"2026-09-04T12:30:00Z"};
 if(nfp.points.at(-1)?.period===employmentRelease.period)nfp.source={...nfp.source,url:employmentRelease.url,publishedAt:employmentRelease.publishedAt,revision:"Julio +21→−10 mil; agosto +162→+133 mil. Cambios revisados −60 mil en conjunto; niveles API recalculados."};
 const laborSource=source("BLS · encuestas de hogares y establecimientos",employmentRelease.url,employmentRelease.publishedAt,employmentRelease.checkedAt,"A1: ajustado por estacionalidad. Horas: promedio semanal privado, B2.");
 const labor=(key:"unemployment"|"participation"|"hours",name:string,unit:string):ReadingSeries=>({id:"BLS."+key,name,unit,frequency:"month",points:employmentRelease[key],source:laborSource});
 const treasury=(index:number,name:string):ReadingSeries=>({id:`UST.${index===3?"2Y":"10Y"}`,name,unit:"% de rendimiento",frequency:"day",points:(snapshot?.treasury?.rows??[]).slice(0,5).reverse().map(r=>({period:r.date,value:r.values[index]??null})),source:source("Tesoro · rendimientos par",snapshot?.treasury?.source.url??"",snapshot?.treasury?.rows[0]?.date??null,snapshot?.treasury?.source.fetchedAt??reviewedAt)});
 const input:ReadingInput={
 cut:[snapshot?.capturedAt??"",PILLARS_CHECKED_AT,INFLATION_CHECKED_AT,CLAIMS_CHECKED_AT,M1_CHECKED_AT,reviewedAt,TCB_CHECKED_AT,employmentRelease.checkedAt].sort((a,b)=>Date.parse(a)-Date.parse(b)).at(-1)!,review:activityReview as ReadingInput["review"],
 claims:{id:"DOL.IC4WSA",name:"Solicitudes · media 4 semanas",unit:"personas",frequency:"week",points:weeklyClaims.map(p=>({period:p.period,value:p.average})),source:source("DOL · solicitudes ajustadas por estacionalidad",CLAIMS_URL,CLAIMS_RELEASED_AT,CLAIMS_CHECKED_AT,CLAIMS_REVISION)},
 retail:{id:"RSAFS/CPIAUCSL.MoM",name:"Ventas reales · consumo",unit:"% mensual",frequency:"month",points:recentRetailRates.map(p=>({period:p.period,value:p.real})),source:source("Census y BLS / FRED · RSAFS ÷ CPIAUCSL","https://fred.stlouisfed.org/series/RSAFS",RETAIL_RELEASED_AT,PILLARS_CHECKED_AT,`Ventas revisadas ${RETAIL_REVISED_AT}; IPC publicado ${CPI_RELEASED_AT}. Cociente exacto de tasas, no resta.`)},
 money:{id:"M1SL/CPIAUCSL.6M",name:"M1 real · dinero disponible",unit:"% en seis meses",frequency:"month",points:m1Growth,source:source("Fed y BLS / FRED · M1SL ÷ CPIAUCSL","https://fred.stlouisfed.org/series/M1SL",M1_AVAILABLE_FROM,M1_CHECKED_AT,"Crecimiento semestral no anualizado; últimos datos revisados. Fórmula de AWNexus, equivalencia exacta al gráfico de clase pendiente.")},
 cli:monthly(snapshot?.cli?.USA,"OECD.CLI.USA","CLI · EE. UU."),cliG7:monthly(snapshot?.cli?.G7,"OECD.CLI.G7","CLI G7"),cliG20:monthly(snapshot?.cli?.G20,"OECD.CLI.G20","CLI G20"),
 lei:{id:"TCB.LEI.MoM",name:"LEI · señales tempranas",unit:"% mensual",frequency:"month",points:tcbData.lei.rates.map((value,i)=>({period:tcbData.periods[i],value})),source:tcbSource},
 cei:{id:"TCB.CEI.MoM",name:"CEI · actividad presente",unit:"% mensual",frequency:"month",points:tcbData.cei.rates.map((value,i)=>({period:tcbData.periods[i],value})),source:tcbSource},
 gdp:{id:"BEA.GDP.real.qoq.saar",name:"PIB real",unit:"% trimestral anualizado",frequency:"quarter",points:gdpData,source:source("BEA · PIB real",GDP_URL,GDP_RELEASED_AT,GDP_CHECKED_AT,"Avance T3: +3,4 % trimestral anualizado; T2 +2,2 %. Primera estimación revisable. T1 conserva la revisión del 30/09.")},
 inflation:{id:"BLS.CPI.all.MoM",name:"IPC · presión mensual",unit:"% mensual",frequency:"month",points:cpiMonthlyRates,source:source("BLS · IPC general ajustado por estacionalidad",INFLATION_URL,INFLATION_RELEASED_AT,INFLATION_CHECKED_AT,"Tasas mensuales redondeadas. Septiembre: general +0,6 % mensual y +3,7 % anual; subyacente +0,3 % mensual y +2,6 % anual.")},
 inflationAnnual:{id:"BLS.CPI.all.YoY",name:"IPC general interanual",unit:"% interanual",frequency:"month",points:[{period:"2026-07",value:3.4},{period:"2026-08",value:3.4},{period:"2026-09",value:3.7}],source:source("BLS · IPC general interanual",INFLATION_URL,INFLATION_RELEASED_AT,INFLATION_CHECKED_AT)},
 nfp,laborContext:{unemployment:labor("unemployment","Desempleo","%"),participation:labor("participation","Participación laboral","%"),hours:labor("hours","Horas semanales privadas","horas")},treasury2:treasury(3,"Rendimiento 2 años"),treasury10:treasury(7,"Rendimiento 10 años"),ceiSixMonth:tcbData.cei.six,ceiComponentsSixMonth:tcbData.cei.componentDirections,
 fedTarget:{lower:FED_TARGET.lower,upper:FED_TARGET.upper,period:FED_TARGET.decision,source:source("Fed · rango objetivo, no tipo efectivo",FED_TARGET.source,"2026-10-28T18:00:00Z",FED_TARGET.checkedAt,"Decisión del 28 de octubre: mantiene 3,75–4,00 %, por 10 votos a 2.")},
 };
 return input;
}
