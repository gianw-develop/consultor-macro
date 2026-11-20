"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionProvider = void 0;
exports.authorizeRead = authorizeRead;
const core_1 = require("../../contracts/core");
const envelope_1 = require("./envelope");
// Identity is verified with Supabase; only confirmed, explicitly allowed accounts enter.
exports.sessionProvider = { async resolve(request) {
        const { requestAuth, authorizedUser } = await Promise.resolve().then(() => __importStar(require("./supabase-request")));
        const auth = requestAuth(request);
        if (!auth)
            return { state: "unconfigured" };
        const user = await authorizedUser(auth);
        if (!user)
            return { state: "anonymous" };
        const { data, error } = await auth.client.auth.getClaims();
        if (error || !data?.claims?.exp)
            return { state: "anonymous" };
        return { state: "authenticated", userId: user.id, expiresAt: new Date(data.claims.exp * 1000).toISOString(), capabilities: ["annienexus:read", "radar:read"] };
    } };
async function authorizeRead(request, capability, provider = exports.sessionProvider, clock = core_1.systemClock) {
    let session;
    try {
        session = await provider.resolve(request);
    }
    catch {
        return (0, envelope_1.apiResponse)((0, envelope_1.unavailable)(null, "No se pudo verificar la sesión.", clock), 503);
    }
    if (session.state === "unconfigured") {
        return (0, envelope_1.apiResponse)((0, envelope_1.unavailable)(null, "Acceso pendiente de configuración.", clock), 503);
    }
    if (session.state === "anonymous") {
        return (0, envelope_1.apiResponse)((0, envelope_1.unavailable)(null, "Se requiere una sesión válida.", clock), 401);
    }
    const expiry = Date.parse(session.expiresAt);
    if (!session.userId || !Number.isFinite(expiry) || expiry <= clock().getTime()) {
        return (0, envelope_1.apiResponse)((0, envelope_1.unavailable)(null, "Se requiere una sesión válida.", clock), 401);
    }
    if (!session.capabilities.includes(capability)) {
        return (0, envelope_1.apiResponse)((0, envelope_1.unavailable)(null, "Acceso no autorizado para este módulo.", clock), 403);
    }
    return null;
}
