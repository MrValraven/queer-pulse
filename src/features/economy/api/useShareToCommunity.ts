import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { viewerPerson } from "../../communities/communityPeople";
import { addDemoSharedPost } from "../../communities/demoSharedPosts";
import {
  createCommunityPost,
  type CreatedCommunityPostDTO,
} from "./communityShare.api";

/** Demo post ids: a session counter keeps two shares in one millisecond
 *  apart. */
let demoSharedPostCount = 0;

export interface ShareToCommunityInput {
  communitySlug: string;
  body: string;
}

/**
 * Share something to one of your communities as a community post.
 *
 * Demo fakes the round trip and puts the post on the demo board (there is
 * no network in demo mode); live writes a real post to the chosen
 * community, which then reaches the feed through the existing aggregation
 * and inherits that community's moderation and freeze rules. `silentError`
 * because the sharing modal surfaces the API's own refusals: the member does
 * not belong to that community, the community is frozen or archived, or it is gone.
 */
export function useShareToCommunity() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
    onSuccess: (_created, { communitySlug, body }) => {
      if (demoMode) {
        // Demo has no server: the board reads this session store, so the
        // share is there when the member opens the community.
        addDemoSharedPost({
          id: `demo-shared-${(demoSharedPostCount += 1)}`,
          author: viewerPerson(user) ?? {
            initials: "?",
            name: "",
            tint: "plum",
          },
          body,
          kind: "post",
          reactions: [{ key: "heart", count: 0 }],
          replies: [],
          createdAt: new Date().toISOString(),
          communitySlug,
        });
        return;
      }
      // The community's own board and the aggregated feed both now have a
      // new item.
      void queryClient.invalidateQueries({
        queryKey: ["community-posts", communitySlug],
      });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
