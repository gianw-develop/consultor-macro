"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMacroSnapshot = loadMacroSnapshot;
require("server-only");
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
async function loadMacroSnapshot() {
    try {
        const snapshot = JSON.parse(await (0, promises_1.readFile)(node_path_1.default.join(process.cwd(), "data/macro/latest.json"), "utf8"));
        if (snapshot.version !== 1 || !Number.isFinite(Date.parse(snapshot.capturedAt)))
            return null;
        return snapshot;
    }
    catch {
        return null;
    }
}
