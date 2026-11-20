"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUADRANT_LABELS = exports.QUADRANT_DEMO = void 0;
exports.demoQuadrantPoint = demoQuadrantPoint;
exports.quadrantView = quadrantView;
exports.quadrantMovement = quadrantMovement;
exports.demoPhaseAngle = demoPhaseAngle;
function demoQuadrantPoint(frame) {
    if (frame.kind !== "demonstration")
        return null;
    const values = [frame.growth.current, frame.growth.previous, frame.inflation.current, frame.inflation.previous];
    if (!values.every(Number.isFinite))
        return null;
    const x = Number((frame.growth.current - frame.growth.previous).toFixed(2));
    const y = Number((frame.inflation.current - frame.inflation.previous).toFixed(2));
    const zone = x === 0 || y === 0 ? "transition"
        : x > 0 ? (y > 0 ? "growth_prices_up" : "growth_up_prices_easing")
            : y > 0 ? "growth_down_prices_up" : "growth_prices_easing";
    return { x, y, zone };
}
// Explicitly invented annual rates; the comparison is with three months earlier.
const growth = [1.6, 1.5, 1.4, 1.3, 1.5, 1.8, 2.2, 2.4, 2.3, 2.2];
const inflation = [3.1, 3.2, 3.4, 3.6, 3.5, 3.3, 3.1, 3.2, 3.6, 3.8];
exports.QUADRANT_DEMO = growth.slice(3).map((value, i) => {
    const month = `2025-${String(i + 1).padStart(2, "0")}`;
    const end = new Date(Date.UTC(2025, i + 1, 0, 23, 59, 59));
    return {
        kind: "demonstration", month, observedAt: end.toISOString(),
        // Fictional availability dates, separated from the observation period.
        publishedAt: new Date(Date.UTC(2025, i + 2, 15, 12)).toISOString(),
        growth: { current: value, previous: growth[i] },
        inflation: { current: inflation[i + 3], previous: inflation[i] },
    };
});
function quadrantView(demo, selected) {
    if (!demo)
        return { frame: null, point: null, trail: [] };
    const index = Math.max(0, Math.min(exports.QUADRANT_DEMO.length - 1, Math.trunc(Number.isFinite(selected) ? selected : 0)));
    const frame = exports.QUADRANT_DEMO[index];
    return { frame, point: demoQuadrantPoint(frame), trail: exports.QUADRANT_DEMO.slice(0, index + 1) };
}
function quadrantMovement(demo, selected) {
    const view = quadrantView(demo, selected);
    if (!view.point)
        return { state: "unassessed", title: "Movimiento sin evaluar", explanation: "No hay un corte de datos verificable ni una regla documentada que permita afirmar aproximación, transición o cruce.", confirmed: false };
    const previous = view.trail.length > 1 ? demoQuadrantPoint(view.trail[view.trail.length - 2]) : null;
    const point = view.point;
    if (point.x === 0 || point.y === 0)
        return { state: "demo_boundary", title: "Sobre una frontera del ejemplo", explanation: "Una de las diferencias ficticias vale cero. Es una frontera matemática de esta demostración, no una señal confirmada sobre Estados Unidos.", confirmed: false };
    if (previous && ((point.x * previous.x < 0) || (point.y * previous.y < 0)))
        return { state: "demo_crossing", title: "Cruce dentro de la demostración", explanation: "Una diferencia ficticia cambia de signo respecto al mes anterior. El cruce solo pertenece a estos números inventados; no confirma un cambio económico real.", confirmed: false };
    if (previous && (Math.abs(point.x) < Math.abs(previous.x) || Math.abs(point.y) < Math.abs(previous.y)))
        return { state: "demo_approach", title: "Acercamiento en el ejemplo", explanation: "Al menos una diferencia ficticia se acerca a cero respecto al mes anterior. No se traduce en una distancia validada ni en certeza sobre un cambio de régimen.", confirmed: false };
    return { state: "demo_observation", title: "Posición del ejemplo seleccionado", explanation: "El punto representa las dos diferencias ficticias de esta fecha. El movimiento al cambiar de mes no expresa velocidad económica ni una predicción.", confirmed: false };
}
exports.QUADRANT_LABELS = {
    growth_prices_up: { title: "Más crecimiento, más presión de precios", description: "La actividad gana velocidad y la inflación se intensifica.", supports: "Una mejora extendida de producción, empleo y beneficios debe acompañar el impulso.", changes: "Menos presión de precios o una pérdida persistente de actividad moverían la lectura." },
    growth_up_prices_easing: { title: "Más crecimiento, inflación moderándose", description: "La actividad gana velocidad y los precios suben más despacio.", supports: "Actividad y beneficios resistentes, junto con menor presión de precios.", changes: "Un repunte de inflación o un deterioro de actividad y crédito cambiarían la lectura." },
    growth_down_prices_up: { title: "Menos impulso, más presión de precios", description: "La actividad pierde velocidad mientras aumenta el ritmo de subida de precios.", supports: "Contrastar si la debilidad es amplia y si la inflación persiste fuera de la energía.", changes: "Una recuperación de actividad o una moderación sostenida de precios aliviarían la tensión." },
    growth_prices_easing: { title: "Menos impulso, inflación moderándose", description: "La actividad pierde velocidad y la inflación baja. Eso no demuestra recesión ni caída general de precios.", supports: "Empleo, producción, consumo y precios deben confirmar la amplitud del cambio.", changes: "Una recuperación de actividad o un repunte de precios moverían la lectura." },
    transition: { title: "Mixto / transición", description: "Al menos un eje no tiene una dirección definida. No se fuerza una etiqueta.", supports: "Esperar publicaciones y contrastar señales que discrepan.", changes: "Un movimiento sostenido y coherente en ambos ejes permitiría situar el régimen." },
};
/** Direction around a teaching dial only. No magnitude, speed, probability or real classification. */
function demoPhaseAngle(demo, point) {
    if (!demo || !point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || (point.x === 0 && point.y === 0))
        return null;
    return Math.atan2(point.x, point.y) * 180 / Math.PI;
}
