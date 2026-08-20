import { useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type MutateOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  deletePost,
  editPost,
  editThreadTitle,
  lockThread,
  pinThread,
  replyToThread,
  restorePost,
  setThreadOfficial,
  unlockThread,
  unpinThread,
  votePost,
} from "./forum.api";
import { slugForThreadId } from "./forum.adapters";
import type { ThreadListPage, ThreadPostsPage } from "./useForum";

/**
 * Forum write flows. Each branches on `demoMode`: demo is a no-op (the page
 * keeps its optimistic local thread/reply, exactly as the prototype does); live
 * calls the API then invalidates the affected keys.
 */

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

// ── Voting ───────────────────────────────────────────────────────────────────
// A vote is an idempotent upvote toggle: value 1 = upvoted, value 0 = cleared.
// The new vote count is derived optimistically from the delta against the
// viewer's *current* vote read out of the cache, so we never need the server's
// number to render — the endpoint only reconciles.

/** Prefix filters for the two caches a vote touches (list cards + thread posts).
 *  Prefix-matched (mirroring `invalidateThread`) so every language/filter/param
 *  variant of the currently-mounted queries is patched. */
const THREADS_KEY = { queryKey: ["forum-threads"] } as const;
const POSTS_KEY = { queryKey: ["forum-thread-posts"] } as const;

/** Optimistically patch the OP card (matched by `opPostId`) inside the infinite
 *  thread-list cache: set `myVote` and move `upvotes` by the vote delta. */
function patchThreadsCache(
  data: InfiniteData<ThreadListPage> | undefined,
  postId: string,
  value: 0 | 1,
): InfiniteData<ThreadListPage> | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => {
      let changed = false;
      const items = page.items.map((card) => {
        if (card.opPostId !== postId) return card;
        changed = true;
        const delta = value - (card.myVote ?? 0);
        return {
          ...card,
          myVote: value,
          upvotes: Math.max(0, card.upvotes + delta),
        };
      });
      return changed ? { ...page, items } : page;
    }),
  };
}

/** Optimistically patch the post (matched by `id`) inside the infinite
 *  thread-posts cache: set `myVote` and move `voteCount` by the vote delta. */
function patchPostsCache(
  data: InfiniteData<ThreadPostsPage> | undefined,
  postId: string,
  value: 0 | 1,
): InfiniteData<ThreadPostsPage> | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => {
      let changed = false;
      const items = page.items.map((post) => {
        if (post.id !== postId) return post;
        changed = true;
        const delta = value - (post.myVote ?? 0);
        return {
          ...post,
          myVote: value,
          voteCount: Math.max(0, post.voteCount + delta),
        };
      });
      return changed ? { ...page, items } : page;
    }),
  };
}

/** Snapshots captured in `onMutate` for rollback on error. */
interface VoteContext {
  threads: [QueryKey, InfiniteData<ThreadListPage> | undefined][];
  posts: [QueryKey, InfiniteData<ThreadPostsPage> | undefined][];
}

/**
 * Cast/clear the viewer's upvote on a forum post.
 *
 * Consumer interface:
 * ```ts
 * const { vote, toggleVote, isPending } = useVotePost();
 * vote(postId, 1);            // upvote        vote(postId, 0);  // clear
 * toggleVote({ postId, myVote });  // flip based on the current vote
 * ```
 * `postId` is the backend post id. For a thread's OP that is the card's
 * `opPostId`; for a reply it is the reply's `postId`/`id`.
 *
 * Both caches are patched optimistically in `onMutate` (BEFORE any request):
 * the OP card in every mounted `["forum-threads", …]` query (found by
 * `opPostId`) and the post in every mounted `["forum-thread-posts", …]` query
 * (found by `id`). In LIVE mode it then POSTs the vote and rolls both caches
 * back to their snapshots on error.
 *
 * DEMO patches only — no API call, no rollback. The demo THREAD LIST *is* cached
 * (its `queryFn` returns the mock as a single page) and its mock cards now carry
 * a synthetic `opPostId` (see `THREADS` in `forum.data.ts`), so the same
 * `onMutate` patch toggles the list row's `myVote`/`upvotes` in place — no
 * refetch clobbers it (demo never invalidates). The demo THREAD PAGE, by
 * contrast, is derived from the static mock via `useMemo` and never enters a
 * query cache, so there is nothing here to patch; `ThreadPage` keeps a small
 * `demoMode`-gated local overlay (OP toggle + `localReplies` mutation) for that
 * screen instead. None of this runs in live.
 */
export function useVotePost() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  // Number of vote mutations currently in flight. Rapid toggles overlap, and
  // each `onError` rolls back to the snapshot it captured in `onMutate` — which,
  // for a later toggle, is an already-optimistically-patched state. That can
  // leave the count off by one after concurrent toggles. To self-heal, the LAST
  // in-flight vote to settle invalidates the two caches so they refetch the
  // server's authoritative count. Invalidating only when the count reaches zero
  // avoids refetching out from under a still-pending optimistic patch.
  const inFlightVotes = useRef(0);

  const mutation = useMutation<
    void,
    Error,
    { postId: string; value: 0 | 1 },
    VoteContext
  >({
    onMutate: async ({ postId, value }) => {
      inFlightVotes.current += 1;
      // Stop in-flight refetches so they can't clobber the optimistic patch.
      await queryClient.cancelQueries(THREADS_KEY);
      await queryClient.cancelQueries(POSTS_KEY);
      const threads =
        queryClient.getQueriesData<InfiniteData<ThreadListPage>>(THREADS_KEY);
      const posts =
        queryClient.getQueriesData<InfiniteData<ThreadPostsPage>>(POSTS_KEY);
      queryClient.setQueriesData<InfiniteData<ThreadListPage>>(
        THREADS_KEY,
        (data) => patchThreadsCache(data, postId, value),
      );
      queryClient.setQueriesData<InfiniteData<ThreadPostsPage>>(
        POSTS_KEY,
        (data) => patchPostsCache(data, postId, value),
      );
      return { threads, posts };
    },
    mutationFn: async ({ postId, value }) => {
      if (demoMode) return;
      await votePost(postId, value);
    },
    onError: (_error, _variables, context) => {
      context?.threads.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
      context?.posts.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSettled: () => {
      inFlightVotes.current = Math.max(0, inFlightVotes.current - 1);
      // Demo never hits the network, so there is nothing to reconcile against —
      // the optimistic cache patch is the record. Keep it a no-op.
      if (demoMode) return;
      // Only the last vote to settle reconciles: refetch the server's true count
      // once no optimistic patch is still pending. This heals any drift left by
      // an `onError` rollback of an overlapping toggle, so the count can't stay
      // permanently wrong.
      if (inFlightVotes.current === 0) {
        void queryClient.invalidateQueries(THREADS_KEY);
        void queryClient.invalidateQueries(POSTS_KEY);
      }
    },
  });

  const vote = (postId: string, value: 0 | 1) =>
    mutation.mutate({ postId, value });

  return {
    /** Set the viewer's vote explicitly: `value` 1 = upvote, 0 = clear. */
    vote,
    /** Flip the vote based on the post's current `myVote` (0/undefined → 1). */
    toggleVote: (post: { postId: string; myVote?: number }) =>
      vote(post.postId, post.myVote ? 0 : 1),
    isPending: mutation.isPending,
  };
}

/**
 * Moderator lock / unlock of a thread (closes / reopens it to replies).
 *
 * Consumer interface:
 * ```ts
 * const { lock, unlock, isPending } = useLockThread();
 * lock(slug, reason);  // POST /forum/threads/:slug/lock — reason is optional
 * unlock(slug);        // POST /forum/threads/:slug/unlock
 * ```
 * On success it invalidates the thread meta + posts (so the banner/composer
 * re-read `isLocked`/`lockReason`) and the thread list (so the row lock state
 * refreshes). DEMO is a no-op — the page toggles its own local lock state.
 */
export function useLockThread() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, LockVars>({
    mutationFn: async ({ slug, locked, reason }) => {
      if (demoMode) return;
      if (locked) await lockThread(slug, reason);
      else await unlockThread(slug);
    },
    onSuccess: () => {
      if (demoMode) return;
      invalidateThread(queryClient);
      void queryClient.invalidateQueries(THREADS_KEY);
    },
  });

  // `options` lets the caller attach a per-call onSuccess/onError (e.g. a
  // confirming toast) without the hook owning UI concerns. Demo still resolves
  // the no-op mutationFn, so onSuccess fires in both modes.
  return {
    lock: (
      slug: string,
      reason?: string,
      options?: MutateOptions<void, Error, LockVars>,
    ) => mutation.mutate({ slug, locked: true, reason }, options),
    unlock: (slug: string, options?: MutateOptions<void, Error, LockVars>) =>
      mutation.mutate({ slug, locked: false }, options),
    isPending: mutation.isPending,
  };
}

/** Mutation variables for the lock/unlock toggle. `reason` is only ever sent
 *  on a locking transition. */
interface LockVars {
  slug: string;
  locked: boolean;
  reason?: string;
}

/**
 * Moderator pin / unpin of a thread (sticky bucket above the list).
 *
 * Consumer interface:
 * ```ts
 * const { pin, unpin, isPending } = usePinThread();
 * pin(slug);    // POST /forum/threads/:slug/pin
 * unpin(slug);  // POST /forum/threads/:slug/unpin
 * ```
 * On success it invalidates the pinned bucket (so the sticky section
 * refreshes) and the thread list (so the row's pinned badge/menu label
 * refreshes). DEMO is a no-op — there is no separate pinned bucket to
 * invalidate in demo mode (see `usePinnedThreads`).
 */
export function usePinThread() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, PinVars>({
    mutationFn: async ({ slug, pinned }) => {
      if (demoMode) return;
      if (pinned) await pinThread(slug);
      else await unpinThread(slug);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["forum-pinned-threads"] });
      void queryClient.invalidateQueries(THREADS_KEY);
    },
  });

  return {
    pin: (slug: string, options?: MutateOptions<void, Error, PinVars>) =>
      mutation.mutate({ slug, pinned: true }, options),
    unpin: (slug: string, options?: MutateOptions<void, Error, PinVars>) =>
      mutation.mutate({ slug, pinned: false }, options),
    isPending: mutation.isPending,
  };
}

/** Mutation variables for the pin/unpin toggle. */
interface PinVars {
  slug: string;
  pinned: boolean;
}

/**
 * Admin-only toggle: flips a published thread between its real author and
 * "QueerPulse Official".
 *
 * Consumer interface:
 * ```ts
 * const { setOfficial, isPending } = useSetThreadOfficial();
 * setOfficial(slug, true);   // PATCH /admin/forum/threads/:slug/official
 * ```
 * On success it invalidates the thread meta/posts (so the byline re-reads)
 * and the thread list (so the row's author refreshes). DEMO is a no-op.
 */
export function useSetThreadOfficial() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, OfficialVars>({
    mutationFn: async ({ slug, isOfficial }) => {
      if (demoMode) return;
      await setThreadOfficial(slug, isOfficial);
    },
    onSuccess: () => {
      if (demoMode) return;
      invalidateThread(queryClient);
      void queryClient.invalidateQueries(THREADS_KEY);
    },
  });

  return {
    setOfficial: (
      slug: string,
      isOfficial: boolean,
      options?: MutateOptions<void, Error, OfficialVars>,
    ) => mutation.mutate({ slug, isOfficial }, options),
    isPending: mutation.isPending,
  };
}

/** Mutation variables for the official-byline toggle. */
interface OfficialVars {
  slug: string;
  isOfficial: boolean;
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
