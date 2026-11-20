"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamic = void 0;
exports.GET = GET;
const access_1 = require("../../../../shared/server/access");
const envelope_1 = require("../../../../shared/server/envelope");
exports.dynamic = "force-dynamic";
async function GET(request) {
    const denied = await (0, access_1.authorizeRead)(request, "radar:read");
    if (denied)
        return denied;
    return (0, envelope_1.apiResponse)((0, envelope_1.unavailable)({
        state: "degraded", lastSuccessfulUpdate: null,
    }, "Motor descriptivo integrado; fuentes de bolsa y validación histórica pendientes."), 503);
}
