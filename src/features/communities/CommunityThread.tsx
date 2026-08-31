import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PostActionsMenu } from "../forum/PostActionsMenu";
import { ConfirmDeleteModal } from "../forum/ConfirmDeleteModal";
import { ReportReplyModal } from "../forum/ReportReplyModal";
import type { Person, Reply, Thread as ThreadData } from "./communityDetails";
import { AV_CLASS } from "./communityAvatar";
import { CommunityThreadHead } from "./CommunityThreadHead";
import { CommunityInlineTextEditor } from "./CommunityInlineTextEditor";
import { CommunityFrozenComposerNotice } from "./CommunityFrozenComposerNotice";
import { CommunityHistoryModal } from "./CommunityHistoryModal";
import { MentionText } from "../../shared/mentions/MentionText";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import { MentionNamesProvider } from "../../shared/mentions/MentionNames";
import { useCommunityThreadState } from "./useCommunityThreadState";
import type {
  DeleteTarget,
  HistoryTarget,
  ReportTarget,
} from "./communityThread.types";
import styles from "./CommunityDetailPage.module.css";

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
        aria-label={t("communities:detail.thread.replyAria")}
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
