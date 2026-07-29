import { ReportReplyModal } from "./ReportReplyModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { EditOpModal } from "./EditOpModal";
import { ForumEditHistoryModal } from "./ForumEditHistoryModal";

/** The four thread-scoped modals (report / edit-OP / confirm-delete / edit
 * history). Each renders only when its state is set, so their local scroll-lock
 * lifecycles stay tied to being mounted — exactly as when they lived inline. */
export function ThreadPageModals({
  reportingAuthor,
  threadId,
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
}: {
  reportingAuthor: string | null;
  threadId: string;
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
}) {
  return (
    <>
      {reportingAuthor && (
        <ReportReplyModal
          authorName={reportingAuthor}
          subjectId={threadId}
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
    </>
  );
}
