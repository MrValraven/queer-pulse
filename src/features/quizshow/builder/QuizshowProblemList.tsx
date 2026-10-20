import { useId } from "react";
import { Button } from "../../../shared/components/ui";
import {
  QUIZSHOW_LIMITS,
  type QuizshowQuizProblemCode,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowScopeKind } from "../quizshowScope";
import type { QuizshowLocalProblem } from "./quizshowValidation";
import styles from "./QuizshowBuilder.module.css";

/** Where a problem sends the host: the round and, when it names one, the question. */
export interface QuizshowProblemTarget {
  roundIndex: number;
  questionIndex: number | null;
}

const MAX_BY_CODE: Partial<Record<QuizshowQuizProblemCode, number>> = {
  too_many_rounds: QUIZSHOW_LIMITS.roundsMax,
  too_many_questions: QUIZSHOW_LIMITS.questionsPerQuizMax,
  too_many_questions_in_round: QUIZSHOW_LIMITS.questionsPerRoundMax,
};

/** A game names its own switch and its own title; every other code reads the same for both kinds. */
const GAME_PROBLEM_KEYS: Partial<Record<string, string>> = {
  adults_round_needs_adults_event: "adults_round_needs_switch",
  title_missing: "title_missing_game",
};

export function QuizshowProblemList({
  problems,
  onJump,
}: {
  problems: readonly QuizshowLocalProblem[];
  onJump?: (target: QuizshowProblemTarget) => void;
}) {
  const { t } = useTranslation();
  const scopeKind = useQuizshowScopeKind();
  const idPrefix = useId();
  return (
    <ul className={styles.problemList}>
      {problems.map((problem) => {
        const itemKey = [
          problem.code,
          problem.roundIndex,
          problem.questionIndex,
          problem.language,
        ].join("-");
        const textId = `${idPrefix}-${itemKey}`;
        const { roundIndex } = problem;
        const problemKey =
          (scopeKind === "game"
            ? GAME_PROBLEM_KEYS[problem.code]
            : undefined) ?? problem.code;
        return (
          <li key={itemKey} className={styles.problemItem}>
            <span id={textId} className={styles.problemText}>
              {t(`quizshow:problems.${problemKey}`, {
                round: roundIndex === null ? "" : roundIndex + 1,
                question:
                  problem.questionIndex === null
                    ? ""
                    : problem.questionIndex + 1,
                language:
                  problem.language === null
                    ? ""
                    : t(`quizshow:language.tag.${problem.language}`),
                max: MAX_BY_CODE[problem.code as QuizshowQuizProblemCode] ?? "",
              })}
            </span>
            {onJump && roundIndex !== null && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                aria-describedby={textId}
                onClick={() =>
                  onJump({ roundIndex, questionIndex: problem.questionIndex })
                }
              >
                {t("quizshow:problems.jump")}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
