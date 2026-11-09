import { useEffect, useRef } from "react";
import { m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  clampStudioSelection,
  type QuizshowStudioSelection,
} from "./quizshowStudioSelection";
import { QuizshowInspectorQuestion } from "./QuizshowInspectorQuestion";
import { QuizshowInspectorQuiz } from "./QuizshowInspectorQuiz";
import { QuizshowInspectorRound } from "./QuizshowInspectorRound";
import { QuizshowInspectorWheel } from "./QuizshowInspectorWheel";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import {
  displayRoundNumber,
  displayWheelNumber,
  isWheelRoundKind,
  withWheelSettingsDefaults,
} from "../quizshowWheel";
import styles from "./QuizshowStudioInspector.module.css";

/** The selected item's place and name, above its settings. */
function InspectorContext({
  selection,
}: {
  selection: QuizshowStudioSelection;
}) {
  const { t } = useTranslation();
  const { controller, viewLanguage } = useQuizshowStudio();
  const { draft } = controller;
  const round =
    selection.kind === "quiz" ? undefined : draft.rounds[selection.roundIndex];
  const roundName = (roundIndex: number) =>
    draft.rounds[roundIndex]?.title[viewLanguage].trim() ||
    t("quizshow:rounds.untitled", {
      number: displayRoundNumber(draft.rounds, roundIndex),
    });
  let eyebrow: string;
  let title: string;
  if (selection.kind === "quiz") {
    eyebrow = t("quizshow:studio.inspector.quiz.eyebrow");
    title = draft.title.trim() || t("quizshow:studio.inspector.quiz.untitled");
  } else if (
    selection.kind === "round" &&
    round &&
    isWheelRoundKind(round.kind)
  ) {
    eyebrow = t("quizshow:studio.inspector.wheel.eyebrow", {
      number: displayWheelNumber(draft.rounds, selection.roundIndex),
    });
    title =
      withWheelSettingsDefaults(round.settings).wheelPick === "question"
        ? t("quizshow:studio.inspector.wheel.pickQuestion")
        : t("quizshow:studio.inspector.wheel.pickRound");
  } else if (selection.kind === "round") {
    eyebrow = round ? t(`quizshow:kind.${round.kind}.name`) : "";
    title = roundName(selection.roundIndex);
  } else {
    eyebrow = roundName(selection.roundIndex);
    title = t("quizshow:questions.untitled", {
      number: selection.questionIndex + 1,
    });
  }
  return (
    <header className={styles.context}>
      <p className={styles.contextEyebrow}>{eyebrow}</p>
      <h2 className={styles.contextTitle}>{title}</h2>
    </header>
  );
}

/** The state for the selection. */
function InspectorState({ selection }: { selection: QuizshowStudioSelection }) {
  const { controller } = useQuizshowStudio();
  if (selection.kind === "round") {
    const round = controller.draft.rounds[selection.roundIndex];
    if (round && isWheelRoundKind(round.kind)) {
      return <QuizshowInspectorWheel roundIndex={selection.roundIndex} />;
    }
    return <QuizshowInspectorRound roundIndex={selection.roundIndex} />;
  }
  if (selection.kind === "question") {
    return (
      <QuizshowInspectorQuestion
        roundIndex={selection.roundIndex}
        questionIndex={selection.questionIndex}
      />
    );
  }
  return <QuizshowInspectorQuiz />;
}

/** One key per item. Index based like the selection, so the draft keys a save mints never remount it. */
function positionKeyOf(selection: QuizshowStudioSelection): string {
  if (selection.kind === "quiz") return "quiz";
  if (selection.kind === "round") return `round-${selection.roundIndex}`;
  return `question-${selection.roundIndex}-${selection.questionIndex}`;
}

/**
 * The studio's right-hand settings panel for the selection: the quiz, a
 * round or a question. Always dark. From 1024px it scrolls inside its own
 * column; below it, it stacks under the canvas and is where editing happens.
 *
 * Moving to another item fades the new one in (enter only: the item that
 * leaves reads live context, so it has nothing of its own to fade out), and
 * resets the typed text of every field, since each field mounts fresh.
 */
export function QuizshowStudioInspector() {
  const { t } = useTranslation();
  const { selection, controller } = useQuizshowStudio();
  const { reducedMotion } = useMotionPrefs();
  const rootRef = useRef<HTMLElement>(null);
  const current = clampStudioSelection(selection, controller.draft);
  const positionKey = positionKeyOf(current);
  useEffect(() => {
    if (rootRef.current) rootRef.current.scrollTop = 0;
  }, [positionKey]);
  return (
    <aside
      ref={rootRef}
      data-theme="dark"
      data-studio-inspector=""
      aria-label={t("quizshow:studio.inspector.label")}
      className={styles.root}
    >
      <m.div
        key={positionKey}
        className={styles.state}
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.15 }}
      >
        <InspectorContext selection={current} />
        <InspectorState selection={current} />
      </m.div>
    </aside>
  );
}
