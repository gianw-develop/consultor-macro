"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENT_ESTIMATE = exports.ESTIMATE_SOURCES = exports.ESTIMATE_SNAPSHOT = void 0;
exports.estimatePosition = estimatePosition;
exports.ESTIMATE_SNAPSHOT = {
    country: "USA",
    asOf: "2026-09-30T17:28:06+02:00",
    observedMonth: "2026-08",
    cliPublished: "2026-09-07",
    cpiPublished: "2026-09-11T08:30:00-04:00",
    cli: [
        { month: "2026-05", value: 100.7064 },
        { month: "2026-06", value: 100.8031 },
        { month: "2026-07", value: 100.8923 },
        { month: "2026-08", value: 100.9563 },
    ],
    // Table A, seasonally adjusted monthly changes. Published rounded to 0.1 percentage point.
    cpi: [
        { month: "2026-03", value: 0.9 },
        { month: "2026-04", value: 0.6 },
        { month: "2026-05", value: 0.5 },
        { month: "2026-06", value: -0.4 },
        { month: "2026-07", value: 0.1 },
        { month: "2026-08", value: 0.4 },
    ],
};
exports.ESTIMATE_SOURCES = {
    cli: "https://www.oecd.org/en/data/datasets/oecd-composite-leading-indicators-clis.html",
    cliData: "https://sdmx.oecd.org/public/rest/data/OECD.SDD.STES,DSD_STES@DF_CLI/USA.M.LI...AA...H?startPeriod=2026-05&endPeriod=2026-08&dimensionAtObservation=AllDimensions&format=csvfilewithlabels",
    cpi: "https://www.bls.gov/news.release/archives/cpi_09112026.htm",
};
const period = (month) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
        return NaN;
    const [year, m] = month.split("-").map(Number);
    return year * 12 + m - 1;
};
const compound = (values) => (values.reduce((product, rate) => product * (1 + rate / 100), 1) - 1) * 100;
function estimatePosition(input) {
    const cutoff = Date.parse(input.asOf);
    const end = period(input.observedMonth);
    const releases = [Date.parse(input.cliPublished), Date.parse(input.cpiPublished)];
    if (input.country !== "USA" || !Number.isFinite(cutoff) || !Number.isFinite(end) ||
        releases.some(date => !Number.isFinite(date) || date > cutoff) ||
        end >= period(input.asOf.slice(0, 7)))
        return null;
    const window = (rows, length) => {
        if (rows.some(row => !Number.isFinite(row.value) || !Number.isFinite(period(row.month))))
            return null;
        const result = [];
        for (let offset = length - 1; offset >= 0; offset--) {
            const matches = rows.filter(row => period(row.month) === end - offset);
            if (matches.length !== 1)
                return null;
            result.push(matches[0].value);
        }
        return result;
    };
    const cli = window(input.cli, 4);
    const cpi = window(input.cpi, 6);
    if (!cli || !cpi || cli.some(value => value <= 0) || cpi.some(value => value <= -100))
        return null;
    const growthChange = cli[3] - cli[0];
    const priorInflation = compound(cpi.slice(0, 3));
    const recentInflation = compound(cpi.slice(3));
    // A direction must survive the source's rounding precision; this is not an economic threshold.
    const growthDirection = growthChange > 0.01 ? 1 : growthChange < -0.01 ? -1 : 0;
    const recentLow = compound(cpi.slice(3).map(rate => rate - 0.05));
    const recentHigh = compound(cpi.slice(3).map(rate => rate + 0.05));
    const priorLow = compound(cpi.slice(0, 3).map(rate => rate - 0.05));
    const priorHigh = compound(cpi.slice(0, 3).map(rate => rate + 0.05));
    const inflationDirection = recentLow > priorHigh ? 1 : recentHigh < priorLow ? -1 : 0;
    // Fixed sector centers communicate only the two signs, never magnitude, distance or certainty.
    const angle = !growthDirection || !inflationDirection ? null : growthDirection > 0 ? (inflationDirection > 0 ? 45 : 135) : (inflationDirection > 0 ? -45 : -135);
    return { growthChange, growthLevel: cli[3], priorInflation, recentInflation, growthDirection, inflationDirection, angle, confirmedRegime: false };
}
exports.CURRENT_ESTIMATE = estimatePosition(exports.ESTIMATE_SNAPSHOT);
