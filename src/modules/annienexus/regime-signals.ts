/**
 * Señales que confirman o contradicen el punto del motor de régimen.
 * No mueven el punto: solo dicen si el resto de la economía y el mercado
 * cuentan la misma historia que el CLI (crecimiento) y el IPC (inflación).
 *
 * Los valores de encuestas y precios que no llegan en una serie descargable
 * son lecturas verificadas en el corte editorial (fecha y fuente en cada una).
 */
import type { Confirmation, RegimePoint } from "./regime-engine";
import { gdpData, GDP_URL } from "./reviewed-observations";
import { weeklyClaims, CLAIMS_URL } from "./economic-pillars-data";
import type { MacroSnapshot } from "./macro-data";

export const REVIEWED_SIGNALS = {
  checkedAt: "2026-11-04T15:52:00Z",
  ismManufacturing: { period: "2026-10", value: 55.5, previous: 54.5, url: "https://www.prnewswire.com/news-releases/manufacturing-pmi-at-55-5-october-2026-ism-manufacturing-pmi-report-302925617.html" },
  ismPricesPaid: { period: "2026-10", value: 75.2, previous: 77.9, url: "https://www.prnewswire.com/news-releases/manufacturing-pmi-at-55-5-october-2026-ism-manufacturing-pmi-report-302925617.html" },
  coreCpi: { period: "2026-09", monthly: 0.3, annual: 2.6, url: "https://www.bls.gov/news.release/archives/cpi_10142026.htm" },
  pce: { period: "2026-09", monthly: 0.5, annual: 3.6, url: "https://www.bea.gov/news/2026/personal-income-and-outlays-september-2026" },
} as const;

export type SignalRow = Confirmation & { role: "driver" | "check"; value: string; url: string | null; note: string };

const fmt = (v: number, d = 1) => v.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (v: number, d = 1) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${fmt(Math.abs(v), d)}`;
const annualized = (monthly: number) => (Math.pow(1 + monthly / 100, 12) - 1) * 100;

export function buildSignals(point: RegimePoint, snapshot: MacroSnapshot | null, drivers: { cliChange: number; cpi3m: number; cpiAnnual: number }): SignalRow[] {
  const growthUp = point.x >= 0, pricesUp = point.y >= 0;
  const rows: SignalRow[] = [];
  const add = (r: SignalRow) => rows.push(r);
  const R = REVIEWED_SIGNALS;

  add({ id: "cli", axis: "growth", role: "driver", label: "CLI G7 · OCDE", reading: "Ciclo adelantado, cambio en 3 meses", value: `${signed(drivers.cliChange, 2)} pts`, agrees: null, period: "", url: "https://www.oecd.org/en/data/datasets/oecd-composite-leading-indicators-clis.html", note: "Mueve el punto (eje horizontal)" });
  const g = gdpData.at(-1), gPrev = gdpData.at(-2);
  if (g && gPrev) add({ id: "gdp", axis: "growth", role: "check", label: "PIB real", reading: `${g.period.replace(/(\d{4})-Q(\d)/, "$2T $1")}, anualizado`, value: `${fmt(g.value)} % ${g.value > gPrev.value ? "▲" : g.value < gPrev.value ? "▼" : "="}`, agrees: (g.value >= gPrev.value) === growthUp, period: g.period, url: GDP_URL, note: `Anterior ${fmt(gPrev.value)} %` });
  add({ id: "ism", axis: "growth", role: "check", label: "ISM manufacturas", reading: "Octubre · más de 50 = expansión", value: fmt(R.ismManufacturing.value), agrees: (R.ismManufacturing.value >= 50) === growthUp, period: R.ismManufacturing.period, url: R.ismManufacturing.url, note: `Anterior ${fmt(R.ismManufacturing.previous)}` });
  const c = weeklyClaims.at(-1), c4 = weeklyClaims.at(-5);
  if (c && c4) add({ id: "claims", axis: "growth", role: "check", label: "Solicitudes de subsidio", reading: "Media de 4 semanas", value: `${fmt(c.average / 1000)}k ${c.average < c4.average ? "▼" : "▲"}`, agrees: (c.average < c4.average) === growthUp, period: c.period, url: CLAIMS_URL, note: "Bajan = mercado laboral firme" });
  const nfp = snapshot?.nfp?.points ?? [], n = nfp.at(-1), nPrev = nfp.at(-2);
  if (n && nPrev) { const chg = n.value - nPrev.value; add({ id: "nfp", axis: "growth", role: "check", label: "Empleo NFP", reading: `${new Date(n.period + "-15T00:00:00Z").toLocaleDateString("es-ES", { month: "long", timeZone: "UTC" }).replace(/^./, c => c.toUpperCase())}${n.preliminary ? ", preliminar" : ""}`, value: `${signed(chg, 0)}k`, agrees: (chg >= 100) === growthUp, period: n.period, url: snapshot?.nfp?.source.url ?? null, note: "Menos de 100k = débil" }); }

  add({ id: "cpi", axis: "inflation", role: "driver", label: "IPC general", reading: "3 meses anualizado frente a anual", value: `${fmt(drivers.cpi3m)} % vs ${fmt(drivers.cpiAnnual)} %`, agrees: null, period: "", url: R.coreCpi.url, note: "Mueve el punto (eje vertical)" });
  const coreRising = annualized(R.coreCpi.monthly) > R.coreCpi.annual;
  add({ id: "core", axis: "inflation", role: "check", label: "IPC subyacente", reading: "Septiembre, mensual", value: `${signed(R.coreCpi.monthly)} %`, agrees: coreRising === pricesUp, period: R.coreCpi.period, url: R.coreCpi.url, note: `Anual ${fmt(R.coreCpi.annual)} %` });
  const pceRising = annualized(R.pce.monthly) > R.pce.annual;
  add({ id: "pce", axis: "inflation", role: "check", label: "PCE", reading: "Septiembre, mensual", value: `${signed(R.pce.monthly)} %`, agrees: pceRising === pricesUp, period: R.pce.period, url: R.pce.url, note: `Anual ${fmt(R.pce.annual)} %` });
  const ppRising = R.ismPricesPaid.value > R.ismPricesPaid.previous;
  add({ id: "prices-paid", axis: "inflation", role: "check", label: "ISM precios pagados", reading: "Adelanta la inflación", value: `${fmt(R.ismPricesPaid.value)} ${ppRising ? "▲" : "▼"}`, agrees: ppRising === pricesUp, period: R.ismPricesPaid.period, url: R.ismPricesPaid.url, note: `Anterior ${fmt(R.ismPricesPaid.previous)}` });

  add({ id: "xly-xlp", axis: "market", role: "check", label: "Cíclicas vs defensivas", reading: "XLY / XLP · si sube, el mercado compra crecimiento", value: "por conectar", agrees: null, period: "", url: null, note: "Necesita precios de mercado" });
  const rows10 = [...(snapshot?.treasury?.rows ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const last = rows10.at(-1), monthAgo = last ? [...rows10].reverse().find(r => Date.parse(last.date) - Date.parse(r.date) >= 28 * 864e5) : undefined;
  if (last && monthAgo) {
    const bp = Math.round((last.values[7] - monthAgo.values[7]) * 100);
    add({ id: "ust10", axis: "market", role: "check", label: "Bono a 10 años", reading: "Sube = el mercado descuenta más inflación", value: `${fmt(last.values[7], 2)} % ${bp >= 0 ? "▲" : "▼"}${Math.abs(bp)} pb`, agrees: (bp >= 0) === pricesUp, period: last.date, url: snapshot?.treasury?.source.url ?? null, note: "Cambio en un mes" });
  }
  return rows;
}
