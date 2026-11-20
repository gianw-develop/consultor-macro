"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unavailable = unavailable;
exports.apiResponse = apiResponse;
const core_1 = require("../../contracts/core");
function unavailable(data, warning, clock = core_1.systemClock) {
    return {
        schemaVersion: "0.2.0", status: "unavailable", generatedAt: clock().toISOString(),
        dataAsOf: null, sources: [], warnings: [warning], data,
    };
}
function apiResponse(body, status) {
    return Response.json(body, {
        status, headers: { "Cache-Control": "private, no-store", "Vary": "Cookie, Authorization" },
    });
}
