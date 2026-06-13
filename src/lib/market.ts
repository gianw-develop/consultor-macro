import economicEvents from "@/data/economic-events.json";
import { formatEtTimeLabel, getEtDateKey } from "@/lib/date";
import type {
  ConditionSummary,
  DashboardData,
  ImpactLevel,
  MarketSnapshot,
  Regime,
  WeeklyScheduleDay,
} from "@/lib/types";

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        previousClose?: number;
      };
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
    error?: {
      description?: string;
    } | null;
  };
};

type InstrumentConfig = {
  key: string;
  label: string;
  symbol: string;
  precision: number;
  unit?: "percent";
  transformValue?: (value: number) => number;
  changePrecision?: number;
};

const CORE_VARIABLES = [
  {
    key: "us10y",
    label: "US10Y",
    symbol: "^TNX",
    precision: 2,
    unit: "percent" as const,
    transformValue: (value: number) => value / 10,
    changePrecision: 2,
  },
  {
    key: "dxy",
    label: "DXY",
    symbol: "DX-Y.NYB",
    precision: 2,
  },
  {
    key: "usdjpy",
    label: "USDJPY",
    symbol: "USDJPY=X",
    precision: 2,
  },
  {
    key: "vix",
    label: "VIX",
    symbol: "^VIX",
    precision: 2,
  },
] satisfies InstrumentConfig[];

const CONTEXT_VARIABLES = [
  {
    key: "wti",
    label: "Petróleo WTI",
    symbol: "CL=F",
    precision: 2,
  },
  {
    key: "brent",
    label: "Brent",
    symbol: "BZ=F",
    precision: 2,
  },
] satisfies InstrumentConfig[];

export const EVENT_DISPLAY_NAMES: Record<string, string> = {
  "CPI": "CPI (Índice de precios al consumidor)",
  "Core CPI": "Core CPI (Inflación subyacente al consumidor)",
  "PPI": "PPI (Índice de precios al productor)",
  "Core PPI": "Core PPI (Inflación subyacente al productor)",
  "NFP": "NFP (Empleo no agrícola - Non-Farm Payrolls)",
  "PCE": "PCE (Gasto personal / Inflación preferida por la Fed)",
  "FOMC": "FOMC (Decisión de tasas de la Fed)",
  "GDP": "GDP (Producto Interno Bruto)",
  "Jobless Claims": "Jobless Claims (Solicitudes de desempleo)",
  "Bond Auctions": "Bond Auctions (Subastas de bonos del Tesoro)",
  "Fed Speeches": "Fed Speeches (Discursos de la Reserva Federal)",
};

const EVENT_REACTIONS: Record<string, string> = {
  "CPI": "Si CPI > esperado → inflación alta → tasas arriba → Índices caen (buscar ventas). Si CPI < esperado → Índices suben (buscar compras).",
  "Core CPI": "Si Core CPI > esperado → inflación subyacente alta → tasas arriba → Índices caen. Si Core CPI < esperado → alivio → Índices suben.",
  "PPI": "Si PPI > esperado → presión inflacionaria → tasas arriba → Índices caen. Si PPI < esperado → alivio → Índices suben.",
  "Core PPI": "Si Core PPI > esperado → presión de costos alta → tasas arriba → Índices caen. Si Core PPI < esperado → alivio → Índices suben.",
  "NFP": "Si NFP > esperado → economía fuerte → tasas arriba → Índices caen. Si NFP < esperado → economía débil → tasas abajo → Índices suben.",
  "PCE": "Si PCE > esperado → inflación persistente → tasas arriba → Índices caen. Si PCE < esperado → Índices suben.",
  "FOMC": "Si tono hawkish → tasas arriba → Índices caen. Si tono dovish → tasas abajo → Índices suben. Si neutral → esperar reacción.",
  "GDP": "Si GDP > esperado → economía fuerte → tasas arriba → Índices caen. Si GDP < esperado → recesión fear → tasas abajo → Índices suben.",
  "Jobless Claims": "Si Claims < esperado → economía fuerte → tasas arriba → Índices caen. Si Claims > esperado → economía débil → Índices suben.",
  "Bond Auctions": "Si demanda débil (yield sube) → presión para tasas → Índices caen. Si demanda fuerte (yield baja) → alivio → Índices suben.",
  "Fed Speeches": "Si discurso hawkish → tasas arriba → Índices caen. Si dovish → tasas abajo → Índices suben.",
};

const FUTURES_VARIABLES = [
  {
    key: "es",
    label: "ES",
    symbol: "ES=F",
    precision: 2,
  },
  {
    key: "nq",
    label: "NQ",
    symbol: "NQ=F",
    precision: 2,
  },
  {
    key: "ym",
    label: "YM",
    symbol: "YM=F",
    precision: 2,
  },
] satisfies InstrumentConfig[];

function formatNumber(value: number, precision: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
}

function formatPrice(value: number | null, config: InstrumentConfig) {
  if (value === null) {
    return "Sin datos";
  }

  const transformed = config.transformValue ? config.transformValue(value) : value;
  const formatted = formatNumber(transformed, config.precision);

  if (config.unit === "percent") {
    return `${formatted}%`;
  }

  if (config.key === "wti" || config.key === "brent") {
    return `$${formatted}`;
  }

  return formatted;
}

function formatChange(value: number | null, percent: number | null, config: InstrumentConfig) {
  if (value === null || percent === null) {
    return "Sin datos";
  }

  const transformed = config.transformValue ? config.transformValue(value) : value;
  const precision = config.changePrecision ?? config.precision;
  const sign = transformed > 0 ? "+" : "";
  const formattedValue = `${sign}${formatNumber(transformed, precision)}`;
  const formattedPercent = `${percent > 0 ? "+" : ""}${formatNumber(percent, 2)}%`;

  if (config.unit === "percent") {
    return `${formattedValue} pts`;
  }

  return `${formattedValue} · ${formattedPercent}`;
}

function getMovement(change: number | null): MarketSnapshot["movement"] {
  if (change === null) {
    return "missing";
  }

  if (change > 0) {
    return "up";
  }

  if (change < 0) {
    return "down";
  }

  return "flat";
}

async function fetchYahooSnapshot(config: InstrumentConfig) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(config.symbol)}?interval=1d&range=5d`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = (await response.json()) as YahooChartResponse;
    const result = payload.chart?.result?.[0];
    const closes = result?.indicators?.quote?.[0]?.close?.filter(
      (value): value is number => typeof value === "number",
    );

    if (!closes || closes.length === 0) {
      throw new Error("No close data");
    }

    const current = closes.at(-1) ?? null;
    const previous = closes.at(-2) ?? result?.meta?.previousClose ?? null;

    if (current === null || previous === null) {
      throw new Error("Incomplete close data");
    }

    const change = current - previous;
    const changePercent = previous === 0 ? null : (change / previous) * 100;

    return {
      current,
      previous,
      change,
      changePercent,
      available: true,
    };
  } catch {
    return {
      current: null,
      previous: null,
      change: null,
      changePercent: null,
      available: false,
    };
  }
}

function buildSnapshot(
  config: InstrumentConfig,
  values: Awaited<ReturnType<typeof fetchYahooSnapshot>>,
  bias: MarketSnapshot["bias"] = "neutral",
  note = "Sin lectura disponible",
): MarketSnapshot {
  return {
    key: config.key,
    label: config.label,
    symbol: config.symbol,
    current: values.current,
    previous: values.previous,
    change: values.change,
    changePercent: values.changePercent,
    available: values.available,
    priceLabel: formatPrice(values.current, config),
    changeLabel: formatChange(values.change, values.changePercent, config),
    movement: getMovement(values.change),
    bias: values.available ? bias : "missing",
    note: values.available ? note : "Datos no disponibles — verificar manualmente",
  };
}

function getCoreBias(snapshot: {
  key: string;
  change: number | null;
  available: boolean;
}) {
  if (!snapshot.available || snapshot.change === null) {
    return {
      bias: "missing" as const,
      note: "Datos no disponibles — verificar manualmente",
      expansion: false,
      decline: false,
    };
  }

  if (snapshot.key === "us10y" || snapshot.key === "dxy") {
    if (snapshot.change < 0) {
      return {
        bias: "expansion" as const,
        note: snapshot.key === "us10y" ? "Yield baja = presión sale de bonos → favorable índices" : "Dólar débil = liquidez entra a riesgo",
        expansion: true,
        decline: false,
      };
    }

    if (snapshot.change > 0) {
      return {
        bias: "decline" as const,
        note: snapshot.key === "us10y" ? "Yield sube = presión para acciones e índices" : "Dólar fuerte = liquidez sale de riesgo",
        expansion: false,
        decline: true,
      };
    }
  }

  if (snapshot.key === "usdjpy") {
    if (snapshot.change > 0) {
      return {
        bias: "expansion" as const,
        note: "Carry trade activo = bullish",
        expansion: true,
        decline: false,
      };
    }

    if (snapshot.change < 0) {
      return {
        bias: "decline" as const,
        note: "Carry trade se deshace = riesgo-off = bearish",
        expansion: false,
        decline: true,
      };
    }
  }

  if (snapshot.key === "vix") {
    if (snapshot.change <= 0.2) {
      return {
        bias: snapshot.change < 0 ? ("expansion" as const) : ("stable" as const),
        note: snapshot.change < 0 ? "Mercado cómodo comprando" : "Mercado cómodo comprando",
        expansion: true,
        decline: false,
      };
    }

    if (snapshot.change > 0.2) {
      return {
        bias: "decline" as const,
        note: "Mercado busca protección",
        expansion: false,
        decline: true,
      };
    }
  }

  return {
    bias: "neutral" as const,
    note: "Lectura sin sesgo claro",
    expansion: false,
    decline: false,
  };
}

function evaluateCondition(coreVariables: MarketSnapshot[]): ConditionSummary {
  const expansionAligned = coreVariables.filter((snapshot) => snapshot.bias === "expansion" || snapshot.bias === "stable");
  const declineAligned = coreVariables.filter((snapshot) => snapshot.bias === "decline");

  const expansionCount = expansionAligned.length;
  const declineCount = declineAligned.length;

  const getContradictions = (regime: Regime) =>
    coreVariables
      .filter((snapshot) => {
        if (!snapshot.available) {
          return false;
        }

        if (regime === "expansion") {
          return !(snapshot.bias === "expansion" || snapshot.bias === "stable");
        }

        return snapshot.bias !== "decline";
      })
      .map((snapshot) => snapshot.label);

  if (expansionCount >= 3 && expansionCount > declineCount) {
    return {
      regime: "expansion",
      title: "BUSCAR COMPRAS",
      shortLabel: "🟢",
      narrative:
        "Flujo institucional favorece riesgo. Comprar retrocesos en US100 / SP500 / US30.",
      score: expansionCount,
      total: 4,
      strengthLabel: expansionCount === 4 ? "Señal FUERTE — alta confianza" : `Señal MODERADA — ${getContradictions("expansion").join(", ")}`,
      contradictions: expansionCount === 4 ? [] : getContradictions("expansion"),
    };
  }

  if (declineCount >= 3 && declineCount > expansionCount) {
    return {
      regime: "decline",
      title: "BUSCAR VENTAS",
      shortLabel: "🔴",
      narrative:
        "Flujo sale de riesgo. Vender rebotes en US100 / SP500 / US30.",
      score: declineCount,
      total: 4,
      strengthLabel: declineCount === 4 ? "Señal FUERTE — alta confianza" : `Señal MODERADA — ${getContradictions("decline").join(", ")}`,
      contradictions: declineCount === 4 ? [] : getContradictions("decline"),
    };
  }

  return {
    regime: "neutral",
    title: "NO OPERAR",
    shortLabel: "🟡",
    narrative: "Variables contradictorias. Esperar alineación.",
    score: Math.max(expansionCount, declineCount),
    total: 4,
    strengthLabel: "Sin alineación — ESPERAR",
    contradictions: [],
  };
}

type ForexFactoryEvent = {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
  actual: string;
};

function parseEtTimeLabelFromIso(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  }) + " ET";
}

function getDayNameFromDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return days[d.getDay()];
}

function mapImpact(impact: string): ImpactLevel {
  if (impact === "High") return "high";
  return "medium";
}

function normalizeEventName(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("core cpi")) return "Core CPI";
  if (t.includes("cpi")) return "CPI";
  if (t.includes("core ppi")) return "Core PPI";
  if (t.includes("ppi")) return "PPI";
  if (t.includes("non-farm") || t.includes("nfp")) return "NFP";
  if (t.includes("pce")) return "PCE";
  if (t.includes("fomc")) return "FOMC";
  if (t.includes("gdp")) return "GDP";
  if (t.includes("jobless") || t.includes("unemployment claims")) return "Jobless Claims";
  if (t.includes("bond auction")) return "Bond Auctions";
  if (t.includes("fed") && t.includes("speak")) return "Fed Speeches";
  return "";
}

async function fetchForexFactoryEvents(): Promise<ForexFactoryEvent[]> {
  try {
    const response = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as ForexFactoryEvent[];
    return data;
  } catch {
    return [];
  }
}

async function buildWeeklyScheduleFromApi(): Promise<WeeklyScheduleDay[]> {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  
  // Intentar API primero
  const apiEvents = await fetchForexFactoryEvents();
  
  if (apiEvents.length > 0) {
    const mappedEvents = apiEvents
      .filter((event) => event.country === "USD")
      .map((event) => {
        const normalizedName = normalizeEventName(event.title);
        return {
          normalizedName,
          dayName: getDayNameFromDate(event.date),
          timeEt: parseEtTimeLabelFromIso(event.date),
          impact: mapImpact(event.impact),
          forecast: event.forecast || undefined,
          previous: event.previous || undefined,
          actual: event.actual || undefined,
          reaction: normalizedName ? EVENT_REACTIONS[normalizedName] : undefined,
        };
      })
      .filter((event) => event.normalizedName !== "");

    return days.map<WeeklyScheduleDay>((day) => ({
      day,
      events: mappedEvents
        .filter((event) => event.dayName === day)
        .map((event) => ({
          name: event.normalizedName,
          timeEt: event.timeEt,
          impact: event.impact,
          reaction: event.reaction,
          forecast: event.forecast,
          previous: event.previous,
          actual: event.actual,
          status: "upcoming" as const,
        })),
    }));
  }
  
  // Fallback al JSON manual si la API no devuelve nada
  const allowedEvents = new Set([
    "CPI", "Core CPI", "PPI", "Core PPI", "NFP", "PCE", "FOMC", 
    "GDP", "Jobless Claims", "Bond Auctions", "Fed Speeches"
  ]);

  const filtered = (economicEvents as Array<{
    day: string;
    name: string;
    timeEt: string;
    impact: ImpactLevel;
    forecast?: string;
    actual?: string;
    previous?: string;
    reaction?: string;
  }>).filter((event) => allowedEvents.has(event.name));

  return days.map<WeeklyScheduleDay>((day) => ({
    day,
    events: filtered
      .filter((event) => event.day === day)
      .map((event) => ({
        name: event.name,
        timeEt: event.timeEt,
        impact: event.impact,
        reaction: event.reaction || EVENT_REACTIONS[event.name],
        forecast: event.forecast,
        previous: event.previous,
        actual: event.actual,
        status: "upcoming" as const,
      })),
  }));
}

async function buildMarketGroup(configs: InstrumentConfig[]) {
  const values = await Promise.all(configs.map((config) => fetchYahooSnapshot(config)));

  return configs.map((config, index) => buildSnapshot(config, values[index], "neutral", "Lectura de mercado"));
}

export async function getDashboardData(): Promise<DashboardData> {
  const fetchedAt = new Date();
  const coreValues = await Promise.all(
    CORE_VARIABLES.map((config) => fetchYahooSnapshot(config)),
  );

  const coreVariables = CORE_VARIABLES.map((config, index) => {
    const values = coreValues[index];
    const bias = getCoreBias({
      key: config.key,
      change: values.change,
      available: values.available,
    });

    return buildSnapshot(config, values, bias.bias, bias.note);
  });

  const [macroContext, futures, weeklySchedule] = await Promise.all([
    buildMarketGroup(CONTEXT_VARIABLES),
    buildMarketGroup(FUTURES_VARIABLES),
    buildWeeklyScheduleFromApi(),
  ]);

  const condition = evaluateCondition(coreVariables);
  const unavailable = [...coreVariables, ...macroContext, ...futures]
    .filter((snapshot) => !snapshot.available)
    .map((snapshot) => snapshot.label);

  const warnings =
    unavailable.length > 0
      ? [`Sin datos en: ${unavailable.join(", ")}`]
      : [];

  return {
    fetchedAt: fetchedAt.toISOString(),
    etDateKey: getEtDateKey(fetchedAt),
    lastUpdatedEt: formatEtTimeLabel(fetchedAt),
    coreVariables,
    macroContext,
    futures,
    weeklySchedule,
    condition,
    warnings,
  };
}