"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LiquidacionesChart } from "@/components/liquidaciones-chart";
import { getMarkPrice, getKlines } from "@/lib/binance-client";
import {
  DEFAULT_LEVELS,
  MAX_LEVELS,
  MIN_LEVELS,
  SUPPORTED_SYMBOLS,
  SYMBOL_TO_PAIR,
  calculateMultiEntryClusters,
  clampLevels,
  getLeverageGrid,
  type LiquidacionesData,
  type LiquidacionesError,
  type LiquidationCluster,
  type SupportedSymbol,
} from "@/lib/liquidation-clusters";

const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

const INTERVALS = ["5m", "15m", "1h", "4h"] as const;
type Interval = (typeof INTERVALS)[number];
const INTERVAL_LABELS: Record<Interval, string> = { "5m": "5m", "15m": "15m", "1h": "1H", "4h": "4H" };

function isErrorPayload(
  payload: LiquidacionesData | LiquidacionesError,
): payload is LiquidacionesError {
  return "error" in payload;
}

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: price < 10 ? 4 : 2,
    maximumFractionDigits: price < 10 ? 4 : 2,
  });
}

export function LiquidacionesClient({
  initialSymbol,
}: {
  initialSymbol: SupportedSymbol;
}) {
  const [symbol, setSymbol] = useState<SupportedSymbol>(initialSymbol);
  const [levels, setLevels] = useState<number>(DEFAULT_LEVELS);
  const [interval, setIntervalValue] = useState<Interval>("15m");
  const [activeLeverages, setActiveLeverages] = useState<number[]>(
    () => getLeverageGrid(SYMBOL_TO_PAIR[initialSymbol]),
  );
  const [data, setData] = useState<LiquidacionesData | LiquidacionesError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(
    async (
      targetSymbol: SupportedSymbol,
      targetLevels: number,
      targetInterval: Interval,
      targetLeverages: number[],
    ) => {
      setIsLoading(true);

      try {
        const pairSymbol = SYMBOL_TO_PAIR[targetSymbol];

        const [price, klines] = await Promise.all([
          getMarkPrice(pairSymbol),
          getKlines(pairSymbol, targetInterval, 200),
        ]);

        if (!price) {
          setData({ error: "No se pudo obtener el precio actual desde Binance." });
          return;
        }

        if (!klines) {
          setData({ error: "No se pudo obtener el historial de velas desde Binance." });
          return;
        }

        const clamped = clampLevels(targetLevels);
        const { longClusters, shortClusters, totalLongCandidateClusters, totalShortCandidateClusters } =
          calculateMultiEntryClusters(pairSymbol, price, klines, clamped, targetLeverages);

        setData({
          symbol: targetSymbol,
          currentPrice: price,
          openInterest: null,
          requestedLevels: clamped,
          longClusters,
          shortClusters,
          totalLongCandidateClusters,
          totalShortCandidateClusters,
          klines,
          updatedAt: new Date().toISOString(),
        });
        setLastUpdated(new Date());
      } catch {
        setData({ error: "Error al obtener datos de Binance. Reintenta en unos segundos." });
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Fetch on mount
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      void fetchData(symbol, levels, interval, activeLeverages);
      return;
    }

    void fetchData(symbol, levels, interval, activeLeverages);
  }, [symbol, levels, interval, activeLeverages, fetchData]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void fetchData(symbol, levels, interval, activeLeverages);
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [symbol, levels, interval, activeLeverages, fetchData]);

  function handleSymbolChange(newSymbol: SupportedSymbol) {
    const newGrid = getLeverageGrid(SYMBOL_TO_PAIR[newSymbol]);
    setSymbol(newSymbol);
    setActiveLeverages(newGrid);
  }

  function toggleLeverage(lev: number) {
    setActiveLeverages((prev) => {
      if (prev.includes(lev)) {
        if (prev.length === 1) return prev;
        return prev.filter((l) => l !== lev);
      }
      return [...prev, lev].sort((a, b) => a - b);
    });
  }

  const hasError = data !== null && isErrorPayload(data);
  const validData = data !== null && !hasError ? (data as LiquidacionesData) : null;
  const currentGrid = getLeverageGrid(SYMBOL_TO_PAIR[symbol]);

  const liquidatedPrices = useMemo(() => {
    const set = new Set<number>();
    if (!validData) return set;
    const { klines: k, longClusters: longs, shortClusters: shorts } = validData;
    if (k.length === 0) return set;

    // Solo verificar velas de las ultimas 4 horas.
    // Los niveles se calculan del precio actual, asi que comparar contra
    // velas de hace dias (cuando el precio era muy diferente) da falsos positivos.
    const fourHoursAgo = Math.floor(Date.now() / 1000) - 4 * 60 * 60;
    const recent = k.filter((candle) => candle.time >= fourHoursAgo);
    if (recent.length === 0) return set;

    for (const cluster of longs) {
      if (recent.some((candle) => candle.low <= cluster.price)) {
        set.add(cluster.price);
      }
    }
    for (const cluster of shorts) {
      if (recent.some((candle) => candle.high >= cluster.price)) {
        set.add(cluster.price);
      }
    }
    return set;
  }, [validData]);

  function clusterCardClass(cluster: LiquidationCluster, side: "long" | "short"): string {
    const liq = liquidatedPrices.has(cluster.price);
    if (liq) {
      return "rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3";
    }
    if (side === "long") {
      return "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3";
    }
    return "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3";
  }

  function clusterLabelClass(cluster: LiquidationCluster, side: "long" | "short"): string {
    const liq = liquidatedPrices.has(cluster.price);
    if (liq) return "text-xs font-semibold uppercase tracking-[0.12em] text-slate-400";
    if (side === "long") return "text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700";
    return "text-xs font-semibold uppercase tracking-[0.12em] text-rose-700";
  }

  function clusterPriceClass(cluster: LiquidationCluster, side: "long" | "short"): string {
    const liq = liquidatedPrices.has(cluster.price);
    if (liq) return "mt-1 text-lg font-semibold text-slate-400 line-through";
    if (side === "long") return "mt-1 text-lg font-semibold text-emerald-900";
    return "mt-1 text-lg font-semibold text-rose-900";
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {SUPPORTED_SYMBOLS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSymbolChange(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    symbol === item
                      ? "bg-slate-950 text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item}
                </button>
              ))}

              <span className="mx-1 h-5 w-px bg-slate-200" />

              {INTERVALS.map((iv) => (
                <button
                  key={iv}
                  type="button"
                  onClick={() => setIntervalValue(iv)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    interval === iv
                      ? "bg-slate-950 text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {INTERVAL_LABELS[iv]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
                Niveles por lado
                <input
                  type="range"
                  min={MIN_LEVELS}
                  max={MAX_LEVELS}
                  value={levels}
                  onChange={(event) => setLevels(Number(event.target.value))}
                  className="w-28 accent-slate-950"
                />
                <span className="w-4 text-center font-semibold text-slate-700">{levels}</span>
              </label>

              <button
                type="button"
                onClick={() => fetchData(symbol, levels, interval, activeLeverages)}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isLoading ? "Actualizando..." : "Actualizar"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">Apalancamientos</span>
            <div className="flex flex-wrap gap-1.5">
              {currentGrid.map((lev) => {
                const isActive = activeLeverages.includes(lev);
                return (
                  <button
                    key={lev}
                    type="button"
                    onClick={() => toggleLeverage(lev)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    x{lev}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {data === null && isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Cargando datos de Binance...
        </div>
      ) : null}

      {hasError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {(data as LiquidacionesError).error}
        </div>
      ) : null}

      {validData ? (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Mark Price
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                ${formatPrice(validData.currentPrice)}
              </p>
            </div>
            {validData.longClusters.map((cluster) => (
              <div
                key={`long-${cluster.price}`}
                className={clusterCardClass(cluster, "long")}
              >
                <p className={clusterLabelClass(cluster, "long")}>
                  LONG {cluster.leverages.map((l) => `x${l}`).join("/")}{liquidatedPrices.has(cluster.price) ? " · LIQUIDADO" : ""}
                </p>
                <p className={clusterPriceClass(cluster, "long")}>
                  ${formatPrice(cluster.price)}
                </p>
              </div>
            ))}
            {validData.shortClusters.map((cluster) => (
              <div
                key={`short-${cluster.price}`}
                className={clusterCardClass(cluster, "short")}
              >
                <p className={clusterLabelClass(cluster, "short")}>
                  SHORT {cluster.leverages.map((l) => `x${l}`).join("/")}{liquidatedPrices.has(cluster.price) ? " · LIQUIDADO" : ""}
                </p>
                <p className={clusterPriceClass(cluster, "short")}>
                  ${formatPrice(cluster.price)}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <LiquidacionesChart
              klines={validData.klines}
              longClusters={validData.longClusters}
              shortClusters={validData.shortClusters}
              currentPrice={validData.currentPrice}
              symbol={symbol}
              interval={interval}
              liquidatedPrices={liquidatedPrices}
            />
          </div>
        </>
      ) : null}

      <footer className="rounded-[28px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm sm:px-7">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Mapa de liquidez 1 dia · Binance {symbol}/USDT Perpetuo. Niveles aproximados.
          </span>
          <span>
            Velas en tiempo real via WebSocket. Niveles refrescados cada 15 min.
            {lastUpdated ? ` · ${lastUpdated.toLocaleTimeString()}` : ""}
          </span>
        </div>
      </footer>
    </section>
  );
}
