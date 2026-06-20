import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/auth";
import { getMacroRegimeRadarData } from "@/lib/market";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!validateSessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getMacroRegimeRadarData();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
