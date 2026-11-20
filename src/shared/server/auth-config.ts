export function authConfiguration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const emails = (process.env.ANNIENEXUS_ALLOWED_EMAILS ?? "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!url || !key || !emails.length) return null;
  return { url, key, emails };
}
export function localPreview() { return process.env.ANNIENEXUS_LOCAL_PREVIEW === "1" && !process.env.VERCEL; }
export function emailAllowed(email: string | undefined) { return !!email && !!authConfiguration()?.emails.includes(email.toLowerCase()); }
export function applicationOrigin(request: Request) {
  if (process.env.VERCEL) return "https://consultormacro.com";
  const url=new URL(request.url),host=request.headers.get("host");
  if (host && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host) && ["localhost","127.0.0.1","[::1]"].includes(url.hostname)) url.host=host;
  return url.origin;
}
export function sameOrigin(request: Request) { return request.headers.get("origin") === applicationOrigin(request); }
