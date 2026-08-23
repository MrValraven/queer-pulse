import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  inviteCommunityMembers,
  type CommunityInvitesResponseDTO,
} from "./communityInvites.api";

/**
 * `POST /communities/:slug/invites` — send invitations to up to 25 members
 * (owner, co-owner or moderator).
 *
 * The response is the point of this call, so the caller keeps it and renders
 * who was invited alongside who was skipped and why. Demo mode answers with a
 * summary shaped from the same slugs so the panel's result view is reachable
 * there too, without touching the network.
 *
 * Nothing is invalidated on success: an invitation changes no roster and no
 * join-request queue. The people named decide for themselves.
 */
export function useInviteCommunityMembers(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<CommunityInvitesResponseDTO, Error, string[]>({
    // The panel reports its own failure, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (memberSlugs) => {
      if (demoMode) {
        return {
          invited: memberSlugs,
          skipped: [],
          invitedCount: memberSlugs.length,
          skippedCount: 0,
        };
      }
      return inviteCommunityMembers(slug, memberSlugs);
    },
    onSuccess: () => {
      // Kept deliberately narrow: the notifications badge is the only surface
      // an invite can move, and only for the recipient, never for the sender.
      void queryClient.invalidateQueries({
        queryKey: ["community-invites", slug],
      });
    },
  });
}
