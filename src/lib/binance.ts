const BINANCE_FUTURES_BASE = "https://fapi.binance.com";

export interface BinanceKline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface BinancePremiumIndex {
  symbol: string;
  markPrice: number;
  indexPrice: number;
  lastFundingRate: number;
  time: number;
}

export interface BinanceOpenInterestHistEntry {
  symbol: string;
  sumOpenInterest: number;
  sumOpenInterestValue: number;
  timestamp: number;
}

async function fetchBinance<T>(path: string, params: Record<string, string>): Promise<T | null> {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${BINANCE_FUTURES_BASE}${path}?${query}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Binance HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getKlines(
  symbol: string,
  interval: string = "15m",
  limit: number = 200,
): Promise<BinanceKline[] | null> {
  const raw = await fetchBinance<unknown[][]>("/fapi/v1/klines", {
    symbol,
    interval,
    limit: String(limit),
  });

  if (!raw) {
    return null;
  }

  try {
    return raw.map((entry) => ({
      time: Math.floor(Number(entry[0]) / 1000),
      open: Number(entry[1]),
      high: Number(entry[2]),
      low: Number(entry[3]),
      close: Number(entry[4]),
    }));
  } catch {
    return null;
  }
}

export async function getMarkPrice(symbol: string): Promise<BinancePremiumIndex | null> {
  const raw = await fetchBinance<{
    symbol: string;
    markPrice: string;
    indexPrice: string;
    lastFundingRate: string;
    time: number;
  }>("/fapi/v1/premiumIndex", { symbol });

  if (!raw) {
    return null;
  }

  const markPrice = Number(raw.markPrice);

  if (!Number.isFinite(markPrice) || markPrice <= 0) {
    return null;
  }

  return {
    symbol: raw.symbol,
    markPrice,
    indexPrice: Number(raw.indexPrice),
    lastFundingRate: Number(raw.lastFundingRate),
    time: raw.time,
  };
}

export async function getOpenInterestHist(
  symbol: string,
  period: string = "15m",
  limit: number = 8,
): Promise<BinanceOpenInterestHistEntry[] | null> {
  const raw = await fetchBinance<
    Array<{
      symbol: string;
      sumOpenInterest: string;
      sumOpenInterestValue: string;
      timestamp: number;
    }>
  >("/futures/data/openInterestHist", {
    symbol,
    period,
    limit: String(limit),
  });

  if (!raw) {
    return null;
  }

  try {
    return raw.map((entry) => ({
      symbol: entry.symbol,
      sumOpenInterest: Number(entry.sumOpenInterest),
      sumOpenInterestValue: Number(entry.sumOpenInterestValue),
      timestamp: entry.timestamp,
    }));
  } catch {
    return null;
  }
}
