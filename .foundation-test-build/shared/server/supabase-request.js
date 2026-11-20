"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestAuth = requestAuth;
exports.authorizedUser = authorizedUser;
const ssr_1 = require("@supabase/ssr");
const server_1 = require("next/server");
const auth_config_1 = require("./auth-config");
function requestAuth(request) {
    const config = (0, auth_config_1.authConfiguration)();
    if (!config)
        return null;
    const input = request instanceof server_1.NextRequest ? request : new server_1.NextRequest(request.url, { headers: request.headers });
    const changes = new Map();
    const client = (0, ssr_1.createServerClient)(config.url, config.key, {
        cookieOptions: { httpOnly: true, secure: new URL((0, auth_config_1.applicationOrigin)(request)).protocol === "https:", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 },
        cookies: {
            getAll() { return input.cookies.getAll(); },
            setAll(cookies) { for (const cookie of cookies) {
                input.cookies.set(cookie.name, cookie.value);
                changes.set(cookie.name, cookie);
            } },
        },
    });
    return { client, input,
        apply(response) {
            for (const { name, value, options } of changes.values())
                response.cookies.set(name, value, options);
            response.headers.set("Cache-Control", "private, no-store, max-age=0");
            response.headers.set("Pragma", "no-cache");
            return response;
        },
        async user() {
            const { data, error } = await client.auth.getUser();
            if (error || !data.user)
                return null;
            return data.user;
        }, };
}
async function authorizedUser(auth) {
    const user = await auth.user();
    return user?.email_confirmed_at && (0, auth_config_1.emailAllowed)(user.email) ? user : null;
}
