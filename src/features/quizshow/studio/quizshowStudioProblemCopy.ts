import {
  QUIZSHOW_LIMITS,
  type QuizshowQuizProblemCode,
} from "../../../shared/contracts/quizshow";
import type { QuizshowLocalProblem } from "../builder/quizshowValidation";
import type { QuizshowBuilderScopeKind } from "../quizshowScope";

/** The values a `quizshow:problems.*` sentence reads, the language left to the caller. */
export interface QuizshowStudioProblemValues {
  round: number | "";
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
};

/** A game names its own 18+ switch and its own title (the rule QuizshowProblemList follows). */
const GAME_PROBLEM_KEYS: Partial<Record<string, string>> = {
  adults_round_needs_adults_event: "adults_round_needs_switch",
  title_missing: "title_missing_game",
};

/**
 * A problem's sentence for the studio (save status, inspector, problems
 * popover): `t(copy.key, { ...copy.values, language })`, with `language` the
 * translated `languageTagKey` or "".
 */
export function studioProblemCopyOf(
  problem: QuizshowLocalProblem,
  scopeKind: QuizshowBuilderScopeKind,
): QuizshowStudioProblemCopy {
  const problemKey =
    (scopeKind === "game" ? GAME_PROBLEM_KEYS[problem.code] : undefined) ??
    problem.code;
  return {
    key: `quizshow:problems.${problemKey}`,
    values: {
      round: problem.roundIndex === null ? "" : problem.roundIndex + 1,
      question: problem.questionIndex === null ? "" : problem.questionIndex + 1,
      max: MAX_BY_CODE[problem.code as QuizshowQuizProblemCode] ?? "",
    },
    languageTagKey:
      problem.language === null
        ? null
        : `quizshow:language.tag.${problem.language}`,
  };
}
