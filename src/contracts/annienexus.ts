import type { Availability, Horizon, IndexId, SourceReference } from "./core";
export interface Thesis {
  indexId: IndexId;
  direction: "up" | "down" | "mixed" | "not_evaluated";
  narrative: string | null;
  supports: string[];
  contradictions: string[];
  changeConditions: string[];
  sources: SourceReference[];
  asOf: string | null;
}
/** Reference to one immutable macro snapshot, never inferred from a Radar price. */
export interface MarketContextReference {
  contextVersion: string;
  modelVersion: string;
  horizon: Horizon;
  dataAsOf: string;
  generatedAt: string;
  status: Availability;
}
export interface MarketContext {
  contextVersion: string | null;
  asOf: string | null;
  horizon: Horizon;
  modelVersion: string | null;
  dominantVariable: string | null;
  story: string | null;
  causalLinks: Array<{
    id: string; from: string; to: string; mechanism: string;
    conditions: string[]; exceptions: string[]; sourceIds: string[];
  }>;
  theses: Thesis[];
}
