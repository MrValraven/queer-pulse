/**
 * The desk's assign-to-issue workflow: which pieces the issue picker is open
 * for, the two selection toggles that keep the piece and pitch bulk bars from
 * colliding, and the submit that routes one piece vs. a batch to the right
 * endpoint. Lifted out of `EditorDashboardPage` so the page stays under the
 * 200-line component rule — mirrors `useDeskTracks` / `useDeskModals`.
 */

import { useState } from "react";
import type { Piece } from "../data/desk.data";
import type { usePieceMutations } from "../api/usePieceMutations";
import type { useDeskPieceSelection } from "./useDeskPieceSelection";
import type { useDeskTracks } from "./useDeskTracks";
import type { TFunction } from "../../../shared/i18n/types";
import type { ToastType } from "../../../shared/components/feedback/toastContext";

export interface IssueAssignmentTarget {
  id: string;
  number: string;
}

export interface UseDeskAssignmentParams {
  pieceMutations: ReturnType<typeof usePieceMutations>;
  pieceSelection: ReturnType<typeof useDeskPieceSelection>;
  /** `useDeskTracks.assignPieceToIssue`, for the single-piece path. */
  assignPieceToIssue: ReturnType<typeof useDeskTracks>["assignPieceToIssue"];
  /** The pitch inbox's selection controls, cleared whenever a piece selection
   *  starts — both bulk bars are fixed to the same bottom slot. */
  pitchSelection: {
    toggleSelect: (pitchId: string) => void;
    clearSelected: () => void;
  };
  showToast: (message: string, type?: ToastType) => void;
  translate: TFunction;
}

export function useDeskAssignment({
  pieceMutations,
  pieceSelection,
  assignPieceToIssue,
  pitchSelection,
  showToast,
  translate,
}: UseDeskAssignmentParams) {
  // The issue picker serves two entry points: one row's action (a single-piece
  // array) and the bulk bar (the whole selection). `null` means closed.
  const [assignTargets, setAssignTargets] = useState<Piece[] | null>(null);

  const togglePieceSelect = (piece: Piece) => {
    pitchSelection.clearSelected();
    pieceSelection.togglePieceSelect(piece.id);
  };

  const toggleAllPieceSelect = () => {
    pitchSelection.clearSelected();
    pieceSelection.toggleSelectAll();
  };

  const togglePitchSelect = (pitchId: string) => {
    pieceSelection.clearPieceSelection();
    pitchSelection.toggleSelect(pitchId);
  };

  const openForPiece = (piece: Piece) => setAssignTargets([piece]);
  const openForSelection = (visiblePieces: Piece[]) =>
    setAssignTargets(
      visiblePieces.filter((piece) =>
        pieceSelection.selectedPieceIds.includes(piece.id),
      ),
    );
  const close = () => setAssignTargets(null);

  const submit = (target: IssueAssignmentTarget | null) => {
    const targets = assignTargets ?? [];
    const [firstTarget] = targets;
    if (!firstTarget) return;
    // One piece keeps the single-piece PATCH — it already owns its toast and
    // patches demo state. A real selection goes through the batch endpoint so
    // the whole set lands or fails together.
    if (targets.length === 1) {
      assignPieceToIssue(firstTarget, target);
      return;
    }
    pieceMutations.assignIssue.mutate(
      { pieceIds: targets.map((piece) => piece.id), issueId: target?.id ?? null },
      {
        onSuccess: (result) => {
          pieceSelection.clearPieceSelection();
          showToast(
            target
              ? translate("magazine:desk.bulkAssign.assignedToast", {
                  count: result.assigned,
                  number: target.number,
                })
              : translate("magazine:desk.bulkAssign.unassignedToast", {
                  count: result.assigned,
                }),
            "success",
          );
        },
        onError: () =>
          showToast(translate("magazine:desk.reassign.failedToast"), "error"),
      },
    );
  };

  return {
    assignTargets,
    openForPiece,
    openForSelection,
    close,
    submit,
    togglePieceSelect,
    toggleAllPieceSelect,
    togglePitchSelect,
  };
}
