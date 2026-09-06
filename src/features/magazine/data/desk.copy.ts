/**
 * Editor desk copy helpers: the stage class map, saved-view definitions, and
 * the plain-text sanitizer for `Activity.what`-style strings that still carry
 * inline HTML markup from the design. Stage and format LABELS live as i18n
 * keys elsewhere: `desk/stageLabels.ts` and `desk/FormatBadge.tsx`.
 */

import type { Piece, SavedViewId, Stage } from "./desk.data";

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
  Published: "published",
};

/**
 * The saved-view chips, holding an i18n key each: this is a `*.data.ts` file
 * with no `t()` of its own, so `SavedViews` resolves `labelKey` at the render
 * site. The prototype's static `hint` count is gone with the English labels,
 * since the strip already shows the real count computed from `VIEW_TEST`.
 */
export const SAVED_VIEWS: { id: SavedViewId; labelKey: string }[] = [
  { id: "v-late", labelKey: "magazine:desk.savedViews.lateOrAtRisk" },
  { id: "v-art", labelKey: "magazine:desk.savedViews.waitingOnArt" },
  { id: "v-sens", labelKey: "magazine:desk.savedViews.needsSensitivityRead" },
  { id: "v-pay", labelKey: "magazine:desk.savedViews.unpaidAfterFiling" },
];

export const VIEW_TEST: Record<SavedViewId, (piece: Piece) => boolean> = {
  "v-late": (piece) => !!piece.late || piece.wait === "writer",
  "v-art": (piece) => piece.art === "none" || piece.art === "brief",
  "v-sens": (piece) =>
    piece.stage === "Sensitivity read" || piece.stage === "Edit",
  // "Unpaid after filing" has to keep counting a piece once it goes live:
  // publishing is exactly when an unpaid writer becomes urgent, so `Published`
  // belongs in this view alongside the two stages that precede it.
  "v-pay": (piece) =>
    piece.stage === "Layout" ||
    piece.stage === "Ready" ||
    piece.stage === "Published",
};
