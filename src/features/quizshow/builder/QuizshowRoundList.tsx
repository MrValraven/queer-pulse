import { useState, type Ref } from "react";
import { AnimatePresence } from "motion/react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import { useRowDragReorder } from "../../subprofiles/useRowDragReorder";
import type { QuizshowDraftController } from "./useQuizshowDraft";
import type { QuizshowDraftRound } from "./quizshowDraft";
import {
  usedLanguagesOf,
  type QuizshowLocalProblem,
} from "./quizshowValidation";
import { QuizshowRoundRow } from "./QuizshowRoundRow";
import styles from "./QuizshowRounds.module.css";

export interface QuizshowOpenTarget {
  roundIndex: number;
  questionIndex: number | null;
}

/** Where a row that sat at `index` lands once `fromIndex` moves to `toIndex`. */
function indexAfterMove(index: number, fromIndex: number, toIndex: number) {
  if (index === fromIndex) return toIndex;
  if (fromIndex < index && index <= toIndex) return index - 1;
  if (toIndex <= index && index < fromIndex) return index + 1;
  return index;
}

interface QuizshowRoundListProps {
  controller: QuizshowDraftController;
  isAdultsEvent: boolean;
  problems: readonly QuizshowLocalProblem[];
  openTarget: QuizshowOpenTarget | null;
  onOpen: (target: QuizshowOpenTarget | null) => void;
}

export function QuizshowRoundList({
  controller,
  isAdultsEvent,
  problems,
  openTarget,
  onOpen,
}: QuizshowRoundListProps) {
  const { t } = useTranslation();
  const [removal, setRemoval] = useState<{
    index: number;
    title: string;
    questionCount: number;
  } | null>(null);
  const moveRound = (fromIndex: number, toIndex: number) => {
    controller.moveRound(fromIndex, toIndex);
    if (openTarget) {
      onOpen({
        ...openTarget,
        roundIndex: indexAfterMove(openTarget.roundIndex, fromIndex, toIndex),
      });
    }
  };
  const { containerRef, gripHandlers } = useRowDragReorder(moveRound);
  const { rounds, languages } = controller.draft;
  const isFull = rounds.length >= QUIZSHOW_LIMITS.roundsMax;

  const titleOf = (round: QuizshowDraftRound, roundIndex: number) => {
    const typedTitle = usedLanguagesOf(languages)
      .map((language) => round.title[language].trim())
      .find((text) => text.length > 0);
    return (
      typedTitle ?? t("quizshow:rounds.untitled", { number: roundIndex + 1 })
    );
  };

  const confirmRemoval = () => {
    if (removal === null) return;
    const removalIndex = removal.index;
    controller.removeRound(removalIndex);
    if (openTarget?.roundIndex === removalIndex) {
      onOpen(null);
    } else if (openTarget && openTarget.roundIndex > removalIndex) {
      onOpen({ ...openTarget, roundIndex: openTarget.roundIndex - 1 });
    }
    setRemoval(null);
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{t("quizshow:rounds.heading")}</h2>
      <ul
        className={styles.list}
        ref={containerRef as unknown as Ref<HTMLUListElement>}
      >
        <AnimatePresence initial={false}>
          {rounds.map((round, roundIndex) => {
            const isOpen = openTarget?.roundIndex === roundIndex;
            const title = titleOf(round, roundIndex);
            return (
              <CollapseListItem key={round.draftKey}>
                <QuizshowRoundRow
                  controller={controller}
                  round={round}
                  roundIndex={roundIndex}
                  roundCount={rounds.length}
                  title={title}
                  isOpen={isOpen}
                  isAdultsEvent={isAdultsEvent}
                  problems={problems}
                  openQuestionIndex={
                    isOpen ? (openTarget?.questionIndex ?? null) : null
                  }
                  gripHandlers={gripHandlers(roundIndex)}
                  onMove={moveRound}
                  onToggle={() =>
                    onOpen(isOpen ? null : { roundIndex, questionIndex: null })
                  }
                  onOpenQuestion={(questionIndex) =>
                    onOpen({ roundIndex, questionIndex })
                  }
                  onRemove={() =>
                    setRemoval({
                      index: roundIndex,
                      title,
                      questionCount: round.questions.length,
                    })
                  }
                />
              </CollapseListItem>
            );
          })}
        </AnimatePresence>
      </ul>
      <div className={styles.addRow}>
        <Button
          variant="primary"
          size="md"
          aria-disabled={isFull}
          onClick={() => {
            if (isFull) return;
            controller.addRound("quiz");
            onOpen({ roundIndex: rounds.length, questionIndex: null });
          }}
        >
          <FiPlus aria-hidden /> {t("quizshow:rounds.add")}
        </Button>
        <p className={styles.countLine} role="status">
          {t("quizshow:rounds.count", {
            count: rounds.length,
            max: QUIZSHOW_LIMITS.roundsMax,
          })}
        </p>
      </div>
      <AnimatePresence>
        {removal !== null && (
          <ConfirmDialog
            open
            tone="destructive"
            title={t("quizshow:rounds.removeConfirmTitle", {
              title: removal.title,
            })}
            description={t("quizshow:rounds.removeConfirmBody", {
              count: removal.questionCount,
            })}
            confirmLabel={t("quizshow:rounds.remove")}
            cancelLabel={t("quizshow:common.cancel")}
            onClose={() => setRemoval(null)}
            onConfirm={confirmRemoval}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
