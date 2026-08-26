import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getCommunityBans,
  liftCommunityBan,
  updateCommunityBan,
  type CommunityBanDTO,
  type CommunityRuleOptionDTO,
  type UpdateCommunityBanInput,
} from "./communityBans.api";

export interface CommunityBansResult {
  bans: CommunityBanDTO[];
  /**
   * The community's house rules as they read right now, served alongside the
   * ban list so the citation picker needs no second request and no community
   * detail prop drilled through the mod-tools shell.
   */
  rules: CommunityRuleOptionDTO[];
  rulesVersion: number;
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
    return {
      bans: [],
      rules: [],
      rulesVersion: 1,
      isLoading: false,
      isError: false,
      refetch: () => {},
    };
  }
  return {
    bans: query.data?.bans ?? [],
    rules: query.data?.rules ?? [],
    rulesVersion: query.data?.rulesVersion ?? 1,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * `PATCH /communities/:slug/bans/:memberSlug` — revise a ban already in place.
 *
 * This is the route out of a life ban. Every community ban written before
 * timed bans existed is permanent, and this is what turns one of them into
 * something a member can serve out, or attaches the house rule it rests on to
 * a decision that until now carried free text at best.
 *
 * Only the ban list is invalidated: revising terms changes nothing about the
 * roster or the community itself.
 */
export function useUpdateCommunityBan(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { memberSlug: string; input: UpdateCommunityBanInput }
  >({
    // The panel toasts its own failure, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ memberSlug, input }) => {
      if (demoMode) return;
      await updateCommunityBan(slug, memberSlug, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["community-bans", slug],
      });
    },
  });
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
