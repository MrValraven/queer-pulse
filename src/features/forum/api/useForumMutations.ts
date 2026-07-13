import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createThread,
  replyToThread,
  votePost,
  type CreateThreadDto,
} from "./forum.api";
import { slugForThreadId } from "./forum.adapters";

/**
 * Forum write flows. Each branches on `demoMode`: demo is a no-op (the page
 * keeps its optimistic local thread/reply, exactly as the prototype does); live
 * calls the API then invalidates the affected keys.
 */

/** POST /forum/threads — ComposeThreadModal publish. */
export function useCreateThread() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, CreateThreadDto>({
    mutationFn: async (dto) => {
      if (demoMode) return;
      await createThread(dto);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
}

/** POST /forum/threads/:slug/posts — ThreadComposer reply. Takes the numeric
 *  thread id and resolves its backend slug from the list step's registry. */
export function useReply(threadId: number) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (body) => {
      if (demoMode) return;
      const slug = slugForThreadId(threadId);
      if (!slug) return;
      await replyToThread(slug, body);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({
        queryKey: ["forum-thread", false, threadId],
      });
    },
  });
}

/** POST /forum/posts/:id/vote — upvote toggle on a post. */
export function useVote() {
  const { demoMode } = useDemoMode();
  return useMutation<void, Error, { postId: string; value: number }>({
    mutationFn: async ({ postId, value }) => {
      if (demoMode) return;
      await votePost(postId, value);
    },
  });
}
