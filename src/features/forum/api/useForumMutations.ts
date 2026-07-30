import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createThread,
  deletePost,
  editPost,
  editThreadTitle,
  replyToThread,
  restorePost,
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
      void queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
}

/** POST /forum/threads/:slug/posts — ThreadComposer / inline reply. Takes the
 *  thread's backend slug directly (from the loaded thread), so it works on a
 *  deep link too. Demo passes `undefined` and the mutation no-ops.
 *  `parentPostId` nests the reply under an existing post; omit/null for a
 *  top-level reply to the thread. */
export function useReply(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { body: string; parentPostId?: string | null }>({
    mutationFn: async ({ body, parentPostId }) => {
      if (demoMode || !slug) return;
      await replyToThread(slug, body, parentPostId);
    },
    onSuccess: () => {
      if (demoMode) return;
      // Refetch the posts so the optimistic "You" reply reconciles with the
      // server record. Keyed by prefix — every language/param variant refetches.
      void queryClient.invalidateQueries({ queryKey: ["forum-thread-posts"] });
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

/**
 * Invalidate the two queries a thread page depends on: its posts (OP + replies)
 * and its meta (title). `useThread` keys posts on ["forum-thread-posts",
 * demoMode, routeParam, language] and meta on ["forum-thread-meta", ...], where
 * `routeParam` is the backend SLUG string in live mode — these mutations only
 * ever know the numeric thread id, which never appears in the key, so matching
 * on it is impossible. Invalidate by KEY PREFIX instead (mirroring `useReply`
 * above): react-query only refetches the active/mounted query, which in
 * practice is the one thread page currently on screen.
 */
function invalidateThread(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["forum-thread-posts"] });
  void queryClient.invalidateQueries({ queryKey: ["forum-thread-meta"] });
}

/** PATCH /forum/posts/:id — author edits a body. Demo is a no-op (ThreadPage
 *  applies the edit to its local state). */
export function useEditPost() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { postId: string; body: string }>({
    mutationFn: async ({ postId, body }) => {
      if (demoMode) return;
      await editPost(postId, body);
    },
    onSuccess: () => {
      if (demoMode) return;
      invalidateThread(queryClient);
    },
  });
}

/** DELETE /forum/posts/:id — soft tombstone. */
export function useDeletePost() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { postId: string }>({
    mutationFn: async ({ postId }) => {
      if (demoMode) return;
      await deletePost(postId);
    },
    onSuccess: () => {
      if (demoMode) return;
      invalidateThread(queryClient);
    },
  });
}

/** POST /forum/posts/:id/restore — clear the tombstone. */
export function useRestorePost() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { postId: string }>({
    mutationFn: async ({ postId }) => {
      if (demoMode) return;
      await restorePost(postId);
    },
    onSuccess: () => {
      if (demoMode) return;
      invalidateThread(queryClient);
    },
  });
}

/** PATCH /forum/threads/:slug — author edits the thread title. Resolves the
 *  backend slug from the numeric id via the list step's registry. */
export function useEditThreadTitle(threadId: number) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { title: string }>({
    mutationFn: async ({ title }) => {
      if (demoMode) return;
      const slug = slugForThreadId(threadId);
      if (!slug) return;
      await editThreadTitle(slug, title);
    },
    onSuccess: () => {
      if (demoMode) return;
      invalidateThread(queryClient);
    },
  });
}
