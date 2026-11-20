import { systemClock, type ApiEnvelope, type Clock } from "../../contracts/core";
export function unavailable<T>(data: T, warning: string, clock: Clock = systemClock): ApiEnvelope<T> {
  return {
    schemaVersion: "0.2.0", status: "unavailable", generatedAt: clock().toISOString(),
    dataAsOf: null, sources: [], warnings: [warning], data,
  };
}
export function apiResponse<T>(body: ApiEnvelope<T>, status: number): Response {
  return Response.json(body, {
    status, headers: { "Cache-Control": "private, no-store", "Vary": "Cookie, Authorization" },
  });
}
