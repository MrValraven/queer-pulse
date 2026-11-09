import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertCircle, FiCheckCircle, FiChevronRight } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useOutsideDismiss } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowLocalProblem } from "../builder/quizshowValidation";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { focusSelectedRailItem } from "./quizshowStudioDom";
import { studioProblemCopyOf } from "./quizshowStudioProblemCopy";
import { selectionOfProblem } from "./quizshowStudioSelection";
import styles from "./QuizshowStudioTopBar.module.css";

const POPOVER_EASE = [0.16, 1, 0.3, 1] as const;

function problemKeyOf(problem: QuizshowLocalProblem): string {
  return [
    problem.code,
    problem.roundIndex,
    problem.questionIndex,
    problem.language,
  ].join("-");
}

/** One problem in its existing copy; a press selects its question, round or the quiz settings. */
function QuizshowStudioProblemItem({
  problem,
  onPick,
}: {
  problem: QuizshowLocalProblem;
  onPick: (problem: QuizshowLocalProblem) => void;
}) {
  const { t } = useTranslation();
  const { scope, controller } = useQuizshowStudio();
  const copy = studioProblemCopyOf(
    problem,
    scope.kind,
    controller.draft.rounds,
  );
  const language = copy.languageTagKey ? t(copy.languageTagKey) : "";
  return (
    <li>
      <button
        type="button"
        className={styles.problemItem}
        onClick={() => onPick(problem)}
      >
        <FiAlertCircle aria-hidden className={styles.problemIcon} />
        <span className={styles.problemText}>
          {t(copy.key, { ...copy.values, language })}
        </span>
        <FiChevronRight aria-hidden className={styles.problemGo} />
      </button>
    </li>
  );
}

/**
 * The top bar's problems indicator: "Ready to play" when nothing is listed,
 * else the count, which opens a list of every problem. Picking one selects
 * the question, round or quiz settings it belongs to.
 */
export function QuizshowStudioProblems() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { problems, select, scope } = useQuizshowStudio();
  const [isOpen, setIsOpen] = useState(false);
  const popoverId = useId();
  const headingId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const count = problems.length;
  // The list folds away once the last problem is fixed.
  if (isOpen && count === 0) setIsOpen(false);
  // Fixing the last problem removes the trigger; focus that was on it goes to the rail's selected item.
  const isFocusInsideRef = useRef(false);
  useEffect(() => {
    if (count > 0 || !isFocusInsideRef.current) return;
    isFocusInsideRef.current = false;
    focusSelectedRailItem();
  }, [count]);

  const close = (shouldReturnFocus: boolean) => {
    setIsOpen(false);
    if (shouldReturnFocus) triggerRef.current?.focus({ preventScroll: true });
  };
  useOutsideDismiss(isOpen, popoverRef, () => close(false), {
    additionalInsideRef: triggerRef,
  });
  useEffect(() => {
    if (!isOpen) return;
    popoverRef.current
      ?.querySelector<HTMLElement>("button")
      ?.focus({ preventScroll: true });
  }, [isOpen]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    close(true);
  };
  const pick = (problem: QuizshowLocalProblem) => {
    select(selectionOfProblem(problem));
    close(true);
  };

  if (count === 0) {
    return (
      <p className={styles.ready} role="status">
        <FiCheckCircle aria-hidden className={styles.readyIcon} />
        <span className={styles.readyLabel}>
          {t("quizshow:studio.problems.none")}
        </span>
      </p>
    );
  }
  const fade = { duration: reducedMotion ? 0.12 : 0.18, ease: POPOVER_EASE };
  return (
    <div
      className={styles.problemsWrap}
      onFocus={() => {
        isFocusInsideRef.current = true;
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          isFocusInsideRef.current = false;
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.problemsTrigger}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        aria-label={t("quizshow:studio.problems.count", { count })}
        onClick={() => setIsOpen((current) => !current)}
      >
        <FiAlertCircle aria-hidden className={styles.problemsTriggerIcon} />
        <span aria-hidden className={styles.problemsTriggerCount}>
          {count}
        </span>
        <span aria-hidden className={styles.problemsTriggerLabel}>
          {t("quizshow:studio.problems.countLabel", { count })}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <m.div
            key="problems"
            ref={popoverRef}
            id={popoverId}
            role="dialog"
            aria-labelledby={headingId}
            className={styles.popover}
            onKeyDown={handleKeyDown}
            initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
            animate={{ opacity: 1, y: 0, transition: fade }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -4, transition: fade }}
          >
            <h2 id={headingId} className={styles.popoverTitle}>
              {t(
                scope.kind === "template"
                  ? "quizshow:templates.problemsTitle"
                  : "quizshow:problems.title",
              )}
            </h2>
            <ul className={styles.problemList}>
              {problems.map((problem) => (
                <QuizshowStudioProblemItem
                  key={problemKeyOf(problem)}
                  problem={problem}
                  onPick={pick}
                />
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
