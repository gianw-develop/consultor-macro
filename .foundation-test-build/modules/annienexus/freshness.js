"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.daysBetween = daysBetween;
exports.agendaEvents = agendaEvents;
exports.upcomingEvents = upcomingEvents;
exports.overdueEvents = overdueEvents;
exports.agendaHorizon = agendaHorizon;
exports.evaluateFreshness = evaluateFreshness;
/**
 * Vigencia del corte publicado. La web no tiene datos en vivo: cada serie se
 * incorpora a mano antes de desplegar. Este módulo solo compara fechas para
 * decir, sin inventar resultados, qué lectura sigue vigente y qué publicación
 * oficial ya salió pero todavía no está incorporada.
 */
const economic_calendar_1 = require("./economic-calendar");
const reviewed_observations_1 = require("./reviewed-observations");
const economic_pillars_data_1 = require("./economic-pillars-data");
const sectors_data_1 = require("./sectors-data");
const DAY = 86_400_000;
const valid = (iso) => !!iso && Number.isFinite(Date.parse(iso));
function daysBetween(from, to) {
    if (!valid(from) || !valid(to))
        return null;
    return Math.max(0, Math.floor((Date.parse(to) - Date.parse(from)) / DAY));
}
const shortDate = (iso) => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "Europe/Madrid" }).format(new Date(iso));
/** Todas las publicaciones de la agenda cargada, ordenadas por fecha. */
function agendaEvents() {
    const seen = new Set();
    return [...economic_calendar_1.ECONOMIC_EVENTS, ...economic_calendar_1.NEXT_WEEK_EVENTS]
        .filter(e => valid(e.scheduledAt) && !seen.has(e.id) && seen.add(e.id))
        .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt));
}
/** Publicaciones aún por salir. Una fecha pasada nunca se muestra como próxima. */
function upcomingEvents(now, events = agendaEvents()) {
    if (!valid(now))
        return [];
    return events.filter(e => !e.result && Date.parse(e.scheduledAt) > Date.parse(now));
}
/** Publicaciones cuya hora ya pasó y cuyo resultado no se ha incorporado. */
function overdueEvents(now, events = agendaEvents()) {
    if (!valid(now))
        return [];
    return events.filter(e => !e.result && Date.parse(e.scheduledAt) <= Date.parse(now));
}
/** Último evento cargado: más allá de esta fecha la agenda está vacía, no tranquila. */
function agendaHorizon(events = agendaEvents()) {
    return events.at(-1)?.scheduledAt ?? null;
}
function scheduled(id, asOf, nextAt, now, base) {
    const due = valid(nextAt) && valid(now) && Date.parse(now) >= Date.parse(nextAt);
    return {
        id, ...base, asOf, nextAt,
        state: due ? "pending" : "current",
        note: due ? `Nueva publicación el ${shortDate(nextAt)}; sin incorporar` : nextAt ? `Próxima: ${shortDate(nextAt)}` : "Sin fecha próxima cargada",
    };
}
function evaluateFreshness(now, cutAt, clock, input) {
    const events = agendaEvents();
    const nextOf = (pattern, after) => events.find(e => pattern.test(e.title) && (!valid(after) || Date.parse(e.scheduledAt) > Date.parse(after)))?.scheduledAt ?? null;
    const claimsNext = valid(economic_pillars_data_1.CLAIMS_RELEASED_AT) ? new Date(Date.parse(economic_pillars_data_1.CLAIMS_RELEASED_AT) + 7 * DAY).toISOString() : null;
    const items = [
        scheduled("gdp", reviewed_observations_1.GDP_RELEASED_AT, reviewed_observations_1.GDP_NEXT_AT, now, { label: "PIB real", reading: input.gdp }),
        scheduled("cpi", economic_pillars_data_1.INFLATION_RELEASED_AT, nextOf(/^IPC\b/, economic_pillars_data_1.INFLATION_RELEASED_AT), now, { label: "Inflación · IPC", reading: input.cpi }),
        scheduled("payrolls", null, nextOf(/NFP/, null), now, { label: "Empleo · NFP", reading: input.payrolls }),
        scheduled("claims", economic_pillars_data_1.CLAIMS_RELEASED_AT, claimsNext, now, { label: "Solicitudes de subsidio", reading: input.claims }),
        scheduled("fed", `${sectors_data_1.FED_TARGET.decision}T18:00:00Z`, sectors_data_1.FED_NEXT_DECISION, now, { label: "Tipos · Fed", reading: input.fed }),
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
