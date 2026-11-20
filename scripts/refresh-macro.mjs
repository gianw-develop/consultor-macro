import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { parseCli, parseNfp, parseTreasury, compareRevisions, assertNoPeriodRegression } = require('../.foundation-test-build/modules/annienexus/macro-data.js');
const capturedAt = new Date().toISOString();
const year = Number(capturedAt.slice(0, 4));
const root = new URL('../data/macro/', import.meta.url);
const archive = new URL(`runs/${capturedAt.replaceAll(':', '-')}/`, root);
await mkdir(archive, { recursive: true });
let prior = null;
try { prior = JSON.parse(await readFile(new URL('latest.json', root), 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const result = { version: 1, capturedAt, cli: prior?.cli ?? null, nfp: prior?.nfp ?? null, treasury: prior?.treasury ?? null, revisions: [], warnings: [] };
async function fetchSource(name, url, file, init) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const raw = await response.text();
  if (raw.length > 8000000) throw new Error('Respuesta demasiado grande');
  const source = { name, url, fetchedAt: new Date().toISOString(), publishedAt: null, sha256: createHash('sha256').update(raw).digest('hex'), mode: 'connector' };
  await writeFile(new URL(file, archive), raw);
  await writeFile(new URL(file + '.metadata.json', archive), JSON.stringify(source, null, 2) + '\n');
  return { raw, source };
}
const jobs = [
  ['OCDE', async () => {
    const url = `https://sdmx.oecd.org/public/rest/data/OECD.SDD.STES,DSD_STES@DF_CLI/.M.LI...AA...H?startPeriod=${year-1}-01&dimensionAtObservation=AllDimensions&format=csvfilewithlabels`;
    const { raw, source } = await fetchSource('OCDE · CLI ajustado por amplitud', url, 'oecd-cli.csv');
    const cli = Object.fromEntries(['G7','G20','USA'].map(area => [area, { id: 'OECD.CLI.' + area, unit: 'puntos de índice; tendencia = 100', points: parseCli(raw, area, capturedAt), source }]));
    for (const area of ['G7','G20','USA']) assertNoPeriodRegression(prior?.cli?.[area] ?? null, cli[area]);
    for (const area of ['G7','G20','USA']) result.revisions.push(...compareRevisions(prior?.cli?.[area], cli[area]));
    result.cli = cli;
  }],
  ['BLS', async () => {
    const { raw, source } = await fetchSource('BLS · empleo no agrícola, ajustado por estacionalidad', 'https://api.bls.gov/publicAPI/v2/timeseries/data/', 'bls.json', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seriesid: ['CES0000000001'], startyear: String(year-1), endyear: String(year) }) });
    const nfp = { id: 'CES0000000001', unit: 'miles de empleos', points: parseNfp(JSON.parse(raw), capturedAt), source };
    result.revisions.push(...compareRevisions(prior?.nfp, nfp)); result.nfp = nfp;
  }],
  ['Tesoro', async () => {
    const url = `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${year}/all?_format=csv&field_tdr_date_value=${year}&page=&type=daily_treasury_yield_curve`;
    const { raw, source } = await fetchSource('Tesoro de Estados Unidos · curva par diaria', url, 'treasury.csv');
    const rows = parseTreasury(raw, capturedAt); if (!rows.length) throw new Error('Curva vacía');
    result.treasury = { rows, source };
  }],
];
const settled = await Promise.allSettled(jobs.map(([, run]) => run()));
settled.forEach((entry, i) => {
  if (entry.status === 'rejected') result.warnings.push(`${jobs[i][0]}: no se pudo actualizar (${entry.reason.message}). Se conserva el corte anterior, si existe, con su fecha original.`);
});
await writeFile(new URL('snapshot.json', archive), JSON.stringify(result, null, 2) + '\n');
await writeFile(new URL('latest.tmp', root), JSON.stringify(result, null, 2) + '\n');
await rename(new URL('latest.tmp', root), new URL('latest.json', root));
console.log(JSON.stringify({ capturedAt, cli: result.cli?.G7.points.at(-1)?.period, nfp: result.nfp?.points.at(-1)?.period, treasury: result.treasury?.rows[0]?.date, revisions: result.revisions.length, warnings: result.warnings }, null, 2));
if (settled.some(r => r.status === 'rejected')) process.exitCode = 1;
