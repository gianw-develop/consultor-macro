import type { Availability, EvidenceKind, Horizon, Metric, SourceReference } from "./core";
import type { MarketContextReference } from "./annienexus";

export type AssetClass = "stocks" | "crypto";
export type QuoteCurrency = "USD" | "EUR" | "GBP" | "BTC" | "ETH" | "USDT" | "USDC";
/** An index level is always in points, never a stock or ETF substitute. */
export type RadarInstrument = {
  instrumentId: string;
  symbol: string;
  market: string;
} & (
  | { instrumentType: "index"; assetClass: "stocks"; unit: "index_points" }
  | { instrumentType: "equity"; assetClass: "stocks"; unit: QuoteCurrency }
  | { instrumentType: "spot" | "future" | "perpetual" | "option"; assetClass: AssetClass; unit: QuoteCurrency }
);

export type ValidationState =
  | { state: "not_evaluated" | "descriptive_only"; reportId: null }
  | { state: "historically_tested"; reportId: string };

export interface RadarQuality {
  status: Availability;
  kind: EvidenceKind;
  validation: ValidationState;
  freshness: {
    evaluatedAt: string;
    /** Age since the observation's asOf; null when no observation exists. */
    ageSeconds: number | null;
    /** Explicit provider/calendar policy, not a universal threshold. */
    staleAfterSeconds: number;
  };
  warnings: string[];
}

interface RadarRecordBase {
  id: string;
  asOf: string | null;
  /** Earliest provable availability, not an assumed historical publication date. */
  availableAt: string | null;
  horizon: Horizon;
  reasons: string[];
  metrics: Metric[];
  sources: SourceReference[];
  limitations: string[];
  quality: RadarQuality;
  /** null until a dated, versioned macro snapshot actually exists. */
  context: MarketContextReference | null;
}

export type RadarObservation = RadarRecordBase & RadarInstrument & {
  recordType: "observation";
};
export type RadarOpportunity = RadarRecordBase & RadarInstrument & {
  recordType: "opportunity";
  /** Research hypothesis, never a trade order or an automatic macro thesis change. */
  hypothesis: {
    statement: string;
    supports: string[];
    contradictions: string[];
    invalidationConditions: string[];
  };
};
export type RadarRecord = RadarObservation | RadarOpportunity;
export interface RadarPage<T extends RadarRecord = RadarRecord> {
  items: T[];
  nextCursor: string | null;
}
export interface RadarHealth {
  state: "not_integrated" | "degraded" | "available";
  lastSuccessfulUpdate: string | null;
}
