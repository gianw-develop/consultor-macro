"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeReadingInput = makeReadingInput;
const sectors_data_1 = require("./sectors-data");
const economic_pillars_data_1 = require("./economic-pillars-data");
const m1_data_1 = require("./m1-data");
const employment_release_json_1 = __importDefault(require("./employment-release.json"));
const activity_review_json_1 = __importDefault(require("./activity-review.json"));
const reviewed_observations_1 = require("./reviewed-observations");
const reviewedAt = "2026-10-20T23:15:45Z";
const source = (name, url, publishedAt, checkedAt, revision) => ({ name, url, publishedAt, checkedAt, revision });
function monthly(s, id, name) {
    return { id: s?.id ?? id, name, unit: s?.unit ?? "puntos de índice; tendencia = 100", frequency: "month", points: s?.points ?? [], source: s ? { name: s.source.name, url: s.source.url, publishedAt: s.source.publishedAt, checkedAt: s.source.fetchedAt, revision: "Versión revisada consultada; no es una serie de lo conocido históricamente." } : source("Fuente ausente", "", null, reviewedAt) };
}
function makeReadingInput(snapshot) {
    const tcbSource = source("Conference Board · LEI y CEI", reviewed_observations_1.TCB_URL, reviewed_observations_1.tcbData.releasedAt, reviewed_observations_1.TCB_CHECKED_AT, "Julio y agosto revisados; septiembre preliminar. LEI julio +0,2→+0,3 %. Algunas series componentes son estimaciones del proveedor.");
    const nfp = monthly(snapshot?.nfp, "CES0000000001", "NFP · empleo observado");
    if (nfp.points.at(-1)?.period === "2026-08")
        nfp.source = { ...nfp.source, url: "https://www.bls.gov/news.release/archives/empsit_09042026.htm", publishedAt: "2026-09-04T12:30:00Z" };
    if (nfp.points.at(-1)?.period === employment_release_json_1.default.period)
        nfp.source = { ...nfp.source, url: employment_release_json_1.default.url, publishedAt: employment_release_json_1.default.publishedAt, revision: "Julio +21→−10 mil; agosto +162→+133 mil. Cambios revisados −60 mil en conjunto; niveles API recalculados." };
    const laborSource = source("BLS · encuestas de hogares y establecimientos", employment_release_json_1.default.url, employment_release_json_1.default.publishedAt, employment_release_json_1.default.checkedAt, "A1: ajustado por estacionalidad. Horas: promedio semanal privado, B2.");
    const labor = (key, name, unit) => ({ id: "BLS." + key, name, unit, frequency: "month", points: employment_release_json_1.default[key], source: laborSource });
    const treasury = (index, name) => ({ id: `UST.${index === 3 ? "2Y" : "10Y"}`, name, unit: "% de rendimiento", frequency: "day", points: (snapshot?.treasury?.rows ?? []).slice(0, 5).reverse().map(r => ({ period: r.date, value: r.values[index] ?? null })), source: source("Tesoro · rendimientos par", snapshot?.treasury?.source.url ?? "", snapshot?.treasury?.rows[0]?.date ?? null, snapshot?.treasury?.source.fetchedAt ?? reviewedAt) });
    const input = {
        cut: [snapshot?.capturedAt ?? "", economic_pillars_data_1.PILLARS_CHECKED_AT, economic_pillars_data_1.INFLATION_CHECKED_AT, economic_pillars_data_1.CLAIMS_CHECKED_AT, m1_data_1.M1_CHECKED_AT, reviewedAt, reviewed_observations_1.TCB_CHECKED_AT, employment_release_json_1.default.checkedAt].sort((a, b) => Date.parse(a) - Date.parse(b)).at(-1), review: activity_review_json_1.default,
        claims: { id: "DOL.IC4WSA", name: "Solicitudes · media 4 semanas", unit: "personas", frequency: "week", points: economic_pillars_data_1.weeklyClaims.map(p => ({ period: p.period, value: p.average })), source: source("DOL · solicitudes ajustadas por estacionalidad", economic_pillars_data_1.CLAIMS_URL, economic_pillars_data_1.CLAIMS_RELEASED_AT, economic_pillars_data_1.CLAIMS_CHECKED_AT, economic_pillars_data_1.CLAIMS_REVISION) },
        retail: { id: "RSAFS/CPIAUCSL.MoM", name: "Ventas reales · consumo", unit: "% mensual", frequency: "month", points: economic_pillars_data_1.recentRetailRates.map(p => ({ period: p.period, value: p.real })), source: source("Census y BLS / FRED · RSAFS ÷ CPIAUCSL", "https://fred.stlouisfed.org/series/RSAFS", economic_pillars_data_1.RETAIL_RELEASED_AT, economic_pillars_data_1.PILLARS_CHECKED_AT, `Ventas revisadas ${economic_pillars_data_1.RETAIL_REVISED_AT}; IPC publicado ${economic_pillars_data_1.CPI_RELEASED_AT}. Cociente exacto de tasas, no resta.`) },
        money: { id: "M1SL/CPIAUCSL.6M", name: "M1 real · dinero disponible", unit: "% en seis meses", frequency: "month", points: m1_data_1.m1Growth, source: source("Fed y BLS / FRED · M1SL ÷ CPIAUCSL", "https://fred.stlouisfed.org/series/M1SL", m1_data_1.M1_AVAILABLE_FROM, m1_data_1.M1_CHECKED_AT, "Crecimiento semestral no anualizado; últimos datos revisados. Fórmula de AWNexus, equivalencia exacta al gráfico de clase pendiente.") },
        cli: monthly(snapshot?.cli?.USA, "OECD.CLI.USA", "CLI · EE. UU."), cliG7: monthly(snapshot?.cli?.G7, "OECD.CLI.G7", "CLI G7"), cliG20: monthly(snapshot?.cli?.G20, "OECD.CLI.G20", "CLI G20"),
        lei: { id: "TCB.LEI.MoM", name: "LEI · señales tempranas", unit: "% mensual", frequency: "month", points: reviewed_observations_1.tcbData.lei.rates.map((value, i) => ({ period: reviewed_observations_1.tcbData.periods[i], value })), source: tcbSource },
        cei: { id: "TCB.CEI.MoM", name: "CEI · actividad presente", unit: "% mensual", frequency: "month", points: reviewed_observations_1.tcbData.cei.rates.map((value, i) => ({ period: reviewed_observations_1.tcbData.periods[i], value })), source: tcbSource },
        gdp: { id: "BEA.GDP.real.qoq.saar", name: "PIB real", unit: "% trimestral anualizado", frequency: "quarter", points: reviewed_observations_1.gdpData, source: source("BEA · PIB real", reviewed_observations_1.GDP_URL, reviewed_observations_1.GDP_RELEASED_AT, reviewed_observations_1.GDP_CHECKED_AT, "Avance T3: +3,4 % trimestral anualizado; T2 +2,2 %. Primera estimación revisable. T1 conserva la revisión del 30/09.") },
        inflation: { id: "BLS.CPI.all.MoM", name: "IPC · presión mensual", unit: "% mensual", frequency: "month", points: economic_pillars_data_1.cpiMonthlyRates, source: source("BLS · IPC general ajustado por estacionalidad", economic_pillars_data_1.INFLATION_URL, economic_pillars_data_1.INFLATION_RELEASED_AT, economic_pillars_data_1.INFLATION_CHECKED_AT, "Tasas mensuales redondeadas. Septiembre: general +0,6 % mensual y +3,7 % anual; subyacente +0,3 % mensual y +2,6 % anual.") },
        inflationAnnual: { id: "BLS.CPI.all.YoY", name: "IPC general interanual", unit: "% interanual", frequency: "month", points: [{ period: "2026-07", value: 3.4 }, { period: "2026-08", value: 3.4 }, { period: "2026-09", value: 3.7 }], source: source("BLS · IPC general interanual", economic_pillars_data_1.INFLATION_URL, economic_pillars_data_1.INFLATION_RELEASED_AT, economic_pillars_data_1.INFLATION_CHECKED_AT) },
        nfp, laborContext: { unemployment: labor("unemployment", "Desempleo", "%"), participation: labor("participation", "Participación laboral", "%"), hours: labor("hours", "Horas semanales privadas", "horas") }, treasury2: treasury(3, "Rendimiento 2 años"), treasury10: treasury(7, "Rendimiento 10 años"), ceiSixMonth: reviewed_observations_1.tcbData.cei.six, ceiComponentsSixMonth: reviewed_observations_1.tcbData.cei.componentDirections,
        fedTarget: { lower: sectors_data_1.FED_TARGET.lower, upper: sectors_data_1.FED_TARGET.upper, period: sectors_data_1.FED_TARGET.decision, source: source("Fed · rango objetivo, no tipo efectivo", sectors_data_1.FED_TARGET.source, "2026-10-28T18:00:00Z", sectors_data_1.FED_TARGET.checkedAt, "Decisión del 28 de octubre: mantiene 3,75–4,00 %, por 10 votos a 2.") },
    };
    return input;
}
