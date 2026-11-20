/** Descriptive observations only. These transforms do not classify a market regime. */
export type MonthlyPoint = { period: string; value: number; preliminary?: boolean };
export type SourceCut = {
  name: string; url: string; fetchedAt: string; publishedAt: string | null;
  sha256: string; mode: "connector" | "reviewed_release";
};
export type MonthlySeries = { id: string; unit: string; points: MonthlyPoint[]; source: SourceCut };
export type TreasuryRow = { date: string; values: number[] };
export type Revision = { series: string; period: string; previous: number; current: number };
export type MacroSnapshot = {
  version: 1; capturedAt: string;
  cli: { G7: MonthlySeries; G20: MonthlySeries; USA: MonthlySeries } | null;
  nfp: MonthlySeries | null;
  treasury: { rows: TreasuryRow[]; source: SourceCut } | null;
  revisions: Revision[]; warnings: string[];
};
export const MATURITIES = ["3M", "6M", "1A", "2A", "3A", "5A", "7A", "10A", "20A", "30A"];
const treasuryHeaders = ["3 Mo", "6 Mo", "1 Yr", "2 Yr", "3 Yr", "5 Yr", "7 Yr", "10 Yr", "20 Yr", "30 Yr"];

export function csvRows(text: string): Record<string, string>[] {
  const records: string[][] = []; let record: string[] = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (!quoted && (c === "," || c === "\n")) {
      record.push(field.replace(/\r$/, "")); field = "";
      if (c === "\n") { if (record.some(Boolean)) records.push(record); record = []; }
    } else field += c;
  }
  if (quoted) throw new Error("CSV incompleto");
  if (field || record.length) { record.push(field.replace(/\r$/, "")); records.push(record); }
  const headers = records.shift(); if (!headers) throw new Error("CSV vacío");
  return records.map(row => { if (row.length !== headers.length) throw new Error("Columnas CSV inesperadas"); return Object.fromEntries(headers.map((key, i) => [key.replace(/^\uFEFF/, ""), row[i]])); });
}
function number(value: string): number {
  if (!value.trim() || !Number.isFinite(Number(value))) throw new Error("Observación no numérica");
  return Number(value);
}
export function validateMonthly(points: MonthlyPoint[], now: string): MonthlyPoint[] {
  const seen = new Set<string>();
  for (const point of points) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(point.period) || point.period >= now.slice(0, 7) || seen.has(point.period) || !Number.isFinite(point.value)) throw new Error("Serie mensual duplicada, futura o inválida");
    seen.add(point.period);
  }
  if (!points.length) throw new Error("Serie mensual vacía");
  return [...points].sort((a, b) => a.period.localeCompare(b.period));
}
export function parseCli(csv: string, area: "G7" | "G20" | "USA", now: string): MonthlyPoint[] {
  return validateMonthly(csvRows(csv).filter(r => r.REF_AREA === area && r.FREQ === "M" && r.MEASURE === "LI" && r.UNIT_MEASURE === "IX" && r.ACTIVITY === "_Z" && r.ADJUSTMENT === "AA" && r.TRANSFORMATION === "IX" && r.TIME_HORIZ === "_Z" && r.METHODOLOGY === "H").map(r => {
    if (r.OBS_STATUS !== "A") throw new Error("CLI con estado no admitido");
    return { period: r.TIME_PERIOD, value: number(r.OBS_VALUE) };
  }), now);
}
export function parseNfp(body: unknown, now: string): MonthlyPoint[] {
  const response = body as { status?: string; Results?: { series?: { seriesID: string; data: { year: string; period: string; value: string; footnotes?: { code?: string }[] }[] }[] } };
  if (response.status !== "REQUEST_SUCCEEDED") throw new Error("BLS no completó la petición");
  const series = response.Results?.series?.filter(s => s.seriesID === "CES0000000001");
  if (series?.length !== 1) throw new Error("Serie de empleo incorrecta");
  return validateMonthly(series[0].data.filter(p => /^M(0[1-9]|1[0-2])$/.test(p.period)).map(p => ({ period: p.year + "-" + p.period.slice(1), value: number(p.value), preliminary: p.footnotes?.some(f => f.code === "P") ?? false })), now);
}
export function parseTreasury(csv: string, now: string): TreasuryRow[] {
  const seen = new Set<string>();
  return csvRows(csv).map(row => {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(row.Date);
    if (!match) throw new Error("Fecha del Tesoro inválida");
    const date = `${match[3]}-${match[1]}-${match[2]}`;
    if (!Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || date > now.slice(0, 10) || seen.has(date)) throw new Error("Fecha del Tesoro futura, duplicada o inválida");
    seen.add(date);
    return { date, values: treasuryHeaders.map(h => number(row[h] ?? "")) };
  }).sort((a, b) => b.date.localeCompare(a.date));
}
export function monthBefore(period: string, months: number): string {
  const date = new Date(period + "-01T00:00:00Z"); date.setUTCMonth(date.getUTCMonth() - months); return date.toISOString().slice(0, 7);
}
export function change(points: MonthlyPoint[], months: number, average = false): number | null {
  const last = points.at(-1); if (!last) return null;
  // Require every calendar month. Missing observations never shorten a window.
  for (let i = 1; i <= months; i++) if (!points.some(p => p.period === monthBefore(last.period, i))) return null;
  const first = points.find(p => p.period === monthBefore(last.period, months))!;
  return (last.value - first.value) / (average ? months : 1);
}
export function direction(value: number | null, precision = .01): "up" | "down" | "flat" | "missing" {
  return value === null ? "missing" : value > precision ? "up" : value < -precision ? "down" : "flat";
}
export function persistence(points: MonthlyPoint[]): number {
  let count = 0; const expected = direction(change(points, 1));
  if (expected === "missing" || expected === "flat") return 0;
  for (let end = points.length; end > 1; end--) { if (direction(change(points.slice(0, end), 1)) !== expected) break; count++; }
  return count;
}
export function compareRevisions(before: MonthlySeries | null, after: MonthlySeries | null): Revision[] {
  if (!before || !after || before.id !== after.id) return [];
  return after.points.flatMap(p => { const old = before.points.find(v => v.period === p.period); return old && Math.abs(old.value - p.value) > 1e-9 ? [{ series: after.id, period: p.period, previous: old.value, current: p.value }] : []; });
}
export function assertNoPeriodRegression(before: MonthlySeries | null, after: MonthlySeries): void {
  const previous = before?.points.at(-1)?.period;
  const current = after.points.at(-1)?.period;
  if (!current || (previous && current < previous)) throw new Error("La fuente devuelve un periodo anterior al último verificado");
}
export function isOld(observed: string, now: string, maxDays: number): boolean {
  const date = observed.length === 7 ? observed + "-01" : observed;
  return !Number.isFinite(Date.parse(date)) || Date.parse(now) - Date.parse(date) > maxDays * 86400000;
}
