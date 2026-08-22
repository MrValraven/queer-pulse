import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createCommunityPost,
  type CreatedCommunityPostDTO,
} from "./communityShare.api";

export interface ShareToCommunityInput {
  communitySlug: string;
  body: string;
}

/**
 * Share something to one of your communities as a community post.
 *
 * Demo fakes the round trip (there is no network in demo mode); live writes a
 * real post to the chosen room, which then reaches the feed through the
 * existing aggregation and inherits that community's moderation and freeze
 * rules. `silentError` because the sharing modal surfaces the API's own
 * refusals — not a member of that room, the room is frozen or archived, the
 * room is gone.
 */
export function useShareToCommunity() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<
    CreatedCommunityPostDTO | null,
    Error,
    ShareToCommunityInput
  >({
    meta: { silentError: true },
    mutationFn: async ({ communitySlug, body }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 550));
        return null;
      }
      return createCommunityPost({ communitySlug, body });
    },
    onSuccess: (_created, { communitySlug }) => {
      if (demoMode) return;
      // The room's own wall and the aggregated feed both now have a new item.
      void queryClient.invalidateQueries({
        queryKey: ["community-posts", communitySlug],
      });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
