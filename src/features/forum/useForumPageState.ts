import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useToast } from "../../shared/components/feedback/useToast";
import { type Thread } from "./forum.data";
import { useForumCounts, usePinnedThreads, useThreads } from "./api/useForum";
import { useEditThreadTitle, useVotePost } from "./api/useForumMutations";
import { type ForumSort, type ForumThreadCounts } from "./api/forum.api";
import { useCreateThreadFlow } from "./useCreateThreadFlow";
import { useForumRowModeration } from "./useForumRowModeration";
// DEMO-ONLY persona — read ONLY inside the `demoMode` branch of `canEditThread`
// below; the live branch must use solely the DTO's `thread.canEdit` flag.
import { currentUser } from "../members/data/members";

const PROMPT_DISMISSED_KEY = "qp_forum_prompt_dismissed";

const FORUM_SORTS: readonly ForumSort[] = ["new", "top", "active", "unanswered"];

/** Narrows a raw `?sort=` URL param to a known `ForumSort`, so a malformed or
 *  stale link (or hand-edited URL) falls back to the default rather than
 *  passing garbage through to `useThreads`/the server. */
function isForumSort(value: string | null): value is ForumSort {
  return !!value && (FORUM_SORTS as readonly string[]).includes(value);
}

/**
 * Owns every ForumPage concern that isn't markup — thread source (with server
 * sort/tag/search), real OP voting, truthful counts, the first-post prompt, the
 * create-thread flow, the title-edit flow, and row moderation — lifting them
 * out of ForumPage so the route component stays well under the line budget.
 *
 * `sort` is a plain state; `tag` + `q` live in the URL so they're shareable and
 * survive reloads. All three flow to `useThreads`/`useForumCounts`, which apply
 * them server-side in live mode; demo re-derives filter/sort locally.
 */
export function useForumPageState() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const simLoading = useSimulatedLoad();
  const { showToast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get("tag") ?? undefined;
  const q = searchParams.get("q") ?? "";
  const setParam = useCallback(
    (key: string, value: string | null) =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      ),
    [setSearchParams],
  );
  const setQ = useCallback(
    (next: string) => setParam("q", next.trim() || null),
    [setParam],
  );
  const setTag = useCallback(
    (next: string | null) => setParam("tag", next),
    [setParam],
  );

  // Category + sort are URL-backed too (same `setParam` mechanism as tag/q
  // above), so refreshing or sharing a link preserves them instead of silently
  // resetting to "All"/"Top". "all"/"top" are each param's default, so they're
  // omitted from the URL entirely (never `?category=all`) — `setCat`/`setTag`
  // still `null` the param out below their default, exactly like `setTag`.
  const catParam = searchParams.get("category");
  const cat = catParam ?? "all";
  const setCat = useCallback(
    (next: string) => setParam("category", next === "all" ? null : next),
    [setParam],
  );
  const sortParam = searchParams.get("sort");
  const sort: ForumSort = isForumSort(sortParam) ? sortParam : "top";
  const setSort = useCallback(
    (next: ForumSort) => setParam("sort", next === "top" ? null : next),
    [setParam],
  );

  // Thread source: demo returns the full mock as one terminal page, live pages
  // through GET /forum/threads (already sorted/filtered) via "Load more".
  const threadsQuery = useThreads(cat, { sort, tag, q: q || undefined });
  const { hasNextPage, fetchNextPage, isFetchingNextPage } = threadsQuery;
  const loading = demoMode ? simLoading : threadsQuery.isLoading;

  // Truthful counts (server in live / mock-derived in demo) — never the length
  // of the loaded page, which only ever sees the fetched slice.
  const countsResult = useForumCounts(q || undefined, tag);
  const counts: ForumThreadCounts = countsResult.counts ?? { all: 0 };

  // The sticky pinned bucket above the list. It only takes a category filter
  // (see `usePinnedThreads`), so hide it during a tag/text search — a pinned
  // thread the search doesn't match would otherwise look like a stray result.
  const pinnedThreadsQuery = usePinnedThreads(cat);
  const pinnedThreads = tag || q ? [] : pinnedThreadsQuery.pinned;

  const votePost = useVotePost();
  const moderation = useForumRowModeration();

  const [extraThreads, setExtraThreads] = useState<Thread[]>([]);
  const [editingTitleThreadId, setEditingTitleThreadId] = useState<
    number | null
  >(null);
  const editThreadTitle = useEditThreadTitle(editingTitleThreadId ?? 0);
  const [promptDismissed, setPromptDismissed] = useState(
    () =>
      typeof localStorage !== "undefined" &&
      localStorage.getItem(PROMPT_DISMISSED_KEY) === "1",
  );

  // Show the first-post invitation only to members who genuinely haven't
  // posted and haven't waved it away before (dismissal persists across
  // reloads). LIVE reads `hasPosted` from the counts response — a real EXISTS
  // check against the member's own threads/posts (see `ForumController.
  // threadCounts`/`ForumPostsService.hasEverPosted`), not just this browsing
  // session, so a repeat poster on a fresh session never sees a false "you
  // haven't posted yet." `extraThreads.length` still covers the moment
  // immediately after publishing, before that count has refetched. DEMO has no
  // persistent posting history for the mock persona, so it's session-only,
  // exactly as before.
  const hasEverPosted = demoMode
    ? extraThreads.length > 0
    : countsResult.hasPosted || extraThreads.length > 0;
  const showFirstPostPrompt = !promptDismissed && !hasEverPosted;

  function dismissPrompt() {
    setPromptDismissed(true);
    try {
      localStorage.setItem(PROMPT_DISMISSED_KEY, "1");
    } catch {
      // Private mode / storage disabled — session-only dismissal is fine.
    }
  }

  // Surface the new post regardless of current filter/sort, and treat it like
  // any other first post — the invitation has done its job once they publish.
  const {
    composing,
    composeSeed,
    composeTags,
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

  const allThreads = useMemo(() => {
    // Dedupe the local optimistic copy against the refetched server list by
    // SERVER SLUG (stamped once the create mutation resolves) — never
    // `category::title`, which collided as soon as two drafts shared a title and
    // is what left the just-posted card linking to a dead route. Demo never
    // refetches, so its optimistic posts (no slug) are always kept as the record.
    const serverSlugs = new Set(
      threadsQuery.threads
        .map((thread) => thread.slug)
        .filter((slug): slug is string => Boolean(slug)),
    );
    const optimistic = extraThreads.filter(
      (thread) => !(thread.slug && serverSlugs.has(thread.slug)),
    );
    return [...optimistic, ...threadsQuery.threads];
  }, [extraThreads, threadsQuery.threads]);

  // Gate for the row's ⋯ moderation menu (kept named `canEditThread` so the list
  // prop contract — ForumThreadList → ForumThreadRow — is unchanged).
  // Live: show the menu when the viewer can do ANY row action — edit (author),
  // OR delete / restore / view-history (moderator who isn't the author).
  // Narrowing this to `canEdit` alone hid the menu for moderators, so
  // delete/restore/history never rendered.
  // Demo: the persona owns threads it authored ("You" / its slug); currentUser
  // is only touched inside this demoMode branch.
  const canEditThread = (thread: Thread): boolean =>
    demoMode
      ? thread.author.slug === currentUser.slug || thread.author.name === "You"
      : !!thread.canEdit ||
        !!thread.canDelete ||
        !!thread.canRestore ||
        !!thread.canViewHistory ||
        !!thread.canPin;

  const editingThread =
    editingTitleThreadId != null
      ? allThreads.find((thread) => thread.id === editingTitleThreadId)
      : undefined;

  function closeEditTitle() {
    setEditingTitleThreadId(null);
  }

  function saveThreadTitle(title: string) {
    if (demoMode) {
      setExtraThreads((prev) =>
        prev.map((thread) =>
          thread.id === editingTitleThreadId ? { ...thread, title } : thread,
        ),
      );
    } else {
      editThreadTitle.mutate(
        { title },
        { onError: () => showToast(t("forum:toast.error"), "error") },
      );
    }
    setEditingTitleThreadId(null);
    showToast(t("forum:toast.editSaved"), "success");
  }

  const filtered = cat !== "all" || !!tag || !!q;

  function resetFilters() {
    setCat("all");
    setTag(null);
    setQ("");
  }

  const threads = useMemo(() => {
    // Live: the server already applied category + tag + q + sort; render as-is
    // (optimistic posts first). Demo: no server, so filter + sort the mock here.
    if (!demoMode) return allThreads;
    let list = allThreads.filter(
      (thread) => cat === "all" || thread.category === cat,
    );
    if (tag) list = list.filter((thread) => thread.tags.includes(tag));
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter((thread) => thread.title.toLowerCase().includes(needle));
    }
    if (sort === "new") return [...list].sort((a, b) => b.id - a.id);
    if (sort === "unanswered")
      return list.filter((thread) => thread.comments === 0).sort((a, b) => b.id - a.id);
    // Demo mock carries no `lastActivityAt`; approximate recent activity by
    // reply volume so "Active" reads distinctly from "New"/"Top".
    if (sort === "active")
      return [...list].sort((a, b) => b.comments - a.comments || b.id - a.id);
    return [...list].sort(
      (a, b) =>
        (b.pinned ? 1000 : 0) + b.upvotes - ((a.pinned ? 1000 : 0) + a.upvotes),
    );
  }, [demoMode, allThreads, cat, tag, q, sort]);

  // Vote on the list row: acts on the thread's OPENING post. Live threads carry
  // a real `opPostId`; demo threads carry a SYNTHETIC one (`demo-op-<id>`, see
  // `THREADS`), so this fires in both modes. `useVotePost` optimistically patches
  // `upvotes` + `myVote` on the cached card — the demo list is cached, so the row
  // toggles in place; demo makes no API call, live also POSTs the vote.
  const onVote = useCallback(
    (thread: Thread) => {
      if (thread.opPostId) votePost.vote(thread.opPostId, thread.myVote ? 0 : 1);
    },
    [votePost],
  );

  const headerCount =
    cat === "all" ? (counts.all ?? 0) : (counts[cat] ?? 0);

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
    openCompose,
    closeCompose,
    showFirstPostPrompt,
    dismissPrompt,
    allThreads,
    canEditThread,
    editingThread,
    editingTitleThreadIsBusy: editThreadTitle.isPending,
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
