/**
 * Mercado ahora: lo que la macro mensual no ve. Los índices se adelantan a los datos;
 * si la macro dice "expansión" y el mercado está en corrección o pánico, hay que decirlo.
 *
 * Reglas (sobre cierres diarios):
 *  - Pánico:     VIX >= 30  o  S&P 500 a -10 % o peor de su máximo de 3 meses.
 *  - Corrección: VIX >= 22  o  S&P 500 a -5 % o peor de su máximo  o  semana <= -4 %.
 *  - Normal:     lo demás.
 * Qué teme el mercado (acciones caen):
 *  - con el bono a 10 años bajando  → miedo a un frenazo del crecimiento;
 *  - con el bono a 10 años subiendo → miedo a inflación y tipos altos.
 */
export type DailyPoint = { period: string; value: number };
export type MarketState = "normal" | "correction" | "panic";
export type IndexReading = { id: string; label: string; last: number; date: string; week: number | null; fromHigh: number | null };
export type MarketReading = {
  state: MarketState;
  indexes: IndexReading[];
  vix: { last: number; week: number | null } | null;
  ust10Week: number | null;
  fear: "growth" | "inflation" | null;
  asOf: string | null;
};

const pct = (a: number, b: number) => Math.round((a / b - 1) * 1000) / 10;
const SESSIONS_WEEK = 5, SESSIONS_3M = 63;

export function readIndex(id: string, label: string, points: DailyPoint[]): IndexReading | null {
  const last = points.at(-1);
  if (!last) return null;
  const weekAgo = points.at(-1 - SESSIONS_WEEK);
  const window = points.slice(-SESSIONS_3M);
  const high = Math.max(...window.map(p => p.value));
  return { id, label, last: last.value, date: last.period, week: weekAgo ? pct(last.value, weekAgo.value) : null, fromHigh: window.length >= 20 ? pct(last.value, high) : null };
}

export function evaluateMarket(series: { spx: DailyPoint[]; dji: DailyPoint[]; ndx: DailyPoint[]; vix: DailyPoint[]; ust10: DailyPoint[] }): MarketReading | null {
  const spx = readIndex("spx", "S&P 500", series.spx);
  if (!spx) return null;
  const indexes = [spx, readIndex("dji", "Dow Jones", series.dji), readIndex("ndx", "Nasdaq", series.ndx)].filter((x): x is IndexReading => !!x);
  const v = series.vix.at(-1), vWeek = series.vix.at(-1 - SESSIONS_WEEK);
  const vix = v ? { last: v.value, week: vWeek ? pct(v.value, vWeek.value) : null } : null;
  const u = series.ust10.at(-1), uWeek = series.ust10.at(-1 - SESSIONS_WEEK);
  const ust10Week = u && uWeek ? Math.round((u.value - uWeek.value) * 100) : null; // puntos básicos
  const panic = (vix?.last ?? 0) >= 30 || (spx.fromHigh ?? 0) <= -10;
  const correction = (vix?.last ?? 0) >= 22 || (spx.fromHigh ?? 0) <= -5 || (spx.week ?? 0) <= -4;
  const state: MarketState = panic ? "panic" : correction ? "correction" : "normal";
  const stocksDown = (spx.week ?? 0) < 0;
  const fear = state === "normal" || !stocksDown || ust10Week === null ? null : ust10Week < 0 ? "growth" : "inflation";
  return { state, indexes, vix, ust10Week, fear, asOf: spx.date };
}

export const MARKET_STATE_LABEL: Record<MarketState, string> = { normal: "Normal", correction: "Corrección", panic: "Pánico" };

/** Frase de coherencia entre la fase macro (datos mensuales) y el mercado (esta semana). */
export function coherence(growthUp: boolean, market: MarketReading): { agrees: boolean; text: string } {
  if (market.state === "normal") return { agrees: true, text: "El mercado acompaña la lectura macro." };
  const fear = market.fear === "growth" ? "un frenazo del crecimiento (bolsas y rendimientos bajan a la vez)"
    : market.fear === "inflation" ? "más inflación y tipos altos (bolsas bajan y rendimientos suben)" : "más riesgo";
  return growthUp
    ? { agrees: false, text: `Los datos mensuales aún muestran crecimiento, pero el mercado ya descuenta ${fear}. El mercado suele adelantarse a los datos.` }
    : { agrees: true, text: `El mercado confirma la debilidad: descuenta ${fear}.` };
}
