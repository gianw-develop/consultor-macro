import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const base = process.env.RADAR_TEST_BUILD;
if (!base) throw new Error('Run through node tests/radar/run.mjs');
const { analyzeCloses, toPlatformPage, INSTRUMENTS, utc } = (await import(pathToFileURL(path.join(base, 'modules/radar/observations.js')))).default;
const { parseDailyCandles, fetchDailyCloses } = (await import(pathToFileURL(path.join(base, 'modules/radar/coinbase.js')))).default;
const { collectObservations } = (await import(pathToFileURL(path.join(base, 'modules/radar/service.js')))).default;
const btc = INSTRUMENTS.find(i => i.symbol === 'BTC');
const msft = INSTRUMENTS.find(i => i.symbol === 'MSFT');
const now = '2026-09-30T12:00:00.000Z';
const source = { id: 'fixture', name: 'Synthetic test fixture', url: null, publishedAt: null, observedAt: now };
const row = (value, asOf, changes = {}) => ({ instrumentId: btc.instrumentId, value, asOf, availableAt: now,
  unit: 'USD', kind: 'demonstration', source, ...changes });
const rows = [row(100, '2026-09-23T00:00:00.000Z'), row(110, '2026-09-30T00:00:00.000Z')];
const options = { now, horizon: 'week', maxAgeMs: 86400000, allowDemo: true };

test('known 10 percent change is reproducible and labelled demo, not probability', () => {
  const a = analyzeCloses(btc, rows, options);
  assert.equal(a.status, 'ok');
  assert.ok(Math.abs(a.metrics[1].value - 10) < 1e-10);
  assert.equal(a.metrics[1].kind, 'demonstration');
  assert.equal(a.metrics[1].unit, '%');
  assert.match(a.metrics[1].method.description, /días naturales/);
});
test('default pipeline rejects demonstration rather than passing it as live', () => {
  assert.equal(analyzeCloses(btc, rows, { ...options, allowDemo: false }).status, 'unavailable');
});
test('future availability cannot leak into historical reconstruction', () => {
  const a = analyzeCloses(btc, rows, { ...options, now: '2026-09-25T12:00:00.000Z' });
  assert.equal(a.status, 'unavailable');
  assert.equal(a.metrics.length, 0);
});
test('missing history does not synthesize a return', () => {
  const a = analyzeCloses(btc, rows.slice(1), options);
  assert.equal(a.status, 'partial');
  assert.equal(a.metrics.length, 1);
});
test('stale observation retains actual date and explicit warning', () => {
  const a = analyzeCloses(btc, rows, { ...options, now: '2026-10-05T12:00:00.000Z' });
  assert.equal(a.status, 'stale');
  assert.equal(a.asOf, rows[1].asOf);
  assert.equal(toPlatformPage([a], '2026-10-05T12:00:00.000Z').status, 'stale');
});
test('instrument and unit mismatch, negative and infinite values rejected', () => {
  for (const changes of [{ instrumentId: msft.instrumentId }, { unit: 'index_points' }, { value: Infinity }, { value: -2 }]) {
    assert.equal(analyzeCloses(btc, [row(100, rows[0].asOf, changes)], options).status, 'unavailable');
  }
});
test('real and demo observations never produce a combined return', () => {
  assert.equal(analyzeCloses(btc, [rows[0], { ...rows[1], kind: 'observation' }], options).status, 'unavailable');
});
test('index remains an index with points in shared contract 0.2', () => {
  const index = INSTRUMENTS[0];
  const data = rows.map(r => ({ ...r, instrumentId: index.instrumentId, unit: 'index_points' }));
  const a = analyzeCloses(index, data, options);
  assert.equal(a.metrics[0].unit, 'index_points');
  const page = toPlatformPage([a], now);
  assert.equal(page.status, 'ok');
  assert.equal(page.schemaVersion, '0.2.0');
  assert.equal(page.data.items[0].instrumentType, 'index');
  assert.equal(page.data.items[0].unit, 'index_points');
  assert.equal(page.data.items[0].recordType, 'observation');
});
test('equity observations use independent identity and no inferred macro thesis', () => {
  const a = analyzeCloses(msft, rows.map(r => ({ ...r, instrumentId: msft.instrumentId })), options);
  const page = toPlatformPage([a], now);
  assert.equal(page.data.items[0].instrumentType, 'equity');
  assert.equal(page.data.items[0].context, null);
});
test('mixed dates never acquire a false common asOf', () => {
  const a = analyzeCloses(btc, rows, options);
  const b = analyzeCloses(msft, rows.map(r => ({ ...r, instrumentId: msft.instrumentId, asOf: r.asOf.replace('00:00:00', '01:00:00') })), options);
  assert.equal(toPlatformPage([a,b], now).dataAsOf, null);
  assert.equal(toPlatformPage([], now).status, 'unavailable');
});
test('UTC and calendar validation reject ambiguous dates', () => {
  for (const d of ['2026-09-30', '2026-02-30T00:00:00Z', '2026-09-30T12:00:00+02:00']) assert.throws(() => utc(d));
});
test('conflicting duplicates are excluded instead of arbitrary revision selection', () => {
  const a = analyzeCloses(btc, [rows[0], { ...rows[0], value: 80 }, rows[1]], options);
  assert.equal(a.metrics.length, 1);
  assert.equal(a.status, 'partial');
});
test('Coinbase parser excludes open daily candle and preserves conservative availability', () => {
  const start = Date.parse('2026-09-29T00:00:00Z') / 1000;
  const result = parseDailyCandles([[start, 90, 120, 100, 110, 20], [start+86400, 90, 120, 100, 110, 20]], btc, now);
  assert.equal(result.length, 1);
  assert.equal(result[0].asOf, '2026-09-30T00:00:00.000Z');
  assert.equal(result[0].availableAt, now);
  assert.equal(result[0].source.publishedAt, null);
});
test('Coinbase rejects malformed candles and mismatched markets', () => {
  assert.throws(() => parseDailyCandles([[1, 10, 9, 10, 10, 1]], btc, now));
  assert.throws(() => parseDailyCandles([], msft, now));
  assert.throws(() => parseDailyCandles({ error: true }, btc, now));
});
test('provider errors stay errors; no synthetic fallback or secret in error', async () => {
  await assert.rejects(fetchDailyCloses(btc, now, async () => ({ ok: false, status: 429 })), /HTTP 429/);
});
test('bounded provider request has no API key and uses daily data', async () => {
  let called;
  await fetchDailyCloses(btc, now, async (url) => { called = url; return { ok: true, json: async () => [] }; }, () => now);
  assert.equal(called.hostname, 'api.exchange.coinbase.com');
  assert.equal(called.searchParams.get('granularity'), '86400');
  assert.equal(called.searchParams.has('api_key'), false);
});
test('missing records survive with structured quality and null dates', () => {
  const page = toPlatformPage([analyzeCloses(msft, [], options)], now);
  const item = page.data.items[0];
  assert.equal(item.recordType, 'observation');
  assert.equal(item.quality.status, 'unavailable');
  assert.equal(item.asOf, null);
  assert.equal(item.availableAt, null);
  assert.equal(item.quality.freshness.ageSeconds, null);
  assert.equal(item.quality.validation.state, 'descriptive_only');
  assert.equal(item.metrics.length, 0);
});
test('availability is maximum availability of observations used in calculation', () => {
  const changed = rows.map((r,i) => ({...r, availableAt: i ? '2026-09-30T01:00:00.000Z' : now }));
  const item = toPlatformPage([analyzeCloses(btc, changed, options)], now).data.items[0];
  assert.equal(item.availableAt, now);
  assert.equal(item.quality.kind, 'demonstration');
  assert.equal(item.quality.freshness.ageSeconds, 43200);
});
test('serializing later recomputes freshness without refreshing underlying dates', () => {
  const item = toPlatformPage([analyzeCloses(btc, rows, options)], '2026-10-03T12:00:00.000Z').data.items[0];
  assert.equal(item.quality.status, 'stale');
  assert.equal(item.availableAt, now);
  assert.equal(item.quality.freshness.ageSeconds, 302400);
});
const context = { contextVersion: 'snapshot-1', modelVersion: 'model-1', horizon: 'week',
  dataAsOf: '2026-09-29T10:00:00.000Z', generatedAt: '2026-09-29T11:00:00.000Z', status: 'ok' };
test('macro reference preserved, cloned, never inferred from prices', () => {
  const a = analyzeCloses(btc, rows, { ...options, context });
  assert.deepEqual(a.context, context);
  assert.notEqual(a.context, context);
  assert.equal(toPlatformPage([a], now).data.items[0].context.contextVersion, 'snapshot-1');
  assert.equal(analyzeCloses(btc, rows, options).context, null);
});
test('macro future timestamps, unavailable, missing version or different horizon rejected', () => {
  for (const change of [{ generatedAt: '2026-10-01T00:00:00Z' }, { horizon: 'today' }, { status: 'unavailable' }, { modelVersion: '' }]) {
    assert.equal(analyzeCloses(btc, rows, { ...options, context: {...context,...change} }).context, null);
  }
});
test('service filters stocks and preserves unsupported indices without network requests', async () => {
  const page = await collectObservations({ assetClass: 'stocks', horizon: 'week' }, { clock: () => now });
  assert.equal(page.status, 'unavailable');
  assert.equal(page.data.items.filter(i => i.instrumentType === 'index').length, 3);
  assert.ok(page.data.items.every(i => i.assetClass === 'stocks' && i.asOf === null));
});
test('provider failure uses only supplied cache, preserving stale and missing records', async () => {
  const page = await collectObservations({ assetClass: 'crypto', horizon: 'week' }, {
    clock: () => '2026-10-05T12:00:00.000Z',
    load: async () => { throw new Error('private upstream URL / key'); },
    cached: i => i.symbol === 'BTC' ? rows.map(r => ({...r,kind:'observation'})) : []
  });
  assert.equal(page.status, 'partial');
  assert.equal(page.data.items.length, 3);
  assert.equal(page.data.items[0].quality.status, 'stale');
  assert.equal(page.data.items[1].quality.status, 'unavailable');
  assert.equal(page.dataAsOf, null);
  assert.ok(!JSON.stringify(page).includes('private upstream'));
});
test('service remains descriptive with fresh data and does not leak demonstrations', async () => {
  const page = await collectObservations({ assetClass: 'crypto', horizon: 'week' }, {
    clock: () => now,
    load: async instrument => rows.map(r => ({...r,instrumentId:instrument.instrumentId,kind:'observation'}))
  });
  assert.equal(page.status, 'ok');
  assert.ok(page.data.items.every(i => i.recordType === 'observation' && !('hypothesis' in i) && i.context === null));
});
