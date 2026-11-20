import { INDEX_IDS, type ApiEnvelope, type Clock, type Horizon } from "../../contracts/core";
import type { MarketContext } from "../../contracts/annienexus";
import { unavailable } from "../../shared/server/envelope";
export function getPendingContext(horizon: Horizon, clock?: Clock): ApiEnvelope<MarketContext> {
  return unavailable({
    horizon, contextVersion: null, asOf: null, modelVersion: null, dominantVariable: null, story: null, causalLinks: [],
    theses: INDEX_IDS.map((indexId) => ({
      indexId, direction: "not_evaluated", narrative: null, supports: [], contradictions: [],
      changeConditions: [], sources: [], asOf: null,
    })),
  }, "Fuentes y motor de tesis pendientes de conexión y validación.", clock);
}
