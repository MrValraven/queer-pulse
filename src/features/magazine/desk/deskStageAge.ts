/**
 * How long a piece has sat in its current stage, and whether that has crossed
 * into looking stuck. Reads `Piece.stageEnteredAt`, an ISO instant the
 * backend refreshes every time a piece's stage changes.
 *
 * Pure logic with no `t()`: the render site resolves the visible and
 * accessible text itself.
 *
 * Stalled thresholds, one per stage, in days sitting in that stage:
 *   Commissioned        7  (no draft filed yet)
 *   Drafting            14 (writing takes the longest, and needs the most time)
 *   In review           5  (an editor's own read-through)
 *   Edit                5
 *   Sensitivity read    7  (an outside reader's own schedule)
 *   Layout              3  (a short, mechanical step)
 *   Ready               7  (waiting solely on the issue closing)
 *   Published           never (it has left the desk's working set)
 */

import type { Piece, Stage } from "../data/desk.data";

export interface StageAge {
  /** Whole days since the piece entered `piece.stage`. */
  days: number;
  /** Whether `days` has reached the stage's own threshold. */
  isStalled: boolean;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** `null` means no duration in that stage ever reads as stalled (Published).
 *  One entry per `Stage`, so a stage added later cannot silently fall through
 *  with no threshold at all. */
const STALL_THRESHOLD_DAYS: Record<Stage, number | null> = {
  Commissioned: 7,
  Drafting: 14,
  "In review": 5,
  Edit: 5,
  "Sensitivity read": 7,
  Layout: 3,
  Ready: 7,
  Published: null,
};

/**
 * Whether the piece entered its stage less than a day ago. The table leaves
 * the age out then, since "0d in stage" says nothing. A Stalled mark always
 * shows, even if a stage ever gets a threshold of zero days.
 */
export function isFreshInStage(age: StageAge): boolean {
  return age.days === 0 && !age.isStalled;
}

/**
 * `null` when the piece carries no stage-entry timestamp, or once it is
 * Published: a shipped piece has left the desk's working set, so "time in
 * stage" no longer answers anything useful for it.
 */
export function stageAge(piece: Piece, today: Date): StageAge | null {
  if (!piece.stageEnteredAt || piece.stage === "Published") return null;
  const enteredAt = new Date(piece.stageEnteredAt);
  const days = Math.max(
    0,
    Math.floor((today.getTime() - enteredAt.getTime()) / DAY_IN_MS),
  );
  const threshold = STALL_THRESHOLD_DAYS[piece.stage];
  return { days, isStalled: threshold !== null && days >= threshold };
}
