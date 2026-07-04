// Client-side Binance API fetchers (browser).
// Tries Futures Perpetuo (fapi.binance.com) first, falls back to Spot (api.binance.com).
// This matches what Coinglass uses: "Binance BTC/USDT Perpetuo".

import type { BinanceKline } from "./binance";

const BINANCE_FUTURES = "https://fapi.binance.com";
const BINANCE_SPOT = "https://api.binance.com";

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getMarkPrice(symbol: string): Promise<number | null> {
  // Futures mark price (premiumIndex) — same source Coinglass uses
  const futures = await fetchJson<{ markPrice: string }>(
    `${BINANCE_FUTURES}/fapi/v1/premiumIndex?symbol=${symbol}`,
  );
  if (futures) {
    const price = Number(futures.markPrice);
    if (Number.isFinite(price) && price > 0) return price;
  }
  // Fallback to spot ticker
  const spot = await fetchJson<{ price: string }>(
    `${BINANCE_SPOT}/api/v3/ticker/price?symbol=${symbol}`,
  );
  if (!spot) return null;
  const p = Number(spot.price);
  return Number.isFinite(p) && p > 0 ? p : null;
}

function parseKlines(raw: unknown[][]): BinanceKline[] {
  return raw.map((entry) => ({
    time: Math.floor(Number(entry[0]) / 1000),
    open: Number(entry[1]),
    high: Number(entry[2]),
    low: Number(entry[3]),
    close: Number(entry[4]),
    volume: Number(entry[5]) || undefined,
  }));
}

export async function getKlines(
  symbol: string,
  interval: string = "15m",
  limit: number = 200,
): Promise<BinanceKline[] | null> {
  const params = new URLSearchParams({ symbol, interval, limit: String(limit) });

  // Try futures klines first (Perpetuo)
  let raw = await fetchJson<unknown[][]>(
    `${BINANCE_FUTURES}/fapi/v1/klines?${params}`,
  );
  if (!raw) {
    // Fallback to spot klines
    raw = await fetchJson<unknown[][]>(
      `${BINANCE_SPOT}/api/v3/klines?${params}`,
    );
  }
  if (!raw) return null;
  try {
    return parseKlines(raw);
  } catch {
    return null;
  }
}
