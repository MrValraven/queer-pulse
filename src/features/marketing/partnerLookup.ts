import { PARTNERS } from "./partnerDetails.data";
import type { Partner } from "./partnerDetails.types";

/** Find a partner by slug. Split out of partnerDetails.tsx so that barrel file
 * only re-exports types + data (react-refresh/only-export-components). */
export function getPartner(slug: string | undefined): Partner | undefined {
  return PARTNERS.find((p) => p.slug === slug);
}
