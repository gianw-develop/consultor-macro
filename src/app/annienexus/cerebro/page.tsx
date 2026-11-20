import { Brain } from "../../../modules/annienexus/brain";
import { loadMacroSnapshot } from "../../../modules/annienexus/macro-loader";
import { makeReadingInput } from "../../../modules/annienexus/reading-data";
import { evaluateEconomicReading } from "../../../modules/annienexus/economic-reading";
export const dynamic = "force-dynamic";
export default async function Page(){const now=new Date().toISOString();return <Brain reading={evaluateEconomicReading(makeReadingInput(await loadMacroSnapshot()),now)}/>;}
