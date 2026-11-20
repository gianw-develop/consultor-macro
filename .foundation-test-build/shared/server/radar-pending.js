"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pendingRadarPage = pendingRadarPage;
const access_1 = require("./access");
const envelope_1 = require("./envelope");
async function pendingRadarPage(request) {
    const denied = await (0, access_1.authorizeRead)(request, "radar:read");
    if (denied)
        return denied;
    const classes = new URL(request.url).searchParams.getAll("assetClass");
    if (classes.length !== 1 || !["stocks", "crypto"].includes(classes[0])) {
        return (0, envelope_1.apiResponse)((0, envelope_1.unavailable)(null, "Indica una única clase: stocks o crypto."), 400);
    }
    return (0, envelope_1.apiResponse)((0, envelope_1.unavailable)({ items: [], nextCursor: null }, "Radar pendiente de integración."), 503);
}
