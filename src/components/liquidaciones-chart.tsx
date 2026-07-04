"use client";

import { useEffect, useRef, useState } from "react";
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
}

const LONG_COLORS = ["#065f46", "#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"];
const SHORT_COLORS = ["#7f1d1d", "#b91c1c", "#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca"];

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

export function LiquidacionesChart({
  klines,
  longClusters,
  shortClusters,
  currentPrice,
  symbol,
  interval,
}: LiquidacionesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);
  const [wsStatus, setWsStatus] = useState<WsStatus>("connecting");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 420,
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
  // Usa stream.binance.com (Spot) porque fstream.binance.com (Futures)
  // conecta pero no envia datos en ciertos entornos/regiones.
  // El formato del mensaje es identico y los precios spot/futures son equivalentes.
  useEffect(() => {
    const pair = SYMBOL_TO_PAIR[symbol].toLowerCase(); // ej: btcusdt
    const streamName = `${pair}@kline_${interval}`;
    // FIXED: usar stream.binance.com (Spot) en lugar de fstream.binance.com (Futures)
    // fstream conecta (onopen OK) pero no pushea mensajes en ciertos ambientes
    const wsUrl = `wss://stream.binance.com:9443/ws/${streamName}`;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let unmounted = false;

    console.log(`[WS] Iniciando conexion: ${wsUrl}`);
    setWsStatus("connecting");

    function connect() {
      if (unmounted) return;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`[WS] Conectado a ${wsUrl}`);
        setWsStatus("connected");
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        const series = seriesRef.current;
        if (!series) {
          console.warn("[WS] onmessage: seriesRef.current es null, ignorando mensaje");
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
            console.log("[WS] Mensaje ignorado (e!=kline):", msg.e);
            return;
          }
          const k = msg.k;
          if (!k) {
            console.warn("[WS] Mensaje kline sin campo k:", msg);
            return;
          }
          series.update({
            time: Math.floor(k.t / 1000) as UTCTimestamp,
            open: Number(k.o),
            high: Number(k.h),
            low: Number(k.l),
            close: Number(k.c),
          });
        } catch (err) {
          console.error("[WS] Error parseando mensaje:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("[WS] onerror:", err);
        setWsStatus("disconnected");
        ws?.close();
      };

      ws.onclose = (event) => {
        console.log(`[WS] Conexion cerrada. code=${event.code} reason="${event.reason}" wasClean=${event.wasClean}`);
        ws = null;
        setWsStatus("disconnected");
        if (!unmounted) {
          console.log(`[WS] Reconectando en ${WS_RECONNECT_DELAY_MS}ms...`);
          setWsStatus("connecting");
          reconnectTimer = setTimeout(connect, WS_RECONNECT_DELAY_MS);
        }
      };
    }

    connect();

    return () => {
      unmounted = true;
      console.log("[WS] Limpiando WebSocket (cambio de symbol/interval o desmontaje)");
      if (reconnectTimer !== null) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null; // evitar reconexion al cerrar intencionalmente
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
      const color = LONG_COLORS[Math.min(index, LONG_COLORS.length - 1)];
      newLines.push(
        series.createPriceLine({
          price: cluster.price,
          color,
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `LONG ${formatLeverages(cluster.leverages)}`,
        }),
      );
    });

    shortClusters.forEach((cluster, index) => {
      const color = SHORT_COLORS[Math.min(index, SHORT_COLORS.length - 1)];
      newLines.push(
        series.createPriceLine({
          price: cluster.price,
          color,
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `SHORT ${formatLeverages(cluster.leverages)}`,
        }),
      );
    });

    priceLinesRef.current = newLines;
  }, [longClusters, shortClusters, currentPrice]);

  return (
    <div className="relative w-full">
      <WsIndicator status={wsStatus} />
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
