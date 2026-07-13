import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { createPost, likePost, replyToPost } from "./feed.api";

/**
 * Feed write flows. Each branches on `demoMode`: demo is a no-op (the card keeps
 * its optimistic local state, as the prototype already does); live calls the
 * community-posts endpoint then invalidates the feed. The realtime layer
 * additionally prepends new items from other sessions.
 */

/** POST /community-posts — compose a new post. */
export function useCreatePost() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { body: string; communitySlug?: string }>({
    mutationFn: async ({ body, communitySlug }) => {
      if (demoMode) return;
      await createPost(body, communitySlug);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

/** POST /community-posts/:id/like — like/unlike. `liked` is the target state. */
export function useLikePost() {
  const { demoMode } = useDemoMode();
  return useMutation<void, Error, { id: string; liked: boolean }>({
    mutationFn: async ({ id, liked }) => {
      if (demoMode) return;
      await likePost(id, liked);
    },
  });
}

/** POST /community-posts/:id/replies — reply to a post. */
export function useReplyToPost() {
  const { demoMode } = useDemoMode();
  return useMutation<void, Error, { id: string; body: string }>({
    mutationFn: async ({ id, body }) => {
      if (demoMode) return;
      await replyToPost(id, body);
    },
  });
}
