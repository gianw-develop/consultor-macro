"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FED_DECISIONS = exports.FED_PREVIOUS = exports.FED_CALENDAR_URL = exports.FED_NEXT_DECISION = exports.FED_TARGET = exports.SECTORS = void 0;
/** Families documented in mentoring 13; not price-change signals. */
exports.SECTORS = [
    { symbol: 'XLK', name: 'Tecnología', family: 'cyclical' },
    { symbol: 'XLF', name: 'Finanzas', family: 'cyclical' },
    { symbol: 'XLY', name: 'Consumo discrecional', family: 'cyclical' },
    { symbol: 'XLP', name: 'Consumo básico', family: 'defensive' },
    { symbol: 'XLC', name: 'Comunicación', family: 'cyclical' },
    { symbol: 'XLU', name: 'Servicios públicos', family: 'defensive' },
];
exports.FED_TARGET = { lower: 3.75, upper: 4, decision: '2026-10-28', checkedAt: '2026-10-29T08:57:06Z', source: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm', action: 'Mantiene' };
// Próxima reunión según el calendario FOMC 2026 (8–9 dic, comunicado 14:00 ET).
exports.FED_NEXT_DECISION = '2026-12-09T19:00:00Z';
exports.FED_CALENDAR_URL = 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm';
exports.FED_PREVIOUS = { lower: 3.75, upper: 4, decision: '2026-09-16', checkedAt: '2026-10-21', source: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm', action: 'Sube 0,25 pp' };
/** Each decision retains its own source and review date. */
exports.FED_DECISIONS = [{ lower: 3.5, upper: 3.75, decision: '2026-07-29', checkedAt: '2026-10-21', source: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260729a.htm', action: 'Mantiene' }, exports.FED_PREVIOUS, exports.FED_TARGET];
