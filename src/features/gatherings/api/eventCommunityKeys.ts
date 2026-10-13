import type { QueryClient } from "@tanstack/react-query";
import { eventKeys } from "./eventKeys";

/**
 * Query keys for guest communities. `demoMode` sits last, the convention
 * `eventKeys` documents, so a bare root invalidates every variant.
 */
export const eventCommunityKeys = {
  guestListRoot: ["event-guest-communities"] as const,
  guestList: (slug: string | undefined, demoMode: boolean) =>
    ["event-guest-communities", slug, demoMode] as const,
  collabInviteRoot: ["collab-invite"] as const,
  collabInvite: (inviteId: string | undefined, demoMode: boolean) =>
    ["collab-invite", inviteId, demoMode] as const,
};

/**
 * Every reader that shows who hosts a gathering: the organisers' guest list,
 * the gathering detail (hero line and sidebar card) and an organiser's
 * `?viewAs` preview of it, and both community Events tab lanes (the member
 * pulse and the prospective-member list).
 */
export function invalidateHostingReaders(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({
    queryKey: eventCommunityKeys.guestListRoot,
  });
  void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
  void queryClient.invalidateQueries({ queryKey: eventKeys.detailPreviewRoot });
  void queryClient.invalidateQueries({ queryKey: ["community-pulse"] });
  void queryClient.invalidateQueries({
    queryKey: ["community-upcoming-gatherings"],
  });
}
