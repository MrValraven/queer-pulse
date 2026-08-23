import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getCommunityBans,
  liftCommunityBan,
  type CommunityBanDTO,
} from "./communityBans.api";

export interface CommunityBansResult {
  bans: CommunityBanDTO[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Who is currently barred from this community (`GET /communities/:slug/bans`,
 * owner/co-owner/moderator only), newest ban first.
 *
 * The demo mock carries no ban rows, so demo mode answers with an empty list
 * without touching the network. That renders the panel's real empty state,
 * which is the honest demo outcome rather than an invented barred member.
 *
 * Gated by where it is mounted (`ModToolsBans`, inside the already staff-only
 * Mod tools tab), the same way `useCommunityReports` and `useJoinRequests` are.
 */
export function useCommunityBans(
  slug: string | undefined,
): CommunityBansResult {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["community-bans", slug],
    enabled: !demoMode && Boolean(slug),
    queryFn: () => getCommunityBans(slug!),
  });

  if (demoMode) {
    return { bans: [], isLoading: false, isError: false, refetch: () => {} };
  }
  return {
    bans: query.data?.bans ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * `DELETE /communities/:slug/bans/:memberSlug` — lift a ban. Reversing a
 * moderation decision, so the caller confirms first.
 *
 * Only the ban list is invalidated: lifting reopens the door and does not put
 * the member back on the roster, so neither the roster nor the community
 * detail changes as a result.
 */
export function useLiftCommunityBan(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { memberSlug: string }>({
    // The panel toasts its own failure, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ memberSlug }) => {
      if (demoMode) return;
      await liftCommunityBan(slug, memberSlug);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["community-bans", slug],
      });
    },
  });
}
