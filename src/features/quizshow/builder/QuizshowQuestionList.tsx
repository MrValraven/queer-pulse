import type { Ref } from "react";
import { AnimatePresence } from "motion/react";
import { FiCopy, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguageMode,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import { useRowDragReorder } from "../../subprofiles/useRowDragReorder";
import type { QuizshowDraftRound } from "./quizshowDraft";
import type { QuizshowDraftController } from "./useQuizshowDraft";
import { QuizshowQuestionEditor } from "./QuizshowQuestionEditor";
import { QuizshowReorderControls } from "./QuizshowReorderControls";
import {
  usedLanguagesOf,
  type QuizshowLocalProblem,
} from "./quizshowValidation";
import styles from "./QuizshowRounds.module.css";

/** The first used language that has text, or an empty string. */
function firstUsedText(
  text: QuizshowText,
  languages: QuizshowLanguageMode,
): string {
  for (const language of usedLanguagesOf(languages)) {
    const value = text[language].trim();
    if (value.length > 0) return value;
  }
  return "";
}

/** Where a row that sat at `index` lands once `fromIndex` moves to `toIndex`. */
function indexAfterMove(index: number, fromIndex: number, toIndex: number) {
  if (index === fromIndex) return toIndex;
  if (fromIndex < index && index <= toIndex) return index - 1;
  if (toIndex <= index && index < fromIndex) return index + 1;
  return index;
}

/** The mediaRef of every other question in the whole draft. */
function otherMediaRefsFor(
  rounds: readonly QuizshowDraftRound[],
  ownDraftKey: string,
): string[] {
  return rounds
    .flatMap((draftRound) => draftRound.questions)
    .filter((draftQuestion) => draftQuestion.draftKey !== ownDraftKey)
    .map((draftQuestion) => draftQuestion.question.mediaRef)
    .filter((mediaRef): mediaRef is string => mediaRef !== null);
}

interface QuizshowQuestionListProps {
  controller: QuizshowDraftController;
  roundIndex: number;
  languages: QuizshowLanguageMode;
  problems: readonly QuizshowLocalProblem[];
  openQuestionIndex: number | null;
  onOpenQuestion: (questionIndex: number | null) => void;
}

export function QuizshowQuestionList({
  controller,
  roundIndex,
  languages,
  problems,
  openQuestionIndex,
  onOpenQuestion,
}: QuizshowQuestionListProps) {
  const { t } = useTranslation();
  const moveQuestion = (fromIndex: number, toIndex: number) => {
    controller.moveQuestion(roundIndex, fromIndex, toIndex);
    if (openQuestionIndex !== null) {
      onOpenQuestion(indexAfterMove(openQuestionIndex, fromIndex, toIndex));
    }
  };
  const duplicateQuestion = (questionIndex: number) => {
    controller.duplicateQuestion(roundIndex, questionIndex);
    if (openQuestionIndex !== null && openQuestionIndex > questionIndex) {
      onOpenQuestion(openQuestionIndex + 1);
    }
  };
  const removeQuestion = (questionIndex: number) => {
    controller.removeQuestion(roundIndex, questionIndex);
    if (openQuestionIndex === null) return;
    if (openQuestionIndex === questionIndex) onOpenQuestion(null);
    else if (openQuestionIndex > questionIndex) {
      onOpenQuestion(openQuestionIndex - 1);
    }
  };
  const { containerRef, gripHandlers } = useRowDragReorder(moveQuestion);
  const round = controller.draft.rounds[roundIndex];
  if (!round) return null;
  const roundQuestionCount = round.questions.length;
  const quizQuestionCount = controller.draft.rounds.reduce(
    (total, draftRound) => total + draftRound.questions.length,
    0,
  );
  const isQuizFull = quizQuestionCount >= QUIZSHOW_LIMITS.questionsPerQuizMax;
  const isRoundFull =
    roundQuestionCount >= QUIZSHOW_LIMITS.questionsPerRoundMax;
  const isAddBlocked = isQuizFull || isRoundFull;
  const shownCount = isQuizFull ? quizQuestionCount : roundQuestionCount;
  const shownMax = isQuizFull
    ? QUIZSHOW_LIMITS.questionsPerQuizMax
    : QUIZSHOW_LIMITS.questionsPerRoundMax;

  return (
    <div className={styles.questions}>
      <ul
        className={styles.list}
        ref={containerRef as unknown as Ref<HTMLUListElement>}
      >
        <AnimatePresence initial={false}>
          {round.questions.map((draftQuestion, questionIndex) => {
            const number = questionIndex + 1;
            const isOpen = openQuestionIndex === questionIndex;
            const preview = firstUsedText(
              draftQuestion.question.prompt,
              languages,
            );
            return (
              <CollapseListItem key={draftQuestion.draftKey}>
                <div className={styles.questionRow}>
                  <div className={styles.rowHead}>
                    <span className={styles.number} aria-hidden>
                      {number}
                    </span>
                    <QuizshowReorderControls
                      index={questionIndex}
                      count={roundQuestionCount}
                      moveUpLabel={t("quizshow:questions.moveUp", { number })}
                      moveDownLabel={t("quizshow:questions.moveDown", {
                        number,
                      })}
                      dragLabel={t("quizshow:questions.drag", { number })}
                      onMove={moveQuestion}
                      gripHandlers={gripHandlers(questionIndex)}
                    />
                    <div className={styles.rowText}>
                      <p
                        id={`question-title-${draftQuestion.draftKey}`}
                        className={styles.rowTitle}
                      >
                        {preview ||
                          t("quizshow:questions.untitled", { number })}
                      </p>
                    </div>
                    <div className={styles.rowActions}>
                      <Button
                        variant="ghost"
                        size="md"
                        aria-expanded={isOpen}
                        onClick={() =>
                          onOpenQuestion(isOpen ? null : questionIndex)
                        }
                      >
                        {t(
                          isOpen
                            ? "quizshow:questions.close"
                            : "quizshow:questions.edit",
                          { number },
                        )}
                      </Button>
                      <IconButton
                        aria-label={t("quizshow:questions.duplicate")}
                        aria-describedby={`question-title-${draftQuestion.draftKey}`}
                        onClick={() => duplicateQuestion(questionIndex)}
                      >
                        <FiCopy aria-hidden />
                      </IconButton>
                      <IconButton
                        aria-label={t("quizshow:questions.remove")}
                        aria-describedby={`question-title-${draftQuestion.draftKey}`}
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        <FiTrash2 aria-hidden />
                      </IconButton>
                    </div>
                  </div>
                  <Collapse isOpen={isOpen}>
                    <div className={styles.questionPanel}>
                      <QuizshowQuestionEditor
                        roundKind={round.kind}
                        languages={languages}
                        roundTimeLimitSeconds={round.settings.timeLimitSeconds}
                        questionNumber={number}
                        question={draftQuestion.question}
                        mediaUrl={draftQuestion.mediaUrl}
                        pickedPreviewUrl={
                          draftQuestion.question.mediaRef === null
                            ? null
                            : (controller.pickedPreviewUrls.get(
                                draftQuestion.question.mediaRef,
                              ) ?? null)
                        }
                        onPickedPreview={controller.rememberPickedPreview}
                        otherReferencedMediaRefs={otherMediaRefsFor(
                          controller.draft.rounds,
                          draftQuestion.draftKey,
                        )}
                        problems={problems.filter(
                          (problem) =>
                            problem.roundIndex === roundIndex &&
                            problem.questionIndex === questionIndex,
                        )}
                        onChange={(question, mediaUrl) =>
                          controller.updateQuestion(
                            roundIndex,
                            questionIndex,
                            question,
                            mediaUrl,
                          )
                        }
                      />
                    </div>
                  </Collapse>
                </div>
              </CollapseListItem>
            );
          })}
        </AnimatePresence>
      </ul>
      <div className={styles.addRow}>
        <Button
          variant="soft"
          size="md"
          aria-disabled={isAddBlocked}
          onClick={() => {
            if (isAddBlocked) return;
            controller.addQuestion(roundIndex);
            onOpenQuestion(roundQuestionCount);
          }}
        >
          <FiPlus aria-hidden /> {t("quizshow:questions.add")}
        </Button>
        <p className={styles.countLine} role="status">
          {t("quizshow:questions.count", { count: shownCount, max: shownMax })}
        </p>
      </div>
    </div>
  );
}
