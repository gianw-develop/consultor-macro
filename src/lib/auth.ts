import { createHash, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "consultor-macro-session";

export function getConfiguredPassword() {
  return process.env.SITE_PASSWORD?.trim() || "macro2026";
}

export function getSessionToken() {
  return createHash("sha256")
    .update(`consultor-macro:${getConfiguredPassword()}`)
    .digest("hex");
}

export function validateSessionToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  const expected = Buffer.from(getSessionToken());
  const received = Buffer.from(token);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export function createSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function createExpiredSessionCookieOptions() {
  return {
    ...createSessionCookieOptions(),
    maxAge: 0,
  };
}