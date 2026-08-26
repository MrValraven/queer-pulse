import { ReportReplyModal } from "./ReportReplyModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { EditOpModal } from "./EditOpModal";
import { ForumEditHistoryModal } from "./ForumEditHistoryModal";
import { ThreadTagsModal } from "./ThreadTagsModal";
import { type ForumReportTarget } from "./useThreadModeration";

/** The five thread-scoped modals (report / edit-OP / confirm-delete / edit
 * history / edit-tags). Each renders only when its state is set, so their local
 * scroll-lock lifecycles stay tied to being mounted — exactly as when they
 * lived inline. */
export function ThreadPageModals({
  reportTarget,
  onCloseReport,
  editingOp,
  opTitle,
  editingOpInitialBody,
  editBusy,
  onSaveOp,
  onCloseOp,
  confirmDelete,
  deleteBusy,
  onConfirmDelete,
  onCloseDelete,
  historyPostId,
  onCloseHistory,
  isEditingTags,
  threadTags,
  isTagsSaving,
  onSaveTags,
  onCloseTags,
}: {
  reportTarget: ForumReportTarget | null;
  onCloseReport: () => void;
  editingOp: boolean;
  opTitle: string;
  editingOpInitialBody: string;
  editBusy: boolean;
  onSaveOp: (next: { title: string; body: string }) => void;
  onCloseOp: () => void;
  confirmDelete: { postId: string; isOp: boolean } | null;
  deleteBusy: boolean;
  onConfirmDelete: () => void;
  onCloseDelete: () => void;
  historyPostId: string | null;
  onCloseHistory: () => void;
  /** Tag re-filing (SOC-13), open to the thread's author and to moderators. */
  isEditingTags: boolean;
  threadTags: string[];
  isTagsSaving: boolean;
  onSaveTags: (tags: string[]) => void;
  onCloseTags: () => void;
}) {
  return (
    <>
      {reportTarget && (
        <ReportReplyModal
          authorName={reportTarget.authorName}
          subjectId={reportTarget.subjectId}
          subjectType={reportTarget.subjectType}
          onClose={onCloseReport}
        />
      )}
      {editingOp && (
        <EditOpModal
          initialTitle={opTitle}
          initialBody={editingOpInitialBody}
          busy={editBusy}
          onSave={onSaveOp}
          onClose={onCloseOp}
        />
      )}
      {confirmDelete && (
        <ConfirmDeleteModal
          busy={deleteBusy}
          onConfirm={onConfirmDelete}
          onClose={onCloseDelete}
        />
      )}
      {historyPostId && (
        <ForumEditHistoryModal
          postId={historyPostId}
          onClose={onCloseHistory}
        />
      )}
      {isEditingTags && (
        <ThreadTagsModal
          initialTags={threadTags}
          busy={isTagsSaving}
          onSave={onSaveTags}
          onClose={onCloseTags}
        />
      )}
    </>
  );
}
