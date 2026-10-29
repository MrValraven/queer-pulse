import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioCurationShelf } from "../studio/api/studio.types";
import {
  useRemoveAdminStudioPick,
  useReorderAdminStudioPicks,
} from "./api/StudioAdminCurationHooks";
import type { AdminStudioPickDTO } from "./api/studioDiscoveryAdmin.api";
import {
  STUDIO_ADMIN_SHELF_LABEL_KEY,
  studioAdminSaveErrorKeyOf,
} from "./studioAdmin.model";

/** What the featured slot and the list shelves share: the shelf's label,
 *  Remove pick with its toast, the error toast, the pick whose note is open
 *  and the busy flag that holds every write while one is in flight. */
export function useStudioAdminShelfActions(shelf: StudioCurationShelf) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const reorder = useReorderAdminStudioPicks();
  const remove = useRemoveAdminStudioPick();
  const [noteTarget, setNoteTarget] = useState<AdminStudioPickDTO | null>(null);
  const shelfLabel = t(STUDIO_ADMIN_SHELF_LABEL_KEY[shelf]);
  const isBusy = reorder.isPending || remove.isPending;

  const toastError = (cause: unknown) =>
    showToast(t(studioAdminSaveErrorKeyOf(cause)), "error");

  /** Removes the pick, says so, then runs `onRemoved` (the caller moves
   *  focus, since only it knows where focus should land). */
  function removePick(pick: AdminStudioPickDTO, onRemoved: () => void) {
    if (isBusy) return;
    remove.mutate(
      { pick },
      {
        onSuccess: () => {
          showToast(
            t("admin:studioAdmin.toast.pickRemoved", {
              title: pick.release.title,
              shelf: shelfLabel,
            }),
            "success",
          );
          onRemoved();
        },
        onError: toastError,
      },
    );
  }

  return {
    shelfLabel,
    isBusy,
    reorder,
    toastError,
    removePick,
    noteTarget,
    openNote: (pick: AdminStudioPickDTO) => setNoteTarget(pick),
    closeNote: () => setNoteTarget(null),
  };
}
