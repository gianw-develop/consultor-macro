"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankSectorsByDailyChange = rankSectorsByDailyChange;
const sectors_data_1 = require("./sectors-data");
/** Both prices must use the same adjustment convention and regular-session basis.
 * The adapter supplies the exchange session, including holidays; not the local date.
 * Call again for each new coherent provider snapshot to recalculate the order.
 * No provider or refresh process is connected to this function yet.
 */
function rankSectorsByDailyChange(quotes, session) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(session) ||
        !Number.isFinite(Date.parse(session)) || new Date(session).toISOString().slice(0, 10) !== session) {
        throw new Error('Expected a valid exchange session date');
    }
    const rows = sectors_data_1.SECTORS.map(({ symbol }) => {
        const matches = quotes.filter(quote => quote.symbol === symbol && quote.session === session);
        // An ambiguous or missing quote is unavailable, not a zero daily return.
        const quote = matches.length === 1 ? matches[0] : undefined;
        const valid = quote && Number.isFinite(quote.price) && quote.price > 0 &&
            Number.isFinite(quote.previousClose) && quote.previousClose > 0;
        const change = valid ? (quote.price / quote.previousClose - 1) * 100 : null;
        return { symbol, changePercent: change !== null && Number.isFinite(change) ? change : null, rank: null };
    });
    rows.sort((a, b) => {
        if (a.changePercent === null && b.changePercent !== null)
            return 1;
        if (b.changePercent === null && a.changePercent !== null)
            return -1;
        return (b.changePercent ?? 0) - (a.changePercent ?? 0) || a.symbol.localeCompare(b.symbol);
    });
    const count = rows.filter(row => row.changePercent !== null).length;
    // Assign ranks only when all six sectors are comparable.
    if (count === sectors_data_1.SECTORS.length) {
        rows.forEach((row, index) => {
            row.rank = index > 0 && row.changePercent === rows[index - 1].changePercent
                ? rows[index - 1].rank : index + 1;
        });
    }
    return { status: count === sectors_data_1.SECTORS.length ? 'complete' : count ? 'partial' : 'unavailable', session, rows };
}
