const BINANCE_FUTURES_BASE = "https://fapi.binance.com";
const BINANCE_SPOT_BASE = "https://api.binance.com";

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; consultor-macro/1.0)",
  Accept: "application/json",
};

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

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function buildUrl(base: string, path: string, params: Record<string, string>): string {
  const query = new URLSearchParams(params).toString();
  return `${base}${path}?${query}`;
}

export async function getKlines(
  symbol: string,
  interval: string = "15m",
  limit: number = 200,
): Promise<BinanceKline[] | null> {
  const params = { symbol, interval, limit: String(limit) };

  // Try Futures first, fall back to Spot
  const raw =
    (await fetchJson<unknown[][]>(buildUrl(BINANCE_FUTURES_BASE, "/fapi/v1/klines", params))) ??
    (await fetchJson<unknown[][]>(buildUrl(BINANCE_SPOT_BASE, "/api/v3/klines", params)));

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
  // Try Futures premiumIndex first
  const raw = await fetchJson<{
    symbol: string;
    markPrice: string;
    indexPrice: string;
    lastFundingRate: string;
    time: number;
  }>(buildUrl(BINANCE_FUTURES_BASE, "/fapi/v1/premiumIndex", { symbol }));

  if (raw) {
    const markPrice = Number(raw.markPrice);
    if (Number.isFinite(markPrice) && markPrice > 0) {
      return {
        symbol: raw.symbol,
        markPrice,
        indexPrice: Number(raw.indexPrice),
        lastFundingRate: Number(raw.lastFundingRate),
        time: raw.time,
      };
    }
  }

  // Fallback: Spot ticker price
  const spotRaw = await fetchJson<{ symbol: string; price: string }>(
    buildUrl(BINANCE_SPOT_BASE, "/api/v3/ticker/price", { symbol }),
  );

  if (!spotRaw) {
    return null;
  }

  const spotPrice = Number(spotRaw.price);

  if (!Number.isFinite(spotPrice) || spotPrice <= 0) {
    return null;
  }

  return {
    symbol: spotRaw.symbol,
    markPrice: spotPrice,
    indexPrice: spotPrice,
    lastFundingRate: 0,
    time: Date.now(),
  };
}

export async function getOpenInterestHist(
  symbol: string,
  period: string = "15m",
  limit: number = 8,
): Promise<BinanceOpenInterestHistEntry[] | null> {
  // Open Interest History is Futures-only; gracefully returns null if unavailable
  const raw = await fetchJson<
    Array<{
      symbol: string;
      sumOpenInterest: string;
      sumOpenInterestValue: string;
      timestamp: number;
    }>
  >(buildUrl(BINANCE_FUTURES_BASE, "/futures/data/openInterestHist", { symbol, period, limit: String(limit) }));

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
