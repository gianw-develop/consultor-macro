"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safePostLoginPath = safePostLoginPath;
const navigation_1 = require("./navigation");
/** Only known private pages may be a post-login destination; never external URLs. */
function safePostLoginPath(value) {
    return typeof value === "string" && navigation_1.PRODUCT_AREAS.some(area => area.href === value) ? value : "/annienexus";
}
