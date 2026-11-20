"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INSTRUMENTS = void 0;
exports.utc = utc;
exports.analyzeCloses = analyzeCloses;
exports.toPlatformPage = toPlatformPage;
exports.INSTRUMENTS = [
    { instrumentId: 'index:DJIA', symbol: 'DJIA', assetClass: 'stocks', market: 'US', instrumentType: 'index', unit: 'index_points' },
    { instrumentId: 'index:SP500', symbol: 'SP500', assetClass: 'stocks', market: 'US', instrumentType: 'index', unit: 'index_points' },
    { instrumentId: 'index:NDX', symbol: 'NDX', assetClass: 'stocks', market: 'US', instrumentType: 'index', unit: 'index_points' },
    { instrumentId: 'equity:XNAS:MSFT:USD', symbol: 'MSFT', assetClass: 'stocks', market: 'XNAS', instrumentType: 'equity', unit: 'USD' },
    ...['BTC', 'ETH', 'SOL'].map(symbol => ({ instrumentId: `spot:coinbase:${symbol}-USD`, symbol,
        assetClass: 'crypto', market: 'coinbase', instrumentType: 'spot', unit: 'USD' })),
];
function utc(value) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value))
        throw new Error('UTC timestamp required');
    const n = Date.parse(value);
    if (!Number.isFinite(n) || new Date(n).toISOString().slice(0, 19) !== value.slice(0, 19))
        throw new Error('Invalid UTC timestamp');
    return n;
}
const horizons = { today: 1, week: 7, one_to_three_months: 30, three_to_six_months: 90 };
const day = 86400000;
/** Describes observed prices only. No recommendation, macro thesis or probability. */
function analyzeCloses(instrument, rows, options) {
    const now = utc(options.now);
    const windowDays = horizons[options.horizon];
    if (!windowDays || !Number.isFinite(options.maxAgeMs) || options.maxAgeMs < 0)
        throw new Error('Invalid analysis policy');
    const result = { instrument, horizon: options.horizon, status: 'unavailable', asOf: null, availableAt: null,
        evaluatedAt: options.now, maxAgeMs: options.maxAgeMs, context: null,
        metrics: [], sources: [], reasons: [], limitations: ['Observación de precio; no valida una tesis fundamental ni una estrategia.'] };
    if (options.context) {
        const c = options.context;
        try {
            if (!c.contextVersion || !c.modelVersion || c.horizon !== options.horizon || c.status === 'unavailable' ||
                !['ok', 'partial', 'stale'].includes(c.status) || utc(c.dataAsOf) > utc(c.generatedAt) || utc(c.generatedAt) > now)
                throw new Error();
            result.context = { ...c };
        }
        catch {
            result.limitations.push('Contexto macro descartado: versión, fecha, disponibilidad u horizonte no compatible.');
        }
    }
    const byDate = new Map();
    const conflicts = new Set();
    let rejected = 0;
    for (const row of rows) {
        try {
            const date = utc(row.asOf), available = utc(row.availableAt);
            if (row.instrumentId !== instrument.instrumentId || row.unit !== instrument.unit || !Number.isFinite(row.value) || row.value <= 0 ||
                date > now || available > now || available < date || !row.source.id || !row.source.name ||
                (row.kind !== 'observation' && row.kind !== 'demonstration') || (row.kind === 'demonstration' && !options.allowDemo))
                throw new Error();
            for (const t of [row.source.publishedAt, row.source.observedAt])
                if (t && utc(t) > now)
                    throw new Error();
            if (byDate.has(row.asOf) || conflicts.has(row.asOf)) {
                byDate.delete(row.asOf);
                conflicts.add(row.asOf);
                throw new Error('Ambiguous duplicate close');
            }
            byDate.set(row.asOf, row);
        }
        catch {
            rejected++;
        }
    }
    if (rejected)
        result.limitations.push(`${rejected} registros rechazados por identidad, fecha, valor, duplicación o demostración.`);
    const valid = [...byDate.values()].sort((a, b) => utc(a.asOf) - utc(b.asOf));
    if (!valid.length) {
        result.limitations.push('No hay observaciones utilizables.');
        return result;
    }
    // Mixing real and demonstration rows would produce misleading returns.
    if (new Set(valid.map(row => row.kind)).size > 1) {
        result.limitations.push('No se mezclan observaciones reales y demostración.');
        return result;
    }
    const latest = valid[valid.length - 1];
    result.asOf = latest.asOf;
    const sources = new Map();
    const metric = (id, value, unit, used, description) => {
        used.forEach(row => {
            sources.set(row.source.id, row.source);
            if (!result.availableAt || utc(row.availableAt) > utc(result.availableAt))
                result.availableAt = row.availableAt;
        });
        return { id, value, unit, asOf: latest.asOf, kind: latest.kind, sourceIds: [...new Set(used.map(row => row.source.id))],
            method: { id, version: '0.1.0', description } };
    };
    result.metrics.push(metric('close', latest.value, instrument.unit, [latest], 'Último cierre observado del instrumento y mercado indicados.'));
    result.status = now - utc(latest.asOf) > options.maxAgeMs ? 'stale' : rejected ? 'partial' : 'ok';
    const target = utc(latest.asOf) - windowDays * day;
    // Explicit calendar horizon, not mislabeled trading sessions. No future or nearest-forward close.
    const prior = valid.filter(row => utc(row.asOf) <= target).pop();
    if (prior && target - utc(prior.asOf) <= 4 * day && Number.isFinite((latest.value / prior.value - 1) * 100)) {
        result.metrics.push(metric('calendar_price_change', (latest.value / prior.value - 1) * 100, '%', [prior, latest], `Cambio de precio: (cierre final / inicial - 1) × 100. Ventana objetivo ${windowDays} días naturales; inicio real ${prior.asOf}. No incluye dividendos, costes ni ejecución.`));
        result.reasons.push(`Evolución de precio observada en una ventana de ${windowDays} días naturales; no constituye una señal.`);
    }
    else {
        if (result.status !== 'stale')
            result.status = 'partial';
        result.limitations.push('Historial insuficiente para comparar este horizonte.');
    }
    if (result.status === 'stale')
        result.limitations.push('Dato antiguo según la política explícita de esta fuente.');
    if (latest.kind === 'demonstration')
        result.limitations.push('DEMO: datos sintéticos de prueba, no observaciones actuales.');
    result.sources = [...sources.values()];
    return result;
}
/** Shared v0.2 adapter preserves missing records; it never emits opportunities. */
function toPlatformPage(analyses, generatedAt) {
    const generated = utc(generatedAt);
    const sources = new Map();
    const warnings = ['Observaciones descriptivas; no son oportunidades detectadas ni una estrategia validada.'];
    const items = analyses.map(a => {
        if (utc(a.evaluatedAt) > generated)
            throw new Error('Envelope predates evaluation');
        a.sources.forEach(source => sources.set(source.id, source));
        const ageSeconds = a.asOf ? Math.max(0, (generated - utc(a.asOf)) / 1000) : null;
        const status = ageSeconds !== null && ageSeconds * 1000 > a.maxAgeMs ? 'stale' : a.status;
        return { ...a.instrument, id: `${a.instrument.instrumentId}:${a.horizon}`, recordType: 'observation',
            asOf: a.asOf, availableAt: a.availableAt, horizon: a.horizon, reasons: [...a.reasons],
            metrics: a.metrics, sources: a.sources, limitations: [...a.limitations], context: a.context,
            quality: { status, kind: a.metrics.some(m => m.kind === 'demonstration') ? 'demonstration' : 'observation',
                validation: { state: 'descriptive_only', reportId: null },
                freshness: { evaluatedAt: generatedAt, ageSeconds, staleAfterSeconds: a.maxAgeMs / 1000 },
                warnings: [...a.limitations, ...(status === 'stale' ? ['Dato antiguo según la política de esta fuente.'] : [])] } };
    });
    const states = items.map(item => item.quality.status);
    const status = !items.length || states.every(s => s === 'unavailable') ? 'unavailable' :
        states.every(s => s === 'stale') ? 'stale' : states.every(s => s === 'ok') ? 'ok' : 'partial';
    const dates = new Set(items.map(item => item.asOf));
    return { schemaVersion: '0.2.0', status, generatedAt,
        dataAsOf: dates.size === 1 ? items[0].asOf : null, sources: [...sources.values()], warnings,
        data: { items, nextCursor: null } };
}
