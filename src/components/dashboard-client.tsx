"use client";

import { useEffect, useMemo, useState } from "react";
import { EVENT_DISPLAY_NAMES, getDayVerdict } from "@/lib/market";
import { formatEtDateLabel, formatEtTimeLabel } from "@/lib/date";
import type { DashboardData, DashboardHistoryEntry, MarketSnapshot } from "@/lib/types";

const EVENT_RESULTS_STORAGE_KEY = "consultor-macro-event-results";
const HISTORY_STORAGE_KEY = "consultor-macro-history";

function getEventVerdict(eventName: string, forecast: string | undefined, actual: string | undefined): "bullish" | "bearish" | "neutral" {
  if (!forecast || !actual) return "neutral";
  
  const parseValue = (str: string) => {
    const cleaned = str.replace(/[^0-9.\-]/g, "");
    return parseFloat(cleaned);
  };
  
  const forecastVal = parseValue(forecast);
  const actualVal = parseValue(actual);
  
  if (isNaN(forecastVal) || isNaN(actualVal)) return "neutral";
  
  const lowerIsBullish = ["CPI", "Core CPI", "PPI", "Core PPI", "PCE", "Jobless Claims"].includes(eventName);
  const higherIsBullish = ["GDP"].includes(eventName);
  
  if (lowerIsBullish) {
    return actualVal < forecastVal ? "bullish" : actualVal > forecastVal ? "bearish" : "neutral";
  }
  
  if (higherIsBullish) {
    return actualVal > forecastVal ? "bullish" : actualVal < forecastVal ? "bearish" : "neutral";
  }
  
  return actualVal === forecastVal ? "neutral" : "neutral";
}

function getVerdictStyle(verdict: "bullish" | "bearish" | "neutral") {
  if (verdict === "bullish") return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (verdict === "bearish") return "bg-rose-100 text-rose-800 border-rose-300";
  return "bg-slate-100 text-slate-600 border-slate-300";
}

function getVerdictLabel(verdict: "bullish" | "bearish" | "neutral") {
  if (verdict === "bullish") return "🟢 BULLISH - Índices subirán";
  if (verdict === "bearish") return "🔴 BEARISH - Índices caerán";
  return "⚪ NEUTRAL - Sin cambio claro";
}


function getActionShort(title: string) {
  if (title.includes("COMPRAS")) return "COMPRAR retrocesos";
  if (title.includes("VENTAS")) return "VENDER rebotes";
  return "NO OPERAR";
}

function getTodayEvents(schedule: DashboardData['weeklySchedule']) {
  const todayIndex = new Date().getDay() - 1; // 0 is Monday
  if (todayIndex < 0 || todayIndex > 4) return [];
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const todayName = days[todayIndex];
  return schedule.find(d => d.day === todayName)?.events || [];
}

const regimeStyles = {
  expansion: {
    card: "border-green-200 bg-green-50 text-green-900",
    badge: "bg-green-100 text-green-800",
  },
  decline: {
    card: "border-red-200 bg-red-50 text-red-900",
    badge: "bg-red-100 text-red-800",
  },
  neutral: {
    card: "border-yellow-200 bg-yellow-50 text-yellow-900",
    badge: "bg-yellow-100 text-yellow-800",
  },
} as const;

const impactStyles = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
} as const;

function getMovementClass(movement: MarketSnapshot["movement"]) {
  if (movement === "up") {
    return "text-emerald-600";
  }

  if (movement === "down") {
    return "text-rose-600";
  }

  return "text-slate-500";
}

function getBiasBadge(snapshot: MarketSnapshot) {
  if (!snapshot.available) {
    return {
      label: "Sin datos",
      className: "bg-slate-100 text-slate-600",
    };
  }

  if (snapshot.bias === "expansion") {
    return {
      label: "✅ Expansión",
      className: "bg-green-100 text-green-700",
    };
  }

  if (snapshot.bias === "decline") {
    return {
      label: "🔴 Caída",
      className: "bg-red-100 text-red-700",
    };
  }

  if (snapshot.bias === "stable") {
    return {
      label: "➖ Estable",
      className: "bg-yellow-100 text-yellow-700",
    };
  }

  return {
    label: "⚪ Neutral",
    className: "bg-slate-100 text-slate-700",
  };
}

function loadHistory(): DashboardHistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as DashboardHistoryEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function persistHistory(entries: DashboardHistoryEntry[]) {
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
}

function mergeHistory(
  entries: DashboardHistoryEntry[],
  data: DashboardData,
): DashboardHistoryEntry[] {
  const nextEntry: DashboardHistoryEntry = {
    dateKey: data.etDateKey,
    label: data.condition.shortLabel,
    regime: data.condition.regime,
    score: data.condition.score,
  };

  const deduped = entries.filter((entry) => entry.dateKey !== nextEntry.dateKey);
  return [nextEntry, ...deduped].slice(0, 5);
}

function buildHistoryNote(entries: DashboardHistoryEntry[]) {
  if (entries.length <= 1) {
    return "Sin suficiente historial todavía.";
  }

  const [latest, previous] = entries;

  if (latest.regime === previous.regime) {
    return "Sin cambio de régimen.";
  }

  return `Cambio reciente: ${previous.label} → ${latest.label}.`;
}

export function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);
  const [refreshState, setRefreshState] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [history, setHistory] = useState<DashboardHistoryEntry[]>(() => {
    if (typeof window === "undefined") {
      return [
        {
          dateKey: initialData.etDateKey,
          label: initialData.condition.shortLabel,
          regime: initialData.condition.regime,
          score: initialData.condition.score,
        },
      ];
    }

    return mergeHistory(loadHistory(), initialData);
  });
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    persistHistory(history);
  }, [history]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const refreshData = async () => {
      setIsRefreshing(true);

      try {
        const response = await fetch("/api/dashboard", {
          cache: "no-store",
        });

        if (response.status === 401) {
          window.location.reload();
          return;
        }

        if (!response.ok) {
          throw new Error("refresh-failed");
        }

        const payload = (await response.json()) as DashboardData;
        setData(payload);
        setHistory((current) => mergeHistory(current, payload));
        setRefreshState(null);
      } catch {
        setRefreshState("No se pudo actualizar. Manteniendo último snapshot disponible.");
      } finally {
        setIsRefreshing(false);
      }
    };

    const interval = window.setInterval(refreshData, 300_000);

    return () => window.clearInterval(interval);
  }, []);

  const historyNote = useMemo(() => buildHistoryNote(history), [history]);
  const conditionStyle = regimeStyles[data.condition.regime];

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      window.location.reload();
    }
  };

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500">
                Consultor Macro
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Dashboard pre-market
              </h1>
              <p className="text-sm text-slate-600">
                {formatEtDateLabel(clock)} · {formatEtTimeLabel(clock)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
            </button>
          </div>
        </header>

        
        {/* Banner de Cambio de Régimen */}
        {history.length > 1 && history[0].regime !== history[1].regime && history[1].regime !== "neutral" ? (
          <div className="rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 text-orange-800 shadow-sm">
            <div className="flex items-center gap-2 font-bold mb-1">
              <span>⚠️ CAMBIO DE RÉGIMEN DETECTADO</span>
            </div>
            <div className="text-sm">
              Ayer: {history[1].label} → Hoy: {history[0].label}<br/>
              Precaución: flujo cambió de dirección
            </div>
          </div>
        ) : null}

        {/* Mini resumen ejecutivo */}
        <div className="rounded-lg bg-gray-100 py-2 px-4 text-sm font-medium text-slate-700 flex flex-wrap gap-2 items-center">
          <span>{formatEtDateLabel(clock)}</span>
          <span className="text-slate-400">·</span>
          <span>{formatEtTimeLabel(clock)}</span>
          <span className="text-slate-400">·</span>
          <span className={data.condition.title.includes("COMPRAS") ? "text-emerald-700 font-bold" : data.condition.title.includes("VENTAS") ? "text-rose-700 font-bold" : ""}>
            {getActionShort(data.condition.title)}
          </span>
          <span className="text-slate-400">·</span>
          <span>Score {data.condition.score}/4</span>
          <span className="text-slate-400">·</span>
          <span className={getTodayEvents(data.weeklySchedule).length > 0 ? "text-amber-700" : ""}>
            {getTodayEvents(data.weeklySchedule).length > 0 
              ? `⚠️ ${getTodayEvents(data.weeklySchedule)[0].name} ${getTodayEvents(data.weeklySchedule)[0].timeEt}` 
              : "Sin noticias hoy ✅"}
          </span>
        </div>

        {refreshState ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {refreshState}
          </div>
        ) : null}

        {data.warnings.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {data.warnings.join(" · ")}
          </div>
        ) : null}

        <section
          className={`rounded-[28px] border px-5 py-6 shadow-sm sm:px-7 ${conditionStyle.card}`}
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${conditionStyle.badge}`}
            >
              Condición principal
            </span>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {data.condition.title}
            </h2>
            <p className="max-w-2xl text-sm leading-7 sm:text-base">
              {data.condition.narrative}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-sm">
              <span className="rounded-full bg-white/70 px-3 py-1 font-medium">
                Score: {data.condition.score}/{data.condition.total}
              </span>
              <span className={`rounded-full bg-white/70 px-3 py-1 font-medium ${data.condition.score === 4 ? "text-emerald-700 font-bold" : data.condition.score === 3 ? "text-amber-600" : "text-slate-500"}`}>
                {data.condition.strengthLabel}
              </span>
              {data.condition.contradictions.length > 0 ? (
                <span className="rounded-full bg-white/70 px-3 py-1 font-medium">
                  Contradice: {data.condition.contradictions.join(", ")}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                Tabla de variables
              </h3>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Core macro
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-3">Activo</th>
                    <th className="px-3">Precio</th>
                    <th className="px-3">Cambio</th>
                    <th className="px-3">Señal</th>
                  </tr>
                </thead>
                <tbody>
                  {data.coreVariables.map((snapshot) => {
                    const badge = getBiasBadge(snapshot);

                    return (
                      <tr key={snapshot.key} className="bg-slate-50 text-sm text-slate-700">
                        <td className="rounded-l-2xl px-3 py-4">
                          <div className="font-semibold text-slate-950">{snapshot.label}</div>
                          <div className="text-xs text-slate-500">{snapshot.symbol}</div>
                        </td>
                        <td className="px-3 py-4 font-medium">{snapshot.priceLabel}</td>
                        <td className={`px-3 py-4 font-medium ${getMovementClass(snapshot.movement)}`}>
                          {snapshot.changeLabel}
                        </td>
                        <td className="rounded-r-2xl px-3 py-4">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                            <span className="text-xs text-slate-500">{snapshot.note}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-4">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                  Contexto macro
                </h3>
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Energía
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {data.macroContext.map((snapshot) => (
                  <div
                    key={snapshot.key}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="text-sm font-medium text-slate-500">{snapshot.label}</div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                      {snapshot.priceLabel}
                    </div>
                    <div className={`mt-2 text-sm font-medium ${getMovementClass(snapshot.movement)}`}>
                      {snapshot.changeLabel}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                  Futuros pre-market
                </h3>
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Índices
                </span>
              </div>
              <div className="space-y-3">
                {data.futures.map((snapshot) => (
                  <div
                    key={snapshot.key}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-500">{snapshot.label}</div>
                      <div className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                        {snapshot.priceLabel}
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${getMovementClass(snapshot.movement)}`}>
                      {snapshot.changeLabel}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                📅 Eventos de la semana
              </h3>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Actualizable por JSON
              </span>
            </div>
            <div className="grid gap-3">
              {data.weeklySchedule.map((day) => (
                
                <div
                  key={day.day}
                  className={`rounded-2xl border px-4 py-4 ${
                    new Date().getDay() - 1 === ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].indexOf(day.day)
                      ? "border-amber-300 bg-amber-50/50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {/* RESUMEN DIARIO ARRIBA */}
                  {(() => {
                    const dv = getDayVerdict(day.events);
                    const isPast = ["Lunes", "Martes", "Miércoles"].includes(day.day);
                    const isToday = new Date().getDay() - 1 === ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].indexOf(day.day);
                    if (dv.concluded === 0 && !isPast) return null;
                    
                    let colorClass = "bg-slate-100 text-slate-700 border-slate-300";
                    let icon = "🟣 ESPERAR";
                    if (dv.verdict === "COMPRAR") {
                      colorClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
                      icon = "🟢 COMPRAR";
                    } else if (dv.verdict === "VENDER") {
                      colorClass = "bg-rose-100 text-rose-900 border-rose-300";
                      icon = "🔴 VENDER";
                    } else if (dv.verdict === "NEUTRO") {
                      colorClass = "bg-amber-100 text-amber-900 border-amber-300";
                      icon = "🟡 NEUTRO";
                    }
                    
                    return (
                      <div className={`mb-3 rounded-xl border ${colorClass} px-4 py-3`}>
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-sm">
                            {icon}
                          </div>
                          <div className="text-xs font-semibold opacity-80">
                            {dv.concluded > 0 ? `${dv.bullish}B · ${dv.bearish}S · ${dv.neutral}N` : "Pendiente"}
                          </div>
                        </div>
                        <div className="mt-1 text-xs leading-5 opacity-90">
                          {dv.conclusion}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-2">
                    {day.day}
                    {new Date().getDay() - 1 === ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].indexOf(day.day) && (
                      <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">HOY</span>
                    )}
                  </div>
                  {day.events.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      {new Date().getDay() - 1 === ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].indexOf(day.day) 
                        ? "Sin noticias de alto impacto hoy ✅" 
                        : "—"}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {new Date().getDay() - 1 === ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].indexOf(day.day) && (
                        <div className="text-xs font-medium text-amber-800 mb-2">
                          ⚠️ Dato de alto impacto pendiente. Considerar reducir tamaño hasta publicación.
                        </div>
                      )}

                      {day.events.map((event) => {
                        return (
                        <div
                          key={`${day.day}-${event.name}-${event.timeEt}`}
                          className="flex flex-col gap-2 rounded-2xl bg-white px-3 py-3"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-950">
                                {EVENT_DISPLAY_NAMES[event.name] || event.name}
                              </span>
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${impactStyles[event.impact]}`}
                              >
                                {event.impact === "high" ? "Alto" : "Medio"}
                              </span>
                            </div>
                            <span className="text-sm text-slate-600">{event.timeEt}</span>
                          </div>
                          {event.reaction ? (
                            <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                              💡 {event.reaction}
                            </div>
                          ) : null}
                          {(event.forecast || event.previous || event.actual) ? (
                            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                              {event.forecast ? (
                                <span>📊 Esperado: <span className="font-medium text-slate-700">{event.forecast}</span></span>
                              ) : null}
                              {event.actual ? (
                                <span>📋 Actual: <span className="font-bold text-slate-900">{event.actual}</span></span>
                              ) : null}
                              {event.previous ? (
                                <span>📈 Anterior: <span className="font-medium text-slate-700">{event.previous}</span></span>
                              ) : null}
                            </div>
                          ) : null}
                          
                          {/* Veredicto automático si hay actual */}
                          {event.actual && event.forecast ? (
                            (() => {
                              const verdict = getEventVerdict(event.name, event.forecast, event.actual);
                              return (
                                <div className={`rounded-lg border px-3 py-2 text-xs font-bold ${getVerdictStyle(verdict)}`}>
                                  {getVerdictLabel(verdict)}
                                </div>
                              );
                            })()
                          ) : null}
                        </div>
                      );})}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                Historial de condiciones
              </h3>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Últimos 5 días
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap gap-2">
                {history.length === 0 ? (
                  <span className="text-sm text-slate-500">Sin historial todavía.</span>
                ) : (
                  history.map((entry) => (
                    <span
                      key={entry.dateKey}
                      className="rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
                    >
                      {entry.dateKey}: {entry.label} ({entry.score}/4)
                    </span>
                  ))
                )}
              </div>
              <p className="mt-4 text-sm text-slate-600">{historyNote}</p>
            </div>
          </section>
        </div>

        <footer className="rounded-[28px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm sm:px-7">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>Última actualización: {data.lastUpdatedEt}</span>
            <span>
              Auto-refresh cada 5 min{isRefreshing ? " · Actualizando..." : ""}
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}