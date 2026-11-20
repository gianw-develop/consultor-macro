/** Dated official observations. No automatic regime or market-direction classification. */
export type PillarPoint = { period: string; value: number | null };
export type RetailPoint = { period: string; nominal: number | null; cpi: number | null; real: number | null };
export const PILLARS_CHECKED_AT = "2026-10-20T23:15:45Z";
export const RETAIL_RELEASED_AT = "2026-10-15";
export const RETAIL_REVISED_AT = "2026-10-15";
export const CPI_RELEASED_AT = "2026-10-14"; // September IPC, same period as the retail calculation.
export const INFLATION_RELEASED_AT = "2026-10-14T12:30:00Z";
export const INFLATION_CHECKED_AT = "2026-10-15T09:07:17Z";
export const INFLATION_URL = "https://www.bls.gov/news.release/archives/cpi_10142026.htm";
export const CLAIMS_RELEASED_AT = "2026-10-29T12:30:00Z";
export const CLAIMS_CHECKED_AT = "2026-11-04T15:52:00Z";
export const CLAIMS_URL = "https://www.dol.gov/ui/data.pdf";
export const CLAIMS_REVISION = "Semana del 17/10 revisada: iniciales 194.000→195.000; media 197.750→198.000. Semana 24/10: 194.000 y media 196.750. Corte DOL del 29/10.";
export const nominalRetail: PillarPoint[] = [{"period": "2025-08", "value": 700407}, {"period": "2025-09", "value": 700948}, {"period": "2025-10", "value": 700790.0}, {"period": "2025-11", "value": 705453.0}, {"period": "2025-12", "value": 706264.0}, {"period": "2026-01", "value": 701860.0}, {"period": "2026-02", "value": 707959.0}, {"period": "2026-03", "value": 719700.0}, {"period": "2026-04", "value": 723921.0}, {"period": "2026-05", "value": 731415.0}, {"period": "2026-06", "value": 732898.0}, {"period": "2026-07", "value": 729915}, {"period": "2026-08", "value": 739322}, {"period": "2026-09", "value": 745021}];
export const consumerPrices: PillarPoint[] = [{"period": "2025-08", "value": 323.291}, {"period": "2025-09", "value": 324.245}, {"period": "2025-10", "value": null}, {"period": "2025-11", "value": 325.063}, {"period": "2025-12", "value": 326.031}, {"period": "2026-01", "value": 326.588}, {"period": "2026-02", "value": 327.46}, {"period": "2026-03", "value": 330.293}, {"period": "2026-04", "value": 332.407}, {"period": "2026-05", "value": 333.979}, {"period": "2026-06", "value": 332.568}, {"period": "2026-07", "value": 332.813}, {"period": "2026-08", "value": 334.131}, {"period": "2026-09", "value": 336.298}];
// Rounded monthly rates published in BLS September Table A, seasonally adjusted.
export const cpiMonthlyRates: PillarPoint[] = [
 {period:"2026-03",value:0.9},{period:"2026-04",value:0.6},{period:"2026-05",value:0.5},
 {period:"2026-06",value:-0.4},{period:"2026-07",value:0.1},{period:"2026-08",value:0.4},{period:"2026-09",value:0.6}
];
// DOL 29 October vintage, verified on 4 November. Counts, not rates.
export const weeklyClaims = [
 {period:"2026-09-26",initial:199000,average:200500},
 {period:"2026-10-03",initial:198000,average:198250},
 {period:"2026-10-10",initial:200000,average:198750},
 {period:"2026-10-17",initial:195000,average:198000},
 {period:"2026-10-24",initial:194000,average:196750}
];
export function deflateRetail(nominal: PillarPoint[], prices: PillarPoint[], nominalAdjustment = "SA", priceAdjustment = "SA"): RetailPoint[] {
 if(nominalAdjustment !== "SA" || priceAdjustment !== "SA") throw new Error("Se necesitan dos series mensuales ajustadas por estacionalidad");
 for(const points of [nominal,prices]) {
  const seen=new Set<string>();
  for(const point of points) {
   if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(point.period)||seen.has(point.period)) throw new Error("Periodo mensual inválido o duplicado");
   if(point.value!==null&&(!Number.isFinite(point.value)||point.value<=0)) throw new Error("Nivel inválido para deflactar");
   seen.add(point.period);
  }
 }
 return [...nominal].sort((a,b)=>a.period.localeCompare(b.period)).map(point=>{
  const cpi=prices.find(p=>p.period===point.period)?.value??null;
  return {period:point.period,nominal:point.value,cpi,real:point.value!==null&&cpi!==null?point.value/cpi*100:null};
 });
}
export function monthlyRate(points: PillarPoint[]): number | null {
 const ordered=[...points].sort((a,b)=>a.period.localeCompare(b.period));
 const last=ordered.at(-1); if(!last||last.value===null) return null;
 const date=new Date(last.period+"-01T00:00:00Z"); date.setUTCMonth(date.getUTCMonth()-1);
 const previous=ordered.find(p=>p.period===date.toISOString().slice(0,7));
 return previous?.value&&Number.isFinite(last.value)?(last.value/previous.value-1)*100:null;
}
export const realRetail = deflateRetail(nominalRetail, consumerPrices);

/** Month labels use UTC explicitly, so western time zones cannot shift them backwards. */
export function pillarMonthLabel(period: string): string {
 return new Intl.DateTimeFormat("es-ES", {month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(period+"-01T00:00:00Z")).replace(" de "," ");
}
export const recentRetailRates = realRetail.slice(-3).map(point => ({
 period:point.period,
 nominal:monthlyRate(nominalRetail.filter(p=>p.period<=point.period)),
 real:monthlyRate(realRetail.filter(p=>p.period<=point.period).map(p=>({period:p.period,value:p.real})))
}));
