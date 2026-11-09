import { useId } from "react";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowLocalProblem } from "../builder/quizshowValidation";
import { QuizshowInspectorSection } from "./QuizshowInspectorSection";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { studioProblemCopyOf } from "./quizshowStudioProblemCopy";
import {
  isSameStudioSelection,
  selectionOfProblem,
} from "./quizshowStudioSelection";
import styles from "./QuizshowStudioInspector.module.css";

/**
 * "Ready to play" when nothing is listed; otherwise each problem in the
 * existing sentence, with a button to the item it belongs to when that is
 * somewhere else than the current selection.
 */
export function QuizshowInspectorProblems({
  problems,
}: {
  problems: readonly QuizshowLocalProblem[];
}) {
  const { t } = useTranslation();
  const { scope, controller, selection, select } = useQuizshowStudio();
  const isReady = problems.length === 0;
  const idPrefix = useId();
  return (
    <QuizshowInspectorSection title={t("quizshow:studio.inspector.checks")}>
      {isReady ? (
        <p className={styles.status} role="status">
          <FiCheckCircle
            aria-hidden
            fill="none"
            className={styles.statusIcon}
          />
          {t("quizshow:studio.inspector.ready")}
        </p>
      ) : (
        <ul className={styles.problemList}>
          {problems.map((problem) => {
            const copy = studioProblemCopyOf(
              problem,
              scope.kind,
              controller.draft.rounds,
            );
            const target = selectionOfProblem(problem);
            const itemKey = [
              problem.code,
              problem.roundIndex,
              problem.questionIndex,
              problem.language,
            ].join("-");
            const textId = `${idPrefix}-${itemKey}`;
            return (
              <li key={itemKey} className={styles.problemItem}>
                <span id={textId} className={styles.problemText}>
                  <FiAlertCircle
                    aria-hidden
                    fill="none"
                    className={styles.problemIcon}
                  />
                  {t(copy.key, {
                    ...copy.values,
                    language: copy.languageTagKey ? t(copy.languageTagKey) : "",
                  })}
                </span>
                {!isSameStudioSelection(target, selection) && (
                  <Button
                    variant="stage-ghost"
                    size="sm"
                    type="button"
                    aria-describedby={textId}
                    onClick={() => select(target)}
                  >
                    {t("quizshow:problems.jump")}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </QuizshowInspectorSection>
  );
}
