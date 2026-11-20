"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECTOR_ANGLES = void 0;
exports.clockEvidenceKey = clockEvidenceKey;
exports.evaluateRegimeClock = evaluateRegimeClock;
const regime_clock_review_json_1 = __importDefault(require("./regime-clock-review.json"));
const economic_reading_1 = require("./economic-reading");
const economic_calendar_1 = require("./economic-calendar");
// Angles name a sector. They do not measure the relative magnitudes of unlike series.
exports.SECTOR_ANGLES = { growth_prices_up: 45, growth_down_prices_up: -45, growth_prices_easing: -135, growth_up_prices_easing: 135 };
function clockEvidenceKey(input) {
    return JSON.stringify({ economic: (0, economic_reading_1.activityEvidenceKey)(input), weekly: economic_calendar_1.ECONOMIC_EVENTS.filter(e => e.result).map(e => ({ id: e.id, period: e.period, result: e.result })) });
}
function evaluateRegimeClock(input, now, review = regime_clock_review_json_1.default) {
    const time = Date.parse(now), cut = Date.parse(review?.cut ?? ""), reviewed = Date.parse(review?.reviewedAt ?? ""), due = Date.parse(review?.reviewBy ?? "");
    if (!review || !Number.isFinite(time) || !Number.isFinite(cut) || !Number.isFinite(reviewed) || !Number.isFinite(due) || reviewed < cut || due <= reviewed || time < reviewed || !Object.hasOwn(exports.SECTOR_ANGLES, review.zone) || !review.evidenceKey || !review.growth || !review.inflation || !review.rationale || review.contradictions.length === 0 || review.evidence.length === 0 || review.evidence.some(e => !e.name || !e.period || !e.comparison || !/^https:\/\//.test(e.url) || !Number.isFinite(Date.parse(e.checkedAt)) || Date.parse(e.checkedAt) > reviewed || (e.publishedAt !== null && (!Number.isFinite(Date.parse(e.publishedAt)) || Date.parse(e.publishedAt) > Date.parse(e.checkedAt))))) {
        return { status: "unavailable", angle: null, zone: null, label: "Revisión no disponible", explanation: "Falta una revisión fechada y verificable de ambos ejes.", review: null };
    }
    const matches = !!input && clockEvidenceKey(input) === review.evidenceKey;
    const current = matches && time < due;
    return { status: current ? "provisional" : "historical", angle: exports.SECTOR_ANGLES[review.zone], zone: review.zone, review,
        label: current ? "Orientación provisional" : "Última orientación fechada",
        explanation: current ? "Mercado mixto. La manecilla resume las ventanas indicadas; otras señales discrepan. No confirma un régimen completo." : !matches ? "Los insumos cambiaron o faltan. Se conserva la última orientación revisada; no representa una lectura actual." : "Llegó la siguiente revisión prevista. Se conserva la última orientación fechada hasta contrastar las nuevas publicaciones." };
}
