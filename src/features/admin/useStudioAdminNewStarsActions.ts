import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useRemoveAdminStudioSpotlightArtist,
  useReorderAdminStudioNewStars,
} from "./api/StudioAdminSpotlightListMutations";
import type { AdminStudioSpotlightArtistDTO } from "./api/studioSpotlightAdmin.api";
import { movedIds, studioAdminSaveErrorKeyOf } from "./studioAdmin.model";

/** New stars' row actions: move (Move up, Move down, a drop), remove and
 *  the note being edited. A move announces the new place through the
 *  returned status line; a refused write toasts its own reason. */
export function useStudioAdminNewStarsActions(
  stars: AdminStudioSpotlightArtistDTO[],
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const reorder = useReorderAdminStudioNewStars();
  const removal = useRemoveAdminStudioSpotlightArtist();
  const [statusMessage, setStatusMessage] = useState("");
  const [noteTarget, setNoteTarget] =
    useState<AdminStudioSpotlightArtistDTO | null>(null);
  const isBusy = reorder.isPending || removal.isPending;

  const toastError = (cause: unknown) =>
    showToast(t(studioAdminSaveErrorKeyOf(cause)), "error");

  function move(star: AdminStudioSpotlightArtistDTO, targetIndex: number) {
    const spotlightIds = movedIds(
      stars.map((candidate) => candidate.id),
      star.id,
      targetIndex,
    );
    if (!spotlightIds || isBusy) return;
    reorder.mutate(
      { spotlightIds },
      {
        onSuccess: () =>
          setStatusMessage(
            t("admin:studioAdmin.moved", {
              name: star.artist.name,
              position: targetIndex + 1,
            }),
          ),
        onError: toastError,
      },
    );
  }

  function remove(star: AdminStudioSpotlightArtistDTO, onRemoved: () => void) {
    if (isBusy) return;
    removal.mutate(
      { spotlightArtist: star },
      {
        onSuccess: () => {
          showToast(
            t("admin:studioAdmin.spotlight.removed", {
              name: star.artist.name,
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
    isBusy,
    statusMessage,
    move,
    remove,
    noteTarget,
    openNote: (star: AdminStudioSpotlightArtistDTO) => setNoteTarget(star),
    closeNote: () => setNoteTarget(null),
  };
}
