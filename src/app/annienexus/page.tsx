import { RegimeHome } from "../../modules/annienexus/regime-home";
import { loadMacroSnapshot } from "../../modules/annienexus/macro-loader";
import { getLiveMacro } from "../../modules/annienexus/live-macro";
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
  const [snapshot, { live, pending }] = await Promise.all([loadMacroSnapshot(), getLiveMacro()]);
  // Si las fuentes tardan, la página no espera: la descarga sigue en segundo plano y queda en caché.
  if (pending) after(() => pending);
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
  const reading = evaluateRegime(cli, cpiMonthly, cpiAnnual, signals) ?? base;
  const liveCount = signals.filter(s => s.live).length;
  return <RegimeHome reading={reading} signals={signals} snapshot={snapshot} now={now} fetchedAt={live.fetchedAt} liveCount={liveCount} totalCount={signals.length} />;
}
