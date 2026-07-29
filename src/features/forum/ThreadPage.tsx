import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useProfile } from "../../app/providers/useProfile";
import { CATS, type Reply, type ReplySortId } from "./forum.data";
import { useThread } from "./api/useForum";
import { useReply } from "./api/useForumMutations";
import { currentUser } from "../members/data/members";
import { ThreadOpCard } from "./ThreadOpCard";
import { ReplySortBar, ThreadReplies } from "./ThreadReplies";
import { ThreadComposer } from "./ThreadComposer";
import { ThreadTopbar } from "./ThreadTopbar";
import { ThreadNotFoundState } from "./ThreadNotFoundState";
import { ThreadPageModals } from "./ThreadPageModals";
import { deriveOpView, useThreadModeration } from "./useThreadModeration";
import styles from "./ThreadPage.module.css";

export function ThreadPage() {
  const simLoading = useSimulatedLoad();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();
  // The logged-in member, mode-aware: the real signed-in user in live mode, the
  // mock persona in demo. Used for the optimistic "You" reply so live never
  // borrows the demo persona's avatar/initials.
  const { profile } = useProfile();
  // The route param is the backend slug in live mode, the numeric mock id in
  // demo. Detail source: demo returns the scripted mock, live fetches meta + a
  // cursor page of posts (further pages append via the "Load more" button).
  const { id: routeParam = "" } = useParams();
  const threadQuery = useThread(routeParam);
  // NEVER fall back to the mock registry here — that leaked demo threads into
  // live mode. Live simply has no thread until the fetch resolves (or 404s).
  // `threadData` is the optional pre-guard binding; below the `!threadData`
  // early return it is aliased to a non-optional `thread`.
  const threadData = threadQuery.thread;
  const postReply = useReply(threadData?.slug);
  const loading = demoMode ? simLoading : threadQuery.isLoading;

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [sort, setSort] = useState<ReplySortId>("oldest");
  const [reply, setReply] = useState("");
  const [localReplies, setLocalReplies] = useState<Reply[]>(
    threadData?.replies ?? [],
  );
  // Per-reply like toggles, keyed by a stable identity (replies have no id).
  const [likedReplies, setLikedReplies] = useState<Record<string, boolean>>({});
  const replyBoxRef = useRef<HTMLTextAreaElement>(null);

  const replyKey = (r: Reply) => `${r.name}|${r.time}|${r.body[0] ?? ""}`;

  // Every edit/delete/restore/history concern (state + mutations + handlers).
  const moderation = useThreadModeration({
    thread: threadData,
    demoMode,
    setLocalReplies,
    replyKey,
  });

  const toggleReplyLike = (r: Reply) => {
    const key = replyKey(r);
    setLikedReplies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset the local reply list and per-reply likes whenever the thread changes
  // (including once the live fetch resolves and replies first appear).
  useEffect(() => {
    // Resets the reply list when the thread's async fetch resolves or changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalReplies(threadData?.replies ?? []);
    setLikedReplies({});
  }, [threadData?.replies]);

  const catMeta = CATS.find((c) => c.id === threadData?.category);

  const replies = useMemo(() => {
    if (sort === "newest") return [...localReplies].reverse();
    if (sort === "mostHelpful")
      return [...localReplies].sort(
        (a, b) =>
          Number(b.helpful ?? 0) - Number(a.helpful ?? 0) ||
          b.reactions - a.reactions,
      );
    return localReplies;
  }, [localReplies, sort]);

  function addReply(body: string) {
    setLocalReplies((prev) => [
      ...prev,
      {
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
    setReply("");
    showToast(t("forum:threadPage.replyPostedToast"), "success");
    // Live mode persists; demo mode no-ops (local reply above is the record).
    postReply.mutate(body);
  }

  // Live mode has no thread until the fetch resolves — skeleton, then a real
  // "not found" state. Demo always has a thread, so this branch is live-only.
  if (!threadData) return <ThreadNotFoundState loading={loading} />;

  // Past the guard the thread is resolved — a non-optional alias so the OP
  // permission logic below can use it without optional-chaining.
  const thread = threadData;

  // In demo there are no server flags; ownership is the demo persona. In live,
  // permission flags come only from the DTO (already on the view-model).
  const demoOwns = (person: { slug?: string; name?: string }) =>
    demoMode && (person.slug === currentUser.slug || person.name === "You");

  const ownsOp = demoOwns({ slug: thread.author.slug, name: thread.author.name });
  const {
    opDeleted,
    opCanEdit,
    opCanDelete,
    opCanRestore,
    opCanViewHistory,
    opTitle,
    opBody,
    opEditedAt,
  } = deriveOpView(thread, demoMode, ownsOp, moderation.opOverride);

  return (
    <PageShell>
      <ThreadTopbar categoryName={catMeta ? t(catMeta.nameKey) : undefined} />

      <section className="wrap">
        <div className={styles.layout}>
          <ThreadOpCard
            thread={thread}
            title={opTitle}
            body={opBody}
            editedAt={opEditedAt}
            deleted={opDeleted}
            liked={liked}
            setLiked={setLiked}
            bookmarked={bookmarked}
            setBookmarked={setBookmarked}
            onReport={() => moderation.setReportingAuthor(thread.author.name)}
            canEdit={opCanEdit}
            canDelete={opCanDelete}
            canRestore={opCanRestore}
            canViewHistory={opCanViewHistory}
            onEdit={() => {
              moderation.setEditingOpInitialBody(opBody.join("\n"));
              moderation.setEditingOp(true);
            }}
            onDelete={() => moderation.onOpDelete(thread.opPostId)}
            onRestore={() => moderation.doRestorePost(thread.opPostId ?? "", true)}
            onHistory={() =>
              thread.opPostId && moderation.setHistoryPostId(thread.opPostId)
            }
          />

          <ReplySortBar
            count={localReplies.length}
            sort={sort}
            setSort={setSort}
          />

          <ThreadReplies
            loading={loading}
            replies={replies}
            replyKey={replyKey}
            likedReplies={likedReplies}
            toggleReplyLike={toggleReplyLike}
            onFocusComposer={() => replyBoxRef.current?.focus()}
            hasNextPage={threadQuery.hasNextPage}
            fetchNextPage={threadQuery.fetchNextPage}
            isFetchingNextPage={threadQuery.isFetchingNextPage}
            demoMode={demoMode}
            demoOwns={demoOwns}
            editingReplyPostId={moderation.editingReplyPostId}
            onStartEdit={(replyItem) =>
              moderation.setEditingReplyPostId(
                replyItem.postId ?? replyKey(replyItem),
              )
            }
            onCancelEdit={() => moderation.setEditingReplyPostId(null)}
            onSaveEdit={moderation.saveReplyEdit}
            onDelete={moderation.onReplyDelete}
            onRestore={(replyItem) =>
              replyItem.postId &&
              moderation.doRestorePost(replyItem.postId, false)
            }
            onHistory={(replyItem) =>
              replyItem.postId && moderation.setHistoryPostId(replyItem.postId)
            }
          />

          <ThreadComposer
            authorName={thread.author.name}
            reply={reply}
            setReply={setReply}
            onPost={addReply}
            textareaRef={replyBoxRef}
          />
        </div>
      </section>

      <ThreadPageModals
        reportingAuthor={moderation.reportingAuthor}
        threadId={String(thread.id)}
        onCloseReport={() => moderation.setReportingAuthor(null)}
        editingOp={moderation.editingOp}
        opTitle={opTitle}
        editingOpInitialBody={moderation.editingOpInitialBody}
        editBusy={moderation.editBusy}
        onSaveOp={moderation.saveOpEdit}
        onCloseOp={() => moderation.setEditingOp(false)}
        confirmDelete={moderation.confirmDelete}
        deleteBusy={moderation.deleteBusy}
        onConfirmDelete={() =>
          moderation.confirmDelete &&
          moderation.doDeletePost(
            moderation.confirmDelete.postId,
            moderation.confirmDelete.isOp,
          )
        }
        onCloseDelete={() => moderation.setConfirmDelete(null)}
        historyPostId={moderation.historyPostId}
        onCloseHistory={() => moderation.setHistoryPostId(null)}
      />
    </PageShell>
  );
}
