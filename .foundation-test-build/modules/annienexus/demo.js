"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INDEX_CARDS = exports.DEMO_STORIES = void 0;
// Editorial hypothetical scenarios only. Not observations, forecasts, or market signals.
exports.DEMO_STORIES = {
    today: { label: "HOY · EJEMPLO", title: "Una sorpresa puede mover la sesión.", text: "Imagina una inflación superior a lo esperado. El mercado podría revisar los tipos de interés; la reacción del día aún no demuestra un cambio de tendencia.", driver: "La sorpresa del dato", supports: "Los rendimientos de bonos suben tras la publicación.", contradicts: "Los índices mantienen su avance y la reacción se diluye.", changes: "La reacción persiste y otras fuentes confirman el cambio." },
    week: { label: "ESTA SEMANA · EJEMPLO", title: "El mercado vuelve a poner precio al dinero.", text: "En este ejemplo, varios datos y mensajes de la Fed cambian las expectativas de tipos. Importa su efecto conjunto, no contar noticias positivas y negativas.", driver: "Expectativas de tipos", supports: "Varios datos apuntan a presiones de precios persistentes.", contradicts: "El crédito y los sectores sensibles a los tipos no acompañan.", changes: "Los nuevos datos revierten la sorpresa inicial." },
    one_to_three_months: { label: "1–3 MESES · EJEMPLO", title: "La inflación cede. La actividad necesita confirmar.", text: "Si los precios crecen más despacio sin un deterioro fuerte de la economía, podría aliviarse la presión de los intereses. El empleo y los beneficios deben acompañar.", driver: "Inflación y crecimiento", supports: "La inflación se modera sin caída fuerte de la actividad.", contradicts: "Las empresas recortan beneficios y se encarece su financiación.", changes: "La desinflación —menor subida de precios— llega con deterioro económico." },
    three_to_six_months: { label: "3–6 MESES · EJEMPLO", title: "La tesis necesita beneficios que la sostengan.", text: "En varios meses, las ganancias empresariales y el coste de financiación deben sostener la historia. Una sesión roja no invalida por sí sola esa tesis.", driver: "Beneficios y financiación", supports: "Los beneficios y la capacidad de invertir se mantienen.", contradicts: "Caen los márgenes y aumenta la dificultad para financiarse.", changes: "Un deterioro persistente de beneficios cambia el escenario." },
};
exports.INDEX_CARDS = [
    { id: "DJIA", name: "Dow Jones", short: "DOW", caption: "30 compañías · ponderado por precio", mechanism: "La respuesta depende de sus empresas; un precio mayor implica más peso en este índice." },
    { id: "SP500", name: "S&P 500", short: "SPX", caption: "Grandes empresas de Estados Unidos", mechanism: "Beneficios y valoraciones —lo que se paga por ellos— conectan la economía con el índice." },
    { id: "NDX", name: "Nasdaq-100", short: "NDX", caption: "100 grandes compañías no financieras", mechanism: "Las expectativas de beneficios futuros pueden hacerlo sensible a cambios en los intereses." },
];
