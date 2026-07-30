import { useMemo, useState } from "react";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useToast } from "../../shared/components/feedback/useToast";
import { type Thread } from "./forum.data";
import { useThreads } from "./api/useForum";
import { useEditThreadTitle } from "./api/useForumMutations";
import { useCreateThreadFlow } from "./useCreateThreadFlow";
// DEMO-ONLY persona — read ONLY inside the `demoMode` branch of `canEditThread`
// below; the live branch must use solely the DTO's `thread.canEdit` flag.
import { currentUser } from "../members/data/members";

const PROMPT_DISMISSED_KEY = "qp_forum_prompt_dismissed";

/**
 * Owns every ForumPage concern that isn't markup — thread source + filter/sort,
 * vote toggling, the first-post prompt's dismissal, the create-thread flow
 * (with its optimistic thread object), and the title-edit flow — lifting them
 * out of ForumPage the same way `useThreadModeration` lifts moderation state
 * out of ThreadPage, so the route component itself stays well under the line
 * budget. Behaviour is identical to the inline state/handlers it replaces.
 */
export function useForumPageState() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const simLoading = useSimulatedLoad();
  const { showToast } = useToast();
  const [cat, setCat] = useState("all");
  // Thread source: demo returns the full mock as one terminal page, live pages
  // through GET /forum/threads via the "Load more" button below the list.
  const threadsQuery = useThreads(cat);
  const { hasNextPage, fetchNextPage, isFetchingNextPage } = threadsQuery;
  const loading = demoMode ? simLoading : threadsQuery.isLoading;
  const [sort, setSort] = useState<"top" | "new">("top");
  const [voted, setVoted] = useState<Set<number>>(new Set());
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
        dismissPrompt();
      },
    });

  const allThreads = useMemo(() => {
    // Once the server-persisted copy of a just-posted thread comes back in the
    // refetched list, drop the local optimistic copy so the post doesn't render
    // twice (matched on category + title). Demo never refetches, so its
    // optimistic posts are kept as the record.
    const serverKeys = new Set(
      threadsQuery.threads.map((thread) => `${thread.category}::${thread.title}`),
    );
    const optimistic = extraThreads.filter(
      (thread) => !serverKeys.has(`${thread.category}::${thread.title}`),
    );
    return [...optimistic, ...threadsQuery.threads];
  }, [extraThreads, threadsQuery.threads]);

  // Live: author-only edit right comes from the DTO flag on the card.
  // Demo: the persona owns threads it authored ("You" / its slug). currentUser
  // is only touched inside this demoMode branch.
  const canEditThread = (thread: Thread): boolean =>
    demoMode
      ? thread.author.slug === currentUser.slug || thread.author.name === "You"
      : !!thread.canEdit;

  const editingThread =
    editingTitleThreadId != null
      ? allThreads.find((thread) => thread.id === editingTitleThreadId)
      : undefined;

  function closeEditTitle() {
    setEditingTitleThreadId(null);
  }

  function saveThreadTitle(title: string) {
    if (demoMode) {
      // Demo edit only ever targets locally-composed threads (in extraThreads);
      // seeded THREADS are never authored by the demo persona.
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

  // Sidebar post counts derived from the real threads (members' posts), so they
  // stay truthful and update live when a member publishes a new one.
  const counts = useMemo(() => {
    const by: Record<string, number> = {};
    for (const thread of allThreads) by[thread.category] = (by[thread.category] ?? 0) + 1;
    return by;
  }, [allThreads]);

  const threads = useMemo(() => {
    const filtered = allThreads.filter((thread) => cat === "all" || thread.category === cat);
    if (sort === "new") return [...filtered].sort((a, b) => b.id - a.id);
    return [...filtered].sort(
      (a, b) =>
        (b.pinned ? 1000 : 0) + b.upvotes - ((a.pinned ? 1000 : 0) + a.upvotes),
    );
  }, [allThreads, cat, sort]);

  function toggleVote(id: number) {
    setVoted((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return {
    cat,
    setCat,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    loading,
    sort,
    setSort,
    voted,
    toggleVote,
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
    threads,
    publishThread,
  };
}
