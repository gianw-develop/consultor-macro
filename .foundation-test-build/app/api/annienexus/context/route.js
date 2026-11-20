"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamic = void 0;
exports.GET = GET;
const core_1 = require("../../../../contracts/core");
const context_1 = require("../../../../modules/annienexus/context");
const access_1 = require("../../../../shared/server/access");
const envelope_1 = require("../../../../shared/server/envelope");
exports.dynamic = "force-dynamic";
async function GET(request) {
    const denied = await (0, access_1.authorizeRead)(request, "annienexus:read");
    if (denied)
        return denied;
    const values = new URL(request.url).searchParams.getAll("horizon");
    if (values.length !== 1 || !(0, core_1.isHorizon)(values[0])) {
        return (0, envelope_1.apiResponse)((0, envelope_1.unavailable)(null, "Indica un único horizonte válido."), 400);
    }
    return (0, envelope_1.apiResponse)((0, context_1.getPendingContext)(values[0]), 503);
}
