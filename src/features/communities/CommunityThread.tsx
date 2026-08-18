import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { PostActionsMenu } from "../forum/PostActionsMenu";
import { ConfirmDeleteModal } from "../forum/ConfirmDeleteModal";
import { ReportReplyModal } from "../forum/ReportReplyModal";
import type { Reply, Thread as ThreadData } from "./communityDetails";
import { AV_CLASS } from "./communityAvatar";
import { CommunityThreadHead } from "./CommunityThreadHead";
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
  const [historyTarget, setHistoryTarget] = useState<HistoryTarget | null>(null);
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

  const loadedMoreReplies = repliesPaging.extraReplies.map(
    replyDtoToThreadReply,
  );
  const replies: Reply[] = [
    ...data.replies,
    ...loadedMoreReplies,
    ...extraReplies,
  ].map((item) =>
    item.id && replyOverrides[item.id]
      ? { ...item, ...replyOverrides[item.id] }
      : item,
  );

  function toggleVote() {
    const next = !voted;
    setVoted(next);
    if (demoMode || !data.id) return;
    if (next) react.mutate({ id: data.id, key: "heart" }, { onError });
    else unreact.mutate({ id: data.id, key: "heart" }, { onError });
  }

  function postReply() {
    const text = replyText.trim();
    if (!text) return;
    setExtraReplies((prev) => [
      ...prev,
      { id: nextOptimisticReplyId(), initials: "Me", name: "You", tint: "plum", text },
    ]);
    setReplyText("");
    showToast(t("communities:detail.thread.replyToast"), "success");
    if (demoMode || !data.id) return;
    // Live mode keeps the refetched row as its record, not the optimistic
    // copy — clear extraReplies once the mutation settles so the reply
    // doesn't render twice (optimistic + refetched-from-invalidation).
    reply.mutate(
      { id: data.id, text },
      { onSuccess: () => setExtraReplies([]), onError },
    );
  }

  function saveOpEdit(next: string) {
    setEditingOp(false);
    if (demoMode) {
      setOpOverride((prev) => ({
        ...prev,
        post: next,
        editedAt: new Date().toISOString(),
      }));
    } else if (data.id) {
      updatePost.mutate({ id: data.id, dto: { body: next } }, { onError });
    }
    showToast(t("communities:detail.thread.editSavedToast"), "success");
  }

  function saveReplyEdit(replyId: string, next: string) {
    setEditingReplyId(null);
    if (demoMode) {
      setReplyOverrides((prev) => ({
        ...prev,
        [replyId]: { ...prev[replyId], text: next, editedAt: new Date().toISOString() },
      }));
    } else if (data.id) {
      editReply.mutate(
        { postId: data.id, replyId, text: next },
        { onError },
      );
    }
    showToast(t("communities:detail.thread.editSavedToast"), "success");
  }

  function runDelete(target: DeleteTarget) {
    setConfirmDelete(null);
    if (target.kind === "post") {
      if (demoMode) setOpOverride((prev) => ({ ...prev, deleted: true }));
      else if (data.id) deletePost.mutate({ id: data.id }, { onError });
    } else if (demoMode) {
      setReplyOverrides((prev) => ({
        ...prev,
        [target.replyId]: { ...prev[target.replyId], deleted: true },
      }));
    } else if (data.id) {
      deleteReply.mutate({ postId: data.id, replyId: target.replyId }, { onError });
    }
    showToast(t("communities:detail.thread.deletedToast"), "success");
  }

  function runRestorePost() {
    if (demoMode) setOpOverride((prev) => ({ ...prev, deleted: false }));
    else if (data.id) restorePost.mutate({ id: data.id }, { onError });
    showToast(t("communities:detail.thread.restoredToast"), "success");
  }

  function runTogglePinOp() {
    const next = !opPinned;
    if (demoMode) {
      setOpOverride((prev) => ({ ...prev, pinned: next }));
    } else if (data.id) {
      updatePost.mutate({ id: data.id, dto: { pinned: next } }, { onError });
    }
    showToast(
      t(
        next
          ? "communities:common.pinnedToast"
          : "communities:common.unpinnedToast",
      ),
      "success",
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
    } else if (data.id) {
      restoreReply.mutate({ postId: data.id, replyId }, { onError });
    }
    showToast(t("communities:detail.thread.restoredToast"), "success");
  }

  return {
    t,
    demoMode,
    deletePost,
    deleteReply,
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
    deletePost,
    deleteReply,
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
        open={open}
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
              <InlineTextEditor
                initial={opBody}
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
                key={threadReply.id ?? `${threadReply.name}:${threadReply.text}`}
                reply={threadReply}
                demoMode={demoMode}
                editing={!!threadReply.id && editingReplyId === threadReply.id}
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
            {frozen ? (
              <div className={styles.replyBar}>
                <CommunityFrozenComposerNotice />
              </div>
            ) : (
              <div className={styles.replyBar}>
                <div className={[styles.rAv, styles.tPlum].join(" ")}>Me</div>
                <MentionTextarea
                  className={styles.replyTa}
                  rows={1}
                  placeholder={t("communities:detail.thread.replyPlaceholder")}
                  value={replyText}
                  onChange={setReplyText}
                />
                <Button
                  variant="primary"
                  onClick={postReply}
                  style={{ padding: "9px 16px", fontSize: 13 }}
                >
                  {t("communities:detail.thread.replyCta")}
                </Button>
              </div>
            )}
          </div>
        </MentionNamesProvider>
      )}
      {confirmDelete && (
        <ConfirmDeleteModal
          busy={deletePost.isPending || deleteReply.isPending}
          onConfirm={() => runDelete(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
      {historyTarget && (
        <CommunityHistoryModal
          slug={slug}
          postId={historyTarget.postId}
          replyId={historyTarget.replyId}
          onClose={() => setHistoryTarget(null)}
        />
      )}
      {reportTarget && (
        <ReportReplyModal
          authorName={reportTarget.authorName}
          subjectId={reportTarget.subjectId}
          subjectType={reportTarget.subjectType}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}

function InlineTextEditor({
  initial,
  onCancel,
  onSave,
}: {
  initial: string;
  onCancel: () => void;
  onSave: (next: string) => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initial);
  const trimmed = value.trim();
  return (
    <div className={styles.inlineEdit}>
      <MentionTextarea
        className={styles.inlineTa}
        aria-label={t("communities:detail.thread.editAria")}
        value={value}
        onChange={setValue}
        rows={3}
      />
      <div className={styles.inlineActions}>
        <Button variant="ghost" onClick={onCancel} style={{ padding: "6px 12px", fontSize: 13 }}>
          {t("communities:detail.thread.editCancel")}
        </Button>
        <Button
          variant="primary"
          disabled={!trimmed || trimmed === initial}
          onClick={() => onSave(trimmed)}
          style={{ padding: "6px 12px", fontSize: 13 }}
        >
          {t("communities:detail.thread.editSave")}
        </Button>
      </div>
    </div>
  );
}

function ThreadReplyRow({
  reply,
  demoMode,
  editing,
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
  editing: boolean;
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
        ) : editing ? (
          <InlineTextEditor
            initial={reply.text}
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
