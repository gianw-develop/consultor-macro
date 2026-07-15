import economicEvents from "@/data/economic-events.json";
import tenXRegimesSeed from "@/data/tenx-regimes.json";
import tenXScreenerSeed from "@/data/tenx-screener.json";
import { formatEtTimeLabel, getEtDateKey } from "@/lib/date";
import type {
  ConditionSummary,
  DashboardData,
  ImpactLevel,
  MarketSessionSummary,
  MarketSnapshot,
  Regime,
  TenXClassification,
  TenXCompanyInput,
  TenXRegime,
  TenXRegimeRadarItem,
  TenXScreenerResult,
  TenXTrend,
  WeeklyScheduleDay,
} from "@/lib/types";

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        previousClose?: number;
        chartPreviousClose?: number;
        currency?: string;
        symbol?: string;
        exchangeName?: string;
        fullExchangeName?: string;
        instrumentType?: string;
        regularMarketPrice?: number;
        regularMarketVolume?: number;
        longName?: string;
        shortName?: string;
        firstTradeDate?: number;
        fiftyTwoWeekHigh?: number;
        fiftyTwoWeekLow?: number;
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

type YahooQuoteResponse = {
  quoteResponse?: {
    result?: Array<{
      symbol?: string;
      shortName?: string;
      longName?: string;
      fullExchangeName?: string;
      exchange?: string;
      regularMarketPrice?: number;
      marketCap?: number;
      averageDailyVolume3Month?: number;
      averageDailyVolume10Day?: number;
      sharesOutstanding?: number;
    }>;
  };
};

type YahooRawValue = {
  raw?: number;
  fmt?: string;
};

type YahooQuoteSummaryResponse = {
  quoteSummary?: {
    result?: Array<{
      price?: {
        shortName?: string;
        longName?: string;
        exchangeName?: string;
        regularMarketPrice?: YahooRawValue;
        marketCap?: YahooRawValue;
      };
      summaryProfile?: {
        sector?: string;
        industry?: string;
      };
      financialData?: {
        currentPrice?: YahooRawValue;
        totalCash?: YahooRawValue;
        totalDebt?: YahooRawValue;
        revenueGrowth?: YahooRawValue;
        grossMargins?: YahooRawValue;
        ebitdaMargins?: YahooRawValue;
        profitMargins?: YahooRawValue;
        freeCashflow?: YahooRawValue;
        operatingCashflow?: YahooRawValue;
        totalRevenue?: YahooRawValue;
      };
      defaultKeyStatistics?: {
        enterpriseValue?: YahooRawValue;
        sharesOutstanding?: YahooRawValue;
      };
      majorHoldersBreakdown?: {
        insidersPercentHeld?: YahooRawValue;
      };
      summaryDetail?: {
        averageVolume?: YahooRawValue;
        averageVolume10days?: YahooRawValue;
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

type GdeltArticle = {
  title?: string;
  url?: string;
  domain?: string;
  sourceCountry?: string;
  seendate?: string;
};

type GdeltArticleListResponse = {
  articles?: GdeltArticle[];
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
  "Final Services PMI": "Final Services PMI (PMI servicios final)",
  "ISM Services PMI": "ISM Services PMI (PMI servicios ISM)",
  "Trade Balance": "Trade Balance (Balanza comercial)",
  "Final Wholesale Inventories m/m": "Final Wholesale Inventories m/m (Inventarios mayoristas finales)",
  "Consumer Credit m/m": "Consumer Credit m/m (Crédito al consumo)",
  "Federal Budget Balance": "Federal Budget Balance (Balance presupuestario federal)",
  "FOMC Meeting Minutes": "FOMC Meeting Minutes (Actas reunión FOMC)",
  "Existing Home Sales": "Existing Home Sales (Ventas viviendas usadas)",
  "Crude Oil Inventories": "Crude Oil Inventories (Inventarios de petróleo crudo)",
  "Fed Monetary Policy Report": "Fed Monetary Policy Report (Informe política monetaria Fed)",
  "10-y Bond Auction": "10-y Bond Auction (Subasta bonos 10 años)",
  "30-y Bond Auction": "30-y Bond Auction (Subasta bonos 30 años)",
  "RCM/TIPP Economic Optimism": "RCM/TIPP Economic Optimism (Optimismo económico TIPP)",
  "FOMC Member Waller Speaks": "FOMC Member Waller Speaks (Habla Waller de la Fed)",
  "FOMC Member Bowman Speaks": "FOMC Member Bowman Speaks (Habla Bowman de la Fed)",
  "FOMC Member Williams Speaks": "FOMC Member Williams Speaks (Habla Williams de la Fed)",
  "FOMC Member Goolsbee Speaks": "FOMC Member Goolsbee Speaks (Habla Goolsbee de la Fed)",
  "FOMC Member Kashkari Speaks": "FOMC Member Kashkari Speaks (Habla Kashkari de la Fed)",
  "Unemployment Claims": "Unemployment Claims (Solicitudes de desempleo)",
  "Natural Gas Storage": "Natural Gas Storage (Inventarios de gas natural)",
  "Goods Trade Balance": "Goods Trade Balance (Balanza comercial de bienes)",
  "Prelim Wholesale Inventories": "Prelim Wholesale Inventories (Inventarios mayoristas preliminares)",
  "Revised UoM Consumer Sentiment": "Revised UoM Consumer Sentiment (Confianza consumidor Michigan)",
  "Revised UoM Inflation Expectations": "Revised UoM Inflation Expectations (Expectativas de inflación Michigan)",
  "Industrial Production": "Industrial Production (Producción industrial)",
  "ADP Weekly Employment Change": "ADP Weekly Employment Change (Cambio semanal empleo ADP)",
  "Building Permits": "Building Permits (Permisos de construcción)",
  "Housing Starts": "Housing Starts (Comienzos de construcción de viviendas)",
  "Import Prices": "Import Prices (Precios de importación)",
  "Core Retail Sales": "Core Retail Sales (Ventas minoristas sin autos)",
  "Retail Sales": "Retail Sales (Ventas minoristas)",
  "Pending Home Sales": "Pending Home Sales (Ventas de viviendas pendientes)",
  "Philly Fed Manufacturing Index": "Philly Fed Manufacturing Index (Indicador de manufactura Philly)",
  "President Trump Speaks": "President Trump Speaks (Discurso del Presidente)",
  "Business Inventories": "Business Inventories (Inventarios empresariales)",
  "NFIB Small Business Optimism Index": "NFIB Small Business Optimism Index (Optimismo empresarial NFIB)",
  "CPI m/m": "CPI m/m (Inflación mensual al consumidor)",
  "CPI y/y": "CPI y/y (Inflación anual al consumidor)",
  "PPI m/m": "PPI m/m (Inflación mensual al productor)",
  "Retail Sales m/m": "Retail Sales m/m (Ventas minoristas mensual)",
  "Industrial Production m/m": "Industrial Production m/m (Producción industrial mensual)",
  "Import Prices m/m": "Import Prices m/m (Precios de importación mensual)",
  "Preliminary UoM Consumer Sentiment": "Preliminary UoM Consumer Sentiment (Confianza consumidor Michigan preliminar)",
  "Preliminary UoM Inflation Expectations": "Preliminary UoM Inflation Expectations (Expectativas inflación Michigan preliminar)",
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
  "Final Services PMI": "Si PMI > esperado → servicios fuertes → economía resiliente → DXY firme e índices mixtos. Si PMI < esperado → debilidad → alivio para bonos/índices.",
  "ISM Services PMI": "Si PMI > esperado → servicios fuertes → tasas arriba → DXY sube e índices caen. Si PMI < esperado → alivio → DXY cae e índices suben.",
  "Trade Balance": "Déficit menor al esperado → apoyo al dólar. Déficit mayor → presión bajista para DXY y apoyo indirecto a índices.",
  "Final Wholesale Inventories m/m": "Inventarios altos pueden sugerir menor demanda; inventarios controlados suelen ser más sanos.",
  "Consumer Credit m/m": "Crédito al consumo por encima de lo esperado → gasto resiliente y DXY firme. Por debajo → señal de cautela del consumidor.",
  "Federal Budget Balance": "Déficit mayor al esperado → presión sobre yields de largo plazo. Menor al esperado → alivio en bonos y sesgo positivo para índices.",
  "FOMC Meeting Minutes": "Tono hawkish → tasas arriba → Índices caen. Tono dovish → tasas abajo → Índices suben. Si neutral → esperar reacción.",
  "Existing Home Sales": "Ventas > esperado → vivienda fuerte y economía resiliente. Ventas < esperado → enfriamiento macro.",
  "10-y Bond Auction": "Si demanda débil (yield sube) → presión para tasas → Índices caen. Si demanda fuerte (yield baja) → alivio → Índices suben.",
  "30-y Bond Auction": "Si demanda débil (yield sube) → presión para tasas → Índices caen. Si demanda fuerte (yield baja) → alivio → Índices suben.",
  "RCM/TIPP Economic Optimism": "Optimismo > esperado → consumo fuerte → presión inflacionaria → tasas arriba → Índices caen. Optimismo < esperado → alivio → Índices suben.",
  "Fed Monetary Policy Report": "Informe hawkish → tasas arriba → Índices caen. Informe dovish → tasas abajo → Índices suben.",
  "NFIB Small Business Optimism Index": "Optimismo empresarial > esperado → economía resiliente → presión para tasas → Índices caen. < esperado → alivio → Índices suben.",
  "CPI m/m": "Si CPI > esperado → inflación alta → tasas arriba → Índices caen (buscar ventas). Si CPI < esperado → Índices suben (buscar compras).",
  "CPI y/y": "Si CPI > esperado → inflación alta → tasas arriba → Índices caen (buscar ventas). Si CPI < esperado → Índices suben (buscar compras).",
  "PPI m/m": "Si PPI > esperado → presión inflacionaria → tasas arriba → Índices caen. Si PPI < esperado → alivio → Índices suben.",
  "Retail Sales m/m": "Ventas > esperado → consumo fuerte → presión inflacionaria → tasas arriba → Índices caen. Ventas < esperado → alivio → Índices suben.",
  "Industrial Production m/m": "Producción > esperado → economía fuerte → DXY firme. Producción < esperado → debilidad industrial.",
  "Import Prices m/m": "Precios de importación > esperado → presión inflacionaria → tasas arriba → Índices caen. < esperado → alivio → Índices suben.",
  "Preliminary UoM Consumer Sentiment": "Confianza > esperado → consumo fuerte → presión inflacionaria → tasas arriba → Índices caen. Confianza < esperado → alivio → Índices suben.",
  "Preliminary UoM Inflation Expectations": "Expectativas de inflación altas → DXY/yields arriba e índices bajo presión. Bajas → alivio.",
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

function rawNumber(value: YahooRawValue | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value?.raw === "number" && Number.isFinite(value.raw)) return value.raw;
  return null;
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

function getEtWeekday(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
  }).format(date);
}

function getMarketSessionSummary(date: Date): MarketSessionSummary {
  const weekday = getEtWeekday(date);
  const isWeekend = weekday === "Sat" || weekday === "Sun";

  if (isWeekend) {
    return {
      isTradingDay: false,
      label: "Mercado cerrado",
      note: "Fin de semana en EE. UU.; las lecturas son informativas y pueden venir de cierres previos.",
    };
  }

  return {
    isTradingDay: true,
    label: "Sesión operativa",
    note: "Lectura válida para seguimiento intradía/pre-market si los datos están disponibles.",
  };
}

function applySessionGuard(
  condition: ConditionSummary,
  session: MarketSessionSummary,
): ConditionSummary {
  if (session.isTradingDay) {
    return condition;
  }

  return {
    regime: "neutral",
    title: "NO OPERAR",
    shortLabel: "⚪",
    narrative: `${session.note} Última lectura interna: ${condition.title} (${condition.score}/${condition.total}).`,
    score: 0,
    total: condition.total,
    strengthLabel: "Mercado cerrado — no señal operativa",
    contradictions: [],
  };
}

function buildDashboardWarnings(
  condition: ConditionSummary,
  session: MarketSessionSummary,
  unavailable: string[],
  futures: MarketSnapshot[],
) {
  const warnings: string[] = [];

  if (!session.isTradingDay) {
    warnings.push(session.note);
  }

  if (unavailable.length > 0) {
    warnings.push(`Sin datos en: ${unavailable.join(", ")}`);
  }

  const availableFutures = futures.filter((snapshot) => snapshot.available);
  const futuresUp = availableFutures.filter((snapshot) => snapshot.changePercent !== null && snapshot.changePercent > 0).length;
  const futuresDown = availableFutures.filter((snapshot) => snapshot.changePercent !== null && snapshot.changePercent < 0).length;

  if (condition.regime === "decline" && futuresUp >= 2) {
    warnings.push("Divergencia: core macro presiona a la baja, pero la mayoría de futuros está positiva.");
  }

  if (condition.regime === "expansion" && futuresDown >= 2) {
    warnings.push("Divergencia: core macro favorece riesgo, pero la mayoría de futuros está negativa.");
  }

  return warnings;
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

type WeeklyScheduleEventDraft = {
  day: string;
  name: string;
  timeEt: string;
  impact: ImpactLevel;
  forecast?: string;
  actual?: string;
  previous?: string;
  reaction?: string;
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
  if (t.includes("nfib")) return "NFIB Small Business Optimism Index";
  if (t.includes("core cpi") && t.includes("m/m")) return "Core CPI m/m";
  if (t.includes("core cpi") && t.includes("y/y")) return "Core CPI y/y";
  if (t.includes("core cpi")) return "Core CPI";
  if (t.includes("cpi") && t.includes("m/m")) return "CPI m/m";
  if (t.includes("cpi") && t.includes("y/y")) return "CPI y/y";
  if (t.includes("cpi")) return "CPI";
  if (t.includes("core ppi") && t.includes("m/m")) return "Core PPI m/m";
  if (t.includes("core ppi")) return "Core PPI";
  if (t.includes("ppi") && t.includes("m/m")) return "PPI m/m";
  if (t.includes("ppi") && t.includes("y/y")) return "PPI";
  if (t.includes("ppi")) return "PPI";
  if (t.includes("non-farm") || t.includes("nfp")) return "NFP";
  if (t.includes("pce")) return "PCE";
  if (t.includes("fomc meeting minutes")) return "FOMC Meeting Minutes";
  if (t.includes("fomc")) return "FOMC";
  if (t.includes("gdp")) return "GDP";
  if (t.includes("jobless") || t.includes("unemployment claims")) return "Unemployment Claims";
  if (t.includes("bond auction") && t.includes("10-y")) return "10-y Bond Auction";
  if (t.includes("bond auction") && t.includes("30-y")) return "30-y Bond Auction";
  if (t.includes("bond auction")) return "Bond Auctions";
  if (t.includes("fed") && t.includes("speak")) return "Fed Speeches";
  if (t.includes("fed monetary policy report")) return "Fed Monetary Policy Report";
  if (t.includes("retail sales") && t.includes("m/m")) return "Retail Sales m/m";
  if (t.includes("core retail sales") && t.includes("m/m")) return "Core Retail Sales m/m";
  if (t.includes("industrial production") && t.includes("m/m")) return "Industrial Production m/m";
  if (t.includes("industrial production")) return "Industrial Production";
  if (t.includes("import prices") && t.includes("m/m")) return "Import Prices m/m";
  if (t.includes("import prices")) return "Import Prices";
  if (t.includes("preliminary uom consumer sentiment") || t.includes("prelim uom consumer sentiment")) return "Preliminary UoM Consumer Sentiment";
  if (t.includes("preliminary uom inflation expectations") || t.includes("prelim uom inflation expectations")) return "Preliminary UoM Inflation Expectations";
  if (t.includes("crude oil inventories")) return "Crude Oil Inventories";
  if (t.includes("natural gas storage")) return "Natural Gas Storage";
  if (t.includes("building permits")) return "Building Permits";
  if (t.includes("housing starts")) return "Housing Starts";
  if (t.includes("business inventories")) return "Business Inventories";
  if (t.includes("federal budget balance")) return "Federal Budget Balance";
  if (t.includes("trade balance") && t.includes("usd")) return "Trade Balance";
  if (t.includes("consumer credit")) return "Consumer Credit m/m";
  if (t.includes("president trump speaks")) return "President Trump Speaks";
  return "";
}

export function getEventVerdict(
  eventName: string,
  forecast: string | undefined,
  actual: string | undefined
): "bullish" | "bearish" | "neutral" {
  if (!forecast || !actual) return "neutral";

  const parseValue = (str: string) => {
    const cleaned = str.replace(/[^0-9.\-]/g, "");
    const val = parseFloat(cleaned);
    return isNaN(val) ? null : val;
  };

  const forecastVal = parseValue(forecast);
  const actualVal = parseValue(actual);

  if (forecastVal === null || actualVal === null) return "neutral";

  const lowerIsBullish = [
    "CPI", "Core CPI", "PPI", "Core PPI", "PCE", "Import Prices",
    "Jobless Claims", "Unemployment Claims", "Crude Oil Inventories",
    "CPI m/m", "CPI y/y", "Core CPI m/m", "Core CPI y/y",
    "PPI m/m", "Core PPI m/m", "Import Prices m/m"
  ];
  const higherIsBullish = [
    "GDP", "Empire State Manufacturing Index", "Industrial Production",
    "Philly Fed Manufacturing Index", "Pending Home Sales",
    "Building Permits", "Housing Starts", "Retail Sales", "Core Retail Sales",
    "Industrial Production m/m",
    "NFIB Small Business Optimism Index"
  ];

  if (lowerIsBullish.includes(eventName)) {
    return actualVal < forecastVal ? "bullish" : actualVal > forecastVal ? "bearish" : "neutral";
  }

  if (higherIsBullish.includes(eventName)) {
    return actualVal > forecastVal ? "bullish" : actualVal < forecastVal ? "bearish" : "neutral";
  }

  // Special case: FOMC no change = neutral but bullish (no hike = relief)
  if (eventName === "FOMC") {
    return "bullish"; // No rate hike = relief for indices
  }

  return "neutral";
}

export type DayVerdict = "COMPRAR" | "VENDER" | "NEUTRO" | "ESPERAR";

export function getDayVerdict(events: Array<{ name: string; forecast?: string; actual?: string; impact?: string }>): {
  verdict: DayVerdict;
  bullish: number;
  bearish: number;
  neutral: number;
  concluded: number;
  conclusion: string;
} {
  let bullish = 0;
  let bearish = 0;
  let neutral = 0;
  let concluded = 0;

  events.forEach((event) => {
    if (!event.forecast || !event.actual) {
      return;
    }
    concluded++;
    const v = getEventVerdict(event.name, event.forecast, event.actual);
    if (v === "bullish") bullish++;
    else if (v === "bearish") bearish++;
    else neutral++;
  });

  const net = bullish - bearish;

  let verdict: DayVerdict;
  let conclusion: string;

  if (concluded === 0) {
    verdict = "ESPERAR";
    conclusion = "Aún no hay resultados. Esperar a que salgan los datos.";
  } else if (net >= 2 || bullish > bearish && bullish >= 2) {
    verdict = "COMPRAR";
    conclusion = `La mayoría de datos favorecen al alza (${bullish} bullish vs ${bearish} bearish). Buscar compras en retrocesos.`;
  } else if (net <= -2 || bearish > bullish && bearish >= 2) {
    verdict = "VENDER";
    conclusion = `La mayoría de datos presionan a la baja (${bearish} bearish vs ${bullish} bullish). Buscar ventas en rebotes.`;
  } else if (bullish === bearish && bullish > 0) {
    verdict = "NEUTRO";
    conclusion = "Datos mixtos y contradictorios. Sin dirección clara.";
  } else {
    verdict = "NEUTRO";
    conclusion = `Resultados neutros o insuficientes (${bullish} bullish, ${bearish} bearish, ${neutral} neutral). Esperar.`;
  }

  return { verdict, bullish, bearish, neutral, concluded, conclusion };
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

async function buildWeeklyScheduleMerged(): Promise<WeeklyScheduleDay[]> {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  // 1. Cargar SIEMPRE el JSON manual como base
  const jsonEvents = economicEvents as WeeklyScheduleEventDraft[];

  const base = new Map<string, WeeklyScheduleEventDraft>();
  jsonEvents.forEach((event) => {
    const key = `${event.day}-${event.name}`;
    base.set(key, {
      name: event.name,
      day: event.day,
      timeEt: event.timeEt,
      impact: event.impact,
      forecast: event.forecast,
      previous: event.previous,
      actual: event.actual,
      reaction: event.reaction,
    });
  });

  // 2. Enriquecer con API de Forex Factory
  try {
    const apiEvents = await fetchForexFactoryEvents();
    if (apiEvents.length > 0) {
      apiEvents
        .filter((event) => event.country === "USD")
        .forEach((event) => {
          const normalizedName = normalizeEventName(event.title);
          if (!normalizedName) return;

          const dayName = getDayNameFromDate(event.date);
          const key = `${dayName}-${normalizedName}`;
          const timeEt = parseEtTimeLabelFromIso(event.date);
          const existing = base.get(key);

          if (existing) {
            // Merge: preferir el más completo (API actual > JSON actual > nada)
            if (event.actual && event.actual !== existing.forecast) {
              existing.actual = event.actual;
            } else if (!existing.actual && event.actual) {
              existing.actual = event.actual;
            }
            if (event.forecast && !existing.forecast) existing.forecast = event.forecast;
            if (event.previous && !existing.previous) existing.previous = event.previous;
            if (!existing.timeEt || timeEt < existing.timeEt) existing.timeEt = timeEt;
            if (event.impact === "High") existing.impact = "high";
          } else {
            base.set(key, {
              name: normalizedName,
              day: dayName,
              timeEt,
              impact: mapImpact(event.impact),
              forecast: event.forecast || undefined,
              previous: event.previous || undefined,
              actual: event.actual || undefined,
              reaction: EVENT_REACTIONS[normalizedName],
            });
          }
        });
    }
  } catch {
    // Si la API falla, seguimos con el JSON manual solo
  }

  const allEvents = Array.from(base.values());

  return days.map<WeeklyScheduleDay>((day) => ({
    day,
    events: allEvents
      .filter((event) => event.day === day)
      .map((event) => ({
        name: event.name,
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

async function buildMarketGroup(configs: InstrumentConfig[]) {
  const values = await Promise.all(configs.map((config) => fetchYahooSnapshot(config)));

  return configs.map((config, index) => buildSnapshot(config, values[index], "neutral", "Lectura de mercado"));
}

function isMissing(value: unknown) {
  return value === undefined || value === null || value === "";
}

function hasCatalyst(company: TenXCompanyInput) {
  return typeof company.catalysts === "string" && company.catalysts.trim().length > 0;
}

function addMissing(missingData: string[], company: TenXCompanyInput, field: keyof TenXCompanyInput) {
  if (isMissing(company[field])) {
    missingData.push(field);
  }
}

function scoreTrend(trend: TenXTrend | "positive_inflection" | undefined, full: number, partial: number) {
  if (trend === "improving" || trend === "positive_inflection") return full;
  if (trend === "stable") return partial;
  return 0;
}

function evaluateThemePriority(company: TenXCompanyInput) {
  const text = `${company.sector ?? ""} ${company.industry ?? ""} ${company.catalysts ?? ""} ${company.notes ?? ""}`.toLowerCase();
  const regimes = tenXRegimesSeed as TenXRegime[];
  const matches = regimes
    .filter((regime) => regime.status !== "inactive")
    .filter((regime) => regime.keywords.some((keyword) => text.includes(keyword.toLowerCase())))
    .map((regime) => ({
      ...regime,
      adjustedPriority: regime.status === "watch" ? Math.max(1, regime.priority - 1) : regime.priority,
    }))
    .sort((a, b) => b.adjustedPriority - a.adjustedPriority);

  const match = matches[0];

  return {
    score: match?.adjustedPriority ?? 0,
    reason: match ? `${match.name}: ${match.thesis}` : null,
  };
}

function classifyTenX(score: number, disqualified: boolean): TenXClassification {
  if (disqualified || score < 65) return "Descartar";
  if (score >= 85) return "Candidata prioritaria";
  if (score >= 75) return "Investigar a fondo";
  return "Watchlist";
}

function evaluateSurvival(company: TenXCompanyInput) {
  const alerts: string[] = [];
  const strengths: string[] = [];
  const risks: string[] = [];
  const missingData: string[] = [];
  let score = 0;
  let disqualified = false;

  addMissing(missingData, company, "marketCapUsd");
  addMissing(missingData, company, "avgDailyVolumeUsd");
  addMissing(missingData, company, "cashUsd");
  addMissing(missingData, company, "totalDebtUsd");
  addMissing(missingData, company, "sharesOutstandingGrowthPct");
  addMissing(missingData, company, "delistingRisk");
  addMissing(missingData, company, "bankruptcyRisk");

  if (typeof company.marketCapUsd === "number") {
    if (company.marketCapUsd >= 100_000_000 && company.marketCapUsd <= 1_000_000_000) {
      score += 5;
      strengths.push("market cap dentro del rango preferido");
    } else if (company.marketCapUsd >= 50_000_000 && company.marketCapUsd <= 2_000_000_000) {
      score += 3;
      strengths.push("market cap dentro del rango aceptable");
    } else {
      risks.push("market cap fuera del rango 50M-2B USD");
      disqualified = true;
    }
  }

  if (typeof company.avgDailyVolumeUsd === "number") {
    if (company.avgDailyVolumeUsd > 500_000) {
      score += 5;
      strengths.push("liquidez diaria suficiente");
    } else {
      alerts.push("Alto potencial pero liquidez insuficiente");
      risks.push("volumen diario inferior a 500.000 USD");
      disqualified = true;
    }
  }

  if (typeof company.cashRunwayMonths === "number" && company.cashRunwayMonths >= 12) {
    score += 7;
    strengths.push("runway de caja superior a 12 meses");
  } else if (
    typeof company.cashUsd === "number" &&
    typeof company.totalDebtUsd === "number" &&
    company.cashUsd >= company.totalDebtUsd
  ) {
    score += 5;
    strengths.push("caja superior a deuda total");
  } else if (!isMissing(company.cashRunwayMonths) || !isMissing(company.cashUsd) || !isMissing(company.totalDebtUsd)) {
    risks.push("balance o runway por debajo del umbral deseado");
  }

  if (typeof company.sharesOutstandingGrowthPct === "number") {
    if (company.sharesOutstandingGrowthPct <= 10) {
      score += 5;
      strengths.push("sin dilucion agresiva reciente");
    } else if (company.sharesOutstandingGrowthPct <= 25) {
      score += 2;
      risks.push("dilucion moderada a vigilar");
    } else {
      alerts.push("Descartada por riesgo de dilucion");
      risks.push("dilucion agresiva recurrente o muy elevada");
      disqualified = true;
    }
  }

  if (company.delistingRisk === false && company.bankruptcyRisk === false) {
    score += 5;
    strengths.push("sin riesgo evidente de delisting o quiebra");
  } else if (company.delistingRisk || company.bankruptcyRisk) {
    alerts.push(company.delistingRisk ? "Descartada por posible riesgo de delisting" : "Riesgo probable de quiebra");
    risks.push("riesgo de supervivencia critico");
    disqualified = true;
  }

  if (typeof company.drawdown12mPct === "number") {
    if (company.drawdown12mPct > -80 || hasCatalyst(company)) {
      score += 3;
    } else {
      alerts.push("Descartada por caida extrema sin catalizador");
      risks.push("caida superior al 80% sin catalizador verificable");
      disqualified = true;
    }
  } else {
    missingData.push("drawdown12mPct");
  }

  return { score, alerts, strengths, risks, missingData, disqualified };
}

function evaluateGrowth(company: TenXCompanyInput) {
  const alerts: string[] = [];
  const strengths: string[] = [];
  const risks: string[] = [];
  const missingData: string[] = [];
  let score = 0;

  addMissing(missingData, company, "revenueGrowthYoyPct");
  addMissing(missingData, company, "grossMarginPct");
  addMissing(missingData, company, "ebitdaMarginTrend");
  addMissing(missingData, company, "netMarginTrend");
  addMissing(missingData, company, "freeCashFlowTrend");
  addMissing(missingData, company, "roicTrend");

  if (typeof company.revenueGrowthYoyPct === "number") {
    if (company.revenueGrowthYoyPct > 50) {
      score += 10;
      strengths.push("crecimiento de ingresos extraordinario");
    } else if (company.revenueGrowthYoyPct > 30) {
      score += 10;
      strengths.push("crecimiento de ingresos superior al 30%");
    } else if (company.revenueGrowthYoyPct > 20) {
      score += 7;
      strengths.push("crecimiento de ingresos positivo");
    } else {
      risks.push("crecimiento de ingresos por debajo del umbral 10X");
    }
  }

  if (typeof company.grossMarginPct === "number") {
    if (company.grossMarginPct > 50) {
      score += 7;
      strengths.push("margen bruto superior al 50%");
    } else if (company.grossMarginPct > 35) {
      score += 4;
      risks.push("margen bruto razonable pero por debajo del umbral ideal");
    } else {
      alerts.push("Crecimiento fuerte pero margen debil");
      risks.push("margen bruto debil");
    }
  }

  score += scoreTrend(company.ebitdaMarginTrend, 7, 3);
  score += scoreTrend(company.netMarginTrend, 6, 2);
  score += scoreTrend(company.freeCashFlowTrend, 6, 2);
  score += scoreTrend(company.roicTrend, 4, 1);

  if (company.ebitdaMarginTrend === "improving") strengths.push("EBITDA mejorando");
  if (company.netMarginTrend === "improving") strengths.push("margen neto mejorando");
  if (company.freeCashFlowTrend === "positive_inflection") strengths.push("free cash flow pasando a positivo");
  else if (company.freeCashFlowTrend === "improving") strengths.push("free cash flow mejorando");

  if (company.ebitdaMarginTrend === "deteriorating") risks.push("EBITDA deteriorandose");
  if (company.netMarginTrend === "deteriorating") risks.push("margen neto deteriorandose");
  if (company.freeCashFlowTrend === "deteriorating") risks.push("free cash flow deteriorandose");

  return { score, alerts, strengths, risks, missingData };
}

function evaluatePotential(company: TenXCompanyInput) {
  const alerts: string[] = [];
  const strengths: string[] = [];
  const risks: string[] = [];
  const missingData: string[] = [];
  let score = 0;
  const themePriority = evaluateThemePriority(company);

  addMissing(missingData, company, "tamEstimateUsd");
  addMissing(missingData, company, "insiderOwnershipPct");
  addMissing(missingData, company, "recentInsiderBuying");
  addMissing(missingData, company, "evToSales");
  addMissing(missingData, company, "catalysts");

  if (typeof company.tamEstimateUsd === "number" && typeof company.marketCapUsd === "number") {
    const tamRatio = company.tamEstimateUsd / company.marketCapUsd;
    if (tamRatio >= 20) {
      score += 8;
      strengths.push("TAM muy grande frente a la market cap");
    } else if (tamRatio >= 10) {
      score += 6;
      strengths.push("TAM amplio frente a la market cap");
    } else if (tamRatio >= 5) {
      score += 4;
    } else {
      risks.push("TAM poco convincente frente a la market cap");
    }
  }

  if (themePriority.score > 0) {
    score += themePriority.score;
    strengths.push("sector con prioridad tematica actual");
  }

  if ((company.insiderOwnershipPct ?? 0) > 10 || company.recentInsiderBuying) {
    score += 5;
    strengths.push("alineacion insider relevante");
  } else if (company.recentInsiderSelling) {
    risks.push("ventas recientes de insiders a revisar");
  }

  if (typeof company.evToSales === "number" && typeof company.revenueGrowthYoyPct === "number") {
    if (company.revenueGrowthYoyPct > 30 && company.evToSales <= 6) {
      score += 7;
      alerts.push("Buen crecimiento y valoracion atractiva");
      strengths.push("valoracion atractiva frente al crecimiento");
    } else if (company.revenueGrowthYoyPct > 30 && company.evToSales <= 10) {
      score += 4;
      strengths.push("valoracion razonable frente al crecimiento");
    } else if (company.evToSales <= 2 && company.revenueGrowthYoyPct < 10) {
      alerts.push("Barata pero posible value trap");
      risks.push("multiplo bajo sin crecimiento suficiente");
    } else {
      risks.push("valoracion exigente o no justificada por crecimiento");
    }
  }

  if (hasCatalyst(company)) {
    score += 5;
    strengths.push("catalizadores identificados para los proximos 12-24 meses");
  }

  return { score, alerts, strengths, risks, missingData, themePriority };
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildTenXExplanation(result: Omit<TenXScreenerResult, "explanation">) {
  const strengthText = result.strengths.slice(0, 3).join(", ") || "sin fortalezas suficientes por datos disponibles";
  const riskText = result.risks.slice(0, 3).join(", ") || "sin riesgos criticos detectados en los campos disponibles";
  const missingText = result.missingData.length > 0 ? ` Datos faltantes: ${result.missingData.slice(0, 4).join(", ")}.` : "";
  const themeText = result.themeReason ? ` Tema: ${result.themeReason}` : "";

  return `${result.ticker} queda como ${result.classification} con score ${result.score}/100. Fortalezas: ${strengthText}. Riesgos: ${riskText}.${themeText}${missingText}`;
}

export function scoreTenXCompany(company: TenXCompanyInput): TenXScreenerResult {
  const survival = evaluateSurvival(company);
  const growth = evaluateGrowth(company);
  const potential = evaluatePotential(company);
  const score = survival.score + growth.score + potential.score;
  const classification = classifyTenX(score, survival.disqualified);
  const baseResult = {
    ...company,
    score,
    survivalScore: survival.score,
    growthScore: growth.score,
    potentialScore: potential.score,
    themePriority: potential.themePriority.score,
    themeReason: potential.themePriority.reason,
    classification,
    disqualified: survival.disqualified,
    alerts: unique([...survival.alerts, ...growth.alerts, ...potential.alerts]),
    strengths: unique([...survival.strengths, ...growth.strengths, ...potential.strengths]),
    risks: unique([...survival.risks, ...growth.risks, ...potential.risks]),
    missingData: unique([...survival.missingData, ...growth.missingData, ...potential.missingData]),
  };

  return {
    ...baseResult,
    explanation: buildTenXExplanation(baseResult),
  };
}

async function fetchYahooQuote(ticker: string) {
  const urls = [
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker)}`,
    `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker)}`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
        headers: {
          Accept: "application/json,text/plain,*/*",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://finance.yahoo.com/",
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as YahooQuoteResponse;
      const result = payload.quoteResponse?.result?.[0] ?? null;

      if (result) return result;
    } catch {
      continue;
    }
  }

  return null;
}

async function fetchYahooQuoteSummary(ticker: string) {
  const modules = [
    "price",
    "summaryProfile",
    "financialData",
    "defaultKeyStatistics",
    "majorHoldersBreakdown",
    "summaryDetail",
  ].join(",");
  const urls = [
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${modules}`,
    `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${modules}`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
        headers: {
          Accept: "application/json,text/plain,*/*",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://finance.yahoo.com/",
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as YahooQuoteSummaryResponse;
      const result = payload.quoteSummary?.result?.[0] ?? null;

      if (result) return result;
    } catch {
      continue;
    }
  }

  return null;
}

async function fetchYahooChartProfile(ticker: string) {
  const urls = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1y`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1y`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
        headers: {
          Accept: "application/json,text/plain,*/*",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://finance.yahoo.com/",
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as YahooChartResponse;
      const result = payload.chart?.result?.[0];
      const closes = result?.indicators?.quote?.[0]?.close?.filter(
        (value): value is number => typeof value === "number" && Number.isFinite(value),
      );

      if (!closes || closes.length < 2) {
        return {
          meta: result?.meta ?? null,
          drawdown12mPct: null,
          closes: [],
        };
      }

      const current = closes.at(-1);
      const high = Math.max(...closes);

      if (!current || high <= 0) {
        return {
          meta: result?.meta ?? null,
          drawdown12mPct: null,
          closes,
        };
      }

      return {
        meta: result?.meta ?? null,
        drawdown12mPct: ((current - high) / high) * 100,
        closes,
      };
    } catch {
      continue;
    }
  }

  return null;
}

function estimateTrendFromMargin(value: number | null | undefined): TenXTrend {
  if (typeof value !== "number") return "unknown";
  if (value > 0.1) return "stable";
  if (value > 0) return "stable";
  return "deteriorating";
}

function percentChangeFromLookback(closes: number[], sessions: number) {
  if (closes.length <= sessions) return null;

  const current = closes.at(-1);
  const previous = closes.at(-1 - sessions);

  if (!current || !previous || previous <= 0) return null;

  return ((current - previous) / previous) * 100;
}

function estimateAverageDailyMovePct(closes: number[]) {
  if (closes.length < 3) return null;

  const changes = closes
    .slice(1)
    .map((close, index) => {
      const previous = closes[index];
      return previous > 0 ? Math.abs((close - previous) / previous) * 100 : null;
    })
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (changes.length === 0) return null;

  return changes.reduce((sum, value) => sum + value, 0) / changes.length;
}

function yearsSinceUnixTimestamp(timestamp: number | undefined) {
  if (typeof timestamp !== "number") return null;

  const years = (Date.now() - timestamp * 1000) / (365.25 * 24 * 60 * 60 * 1000);
  return Number.isFinite(years) ? years : null;
}

function formatSignedPct(value: number | null) {
  if (typeof value !== "number") return "sin datos";

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function applyManualMarketSignal(
  result: TenXScreenerResult,
  chartProfile: NonNullable<Awaited<ReturnType<typeof fetchYahooChartProfile>>>,
  avgDailyVolumeUsd: number | null,
): TenXScreenerResult {
  const closes = chartProfile.closes ?? [];
  const change1m = percentChangeFromLookback(closes, 21);
  const change3m = percentChangeFromLookback(closes, 63);
  const change1y = percentChangeFromLookback(closes, Math.min(252, Math.max(2, closes.length - 1)));
  const averageDailyMovePct = estimateAverageDailyMovePct(closes);
  const listingAgeYears = yearsSinceUnixTimestamp(chartProfile.meta?.firstTradeDate);

  let growthBonus = 0;
  let potentialBonus = 0;
  let survivalBonus = 0;
  const strengths: string[] = [];
  const risks: string[] = [];
  const alerts: string[] = [];

  if (typeof change1y === "number") {
    if (change1y >= 150) {
      growthBonus += 10;
      strengths.push("precio con expansion 1Y extrema");
    } else if (change1y >= 75) {
      growthBonus += 8;
      strengths.push("precio con expansion 1Y fuerte");
    } else if (change1y >= 30) {
      growthBonus += 5;
      strengths.push("precio con tendencia 1Y positiva");
    } else if (change1y < -35) {
      risks.push("tendencia 1Y muy debil");
    }
  }

  if (typeof change3m === "number") {
    if (change3m >= 50) {
      growthBonus += 6;
      strengths.push("momentum 3M acelerando");
    } else if (change3m >= 20) {
      growthBonus += 4;
      strengths.push("momentum 3M positivo");
    } else if (change3m <= -25) {
      risks.push("momentum 3M deteriorado");
    }
  }

  if (typeof change1m === "number") {
    if (change1m >= 15) {
      potentialBonus += 3;
      strengths.push("interes comprador reciente");
    } else if (change1m <= -15) {
      risks.push("presion vendedora reciente");
    }
  }

  if (typeof avgDailyVolumeUsd === "number") {
    if (avgDailyVolumeUsd >= 50_000_000) {
      potentialBonus += 3;
      survivalBonus += 5;
      strengths.push("liquidez institucional suficiente");
    } else if (avgDailyVolumeUsd >= 10_000_000) {
      potentialBonus += 2;
      survivalBonus += 4;
      strengths.push("liquidez alta para ejecucion");
    } else if (avgDailyVolumeUsd >= 1_000_000) {
      survivalBonus += 3;
      strengths.push("liquidez operable");
    } else if (avgDailyVolumeUsd < 1_000_000) {
      alerts.push("Liquidez manual muy baja");
      risks.push("poco volumen para entrar/salir con comodidad");
    }
  }

  if (typeof averageDailyMovePct === "number") {
    if (averageDailyMovePct > 9) {
      alerts.push("Alta volatilidad");
      risks.push("volatilidad diaria muy elevada");
    } else if (averageDailyMovePct <= 2.5) {
      potentialBonus += 1;
      survivalBonus += 2;
      strengths.push("volatilidad diaria controlada");
    } else if (averageDailyMovePct <= 4) {
      potentialBonus += 2;
      strengths.push("volatilidad manejable para seguimiento");
    }
  }

  if (typeof listingAgeYears === "number") {
    if (listingAgeYears <= 7) {
      potentialBonus += 4;
      strengths.push("empresa relativamente reciente en bolsa");
      survivalBonus += 1;
    } else if (listingAgeYears >= 20) {
      risks.push("empresa madura, menos perfil IPO/early public");
    }
  }

  if (typeof chartProfile.drawdown12mPct === "number") {
    if (chartProfile.drawdown12mPct >= -20) {
      growthBonus += 4;
      survivalBonus += 3;
      strengths.push("drawdown contenido respecto al maximo anual");
    } else if (chartProfile.drawdown12mPct >= -45) {
      growthBonus += 2;
      survivalBonus += 2;
    } else if (chartProfile.drawdown12mPct <= -75) {
      alerts.push("Drawdown extremo");
      risks.push("caida muy profunda frente al maximo anual");
    }
  }

  const chartOnlyMode =
    result.missingData.length >= 8 &&
    result.growthScore === 0 &&
    result.potentialScore === 0;

  const manualBonus = Math.min(35, growthBonus + potentialBonus + survivalBonus);
  const survivalScore = Math.min(
    30,
    chartOnlyMode ? Math.max(result.survivalScore, 6) + survivalBonus : result.survivalScore + survivalBonus,
  );
  const growthScore = Math.min(40, chartOnlyMode ? growthBonus : result.growthScore + growthBonus);
  const potentialScore = Math.min(30, chartOnlyMode ? potentialBonus : result.potentialScore + potentialBonus);
  const score = Math.min(100, survivalScore + growthScore + potentialScore);
  const classification = classifyTenX(score, result.disqualified);
  const sourceWarning = chartOnlyMode
    ? "score parcial basado en chart/momentum por bloqueo de fundamentales de Yahoo"
    : "fundamentales incompletos por fuente publica";
  const mergedStrengths = unique([...result.strengths, ...strengths]);
  const mergedRisks = unique([...result.risks, ...risks, sourceWarning]);
  const marketSignal = `Senal manual: 1M ${formatSignedPct(change1m)}, 3M ${formatSignedPct(change3m)}, 1Y ${formatSignedPct(change1y)}, drawdown ${formatSignedPct(chartProfile.drawdown12mPct)}, movimiento diario ${formatSignedPct(averageDailyMovePct)}.`;

  return {
    ...result,
    score,
    survivalScore,
    growthScore,
    potentialScore,
    classification,
    alerts: unique([
      ...result.alerts,
      ...alerts,
      chartOnlyMode ? "Modo chart-only activado" : "",
      `Senal manual +${manualBonus}`,
    ]),
    strengths: mergedStrengths,
    risks: mergedRisks,
    explanation: `${result.ticker} queda como ${classification} con score ${score}/100. ${chartOnlyMode ? "Lectura basada principalmente en precio, momentum y liquidez. " : ""}${marketSignal} Fortalezas: ${mergedStrengths.slice(0, 3).join(", ") || "sin fortalezas suficientes por datos disponibles"}. Riesgos: ${mergedRisks.slice(0, 3).join(", ") || "sin riesgos criticos detectados"}.`,
  };
}

export async function analyzeTenXTickerManually(tickerInput: string): Promise<TenXScreenerResult> {
  const ticker = tickerInput.trim().toUpperCase().replace(/[^A-Z0-9.-]/g, "");

  if (!ticker) {
    throw new Error("Ticker requerido");
  }

  if (ticker === "APPL") {
    throw new Error("No encontre APPL. Para Apple usa AAPL.");
  }

  const [quote, summary, chartProfile] = await Promise.all([
    fetchYahooQuote(ticker),
    fetchYahooQuoteSummary(ticker),
    fetchYahooChartProfile(ticker),
  ]);

  const chartMeta = chartProfile?.meta ?? null;

  if (!quote && !summary && !chartMeta) {
    throw new Error("No se encontraron datos publicos para ese ticker");
  }

  const price =
    rawNumber(summary?.price?.regularMarketPrice) ??
    rawNumber(summary?.financialData?.currentPrice) ??
    quote?.regularMarketPrice ??
    rawNumber(chartMeta?.regularMarketPrice) ??
    null;
  const marketCap = rawNumber(summary?.price?.marketCap) ?? quote?.marketCap ?? null;
  const averageVolume =
    rawNumber(summary?.summaryDetail?.averageVolume) ??
    rawNumber(summary?.summaryDetail?.averageVolume10days) ??
    quote?.averageDailyVolume3Month ??
    quote?.averageDailyVolume10Day ??
    rawNumber(chartMeta?.regularMarketVolume) ??
    null;
  const avgDailyVolumeUsd = typeof averageVolume === "number" && typeof price === "number" ? averageVolume * price : null;
  const totalCash = rawNumber(summary?.financialData?.totalCash);
  const totalDebt = rawNumber(summary?.financialData?.totalDebt);
  const freeCashflow = rawNumber(summary?.financialData?.freeCashflow);
  const operatingCashflow = rawNumber(summary?.financialData?.operatingCashflow);
  const totalRevenue = rawNumber(summary?.financialData?.totalRevenue);
  const enterpriseValue = rawNumber(summary?.defaultKeyStatistics?.enterpriseValue);
  const revenueGrowth = rawNumber(summary?.financialData?.revenueGrowth);
  const grossMargins = rawNumber(summary?.financialData?.grossMargins);
  const ebitdaMargins = rawNumber(summary?.financialData?.ebitdaMargins);
  const profitMargins = rawNumber(summary?.financialData?.profitMargins);
  const insidersPercentHeld = rawNumber(summary?.majorHoldersBreakdown?.insidersPercentHeld);
  const exchange = summary?.price?.exchangeName ?? quote?.fullExchangeName ?? quote?.exchange ?? chartMeta?.fullExchangeName ?? chartMeta?.exchangeName;
  const listedOnMajorExchange = typeof exchange === "string" && !/otc|pink|other otc/i.test(exchange);
  const cashRunwayMonths =
    typeof totalCash === "number" && typeof freeCashflow === "number" && freeCashflow < 0
      ? (totalCash / Math.abs(freeCashflow)) * 12
      : typeof freeCashflow === "number" && freeCashflow > 0
        ? 24
        : null;

  const company: TenXCompanyInput = {
    ticker,
    companyName: summary?.price?.longName ?? summary?.price?.shortName ?? quote?.longName ?? quote?.shortName ?? chartMeta?.longName ?? chartMeta?.shortName ?? ticker,
    exchange,
    sector: summary?.summaryProfile?.sector,
    industry: summary?.summaryProfile?.industry,
    marketCapUsd: marketCap,
    enterpriseValueUsd: enterpriseValue,
    avgDailyVolumeUsd,
    sharePrice: price,
    revenueGrowthYoyPct: typeof revenueGrowth === "number" ? revenueGrowth * 100 : null,
    grossMarginPct: typeof grossMargins === "number" ? grossMargins * 100 : null,
    ebitdaMarginTrend: estimateTrendFromMargin(ebitdaMargins),
    netMarginTrend: estimateTrendFromMargin(profitMargins),
    freeCashFlowTrend:
      typeof freeCashflow === "number" || typeof operatingCashflow === "number"
        ? (freeCashflow ?? operatingCashflow ?? 0) > 0
          ? "positive_inflection"
          : "deteriorating"
        : "unknown",
    roicTrend: "unknown",
    cashUsd: totalCash,
    totalDebtUsd: totalDebt,
    cashRunwayMonths,
    sharesOutstandingGrowthPct: null,
    drawdown12mPct: chartProfile?.drawdown12mPct ?? null,
    delistingRisk: listedOnMajorExchange ? false : null,
    bankruptcyRisk: typeof totalCash === "number" && typeof totalDebt === "number" ? totalCash < totalDebt * 0.1 : null,
    insiderOwnershipPct: typeof insidersPercentHeld === "number" ? insidersPercentHeld * 100 : null,
    recentInsiderBuying: null,
    recentInsiderSelling: null,
    tamEstimateUsd: null,
    evToSales:
      typeof enterpriseValue === "number" && typeof totalRevenue === "number" && totalRevenue > 0
        ? enterpriseValue / totalRevenue
        : null,
    catalysts: null,
    notes: `Analisis manual por ticker. Sector: ${summary?.summaryProfile?.sector ?? "sin sector"}. Industria: ${summary?.summaryProfile?.industry ?? "sin industria"}.`,
    dataSource: "Yahoo Finance public snapshot",
    dataDate: getEtDateKey(new Date()),
  };

  const result = scoreTenXCompany(company);

  return chartProfile ? applyManualMarketSignal(result, chartProfile, avgDailyVolumeUsd) : result;
}

function normalizeSupabaseCompany(row: Record<string, unknown>): TenXCompanyInput {
  return {
    ticker: String(row.ticker ?? ""),
    companyName: String(row.company_name ?? row.companyName ?? row.ticker ?? ""),
    exchange: row.exchange as string | undefined,
    sector: row.sector as string | undefined,
    industry: row.industry as string | undefined,
    marketCapUsd: row.market_cap_usd as number | null | undefined,
    enterpriseValueUsd: row.enterprise_value_usd as number | null | undefined,
    avgDailyVolumeUsd: row.avg_daily_volume_usd as number | null | undefined,
    sharePrice: row.share_price as number | null | undefined,
    revenueGrowthYoyPct: row.revenue_growth_yoy_pct as number | null | undefined,
    grossMarginPct: row.gross_margin_pct as number | null | undefined,
    ebitdaMarginTrend: row.ebitda_margin_trend as TenXTrend | undefined,
    netMarginTrend: row.net_margin_trend as TenXTrend | undefined,
    freeCashFlowTrend: row.free_cash_flow_trend as TenXCompanyInput["freeCashFlowTrend"],
    roicTrend: row.roic_trend as TenXTrend | undefined,
    cashUsd: row.cash_usd as number | null | undefined,
    totalDebtUsd: row.total_debt_usd as number | null | undefined,
    cashRunwayMonths: row.cash_runway_months as number | null | undefined,
    sharesOutstandingGrowthPct: row.shares_outstanding_growth_pct as number | null | undefined,
    drawdown12mPct: row.drawdown_12m_pct as number | null | undefined,
    delistingRisk: row.delisting_risk as boolean | null | undefined,
    bankruptcyRisk: row.bankruptcy_risk as boolean | null | undefined,
    insiderOwnershipPct: row.insider_ownership_pct as number | null | undefined,
    recentInsiderBuying: row.recent_insider_buying as boolean | null | undefined,
    recentInsiderSelling: row.recent_insider_selling as boolean | null | undefined,
    tamEstimateUsd: row.tam_estimate_usd as number | null | undefined,
    evToSales: row.ev_to_sales as number | null | undefined,
    catalysts: row.catalysts as string | null | undefined,
    notes: row.notes as string | null | undefined,
    dataSource: row.data_source as string | null | undefined,
    dataDate: row.data_date as string | null | undefined,
  };
}

async function fetchTenXCompaniesFromSupabase(): Promise<TenXCompanyInput[]> {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  const tableName = process.env.SUPABASE_TENX_TABLE ?? "tenx_companies";

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Supabase HTTP ${response.status}`);
    }

    const rows = (await response.json()) as Array<Record<string, unknown>>;
    return rows.map(normalizeSupabaseCompany).filter((company) => company.ticker);
  } catch {
    return [];
  }
}

async function buildTenXStockScreener(): Promise<TenXScreenerResult[]> {
  const supabaseCompanies = await fetchTenXCompaniesFromSupabase();
  const companies = supabaseCompanies.length > 0 ? supabaseCompanies : (tenXScreenerSeed as TenXCompanyInput[]);

  return companies
    .map(scoreTenXCompany)
    .sort((a, b) => b.score - a.score || a.ticker.localeCompare(b.ticker));
}

export async function getTenXStockScreenerData(): Promise<TenXScreenerResult[]> {
  return buildTenXStockScreener();
}

export function getTenXRegimes(): TenXRegime[] {
  return tenXRegimesSeed as TenXRegime[];
}

function buildGdeltRadarQuery(regimes: TenXRegime[]) {
  const keywords = regimes
    .filter((regime) => regime.status !== "inactive")
    .flatMap((regime) => regime.keywords.slice(0, 5))
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 18);

  return `(${uniqueKeywords
    .map((keyword) => (keyword.includes(" ") ? `"${keyword}"` : keyword))
    .join(" OR ")})`;
}

async function fetchRadarArticles(regimes: TenXRegime[]) {
  const query = buildGdeltRadarQuery(regimes);
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", query);
  url.searchParams.set("mode", "artlist");
  url.searchParams.set("maxrecords", "100");
  url.searchParams.set("timespan", "2days");
  url.searchParams.set("format", "json");
  url.searchParams.set("sort", "datedesc");

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
    });

    if (!response.ok) {
      return [];
    }

    const text = await response.text();
    if (!text.trim().startsWith("{")) {
      return [];
    }

    const payload = JSON.parse(text) as GdeltArticleListResponse;
    return payload.articles ?? [];
  } catch {
    return [];
  }
}

function articleMatchesRegime(article: GdeltArticle, regime: TenXRegime) {
  const text = `${article.title ?? ""} ${article.domain ?? ""} ${article.url ?? ""}`.toLowerCase();
  return regime.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

async function getRegimeMarketChangePercent(regime: TenXRegime) {
  const configs = regime.marketProxies.map((symbol) => ({
    key: symbol.toLowerCase(),
    label: symbol,
    symbol,
    precision: 2,
  }));

  const snapshots = await Promise.all(configs.map((config) => fetchYahooSnapshot(config)));
  const changes = snapshots
    .map((snapshot) => snapshot.changePercent)
    .filter((value): value is number => typeof value === "number");

  if (changes.length === 0) {
    return null;
  }

  return changes.reduce((total, value) => total + value, 0) / changes.length;
}

function buildRadarReadout(item: Omit<TenXRegimeRadarItem, "readout">) {
  const marketText =
    item.marketChangePercent === null
      ? "sin confirmacion clara de mercado"
      : item.marketChangePercent > 1
        ? "con confirmacion positiva de mercado"
        : item.marketChangePercent < -1
          ? "pero el mercado aun no confirma"
          : "con mercado lateral";

  if (item.attentionScore >= 75) {
    return `Alta prioridad: ${item.thesis} Hay ${item.newsMatches} coincidencias recientes y ${marketText}.`;
  }

  if (item.attentionScore >= 50) {
    return `Vigilar de cerca: ${item.thesis} Hay ${item.newsMatches} coincidencias recientes y ${marketText}.`;
  }

  return `Mantener en observacion: ${item.thesis} La senal todavia es limitada o necesita mejor confirmacion.`;
}

export async function getMacroRegimeRadarData(): Promise<TenXRegimeRadarItem[]> {
  const regimes = getTenXRegimes().filter((regime) => regime.status !== "inactive");
  const articles = await fetchRadarArticles(regimes);

  const marketChanges = await Promise.all(regimes.map((regime) => getRegimeMarketChangePercent(regime)));

  return regimes
    .map((regime, index) => {
      const matchedArticles = articles.filter((article) => articleMatchesRegime(article, regime));
      const marketChangePercent = marketChanges[index];
      const marketScore = marketChangePercent === null ? 0 : Math.max(-10, Math.min(20, marketChangePercent * 4));
      const statusScore = regime.status === "active" ? 12 : 4;
      const attentionScore = Math.round(
        Math.max(
          0,
          Math.min(100, regime.priority * 10 + statusScore + matchedArticles.length * 4 + marketScore),
        ),
      );
      const baseItem = {
        id: regime.id,
        name: regime.name,
        status: regime.status,
        attentionScore,
        priority: regime.priority,
        thesis: regime.thesis,
        newsMatches: matchedArticles.length,
        marketChangePercent,
        marketProxies: regime.marketProxies,
        leadingArticles: matchedArticles.slice(0, 3).map((article) => ({
          title: article.title ?? "Articulo sin titulo",
          url: article.url ?? "#",
          domain: article.domain ?? "fuente",
        })),
      };

      return {
        ...baseItem,
        readout: buildRadarReadout(baseItem),
      };
    })
    .sort((a, b) => b.attentionScore - a.attentionScore);
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

  const rawCondition = evaluateCondition(coreVariables);
  const session = getMarketSessionSummary(fetchedAt);
  const condition = applySessionGuard(rawCondition, session);

  const [macroContext, futures, weeklySchedule] = await Promise.all([
    buildMarketGroup(CONTEXT_VARIABLES),
    buildMarketGroup(FUTURES_VARIABLES),
    buildWeeklyScheduleMerged(),
  ]);

  const unavailable = [...coreVariables, ...macroContext, ...futures]
    .filter((snapshot) => !snapshot.available)
    .map((snapshot) => snapshot.label);

  const warnings = buildDashboardWarnings(condition, session, unavailable, futures);

  return {
    fetchedAt: fetchedAt.toISOString(),
    etDateKey: getEtDateKey(fetchedAt),
    lastUpdatedEt: formatEtTimeLabel(fetchedAt),
    coreVariables,
    macroContext,
    futures,
    weeklySchedule,
    condition,
    session,
    warnings,
  };
}
