import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/auth";
import {
  SUPPORTED_SYMBOLS,
  SYMBOL_TO_PAIR,
  calculateLiquidationLevels,
  clampLevels,
  getLeverageGrid,
  DEFAULT_LEVELS,
  type SupportedSymbol,
} from "@/lib/liquidation-clusters";

export const dynamic = "force-dynamic";

const VALID_INTERVALS = ["5m", "15m", "1h", "4h"] as const;
type ValidInterval = (typeof VALID_INTERVALS)[number];

function isSupportedSymbol(value: string): value is SupportedSymbol {
  return (SUPPORTED_SYMBOLS as readonly string[]).includes(value);
}

function isValidInterval(value: string): value is ValidInterval {
  return (VALID_INTERVALS as readonly string[]).includes(value);
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!validateSessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const symbolParam = (searchParams.get("symbol") ?? "BTC").toUpperCase();
  const levelsParam = searchParams.get("levels");
  const intervalParam = searchParams.get("interval") ?? "15m";

  if (!isSupportedSymbol(symbolParam)) {
    return NextResponse.json(
      { error: `Simbolo no soportado. Usa uno de: ${SUPPORTED_SYMBOLS.join(", ")}` },
      { status: 400 },
    );
  }

  if (!isValidInterval(intervalParam)) {
    return NextResponse.json(
      { error: `Intervalo no soportado. Usa uno de: ${VALID_INTERVALS.join(", ")}` },
      { status: 400 },
    );
  }

  const levels = levelsParam ? clampLevels(Number(levelsParam)) : DEFAULT_LEVELS;

  const leveragesParam = searchParams.get("leverages");
  let filteredLeverages: number[] | undefined;

  if (leveragesParam) {
    const pairSymbol = SYMBOL_TO_PAIR[symbolParam as SupportedSymbol];
    const validGrid = getLeverageGrid(pairSymbol);
    const parsed = leveragesParam
      .split(",")
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0);
    filteredLeverages = parsed.filter((l) => validGrid.includes(l));

    if (filteredLeverages.length === 0) {
      return NextResponse.json(
        {
          error: `Ninguno de los leverages indicados es valido para este simbolo. Grid disponible: ${validGrid.join(", ")}`,
        },
        { status: 400 },
      );
    }
  }

  const data = await calculateLiquidationLevels(symbolParam, levels, intervalParam, filteredLeverages);

  if ("error" in data) {
    return NextResponse.json(data, { status: 502 });
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
