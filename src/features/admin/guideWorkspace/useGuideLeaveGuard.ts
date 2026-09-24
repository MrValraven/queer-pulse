import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { useUnsavedChangesGuard } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GuideSaveState } from "./useGuideSave";

/**
 * The leave prompt for unsaved guide edits, plus the move from /new to the
 * new guide's /edit/:id once its first save lands. Both live here because
 * the order of the two effects matters (see the redirect below).
 */
export function useGuideLeaveGuard({
  isDirty,
  saving,
  createdGuideId,
}: {
  isDirty: boolean;
  saving: GuideSaveState;
  createdGuideId: string | null;
}): void {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Set while "Save and leave" runs and kept once it succeeds: the visitor
  // asked to go somewhere else, so the /edit/:id redirect for a guide that
  // save created would race the guard's own navigation and could strand them
  // on the editor. Cleared again when the save fails and they stay.
  const isLeavingAfterSaveRef = useRef(false);

  const saveAndLeave = async () => {
    isLeavingAfterSaveRef.current = true;
    const isSaved = await saving.save();
    if (!isSaved) isLeavingAfterSaveRef.current = false;
    return isSaved;
  };

  useUnsavedChangesGuard({
    active: isDirty,
    confirmMessage: t("admin:guideWorkspace.leaveConfirm"),
    guardBackButton: true,
    // Offered while the header's Save could run: nothing already saving, and
    // no open conflict, where a plain save would only hit the same 409 again.
    // Validation runs inside the save, which then resolves false and stays.
    onSaveAndLeave:
      saving.isSaving || saving.conflict ? undefined : saveAndLeave,
  });

  // No leave prompt on the /new to /edit/:id move: the guard's own effect is
  // declared earlier, so it re-runs first in this commit with the clean draft.
  useEffect(() => {
    if (!createdGuideId || isDirty || isLeavingAfterSaveRef.current) return;
    void navigate(`${routes.adminResourceGuideEdit}/${createdGuideId}`, {
      replace: true,
    });
  }, [createdGuideId, isDirty, navigate]);
}
