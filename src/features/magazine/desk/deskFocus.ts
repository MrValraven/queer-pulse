/**
 * The desk's focus chips: one registry of named piece predicates that the
 * chip bar, its counts, the URL state (`useDeskFocus`) and the visible-list
 * filter (`useDeskState`) all read. Keeping the rule and its label in one row
 * is what stops a chip's count from disagreeing with the list it filters.
 *
 * Pure logic with no `t()`: each definition carries an i18n key the render
 * site resolves.
 */

import type { Piece } from "../data/desk.data";
import { forecastPieceReason } from "./deskForecast";
import { stageAge } from "./deskStageAge";
import { isWaitingOnViewer } from "./deskWaitingOn";

export type DeskFocusId =
  | "your-turn"
  | "late"
  | "stalled"
  | "with-writers"
  | "needs-art"
  | "sensitivity"
  | "ready"
  | "unpaid"
  | "mine"
  | "new-voices"
  | "at-risk";

/** The colour family a chip borrows, so "your turn" and "late" read apart at
 *  a glance. Resolved to tokens by the UI layer. */
export type DeskFocusTone = "you" | "late" | "writer" | "ready" | "neutral";

export interface DeskFocusDefinition {
  id: DeskFocusId;
  /** `magazine:desk.focus.<camelId>`, resolved at the render site. */
  labelKey: string;
  tone: DeskFocusTone;
  /** `today` defaults to the current instant, so every existing call site
   *  keeps compiling; a caller that already has one (a test, `stageAge`'s own
   *  callers) passes it through so "stalled" stays pinnable to a clock.
   *  `closesOn` is the scope's close day (`YYYY-MM-DD`), which only the
   *  issue scope has; "at-risk" matches nothing without it. */
  matches: (
    piece: Piece,
    me: string,
    today?: Date,
    closesOn?: string | null,
  ) => boolean;
}

/** A published piece has left the desk's working set, so most chips skip it. */
function isInFlight(piece: Piece): boolean {
  return piece.stage !== "Published";
}

/** Chip order is display order, and the order `?focus=` is written in. */
export const DESK_FOCUS_DEFINITIONS: DeskFocusDefinition[] = [
  {
    id: "your-turn",
    labelKey: "magazine:desk.focus.yourTurn",
    tone: "you",
    // The waiting-on column's own rule, so a piece at Sensitivity read (out
    // with the reader) stays out of this chip, its group and the shell count.
    matches: (piece, me) => isWaitingOnViewer(piece, me),
  },
  {
    id: "late",
    labelKey: "magazine:desk.focus.late",
    tone: "late",
    matches: (piece) => isInFlight(piece) && piece.late === true,
  },
  {
    id: "stalled",
    labelKey: "magazine:desk.focus.stalled",
    tone: "writer",
    // `stageAge` already reads null once a piece is Published or carries no
    // stage-entry timestamp, so this chip excludes both without a separate
    // isInFlight guard.
    matches: (piece, _me, today = new Date()) =>
      stageAge(piece, today)?.isStalled === true,
  },
  {
    id: "with-writers",
    labelKey: "magazine:desk.focus.withWriters",
    tone: "writer",
    matches: (piece) => isInFlight(piece) && piece.wait === "writer",
  },
  {
    id: "needs-art",
    labelKey: "magazine:desk.focus.needsArt",
    tone: "neutral",
    matches: (piece) =>
      isInFlight(piece) && (piece.art === "none" || piece.art === "brief"),
  },
  {
    id: "sensitivity",
    labelKey: "magazine:desk.focus.sensitivity",
    tone: "neutral",
    matches: (piece) => piece.stage === "Sensitivity read",
  },
  {
    id: "ready",
    labelKey: "magazine:desk.focus.ready",
    tone: "ready",
    matches: (piece) => piece.stage === "Ready",
  },
  {
    id: "unpaid",
    labelKey: "magazine:desk.focus.unpaid",
    tone: "neutral",
    // Reads the list-level payment status, so a paid writer drops out of the
    // count the moment the fee is settled. It has to keep counting a piece
    // once it goes live: publishing is exactly when an unpaid writer becomes
    // urgent, so `Published` pieces count here like any other.
    matches: (piece) => piece.paymentStatus === "owed",
  },
  {
    id: "mine",
    labelKey: "magazine:desk.focus.mine",
    tone: "neutral",
    matches: (piece, me) => isInFlight(piece) && piece.editorId === me,
  },
  {
    id: "new-voices",
    labelKey: "magazine:desk.focus.newVoices",
    // Jade, the tone the desk gives a new voice (see `deskTones.ts`).
    tone: "ready",
    matches: (piece) => isInFlight(piece) && piece.fresh === true,
  },
  {
    id: "at-risk",
    labelKey: "magazine:desk.focus.atRisk",
    tone: "late",
    // The rail forecast's own per-piece rule, so the forecast's "N pieces
    // may miss close" and the table this chip filters hold the same pieces.
    // It counts whole days from the start of today, so any instant in the
    // day (the default "now" here, local midnight in the rail) agrees.
    matches: (piece, _me, today = new Date(), closesOn) =>
      closesOn ? forecastPieceReason(piece, closesOn, today) !== null : false,
  },
];

const DEFINITION_BY_ID = new Map<DeskFocusId, DeskFocusDefinition>(
  DESK_FOCUS_DEFINITIONS.map((definition) => [definition.id, definition]),
);

/** Narrow an arbitrary string (a URL value) to a known focus id. */
export function isDeskFocusId(value: string): value is DeskFocusId {
  return DEFINITION_BY_ID.has(value as DeskFocusId);
}

/** How many of `pieces` one chip would show. `today` defaults to now; pass
 *  one through to pin the "stalled" count to a clock (tests, the demo).
 *  Pass the scope's `closesOn` for "at-risk" to count anything. */
export function countForFocus(
  pieces: Piece[],
  me: string,
  id: DeskFocusId,
  today: Date = new Date(),
  closesOn: string | null = null,
): number {
  const definition = DEFINITION_BY_ID.get(id);
  if (!definition) return 0;
  return pieces.filter((piece) =>
    definition.matches(piece, me, today, closesOn),
  ).length;
}

/** True when the piece passes EVERY active chip (AND); no chips passes all. */
export function matchesAllFocus(
  piece: Piece,
  me: string,
  ids: DeskFocusId[],
  today: Date = new Date(),
  closesOn: string | null = null,
): boolean {
  return ids.every((id) => {
    const definition = DEFINITION_BY_ID.get(id);
    return definition ? definition.matches(piece, me, today, closesOn) : true;
  });
}
