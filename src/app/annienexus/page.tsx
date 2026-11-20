import { Overview } from "../../modules/annienexus/overview";
import { loadMacroSnapshot } from "../../modules/annienexus/macro-loader";
import { makeReadingInput } from "../../modules/annienexus/reading-data";
import { evaluateEconomicReading } from "../../modules/annienexus/economic-reading";
import { evaluateRegimeClock } from "../../modules/annienexus/regime-clock";
export const dynamic = "force-dynamic";
export default async function Page(){const snapshot=await loadMacroSnapshot(),now=new Date().toISOString(),input=makeReadingInput(snapshot);return <Overview data={{gdp:input.gdp,inflation:input.inflation,inflationAnnual:input.inflationAnnual}} snapshot={snapshot} now={now} clockReading={evaluateRegimeClock(input,now)} reading={evaluateEconomicReading(input,now)}/>;}
