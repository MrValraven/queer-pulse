import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useProfileData } from "../../app/providers/useProfile";
import { useSaved } from "../../app/providers/useSaved";
import { thread as threadPath } from "../../app/routeMap";
import { CATS, type Reply, type ReplySortId } from "./forum.data";
import { useThread } from "./api/useForum";
import { useReply, useVotePost } from "./api/useForumMutations";
import { ApiError } from "../../shared/api/client";
import { buildReplyTree } from "./buildReplyTree";
import { useThreadModeration } from "./useThreadModeration";
import { useNestedReplyComposer } from "./useNestedReplyComposer";

/**
 * All state, derived values, effects, and mutation handlers for the thread
 * page. Extracted from `ThreadPage` (which is layout/JSX only) so that
 * component stays under the repo's 200-line-per-component limit. This is a
 * plain hook (returns no JSX), not a component, so the limit doesn't apply to
 * it — the same pattern as `useCommunityThreadState`.
 */
export function useThreadPageState() {
  const simLoading = useSimulatedLoad();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();
  // The logged-in member, mode-aware: the real signed-in user in live mode, the
  // mock persona in demo. Used for the optimistic "You" reply so live never
  // borrows the demo persona's avatar/initials.
  const { profile } = useProfileData();
  // The route param is the backend slug in live mode, the numeric mock id in
  // demo. Detail source: demo returns the scripted mock, live fetches meta + a
  // cursor page of posts (further pages append via the "Load more" button).
  const { id: routeParam = "" } = useParams();
  const threadQuery = useThread(routeParam);
  // NEVER fall back to the mock registry here — that leaked demo threads into
  // live mode. Live simply has no thread until the fetch resolves (or 404s).
  // `threadData` is the optional pre-guard binding; the consumer aliases it to
  // a non-optional `thread` past its `!threadData` early return.
  const threadData = threadQuery.thread;
  const postReply = useReply(threadData?.slug);
  // Real voting (POST /forum/posts/:id/vote). `vote(postId, 0|1)` optimistically
  // patches the ["forum-thread-posts"] cache, so the OP's `myVote`/`upvotes` and
  // each reply's `myVote`/`reactions` update in place — no local like state. Demo
  // has no posts cache, so it no-ops (the button reads the static mock counts).
  const { vote } = useVotePost();
  const loading = demoMode ? simLoading : threadQuery.isLoading;

  // OP "Save" is a REAL persisted bookmark, not throwaway local state: it goes
  // through the app-wide saved store (dual-mode — a pure local store in demo, an
  // optimistic `/me/saved` PUT/DELETE with rollback in live). Keyed on the
  // thread's stable slug (or its numeric id for demo mock threads, which have
  // none), so the pressed state survives reloads and syncs with Collections.
  const { isSaved, toggleSave } = useSaved();
  const savedId = threadData
    ? `post:${threadData.slug ?? threadData.id}`
    : "";
  const bookmarked = threadData ? isSaved(savedId) : false;
  const toggleBookmark = () => {
    if (!threadData) return;
    toggleSave({
      id: savedId,
      kind: "post",
      title: threadData.title,
      href: threadPath(threadData.slug ?? threadData.id),
      meta: threadData.author.name,
    });
  };

  const [sort, setSort] = useState<ReplySortId>("oldest");
  const [reply, setReply] = useState("");
  // DEMO-ONLY overlay for the OP upvote. LIVE drives the OP vote through the real
  // posts-cache patch (thread.myVote / thread.upvotes updated in place). The demo
  // thread is derived from the static mock and never enters a query cache, so
  // there is nothing to patch — this local toggle stands in for it. It is read
  // ONLY on the `demoMode` branches below, so it can never affect live rendering.
  const [demoOpVoted, setDemoOpVoted] = useState(false);
  const [localReplies, setLocalReplies] = useState<Reply[]>(
    threadData?.replies ?? [],
  );
  // Nested-replies UI state (collapse + inline reply composer targeting).
  // Keyed on the thread's stable slug — NOT `threadData?.replies` — so a
  // background refetch (which mints a fresh replies array with the same
  // content) doesn't wipe an in-progress inline draft; the state still resets
  // when the user navigates to a genuinely different thread.
  const nestedReplies = useNestedReplyComposer(threadData?.slug);
  const replyBoxRef = useRef<HTMLTextAreaElement>(null);

  const replyKey = (replyItem: Reply) => replyItem.id;

  // Every edit/delete/restore/history concern (state + mutations + handlers).
  const moderation = useThreadModeration({
    thread: threadData,
    demoMode,
    setLocalReplies,
    replyKey,
  });

  // Cast a vote on one reply — toggle off if the viewer already voted.
  // LIVE: `vote(postId,…)` patches the posts cache, which flows back into
  // `localReplies` (so the count + pressed state update in place).
  // DEMO: demo replies carry no backend `postId` and there is no posts cache to
  // patch, so we flip this reply's `myVote`/`reactions` directly in the local
  // list — the demo equivalent of the live cache patch. Never hits the network.
  const voteReply = (replyItem: Reply) => {
    if (demoMode) {
      setLocalReplies((prev) =>
        prev.map((item) =>
          item.id === replyItem.id
            ? {
                ...item,
                myVote: item.myVote ? 0 : 1,
                reactions: Math.max(0, item.reactions + (item.myVote ? -1 : 1)),
              }
            : item,
        ),
      );
      return;
    }
    if (replyItem.postId) vote(replyItem.postId, replyItem.myVote ? 0 : 1);
  };

  // Reset the local reply list whenever the thread changes (including once the
  // live fetch resolves and replies first appear, and after a vote patches the
  // posts cache). `nestedReplies` resets itself in step (see its own effect).
  useEffect(() => {
    // Resets the reply list when the thread's async fetch resolves or changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalReplies(threadData?.replies ?? []);
  }, [threadData?.replies]);

  // Clear the demo OP like overlay when navigating to a different thread (the
  // page component stays mounted across /thread/:id changes). Demo-only state;
  // in live it is never read, so resetting it is a harmless no-op.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDemoOpVoted(false);
  }, [threadData?.id]);

  const catMeta = CATS.find((c) => c.id === threadData?.category);

  const replyTree = useMemo(
    () => buildReplyTree(localReplies, sort),
    [localReplies, sort],
  );

  // Pressed-state map for the reply like controls, derived from the server's
  // `myVote` (live) rather than a local toggle — keyed by each reply's stable
  // identity so it recomputes when a vote patches the cache.
  const likedReplies = useMemo(
    () =>
      Object.fromEntries(
        // `replyKey` is a reply's `id`; inline it so this memo doesn't depend on
        // the per-render `replyKey` closure.
        localReplies.map((replyItem) => [replyItem.id, !!replyItem.myVote]),
      ),
    [localReplies],
  );

  function addReply(body: string, parentPostId: string | null = null) {
    // Belt-and-suspenders: the composer is already disabled when the thread is
    // locked, but a lock landing between load and submit still 403s server-side.
    if (threadData?.isLocked) {
      showToast(t("forum:locked.replyBlockedToast"), "error");
      return;
    }
    // Client-generated id; live mode reconciles against the server's real post
    // id once `postReply` resolves. Kept in scope so a failed persist can roll
    // the optimistic reply back out.
    const optimisticId = crypto.randomUUID();
    setLocalReplies((prev) => [
      ...prev,
      {
        // `parentPostId` nests this reply under an existing post, or null for a
        // top-level thread reply.
        id: optimisticId,
        parentPostId,
        avatar: profile.initials,
        background: "var(--plum)",
        color: "var(--cream)",
        name: "You",
        slug: profile.slug,
        photo: profile.photo,
        time: "Just now",
        body: [body],
        reactions: 0,
      },
    ]);
    if (parentPostId != null) nestedReplies.cancelReply();
    else setReply("");
    showToast(t("forum:threadPage.replyPostedToast"), "success");
    // Live mode persists; demo mode no-ops (local reply above is the record).
    // On failure (e.g. a 403 because the thread locked), drop the optimistic
    // reply and tell the member honestly rather than leaving a phantom post.
    postReply.mutate(
      { body, parentPostId },
      {
        onError: (error) => {
          setLocalReplies((prev) =>
            prev.filter((replyItem) => replyItem.id !== optimisticId),
          );
          const locked = error instanceof ApiError && error.status === 403;
          showToast(
            t(
              locked
                ? "forum:locked.replyBlockedToast"
                : "forum:threadPage.replyFailedToast",
            ),
            "error",
          );
        },
      },
    );
  }

  return {
    t,
    demoMode,
    threadData,
    loading,
    threadQuery,
    vote,
    bookmarked,
    toggleBookmark,
    sort,
    setSort,
    reply,
    setReply,
    demoOpVoted,
    setDemoOpVoted,
    localReplies,
    nestedReplies,
    replyBoxRef,
    replyKey,
    moderation,
    voteReply,
    catMeta,
    replyTree,
    likedReplies,
    addReply,
  };
}
