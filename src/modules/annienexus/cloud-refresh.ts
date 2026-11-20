/** Cloud preparation: collects candidate data, never publishes an editorial review. */
import { createHash } from "node:crypto";
import {
  assertNoPeriodRegression, compareRevisions, parseCli, parseNfp, parseTreasury,
  type MacroSnapshot, type SourceCut,
} from "./macro-data";

export const CLOUD_COVERAGE = ["oecd_cli", "bls_payroll", "treasury_curve"] as const;
export type CloudSource = typeof CLOUD_COVERAGE[number];
export type SourceAttempt = {
  id: CloudSource; state: "verified" | "retained" | "unavailable";
  checkedAt: string; observedThrough: string | null; error: string | null;
};
export type RawEvidence = { id: CloudSource; raw: string; source: SourceCut };
export type CloudCandidate = {
  version: 1; mode: "candidate_only"; day: string; checkedAt: string;
  status: "complete" | "partial" | "failed";
  snapshot: MacroSnapshot; attempts: SourceAttempt[]; evidence: RawEvidence[];
};

/** UTC scheduler can call at 15:00 and 16:00; only the Madrid 17:00 slot is due. */
export function madridRefreshSlot(now: string): { day: string; due: boolean } {
  if (!Number.isFinite(Date.parse(now))) throw new Error("Invalid refresh time");
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(now));
  const get = (key: string) => parts.find(p => p.type === key)!.value;
  return { day: `${get("year")}-${get("month")}-${get("day")}`, due: get("hour") === "17" && Number(get("minute")) < 15 };
}

const maxBytes = 8_000_000;
async function boundedText(response: Response): Promise<string> {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (Number(response.headers.get("content-length")) > maxBytes) throw new Error("Response exceeds size limit");
  if (!response.body) throw new Error("Empty response");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new Error("Response exceeds size limit"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks).toString("utf8");
}

export async function collectCloudCandidate(prior: MacroSnapshot | null, options: {
  now: string; fetcher?: typeof fetch; clock?: () => string;
}): Promise<CloudCandidate> {
  const { day } = madridRefreshSlot(options.now);
  if (prior && Date.parse(prior.capturedAt) > Date.parse(options.now)) throw new Error("Prior snapshot is in the future");
  const year = Number(options.now.slice(0, 4));
  const fetcher = options.fetcher ?? fetch;
  const clock = options.clock ?? (() => new Date().toISOString());
  const snapshot: MacroSnapshot = {
    version: 1, capturedAt: options.now, cli: prior?.cli ?? null, nfp: prior?.nfp ?? null,
    treasury: prior?.treasury ?? null, revisions: [], warnings: [],
  };
  const evidence: RawEvidence[] = [];
  async function retrieve(id: CloudSource, name: string, url: string, init?: RequestInit) {
    const response = await fetcher(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(25_000) });
    const raw = await boundedText(response);
    const source: SourceCut = {
      name, url, fetchedAt: clock(), publishedAt: null,
      sha256: createHash("sha256").update(raw).digest("hex"), mode: "connector",
    };
    evidence.push({ id, raw, source });
    return { raw, source };
  }
  const jobs: { id: CloudSource; run: () => Promise<void> }[] = [
    { id: "oecd_cli", run: async () => {
      const { raw, source } = await retrieve("oecd_cli", "OCDE · CLI ajustado por amplitud",
        `https://sdmx.oecd.org/public/rest/data/OECD.SDD.STES,DSD_STES@DF_CLI/.M.LI...AA...H?startPeriod=${year - 1}-01&dimensionAtObservation=AllDimensions&format=csvfilewithlabels`);
      const areas = ["G7", "G20", "USA"] as const;
      const cli = Object.fromEntries(areas.map(area => [area, {
        id: `OECD.CLI.${area}`, unit: "puntos de índice; tendencia = 100",
        points: parseCli(raw, area, options.now), source,
      }])) as NonNullable<MacroSnapshot["cli"]>;
      // Validate every area before replacing any of them.
      for (const area of areas) assertNoPeriodRegression(prior?.cli?.[area] ?? null, cli[area]);
      for (const area of areas) snapshot.revisions.push(...compareRevisions(prior?.cli?.[area] ?? null, cli[area]));
      snapshot.cli = cli;
    } },
    { id: "bls_payroll", run: async () => {
      const { raw, source } = await retrieve("bls_payroll", "BLS · empleo no agrícola ajustado",
        "https://api.bls.gov/publicAPI/v2/timeseries/data/", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seriesid: ["CES0000000001"], startyear: String(year - 1), endyear: String(year) }),
        });
      const nfp = { id: "CES0000000001", unit: "miles de empleos", points: parseNfp(JSON.parse(raw), options.now), source };
      assertNoPeriodRegression(prior?.nfp ?? null, nfp);
      snapshot.revisions.push(...compareRevisions(prior?.nfp ?? null, nfp));
      snapshot.nfp = nfp;
    } },
    { id: "treasury_curve", run: async () => {
      const { raw, source } = await retrieve("treasury_curve", "Tesoro de Estados Unidos · curva par diaria",
        `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${year}/all?_format=csv&field_tdr_date_value=${year}&page=&type=daily_treasury_yield_curve`);
      const rows = parseTreasury(raw, options.now);
      if (!rows.length || (prior?.treasury?.rows[0] && rows[0].date < prior.treasury.rows[0].date)) throw new Error("Treasury period regression");
      snapshot.treasury = { rows, source };
    } },
  ];
  const outcomes = await Promise.allSettled(jobs.map(job => job.run()));
  const attempts = jobs.map(({ id }, i): SourceAttempt => {
    const outcome = outcomes[i];
    const observedThrough = id === "oecd_cli" ? snapshot.cli?.USA.points.at(-1)?.period :
      id === "bls_payroll" ? snapshot.nfp?.points.at(-1)?.period : snapshot.treasury?.rows[0]?.date;
    // Do not return arbitrary remote bodies/errors, which may contain secrets or HTML.
    const error = outcome.status === "rejected" ? "Source unavailable or validation failed" : null;
    if (error) snapshot.warnings.push(`${id}: no se actualizó. Se conserva la fecha del dato anterior, si existe.`);
    return { id, checkedAt: clock(), observedThrough: observedThrough ?? null, error,
      state: error ? observedThrough ? "retained" : "unavailable" : "verified" };
  });
  const successes = attempts.filter(a => a.state === "verified").length;
  return { version: 1, mode: "candidate_only", day, checkedAt: clock(),
    status: successes === jobs.length ? "complete" : successes ? "partial" : "failed", snapshot, attempts, evidence };
}

/** Persistence must implement an atomic lease and durable, immutable candidates. */
export interface CandidateStore {
  claim(day: string): Promise<{ lease: string; prior: MacroSnapshot | null } | null>;
  finish(lease: string, candidate: CloudCandidate): Promise<void>;
  fail(lease: string): Promise<void>;
}

export async function runCloudCandidate(store: CandidateStore, options: Parameters<typeof collectCloudCandidate>[1]) {
  const slot = madridRefreshSlot(options.now);
  if (!slot.due) return { state: "outside_schedule" as const };
  const claim = await store.claim(slot.day);
  if (!claim) return { state: "already_claimed" as const };
  try {
    const candidate = await collectCloudCandidate(claim.prior, options);
    await store.finish(claim.lease, candidate);
    return { state: "stored_candidate" as const, day: slot.day, status: candidate.status, coverage: CLOUD_COVERAGE };
  } catch (error) {
    await store.fail(claim.lease);
    throw error;
  }
}
