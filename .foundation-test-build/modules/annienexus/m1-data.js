"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.M1_AVAILABLE_FROM = exports.m1Growth = exports.m1RealPoints = exports.realM1 = exports.m1Prices = exports.nominalM1 = exports.M1_CHECKED_AT = exports.M1_CPI_RELEASED_AT = exports.M1_RELEASED_AT = void 0;
exports.m1SixMonthGrowth = m1SixMonthGrowth;
const economic_pillars_data_1 = require("./economic-pillars-data");
exports.M1_RELEASED_AT = "2026-10-27";
exports.M1_CPI_RELEASED_AT = "2026-10-14";
exports.M1_CHECKED_AT = "2026-10-29T08:57:06Z";
// Current revised snapshot, not a real-time historical vintage.
exports.nominalM1 = [{ "period": "2025-08", "value": 18820.1 }, { "period": "2025-09", "value": 18883.8 }, { "period": "2025-10", "value": 18964.7 }, { "period": "2025-11", "value": 18998.1 }, { "period": "2025-12", "value": 19072.5 }, { "period": "2026-01", "value": 19165.1 }, { "period": "2026-02", "value": 19346 }, { "period": "2026-03", "value": 19381.2 }, { "period": "2026-04", "value": 19469 }, { "period": "2026-05", "value": 19689.2 }, { "period": "2026-06", "value": 19771.1 }, { "period": "2026-07", "value": 19863.6 }, { "period": "2026-08", "value": 19967.3 }, { "period": "2026-09", "value": 20061.2 }];
exports.m1Prices = [{ "period": "2025-08", "value": 323.291 }, { "period": "2025-09", "value": 324.245 }, { "period": "2025-10", "value": null }, { "period": "2025-11", "value": 325.063 }, { "period": "2025-12", "value": 326.031 }, { "period": "2026-01", "value": 326.588 }, { "period": "2026-02", "value": 327.46 }, { "period": "2026-03", "value": 330.293 }, { "period": "2026-04", "value": 332.407 }, { "period": "2026-05", "value": 333.979 }, { "period": "2026-06", "value": 332.568 }, { "period": "2026-07", "value": 332.813 }, { "period": "2026-08", "value": 334.131 }, { "period": "2026-09", "value": 336.298 }];
exports.realM1 = (0, economic_pillars_data_1.deflateRetail)(exports.nominalM1, exports.m1Prices);
/** Exact calendar window; do not compare across the May 2020 definition break. */
function m1SixMonthGrowth(points, period) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))
        throw new Error("Mes inválido");
    const date = new Date(period + "-01T00:00:00Z");
    date.setUTCMonth(date.getUTCMonth() - 6);
    const previousPeriod = date.toISOString().slice(0, 7);
    if (previousPeriod < "2020-05" && period >= "2020-05")
        return null;
    const current = points.find(p => p.period === period)?.value;
    const previous = points.find(p => p.period === previousPeriod)?.value;
    if (current == null || previous == null || !Number.isFinite(current) || !Number.isFinite(previous) || current <= 0 || previous <= 0)
        return null;
    return (current / previous - 1) * 100;
}
exports.m1RealPoints = exports.realM1.map(p => ({ period: p.period, value: p.real }));
exports.m1Growth = exports.realM1.filter(p => p.period >= "2026-03").map(p => ({ period: p.period, value: m1SixMonthGrowth(exports.m1RealPoints, p.period) }));
// The derived observation cannot be available before either input's publication.
exports.M1_AVAILABLE_FROM = [exports.M1_RELEASED_AT, exports.M1_CPI_RELEASED_AT].sort().at(-1);
