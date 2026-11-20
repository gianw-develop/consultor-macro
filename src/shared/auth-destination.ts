import { PRODUCT_AREAS } from "./navigation";
/** Only known private pages may be a post-login destination; never external URLs. */
export function safePostLoginPath(value: unknown): string {
  return typeof value === "string" && PRODUCT_AREAS.some(area => area.href === value) ? value : "/annienexus";
}
