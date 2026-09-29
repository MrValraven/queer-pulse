import { AdminGlossaryTermEditor } from "./AdminGlossaryTermEditor";
import { AdminGlossaryTermPreviewModal } from "./AdminGlossaryTermPreviewModal";
import { AdminGlossaryReviewModal } from "./AdminGlossaryReviewModal";
import { AdminGlossaryDeleteModal } from "./AdminGlossaryDeleteModal";
import type { AdminGlossaryDialogState } from "./useAdminGlossaryDialogs";

/**
 * Mounts whichever glossary dialog is open. Edit from the preview closes the
 * preview and opens the page's own editor on that term, so there is one
 * editor whichever way an editor reaches it.
 */
export function AdminGlossaryDialogs({
  dialogs,
}: {
  dialogs: AdminGlossaryDialogState;
}) {
  const {
    editorTarget,
    setEditorTarget,
    previewTarget,
    setPreviewTarget,
    reviewTarget,
    setReviewTarget,
    deleteTarget,
    setDeleteTarget,
  } = dialogs;

  return (
    <>
      {editorTarget && (
        <AdminGlossaryTermEditor
          term={editorTarget === "new" ? null : editorTarget}
          onClose={() => setEditorTarget(null)}
        />
      )}

      {previewTarget && (
        <AdminGlossaryTermPreviewModal
          term={previewTarget}
          onClose={() => setPreviewTarget(null)}
          onEdit={(term) => {
            setPreviewTarget(null);
            setEditorTarget(term);
          }}
        />
      )}

      {reviewTarget && (
        <AdminGlossaryReviewModal
          term={reviewTarget}
          onClose={() => setReviewTarget(null)}
        />
      )}

      {deleteTarget && (
        <AdminGlossaryDeleteModal
          term={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
