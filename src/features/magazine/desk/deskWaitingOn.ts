/**
 * Who a piece is waiting on, as the desk shows it: the table's "Waiting on"
 * column, the board card and the peek panel all read this one rule, and
 * `pieceNextAction` reads the same holder, so the waiting party and the verb
 * beside it always describe the same person.
 *
 * Pure logic with no `t()`: the display carries an i18n key, or the owning
 * editor's first name, which is already display text.
 */

import type { TFunction } from "../../../shared/i18n/types";
import type { Editor, Piece } from "../data/desk.data";
import type { DeskTone } from "./deskTones";

/**
 * Who holds the piece, whoever is looking at it:
 * - `writer`: the writer has it (chase them)
 * - `reader`: out with the sensitivity reader (chase the reader)
 * - `editor`: back with the piece's own editor
 * - `nobody`: nobody is blocking it
 */
export type DeskPieceHolder = "writer" | "reader" | "editor" | "nobody";

/**
 * The writer wins whatever the stage, since they hold the copy. Otherwise a
 * piece at Sensitivity read is with its reader: that stage exists for the
 * read, and its next action is to chase the reader.
 */
export function pieceHolder(piece: Piece): DeskPieceHolder {
  if (piece.stage === "Published") return "nobody";
  if (piece.wait === "writer") return "writer";
  if (piece.stage === "Sensitivity read") return "reader";
  if (piece.wait === "you") return "editor";
  return "nobody";
}

/**
 * True when the piece waits on `me` as its own editor. The "You" label, the
 * "Your turn" chip and group, and the shell's count all read this, so they
 * agree. A piece out with the sensitivity reader waits on the reader, and
 * an unknown viewer (`me` empty) has no turn.
 */
export function isWaitingOnViewer(piece: Piece, me: string): boolean {
  return pieceHolder(piece) === "editor" && me !== "" && piece.editorId === me;
}

export interface DeskWaitingOnDisplay {
  tone: DeskTone;
  /** i18n key for the label, or null when `name` carries it. */
  labelKey: string | null;
  /** Another editor's first name, when the piece waits on them. */
  name: string | null;
}

const EDITOR_FALLBACK_KEY = "magazine:desk.pieceRow.editor";

/** "Sara Pinheiro" reads "Sara"; a blank name reads null. */
function firstNameOf(fullName: string): string | null {
  const [firstName] = fullName.trim().split(/\s+/);
  return firstName ? firstName : null;
}

/**
 * The waiting party for `me`. "You" and the plum tone belong only to the
 * viewer's own pieces (the same test as the "Your turn" chip): a piece
 * waiting on another editor names that editor, or reads "Editor" while the
 * directory has no name for them, in the neutral tone.
 */
export function describeWaitingOn(
  piece: Piece,
  me: string,
  editors: readonly Editor[],
): DeskWaitingOnDisplay {
  switch (pieceHolder(piece)) {
    case "writer":
      return {
        tone: "writer",
        labelKey: "magazine:desk.pieceRow.writer",
        name: null,
      };
    case "reader":
      return {
        tone: "writer",
        labelKey: "magazine:desk.pieceRow.reader",
        name: null,
      };
    case "editor": {
      if (isWaitingOnViewer(piece, me)) {
        return {
          tone: "you",
          labelKey: "magazine:desk.pieceRow.you",
          name: null,
        };
      }
      const editor = editors.find(
        (candidate) => candidate.id === piece.editorId,
      );
      const name = editor ? firstNameOf(editor.name) : null;
      return {
        tone: "neutral",
        labelKey: name ? null : EDITOR_FALLBACK_KEY,
        name,
      };
    }
    case "nobody":
      return {
        tone: "neutral",
        labelKey: "magazine:desk.pieceRow.nobody",
        name: null,
      };
  }
}

/** The display's text: the editor's name as written, or its translated key. */
export function waitingOnLabel(
  display: DeskWaitingOnDisplay,
  translate: TFunction,
): string {
  if (display.name) return display.name;
  return display.labelKey ? translate(display.labelKey) : "";
}
