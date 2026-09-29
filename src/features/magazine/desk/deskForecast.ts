/**
 * Whether the issue's pieces still in flight will make the close, and why
 * when they won't. A piece already at Ready or Published has nothing left to
 * forecast, so only the pieces still moving through the pipeline are read.
 *
 * Pure and timezone-safe: `daysUntilCalendarDate` reads `closesOn` as the
 * viewer's own local calendar day, the same rule `deskDue.ts` and the
 * issue-forecast adapters use, so "today" flips at the editor's own midnight
 * everywhere on the desk.
 *
 * Three reasons, checked in this order, the first one that fires wins:
 * - `late`: the piece already carries the `late` flag.
 * - `due-after-close`: its due date falls after the issue closes.
 * - `not-enough-time`: the stages left before Ready, at a flat two-day
 *   allowance each, add up to more than the days left to close.
 *
 * This is a heuristic: the two-day allowance ignores weekends, holidays and
 * how fast an editor's queue is actually moving. It exists to surface a
 * pattern worth a look, a rough signal rather than a predicted finish day.
 */

import { daysUntilCalendarDate } from "../api/pieces.adapters";
import type { Piece } from "../data/desk.data";
import { compareByDue } from "./deskDue";
import { STAGE_STEP } from "./deskTones";

export type DeskForecastReason = "late" | "due-after-close" | "not-enough-time";

export interface DeskForecastResult {
  /** The issue's at-risk pieces, late first, then soonest due date. */
  atRisk: Piece[];
  reasonByPieceId: Record<string, DeskForecastReason>;
}

/** Days of headroom the forecast allows each remaining pipeline stage. */
const DAYS_PER_STAGE_ALLOWANCE = 2;

/** The one reason a piece is at risk, or `null` when it is on track. */
function forecastReason(
  piece: Piece,
  closesOn: string,
  daysLeftToClose: number,
): DeskForecastReason | null {
  if (piece.late === true) return "late";
  if (piece.dueDate && piece.dueDate > closesOn) return "due-after-close";
  const stagesBeforeReady = STAGE_STEP.Ready - STAGE_STEP[piece.stage];
  if (stagesBeforeReady * DAYS_PER_STAGE_ALLOWANCE > daysLeftToClose) {
    return "not-enough-time";
  }
  return null;
}

/**
 * Why one piece may miss `closesOn`, or `null` when it is on track or has
 * nothing left to forecast (Ready, Published). The single per-piece rule:
 * `forecastIssue` builds the rail's list from it and the `at-risk` focus chip
 * (`deskFocus.ts`) filters the table with it, so the forecast's count and the
 * pieces its door shows are always the same set.
 */
export function forecastPieceReason(
  piece: Piece,
  closesOn: string,
  today: Date,
): DeskForecastReason | null {
  if (piece.stage === "Ready" || piece.stage === "Published") return null;
  return forecastReason(
    piece,
    closesOn,
    daysUntilCalendarDate(closesOn, today),
  );
}

/**
 * The issue's pieces at risk of missing `closesOn`, and why each one is
 * flagged. `pieces` is the issue's own scope (the same list Issue health
 * already reads); `today` is a parameter so tests and callers pin the clock.
 * With no close date set there is nothing to forecast against, so the result
 * is empty (the desk header's countdown already shows that gap).
 */
export function forecastIssue(
  pieces: Piece[],
  closesOn: string | null | undefined,
  today: Date,
): DeskForecastResult {
  if (!closesOn) return { atRisk: [], reasonByPieceId: {} };

  const reasonByPieceId: Record<string, DeskForecastReason> = {};
  const atRisk: Piece[] = [];

  for (const piece of pieces) {
    const reason = forecastPieceReason(piece, closesOn, today);
    if (!reason) continue;
    reasonByPieceId[piece.id] = reason;
    atRisk.push(piece);
  }

  atRisk.sort(compareByDue);
  return { atRisk, reasonByPieceId };
}
