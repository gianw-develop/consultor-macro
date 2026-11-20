/**
 * Motor de régimen · crecimiento × inflación (v1).
 *
 * Lógica del cuadrante de la mentoría 8: la fase la deciden la DIRECCIÓN
 * del crecimiento y la DIRECCIÓN de la inflación, no su nivel.
 *
 *  - Eje X (crecimiento): impulso del CLI G7 de la OCDE = variación de 3 meses.
 *    Escala: ±0,30 puntos de CLI en 3 meses = ±1 (borde exterior del mapa).
 *  - Eje Y (inflación): impulso del IPC general = tasa de 3 meses anualizada
 *    menos la tasa anual. Positivo = la inflación reciente corre por encima de
 *    la anual (acelera). Escala: ±2 puntos porcentuales = ±1.
 *
 * El punto es continuo: su distancia a cada eje es la distancia a cambiar de
 * fase, y el recorrido mes a mes muestra hacia dónde se mueve. El resto de
 * señales (PIB, ISM, empleo, precios adelantados, mercado) no mueven el punto:
 * confirman o contradicen cada eje y fijan la confianza. Así cada número del
 * mapa se puede explicar con una sola serie oficial.
 *
 * No predice fechas. Distancia y velocidad describen el presente, no el futuro.
 */
export type Phase = "inflationary_expansion" | "disinflationary_expansion" | "stagflation" | "deflationary_crisis";
export type Stage = "transition" | "early" | "mature" | "consolidated";
export type MonthlyValue = { period: string; value: number };
export type RegimePoint = { period: string; x: number; y: number; phase: Phase };
export type Confirmation = { id: string; axis: "growth" | "inflation" | "market"; label: string; reading: string; agrees: boolean | null; period: string };
export type RegimeReading = {
  point: RegimePoint; trail: RegimePoint[];
  stage: Stage; monthsInPhase: number;
  nearestBorder: { axis: "growth" | "inflation"; distance: number; nextPhase: Phase };
  velocity: { x: number; y: number };
  confidence: { agree: number; total: number };
  headline: string; detail: string;
};

export const PHASE_LABEL: Record<Phase, string> = {
  inflationary_expansion: "Expansión inflacionaria",
  disinflationary_expansion: "Expansión desinflacionaria",
  stagflation: "Estanflación",
  deflationary_crisis: "Crisis deflacionaria",
};
const STAGE_LABEL: Record<Stage, string> = { transition: "en transición", early: "recién iniciada", mature: "madura", consolidated: "consolidada" };

export const GROWTH_SCALE = 0.3;      // puntos de CLI en 3 meses
export const INFLATION_SCALE = 2;     // puntos porcentuales anualizados
export const BORDER_ZONE = 0.25;      // por debajo: cerca de cruzar
const clamp = (v: number) => Math.max(-1, Math.min(1, v));
const round = (v: number) => Math.round(v * 100) / 100;

export function phaseOf(x: number, y: number): Phase {
  if (x >= 0) return y >= 0 ? "inflationary_expansion" : "disinflationary_expansion";
  return y >= 0 ? "stagflation" : "deflationary_crisis";
}
function crossTo(phase: Phase, axis: "growth" | "inflation"): Phase {
  const growthUp = phase === "inflationary_expansion" || phase === "disinflationary_expansion";
  const pricesUp = phase === "inflationary_expansion" || phase === "stagflation";
  return axis === "growth" ? phaseOf(growthUp ? -1 : 1, pricesUp ? 1 : -1) : phaseOf(growthUp ? 1 : -1, pricesUp ? -1 : 1);
}

/** X por mes: variación de 3 meses del CLI, escalada. */
export function growthAxis(cli: MonthlyValue[]): MonthlyValue[] {
  return cli.slice(3).map((p, i) => ({ period: p.period, value: round(clamp((p.value - cli[i].value) / GROWTH_SCALE)) }));
}
/** Y por mes: IPC 3 meses anualizado menos IPC anual, escalado. */
export function inflationAxis(monthlyRates: MonthlyValue[], annual: MonthlyValue[]): MonthlyValue[] {
  const out: MonthlyValue[] = [];
  for (let i = 2; i < monthlyRates.length; i++) {
    const yoy = annual.find(a => a.period === monthlyRates[i].period);
    if (!yoy) continue;
    const three = monthlyRates.slice(i - 2, i + 1).reduce((acc, r) => acc * (1 + r.value / 100), 1);
    const annualized = (Math.pow(three, 4) - 1) * 100;
    out.push({ period: monthlyRates[i].period, value: round(clamp((annualized - yoy.value) / INFLATION_SCALE)) });
  }
  return out;
}

export function evaluateRegime(cli: MonthlyValue[], cpiMonthly: MonthlyValue[], cpiAnnual: MonthlyValue[], confirmations: Confirmation[]): RegimeReading | null {
  const xs = growthAxis(cli), ys = inflationAxis(cpiMonthly, cpiAnnual);
  const trail: RegimePoint[] = ys.flatMap(y => {
    const x = xs.find(p => p.period === y.period);
    return x ? [{ period: y.period, x: x.value, y: y.value, phase: phaseOf(x.value, y.value) }] : [];
  });
  const point = trail.at(-1);
  if (!point) return null;
  const prev = trail.at(-2);
  const velocity = prev ? { x: round(point.x - prev.x), y: round(point.y - prev.y) } : { x: 0, y: 0 };
  let monthsInPhase = 0;
  for (let i = trail.length - 1; i >= 0 && trail[i].phase === point.phase; i--) monthsInPhase++;
  const axis: "growth" | "inflation" = Math.abs(point.x) <= Math.abs(point.y) ? "growth" : "inflation";
  const distance = round(Math.abs(axis === "growth" ? point.x : point.y));
  const towardBorder = axis === "growth" ? Math.sign(velocity.x) === -Math.sign(point.x) : Math.sign(velocity.y) === -Math.sign(point.y);
  const stage: Stage = distance < BORDER_ZONE && towardBorder ? "transition"
    : monthsInPhase <= 1 ? "early"
    : (point.x * velocity.x < 0 || point.y * velocity.y < 0) ? "mature" : "consolidated";
  const scored = confirmations.filter(c => c.agrees !== null);
  const nextPhase = crossTo(point.phase, axis);
  const axisWord = axis === "growth" ? "el crecimiento" : "la inflación";
  const headline = `${PHASE_LABEL[point.phase]} ${STAGE_LABEL[stage]}`;
  const from = prev && prev.phase !== point.phase ? ` Viene de ${PHASE_LABEL[prev.phase].toLowerCase()}.` : "";
  const detail = `${describeAxes(point)}${from} Lo más cercano a cambiar la fase es ${axisWord} (${distance.toLocaleString("es-ES")} sobre 1): si cruza, pasaríamos a ${PHASE_LABEL[nextPhase].toLowerCase()}.`;
  return { point, trail, stage, monthsInPhase, nearestBorder: { axis, distance, nextPhase }, velocity, confidence: { agree: scored.filter(c => c.agrees).length, total: scored.length }, headline, detail };
}

function describeAxes(p: RegimePoint): string {
  const g = p.x >= 0 ? "El ciclo adelantado sigue creciendo" : "El ciclo adelantado se contrae";
  const i = p.y >= 0 ? "la inflación reciente corre por encima de la anual" : "la inflación reciente se modera";
  return `${g} y ${i}.`;
}
