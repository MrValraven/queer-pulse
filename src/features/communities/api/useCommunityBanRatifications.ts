import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  decideCommunityBanRatification,
  getCommunityBanRatifications,
  type CommunityBanRatificationDTO,
  type CommunityBanRatificationListDTO,
  type CommunityBanRatificationStatus,
  type DecideCommunityBanRatificationInput,
} from "./communityBanRatifications.api";

/**
 * Every cached page of one community's ratification queue, for anything that
 * opens or closes a hold to invalidate. Slug ahead of `demoMode` so this stays
 * a usable prefix, the same ordering the governance trail uses.
 */
export function communityBanRatificationsPrefix(slug: string | undefined) {
  return ["community-ban-ratifications", slug] as const;
}

/**
 * The exact key one status of the queue caches under. `demoMode` is part of
 * the key because the toggle flips at runtime: nothing synthesized in demo may
 * survive a switch to live and be read back as a real pending bar.
 */
export function communityBanRatificationsQueryKey(
  slug: string | undefined,
  demoMode: boolean,
  status: CommunityBanRatificationStatus,
) {
  return [...communityBanRatificationsPrefix(slug), demoMode, status] as const;
}

/**
 * Permanent bars waiting on a second signature
 * (`GET /communities/:slug/ban-ratifications`), soonest to lapse first.
 *
 * The raw query is returned rather than a flattened `{ items, isLoading }`
 * shape, and deliberately so. A failed request must never paint as an empty
 * queue: "nothing waiting" printed because the network dropped is how a
 * permanent bar lapses to the fallback term with nobody having read it.
 * Loading, failure and a genuinely empty queue are three separate renders in
 * the pane.
 *
 * The demo mock carries no bans and so no holds, so demo mode answers with an
 * empty queue without touching the network. That renders the pane's real empty
 * state, matching the ban list and the governance trail next door, rather than
 * inventing a member somebody wants barred for life.
 */
export function useCommunityBanRatifications(
  slug: string | undefined,
  status: CommunityBanRatificationStatus = "pending",
  isEnabled = true,
) {
  const { demoMode } = useDemoMode();
  return useQuery<CommunityBanRatificationListDTO>({
    queryKey: communityBanRatificationsQueryKey(slug, demoMode, status),
    enabled: isEnabled && Boolean(slug),
    queryFn: () =>
      demoMode
        ? // The prototype's stand-in. The two numbers mirror the server
          // constants so the pane's own copy reads correctly in demo; nothing
          // in a live path ever reads them, because live gets the real ones.
          Promise.resolve({
            ratifications: [],
            total: 0,
            windowHours: 72,
            fallbackDays: 30,
          })
        : getCommunityBanRatifications(slug!, status),
  });
}

/**
 * How many pending holds THIS viewer could actually sign: not their own
 * proposals, and not the ones that have already lapsed.
 *
 * The rail badge counts these rather than the whole queue. A badge on work
 * only somebody else can do is a number a moderator cannot clear, and the
 * proposer's own row is visible in the pane either way.
 */
export function signableRatificationCount(
  data: CommunityBanRatificationListDTO | undefined,
): number {
  if (!data) return 0;
  return data.ratifications.filter(
    (hold) =>
      hold.status === "pending" && !hold.isOwnProposal && !hold.isExpired,
  ).length;
}

/**
 * `PATCH /communities/:slug/ban-ratifications/:id`: the second signature, or
 * the refusal.
 *
 * Ratifying drops the ban's end date, so the ban list changes too and both
 * caches are invalidated. Declining leaves the member serving the same term
 * they were already serving, and invalidating the ban list there is cheap and
 * keeps the pending marker on the row honest.
 *
 * Demo mode has no queue to decide, so it resolves to null and writes nothing.
 * The pane's own success copy is driven by the decision the caller sent, and
 * the demo queue is empty, so there is no row for this to be reached from.
 */
export function useDecideCommunityBanRatification(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    CommunityBanRatificationDTO | null,
    Error,
    { ratificationId: string; input: DecideCommunityBanRatificationInput }
  >({
    // The pane owns its own error copy (it tells a refusal apart from a lost
    // connection), so the app-wide handler must not stack a second toast.
    meta: { silentError: true },
    mutationFn: async ({ ratificationId, input }) => {
      if (demoMode) return null;
      return decideCommunityBanRatification(slug, ratificationId, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: communityBanRatificationsPrefix(slug),
      });
      void queryClient.invalidateQueries({
        queryKey: ["community-bans", slug],
      });
    },
  });
}
