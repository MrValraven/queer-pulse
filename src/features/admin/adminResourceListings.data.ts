import type { AdminResourceListingDTO } from "./api/adminResourceListings.api";

/**
 * Admin resource-listings demo fixture. Deliberately empty: CNT-14 rules out
 * fabricating fake listings as harmful for crisis-adjacent content, so the
 * admin panel's demo mode shows the honest "nothing to manage yet" empty
 * state rather than pretend Legal Aid / Sexual Health Testing organisations
 * (mirrors `adminOrgTiers.data.ts`).
 */
export const ADMIN_RESOURCE_LISTINGS_DEMO: AdminResourceListingDTO[] = [];
