"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemClock = exports.INDEX_IDS = exports.HORIZON_LABELS = exports.HORIZONS = void 0;
exports.isHorizon = isHorizon;
exports.HORIZONS = ["today", "week", "one_to_three_months", "three_to_six_months"];
exports.HORIZON_LABELS = {
    today: "Hoy", week: "Esta semana", one_to_three_months: "1–3 meses", three_to_six_months: "3–6 meses",
};
exports.INDEX_IDS = ["DJIA", "SP500", "NDX"];
const systemClock = () => new Date();
exports.systemClock = systemClock;
function isHorizon(value) {
    return exports.HORIZONS.some((horizon) => horizon === value);
}
