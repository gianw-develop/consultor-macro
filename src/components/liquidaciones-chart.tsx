"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  ColorType,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type IPriceLine,
  type UTCTimestamp,
} from "lightweight-charts";
import type { BinanceKline } from "@/lib/binance";
import type { LiquidationCluster, SupportedSymbol } from "@/lib/liquidation-clusters";
import { SYMBOL_TO_PAIR } from "@/lib/liquidation-clusters";

interface LiquidacionesChartProps {
  klines: BinanceKline[];
  longClusters: LiquidationCluster[];
  shortClusters: LiquidationCluster[];
  currentPrice: number;
  symbol: SupportedSymbol;
  interval: string;
  liquidatedPrices: Set<number>;
}

const LONG_COLORS = ["#065f46", "#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"];
const SHORT_COLORS = ["#7f1d1d", "#b91c1c", "#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca"];

const DEFAULT_HEIGHT = 650;
const WS_RECONNECT_DELAY_MS = 3000;

type WsStatus = "connecting" | "connected" | "disconnected";

function formatLeverages(leverages: number[]): string {
  return leverages.map((lev) => `x${lev}`).join("/");
}

function WsIndicator({ status }: { status: WsStatus }) {
  const colorClass =
    status === "connected"
      ? "bg-emerald-500"
      : status === "connecting"
        ? "bg-amber-400"
        : "bg-rose-500";

  const label =
    status === "connected"
      ? "WS en vivo"
      : status === "connecting"
        ? "Conectando..."
        : "WS desconectado";

  return (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-slate-600 shadow-sm backdrop-blur-sm">
      <span className={`inline-block h-2 w-2 rounded-full ${colorClass}`} />
      {label}
    </div>
  );
}

function FullscreenButton({ onClick, isFullscreen }: { onClick: () => void; isFullscreen: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      className="absolute top-2 left-2 z-10 flex items-center justify-center rounded-full bg-white/80 p-1.5 text-slate-500 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-slate-900"
    >
      {isFullscreen ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 14 10 14 10 20" />
          <polyline points="20 10 14 10 14 4" />
          <line x1="14" y1="10" x2="21" y2="3" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      )}
    </button>
  );
}

export function LiquidacionesChart({
  klines,
  longClusters,
  shortClusters,
  currentPrice,
  symbol,
  interval,
  liquidatedPrices,
}: LiquidacionesChartProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);
  const [wsStatus, setWsStatus] = useState<WsStatus>("connecting");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (!document.fullscreenElement) {
      void wrapper.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    function handleChange() {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      const chart = chartRef.current;
      const container = containerRef.current;
      if (chart && container) {
        const newHeight = fs ? window.innerHeight : DEFAULT_HEIGHT;
        chart.applyOptions({ width: container.clientWidth, height: newHeight });
        chart.timeScale().fitContent();
      }
    }
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const chart = createChart(container, {
      width: container.clientWidth,
      height: DEFAULT_HEIGHT,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#0f172a",
        fontFamily: "var(--font-inter, Inter, sans-serif)",
      },
      grid: {
        vertLines: { color: "#e2e8f0" },
        horzLines: { color: "#e2e8f0" },
      },
      rightPriceScale: {
        borderColor: "#e2e8f0",
      },
      timeScale: {
        borderColor: "#e2e8f0",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 0,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      priceLinesRef.current = [];
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series || klines.length === 0) {
      return;
    }

    series.setData(
      klines.map((k) => ({
        time: k.time as UTCTimestamp,
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
      })),
    );

    chartRef.current?.timeScale().fitContent();
  }, [klines]);

  // WebSocket para actualizacion de velas en tiempo real
  useEffect(() => {
    const pair = SYMBOL_TO_PAIR[symbol].toLowerCase();
    const streamName = `${pair}@kline_${interval}`;
    const wsUrl = `wss://stream.binance.com:9443/ws/${streamName}`;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let unmounted = false;

    setWsStatus("connecting");

    function connect() {
      if (unmounted) return;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsStatus("connected");
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        const series = seriesRef.current;
        if (!series) {
          return;
        }
        try {
          const msg = JSON.parse(event.data) as {
            e?: string;
            k?: {
              t: number;
              o: string;
              h: string;
              l: string;
              c: string;
            };
          };
          if (msg.e !== "kline") {
            return;
          }
          const k = msg.k;
          if (!k) {
            return;
          }
          series.update({
            time: Math.floor(k.t / 1000) as UTCTimestamp,
            open: Number(k.o),
            high: Number(k.h),
            low: Number(k.l),
            close: Number(k.c),
          });
        } catch {
          // ignore malformed messages
        }
      };

      ws.onerror = () => {
        setWsStatus("disconnected");
        ws?.close();
      };

      ws.onclose = () => {
        ws = null;
        setWsStatus("disconnected");
        if (!unmounted) {
          setWsStatus("connecting");
          reconnectTimer = setTimeout(connect, WS_RECONNECT_DELAY_MS);
        }
      };
    }

    connect();

    return () => {
      unmounted = true;
      if (reconnectTimer !== null) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
        ws = null;
      }
    };
  }, [symbol, interval]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) {
      return;
    }

    for (const line of priceLinesRef.current) {
      series.removePriceLine(line);
    }
    priceLinesRef.current = [];

    const newLines: IPriceLine[] = [];

    longClusters.forEach((cluster, index) => {
      const liq = liquidatedPrices.has(cluster.price);
      const color = liq ? "#94a3b8" : LONG_COLORS[Math.min(index, LONG_COLORS.length - 1)];
      const label = `LONG ${formatLeverages(cluster.leverages)}${liq ? " (LIQ)" : ""}`;
      newLines.push(
        series.createPriceLine({
          price: cluster.price,
          color,
          lineWidth: liq ? 1 : 2,
          lineStyle: liq ? LineStyle.Dotted : LineStyle.Dashed,
          axisLabelVisible: true,
          title: label,
        }),
      );
    });

    shortClusters.forEach((cluster, index) => {
      const liq = liquidatedPrices.has(cluster.price);
      const color = liq ? "#94a3b8" : SHORT_COLORS[Math.min(index, SHORT_COLORS.length - 1)];
      const label = `SHORT ${formatLeverages(cluster.leverages)}${liq ? " (LIQ)" : ""}`;
      newLines.push(
        series.createPriceLine({
          price: cluster.price,
          color,
          lineWidth: liq ? 1 : 2,
          lineStyle: liq ? LineStyle.Dotted : LineStyle.Dashed,
          axisLabelVisible: true,
          title: label,
        }),
      );
    });

    priceLinesRef.current = newLines;
  }, [longClusters, shortClusters, currentPrice, liquidatedPrices]);

  return (
    <div ref={wrapperRef} className="relative w-full bg-white">
      <FullscreenButton onClick={toggleFullscreen} isFullscreen={isFullscreen} />
      <WsIndicator status={wsStatus} />
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
