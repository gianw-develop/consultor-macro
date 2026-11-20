/**
 * Señales que confirman o contradicen el punto del motor de régimen.
 * No mueven el punto: dicen si el resto de la economía y el mercado cuentan la
 * misma historia que el CLI (crecimiento) y el IPC (inflación).
 *
 * Fuente preferente: datos oficiales en vivo (FRED, Yahoo). Si faltan, se usa el
 * corte revisado del 4/11. Las encuestas ISM no tienen fuente gratuita en vivo:
 * se muestran con su fecha y la revisión editorial que las verificó.
 */
import type { Confirmation, RegimePoint } from "./regime-engine";
import { gdpData, GDP_URL } from "./reviewed-observations";
import { weeklyClaims, CLAIMS_URL } from "./economic-pillars-data";
import { annualRates, monthly, monthlyRates, type LivePoint, type LiveMacro } from "./live-parse";
import type { MacroSnapshot } from "./macro-data";

export const REVIEWED_SIGNALS = {
  checkedAt: "2026-11-04T15:52:00Z",
  ismManufacturing: { period: "2026-10", value: 55.5, previous: 54.5, url: "https://www.prnewswire.com/news-releases/manufacturing-pmi-at-55-5-october-2026-ism-manufacturing-pmi-report-302925617.html" },
  ismPricesPaid: { period: "2026-10", value: 75.2, previous: 77.9, url: "https://www.prnewswire.com/news-releases/manufacturing-pmi-at-55-5-october-2026-ism-manufacturing-pmi-report-302925617.html" },
  coreCpi: { period: "2026-09", monthly: 0.3, annual: 2.6, url: "https://www.bls.gov/news.release/archives/cpi_10142026.htm" },
  pce: { period: "2026-09", monthly: 0.5, annual: 3.6, url: "https://www.bea.gov/news/2026/personal-income-and-outlays-september-2026" },
} as const;

export type SignalRow = Confirmation & { role: "driver" | "check"; value: string; url: string | null; note: string; live: boolean };

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export const monthName = (period: string) => { const m = MONTHS[Number(period.slice(5, 7)) - 1]; return m ? m[0].toUpperCase() + m.slice(1) : period; };
const day = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
const fmt = (v: number, d = 1) => v.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (v: number, d = 1) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${fmt(Math.abs(v), d)}`;
const annualized = (m: number) => (Math.pow(1 + m / 100, 12) - 1) * 100;
const daysAgo = (points: LivePoint[], days: number) => {
  const last = points.at(-1); if (!last) return undefined;
  const limit = Date.parse(last.period) - days * 864e5;
  return [...points].reverse().find(p => Date.parse(p.period) <= limit);
};

export function buildSignals(point: RegimePoint, live: LiveMacro | null, snapshot: MacroSnapshot | null, drivers: { cliChange: number; cliPeriod: string; cpi3m: number; cpiAnnual: number; cpiPeriod: string; cliLive: boolean; cpiLive: boolean }): SignalRow[] {
  const growthUp = point.x >= 0, pricesUp = point.y >= 0;
  const R = REVIEWED_SIGNALS, rows: SignalRow[] = [];
  const add = (r: SignalRow) => rows.push(r);

  // ── Crecimiento
  add({ id: "cli", axis: "growth", role: "driver", label: "CLI G7 · OCDE", reading: `${monthName(drivers.cliPeriod)} · cambio en 3 meses`, value: `${signed(drivers.cliChange, 2)} pts`, agrees: null, period: drivers.cliPeriod, url: "https://www.oecd.org/en/data/datasets/oecd-composite-leading-indicators-clis.html", note: "Mueve el punto (eje horizontal)", live: drivers.cliLive });
  const gdpLive = (live?.gdp ?? []).map(p => ({ period: `${p.period.slice(0, 4)}-Q${Math.floor(Number(p.period.slice(5, 7)) / 3) + 1}`, value: p.value }));
  const gdp = gdpLive.length >= 2 ? gdpLive : gdpData;
  const g = gdp.at(-1), gPrev = gdp.at(-2);
  if (g && gPrev) add({ id: "gdp", axis: "growth", role: "check", label: "PIB real", reading: `${g.period.replace(/(\d{4})-Q(\d)/, "$2T $1")}, anualizado`, value: `${fmt(g.value)} % ${g.value > gPrev.value ? "▲" : g.value < gPrev.value ? "▼" : "="}`, agrees: (g.value >= gPrev.value) === growthUp, period: g.period, url: gdpLive.length >= 2 ? "https://fred.stlouisfed.org/series/A191RL1Q225SBEA" : GDP_URL, note: `Anterior ${fmt(gPrev.value)} %`, live: gdpLive.length >= 2 });
  add({ id: "ism", axis: "growth", role: "check", label: "ISM manufacturas", reading: `${monthName(R.ismManufacturing.period)} · más de 50 = expansión`, value: fmt(R.ismManufacturing.value), agrees: (R.ismManufacturing.value >= 50) === growthUp, period: R.ismManufacturing.period, url: R.ismManufacturing.url, note: `Anterior ${fmt(R.ismManufacturing.previous)} · dato revisado`, live: false });
  const claims = (live?.claims4w ?? []).length >= 5 ? live!.claims4w : weeklyClaims.map(c => ({ period: c.period, value: c.average }));
  const c = claims.at(-1), c4 = claims.at(-5);
  if (c && c4) add({ id: "claims", axis: "growth", role: "check", label: "Solicitudes de subsidio", reading: `Media 4 semanas · ${day(c.period)}`, value: `${fmt(c.value / 1000)}k ${c.value < c4.value ? "▼" : "▲"}`, agrees: (c.value < c4.value) === growthUp, period: c.period, url: (live?.claims4w ?? []).length >= 5 ? "https://fred.stlouisfed.org/series/IC4WSA" : CLAIMS_URL, note: "Bajan = empleo firme", live: (live?.claims4w ?? []).length >= 5 });
  const pay = (live?.payrolls ?? []).length >= 2 ? monthly(live!.payrolls) : (snapshot?.nfp?.points ?? []).map(p => ({ period: p.period, value: p.value }));
  const n = pay.at(-1), nPrev = pay.at(-2);
  if (n && nPrev) { const chg = n.value - nPrev.value; add({ id: "nfp", axis: "growth", role: "check", label: "Empleo NFP", reading: `${monthName(n.period)} · empleos netos`, value: `${signed(chg, 0)}k`, agrees: (chg >= 100) === growthUp, period: n.period, url: "https://fred.stlouisfed.org/series/PAYEMS", note: "Menos de 100k = débil", live: (live?.payrolls ?? []).length >= 2 }); }

  // ── Inflación
  add({ id: "cpi", axis: "inflation", role: "driver", label: "IPC general", reading: `${monthName(drivers.cpiPeriod)} · 3 meses anualizado vs anual`, value: `${fmt(drivers.cpi3m)} % vs ${fmt(drivers.cpiAnnual)} %`, agrees: null, period: drivers.cpiPeriod, url: "https://fred.stlouisfed.org/series/CPIAUCSL", note: "Mueve el punto (eje vertical)", live: drivers.cpiLive });
  const coreM = monthlyRates(live?.core ?? []).at(-1), coreA = annualRates(live?.core ?? []).at(-1);
  const core = coreM && coreA ? { period: coreM.period, monthly: coreM.value, annual: coreA.value, live: true } : { ...R.coreCpi, live: false };
  add({ id: "core", axis: "inflation", role: "check", label: "IPC subyacente", reading: `${monthName(core.period)}, mensual`, value: `${signed(core.monthly, 2)} %`, agrees: (annualized(core.monthly) > core.annual) === pricesUp, period: core.period, url: "https://fred.stlouisfed.org/series/CPILFESL", note: `Anual ${fmt(core.annual)} %`, live: core.live });
  const pceM = monthlyRates(live?.pce ?? []).at(-1), pceA = annualRates(live?.pce ?? []).at(-1);
  const pce = pceM && pceA ? { period: pceM.period, monthly: pceM.value, annual: pceA.value, live: true } : { ...R.pce, live: false };
  add({ id: "pce", axis: "inflation", role: "check", label: "PCE", reading: `${monthName(pce.period)}, mensual`, value: `${signed(pce.monthly, 2)} %`, agrees: (annualized(pce.monthly) > pce.annual) === pricesUp, period: pce.period, url: "https://fred.stlouisfed.org/series/PCEPI", note: `Anual ${fmt(pce.annual)} %`, live: pce.live });
  const ppRising = R.ismPricesPaid.value > R.ismPricesPaid.previous;
  add({ id: "prices-paid", axis: "inflation", role: "check", label: "ISM precios pagados", reading: `${monthName(R.ismPricesPaid.period)} · adelanta la inflación`, value: `${fmt(R.ismPricesPaid.value)} ${ppRising ? "▲" : "▼"}`, agrees: ppRising === pricesUp, period: R.ismPricesPaid.period, url: R.ismPricesPaid.url, note: `Anterior ${fmt(R.ismPricesPaid.previous)} · dato revisado`, live: false });

  // ── Mercado
  const xly = live?.xly ?? [], xlp = live?.xlp ?? [];
  const ratio = xly.flatMap(p => { const d = xlp.find(q => q.period === p.period); return d ? [{ period: p.period, value: p.value / d.value }] : []; });
  const rNow = ratio.at(-1), r3m = daysAgo(ratio, 91);
  if (rNow && r3m) {
    const chg = (rNow.value / r3m.value - 1) * 100;
    add({ id: "xly-xlp", axis: "market", role: "check", label: "Cíclicas vs defensivas", reading: `XLY / XLP · 3 meses al ${day(rNow.period)}`, value: `${signed(chg)} % ${chg >= 0 ? "▲" : "▼"}`, agrees: (chg >= 0) === growthUp, period: rNow.period, url: "https://finance.yahoo.com/quote/XLY", note: chg >= 0 ? "Ganan las cíclicas: el mercado compra crecimiento" : "Ganan las defensivas: el mercado se protege", live: true });
  } else add({ id: "xly-xlp", axis: "market", role: "check", label: "Cíclicas vs defensivas", reading: "XLY / XLP", value: "sin datos", agrees: null, period: "", url: null, note: "La fuente de precios no respondió", live: false });
  const liveUst = (live?.ust10 ?? []).length > 30;
  const ust = liveUst ? live!.ust10 : [...(snapshot?.treasury?.rows ?? [])].sort((a, b) => a.date.localeCompare(b.date)).map(r => ({ period: r.date, value: r.values[7] }));
  const uNow = ust.at(-1), uMonth = daysAgo(ust, 28);
  if (uNow && uMonth) {
    const bp = Math.round((uNow.value - uMonth.value) * 100);
    add({ id: "ust10", axis: "market", role: "check", label: "Bono a 10 años", reading: `${day(uNow.period)} · cambio en un mes`, value: `${fmt(uNow.value, 2)} % ${bp >= 0 ? "▲" : "▼"}${Math.abs(bp)} pb`, agrees: (bp >= 0) === pricesUp, period: uNow.period, url: "https://fred.stlouisfed.org/series/DGS10", note: "Sube = el mercado descuenta más inflación", live: liveUst });
  }
  return rows;
}
