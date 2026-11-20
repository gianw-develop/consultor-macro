"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIMPLE_REFERENCES = exports.FTMO_SOURCE = exports.REFERENCE_DATE = void 0;
exports.referenceFactor = referenceFactor;
exports.approximatePrice = approximatePrice;
const calculator_data_1 = require("./calculator-data");
// Dated public observations, not a live feed or a validated broker calibration.
// User explicitly chose an approximate, offline calculator on 2026-10-29.
exports.REFERENCE_DATE = "2026-10-29";
exports.FTMO_SOURCE = "https://ftmo.com/en/symbols/";
exports.SIMPLE_REFERENCES = {
    SPX: { origin: 7743.98, originAt: "2026-10-28T21:18:42Z", bid: 7725.65, ask: 7726.25, observedAt: "2026-10-29T10:45:07.973Z", source: "https://finance.yahoo.com/quote/%5EGSPC/", mode: "nominal" },
    DIA: { origin: 524, originAt: "2026-10-29T10:44:01Z", bid: 52476.86, ask: 52479.34, observedAt: "2026-10-29T10:45:07.973Z", source: "https://finance.yahoo.com/quote/DIA/", mode: "ratio" },
    GLD: { origin: 368.93, originAt: "2026-10-29T10:43:58Z", bid: 4026.80, ask: 4027.17, observedAt: "2026-10-29T10:45:18.003Z", source: "https://finance.yahoo.com/quote/GLD/", mode: "ratio" },
    QQQ: { origin: 718.07, originAt: "2026-10-29T10:44:31Z", bid: 29520.53, ask: 29522.38, observedAt: "2026-10-29T10:45:07.973Z", source: "https://finance.yahoo.com/quote/QQQ/", mode: "ratio" },
};
function referenceFactor(symbol) {
    const ref = exports.SIMPLE_REFERENCES[symbol];
    // SPX is closed while the CFD is trading. Their observed difference includes
    // overnight market movement: never present it as a measured broker offset.
    return ref.mode === "nominal" ? 1 : ((ref.bid + ref.ask) / 2) / ref.origin;
}
function approximatePrice(symbol, raw) {
    const ins = (0, calculator_data_1.instrument)(symbol);
    if (!ins)
        return { value: null, error: "Instrumento no admitido." };
    if (!raw.trim())
        return { value: null, error: "" };
    const price = (0, calculator_data_1.parseCalculatorPrice)(raw);
    if (price === null)
        return { value: null, error: "Introduce un precio positivo, sin separadores de miles. Ejemplo: 7700 o 7700,25." };
    const value = Math.round(price * referenceFactor(ins.symbol) * 100) / 100;
    if (!Number.isFinite(value) || value <= 0)
        return { value: null, error: "El precio queda fuera del rango calculable." };
    // Two decimals are display precision, not an assertion about the account tick.
    return { value, error: "" };
}
