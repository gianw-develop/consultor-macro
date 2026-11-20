export const HORIZONS = ["today", "week", "one_to_three_months", "three_to_six_months"] as const;
export type Horizon = (typeof HORIZONS)[number];
export const HORIZON_LABELS: Record<Horizon, string> = {
  today: "Hoy", week: "Esta semana", one_to_three_months: "1–3 meses", three_to_six_months: "3–6 meses",
};
export const INDEX_IDS = ["DJIA", "SP500", "NDX"] as const;
export type IndexId = (typeof INDEX_IDS)[number];
export type Availability = "ok" | "partial" | "stale" | "unavailable";
export type EvidenceKind = "observation" | "hypothesis" | "demonstration";
export interface SourceReference {
  id: string;
  name: string;
  url: string | null;
  publishedAt: string | null;
  observedAt: string | null;
}
export interface ApiEnvelope<T> {
  schemaVersion: "0.2.0";
  status: Availability;
  generatedAt: string;
  dataAsOf: string | null;
  sources: SourceReference[];
  warnings: string[];
  data: T;
}
export interface Metric {
  id: string;
  value: number | null;
  unit: string;
  asOf: string | null;
  kind: EvidenceKind;
  sourceIds: string[];
  method: { id: string; version: string; description: string } | null;
}
export type Clock = () => Date;
export const systemClock: Clock = () => new Date();
export function isHorizon(value: string): value is Horizon {
  return HORIZONS.some((horizon) => horizon === value);
}
