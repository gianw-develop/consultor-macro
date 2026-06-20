import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/auth";
import { analyzeTenXTickerManually } from "@/lib/market";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!validateSessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { ticker?: unknown } | null;
  const ticker = typeof body?.ticker === "string" ? body.ticker.trim() : "";

  if (!ticker || ticker.length > 16) {
    return NextResponse.json({ error: "Ticker invalido" }, { status: 400 });
  }

  try {
    const result = await analyzeTenXTickerManually(ticker);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo analizar el ticker",
      },
      { status: 404 },
    );
  }
}
