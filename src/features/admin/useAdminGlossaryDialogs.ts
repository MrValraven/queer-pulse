import { useState } from "react";
import type { AdminGlossaryTermDTO } from "./api/adminResourceGuides.api";

type TermSetter = (term: AdminGlossaryTermDTO | null) => void;

export interface AdminGlossaryDialogState {
  editorTarget: AdminGlossaryTermDTO | "new" | null;
  setEditorTarget: (target: AdminGlossaryTermDTO | "new" | null) => void;
  previewTarget: AdminGlossaryTermDTO | null;
  setPreviewTarget: TermSetter;
  reviewTarget: AdminGlossaryTermDTO | null;
  setReviewTarget: TermSetter;
  deleteTarget: AdminGlossaryTermDTO | null;
  setDeleteTarget: TermSetter;
}

/** Which term each of the glossary console's dialogs is open on. Kept out of
 *  `AdminGlossaryPage` so the page stays about its list. */
export function useAdminGlossaryDialogs(): AdminGlossaryDialogState {
  const [editorTarget, setEditorTarget] = useState<
    AdminGlossaryTermDTO | "new" | null
  >(null);
  const [previewTarget, setPreviewTarget] =
    useState<AdminGlossaryTermDTO | null>(null);
  const [reviewTarget, setReviewTarget] = useState<AdminGlossaryTermDTO | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminGlossaryTermDTO | null>(
    null,
  );
  return {
    editorTarget,
    setEditorTarget,
    previewTarget,
    setPreviewTarget,
    reviewTarget,
    setReviewTarget,
    deleteTarget,
    setDeleteTarget,
  };
}
