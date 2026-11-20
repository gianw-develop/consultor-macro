"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authConfiguration = authConfiguration;
exports.localPreview = localPreview;
exports.emailAllowed = emailAllowed;
exports.applicationOrigin = applicationOrigin;
exports.sameOrigin = sameOrigin;
function authConfiguration() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const emails = (process.env.ANNIENEXUS_ALLOWED_EMAILS ?? "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    if (!url || !key || !emails.length)
        return null;
    return { url, key, emails };
}
function localPreview() { return process.env.ANNIENEXUS_LOCAL_PREVIEW === "1" && !process.env.VERCEL; }
function emailAllowed(email) { return !!email && !!authConfiguration()?.emails.includes(email.toLowerCase()); }
function applicationOrigin(request) {
    if (process.env.VERCEL)
        return "https://consultormacro.com";
    const url = new URL(request.url), host = request.headers.get("host");
    if (host && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host) && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
        url.host = host;
    return url.origin;
}
function sameOrigin(request) { return request.headers.get("origin") === applicationOrigin(request); }
