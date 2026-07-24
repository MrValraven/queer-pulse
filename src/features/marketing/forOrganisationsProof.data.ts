import { PARTNERS } from "./partnerDetails";
import type { Partner } from "./partnerDetails.types";

// Demo fallback for the For Organisations proof rail: the featured partners
// from the demo registry (derived, so it never diverges from the detail pages
// those cards link to). Illustrative only — no real organisation, person, or
// audited figure (see the honesty constraint).
export const FEATURED_PARTNERS_DEMO: Partner[] = PARTNERS.filter(
  (partner) => partner.featured,
);
