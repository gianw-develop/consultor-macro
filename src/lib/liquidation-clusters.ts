// Aproximacion de niveles de liquidacion basada en datos publicos de Binance Futures.
// Binance no expone la distribucion real de leverage por cuenta ni un endpoint de
// "liquidation heatmap" (eso es propietario de Coinglass). Este modulo genera un grid
// heuristico de leverages candidatos, calcula el precio de liquidacion aproximado por
// margen aislado para cada uno, y agrupa (clusteriza) los que caen muy cerca en precio
// para mostrar solo los niveles mas relevantes por lado (LONG / SHORT).

import { getKlines, getMarkPrice, getOpenInterestHist, type BinanceKline } from "@/lib/binance";

export const SUPPORTED_SYMBOLS = ["BTC", "ETH", "XRP", "SUI", "AAVE"] as const;
export type SupportedSymbol = (typeof SUPPORTED_SYMBOLS)[number];

export const SYMBOL_TO_PAIR: Record<SupportedSymbol, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  XRP: "XRPUSDT",
  SUI: "SUIUSDT",
  AAVE: "AAVEUSDT",
};

// Maintenance margin rate aproximado (tier mas bajo de notional). Binance no expone
// esto sin API key firmada (/fapi/v1/leverageBracket es USER_DATA); son constantes
// hardcodeadas basadas en las tablas publicas de trading rules de Binance.
const MMR_TABLE: Record<string, number> = {
  BTCUSDT: 0.004,
  ETHUSDT: 0.005,
  XRPUSDT: 0.01,
  SUIUSDT: 0.01,
  AAVEUSDT: 0.01,
};

// Grid de leverages candidatos por simbolo. Solo se muestran 3 niveles representativos:
// x25, x50, x100 para BTC/ETH (soportan hasta x100-125 en Binance);
// x25 y x50 para altcoins cuyo limite practico no alcanza x100.
const LEVERAGE_GRID: Record<string, number[]> = {
  BTCUSDT: [25, 50, 100],
  ETHUSDT: [25, 50, 100],
  XRPUSDT: [25, 50],
  SUIUSDT: [25, 50],
  AAVEUSDT: [25, 50],
};

// Peso heuristico por leverage ajustado para los 3 niveles restantes.
const LEVERAGE_WEIGHT: Record<number, number> = {
  25: 0.9,
  50: 0.5,
  100: 0.2,
};

// Tolerancia de clustering: dos niveles de precio se fusionan en un mismo cluster si
// difieren menos de este porcentaje del precio actual.
const CLUSTER_TOLERANCE_PCT = 0.003; // 0.3%

export const MIN_LEVELS = 3;
export const MAX_LEVELS = 7;
export const DEFAULT_LEVELS = 5;

export interface LiquidationCluster {
  price: number;
  strength: number; // 0-100, normalizado dentro del lado (LONG o SHORT)
  leverages: number[]; // leverages fusionados en este cluster, ej. [20, 25]
  estimatedMagnitude: number | null; // informativo, basado en OI historico
}

interface Candidate {
  price: number;
  leverage: number;
  weight: number;
}

export function clampLevels(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_LEVELS;
  }
  return Math.min(MAX_LEVELS, Math.max(MIN_LEVELS, Math.round(value)));
}

export function getMmr(pairSymbol: string): number {
  return MMR_TABLE[pairSymbol] ?? 0.01;
}

export function getLeverageGrid(pairSymbol: string): number[] {
  return LEVERAGE_GRID[pairSymbol] ?? LEVERAGE_GRID.BTCUSDT;
}

function generateCandidates(
  pairSymbol: string,
  markPrice: number,
  filteredLeverages?: number[],
): { longCandidates: Candidate[]; shortCandidates: Candidate[] } {
  const mmr = getMmr(pairSymbol);
  const grid = getLeverageGrid(pairSymbol);
  const activeGrid =
    filteredLeverages && filteredLeverages.length > 0
      ? grid.filter((l) => filteredLeverages.includes(l))
      : grid;

  const longCandidates: Candidate[] = [];
  const shortCandidates: Candidate[] = [];

  for (const leverage of activeGrid) {
    const weight = LEVERAGE_WEIGHT[leverage] ?? 0.3;
    const longPrice = markPrice * (1 - 1 / leverage + mmr);
    const shortPrice = markPrice * (1 + 1 / leverage - mmr);

    longCandidates.push({ price: longPrice, leverage, weight });
    shortCandidates.push({ price: shortPrice, leverage, weight });
  }

  return { longCandidates, shortCandidates };
}

function clusterAndRank(
  candidates: Candidate[],
  currentPrice: number,
  topN: number,
  openInterestScale: number | null,
  tolerancePct: number = CLUSTER_TOLERANCE_PCT,
): { clusters: LiquidationCluster[]; totalClusters: number } {
  const sorted = [...candidates].sort((a, b) => a.price - b.price);

  type RawCluster = {
    weightedPriceSum: number;
    weight: number;
    leverages: number[];
    anchorPrice: number;
  };

  const rawClusters: RawCluster[] = [];

  for (const candidate of sorted) {
    const active = rawClusters[rawClusters.length - 1];
    const withinTolerance =
      active !== undefined &&
      Math.abs(candidate.price - active.anchorPrice) / currentPrice <= tolerancePct;

    if (active && withinTolerance) {
      active.weightedPriceSum += candidate.price * candidate.weight;
      active.weight += candidate.weight;
      active.leverages.push(candidate.leverage);
      active.anchorPrice = active.weightedPriceSum / active.weight;
    } else {
      rawClusters.push({
        weightedPriceSum: candidate.price * candidate.weight,
        weight: candidate.weight,
        leverages: [candidate.leverage],
        anchorPrice: candidate.price,
      });
    }
  }

  const maxWeight = Math.max(...rawClusters.map((c) => c.weight), 1e-9);

  const clusters: LiquidationCluster[] = rawClusters.map((cluster) => ({
    price: cluster.weightedPriceSum / cluster.weight,
    strength: Math.round((100 * cluster.weight) / maxWeight),
    leverages: [...new Set(cluster.leverages)].sort((a, b) => a - b),
    estimatedMagnitude:
      openInterestScale !== null
        ? Math.round(((100 * cluster.weight) / maxWeight) * openInterestScale)
        : null,
  }));

  clusters.sort((a, b) => b.strength - a.strength);

  const totalClusters = clusters.length;
  const topClusters = clusters.slice(0, topN);
  topClusters.sort((a, b) => b.strength - a.strength);

  return { clusters: topClusters, totalClusters };
}

export function calculateClusters(
  pairSymbol: string,
  markPrice: number,
  levels: number,
  openInterestScale: number | null,
  filteredLeverages?: number[],
): {
  longClusters: LiquidationCluster[];
  shortClusters: LiquidationCluster[];
  totalLongCandidateClusters: number;
  totalShortCandidateClusters: number;
} {
  const topN = clampLevels(levels);
  const { longCandidates, shortCandidates } = generateCandidates(
    pairSymbol,
    markPrice,
    filteredLeverages,
  );

  const long = clusterAndRank(longCandidates, markPrice, topN, openInterestScale);
  const short = clusterAndRank(shortCandidates, markPrice, topN, openInterestScale);

  return {
    longClusters: long.clusters,
    shortClusters: short.clusters,
    totalLongCandidateClusters: long.totalClusters,
    totalShortCandidateClusters: short.totalClusters,
  };
}

// ---------------------------------------------------------------------------
// Multi-entry liquidation calculation (similar al "Mapa de liquidez 1 dia"
// de Coinglass). En lugar de calcular niveles solo desde el precio actual,
// genera candidatos desde el precio de cierre de cada vela de las ultimas
// 24h, ponderados por volumen. Esto crea clusters que representan DONDE
// se concentraria la mayor liquidacion si se consideran todas las posiciones
// abiertas en el ultimo dia.
// ---------------------------------------------------------------------------

function generateMultiEntryCandidates(
  pairSymbol: string,
  entries: { price: number; weight: number }[],
  filteredLeverages?: number[],
): { longCandidates: Candidate[]; shortCandidates: Candidate[] } {
  const mmr = getMmr(pairSymbol);
  const grid = getLeverageGrid(pairSymbol);
  const activeGrid =
    filteredLeverages && filteredLeverages.length > 0
      ? grid.filter((l) => filteredLeverages.includes(l))
      : grid;

  const longCandidates: Candidate[] = [];
  const shortCandidates: Candidate[] = [];

  for (const entry of entries) {
    for (const leverage of activeGrid) {
      const levWeight = LEVERAGE_WEIGHT[leverage] ?? 0.3;
      const longPrice = entry.price * (1 - 1 / leverage + mmr);
      const shortPrice = entry.price * (1 + 1 / leverage - mmr);

      longCandidates.push({ price: longPrice, leverage, weight: levWeight * entry.weight });
      shortCandidates.push({ price: shortPrice, leverage, weight: levWeight * entry.weight });
    }
  }

  return { longCandidates, shortCandidates };
}

export function calculateMultiEntryClusters(
  pairSymbol: string,
  currentPrice: number,
  klines: BinanceKline[],
  levels: number,
  filteredLeverages?: number[],
): {
  longClusters: LiquidationCluster[];
  shortClusters: LiquidationCluster[];
  totalLongCandidateClusters: number;
  totalShortCandidateClusters: number;
} {
  const topN = clampLevels(levels);

  // Filtrar velas de las ultimas 24h
  const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
  const recentKlines = klines.filter((k) => k.time >= oneDayAgo);

  let entries: { price: number; weight: number }[];

  if (recentKlines.length > 0) {
    const totalVolume = recentKlines.reduce((s, k) => s + (k.volume ?? 1), 0) || 1;
    entries = recentKlines.map((k) => ({
      price: k.close,
      weight: (k.volume ?? 1) / totalVolume,
    }));
  } else {
    // Fallback: single entry at current price
    entries = [{ price: currentPrice, weight: 1 }];
  }

  const { longCandidates, shortCandidates } = generateMultiEntryCandidates(
    pairSymbol,
    entries,
    filteredLeverages,
  );

  // Tolerancia mas amplia (1.5%) para multi-entry: los candidatos de cada
  // leverage se extienden por el rango de precios de 24h y necesitan una
  // ventana mayor para agruparse correctamente en un solo cluster por leverage.
  const MULTI_ENTRY_TOLERANCE = 0.015;

  const long = clusterAndRank(longCandidates, currentPrice, topN, null, MULTI_ENTRY_TOLERANCE);
  const short = clusterAndRank(shortCandidates, currentPrice, topN, null, MULTI_ENTRY_TOLERANCE);

  return {
    longClusters: long.clusters,
    shortClusters: short.clusters,
    totalLongCandidateClusters: long.totalClusters,
    totalShortCandidateClusters: short.totalClusters,
  };
}

export interface LiquidacionesData {
  symbol: SupportedSymbol;
  currentPrice: number;
  openInterest: number | null;
  requestedLevels: number;
  longClusters: LiquidationCluster[];
  shortClusters: LiquidationCluster[];
  totalLongCandidateClusters: number;
  totalShortCandidateClusters: number;
  klines: BinanceKline[];
  updatedAt: string;
}

export interface LiquidacionesError {
  error: string;
}

export async function calculateLiquidationLevels(
  symbol: SupportedSymbol,
  levels: number,
  interval: string = "15m",
  leverages?: number[],
): Promise<LiquidacionesData | LiquidacionesError> {
  const pairSymbol = SYMBOL_TO_PAIR[symbol];
  const topN = clampLevels(levels);

  const [markPriceInfo, klines, openInterestHist] = await Promise.all([
    getMarkPrice(pairSymbol),
    getKlines(pairSymbol, interval, 200),
    getOpenInterestHist(pairSymbol, "15m", 8),
  ]);

  if (!markPriceInfo) {
    return { error: "No se pudo obtener el precio actual desde Binance." };
  }

  if (!klines) {
    return { error: "No se pudo obtener el historial de velas desde Binance." };
  }

  const currentPrice = markPriceInfo.markPrice;

  let openInterest: number | null = null;
  let openInterestScale: number | null = null;

  if (openInterestHist && openInterestHist.length > 0) {
    const avgOiValue =
      openInterestHist.reduce((sum, entry) => sum + entry.sumOpenInterestValue, 0) /
      openInterestHist.length;
    const avgOi =
      openInterestHist.reduce((sum, entry) => sum + entry.sumOpenInterest, 0) /
      openInterestHist.length;

    openInterest = avgOi;
    // Escala informativa: se normaliza por el valor nocional de OI en millones de USD.
    openInterestScale = avgOiValue / 1_000_000;
  }

  const { longClusters, shortClusters, totalLongCandidateClusters, totalShortCandidateClusters } =
    calculateClusters(pairSymbol, currentPrice, topN, openInterestScale, leverages);

  return {
    symbol,
    currentPrice,
    openInterest,
    requestedLevels: topN,
    longClusters,
    shortClusters,
    totalLongCandidateClusters,
    totalShortCandidateClusters,
    klines,
    updatedAt: new Date().toISOString(),
  };
}
