import reviewData from "./regime-clock-review.json";
import { activityEvidenceKey, type ReadingInput } from "./economic-reading";
import { ECONOMIC_EVENTS } from "./economic-calendar";
import type { QuadrantZone } from "./quadrant-data";

export type ClockEvidence = { name: string; period: string; comparison: string; reading: string; publishedAt: string | null; checkedAt: string; url: string };
export type ClockReview = {
  reviewedAt: string; cut: string; reviewBy: string; zone: Exclude<QuadrantZone,"transition">;
  evidenceKey: string; title: string; growth: string; inflation: string;
  evidence: ClockEvidence[]; contradictions: string[]; changes: string[]; rationale: string;
};
export type ClockReading = {
  status: "provisional" | "historical" | "unavailable";
  angle: number | null; zone: ClockReview["zone"] | null;
  label: string; explanation: string; review: ClockReview | null;
};
// Angles name a sector. They do not measure the relative magnitudes of unlike series.
export const SECTOR_ANGLES = {growth_prices_up:45,growth_down_prices_up:-45,growth_prices_easing:-135,growth_up_prices_easing:135} as const;
export function clockEvidenceKey(input:ReadingInput):string {
  return JSON.stringify({economic:activityEvidenceKey(input),weekly:ECONOMIC_EVENTS.filter(e=>e.result).map(e=>({id:e.id,period:e.period,result:e.result}))});
}
export function evaluateRegimeClock(input:ReadingInput|null,now:string,review:ClockReview|null=reviewData as ClockReview):ClockReading {
  const time=Date.parse(now),cut=Date.parse(review?.cut??""),reviewed=Date.parse(review?.reviewedAt??""),due=Date.parse(review?.reviewBy??"");
  if(!review || !Number.isFinite(time) || !Number.isFinite(cut) || !Number.isFinite(reviewed) || !Number.isFinite(due) || reviewed<cut || due<=reviewed || time<reviewed || !Object.hasOwn(SECTOR_ANGLES,review.zone) || !review.evidenceKey || !review.growth || !review.inflation || !review.rationale || review.contradictions.length===0 || review.evidence.length===0 || review.evidence.some(e=>!e.name || !e.period || !e.comparison || !/^https:\/\//.test(e.url) || !Number.isFinite(Date.parse(e.checkedAt)) || Date.parse(e.checkedAt)>reviewed || (e.publishedAt!==null&&(!Number.isFinite(Date.parse(e.publishedAt))||Date.parse(e.publishedAt)>Date.parse(e.checkedAt))))) {
    return {status:"unavailable",angle:null,zone:null,label:"Revisión no disponible",explanation:"Falta una revisión fechada y verificable de ambos ejes.",review:null};
  }
  const matches=!!input && clockEvidenceKey(input)===review.evidenceKey;
  const current=matches&&time<due;
  return {status:current?"provisional":"historical",angle:SECTOR_ANGLES[review.zone],zone:review.zone,review,
    label:current?"Orientación provisional":"Última orientación fechada",
    explanation:current?"Mercado mixto. La manecilla resume las ventanas indicadas; otras señales discrepan. No confirma un régimen completo.":!matches?"Los insumos cambiaron o faltan. Se conserva la última orientación revisada; no representa una lectura actual.":"Llegó la siguiente revisión prevista. Se conserva la última orientación fechada hasta contrastar las nuevas publicaciones."};
}
