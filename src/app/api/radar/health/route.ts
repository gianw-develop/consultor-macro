import { authorizeRead } from "../../../../shared/server/access";
import { apiResponse, unavailable } from "../../../../shared/server/envelope";
import type { RadarHealth } from "../../../../contracts/radar";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const denied = await authorizeRead(request, "radar:read");
  if (denied) return denied;
  return apiResponse(unavailable<RadarHealth>({
    state: "degraded", lastSuccessfulUpdate: null,
  }, "Motor descriptivo integrado; fuentes de bolsa y validación histórica pendientes."), 503);
}
