// Client-side Binance API fetchers.
// Run in the user's browser where Binance API access is unrestricted
// (Vercel serverless IPs are blocked by Binance).

import type { BinanceKline } from "./binance";

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

export async function getSpotPrice(symbol: string): Promise<number | null> {
  const data = await fetchJson<{ price: string }>(
    `${BINANCE_SPOT}/api/v3/ticker/price?symbol=${symbol}`,
  );
  if (!data) return null;
  const price = Number(data.price);
  return Number.isFinite(price) && price > 0 ? price : null;
}

export async function getSpotKlines(
  symbol: string,
  interval: string = "15m",
  limit: number = 200,
): Promise<BinanceKline[] | null> {
  const params = new URLSearchParams({ symbol, interval, limit: String(limit) });
  const raw = await fetchJson<unknown[][]>(
    `${BINANCE_SPOT}/api/v3/klines?${params}`,
  );
  if (!raw) return null;
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
