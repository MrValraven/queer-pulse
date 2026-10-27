import { apiGet } from "../../../shared/api/client";
import type { FeatureUsageRangeSelection } from "../featureUsageRange";

/**
 * Feature usage panel (`/admin/feature-usage`, admin-only). Mirrors the
 * backend's `src/feature-usage/feature-usage-response.ts` `AdminFeatureUsageDTO`
 * field for field. The panel renders this DTO directly, since the backend
 * already classifies and orders every row; the only frontend import here is
 * the range selection type that builds the query string.
 *
 * A range is either a preset `rangeDays` (the backend clamps it to between 1
 * and 365) or a custom inclusive `from`/`to` pair, and a request carries one of the two. The response
 * echoes the range it actually used, as inclusive `YYYY-MM-DD` days.
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
  /** Requests per day, oldest first, zero-filled; length `rangeDays`. */
  reachDaily: number[];
  /** Requests per day over the previous window, aligned with `reachDaily`
   *  by index; same length. */
  reachPreviousDaily: number[];
  state: FeatureUsageState;
}

export interface AdminFeatureUsageDTO {
  rangeDays: number;
  /** First included day, `YYYY-MM-DD`. */
  rangeStart: string;
  /** LAST included day (inclusive), `YYYY-MM-DD`. */
  rangeEnd: string;
  /** First day of the previous window (inclusive). */
  previousRangeStart: string;
  /** Last day of the previous window (inclusive), the day before `rangeStart`. */
  previousRangeEnd: string;
  /** Earliest day still kept; reach older than this has been deleted. */
  retentionStart: string;
  /** True when the previous window starts before `retentionStart`, so its
   *  oldest days read as zero. */
  isPreviousRangePartial: boolean;
  /** The launched-feature reach median the classifier used. */
  reachMedian: number;
  /**
   * False when the classifier had no usable reach signal for this range (the
   * "healthy reach" test is `reach >= reachMedian`, and a zero median makes
   * that true for every feature at once); this happens when freshly deployed,
   * or for a range that predates the usage table while depth is reconstructed
   * historically and non-zero. The backend refuses to classify anything
   * `browsed-but-empty` while this is false, so the page shows a notice and
   * a platform-wide reach outage never reads as a platform-wide "path is
   * broken" finding.
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

/** One feature's lazy detail (`GET /admin/feature-usage/:featureKey/detail`). */
export interface AdminFeatureUsageDetailDTO {
  featureKey: string;
  rangeDays: number;
  /** Inclusive. */
  rangeStart: string;
  /** Inclusive. */
  rangeEnd: string;
  /** Rows created per day, summed across the feature's depth entities;
   *  length `rangeDays`. `null` for a reach-only feature. */
  createdDaily: number[] | null;
}

/** `rangeDays=30` for a preset, `from=...&to=...` for a custom range. The two
 *  forms never mix: the backend answers a mix with a 400. */
export function featureUsageRangeQuery(
  selection: FeatureUsageRangeSelection,
): string {
  if (selection.kind === "custom") {
    return `from=${encodeURIComponent(selection.from)}&to=${encodeURIComponent(selection.to)}`;
  }
  return `rangeDays=${selection.rangeDays}`;
}

/** Reach and depth per product feature. Admin-only; returns 403 for other users. */
export const getAdminFeatureUsage = (selection: FeatureUsageRangeSelection) =>
  apiGet<AdminFeatureUsageDTO>(
    `/admin/feature-usage?${featureUsageRangeQuery(selection)}`,
  );

/** Created per day for one feature, fetched when its row expands. */
export const getAdminFeatureUsageDetail = (
  featureKey: string,
  selection: FeatureUsageRangeSelection,
) =>
  apiGet<AdminFeatureUsageDetailDTO>(
    `/admin/feature-usage/${encodeURIComponent(featureKey)}/detail?${featureUsageRangeQuery(selection)}`,
  );
