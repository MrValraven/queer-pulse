import { useId } from "react";
import { Button } from "../../../shared/components/ui";
import type { QuizshowRoundKind } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowScopeKind } from "../quizshowScope";
import { studioProblemCopyOf } from "../studio/quizshowStudioProblemCopy";
import type { QuizshowLocalProblem } from "./quizshowValidation";
import styles from "./QuizshowProblemList.module.css";

/** Where a problem sends the host: the round and, when it names one, the question. */
export interface QuizshowProblemTarget {
  roundIndex: number;
  questionIndex: number | null;
}

export function QuizshowProblemList({
  problems,
  rounds,
  onJump,
}: {
  problems: readonly QuizshowLocalProblem[];
  /** The draft's rows, so a sentence numbers rounds and wheels the way the studio does. */
  rounds: ReadonlyArray<{ kind: QuizshowRoundKind }>;
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
        const copy = studioProblemCopyOf(problem, scopeKind, rounds);
        return (
          <li key={itemKey} className={styles.problemItem}>
            <span id={textId} className={styles.problemText}>
              {t(copy.key, {
                ...copy.values,
                language:
                  copy.languageTagKey === null ? "" : t(copy.languageTagKey),
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
