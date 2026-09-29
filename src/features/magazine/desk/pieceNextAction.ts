/**
 * The one verb a desk row leads with: what moves this piece along from where
 * it sits now. Pure logic with an i18n key per action; the row resolves the
 * label and wires the handler.
 */

import type { Piece } from "../data/desk.data";
import { pieceHolder } from "./deskWaitingOn";
import type { DeskTrack } from "./deskTrack";

export type PieceNextActionKind =
  | "chase"
  | "edit"
  | "chase-reader"
  | "lay-out"
  | "hand-off"
  | "add-to-issue"
  | "publish";

export interface PieceNextAction {
  kind: PieceNextActionKind;
  labelKey: string;
}

const LABEL_KEY_BY_KIND: Record<PieceNextActionKind, string> = {
  chase: "magazine:desk.nextAction.chase",
  edit: "magazine:desk.nextAction.edit",
  "chase-reader": "magazine:desk.nextAction.chaseReader",
  "lay-out": "magazine:desk.nextAction.layOut",
  "hand-off": "magazine:desk.nextAction.handOff",
  "add-to-issue": "magazine:desk.nextAction.addToIssue",
  publish: "magazine:desk.nextAction.publish",
};

/** Stages before the first draft is filed: until a writer holds the piece,
 *  there is no copy to edit yet. */
const PRE_DRAFT_STAGES: ReadonlySet<Piece["stage"]> = new Set([
  "Commissioned",
  "Drafting",
]);

/** Shorter visible labels for the table's action column, where a long
 *  translation (PT "Insistir com a pessoa leitora", "Juntar a uma edição")
 *  would wrap or widen the column. The full label stays the button's
 *  accessible name, so each short form must be the start of its full one. */
const SHORT_LABEL_KEY_BY_KIND: Partial<Record<PieceNextActionKind, string>> = {
  "chase-reader": "magazine:desk.nextAction.chaseReaderShort",
  "add-to-issue": "magazine:desk.nextAction.addToIssueShort",
};

function actionOf(kind: PieceNextActionKind): PieceNextAction {
  return { kind, labelKey: LABEL_KEY_BY_KIND[kind] };
}

/** The label a table row shows for `action`: its short form when one
 *  exists, otherwise the full label. */
export function pieceNextActionShortLabelKey(action: PieceNextAction): string {
  return SHORT_LABEL_KEY_BY_KIND[action.kind] ?? action.labelKey;
}

/** A named writer means the piece is not waiting for one. */
function hasWriter(piece: Piece): boolean {
  return piece.byline.trim() !== "";
}

/**
 * The verb follows whoever holds the piece (`pieceHolder`, the same rule
 * behind the "Waiting on" column), so the two never contradict each other:
 * a piece with its writer is chased, a piece out with its reader chases the
 * reader, and "Nobody" never pairs with Chase. A commission with no writer
 * at all (an empty byline) is handed off, since assigning it is the move; one
 * that already has a byline (an editor writing it themselves, say) opens
 * for editing instead. Ready work is filed or published whoever last
 * touched it.
 *
 * The track is part of the signature so a later rule can tell issue work from
 * unfiled work. Today the piece's own `issueId` already answers "is it on an
 * issue?" in every scope, including "everything", so it goes unread.
 */
export function pieceNextAction(
  piece: Piece,
  _track: DeskTrack,
): PieceNextAction | null {
  if (piece.stage === "Published") return null;
  if (piece.stage === "Ready") {
    return actionOf(piece.issueId === null ? "add-to-issue" : "publish");
  }
  switch (pieceHolder(piece)) {
    case "writer":
      return actionOf("chase");
    case "reader":
      return actionOf("chase-reader");
    case "editor":
    case "nobody":
      // The editor holds it, or nobody does. Before a draft exists with no
      // byline, no writer has it yet, so the move is handing it off;
      // otherwise it is the editor's own work at this stage: laying it out,
      // or the copy.
      if (PRE_DRAFT_STAGES.has(piece.stage) && !hasWriter(piece)) {
        return actionOf("hand-off");
      }
      return actionOf(piece.stage === "Layout" ? "lay-out" : "edit");
  }
}
