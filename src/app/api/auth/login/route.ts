import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionCookieOptions,
  getConfiguredPassword,
  getSessionToken,
} from "@/lib/auth";

type LoginPayload = {
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LoginPayload | null;
  const password = body?.password?.trim();

  if (!password || password !== getConfiguredPassword()) {
    return NextResponse.json(
      { error: "Password incorrecto" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE,
    getSessionToken(),
    createSessionCookieOptions(),
  );

  return response;
}