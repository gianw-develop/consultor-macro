/** Lectores estrictos de las respuestas oficiales. Todo lo que no valida se descarta. */
export type LivePoint = { period: string; value: number };
export type LiveMacro = {
  fetchedAt: string;
  cli: { G7: LivePoint[]; USA: LivePoint[]; G20: LivePoint[] };
  cpi: LivePoint[]; core: LivePoint[]; pce: LivePoint[]; gdp: LivePoint[];
  claims4w: LivePoint[]; payrolls: LivePoint[]; ust10: LivePoint[];
  xly: LivePoint[]; xlp: LivePoint[];
  sources: Record<string, { url: string; ok: boolean }>;
};

const finite = (v: number) => Number.isFinite(v);
const sortUnique = (points: LivePoint[]) => {
  const map = new Map<string, number>();
  for (const p of points) if (finite(p.value)) map.set(p.period, p.value);
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([period, value]) => ({ period, value }));
};

/** FRED fredgraph.csv: "observation_date,SERIE". Las faltas vienen como "." o vacío. */
export function parseFredCsv(csv: string): LivePoint[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2 || !/^(observation_date|DATE),/i.test(lines[0])) return [];
  return sortUnique(lines.slice(1).flatMap(line => {
    const [date, raw] = line.split(",");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "") || !raw || raw === ".") return [];
    return [{ period: date, value: Number(raw) }];
  }));
}

/** Convierte fechas diarias "AAAA-MM-01" de series mensuales a "AAAA-MM". */
export function monthly(points: LivePoint[]): LivePoint[] {
  return sortUnique(points.map(p => ({ period: p.period.slice(0, 7), value: p.value })));
}

const shift = (period: string, months: number) => {
  const [y, m] = period.split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + months, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

/** Tasas mensuales (%) a partir de un índice de nivel. Solo entre meses consecutivos: un hueco no se convierte en un salto de dos meses. */
export function monthlyRates(index: LivePoint[]): LivePoint[] {
  const byPeriod = new Map(monthly(index).map(p => [p.period, p.value]));
  return [...byPeriod.entries()].flatMap(([period, value]) => {
    const prev = byPeriod.get(shift(period, -1));
    return prev ? [{ period, value: Math.round((value / prev - 1) * 10000) / 100 }] : [];
  });
}

/**
 * Tasa anual (%) a partir de un índice de nivel. Si falta el mismo mes del año anterior
 * (p. ej. octubre de 2025, sin IPC por el cierre del gobierno de EE. UU.), se estima con la
 * media geométrica de los dos meses vecinos, igual que hizo el BLS.
 */
export function annualRates(index: LivePoint[]): LivePoint[] {
  const m = monthly(index), byPeriod = new Map(m.map(p => [p.period, p.value]));
  return m.flatMap(p => {
    const year = shift(p.period, -12);
    const before = byPeriod.get(shift(year, -1)), after = byPeriod.get(shift(year, 1));
    const prev = byPeriod.get(year) ?? (before && after ? Math.sqrt(before * after) : undefined);
    return prev ? [{ period: p.period, value: Math.round((p.value / prev - 1) * 1000) / 10 }] : [];
  });
}

/** OCDE SDMX CSV con etiquetas: columnas REF_AREA, TIME_PERIOD, OBS_VALUE. */
export function parseLiveCli(csv: string): { G7: LivePoint[]; USA: LivePoint[]; G20: LivePoint[] } {
  const out = { G7: [] as LivePoint[], USA: [] as LivePoint[], G20: [] as LivePoint[] };
  const lines = csv.trim().split(/\r?\n/);
  const head = lines[0]?.split(",") ?? [];
  const area = head.indexOf("REF_AREA"), period = head.indexOf("TIME_PERIOD"), value = head.indexOf("OBS_VALUE");
  if (area < 0 || period < 0 || value < 0) return out;
  for (const line of lines.slice(1)) {
    const cells = line.split(",");
    const a = cells[area] as keyof typeof out, p = cells[period], v = Number(cells[value]);
    if (a in out && /^\d{4}-\d{2}$/.test(p ?? "") && finite(v) && v > 80 && v < 120) out[a].push({ period: p, value: v });
  }
  return { G7: sortUnique(out.G7), USA: sortUnique(out.USA), G20: sortUnique(out.G20) };
}

/** Yahoo chart v8: cierres diarios ajustados. */
export function parseYahooCloses(json: string): LivePoint[] {
  try {
    const r = JSON.parse(json)?.chart?.result?.[0];
    const ts: unknown = r?.timestamp, closes: unknown = r?.indicators?.adjclose?.[0]?.adjclose ?? r?.indicators?.quote?.[0]?.close;
    if (!Array.isArray(ts) || !Array.isArray(closes)) return [];
    return sortUnique(ts.flatMap((t, i) => typeof t === "number" && typeof closes[i] === "number" ? [{ period: new Date(t * 1000).toISOString().slice(0, 10), value: closes[i] as number }] : []));
  } catch { return []; }
}
