"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDailyCandles = parseDailyCandles;
exports.fetchDailyCloses = fetchDailyCloses;
const observations_1 = require("./observations");
const day = 86400000;
function parseDailyCandles(payload, instrument, fetchedAt) {
    const fetched = (0, observations_1.utc)(fetchedAt);
    if (!['BTC', 'ETH', 'SOL'].includes(instrument.symbol) || instrument.instrumentId !== `spot:coinbase:${instrument.symbol}-USD` ||
        instrument.market !== 'coinbase' || instrument.instrumentType !== 'spot' || instrument.unit !== 'USD' || instrument.assetClass !== 'crypto')
        throw new Error('Unsupported instrument');
    if (!Array.isArray(payload))
        throw new Error('Invalid candle response');
    return payload.map(row => {
        if (!Array.isArray(row) || row.length !== 6 || row.some(x => typeof x !== 'number' || !Number.isFinite(x)))
            throw new Error('Invalid candle');
        const [start, low, high, open, close, volume] = row;
        if (!Number.isInteger(start) || start < 0 || start % 86400 !== 0 || low <= 0 || high < low ||
            open < low || open > high || close < low || close > high || volume < 0)
            throw new Error('Invalid OHLCV');
        const end = (start * 1000) + day;
        // This fetch does NOT prove when a historical candle originally became available.
        return { instrumentId: instrument.instrumentId, value: close, asOf: new Date(end).toISOString(), availableAt: fetchedAt,
            source: { id: `coinbase:${instrument.symbol}-USD:daily`, name: 'Coinbase Exchange · cierre diario',
                url: `https://api.exchange.coinbase.com/products/${instrument.symbol}-USD/candles`, publishedAt: null, observedAt: fetchedAt },
            unit: 'USD', kind: 'observation' };
    }).filter(row => (0, observations_1.utc)(row.asOf) <= fetched).sort((a, b) => (0, observations_1.utc)(a.asOf) - (0, observations_1.utc)(b.asOf));
}
async function fetchDailyCloses(instrument, now, fetcher = fetch, receivedAt = () => new Date().toISOString()) {
    const end = Math.floor((0, observations_1.utc)(now) / day) * day;
    // Validate instrument before using its fields in an external request.
    parseDailyCandles([], instrument, now);
    const url = new URL(`https://api.exchange.coinbase.com/products/${instrument.symbol}-USD/candles`);
    url.search = new URLSearchParams({ granularity: '86400', start: new Date(end - 100 * day).toISOString(), end: new Date(end).toISOString() }).toString();
    const response = await fetcher(url, { cache: 'no-store', headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
    if (!response.ok)
        throw new Error(`Coinbase HTTP ${response.status}`);
    const payload = await response.json();
    const observedAt = receivedAt();
    if ((0, observations_1.utc)(observedAt) < (0, observations_1.utc)(now))
        throw new Error('Receipt predates request');
    return parseDailyCandles(payload, instrument, observedAt).filter(row => (0, observations_1.utc)(row.asOf) > end - 100 * day && (0, observations_1.utc)(row.asOf) <= end);
}
