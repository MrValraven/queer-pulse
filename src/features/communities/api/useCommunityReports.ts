import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getCommunityReports } from "./communities.api";
import { communityReportToModReport } from "./communities.adapters";
import { getLiving } from "../livingCommunities.data";
import type { ModReport } from "../community.model";

/**
 * Open reports on this community's own posts/replies, for the mod-tools
 * "Reported posts" queue. Demo returns the flagship's mock reports
 * synchronously (unchanged); live calls GET /communities/:slug/reports
 * (owner/mod-only) and adapts each row to a `ModReport` — mirrors
 * `useJoinRequests`.
 */
export interface CommunityReportsResult {
  items: ModReport[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * The failure signal is part of the result for the same reason it is on
 * `useJoinRequests`: a 403 or a network error used to render as "Nothing
 * reported", which reads to a moderator as an empty queue rather than as a
 * queue that never loaded.
 */
export function useCommunityReports(
  slug: string | undefined,
): CommunityReportsResult {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["community-reports", slug],
    enabled: !demoMode && Boolean(slug),
    queryFn: () => getCommunityReports(slug!),
  });
  const refetch = () => void query.refetch();
  if (demoMode) {
    return {
      items: getLiving(slug)?.reports ?? [],
      isLoading: false,
      isError: false,
      refetch: () => {},
    };
  }
  return {
    items: (query.data ?? []).map(communityReportToModReport),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch,
  };
}
