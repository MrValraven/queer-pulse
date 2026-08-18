import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getLiving } from "../livingCommunities.data";
import { getCommunityInsights, type CommunityInsightsDTO } from "./communities.api";

export interface CommunityInsightsResult {
  data: CommunityInsightsDTO | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const NOOP = () => {};

/**
 * Demo derivation, composed entirely from fields the flagship mock community
 * already carries — no new mock data authored for this. `living.moments`'
 * `"joined"` entries stand in for a growth trend (a real signal already in the
 * mock, not a fabricated number); `living.stats` already tracks weekly
 * activity. A non-flagship demo community (no `living` entry) has nothing to
 * derive from, so every count is 0 — same "nothing to show yet" outcome a
 * brand-new live community would have.
 */
function demoInsights(slug: string | undefined): CommunityInsightsDTO {
  const living = getLiving(slug);
  if (!living) {
    return {
      memberCount: 0,
      newMembersThisWeek: 0,
      newMembersThisMonth: 0,
      postCount: 0,
      postsThisWeek: 0,
      activeMemberCount7d: 0,
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
  };
}

/**
 * A community's owner/mod-only aggregate stats (`GET
 * /communities/:slug/insights`) — member growth + post-volume counts, this
 * platform's carved-out "leadership looking at their own community's shape"
 * exception to the no-user-behavior-analytics house rule (see
 * `CommunityInsightsResponse`'s own doc comment).
 *
 * Meant to be called only from a mount point already gated to owner/mod (e.g.
 * `ModToolsTab`, which only renders for `isMod`) rather than gated inside the
 * hook itself — mirrors `useJoinRequests`/`useCommunityReports`'s "gate by
 * where it's mounted".
 */
export function useCommunityInsights(
  slug: string | undefined,
): CommunityInsightsResult {
  const { demoMode } = useDemoMode();
  const query = useQuery<CommunityInsightsDTO>({
    queryKey: ["community-insights", slug],
    enabled: !demoMode && Boolean(slug),
    queryFn: () => getCommunityInsights(slug!),
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
