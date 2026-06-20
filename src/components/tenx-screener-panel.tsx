import type { TenXClassification, TenXScreenerResult } from "@/lib/types";

function getTenXClassificationStyle(classification: TenXClassification) {
  if (classification === "Candidata prioritaria") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (classification === "Investigar a fondo") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  if (classification === "Watchlist") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
}

function getExternalLinks(ticker: string) {
  const encodedTicker = encodeURIComponent(ticker);

  return {
    yahoo: `https://finance.yahoo.com/quote/${encodedTicker}/chart/`,
    finviz: `https://finviz.com/quote.ashx?t=${encodedTicker}`,
  };
}

export function TenXScreenerPanel({
  candidates,
  title = "10X Stock Screener",
  description = "Motor privado para priorizar empresas pequenas con supervivencia, crecimiento y potencial explicable.",
  eyebrow = "Score empresa 0-100",
  showUniverseNote = true,
}: {
  candidates: TenXScreenerResult[];
  title?: string;
  description?: string;
  eyebrow?: string;
  showUniverseNote?: boolean;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
          {eyebrow}
        </span>
      </div>

      {showUniverseNote ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          Universo actual: dataset manual. El radar macro ya prioriza tendencias, pero estas empresas no se descubren solas todavia.
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {candidates.map((candidate, index) => {
          const externalLinks = getExternalLinks(candidate.ticker);

          return (
            <article
              key={candidate.ticker}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      #{index + 1}
                    </span>
                    <h3 className="text-base font-semibold text-slate-950">
                      {candidate.ticker}
                    </h3>
                    <span className="text-sm text-slate-500">{candidate.companyName}</span>
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                    {[candidate.exchange, candidate.industry || candidate.sector].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${getTenXClassificationStyle(candidate.classification)}`}
                >
                  {candidate.classification}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div className="rounded-xl bg-white px-3 py-2">
                  <div className="text-xs text-slate-500">Empresa</div>
                  <div className="mt-1 font-semibold text-slate-950">{candidate.score}/100</div>
                </div>
                <div className="rounded-xl bg-white px-3 py-2">
                  <div className="text-xs text-slate-500">Superv.</div>
                  <div className="mt-1 font-semibold text-slate-950">{candidate.survivalScore}/30</div>
                </div>
                <div className="rounded-xl bg-white px-3 py-2">
                  <div className="text-xs text-slate-500">Crecim.</div>
                  <div className="mt-1 font-semibold text-slate-950">{candidate.growthScore}/40</div>
                </div>
                <div className="rounded-xl bg-white px-3 py-2">
                  <div className="text-xs text-slate-500">Potenc.</div>
                  <div className="mt-1 font-semibold text-slate-950">{candidate.potentialScore}/30</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={externalLinks.yahoo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Yahoo chart
                </a>
                <a
                  href={externalLinks.finviz}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Finviz
                </a>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {candidate.explanation}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {candidate.themeReason ? (
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800">
                    Tema +{candidate.themePriority}: {candidate.themeReason}
                  </span>
                ) : null}
                {candidate.alerts.slice(0, 3).map((alert) => (
                  <span
                    key={`${candidate.ticker}-${alert}`}
                    className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
                  >
                    {alert}
                  </span>
                ))}
                {candidate.missingData.length > 0 ? (
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                    Datos faltantes: {candidate.missingData.length}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 text-xs leading-5 text-slate-500">
                Fuente: {candidate.dataSource || "Manual"} · Fecha: {candidate.dataDate || "Sin fecha"}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
