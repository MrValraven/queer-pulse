/**
 * Editor desk copy helpers: stage/format label + class maps, saved-view
 * definitions, and the plain-text sanitizer for `Activity.what`-style
 * strings that still carry inline HTML markup from the design.
 */

import type { Piece, PieceFormat, SavedViewId, Stage } from "./desk.data";

/** Strip HTML tags from a markup string, returning plain text only. */
export function stripEm(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/** First name out of a full byline, for friendlier direct address ("Chase {name}"). */
export function firstName(byline: string): string {
  return byline.trim().split(/\s+/)[0] ?? byline;
}

export const STAGE_CLASS: Record<Stage, string> = {
  Commissioned: "",
  Drafting: "",
  "In review": "review",
  Edit: "review",
  "Sensitivity read": "sens",
  Layout: "lay",
  Ready: "ready",
};

export const SAVED_VIEWS: { id: SavedViewId; label: string; hint: string }[] = [
  { id: "v-late", label: "Late or at risk", hint: "2 pieces" },
  { id: "v-art", label: "Waiting on art", hint: "4 pieces" },
  { id: "v-sens", label: "Needs a sensitivity read", hint: "3 pieces" },
  { id: "v-pay", label: "Unpaid after filing", hint: "2 pieces" },
];

export const VIEW_TEST: Record<SavedViewId, (piece: Piece) => boolean> = {
  "v-late": (piece) => !!piece.late || piece.wait === "writer",
  "v-art": (piece) => piece.art === "none" || piece.art === "brief",
  "v-sens": (piece) =>
    piece.stage === "Sensitivity read" || piece.stage === "Edit",
  "v-pay": (piece) => piece.stage === "Layout" || piece.stage === "Ready",
};

export const FORMAT_LABEL: Record<PieceFormat, string> = {
  article: "Article",
  deck: "Deck",
};
