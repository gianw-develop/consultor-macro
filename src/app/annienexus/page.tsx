import { RegimeHome } from "../../modules/annienexus/regime-home";
import { loadMacroSnapshot } from "../../modules/annienexus/macro-loader";
import { makeReadingInput } from "../../modules/annienexus/reading-data";
import { evaluateRegime } from "../../modules/annienexus/regime-engine";
import { buildSignals } from "../../modules/annienexus/regime-signals";
import { overdueEvents } from "../../modules/annienexus/freshness";
import { Overview } from "../../modules/annienexus/overview";
import { evaluateEconomicReading } from "../../modules/annienexus/economic-reading";
import { evaluateRegimeClock } from "../../modules/annienexus/regime-clock";
import brief from "../../modules/annienexus/daily-brief.json";

export const dynamic = "force-dynamic";

const num = (points: { period: string; value: number | null }[] | undefined) =>
  (points ?? []).flatMap(p => typeof p.value === "number" && Number.isFinite(p.value) ? [{ period: p.period, value: p.value }] : []);

export default async function Page() {
  const snapshot = await loadMacroSnapshot(), now = new Date().toISOString(), input = makeReadingInput(snapshot);
  const cli = (snapshot?.cli?.G7?.points ?? []).map(p => ({ period: p.period, value: p.value }));
  const cpiMonthly = num(input.inflation.points), cpiAnnual = num(input.inflationAnnual?.points);
  const signalsFor = (r: NonNullable<ReturnType<typeof evaluateRegime>>) => {
    const cliLast = cli.at(-1), cli3 = cli.at(-4);
    const three = cpiMonthly.slice(-3).reduce((acc, p) => acc * (1 + p.value / 100), 1);
    return buildSignals(r.point, snapshot, {
      cliChange: cliLast && cli3 ? cliLast.value - cli3.value : 0,
      cpi3m: (Math.pow(three, 4) - 1) * 100,
      cpiAnnual: cpiAnnual.at(-1)?.value ?? 0,
    });
  };
  const base = evaluateRegime(cli, cpiMonthly, cpiAnnual, []);
  if (!base) {
    // Sin las dos series que mueven el punto no se inventa una posición: se muestra la portada anterior.
    return <Overview data={{ gdp: input.gdp, inflation: input.inflation, inflationAnnual: input.inflationAnnual }} snapshot={snapshot} now={now} clockReading={evaluateRegimeClock(input, now)} reading={evaluateEconomicReading(input, now)} />;
  }
  const signals = signalsFor(base);
  const reading = evaluateRegime(cli, cpiMonthly, cpiAnnual, signals) ?? base;
  const cutLabel = new Date(brief.checkedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Madrid" });
  return <RegimeHome reading={reading} signals={signals} snapshot={snapshot} now={now} cutLabel={cutLabel} overdue={overdueEvents(now)} />;
}
