import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import type { QuizshowDraft } from "../builder/quizshowDraft";
import { isWheelRoundKind, playableRoundCount } from "../quizshowWheel";

/** The add limits, as booleans the studio disables its add buttons with. */
export interface StudioAddLimits {
  /** Room under the quiz-wide question limit (`questionsPerQuizMax`). */
  isAddQuestionAllowed: boolean;
  /** Room for one more round (wheels do not count) and for the question it arrives with. */
  isAddRoundAllowed: boolean;
  /** Room for one more wheel row (`wheelStepsMax`); a wheel brings no question. */
  isAddWheelAllowed: boolean;
  /** Room in round `roundIndex` and under the quiz-wide limit; false for a wheel row. */
  isAddQuestionToRoundAllowed: (roundIndex: number) => boolean;
}

/** Every question of the draft, across its rounds. */
function questionCountOf(draft: QuizshowDraft): number {
  return draft.rounds.reduce(
    (runningTotal, round) => runningTotal + round.questions.length,
    0,
  );
}

/**
 * The limits for the add buttons. A new round arrives with one question, so it
 * needs room under the quiz-wide limit too. Wheel rows do not count toward
 * `roundsMax` and carry no questions, so only `wheelStepsMax` gates a wheel.
 */
export function studioAddLimitsOf(draft: QuizshowDraft): StudioAddLimits {
  const hasQuizRoom =
    questionCountOf(draft) < QUIZSHOW_LIMITS.questionsPerQuizMax;
  const wheelRowCount = draft.rounds.filter((round) =>
    isWheelRoundKind(round.kind),
  ).length;
  return {
    isAddQuestionAllowed: hasQuizRoom,
    isAddRoundAllowed:
      hasQuizRoom &&
      playableRoundCount(draft.rounds) < QUIZSHOW_LIMITS.roundsMax,
    isAddWheelAllowed: wheelRowCount < QUIZSHOW_LIMITS.wheelStepsMax,
    isAddQuestionToRoundAllowed: (roundIndex: number) => {
      const round = draft.rounds[roundIndex];
      return (
        hasQuizRoom &&
        round !== undefined &&
        !isWheelRoundKind(round.kind) &&
        round.questions.length < QUIZSHOW_LIMITS.questionsPerRoundMax
      );
    },
  };
}

/** The index of the last row that is not a wheel, or null when there is none. */
export function lastPlayableRoundIndex(draft: QuizshowDraft): number | null {
  const lastIndex = draft.rounds.findLastIndex(
    (round) => !isWheelRoundKind(round.kind),
  );
  return lastIndex === -1 ? null : lastIndex;
}
