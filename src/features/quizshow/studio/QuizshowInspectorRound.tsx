import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowRoundEditor } from "../builder/QuizshowRoundEditor";
import { useQuizshowDarkDialog } from "../builder/useQuizshowDarkDialog";
import {
  displayRoundNumber,
  isInWheelRange,
  isWheelRoundKind,
} from "../quizshowWheel";
import { QuizshowInspectorProblems } from "./QuizshowInspectorProblems";
import { QuizshowInspectorSection } from "./QuizshowInspectorSection";
import { QuizshowInspectorWheelBonus } from "./QuizshowInspectorWheelBonus";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import {
  selectionAfterRemovingRound,
  type QuizshowStudioSelection,
} from "./quizshowStudioSelection";
import styles from "./QuizshowStudioInspector.module.css";

/** The rail's own mark for an item, so focus can land on it (the thumbnail, the round header or the quiz row). */
function railSelectorOf(selection: QuizshowStudioSelection): string {
  if (selection.kind === "quiz") return "[data-studio-quiz-row]";
  if (selection.kind === "round") {
    return `[data-studio-round-header][data-round-index="${selection.roundIndex}"]`;
  }
  return `[data-studio-thumbnail][data-round-index="${selection.roundIndex}"][data-question-index="${selection.questionIndex}"]`;
}

/**
 * After the confirm the round is gone and so is the button that had focus.
 * Focus goes to the rail's item for the new selection, else to the
 * inspector's heading, once the new selection is on screen.
 */
function focusAfterRemoval(selection: QuizshowStudioSelection) {
  requestAnimationFrame(() => {
    const railItem = document.querySelector<HTMLElement>(
      railSelectorOf(selection),
    );
    const heading = document.querySelector<HTMLElement>(
      "[data-studio-inspector] h2",
    );
    const target = railItem ?? heading;
    if (target && target === heading) target.tabIndex = -1;
    target?.focus({ preventScroll: true });
  });
}

/** Add question to this round, with the count and the limit that blocks it. */
function QuizshowInspectorRoundQuestions({
  roundIndex,
}: {
  roundIndex: number;
}) {
  const { t } = useTranslation();
  const { controller, actions } = useQuizshowStudio();
  const countId = useId();
  const questionCount = controller.draft.rounds[roundIndex]?.questions.length;
  const isAllowed = actions.isAddQuestionToRoundAllowed(roundIndex);
  const isRoundFull =
    (questionCount ?? 0) >= QUIZSHOW_LIMITS.questionsPerRoundMax;
  return (
    <QuizshowInspectorSection
      title={t("quizshow:studio.inspector.round.questions")}
    >
      <div className={styles.addRow}>
        <Button
          variant="stage-ghost"
          size="sm"
          type="button"
          aria-disabled={!isAllowed}
          aria-describedby={countId}
          onClick={() => {
            if (isAllowed) actions.addQuestionToRound(roundIndex);
          }}
        >
          <FiPlus aria-hidden /> {t("quizshow:questions.add")}
        </Button>
        <p id={countId} className={styles.countLine} role="status">
          {isAllowed || isRoundFull
            ? t("quizshow:questions.count", {
                count: questionCount ?? 0,
                max: QUIZSHOW_LIMITS.questionsPerRoundMax,
              })
            : t("quizshow:problems.too_many_questions", {
                max: QUIZSHOW_LIMITS.questionsPerQuizMax,
              })}
        </p>
      </div>
    </QuizshowInspectorSection>
  );
}

/** Delete round or Delete wheel, behind the existing confirm. */
export function QuizshowInspectorRoundDelete({
  roundIndex,
}: {
  roundIndex: number;
}) {
  const { t } = useTranslation();
  const { controller, actions, viewLanguage, selection } = useQuizshowStudio();
  const darkDialogRef = useQuizshowDarkDialog();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const round = controller.draft.rounds[roundIndex];
  if (!round) return null;
  const isWheel = isWheelRoundKind(round.kind);
  const roundTitle =
    round.title[viewLanguage].trim() ||
    t("quizshow:rounds.untitled", {
      number: displayRoundNumber(controller.draft.rounds, roundIndex),
    });
  const removeLabel = t(
    isWheel ? "quizshow:rounds.removeWheel" : "quizshow:rounds.remove",
  );
  return (
    <div className={styles.footer}>
      <Button
        variant="danger"
        size="sm"
        type="button"
        onClick={() => setIsConfirmOpen(true)}
      >
        <FiTrash2 aria-hidden /> {removeLabel}
      </Button>
      <AnimatePresence>
        {isConfirmOpen && (
          <ConfirmDialog
            open
            tone="destructive"
            title={
              isWheel
                ? t("quizshow:rounds.removeWheelConfirmTitle")
                : t("quizshow:rounds.removeConfirmTitle", {
                    title: roundTitle,
                  })
            }
            description={
              isWheel
                ? t("quizshow:rounds.removeWheelConfirmBody")
                : t("quizshow:rounds.removeConfirmBody", {
                    count: round.questions.length,
                  })
            }
            confirmLabel={removeLabel}
            cancelLabel={t("quizshow:common.cancel")}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={() => {
              setIsConfirmOpen(false);
              actions.removeRound(roundIndex);
              focusAfterRemoval(
                selectionAfterRemovingRound(selection, roundIndex),
              );
            }}
          >
            <span ref={darkDialogRef} hidden />
          </ConfirmDialog>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The round state: name, kind, content label and settings, its questions, its problems, Delete round. */
export function QuizshowInspectorRound({ roundIndex }: { roundIndex: number }) {
  const { t } = useTranslation();
  const { controller, isAdultsEvent, problems } = useQuizshowStudio();
  const round = controller.draft.rounds[roundIndex];
  if (!round) return null;
  return (
    <>
      <QuizshowInspectorSection
        title={t("quizshow:studio.inspector.round.settings")}
      >
        <QuizshowRoundEditor
          round={round}
          roundIndex={roundIndex}
          isAdultsEvent={isAdultsEvent}
          languages={controller.draft.languages}
          onChange={(patch) => controller.updateRound(roundIndex, patch)}
          onChangeKind={(kind) => controller.changeRoundKind(roundIndex, kind)}
        />
        <Collapse isOpen={isInWheelRange(controller.draft.rounds, roundIndex)}>
          <QuizshowInspectorWheelBonus roundIndex={roundIndex} />
        </Collapse>
      </QuizshowInspectorSection>
      <QuizshowInspectorRoundQuestions roundIndex={roundIndex} />
      <QuizshowInspectorProblems
        problems={problems.filter(
          (problem) => problem.roundIndex === roundIndex,
        )}
      />
      <QuizshowInspectorRoundDelete roundIndex={roundIndex} />
    </>
  );
}
