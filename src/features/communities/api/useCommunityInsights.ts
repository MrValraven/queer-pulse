import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getLiving } from "../livingCommunities.data";
import {
  INSIGHTS_TREND_WEEKS,
  getCommunityInsightsWithTrend,
  type CommunityInsightsTrendDTO,
  type CommunityTrendPointDTO,
} from "./communityInsightsTrend.api";

export interface CommunityInsightsResult {
  data: CommunityInsightsTrendDTO | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const NOOP = () => {};
const MILLISECONDS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/** The Monday (UTC) of each of the last `weekCount` ISO weeks, oldest first,
 *  as the plain `YYYY-MM-DD` dates the live endpoint answers with. */
function recentWeekStarts(weekCount: number): string[] {
  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const daysSinceMonday = (new Date(todayUtc).getUTCDay() + 6) % 7;
  const thisMonday = todayUtc - daysSinceMonday * 24 * 60 * 60 * 1000;
  return Array.from({ length: weekCount }, (_, index) =>
    new Date(thisMonday - (weekCount - 1 - index) * MILLISECONDS_PER_WEEK)
      .toISOString()
      .slice(0, 10),
  );
}

/**
 * A stable 12-week shape for the demo mock, seeded off the slug so it does not
 * reshuffle on every render. Anchored on the weekly number the flagship mock
 * already carries (`living.stats`) rather than an invented one, and kept
 * aggregate: a weekly volume, never a named member.
 */
function demoSeries(
  slug: string,
  weeklyAverage: number,
): CommunityTrendPointDTO[] {
  let seed = 0;
  for (let index = 0; index < slug.length; index++) {
    seed = (seed * 31 + slug.charCodeAt(index)) >>> 0;
  }
  const floor = Math.max(0, weeklyAverage - Math.round(weeklyAverage * 0.4));
  return recentWeekStarts(INSIGHTS_TREND_WEEKS).map((weekStart, index) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const jitter = (seed % 5) - 2;
    const climb = Math.round(
      (index / (INSIGHTS_TREND_WEEKS - 1)) * weeklyAverage * 0.6,
    );
    return { weekStart, count: Math.max(0, floor + climb + jitter) };
  });
}

/**
 * Demo derivation, composed entirely from fields the flagship mock community
 * already carries. `living.moments`' `"joined"` entries stand in for a growth
 * trend (a real signal already in the mock), `living.stats` already tracks
 * weekly activity, and the two 12-week series are shaped from those same
 * weekly numbers. A non-flagship demo community (no `living` entry) has
 * nothing to derive from, so every count is 0 and both series are flat, the
 * same "nothing to show yet" outcome a brand-new live community would have.
 */
function demoInsights(slug: string | undefined): CommunityInsightsTrendDTO {
  const living = getLiving(slug);
  if (!living) {
    const flat = recentWeekStarts(INSIGHTS_TREND_WEEKS).map((weekStart) => ({
      weekStart,
      count: 0,
    }));
    return {
      memberCount: 0,
      newMembersThisWeek: 0,
      newMembersThisMonth: 0,
      postCount: 0,
      postsThisWeek: 0,
      activeMemberCount7d: 0,
      newMembersByWeek: flat,
      postsByWeek: flat,
    };
  }
  const newlyJoined = living.moments.filter((m) => m.kind === "joined").length;
  return {
    memberCount: living.stats.members,
    newMembersThisWeek: newlyJoined,
    newMembersThisMonth: newlyJoined,
    postCount: living.pinned.length + living.pulse.length,
    postsThisWeek: living.stats.postsThisWeek,
    activeMemberCount7d: living.stats.activeThisWeek,
    newMembersByWeek: demoSeries(`${slug ?? ""}-members`, newlyJoined),
    postsByWeek: demoSeries(`${slug ?? ""}-posts`, living.stats.postsThisWeek),
  };
}

/**
 * A community's owner/mod-only aggregate stats (`GET
 * /communities/:slug/insights`) — member growth + post-volume counts and the
 * two 12-week trend series behind them. This platform's carved-out
 * "leadership looking at their own community's shape" exception to the
 * no-user-behavior-analytics house rule: every field here is a volume, and
 * none of them can be traced back to an individual member.
 *
 * Meant to be called only from a mount point already gated to owner/co-owner/
 * mod (e.g. `ModToolsTab`) rather than gated inside the hook itself — mirrors
 * `useJoinRequests`/`useCommunityReports`'s "gate by where it's mounted".
 */
export function useCommunityInsights(
  slug: string | undefined,
): CommunityInsightsResult {
  const { demoMode } = useDemoMode();
  const query = useQuery<CommunityInsightsTrendDTO>({
    queryKey: ["community-insights", slug],
    enabled: !demoMode && Boolean(slug),
    queryFn: () => getCommunityInsightsWithTrend(slug!),
  });

  if (demoMode) {
    return {
      data: demoInsights(slug),
      isLoading: false,
      isError: false,
      refetch: NOOP,
    };
  }
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
