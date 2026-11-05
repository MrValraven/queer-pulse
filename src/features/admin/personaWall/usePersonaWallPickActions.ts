import { useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PersonaWallPickDTO } from "../../subprofiles/api/personaWall.api";
import {
  usePersonaWallIsWriting,
  useRemovePersonaWallPick,
  useReorderPersonaWallPicks,
} from "../api/useAdminPersonaWallMutations";
import { movedIds } from "../studioAdmin.model";
import {
  PERSONA_WALL_ERROR_VALUES,
  personaWallErrorKeyOf,
} from "./personaWallAdmin.model";

export interface PersonaWallPickActions {
  /** True while any wall write is in flight, the add and the fill order
   *  included, so two answers never race. */
  isBusy: boolean;
  /** The last move, for the section's polite status region. */
  statusMessage: string;
  move: (pick: PersonaWallPickDTO, targetIndex: number) => void;
  /** Removes the pick, says so, then runs `onRemoved` (the caller moves
   *  focus, since only it knows where focus should land). */
  remove: (pick: PersonaWallPickDTO, onRemoved: () => void) => void;
}

/** The picks list's writes: Move up, Move down, a drop, and Remove from
 *  wall. A refusal shows a toast that names its cause. */
export function usePersonaWallPickActions(
  picks: readonly PersonaWallPickDTO[],
): PersonaWallPickActions {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const reorder = useReorderPersonaWallPicks();
  const removal = useRemovePersonaWallPick();
  const isBusy = usePersonaWallIsWriting();
  const [statusMessage, setStatusMessage] = useState("");

  const toastError = (cause: unknown) =>
    showToast(
      t(personaWallErrorKeyOf(cause), PERSONA_WALL_ERROR_VALUES),
      "error",
    );

  function move(pick: PersonaWallPickDTO, targetIndex: number) {
    const ids = movedIds(
      picks.map((candidate) => candidate.id),
      pick.id,
      targetIndex,
    );
    if (!ids || isBusy) return;
    reorder.mutate(
      { ids },
      {
        onSuccess: () =>
          setStatusMessage(
            t("admin:personaWall.moved", {
              name: pick.persona.displayName,
              position: targetIndex + 1,
            }),
          ),
        onError: toastError,
      },
    );
  }

  function remove(pick: PersonaWallPickDTO, onRemoved: () => void) {
    if (isBusy) return;
    removal.mutate(
      { pickId: pick.id },
      {
        onSuccess: () => {
          showToast(
            t("admin:personaWall.toast.removed", {
              name: pick.persona.displayName,
            }),
            "success",
          );
          onRemoved();
        },
        onError: toastError,
      },
    );
  }

  return { isBusy, statusMessage, move, remove };
}
