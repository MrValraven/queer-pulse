import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { demoGuestCommunitiesFor } from "../eventGuestCommunities.data";
import { applyDemoGuestChanges } from "./eventCommunities.adapters";
import {
  inviteGuestCommunity,
  listEventGuestCommunities,
  removeGuestCommunity,
  type EventGuestCommunityView,
  type GuestCommunityChanges,
} from "./eventCommunities.api";
import {
  eventCommunityKeys,
  invalidateHostingReaders,
} from "./eventCommunityKeys";

/** The roles that answer for a community, and whose invites the server
 *  accepts on the spot. */
const COMMUNITY_STAFF_ROLES = new Set<string>(["owner", "co_owner", "mod"]);

/**
 * `GET /events/:slug/communities`: every guest row with its status, for
 * the editors. Organisers only on the server, so only organiser surfaces
 * call it (the Manage page and the host bar). Demo reads
 * `eventGuestCommunities.data.ts`.
 */
export function useEventGuestCommunities(
  slug: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  return useQuery<EventGuestCommunityView[]>({
    queryKey: eventCommunityKeys.guestList(slug, demoMode),
    enabled: enabled && Boolean(slug),
    queryFn: async () => {
      if (demoMode || !slug) return demoGuestCommunitiesFor(slug ?? "");
      return listEventGuestCommunities(slug);
    },
  });
}

export interface GuestCommunityChangesResult {
  /** How many invites and removals the server refused. */
  failedCount: number;
  /** The first refusal's error, so a coded one can name its reason; null
   *  when nothing was refused. */
  firstRejection: unknown;
}

/**
 * Sends one save's guest changes: removals first (each frees a place under
 * the cap of five), then invites. Every call settles on its own, so one
 * refusal never blocks the rest, and the promise always resolves with how
 * many failed and the first refusal's error. The hosting readers refetch afterwards. Demo patches the
 * cached list and makes no request.
 */
export function useApplyGuestCommunityChanges(
  slug: string,
): (changes: GuestCommunityChanges) => Promise<GuestCommunityChangesResult> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { roleIn } = useCommunityMembership();
  return async (changes) => {
    if (changes.invites.length === 0 && changes.removeSlugs.length === 0) {
      return { failedCount: 0, firstRejection: null };
    }
    if (demoMode) {
      queryClient.setQueryData<EventGuestCommunityView[]>(
        eventCommunityKeys.guestList(slug, true),
        (current) =>
          applyDemoGuestChanges(
            current ?? demoGuestCommunitiesFor(slug),
            changes,
            (communitySlug) =>
              COMMUNITY_STAFF_ROLES.has(roleIn(communitySlug) ?? ""),
          ),
      );
      return { failedCount: 0, firstRejection: null };
    }
    const removals = await Promise.allSettled(
      changes.removeSlugs.map((communitySlug) =>
        removeGuestCommunity(slug, communitySlug),
      ),
    );
    const invites = await Promise.allSettled(
      changes.invites.map((entry) => inviteGuestCommunity(slug, entry.slug)),
    );
    invalidateHostingReaders(queryClient);
    const rejections = [...removals, ...invites].filter(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    return {
      failedCount: rejections.length,
      firstRejection: rejections[0]?.reason ?? null,
    };
  };
}
