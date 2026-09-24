import { useUnsavedChangesGuard } from "../../../../shared/hooks";
import { useTranslation } from "../../../../shared/i18n/useTranslation";

/** The slice of `useArticleEditorDraftState` the leave guard reads. */
interface ArticleLeaveGuardDraft {
  isDirty: boolean;
  hasSaveConflict: boolean;
  saveBeforeLeaving: () => Promise<boolean>;
}

/**
 * The article editor's leave guard, split out of `ArticleEditorPage` to keep
 * that component under the line cap. Autosave covers the pauses; this covers
 * the window between the last keystroke and the debounce firing (plus a save
 * still in flight), which used to be lost without warning to Back, a palette
 * jump or a tab close.
 */
export function useArticleEditorLeaveGuard(
  draft: ArticleLeaveGuardDraft,
  isSavePending: boolean,
): void {
  const { t } = useTranslation();
  useUnsavedChangesGuard({
    active: draft.isDirty || isSavePending,
    confirmMessage: t("magazine:write.header.leaveConfirm"),
    // "Save and leave" flushes the pending autosave now and never publishes.
    // Offered while no 409 conflict is latched: a conflicted draft cannot be
    // written, and its banner already offers the reload.
    onSaveAndLeave: draft.hasSaveConflict ? undefined : draft.saveBeforeLeaving,
    guardBackButton: true,
  });
}
