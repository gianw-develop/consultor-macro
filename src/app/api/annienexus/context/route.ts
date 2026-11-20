import { isHorizon } from "../../../../contracts/core";
import { getPendingContext } from "../../../../modules/annienexus/context";
import { authorizeRead } from "../../../../shared/server/access";
import { apiResponse, unavailable } from "../../../../shared/server/envelope";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const denied = await authorizeRead(request, "annienexus:read");
  if (denied) return denied;
  const values = new URL(request.url).searchParams.getAll("horizon");
  if (values.length !== 1 || !isHorizon(values[0])) {
    return apiResponse(unavailable(null, "Indica un único horizonte válido."), 400);
  }
  return apiResponse(getPendingContext(values[0]), 503);
}
