import {
  QUIZSHOW_LIMITS,
  type QuizshowQuizProblemCode,
  type QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import type { QuizshowLocalProblem } from "../builder/quizshowValidation";
import type { QuizshowBuilderScopeKind } from "../quizshowScope";
import { displayRoundNumber, displayWheelNumber } from "../quizshowWheel";

/** The values a `quizshow:problems.*` sentence reads, the language left to the caller. */
export interface QuizshowStudioProblemValues {
  round: number | "";
  wheel: number | "";
  question: number | "";
  max: number | "";
}

export interface QuizshowStudioProblemCopy {
  key: string;
  values: QuizshowStudioProblemValues;
  /** `quizshow:language.tag.*` for the problem's language; translate it into `values.language`. */
  languageTagKey: string | null;
}

const MAX_BY_CODE: Partial<Record<QuizshowQuizProblemCode, number>> = {
  too_many_rounds: QUIZSHOW_LIMITS.roundsMax,
  too_many_questions: QUIZSHOW_LIMITS.questionsPerQuizMax,
  too_many_questions_in_round: QUIZSHOW_LIMITS.questionsPerRoundMax,
  too_many_wheels: QUIZSHOW_LIMITS.wheelStepsMax,
};

/** A game names its own 18+ switch and its own title (shared by every problem sentence). */
const GAME_PROBLEM_KEYS: Partial<Record<string, string>> = {
  adults_round_needs_adults_event: "adults_round_needs_switch",
  title_missing: "title_missing_game",
};

/**
 * A problem's sentence for the studio (save status, inspector, problems
 * popover, problem list): `t(copy.key, { ...copy.values, language })`, with
 * `language` the translated `languageTagKey` or "". `round` counts playable
 * rounds only and `wheel` counts wheel rows, both read from `rounds`.
 */
export function studioProblemCopyOf(
  problem: QuizshowLocalProblem,
  scopeKind: QuizshowBuilderScopeKind,
  rounds: ReadonlyArray<{ kind: QuizshowRoundKind }>,
): QuizshowStudioProblemCopy {
  const { roundIndex } = problem;
  const problemKey =
    (scopeKind === "game" ? GAME_PROBLEM_KEYS[problem.code] : undefined) ??
    problem.code;
  return {
    key: `quizshow:problems.${problemKey}`,
    values: {
      round: roundIndex === null ? "" : displayRoundNumber(rounds, roundIndex),
      wheel:
        roundIndex !== null && problem.code === "wheel_too_few_slices"
          ? displayWheelNumber(rounds, roundIndex)
          : "",
      question: problem.questionIndex === null ? "" : problem.questionIndex + 1,
      max: MAX_BY_CODE[problem.code as QuizshowQuizProblemCode] ?? "",
    },
    languageTagKey:
      problem.language === null
        ? null
        : `quizshow:language.tag.${problem.language}`,
  };
}
