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

export interface MarketSessionSummary {
  isTradingDay: boolean;
  label: string;
  note: string;
}

export type TenXClassification =
  | "Candidata prioritaria"
  | "Investigar a fondo"
  | "Watchlist"
  | "Descartar";

export type TenXTrend = "improving" | "stable" | "deteriorating" | "unknown";

export type TenXRegimeStatus = "active" | "watch" | "inactive";

export interface TenXRegime {
  id: string;
  name: string;
  status: TenXRegimeStatus;
  priority: number;
  thesis: string;
  keywords: string[];
  marketProxies: string[];
}

export interface TenXRegimeRadarItem {
  id: string;
  name: string;
  status: TenXRegimeStatus;
  attentionScore: number;
  priority: number;
  thesis: string;
  newsMatches: number;
  marketChangePercent: number | null;
  marketProxies: string[];
  leadingArticles: Array<{
    title: string;
    url: string;
    domain: string;
  }>;
  readout: string;
}

export interface TenXCompanyInput {
  ticker: string;
  companyName: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  marketCapUsd?: number | null;
  enterpriseValueUsd?: number | null;
  avgDailyVolumeUsd?: number | null;
  sharePrice?: number | null;
  revenueGrowthYoyPct?: number | null;
  grossMarginPct?: number | null;
  ebitdaMarginTrend?: TenXTrend;
  netMarginTrend?: TenXTrend;
  freeCashFlowTrend?: TenXTrend | "positive_inflection";
  roicTrend?: TenXTrend;
  cashUsd?: number | null;
  totalDebtUsd?: number | null;
  cashRunwayMonths?: number | null;
  sharesOutstandingGrowthPct?: number | null;
  drawdown12mPct?: number | null;
  delistingRisk?: boolean | null;
  bankruptcyRisk?: boolean | null;
  insiderOwnershipPct?: number | null;
  recentInsiderBuying?: boolean | null;
  recentInsiderSelling?: boolean | null;
  tamEstimateUsd?: number | null;
  evToSales?: number | null;
  catalysts?: string | null;
  notes?: string | null;
  dataSource?: string | null;
  dataDate?: string | null;
}

export interface TenXScreenerResult extends TenXCompanyInput {
  score: number;
  survivalScore: number;
  growthScore: number;
  potentialScore: number;
  themePriority: number;
  themeReason: string | null;
  classification: TenXClassification;
  disqualified: boolean;
  alerts: string[];
  strengths: string[];
  risks: string[];
  missingData: string[];
  explanation: string;
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
  session: MarketSessionSummary;
  warnings: string[];
}

export interface DashboardHistoryEntry {
  dateKey: string;
  label: string;
  regime: Regime;
  score: number;
}
