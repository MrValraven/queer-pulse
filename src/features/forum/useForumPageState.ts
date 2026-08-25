import { useCallback, useEffect, useMemo, useState } from "react";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useSocial } from "../../app/providers/useSocial";
import { type Thread } from "./forum.data";
import { useForumCounts, usePinnedThreads, useThreads } from "./api/useForum";
import { useVotePost } from "./api/useForumMutations";
import { type ForumThreadCounts } from "./api/forum.api";
import { useCreateThreadFlow } from "./useCreateThreadFlow";
import { useForumRowModeration } from "./useForumRowModeration";
import { useForumUrlParams } from "./useForumUrlParams";
import { useForumFirstPostPrompt } from "./useForumFirstPostPrompt";
import { useForumThreadTitleEdit } from "./useForumThreadTitleEdit";
import {
  canEditThread as checkCanEditThread,
  filterAndSortThreads,
  mergeOptimisticThreads,
} from "./forumPageState.helpers";

/**
 * Owns every ForumPage concern that isn't markup — thread source (with server
 * sort/tag/search), real OP voting, truthful counts, the first-post prompt, the
 * create-thread flow, the title-edit flow, and row moderation — lifting them
 * out of ForumPage so the route component stays well under the line budget.
 *
 * `sort` is a plain state; `tag` + `q` live in the URL so they're shareable and
 * survive reloads. All three flow to `useThreads`/`useForumCounts`, which apply
 * them server-side in live mode; demo re-derives filter/sort locally. URL param
 * plumbing, the first-post prompt, and the title-edit flow are each their own
 * sub-hook (see `useForumUrlParams`, `useForumFirstPostPrompt`,
 * `useForumThreadTitleEdit`); pure filter/sort/merge logic lives in
 * `forumPageState.helpers`.
 */
export function useForumPageState() {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const simLoading = useSimulatedLoad();

  const {
    searchParams,
    setSearchParams,
    tag,
    setTag,
    q,
    setQ,
    cat,
    setCat,
    sort,
    setSort,
  } = useForumUrlParams();

  // Thread source: demo returns the full mock as one terminal page, live pages
  // through GET /forum/threads (already sorted/filtered) via "Load more".
  const threadsQuery = useThreads(cat, { sort, tag, q: q || undefined });
  const { hasNextPage, fetchNextPage, isFetchingNextPage } = threadsQuery;
  const loading = demoMode ? simLoading : threadsQuery.isLoading;

  // Truthful counts (server in live / mock-derived in demo) — never the length
  // of the loaded page, which only ever sees the fetched slice.
  const countsResult = useForumCounts(q || undefined, tag);
  const counts: ForumThreadCounts = countsResult.counts ?? { all: 0 };

  // Safety filter, mirroring `useFeed`: threads by a member the viewer has
  // muted or blocked never render in the list. The live endpoint already
  // block-filters server-side; this covers the window before a fresh
  // mute/block propagates, and is the whole mechanism in demo mode.
  const { blocked, muted } = useSocial();
  const hiddenAuthorHandles = useMemo(
    () => new Set([...blocked, ...muted]),
    [blocked, muted],
  );

  // The sticky pinned bucket above the list. It only takes a category filter
  // (see `usePinnedThreads`), so hide it during a tag/text search — a pinned
  // thread the search doesn't match would otherwise look like a stray result.
  const pinnedThreadsQuery = usePinnedThreads(cat);
  const pinnedThreads =
    tag || q
      ? []
      : pinnedThreadsQuery.pinned.filter(
          (thread) =>
            !thread.author.slug || !hiddenAuthorHandles.has(thread.author.slug),
        );

  const votePost = useVotePost();
  const moderation = useForumRowModeration();

  const [extraThreads, setExtraThreads] = useState<Thread[]>([]);

  const { showFirstPostPrompt, dismissPrompt } = useForumFirstPostPrompt({
    demoMode,
    hasPostedFromServer: countsResult.hasPosted,
    extraThreadsCount: extraThreads.length,
  });

  // Surface the new post regardless of current filter/sort, and treat it like
  // any other first post — the invitation has done its job once they publish.
  const {
    composing,
    composeSeed,
    composeTags,
    publishStatus,
    openCompose,
    closeCompose,
    publishThread,
  } = useCreateThreadFlow({
    demoMode,
    user,
    setExtraThreads,
    onAfterPublish: () => {
      setCat("all");
      setSort("new");
      setTag(null);
      setQ("");
      dismissPrompt();
    },
  });

  // DISC-5 — a topic page's "Write a post" CTA (`writeHrefForTag`) deep-links
  // here as `?tag=<topic>&compose=1`. `tag` already scopes the thread list
  // (read above); `compose=1` additionally auto-opens the composer seeded
  // with that same tag, on mount only — a later in-page tag change (the
  // sidebar filter chips) must NOT reopen the modal. The `compose` param is
  // then stripped so a reload/share of the URL doesn't reopen it again.
  useEffect(() => {
    if (searchParams.get("compose") !== "1") return;
    openCompose("", tag ? [tag] : []);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("compose");
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allThreads = useMemo(
    () => mergeOptimisticThreads(extraThreads, threadsQuery.threads),
    [extraThreads, threadsQuery.threads],
  );

  const {
    editingThread,
    editingTitleThreadIsBusy,
    saveThreadTitle,
    setEditingTitleThreadId,
    closeEditTitle,
  } = useForumThreadTitleEdit({ demoMode, allThreads, setExtraThreads });

  const filtered = cat !== "all" || !!tag || !!q;

  function resetFilters() {
    setCat("all");
    setTag(null);
    setQ("");
  }

  const threads = useMemo(() => {
    const visible = allThreads.filter(
      (thread) =>
        !thread.author.slug || !hiddenAuthorHandles.has(thread.author.slug),
    );
    return filterAndSortThreads(visible, { demoMode, cat, tag, q, sort });
  }, [demoMode, allThreads, cat, tag, q, sort, hiddenAuthorHandles]);

  // Vote on the list row: acts on the thread's OPENING post. Live threads carry
  // a real `opPostId`; demo threads carry a SYNTHETIC one (`demo-op-<id>`, see
  // `THREADS`), so this fires in both modes. `useVotePost` optimistically patches
  // `upvotes` + `myVote` on the cached card — the demo list is cached, so the row
  // toggles in place; demo makes no API call, live also POSTs the vote.
  const onVote = useCallback(
    (thread: Thread) => {
      if (thread.opPostId)
        votePost.vote(thread.opPostId, thread.myVote ? 0 : 1);
    },
    [votePost],
  );

  const headerCount = cat === "all" ? (counts.all ?? 0) : (counts[cat] ?? 0);

  return {
    cat,
    setCat,
    sort,
    setSort,
    tag,
    setTag,
    q,
    setQ,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    loading,
    composing,
    composeSeed,
    composeTags,
    publishStatus,
    openCompose,
    closeCompose,
    showFirstPostPrompt,
    dismissPrompt,
    allThreads,
    canEditThread: (thread: Thread) => checkCanEditThread(thread, demoMode),
    editingThread,
    editingTitleThreadIsBusy,
    saveThreadTitle,
    setEditingTitleThreadId,
    closeEditTitle,
    counts,
    totalCount: counts.all ?? 0,
    headerCount,
    threads,
    pinnedThreads,
    filtered,
    resetFilters,
    onVote,
    moderation,
    publishThread,
  };
}
