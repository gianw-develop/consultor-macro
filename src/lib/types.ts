export type Regime = "expansion" | "decline" | "neutral";

export type ImpactLevel = "high" | "medium";

export type Movement = "up" | "down" | "flat" | "missing";

export type SnapshotBias =
  | "expansion"
  | "decline"
  | "stable"
  | "neutral"
  | "missing";

export interface MarketSnapshot {
  key: string;
  label: string;
  symbol: string;
  current: number | null;
  previous: number | null;
  change: number | null;
  changePercent: number | null;
  available: boolean;
  priceLabel: string;
  changeLabel: string;
  movement: Movement;
  bias: SnapshotBias;
  note: string;
}

export interface WeeklyEvent {
  name: string;
  timeEt: string;
  impact: ImpactLevel;
  reaction?: string;
  forecast?: string;
  actual?: string;
  previous?: string;
  status?: "upcoming" | "released";
  userActual?: string;
  verdict?: "bullish" | "bearish" | "neutral";
}

export interface WeeklyScheduleDay {
  day: string;
  events: WeeklyEvent[];
}

export interface ConditionSummary {
  regime: Regime;
  title: string;
  shortLabel: string;
  narrative: string;
  score: number;
  total: number;
  strengthLabel: string;
  contradictions: string[];
}

export interface DashboardData {
  fetchedAt: string;
  etDateKey: string;
  lastUpdatedEt: string;
  coreVariables: MarketSnapshot[];
  macroContext: MarketSnapshot[];
  futures: MarketSnapshot[];
  weeklySchedule: WeeklyScheduleDay[];
  condition: ConditionSummary;
  warnings: string[];
}

export interface DashboardHistoryEntry {
  dateKey: string;
  label: string;
  regime: Regime;
  score: number;
}