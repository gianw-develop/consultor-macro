import { authorizeRead } from "./access";
import { apiResponse, unavailable } from "./envelope";
import type { RadarPage } from "../../contracts/radar";
export async function pendingRadarPage(request: Request) {
  const denied = await authorizeRead(request, "radar:read");
  if (denied) return denied;
  const classes = new URL(request.url).searchParams.getAll("assetClass");
  if (classes.length !== 1 || !["stocks", "crypto"].includes(classes[0])) {
    return apiResponse(unavailable(null, "Indica una única clase: stocks o crypto."), 400);
  }
  return apiResponse(unavailable<RadarPage>({ items: [], nextCursor: null }, "Radar pendiente de integración."), 503);
}
