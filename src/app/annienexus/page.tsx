import { RegimeHome } from "../../modules/annienexus/regime-home";
import { loadMacroSnapshot } from "../../modules/annienexus/macro-loader";
import { getLiveMacro, getLiveMarket } from "../../modules/annienexus/live-macro";
import { coherence, evaluateMarket } from "../../modules/annienexus/market-stress";
import { after } from "next/server";
import { annualRates, monthlyRates } from "../../modules/annienexus/live-parse";
import { makeReadingInput } from "../../modules/annienexus/reading-data";
import { evaluateRegime } from "../../modules/annienexus/regime-engine";
import { buildSignals } from "../../modules/annienexus/regime-signals";
import { Overview } from "../../modules/annienexus/overview";
import { evaluateEconomicReading } from "../../modules/annienexus/economic-reading";
import { evaluateRegimeClock } from "../../modules/annienexus/regime-clock";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const num = (points: { period: string; value: number | null }[] | undefined) =>
  (points ?? []).flatMap(p => typeof p.value === "number" && Number.isFinite(p.value) ? [{ period: p.period, value: p.value }] : []);

export default async function Page() {
  const [snapshot, { live, pending }, { market: liveMarket, pending: marketPending }] = await Promise.all([loadMacroSnapshot(), getLiveMacro(), getLiveMarket()]);
  // Si las fuentes tardan, la página no espera: la descarga sigue en segundo plano y queda en caché.
  if (pending) after(() => pending);
  if (marketPending) after(() => marketPending);
  const market = liveMarket ? evaluateMarket(liveMarket) : null;
  const now = new Date().toISOString(), input = makeReadingInput(snapshot);

  // Preferir los datos oficiales en vivo; si una fuente falla, usar el corte revisado.
  const cliLive = live.cli.G7.length >= 6;
  const cli = cliLive ? live.cli.G7 : (snapshot?.cli?.G7?.points ?? []).map(p => ({ period: p.period, value: p.value }));
  const liveRates = monthlyRates(live.cpi), liveAnnual = annualRates(live.cpi);
  const cpiLive = liveRates.length >= 6 && liveAnnual.length >= 3;
  const cpiMonthly = cpiLive ? liveRates : num(input.inflation.points);
  const cpiAnnual = cpiLive ? liveAnnual : num(input.inflationAnnual?.points);

  const base = evaluateRegime(cli, cpiMonthly, cpiAnnual, []);
  if (!base) {
    // Sin las dos series que mueven el punto no se inventa una posición.
    return <Overview data={{ gdp: input.gdp, inflation: input.inflation, inflationAnnual: input.inflationAnnual }} snapshot={snapshot} now={now} clockReading={evaluateRegimeClock(input, now)} reading={evaluateEconomicReading(input, now)} />;
  }
  const cliLast = cli.at(-1), cli3 = cli.at(-4);
  const three = cpiMonthly.slice(-3).reduce((acc, p) => acc * (1 + p.value / 100), 1);
  const signals = buildSignals(base.point, live, snapshot, {
    cliChange: cliLast && cli3 ? cliLast.value - cli3.value : 0, cliPeriod: cliLast?.period ?? "",
    cpi3m: (Math.pow(three, 4) - 1) * 100, cpiAnnual: cpiAnnual.at(-1)?.value ?? 0, cpiPeriod: cpiMonthly.at(-1)?.period ?? "",
    cliLive, cpiLive,
  });
  // Mercado de esta semana como señales: con crecimiento al alza, un mercado en corrección o pánico contradice.
  if (market) {
    const growthUp = base.point.x >= 0, spx = market.indexes[0], calm = market.state === "normal";
    const fmt = (v: number | null) => v === null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toLocaleString("es-ES", { maximumFractionDigits: 1 })} %`;
    signals.push({ id: "spx", axis: "market", role: "check", label: "S&P 500", reading: `Semana ${fmt(spx.week)} · desde máximo ${fmt(spx.fromHigh)}`, value: calm ? "estable" : market.state === "panic" ? "pánico" : "corrección", agrees: calm === growthUp, period: spx.date, url: "https://finance.yahoo.com/quote/%5EGSPC", note: "Cierres diarios", live: true });
    if (market.vix) signals.push({ id: "vix", axis: "market", role: "check", label: "VIX", reading: "Volatilidad esperada · miedo", value: market.vix.last.toLocaleString("es-ES", { maximumFractionDigits: 1 }), agrees: (market.vix.last < 22) === growthUp, period: spx.date, url: "https://finance.yahoo.com/quote/%5EVIX", note: "22 = tensión · 30 = pánico", live: true });
  }
  const reading = evaluateRegime(cli, cpiMonthly, cpiAnnual, signals) ?? base;
  const coh = market ? coherence(base.point.x >= 0, market) : null;
  const liveCount = signals.filter(s => s.live).length;
  return <RegimeHome reading={reading} signals={signals} snapshot={snapshot} now={now} fetchedAt={live.fetchedAt} liveCount={liveCount} totalCount={signals.length} market={market} marketSource={liveMarket?.source ?? ""} coherence={coh} />;
}
