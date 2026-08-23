import { apiGet } from "../../../shared/api/client";
import type { CommunityInsightsDTO } from "./communities.api";

/**
 * How many weekly buckets the two insight trend series carry. Mirrors the
 * backend's own `INSIGHTS_TREND_WEEKS`, which always answers with exactly this
 * many points (a week with nothing in it is a zero), so the sparklines can plot
 * the series straight through without reasoning about gaps.
 */
export const INSIGHTS_TREND_WEEKS = 12;

/**
 * One weekly bucket. `weekStart` is that ISO week's Monday as a plain
 * `YYYY-MM-DD` UTC date, and `count` is a volume. Deliberately aggregate: the
 * series says how many members joined or how many posts landed in a week and
 * carries nothing about WHICH member did what, which is the line this
 * platform's no-user-behaviour-analytics rule draws.
 */
export interface CommunityTrendPointDTO {
  weekStart: string;
  count: number;
}

/**
 * `GET /communities/:slug/insights` as it answers today: the six flat counts
 * `CommunityInsightsDTO` already types, plus the two 12-week series the
 * backend added for the growth trend.
 *
 * Typed and fetched here rather than in `communities.api.ts` so this feature
 * owns its own contract; the flat-count half is imported rather than
 * re-declared so the two can never drift.
 */
export interface CommunityInsightsTrendDTO extends CommunityInsightsDTO {
  newMembersByWeek: CommunityTrendPointDTO[];
  postsByWeek: CommunityTrendPointDTO[];
}

export const getCommunityInsightsWithTrend = (slug: string) =>
  apiGet<CommunityInsightsTrendDTO>(`/communities/${slug}/insights`);
