import type { QuizshowWheelPick } from "../../../shared/contracts/quizshow";
import type { QuizshowDraftRound } from "../builder/quizshowDraft";
import {
  displayRoundNumber,
  displayWheelNumber,
  isWheelRoundKind,
  wheelRoundIndexOfRange,
  wheelSliceRoundIndexes,
  withWheelSettingsDefaults,
} from "../quizshowWheel";

/**
 * One row of the studio rail, in draft order. A round carries its playable
 * number and the wheel whose range holds it (null outside every range); a
 * wheel carries its own number, how many rounds its range holds and its pick.
 */
export type StudioRailRow =
  | {
      kind: "round";
      roundIndex: number;
      roundNumber: number;
      wheelNumber: number | null;
    }
  | {
      kind: "wheel";
      roundIndex: number;
      wheelNumber: number;
      sliceCount: number;
      pick: QuizshowWheelPick;
    };

/**
 * The rail's rows: every draft row once, numbered by kind, each round tagged
 * with the wheel that owns it. Ranges come from the wheel helpers, so moving
 * a round or a wheel regroups the rail with no extra bookkeeping.
 */
export function railRowsOf(
  rounds: readonly QuizshowDraftRound[],
): StudioRailRow[] {
  return rounds.map((round, roundIndex): StudioRailRow => {
    if (isWheelRoundKind(round.kind)) {
      return {
        kind: "wheel",
        roundIndex,
        wheelNumber: displayWheelNumber(rounds, roundIndex),
        sliceCount: wheelSliceRoundIndexes(rounds, roundIndex).length,
        pick: withWheelSettingsDefaults(round.settings).wheelPick,
      };
    }
    const wheelRoundIndex = wheelRoundIndexOfRange(rounds, roundIndex);
    return {
      kind: "round",
      roundIndex,
      roundNumber: displayRoundNumber(rounds, roundIndex),
      wheelNumber:
        wheelRoundIndex === null
          ? null
          : displayWheelNumber(rounds, wheelRoundIndex),
    };
  });
}
