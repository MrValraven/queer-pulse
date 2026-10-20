// ── Backend DTOs ────────────────────────────────────────────────────────────
// Shapes the NestJS `early-access` domain returns for the admin surface:
// `/admin/members/:id/early-access` (the member drawer section) and
// `/admin/early-access` (the roster page). Field names mirror the backend's
// `early-access/early-access-response.ts` and section 1 of
// QUEERPULSE-EARLY-ACCESS-PLAN-2026-10-20.md verbatim. `featureKey` stays a
// plain string on the wire; narrow it with `isEarlyAccessFeatureKey` from
// `shared/contracts/earlyAccess`.

/** The staff member who turned a grant on; null once that account is gone. */
export interface EarlyAccessGrantedByDTO {
  id: string;
  displayName: string;
}

/** One member's grant for one feature. `PUT .../early-access/:feature`. */
export interface EarlyAccessGrantDTO {
  featureKey: string;
  userId: string;
  grantedAt: string;
  grantedBy: EarlyAccessGrantedByDTO | null;
}

/** `GET /admin/members/:id/early-access`: one entry per feature currently in
 *  early access, in registry order, with the member's grant or null. */
export interface MemberEarlyAccessDTO {
  features: { featureKey: string; grant: EarlyAccessGrantDTO | null }[];
}

/** `GET /admin/early-access`: every feature in early access with its grant count. */
export interface EarlyAccessFeaturesDTO {
  features: { featureKey: string; grantCount: number }[];
}

/** One roster row: the member (avatar already visibility-filtered) and the grant. */
export interface EarlyAccessRosterRowDTO {
  member: {
    userId: string;
    slug: string | null;
    displayName: string;
    avatarUrl: string | null;
  };
  grantedAt: string;
  grantedBy: EarlyAccessGrantedByDTO | null;
}

/** `GET /admin/early-access/:feature`: newest first, at most `limit` rows of `total`. */
export interface EarlyAccessRosterDTO {
  featureKey: string;
  total: number;
  limit: number;
  items: EarlyAccessRosterRowDTO[];
}
