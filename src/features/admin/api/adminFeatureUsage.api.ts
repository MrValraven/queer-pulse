import { apiGet } from "../../../shared/api/client";

/**
 * Feature usage panel (`/admin/feature-usage`, admin-only). Mirrors the
 * backend's `src/feature-usage/feature-usage-response.ts` `AdminFeatureUsageDTO`
 * field for field. Kept self-contained (no cross-import of the frontend
 * view-model types) like `adminOverview.api.ts`; a later adapter would
 * reconcile the wire shape with any presentation view model, but the panel
 * today renders this DTO directly since the backend already classifies and
 * orders every row.
 *
 * The backend clamps the requested `rangeDays` to between 1 and 365; the
 * response's own `rangeDays` echoes back whatever value it actually used.
 *
 * `feed`, `cinema`, and `content` are the three reach-only features: they
 * have no member-authored rows to count, so their `depth`/`depthTotal` are
 * always `null` and `reason` explains why. Every other feature carries
 * `reason: null`. A `null` here must never be coerced into `0` because that
 * would make "nothing to count" read as "counted, and it was zero", the exact
 * misreading this panel exists to prevent.
 */
export type FeatureUsageState =
  "busy" | "browsed-but-empty" | "quiet" | "not-launched";

export interface ClassifiedFeature {
  featureKey: string;
  isLaunched: boolean;
  /** Requests over the selected range. */
  reach: number;
  /** Rows created over the selected range. `null` for a reach-only feature. */
  depth: number | null;
  /** Rows in existence at the end of the range. `null` for a reach-only feature. */
  depthTotal: number | null;
  /** Reach over the preceding range of equal length, for direction. */
  reachPrevious: number;
  /** Why a reach-only feature has no depth to show. `null` for every other feature. */
  reason?: string | null;
  state: FeatureUsageState;
}

export interface AdminFeatureUsageDTO {
  rangeDays: number;
  /**
   * False when the classifier had no usable reach signal for this range (the
   * "healthy reach" test is `reach >= reachMedian`, and a zero median makes
   * that true for every feature at once); this happens when freshly deployed,
   * or for a range that predates the usage table while depth is reconstructed
   * historically and non-zero. The backend refuses to classify anything
   * `browsed-but-empty` while this is false, so the page must show a notice
   * rather than let a platform-wide reach outage read as a platform-wide
   * "path is broken" finding.
   */
  hasReachSignal: boolean;
  /** Ordered so the states that most need a human decision come first. */
  features: ClassifiedFeature[];
  /**
   * Every count below is scoped to the same range `depth` uses, with one
   * exception: `communities.stillPostingThisWeek`.
   */
  drillDowns: {
    housingListings: {
      listings: number;
      savedSearches: number;
      viewings: number;
    };
    forum: { threads: number; replies: number };
    communities: {
      created: number;
      /**
       * Communities active in the last 7 days. This is a ROLLING window
       * measured from whenever the backend's activity-counter job last ran,
       * independent of the selected range and of `rangeDays`.
       */
      stillPostingThisWeek: number;
    };
  };
}

/** Reach and depth per product feature, over `rangeDays`. Admin-only; returns 403 for other users. */
export const getAdminFeatureUsage = (rangeDays: number) =>
  apiGet<AdminFeatureUsageDTO>(`/admin/feature-usage?rangeDays=${rangeDays}`);
