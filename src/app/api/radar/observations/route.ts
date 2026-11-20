import { authorizeRead } from "../../../../shared/server/access";
import { apiResponse, unavailable } from "../../../../shared/server/envelope";
import { isHorizon } from "../../../../contracts/core";
import type { RadarObservation, RadarPage } from "../../../../contracts/radar";
import { collectObservations } from "../../../../modules/radar/service";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const denied = await authorizeRead(request, "radar:read");
  if (denied) return denied;
  const params = new URL(request.url).searchParams;
  const markets = params.getAll("assetClass"), horizons = params.getAll("horizon");
  if (markets.length !== 1 || horizons.length !== 1 || !["stocks", "crypto"].includes(markets[0]) || !isHorizon(horizons[0])) {
    return apiResponse(unavailable(null, "Indica una clase de activo y un horizonte válidos, sin duplicados."), 400);
  }
  try {
    const result = await collectObservations({ assetClass: markets[0] as "stocks" | "crypto", horizon: horizons[0], context: null });
    return apiResponse(result, 200);
  } catch {
    return apiResponse(unavailable<RadarPage<RadarObservation>>({ items: [], nextCursor: null }, "No se pudo obtener una observación verificable."), 503);
  }
}
