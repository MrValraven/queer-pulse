/**
 * How the desk says when a piece is due. With a real calendar date it answers
 * relative to today ("tomorrow", "3 days late"), which is the question an
 * editor scanning the pipeline is asking. Without one it echoes the display
 * text it was given.
 *
 * Pure logic with no `t()`: a relative answer carries an i18n key plus its
 * `{count}`, and the render site resolves it.
 */

import type { Piece } from "../data/desk.data";
import { isoCalendarDate } from "../api/pieces.adapters";

export type DeskDueKind = "none" | "ready" | "relative" | "raw";

export interface DeskDueDescription {
  kind: DeskDueKind;
  /** Set for `relative`: a `magazine:desk.due.*` key. */
  labelKey?: string;
  /** Interpolation values for `labelKey` (`{ count }` for the plural keys). */
  values?: Record<string, string | number>;
  /** Set for `raw`: the display text to show as it is. */
  text?: string;
  isLate: boolean;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** Whole calendar days from `today` to the ISO day `isoDate` (negative once
 *  it has passed). `today` is read on the viewer's own calendar, so "today"
 *  flips at their midnight. */
function calendarDaysUntil(isoDate: string, today: Date): number {
  const [yearText, monthText, dayText] = isoDate.split("-");
  const dueUtc = Date.UTC(
    Number(yearText),
    Number(monthText) - 1,
    Number(dayText),
  );
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return Math.round((dueUtc - todayUtc) / DAY_IN_MS);
}

function describeRelative(daysUntil: number): DeskDueDescription {
  if (daysUntil === 0) {
    return {
      kind: "relative",
      labelKey: "magazine:desk.due.today",
      isLate: false,
    };
  }
  if (daysUntil === 1) {
    return {
      kind: "relative",
      labelKey: "magazine:desk.due.tomorrow",
      isLate: false,
    };
  }
  if (daysUntil > 1) {
    return {
      kind: "relative",
      labelKey: "magazine:desk.due.inDays",
      values: { count: daysUntil },
      isLate: false,
    };
  }
  return {
    kind: "relative",
    labelKey: "magazine:desk.due.daysLate",
    values: { count: -daysUntil },
    isLate: true,
  };
}

/** Ready and Published pieces have nothing left to chase (see `describeDue`). */
function isFinished(piece: Piece): boolean {
  return (
    piece.due === "ready" ||
    piece.stage === "Ready" ||
    piece.stage === "Published"
  );
}

/**
 * The desk's "due" sort order: late pieces first, then by due date soonest
 * first, then pieces with no known date (unset, Ready, display text only).
 * ISO calendar dates compare correctly as plain strings. `Array.prototype.sort`
 * is stable, so ties keep the order they arrived in.
 */
export function compareByDue(pieceA: Piece, pieceB: Piece): number {
  const lateOrder = Number(pieceB.late === true) - Number(pieceA.late === true);
  if (lateOrder !== 0) return lateOrder;
  const dueDateA = isFinished(pieceA) ? undefined : pieceA.dueDate;
  const dueDateB = isFinished(pieceB) ? undefined : pieceB.dueDate;
  if (dueDateA && dueDateB) return dueDateA.localeCompare(dueDateB);
  if (dueDateA) return -1;
  if (dueDateB) return 1;
  return 0;
}

/**
 * `today` is a parameter so tests and callers pin the clock.
 *
 * A piece at Ready or Published has nothing left to chase, so it reads as
 * `ready` even when it still carries a date (the backend's `deriveLate` never
 * marks those late either). `labelKey` for the plural cases is the base key;
 * i18n picks `_one` / `_other` from `values.count`.
 *
 * Days are counted on the viewer's local calendar, while the backend's `late`
 * flag uses the UTC day. East of UTC, just after midnight, a piece can read
 * "1 day late" here while `piece.late` (and the Late chip) still says on time.
 * Accepted: the label follows the editor's own day.
 */
export function describeDue(piece: Piece, today: Date): DeskDueDescription {
  if (isFinished(piece)) return { kind: "ready", isLate: false };
  // `dueDate` is set by the adapter and the demo fixtures; a `due` that is
  // itself ISO (a row patched in place) is read the same way.
  const isoDate = piece.dueDate ?? isoCalendarDate(piece.due);
  if (isoDate) return describeRelative(calendarDaysUntil(isoDate, today));
  if (!piece.due) return { kind: "none", isLate: piece.late === true };
  return { kind: "raw", text: piece.due, isLate: piece.late === true };
}
