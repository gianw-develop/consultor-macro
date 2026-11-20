"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectObservations = collectObservations;
const observations_1 = require("./observations");
const coinbase_1 = require("./coinbase");
/** Server-side service. No route, session bypass, browser fetch or schedule is registered here. */
async function collectObservations(query, dependencies = {}) {
    if (!['stocks', 'crypto'].includes(query.assetClass) ||
        !['today', 'week', 'one_to_three_months', 'three_to_six_months'].includes(query.horizon))
        throw new Error('Invalid radar query');
    const clock = dependencies.clock ?? (() => new Date().toISOString());
    const load = dependencies.load ?? (async (instrument, now) => {
        if (instrument.assetClass !== 'crypto')
            return [];
        return (0, coinbase_1.fetchDailyCloses)(instrument, now, fetch, clock);
    });
    const analyses = [];
    for (const instrument of observations_1.INSTRUMENTS.filter(i => i.assetClass === query.assetClass)) {
        let rows = [];
        let failed = false;
        try {
            rows = await load(instrument, clock());
        }
        catch {
            failed = true;
            try {
                rows = dependencies.cached?.(instrument) ?? [];
            }
            catch {
                rows = [];
            }
        }
        const result = (0, observations_1.analyzeCloses)(instrument, rows, { now: clock(), horizon: query.horizon,
            maxAgeMs: instrument.assetClass === 'crypto' ? 2 * 86400000 : 4 * 86400000, context: query.context });
        result.limitations.push(instrument.assetClass === 'crypto'
            ? 'Cierres diarios de un mercado al contado; sin flujos ni derivados. Hoy describe el último día completo, no la sesión en curso.'
            : 'Conector de bolsa pendiente. Política provisional de antigüedad de 4 días; calendario y ajustes corporativos aún no integrados.');
        if (failed) {
            result.limitations.push('La fuente no respondió. Solo se conserva información anterior si fue proporcionada; no se inventan datos.');
            if (result.status === 'ok')
                result.status = 'partial';
        }
        analyses.push(result);
    }
    return (0, observations_1.toPlatformPage)(analyses, clock());
}
