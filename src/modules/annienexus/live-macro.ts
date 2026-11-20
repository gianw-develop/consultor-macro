import "server-only";
/**
 * Datos oficiales en vivo, sin claves: FRED (Reserva Federal de St. Louis), OCDE y Yahoo.
 * Cada respuesta se guarda en la caché de datos de Vercel 6 horas: la web nunca
 * enseña datos con más de 6 h desde la última publicación oficial consultada.
 * Si una fuente falla, esa serie queda vacía y la página usa el corte revisado.
 */
import { parseLiveCli, parseFredCsv, parseYahooCloses, type LiveMacro, type LivePoint } from "./live-parse";
export type { LiveMacro };

const REVALIDATE = 6 * 60 * 60;
const HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; consultormacro/1.0)", Accept: "text/csv,application/json,*/*" };

async function text(url: string): Promise<string | null> {
  // Dos intentos: la API de la OCDE devuelve 500 de forma intermitente. Solo se guardan respuestas 200.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(url, { headers: HEADERS, cache: "force-cache", next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(8_000) });
      if (r.ok) {
        const body = await r.text();
        return body.length > 8_000_000 ? null : body;
      }
    } catch { /* reintento */ }
    if (attempt === 0) await new Promise(res => setTimeout(res, 800));
  }
  return null;
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
