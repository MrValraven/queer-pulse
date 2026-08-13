import type {
  AdminGroupJoinRequestDTO,
  AdminGroupListingDTO,
} from "./api/adminHousingGroups.api";

/**
 * Demo fixtures for the admin housing-groups console. Deliberately empty: like
 * the co-op admin panel, the admin surfaces are admin-only endpoints that 403
 * for anyone else, so the honest demo state is an empty queue and an empty
 * listings table — which is exactly what a reviewer in demo mode should see.
 */
export const ADMIN_GROUP_JOIN_REQUESTS_DEMO: AdminGroupJoinRequestDTO[] = [];

export const ADMIN_GROUP_LISTINGS_DEMO: AdminGroupListingDTO[] = [];
