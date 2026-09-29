/**
 * The desk's assign-to-issue workflow: which pieces the issue picker is open
 * for, the piece selection toggles that clear pitch triage's own selection so
 * the two bulk bars never both claim the bottom slot, and the submit that
 * routes one piece vs. a batch to the right endpoint. Lifted out of
 * `EditorDashboardPage` so the page stays under the 200-line component rule,
 * mirroring `useDeskTracks` / `useDeskModals`.
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
  /** The pitch triage overlay's own selection, cleared whenever a piece
   *  selection starts, so the two bulk bars never both claim a bottom slot. */
  pitchSelection: {
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
    // One piece keeps the single-piece PATCH: it already owns its toast and
    // patches demo state. A real selection goes through the batch endpoint so
    // the whole set lands or fails together. When this one piece came from
    // the bulk bar's own selection, clear it on success too, the way the
    // batch path below always does.
    if (targets.length === 1) {
      const isFromSelection = pieceSelection.selectedPieceIds.includes(
        firstTarget.id,
      );
      assignPieceToIssue(
        firstTarget,
        target,
        isFromSelection
          ? () => pieceSelection.clearPieceSelection()
          : undefined,
      );
      return;
    }
    pieceMutations.assignIssue.mutate(
      {
        pieceIds: targets.map((piece) => piece.id),
        issueId: target?.id ?? null,
      },
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
  };
}
