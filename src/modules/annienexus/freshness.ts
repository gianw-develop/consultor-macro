/**
 * Vigencia del corte publicado. La web no tiene datos en vivo: cada serie se
 * incorpora a mano antes de desplegar. Este módulo solo compara fechas para
 * decir, sin inventar resultados, qué lectura sigue vigente y qué publicación
 * oficial ya salió pero todavía no está incorporada.
 */
import { ECONOMIC_EVENTS, NEXT_WEEK_EVENTS, type EconomicEvent } from "./economic-calendar";
import { GDP_RELEASED_AT, GDP_NEXT_AT } from "./reviewed-observations";
import { CLAIMS_RELEASED_AT, INFLATION_RELEASED_AT } from "./economic-pillars-data";
import { FED_TARGET, FED_NEXT_DECISION } from "./sectors-data";
import type { ClockReading } from "./regime-clock";

export type FreshnessState = "current" | "pending" | "expired";
export type FreshnessItem = {
  id: string; label: string; reading: string; asOf: string | null;
  nextAt: string | null; state: FreshnessState; note: string;
};
export type FreshnessSummary = {
  items: FreshnessItem[]; state: FreshnessState;
  cutAt: string; cutAgeDays: number | null;
  pending: number; expired: number;
};

const DAY = 86_400_000;
const valid = (iso: string | null | undefined): iso is string => !!iso && Number.isFinite(Date.parse(iso));
export function daysBetween(from: string, to: string): number | null {
  if (!valid(from) || !valid(to)) return null;
  return Math.max(0, Math.floor((Date.parse(to) - Date.parse(from)) / DAY));
}
const shortDate = (iso: string) => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "Europe/Madrid" }).format(new Date(iso));

/** Todas las publicaciones de la agenda cargada, ordenadas por fecha. */
export function agendaEvents(): EconomicEvent[] {
  const seen = new Set<string>();
  return [...ECONOMIC_EVENTS, ...NEXT_WEEK_EVENTS]
    .filter(e => valid(e.scheduledAt) && !seen.has(e.id) && seen.add(e.id))
    .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt));
}
/** Publicaciones aún por salir. Una fecha pasada nunca se muestra como próxima. */
export function upcomingEvents(now: string, events = agendaEvents()): EconomicEvent[] {
  if (!valid(now)) return [];
  return events.filter(e => !e.result && Date.parse(e.scheduledAt) > Date.parse(now));
}
/** Publicaciones cuya hora ya pasó y cuyo resultado no se ha incorporado. */
export function overdueEvents(now: string, events = agendaEvents()): EconomicEvent[] {
  if (!valid(now)) return [];
  return events.filter(e => !e.result && Date.parse(e.scheduledAt) <= Date.parse(now));
}
/** Último evento cargado: más allá de esta fecha la agenda está vacía, no tranquila. */
export function agendaHorizon(events = agendaEvents()): string | null {
  return events.at(-1)?.scheduledAt ?? null;
}

function scheduled(id: string, asOf: string | null, nextAt: string | null, now: string, base: Omit<FreshnessItem, "state" | "note" | "asOf" | "nextAt" | "id">): FreshnessItem {
  const due = valid(nextAt) && valid(now) && Date.parse(now) >= Date.parse(nextAt);
  return {
    id, ...base, asOf, nextAt,
    state: due ? "pending" : "current",
    note: due ? `Nueva publicación el ${shortDate(nextAt!)}; sin incorporar` : nextAt ? `Próxima: ${shortDate(nextAt)}` : "Sin fecha próxima cargada",
  };
}

export function evaluateFreshness(now: string, cutAt: string, clock: ClockReading, input: { gdp: string; cpi: string; fed: string; claims: string; payrolls: string }): FreshnessSummary {
  const events = agendaEvents();
  const nextOf = (pattern: RegExp, after: string | null) => events.find(e => pattern.test(e.title) && (!valid(after) || Date.parse(e.scheduledAt) > Date.parse(after)))?.scheduledAt ?? null;
  const claimsNext = valid(CLAIMS_RELEASED_AT) ? new Date(Date.parse(CLAIMS_RELEASED_AT) + 7 * DAY).toISOString() : null;
  const items: FreshnessItem[] = [
    scheduled("gdp", GDP_RELEASED_AT, GDP_NEXT_AT, now, { label: "PIB real", reading: input.gdp }),
    scheduled("cpi", INFLATION_RELEASED_AT, nextOf(/^IPC\b/, INFLATION_RELEASED_AT), now, { label: "Inflación · IPC", reading: input.cpi }),
    scheduled("payrolls", null, nextOf(/NFP/, null), now, { label: "Empleo · NFP", reading: input.payrolls }),
    scheduled("claims", CLAIMS_RELEASED_AT, claimsNext, now, { label: "Solicitudes de subsidio", reading: input.claims }),
    scheduled("fed", `${FED_TARGET.decision}T18:00:00Z`, FED_NEXT_DECISION, now, { label: "Tipos · Fed", reading: input.fed }),
  ];
  const review = clock.review;
  const reviewExpired = !review || clock.status !== "provisional";
  items.push({
    id: "regime", label: "Fase del ciclo", reading: review ? "Revisión editorial" : "Sin revisión",
    asOf: review?.cut ?? null, nextAt: review?.reviewBy ?? null,
    state: reviewExpired ? "expired" : "current",
    note: !review ? "Falta una revisión fechada" : reviewExpired ? `Revisión caducada el ${shortDate(review.reviewBy)}` : `Revisar antes del ${shortDate(review.reviewBy)}`,
  });
  const pending = items.filter(i => i.state === "pending").length;
  const expired = items.filter(i => i.state === "expired").length;
  return {
    items, cutAt, cutAgeDays: daysBetween(cutAt, now), pending, expired,
    state: expired ? "expired" : pending ? "pending" : "current",
  };
}
