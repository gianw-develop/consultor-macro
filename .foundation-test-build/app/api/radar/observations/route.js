"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamic = void 0;
exports.GET = GET;
const access_1 = require("../../../../shared/server/access");
const envelope_1 = require("../../../../shared/server/envelope");
const core_1 = require("../../../../contracts/core");
const service_1 = require("../../../../modules/radar/service");
exports.dynamic = "force-dynamic";
async function GET(request) {
    const denied = await (0, access_1.authorizeRead)(request, "radar:read");
    if (denied)
        return denied;
    const params = new URL(request.url).searchParams;
    const markets = params.getAll("assetClass"), horizons = params.getAll("horizon");
    if (markets.length !== 1 || horizons.length !== 1 || !["stocks", "crypto"].includes(markets[0]) || !(0, core_1.isHorizon)(horizons[0])) {
        return (0, envelope_1.apiResponse)((0, envelope_1.unavailable)(null, "Indica una clase de activo y un horizonte válidos, sin duplicados."), 400);
    }
    try {
        const result = await (0, service_1.collectObservations)({ assetClass: markets[0], horizon: horizons[0], context: null });
        return (0, envelope_1.apiResponse)(result, 200);
    }
    catch {
        return (0, envelope_1.apiResponse)((0, envelope_1.unavailable)({ items: [], nextCursor: null }, "No se pudo obtener una observación verificable."), 503);
    }
}
