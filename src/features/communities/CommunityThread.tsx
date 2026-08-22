import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { PostActionsMenu } from "../forum/PostActionsMenu";
import { ConfirmDeleteModal } from "../forum/ConfirmDeleteModal";
import { ReportReplyModal } from "../forum/ReportReplyModal";
import type { Person, Reply, Thread as ThreadData } from "./communityDetails";
import { AV_CLASS } from "./communityAvatar";
import { viewerPerson } from "./communityPeople";
import { CommunityThreadHead } from "./CommunityThreadHead";
import { CommunityInlineTextEditor } from "./CommunityInlineTextEditor";
import { CommunityFrozenComposerNotice } from "./CommunityFrozenComposerNotice";
import {
  useReact,
  useUnreact,
  useReply,
  useUpdatePost,
  useDeleteCommunityPost,
  useRestoreCommunityPost,
  useEditCommunityReply,
  useDeleteCommunityReply,
  useRestoreCommunityReply,
} from "./api/useCommunityMutations";
import { useCommunityReplies } from "./api/useCommunityReplies";
import { replyDtoToThreadReply } from "./api/communities.adapters";
import { CommunityHistoryModal } from "./CommunityHistoryModal";
import { MentionText } from "../../shared/mentions/MentionText";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import { MentionNamesProvider } from "../../shared/mentions/MentionNames";
import styles from "./CommunityDetailPage.module.css";

// The history modal target: the OP post, or a specific reply.
type HistoryTarget = { postId: string; replyId?: string };
// A pending delete confirmation: the OP post, or a specific reply.
type DeleteTarget = { kind: "post" } | { kind: "reply"; replyId: string };
// The content currently being reported — the OP post or a specific reply.
// Carries the real backend post/reply id as `subjectId`, matching the generic
// `POST /reports` contract (`ReportReplyModal` already speaks this shape).
type ReportTarget = {
  authorName: string;
  subjectId: string;
  subjectType: "post" | "reply";
};

// Synthetic ids for optimistic replies (both demo and live), so the reply's
// actions menu (keyed by id via replyOverrides / DTO flags) can ever apply
// to it instead of silently no-op'ing.
let optimisticReplyIdCounter = 0;
function nextOptimisticReplyId(): string {
  optimisticReplyIdCounter += 1;
  return crypto.randomUUID?.() ?? `local-${optimisticReplyIdCounter}`;
}

// All state, derived values, and mutation handlers for a thread. Pulled out
// of the CommunityThread component (which is layout/JSX only) so that
// component stays under the repo's 200-line-per-component limit. This is a
// plain hook (returns no JSX), not a component, so the limit doesn't apply
// to it directly.
function useCommunityThreadState(
  data: ThreadData,
  slug: string,
  canModerate: boolean,
  isMember: boolean,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const react = useReact(slug);
  const unreact = useUnreact(slug);
  const reply = useReply(slug);
  const updatePost = useUpdatePost(slug);
  const deletePost = useDeleteCommunityPost(slug);
  const restorePost = useRestoreCommunityPost(slug);
  const editReply = useEditCommunityReply(slug);
  const deleteReply = useDeleteCommunityReply(slug);
  const restoreReply = useRestoreCommunityReply(slug);
  // Replies beyond the post's embedded preview (`data.replies`) — inert until
  // "Load more replies" is clicked once (see `useCommunityReplies`).
  const repliesPaging = useCommunityReplies(
    slug,
    data.id,
    data.replyCount,
    data.replies.length,
  );

  const [open, setOpen] = useState(false);
  const [voted, setVoted] = useState(!!data.voted);
  const [replyText, setReplyText] = useState("");
  const [extraReplies, setExtraReplies] = useState<Reply[]>([]);

  // Demo-only local overrides (live refetches after each mutation instead).
  const [editingOp, setEditingOp] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DeleteTarget | null>(null);
  const [historyTarget, setHistoryTarget] = useState<HistoryTarget | null>(
    null,
  );
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [opOverride, setOpOverride] = useState<{
    post?: string;
    deleted?: boolean;
    editedAt?: string | null;
    pinned?: boolean;
  }>({});
  const [replyOverrides, setReplyOverrides] = useState<
    Record<string, Partial<Reply>>
  >({});

  const onError = () => showToast(t("communities:common.error"), "error");

  // OP effective values + flags. Live: DTO flags on `data`. Demo: the "You"
  // persona (the discussion widget authors new threads as { name: "You" }).
  const opOwned = demoMode && data.author.name === "You";
  // Live "is this my post" check — no DTO flag says so directly (`canEdit` is
  // also true for a mod editing someone else's post), so compare the viewer's
  // own slug to the author's. Drives hiding "Report" on your own post.
  const opIsMine = demoMode
    ? opOwned
    : !!user?.profile.slug && user.profile.slug === data.author.slug;
  const opDeleted = demoMode ? !!opOverride.deleted : !!data.deleted;
  const opPinned = demoMode
    ? (opOverride.pinned ?? !!data.pinned)
    : !!data.pinned;
  const opBody = demoMode ? (opOverride.post ?? data.post) : data.post;
  const opEditedAt = demoMode
    ? (opOverride.editedAt ?? data.editedAt ?? null)
    : (data.editedAt ?? null);
  const opCanEdit = demoMode ? opOwned && !opDeleted : !!data.canEdit;
  const opCanDelete = demoMode ? opOwned && !opDeleted : !!data.canDelete;
  const opCanRestore = demoMode ? opOwned && opDeleted : !!data.canRestore;
  const opCanViewHistory = demoMode ? false : !!data.canViewHistory;
  // Pin/unpin is owner/mod-only, regardless of who authored the post.
  const opCanPin = canModerate && !opDeleted;
  // Report is offered to any member on content that isn't their own.
  const opCanReport = isMember && !opIsMine && !opDeleted;

  const loadedMoreReplies = repliesPaging.extraReplies.map((dto) =>
    replyDtoToThreadReply(dto, t),
  );
  // Server rows first, the viewer's own just-posted replies last, deduped by
  // id keeping the first occurrence: a reply the author keeps locally (see
  // `postReply`) disappears from `extraReplies` the moment the refetched
  // server list carries the same id, so it never renders twice.
  const seenReplyIds = new Set<string>();
  const replies: Reply[] = [
    ...data.replies,
    ...loadedMoreReplies,
    ...extraReplies,
  ]
    .filter((item) => {
      if (!item.id) return true;
      if (seenReplyIds.has(item.id)) return false;
      seenReplyIds.add(item.id);
      return true;
    })
    .map((item) =>
      item.id && replyOverrides[item.id]
        ? { ...item, ...replyOverrides[item.id] }
        : item,
    );

  function toggleVote() {
    const next = !voted;
    setVoted(next);
    if (demoMode || !data.id) return;
    // A refused vote puts the arrow (and the count derived from it) back where
    // it was; before this the toast said "something went wrong" while the UI
    // kept showing a vote the server never recorded.
    const callbacks = {
      onError: () => {
        setVoted(!next);
        onError();
      },
    };
    if (next) react.mutate({ id: data.id, key: "heart" }, callbacks);
    else unreact.mutate({ id: data.id, key: "heart" }, callbacks);
  }

  function postReply() {
    const text = replyText.trim();
    if (!text) return;
    const optimisticId = nextOptimisticReplyId();
    const viewer = viewerPerson(user);
    setExtraReplies((prev) => [
      ...prev,
      {
        id: optimisticId,
        initials: viewer?.initials ?? "?",
        name: viewer?.name ?? "",
        tint: viewer?.tint ?? "plum",
        authorSlug: viewer?.slug,
        createdAt: new Date().toISOString(),
        text,
      },
    ]);
    setReplyText("");
    if (demoMode || !data.id) {
      showToast(t("communities:detail.thread.replyToast"), "success");
      return;
    }
    reply.mutate(
      { id: data.id, text },
      {
        // Swap the optimistic copy for the stored reply rather than dropping
        // it: a new reply is the NEWEST one, so on a thread with more replies
        // than the post's bounded preview it sits outside that window and the
        // refetch would not bring it back — the author would watch their own
        // reply vanish. `replies` dedupes by id, so this copy falls away by
        // itself once the server list carries it.
        onSuccess: (dto) => {
          if (dto) {
            const stored = replyDtoToThreadReply(dto, t);
            setExtraReplies((prev) =>
              prev.map((item) => (item.id === optimisticId ? stored : item)),
            );
          }
          showToast(t("communities:detail.thread.replyToast"), "success");
        },
        // Roll the optimistic reply back and hand the words back to the
        // composer so nothing typed is lost.
        onError: () => {
          setExtraReplies((prev) =>
            prev.filter((item) => item.id !== optimisticId),
          );
          setReplyText(text);
          onError();
        },
      },
    );
  }

  function saveOpEdit(next: string) {
    if (demoMode) {
      setEditingOp(false);
      setOpOverride((prev) => ({
        ...prev,
        post: next,
        editedAt: new Date().toISOString(),
      }));
      showToast(t("communities:detail.thread.editSavedToast"), "success");
      return;
    }
    if (!data.id) {
      setEditingOp(false);
      return;
    }
    // The editor stays open (and busy) until the PATCH lands, so a failure
    // hands the edit back instead of confirming a save that never happened.
    updatePost.mutate(
      { id: data.id, dto: { body: next } },
      {
        onSuccess: () => {
          setEditingOp(false);
          showToast(t("communities:detail.thread.editSavedToast"), "success");
        },
        onError,
      },
    );
  }

  function saveReplyEdit(replyId: string, next: string) {
    if (demoMode) {
      setEditingReplyId(null);
      setReplyOverrides((prev) => ({
        ...prev,
        [replyId]: {
          ...prev[replyId],
          text: next,
          editedAt: new Date().toISOString(),
        },
      }));
      showToast(t("communities:detail.thread.editSavedToast"), "success");
      return;
    }
    if (!data.id) {
      setEditingReplyId(null);
      return;
    }
    editReply.mutate(
      { postId: data.id, replyId, text: next },
      {
        onSuccess: () => {
          setEditingReplyId(null);
          showToast(t("communities:detail.thread.editSavedToast"), "success");
        },
        onError,
      },
    );
  }

  function runDelete(target: DeleteTarget) {
    if (demoMode) {
      setConfirmDelete(null);
      if (target.kind === "post") {
        setOpOverride((prev) => ({ ...prev, deleted: true }));
      } else {
        setReplyOverrides((prev) => ({
          ...prev,
          [target.replyId]: { ...prev[target.replyId], deleted: true },
        }));
      }
      showToast(t("communities:detail.thread.deletedToast"), "success");
      return;
    }
    if (!data.id) {
      setConfirmDelete(null);
      return;
    }
    // The confirm modal stays mounted (and busy) until the delete resolves,
    // so the "Deleted" toast only ever follows a delete that happened.
    const callbacks = {
      onSuccess: () => {
        setConfirmDelete(null);
        showToast(t("communities:detail.thread.deletedToast"), "success");
      },
      onError: () => {
        setConfirmDelete(null);
        onError();
      },
    };
    if (target.kind === "post") {
      deletePost.mutate({ id: data.id }, callbacks);
    } else {
      deleteReply.mutate(
        { postId: data.id, replyId: target.replyId },
        callbacks,
      );
    }
  }

  function runRestorePost() {
    if (demoMode) {
      setOpOverride((prev) => ({ ...prev, deleted: false }));
      showToast(t("communities:detail.thread.restoredToast"), "success");
      return;
    }
    if (!data.id) return;
    restorePost.mutate(
      { id: data.id },
      {
        onSuccess: () =>
          showToast(t("communities:detail.thread.restoredToast"), "success"),
        onError,
      },
    );
  }

  function runTogglePinOp() {
    const next = !opPinned;
    const pinToast = () =>
      showToast(
        t(
          next
            ? "communities:common.pinnedToast"
            : "communities:common.unpinnedToast",
        ),
        "success",
      );
    if (demoMode) {
      setOpOverride((prev) => ({ ...prev, pinned: next }));
      pinToast();
      return;
    }
    if (!data.id) return;
    updatePost.mutate(
      { id: data.id, dto: { pinned: next } },
      { onSuccess: pinToast, onError },
    );
  }

  function onReportOp() {
    if (!data.id) return;
    setReportTarget({
      authorName: data.author.name,
      subjectId: data.id,
      subjectType: "post",
    });
  }

  // A reply belongs to the viewer when its author slug matches the session
  // (live) or it's the demo "You" persona — the same own-content check as
  // `opIsMine`, applied per-reply since replies don't share the OP's flags.
  function replyIsMine(reply: Reply): boolean {
    return demoMode
      ? reply.name === "You"
      : !!user?.profile.slug && user.profile.slug === reply.authorSlug;
  }

  function canReportReply(reply: Reply): boolean {
    return isMember && !replyIsMine(reply) && !reply.deleted;
  }

  function onReportReply(reply: Reply) {
    if (!reply.id) return;
    setReportTarget({
      authorName: reply.name,
      subjectId: reply.id,
      subjectType: "reply",
    });
  }

  function runRestoreReply(replyId: string) {
    if (demoMode) {
      setReplyOverrides((prev) => ({
        ...prev,
        [replyId]: { ...prev[replyId], deleted: false },
      }));
      showToast(t("communities:detail.thread.restoredToast"), "success");
      return;
    }
    if (!data.id) return;
    restoreReply.mutate(
      { postId: data.id, replyId },
      {
        onSuccess: () =>
          showToast(t("communities:detail.thread.restoredToast"), "success"),
        onError,
      },
    );
  }

  return {
    t,
    demoMode,
    viewer: viewerPerson(user),
    deletePost,
    deleteReply,
    // In-flight flags, so the UI keeps showing "working on it" between the
    // click and the server's answer instead of confirming early.
    isReplyPending: reply.isPending,
    isSavingOpEdit: updatePost.isPending,
    isSavingReplyEdit: editReply.isPending,
    open,
    setOpen,
    voted,
    replyText,
    setReplyText,
    editingOp,
    setEditingOp,
    editingReplyId,
    setEditingReplyId,
    confirmDelete,
    setConfirmDelete,
    historyTarget,
    setHistoryTarget,
    reportTarget,
    setReportTarget,
    opDeleted,
    opPinned,
    opBody,
    opEditedAt,
    opCanEdit,
    opCanDelete,
    opCanRestore,
    opCanViewHistory,
    opCanPin,
    opCanReport,
    replies,
    repliesPaging,
    toggleVote,
    postReply,
    saveOpEdit,
    saveReplyEdit,
    runDelete,
    runRestorePost,
    runRestoreReply,
    runTogglePinOp,
    onReportOp,
    onReportReply,
    canReportReply,
  };
}

export function CommunityThread({
  data,
  slug,
  canModerate = false,
  isMember = false,
  frozen = false,
}: {
  data: ThreadData;
  slug: string;
  /** Owner/mod — gates the pin/unpin action. Defaults false for any caller
   *  that hasn't threaded the viewer's role through yet. */
  canModerate?: boolean;
  /** Gates the "Report" action (never on the viewer's own content). */
  isMember?: boolean;
  /** True while the community is auto-frozen — replaces the reply bar with an
   *  explanation instead of leaving an input that would just 403. */
  frozen?: boolean;
}) {
  const {
    t,
    demoMode,
    viewer,
    deletePost,
    deleteReply,
    isReplyPending,
    isSavingOpEdit,
    isSavingReplyEdit,
    open,
    setOpen,
    voted,
    replyText,
    setReplyText,
    editingOp,
    setEditingOp,
    editingReplyId,
    setEditingReplyId,
    confirmDelete,
    setConfirmDelete,
    historyTarget,
    setHistoryTarget,
    reportTarget,
    setReportTarget,
    opDeleted,
    opPinned,
    opBody,
    opEditedAt,
    opCanEdit,
    opCanDelete,
    opCanRestore,
    opCanViewHistory,
    opCanPin,
    opCanReport,
    replies,
    repliesPaging,
    toggleVote,
    postReply,
    saveOpEdit,
    saveReplyEdit,
    runDelete,
    runRestorePost,
    runRestoreReply,
    runTogglePinOp,
    onReportOp,
    onReportReply,
    canReportReply,
  } = useCommunityThreadState(data, slug, canModerate, isMember);

  return (
    <div className={styles.thread}>
      <CommunityThreadHead
        data={data}
        isOpen={open}
        onToggleOpen={() => setOpen((value) => !value)}
        voted={voted}
        onToggleVote={toggleVote}
        opDeleted={opDeleted}
        opEditedAt={opEditedAt}
        opPinned={opPinned}
        opCanEdit={opCanEdit}
        opCanDelete={opCanDelete}
        opCanRestore={opCanRestore}
        opCanViewHistory={opCanViewHistory}
        opCanPin={opCanPin}
        opCanReport={opCanReport}
        onEditOp={() => {
          setOpen(true);
          setEditingOp(true);
        }}
        onDeleteOp={() => setConfirmDelete({ kind: "post" })}
        onRestoreOp={runRestorePost}
        onHistoryOp={() => data.id && setHistoryTarget({ postId: data.id })}
        onTogglePinOp={runTogglePinOp}
        onReportOp={onReportOp}
      />
      {open && (
        <MentionNamesProvider>
          <div className={styles.thBody}>
            {opDeleted ? (
              <p className={styles.tombstone}>
                {t("communities:detail.thread.tombstone")}
              </p>
            ) : editingOp ? (
              <CommunityInlineTextEditor
                initial={opBody}
                isBusy={isSavingOpEdit}
                onCancel={() => setEditingOp(false)}
                onSave={saveOpEdit}
              />
            ) : (
              <p className={styles.postText}>
                <MentionText text={opBody} />
              </p>
            )}
            {replies.map((threadReply) => (
              <ThreadReplyRow
                key={
                  threadReply.id ?? `${threadReply.name}:${threadReply.text}`
                }
                reply={threadReply}
                demoMode={demoMode}
                isEditing={
                  !!threadReply.id && editingReplyId === threadReply.id
                }
                isSavingEdit={isSavingReplyEdit}
                canReport={canReportReply(threadReply)}
                onStartEdit={() =>
                  threadReply.id && setEditingReplyId(threadReply.id)
                }
                onCancelEdit={() => setEditingReplyId(null)}
                onSaveEdit={(text) =>
                  threadReply.id && saveReplyEdit(threadReply.id, text)
                }
                onDelete={() =>
                  threadReply.id &&
                  setConfirmDelete({ kind: "reply", replyId: threadReply.id })
                }
                onRestore={() =>
                  threadReply.id && runRestoreReply(threadReply.id)
                }
                onHistory={() =>
                  threadReply.id &&
                  data.id &&
                  setHistoryTarget({ postId: data.id, replyId: threadReply.id })
                }
                onReport={() => onReportReply(threadReply)}
              />
            ))}
            {repliesPaging.hasMore && (
              <div className={styles.loadMoreReplies}>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={repliesPaging.isLoadingMore}
                  onClick={repliesPaging.loadMore}
                  style={{ padding: "6px 14px", fontSize: 13 }}
                >
                  {repliesPaging.isLoadingMore
                    ? t("communities:detail.thread.loadingMoreReplies")
                    : t("communities:detail.thread.loadMoreRepliesCta")}
                </Button>
              </div>
            )}
            {/* A visitor can read the thread but never gets a composer: the
                POST would 403, and before this gate they could type a reply,
                see a "Reply posted" toast, and then an error toast on top of
                an optimistic reply that stayed on screen. */}
            {isMember &&
              (frozen ? (
                <div className={styles.replyBar}>
                  <CommunityFrozenComposerNotice />
                </div>
              ) : (
                <ThreadReplyBar
                  viewer={viewer}
                  value={replyText}
                  onChange={setReplyText}
                  onPost={postReply}
                  isPending={isReplyPending}
                />
              ))}
          </div>
        </MentionNamesProvider>
      )}
      <ThreadModals
        slug={slug}
        confirmDelete={confirmDelete}
        isDeletePending={deletePost.isPending || deleteReply.isPending}
        onConfirmDelete={runDelete}
        onCloseDelete={() => setConfirmDelete(null)}
        historyTarget={historyTarget}
        onCloseHistory={() => setHistoryTarget(null)}
        reportTarget={reportTarget}
        onCloseReport={() => setReportTarget(null)}
      />
    </div>
  );
}

/** The three dialogs a thread can raise (confirm delete, edit history, report),
 *  lifted out of `CommunityThread` so that component stays under the repo's
 *  200-line limit. */
function ThreadModals({
  slug,
  confirmDelete,
  isDeletePending,
  onConfirmDelete,
  onCloseDelete,
  historyTarget,
  onCloseHistory,
  reportTarget,
  onCloseReport,
}: {
  slug: string;
  confirmDelete: DeleteTarget | null;
  isDeletePending: boolean;
  onConfirmDelete: (target: DeleteTarget) => void;
  onCloseDelete: () => void;
  historyTarget: HistoryTarget | null;
  onCloseHistory: () => void;
  reportTarget: ReportTarget | null;
  onCloseReport: () => void;
}) {
  return (
    <>
      {confirmDelete && (
        <ConfirmDeleteModal
          busy={isDeletePending}
          onConfirm={() => onConfirmDelete(confirmDelete)}
          onClose={onCloseDelete}
        />
      )}
      {historyTarget && (
        <CommunityHistoryModal
          slug={slug}
          postId={historyTarget.postId}
          replyId={historyTarget.replyId}
          onClose={onCloseHistory}
        />
      )}
      {reportTarget && (
        <ReportReplyModal
          authorName={reportTarget.authorName}
          subjectId={reportTarget.subjectId}
          subjectType={reportTarget.subjectType}
          onClose={onCloseReport}
        />
      )}
    </>
  );
}

/** The thread's own reply composer: avatar, mention-aware textarea, and a
 *  send button that stays disabled (and says so) while the reply is in
 *  flight. */
function ThreadReplyBar({
  viewer,
  value,
  onChange,
  onPost,
  isPending,
}: {
  /** The signed-in member, so the composer shows their own initials rather
   *  than a hardcoded chip. `null` while the session is still resolving. */
  viewer: Person | null;
  value: string;
  onChange: (next: string) => void;
  onPost: () => void;
  isPending: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.replyBar}>
      <div className={[styles.rAv, AV_CLASS[viewer?.tint ?? "plum"]].join(" ")}>
        {viewer?.initials ?? "?"}
      </div>
      <MentionTextarea
        className={styles.replyTa}
        rows={1}
        placeholder={t("communities:detail.thread.replyPlaceholder")}
        value={value}
        onChange={onChange}
      />
      <Button
        variant="primary"
        onClick={onPost}
        disabled={isPending}
        style={{ padding: "9px 16px", fontSize: 13 }}
      >
        {isPending
          ? t("communities:common.loading")
          : t("communities:detail.thread.replyCta")}
      </Button>
    </div>
  );
}

function ThreadReplyRow({
  reply,
  demoMode,
  isEditing,
  isSavingEdit,
  canReport,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onRestore,
  onHistory,
  onReport,
}: {
  reply: Reply;
  demoMode: boolean;
  isEditing: boolean;
  /** True while this row's edit is being saved. */
  isSavingEdit: boolean;
  canReport: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (text: string) => void;
  onDelete: () => void;
  onRestore: () => void;
  onHistory: () => void;
  onReport: () => void;
}) {
  const { t } = useTranslation();
  const owned = demoMode && reply.name === "You";
  const canEdit = demoMode ? owned && !reply.deleted : !!reply.canEdit;
  const canDelete = demoMode ? owned && !reply.deleted : !!reply.canDelete;
  const canRestore = demoMode ? owned && !!reply.deleted : !!reply.canRestore;
  const canViewHistory = demoMode ? false : !!reply.canViewHistory;

  return (
    <div className={styles.reply}>
      <div className={[styles.rAv, AV_CLASS[reply.tint]].join(" ")}>
        {reply.initials}
      </div>
      <div className={styles.rBody}>
        <div className={styles.rHead}>
          <span className={styles.rName}>{reply.name}</span>
          <span className={styles.rMenu}>
            <PostActionsMenu
              canEdit={canEdit}
              canDelete={canDelete}
              canRestore={canRestore}
              canViewHistory={canViewHistory}
              onEdit={onStartEdit}
              onDelete={onDelete}
              onRestore={onRestore}
              onHistory={onHistory}
              canReport={canReport}
              onReport={onReport}
            />
          </span>
        </div>
        {reply.deleted ? (
          <div className={styles.tombstone}>
            {t("communities:detail.thread.tombstone")}
          </div>
        ) : isEditing ? (
          <CommunityInlineTextEditor
            initial={reply.text}
            isBusy={isSavingEdit}
            onCancel={onCancelEdit}
            onSave={onSaveEdit}
          />
        ) : (
          <div className={styles.rText}>
            <MentionText text={reply.text} />
            {reply.editedAt && (
              <span className={styles.editedMark}>
                {" "}
                {t("communities:detail.thread.editedMark")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
