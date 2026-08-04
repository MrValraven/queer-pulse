import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useToast } from "../../shared/components/feedback/useToast";
import { type Thread } from "./forum.data";
import { useForumCounts, useThreads } from "./api/useForum";
import { useEditThreadTitle, useVotePost } from "./api/useForumMutations";
import { type ForumSort, type ForumThreadCounts } from "./api/forum.api";
import { useCreateThreadFlow } from "./useCreateThreadFlow";
import { useForumRowModeration } from "./useForumRowModeration";
// DEMO-ONLY persona — read ONLY inside the `demoMode` branch of `canEditThread`
// below; the live branch must use solely the DTO's `thread.canEdit` flag.
import { currentUser } from "../members/data/members";

const PROMPT_DISMISSED_KEY = "qp_forum_prompt_dismissed";

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

  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<ForumSort>("top");

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

  // Thread source: demo returns the full mock as one terminal page, live pages
  // through GET /forum/threads (already sorted/filtered) via "Load more".
  const threadsQuery = useThreads(cat, { sort, tag, q: q || undefined });
  const { hasNextPage, fetchNextPage, isFetchingNextPage } = threadsQuery;
  const loading = demoMode ? simLoading : threadsQuery.isLoading;

  // Truthful counts (server in live / mock-derived in demo) — never the length
  // of the loaded page, which only ever sees the fetched slice.
  const countsResult = useForumCounts(q || undefined, tag);
  const counts: ForumThreadCounts = countsResult.counts ?? { all: 0 };

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

  // Show the first-post invitation only to members who haven't posted this
  // session and haven't waved it away before (dismissal persists across reloads).
  const showFirstPostPrompt = !promptDismissed && extraThreads.length === 0;

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
  const { composing, composeSeed, openCompose, closeCompose, publishThread } =
    useCreateThreadFlow({
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
        !!thread.canViewHistory;

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
    filtered,
    resetFilters,
    onVote,
    moderation,
    publishThread,
  };
}
