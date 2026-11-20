"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingContext = getPendingContext;
const core_1 = require("../../contracts/core");
const envelope_1 = require("../../shared/server/envelope");
function getPendingContext(horizon, clock) {
    return (0, envelope_1.unavailable)({
        horizon, contextVersion: null, asOf: null, modelVersion: null, dominantVariable: null, story: null, causalLinks: [],
        theses: core_1.INDEX_IDS.map((indexId) => ({
            indexId, direction: "not_evaluated", narrative: null, supports: [], contradictions: [],
            changeConditions: [], sources: [], asOf: null,
        })),
    }, "Fuentes y motor de tesis pendientes de conexión y validación.", clock);
}
