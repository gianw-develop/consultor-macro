"use client";

import { FormEvent, useEffect, useState } from "react";
import { TenXScreenerPanel } from "@/components/tenx-screener-panel";
import type { TenXRegimeRadarItem, TenXScreenerResult } from "@/lib/types";

function getRegimeResearchLinks(regime: TenXRegimeRadarItem) {
  const query = encodeURIComponent(`${regime.name} small cap stocks IPO`);

  return {
    news: `https://news.google.com/search?q=${query}`,
    finviz: "https://finviz.com/screener.ashx?v=111&f=cap_smallunder,sh_avgvol_o500,sh_price_o1",
  };
}

export function TenXScreenerClient({
  initialCandidates,
  radar,
}: {
  initialCandidates: TenXScreenerResult[];
  radar: TenXRegimeRadarItem[];
}) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [radarItems, setRadarItems] = useState(radar);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshState, setRefreshState] = useState<string | null>(null);
  const [manualTicker, setManualTicker] = useState("");
  const [manualResult, setManualResult] = useState<TenXScreenerResult | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const [isAnalyzingManual, setIsAnalyzingManual] = useState(false);

  const analyzeManualTicker = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const ticker = manualTicker.trim().toUpperCase();

    if (!ticker) {
      setManualError("Escribe un ticker para analizar.");
      return;
    }

    setIsAnalyzingManual(true);
    setManualError(null);

    try {
      const response = await fetch("/api/10x/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker }),
      });

      if (response.status === 401) {
        window.location.reload();
        return;
      }

      const payload = (await response.json()) as TenXScreenerResult | { error?: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "No se pudo analizar el ticker.");
      }

      setManualResult(payload as TenXScreenerResult);
      setManualTicker(ticker);
    } catch (error) {
      setManualError(error instanceof Error ? error.message : "No se pudo analizar el ticker.");
    } finally {
      setIsAnalyzingManual(false);
    }
  };

  useEffect(() => {
    const refreshData = async () => {
      setIsRefreshing(true);

      try {
        const response = await fetch("/api/10x", {
          cache: "no-store",
        });

        if (response.status === 401) {
          window.location.reload();
          return;
        }

        if (!response.ok) {
          throw new Error("refresh-failed");
        }

        const payload = (await response.json()) as TenXScreenerResult[];
        setCandidates(payload);

        const radarResponse = await fetch("/api/10x/radar", {
          cache: "no-store",
        });

        if (radarResponse.ok) {
          const radarPayload = (await radarResponse.json()) as TenXRegimeRadarItem[];
          setRadarItems(radarPayload);
        }

        setRefreshState(null);
      } catch {
        setRefreshState("No se pudo actualizar. Manteniendo ultimo screener disponible.");
      } finally {
        setIsRefreshing(false);
      }
    };

    const interval = window.setInterval(refreshData, 300_000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      {refreshState ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {refreshState}
        </div>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">
            Radar macro de atencion
          </h2>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Olfato macro
          </span>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {radarItems.map((regime) => {
            const researchLinks = getRegimeResearchLinks(regime);

            return (
              <div
                key={regime.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-950">{regime.name}</span>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                    {regime.status}
                  </span>
                  <span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-bold text-sky-800">
                    Radar {regime.attentionScore}/100
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{regime.readout}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>Noticias: {regime.newsMatches}</span>
                  <span>Proxies: {regime.marketProxies.join(", ")}</span>
                  <span>
                    Mercado:{" "}
                    {regime.marketChangePercent === null
                      ? "sin datos"
                      : `${regime.marketChangePercent >= 0 ? "+" : ""}${regime.marketChangePercent.toFixed(2)}%`}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={researchLinks.news}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Buscar narrativa
                  </a>
                  <a
                    href={researchLinks.finviz}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Explorar small caps
                  </a>
                </div>
                {regime.leadingArticles.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    {regime.leadingArticles.map((article) => (
                      <a
                        key={`${regime.id}-${article.url}`}
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-xs font-medium text-slate-700 underline-offset-4 hover:underline"
                      >
                        {article.title} · {article.domain}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Analisis manual por ticker
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Escribe una empresa que viste fuera del radar y la pasamos por los filtros 10X disponibles.
            </p>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            Modo lupa
          </span>
        </div>

        <form
          onSubmit={analyzeManualTicker}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <label className="sr-only" htmlFor="manual-ticker">
            Ticker
          </label>
          <input
            id="manual-ticker"
            value={manualTicker}
            onChange={(event) => setManualTicker(event.target.value.toUpperCase())}
            placeholder="Ej: AAPL, SOUN, INOD"
            className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 outline-none transition placeholder:font-medium placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            maxLength={16}
          />
          <button
            type="submit"
            disabled={isAnalyzingManual}
            className="min-h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isAnalyzingManual ? "Analizando..." : "Analizar manual"}
          </button>
        </form>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Usa datos publicos disponibles. Si faltan balance, insiders o crecimiento, el score lo penaliza como investigacion pendiente.
        </p>

        {manualError ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {manualError}
          </div>
        ) : null}
      </section>

      {manualResult ? (
        <TenXScreenerPanel
          candidates={[manualResult]}
          title="Resultado manual"
          description="Lectura puntual del ticker con el mismo marco de supervivencia, crecimiento, potencial y temas macro."
          eyebrow="Analisis puntual"
          showUniverseNote={false}
        />
      ) : null}

      <TenXScreenerPanel candidates={candidates} />

      <footer className="rounded-[28px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm sm:px-7">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>No es consejo financiero. Prioriza candidatos para investigacion adicional.</span>
          <span>Auto-refresh cada 5 min{isRefreshing ? " · Actualizando..." : ""}</span>
        </div>
      </footer>
    </>
  );
}
