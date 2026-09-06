import { ReportReplyModal } from "./ReportReplyModal";
import {
  ConfirmDeleteModal,
  type ConfirmDeleteSubject,
} from "./ConfirmDeleteModal";
import { EditOpModal } from "./EditOpModal";
import { ForumEditHistoryModal } from "./ForumEditHistoryModal";
import { MoveCategoryModal } from "./MoveCategoryModal";
import { ThreadTagsModal } from "./ThreadTagsModal";
import { type ForumReportTarget } from "./useThreadModeration";

/** The six thread-scoped modals (report / edit-OP / confirm-delete / edit
 * history / move-category / edit-tags). Each renders only when its state is
 * set, so their local scroll-lock lifecycles stay tied to being mounted —
 * exactly as when they lived inline. */
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
  confirmDeleteSubject,
  deleteBusy,
  onConfirmDelete,
  onCloseDelete,
  historyPostId,
  onCloseHistory,
  isMovingCategory,
  threadCategory,
  isCategoryMoveSaving,
  onSaveCategory,
  onCloseMoveCategory,
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
  /** Whether this confirmation is about ONE post or the WHOLE thread (PRD-160).
   *  The two promises are different, so the copy is too. */
  confirmDeleteSubject: ConfirmDeleteSubject;
  deleteBusy: boolean;
  onConfirmDelete: () => void;
  onCloseDelete: () => void;
  historyPostId: string | null;
  onCloseHistory: () => void;
  /** Re-filing this thread into another category (PRD-163). */
  isMovingCategory: boolean;
  threadCategory: string;
  isCategoryMoveSaving: boolean;
  onSaveCategory: (category: string) => void;
  onCloseMoveCategory: () => void;
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
          subject={confirmDeleteSubject}
          onConfirm={onConfirmDelete}
          onClose={onCloseDelete}
        />
      )}
      {isMovingCategory && (
        <MoveCategoryModal
          initialCategory={threadCategory}
          busy={isCategoryMoveSaving}
          onSave={onSaveCategory}
          onClose={onCloseMoveCategory}
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
