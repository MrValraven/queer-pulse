/**
 * The wiring behind a pipeline row's verbs, kept out of `PieceRow` so the row
 * stays a layout. Pure functions: the row hands in the piece and its handlers.
 */

import type { Piece } from "../data/desk.data";
import type { DeskTrack } from "./deskTrack";
import type { PieceNextAction } from "./pieceNextAction";

/** The row handlers a next action can land on when the table gets no
 *  `onNextAction` of its own. */
export interface PieceNextActionFallbacks {
  onOpen: (piece: Piece) => void;
  onEdit: (piece: Piece) => void;
  onChase: (piece: Piece) => void;
  onAssignIssue: (piece: Piece) => void;
}

/**
 * Runs a next action through the row's existing handlers. Chasing a writer
 * and chasing a sensitivity reader both open the chase flow; edit and lay out
 * both open the editor. Publish and hand off open the piece, because
 * publishing runs through the piece's own checks and the record carries the
 * hand-off.
 */
export function runFallbackNextAction(
  piece: Piece,
  action: PieceNextAction,
  handlers: PieceNextActionFallbacks,
): void {
  switch (action.kind) {
    case "chase":
    case "chase-reader":
      handlers.onChase(piece);
      break;
    case "edit":
    case "lay-out":
      handlers.onEdit(piece);
      break;
    case "add-to-issue":
      handlers.onAssignIssue(piece);
      break;
    case "hand-off":
    case "publish":
      handlers.onOpen(piece);
      break;
  }
}

/**
 * The More menu's issue item reads "Move issue" for work already filed and
 * "Add to issue" for unfiled work. On the issue track every piece is filed;
 * under "everything" the piece's own `issueId` decides.
 */
export function issueItemLabelKey(piece: Piece, track: DeskTrack): string {
  const isFiled =
    track === "issue" || (track === "everything" && piece.issueId !== null);
  return isFiled
    ? "magazine:desk.reassign.moveIssue"
    : "magazine:desk.reassign.addToIssue";
}
