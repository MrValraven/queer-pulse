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
export function useCommunityReports(slug: string | undefined): ModReport[] {
  const { demoMode } = useDemoMode();
  const query = useQuery<ModReport[]>({
    queryKey: ["community-reports", slug],
    enabled: !demoMode && Boolean(slug),
    queryFn: async () =>
      (await getCommunityReports(slug!)).map(communityReportToModReport),
  });
  if (demoMode) return getLiving(slug)?.reports ?? [];
  return query.data ?? [];
}
