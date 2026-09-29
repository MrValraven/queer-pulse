/**
 * Runs a piece's next action (`pieceNextAction`) the same way from a table
 * row, a board card and the peek panel, so the verb on the button always
 * does one thing wherever it is pressed.
 *
 * Publish goes through the piece record's own publish action
 * (`usePiecePublishAction`, with its confirm and care gate): this hook only
 * remembers WHICH piece asked, and `DeskPublishFlow` mounts that action for
 * it.
 */

import { useState } from "react";
import type { Piece } from "../data/desk.data";
import type { PieceNextAction } from "./pieceNextAction";

export interface UseDeskNextActionParams {
  /** chase and chase-reader: the piece's thread (`useDeskModals.openChase`). */
  openChase: (piece: Piece) => void;
  /** edit and lay-out: the editor for the piece's format. */
  editPiece: (piece: Piece) => void;
  /** add-to-issue: the issue picker for one piece. */
  openAssignIssue: (piece: Piece) => void;
  /** hand-off: the hand-off dialog (`useDeskModals.openHandoff`). */
  openHandoff: (piece: Piece) => void;
}

export interface DeskNextAction {
  runNextAction: (piece: Piece, action: PieceNextAction) => void;
  /** The piece whose publish confirm is open, or null. */
  publishPiece: Piece | null;
  /** Called by `DeskPublishFlow` once the publish is confirmed or dropped. */
  finishPublish: () => void;
}

export function useDeskNextAction({
  openChase,
  editPiece,
  openAssignIssue,
  openHandoff,
}: UseDeskNextActionParams): DeskNextAction {
  const [publishPiece, setPublishPiece] = useState<Piece | null>(null);

  function runNextAction(piece: Piece, action: PieceNextAction): void {
    switch (action.kind) {
      case "chase":
      case "chase-reader":
        openChase(piece);
        return;
      case "edit":
      case "lay-out":
        editPiece(piece);
        return;
      case "hand-off":
        openHandoff(piece);
        return;
      case "add-to-issue":
        openAssignIssue(piece);
        return;
      case "publish":
        setPublishPiece(piece);
        return;
    }
  }

  return {
    runNextAction,
    publishPiece,
    finishPublish: () => setPublishPiece(null),
  };
}
