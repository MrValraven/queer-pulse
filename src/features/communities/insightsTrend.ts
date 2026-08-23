import type { CommunityTrendPointDTO } from "./api/communityInsightsTrend.api";

/**
 * Which way a 12-week series is going, in the four shapes a moderator can act
 * on. `quiet` is its own answer rather than a flavour of `steady`: a flat line
 * at zero and a flat line at nine a week are very different rooms.
 */
export type TrendDirection = "rising" | "steady" | "falling" | "quiet";

export interface TrendSummary {
  direction: TrendDirection;
  /** Total over the most recent half of the series. */
  recentTotal: number;
  /** Total over the half before it, the comparison the direction rests on. */
  previousTotal: number;
  /** Every bucket's count, oldest first, for plotting. */
  values: number[];
}

/**
 * A change of less than this share either way reads as the same volume week to
 * week, so it is reported as steady. Two aggregate halves of a small community
 * wobble by one or two either way for no reason worth naming.
 */
const STEADY_BAND = 0.15;

/**
 * Compare the most recent half of the series against the half before it.
 *
 * Halves rather than first-point-to-last-point: a single quiet week at the end
 * (or one busy one) would otherwise flip the whole verdict, and the current
 * week is always partial. Aggregate totals throughout, in keeping with what
 * this endpoint is allowed to know.
 */
export function summarizeTrend(
  points: CommunityTrendPointDTO[] | undefined,
): TrendSummary {
  const values = (points ?? []).map((point) => point.count);
  const midpoint = Math.floor(values.length / 2);
  const previousTotal = sum(values.slice(0, midpoint));
  const recentTotal = sum(values.slice(midpoint));
  const summary = { recentTotal, previousTotal, values };

  if (recentTotal === 0 && previousTotal === 0) {
    return { ...summary, direction: "quiet" };
  }
  if (previousTotal === 0) return { ...summary, direction: "rising" };
  const change = (recentTotal - previousTotal) / previousTotal;
  if (change > STEADY_BAND) return { ...summary, direction: "rising" };
  if (change < -STEADY_BAND) return { ...summary, direction: "falling" };
  return { ...summary, direction: "steady" };
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
