/** Families documented in mentoring 13; not price-change signals. */
export const SECTORS = [
 {symbol:'XLK',name:'Tecnología',family:'cyclical'},
 {symbol:'XLF',name:'Finanzas',family:'cyclical'},
 {symbol:'XLY',name:'Consumo discrecional',family:'cyclical'},
 {symbol:'XLP',name:'Consumo básico',family:'defensive'},
 {symbol:'XLC',name:'Comunicación',family:'cyclical'},
 {symbol:'XLU',name:'Servicios públicos',family:'defensive'},
] as const;
export type SectorSymbol = typeof SECTORS[number]['symbol'];
export const FED_TARGET={lower:3.75,upper:4,decision:'2026-10-28',checkedAt:'2026-10-29T08:57:06Z',source:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm',action:'Mantiene'};
// Próxima reunión según el calendario FOMC 2026 (8–9 dic, comunicado 14:00 ET).
export const FED_NEXT_DECISION='2026-12-09T19:00:00Z';
export const FED_CALENDAR_URL='https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm';
export const FED_PREVIOUS={lower:3.75,upper:4,decision:'2026-09-16',checkedAt:'2026-10-21',source:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm',action:'Sube 0,25 pp'};
/** Each decision retains its own source and review date. */
export const FED_DECISIONS=[{lower:3.5,upper:3.75,decision:'2026-07-29',checkedAt:'2026-10-21',source:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260729a.htm',action:'Mantiene'},FED_PREVIOUS,FED_TARGET];
