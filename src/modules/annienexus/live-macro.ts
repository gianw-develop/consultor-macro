import "server-only";
/**
 * Datos oficiales en vivo, sin claves: FRED (Reserva Federal de St. Louis), OCDE y Yahoo.
 * El resultado completo se guarda en la caché de Next (1 h, se renueva en segundo plano).
 * La página NUNCA espera a las fuentes: getLiveMacro() da como mucho ~2,5 s; si no llega,
 * se pinta con el corte revisado y la descarga termina en segundo plano para la próxima visita.
 */
import { unstable_cache } from "next/cache";
import { parseLiveCli, parseFredCsv, parseYahooCloses, type LiveMacro, type LivePoint } from "./live-parse";
export type { LiveMacro };

const REVALIDATE = 60 * 60;
const HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; consultormacro/1.0)", Accept: "text/csv,application/json,*/*" };

async function text(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { headers: HEADERS, cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return null;
    const body = await r.text();
    return body.length > 8_000_000 ? null : body;
  } catch { return null; }
}

const FRED = (id: string, start: string) => `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=${start}`;
const CLI_URL = (start: string) => `https://sdmx.oecd.org/public/rest/data/OECD.SDD.STES,DSD_STES@DF_CLI/G7+USA+G20.M.LI...AA...H?startPeriod=${start}&dimensionAtObservation=AllDimensions&format=csvfilewithlabels`;
const YAHOO = (s: string) => `https://query1.finance.yahoo.com/v8/finance/chart/${s}?range=6mo&interval=1d`;


export async function loadLiveMacro(now = new Date()): Promise<LiveMacro> {
  const y = now.getUTCFullYear();
  const start2y = `${y - 2}-01-01`, start1y = `${y - 1}-06-01`, cliStart = `${y - 1}-06`;
  const urls = {
    cli: CLI_URL(cliStart),
    cpi: FRED("CPIAUCSL", start2y), core: FRED("CPILFESL", start2y), pce: FRED("PCEPI", start2y),
    gdp: FRED("A191RL1Q225SBEA", start2y), claims4w: FRED("IC4WSA", start1y), payrolls: FRED("PAYEMS", start1y),
    ust10: FRED("DGS10", start1y), xly: YAHOO("XLY"), xlp: YAHOO("XLP"),
  };
  const entries = await Promise.all(Object.entries(urls).map(async ([k, u]) => [k, await text(u)] as const));
  const raw = Object.fromEntries(entries) as Record<keyof typeof urls, string | null>;
  const cli = raw.cli ? parseLiveCli(raw.cli) : { G7: [], USA: [], G20: [] };
  const fred = (k: keyof typeof urls) => raw[k] ? parseFredCsv(raw[k]!) : [];
  const data = {
    cli, cpi: fred("cpi"), core: fred("core"), pce: fred("pce"), gdp: fred("gdp"),
    claims4w: fred("claims4w"), payrolls: fred("payrolls"), ust10: fred("ust10"),
    xly: raw.xly ? parseYahooCloses(raw.xly) : [], xlp: raw.xlp ? parseYahooCloses(raw.xlp) : [],
  };
  const okOf = (k: keyof typeof urls) => k === "cli" ? cli.G7.length > 0 : (data[k as Exclude<keyof typeof data, "cli">] as LivePoint[]).length > 0;
  return {
    fetchedAt: now.toISOString(), ...data,
    sources: Object.fromEntries(Object.entries(urls).map(([k, u]) => [k, { url: k.startsWith("xl") ? `https://finance.yahoo.com/quote/${k.toUpperCase()}` : u.replace("/graph/fredgraph.csv?id=", "/series/").replace(/&cosd=.*$/, ""), ok: okOf(k as keyof typeof urls) }])),
  };
}

/** Vacío: lo que usa la página si las fuentes no responden a tiempo (cae al corte revisado). */
export function emptyLiveMacro(now = new Date()): LiveMacro {
  return { fetchedAt: now.toISOString(), cli: { G7: [], USA: [], G20: [] }, cpi: [], core: [], pce: [], gdp: [], claims4w: [], payrolls: [], ust10: [], xly: [], xlp: [], sources: {} };
}

// Resultado completo cacheado 1 h. Si casi todo falla no se guarda (se lanza error) para reintentar pronto.
const cachedLiveMacro = unstable_cache(async () => {
  const live = await loadLiveMacro();
  const ok = Object.values(live.sources).filter(s => s.ok).length;
  if (ok < 3) throw new Error(`fuentes insuficientes: ${ok}`);
  return live;
}, ["live-macro-v1"], { revalidate: REVALIDATE });

/**
 * Para la página: espera como mucho `budgetMs`. Si la caché está vacía y las fuentes tardan,
 * devuelve vacío al instante y deja la descarga corriendo (el llamador la mantiene con after()).
 */
export async function getLiveMacro(budgetMs = 2500): Promise<{ live: LiveMacro; pending: Promise<unknown> | null }> {
  const job = cachedLiveMacro();
  const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), budgetMs));
  try {
    const live = await Promise.race([job, timeout]);
    if (live) return { live, pending: null };
    console.info(`[datos] fuentes lentas (> ${budgetMs} ms): se usa el corte revisado`);
    return { live: emptyLiveMacro(), pending: job.catch(() => null) };
  } catch (error) {
    console.info(`[datos] fuentes no disponibles: ${error instanceof Error ? error.message : "?"}`);
    return { live: emptyLiveMacro(), pending: null };
  }
}

// ── Mercado ahora: índices, VIX y bono a 10 años (cierres diarios) ──────────────────────────
export type LiveMarket = { fetchedAt: string; source: string; spx: LivePoint[]; dji: LivePoint[]; ndx: LivePoint[]; vix: LivePoint[]; ust10: LivePoint[] };
const YAHOO_6M = (s: string) => `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?range=6mo&interval=1d`;
const FRED_6M = (id: string) => { const d = new Date(Date.now() - 200 * 864e5).toISOString().slice(0, 10); return FRED(id, d); };

async function marketSeries(yahoo: string, fred: string): Promise<{ points: LivePoint[]; source: string }> {
  const y = await text(YAHOO_6M(yahoo));
  const fromYahoo = y ? parseYahooCloses(y) : [];
  if (fromYahoo.length >= 30) return { points: fromYahoo, source: "Yahoo" };
  const f = await text(FRED_6M(fred));
  return { points: f ? parseFredCsv(f) : [], source: "FRED" };
}

export async function loadLiveMarket(): Promise<LiveMarket> {
  const [spx, dji, ndx, vix, ust10] = await Promise.all([
    marketSeries("^GSPC", "SP500"), marketSeries("^DJI", "DJIA"), marketSeries("^IXIC", "NASDAQCOM"),
    marketSeries("^VIX", "VIXCLS"), marketSeries("^TNX", "DGS10"),
  ]);
  return { fetchedAt: new Date().toISOString(), source: [...new Set([spx, dji, ndx, vix, ust10].map(s => s.source))].join(" · "), spx: spx.points, dji: dji.points, ndx: ndx.points, vix: vix.points, ust10: ust10.points };
}

const cachedLiveMarket = unstable_cache(async () => {
  const m = await loadLiveMarket();
  if (m.spx.length < 30) throw new Error("sin datos de índices");
  return m;
}, ["live-market-v1"], { revalidate: 15 * 60 });

export async function getLiveMarket(budgetMs = 2500): Promise<{ market: LiveMarket | null; pending: Promise<unknown> | null }> {
  const job = cachedLiveMarket();
  const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), budgetMs));
  try {
    const market = await Promise.race([job, timeout]);
    return market ? { market, pending: null } : { market: null, pending: job.catch(() => null) };
  } catch { return { market: null, pending: null }; }
}
