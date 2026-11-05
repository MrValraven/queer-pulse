import { useState } from "react";
import {
  QUIZSHOW_LIMITS,
  type QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import type { QuizshowDraftController } from "../builder/useQuizshowDraft";
import type { QuizshowStudioActions } from "./QuizshowStudioContext";
import {
  clampStudioSelection,
  indexAfterMove,
  nextQuestionSelection,
  QUIZ_SELECTION,
  selectionAfterRemovingQuestion,
  selectionAfterRemovingRound,
  type QuizshowStudioSelection,
} from "./quizshowStudioSelection";

function isInRange(index: number, length: number): boolean {
  return index >= 0 && index < length;
}

/** Every question of the draft, across its rounds. */
function questionCountOf(draft: QuizshowDraftController["draft"]): number {
  return draft.rounds.reduce(
    (runningTotal, round) => runningTotal + round.questions.length,
    0,
  );
}

/**
 * The limits, as booleans the UI disables its add buttons with. A new round
 * arrives with one question, so it needs room under the quiz-wide limit too.
 */
function addLimitsOf(draft: QuizshowDraftController["draft"]) {
  const hasQuizRoom =
    questionCountOf(draft) < QUIZSHOW_LIMITS.questionsPerQuizMax;
  return {
    isAddQuestionAllowed: hasQuizRoom,
    isAddRoundAllowed:
      hasQuizRoom && draft.rounds.length < QUIZSHOW_LIMITS.roundsMax,
    isAddQuestionToRoundAllowed: (roundIndex: number) => {
      const round = draft.rounds[roundIndex];
      return (
        hasQuizRoom &&
        round !== undefined &&
        round.questions.length < QUIZSHOW_LIMITS.questionsPerRoundMax
      );
    },
  };
}

/**
 * The studio's selection (the quiz by default) and the edits that keep it on
 * the right item. Stored by index and fitted to the draft on every read, so
 * it survives the `resetTo` after a save.
 */
export function useStudioSelectionModel(controller: QuizshowDraftController): {
  selection: QuizshowStudioSelection;
  select: (selection: QuizshowStudioSelection) => void;
  actions: QuizshowStudioActions;
} {
  const [storedSelection, setStoredSelection] =
    useState<QuizshowStudioSelection>(QUIZ_SELECTION);
  const { draft } = controller;
  const selection = clampStudioSelection(storedSelection, draft);
  // A selection the draft no longer holds is stored fitted, so it never springs back.
  if (selection !== storedSelection) setStoredSelection(selection);
  const limits = addLimitsOf(draft);

  /** Adds a question to round `roundIndex` at `insertAt` and selects it. */
  function insertQuestion(roundIndex: number, insertAt: number | null): void {
    const round = draft.rounds[roundIndex];
    if (round === undefined || !limits.isAddQuestionToRoundAllowed(roundIndex))
      return;
    const questionCount = round.questions.length;
    const targetIndex = insertAt ?? questionCount;
    controller.addQuestion(roundIndex);
    if (targetIndex !== questionCount) {
      controller.moveQuestion(roundIndex, questionCount, targetIndex);
    }
    setStoredSelection({
      kind: "question",
      roundIndex,
      questionIndex: targetIndex,
    });
  }

  function addRound(kind: QuizshowRoundKind): void {
    const roundCount = draft.rounds.length;
    if (!limits.isAddRoundAllowed) return;
    controller.addRound(kind);
    setStoredSelection({ kind: "round", roundIndex: roundCount });
  }

  function duplicateQuestion(roundIndex: number, questionIndex: number): void {
    const round = draft.rounds[roundIndex];
    if (
      round === undefined ||
      !isInRange(questionIndex, round.questions.length)
    )
      return;
    if (!limits.isAddQuestionToRoundAllowed(roundIndex)) return;
    controller.duplicateQuestion(roundIndex, questionIndex);
    setStoredSelection({
      kind: "question",
      roundIndex,
      questionIndex: questionIndex + 1,
    });
  }

  const actions: QuizshowStudioActions = {
    ...limits,
    selectPrevious: () =>
      setStoredSelection(nextQuestionSelection(selection, draft, -1)),
    selectNext: () =>
      setStoredSelection(nextQuestionSelection(selection, draft, 1)),
    addQuestionAfterSelection: () => {
      if (draft.rounds.length === 0) {
        // A new quiz round arrives with its first question; select it.
        if (!limits.isAddRoundAllowed) return;
        controller.addRound("quiz");
        setStoredSelection({
          kind: "question",
          roundIndex: 0,
          questionIndex: 0,
        });
        return;
      }
      if (selection.kind === "quiz") {
        insertQuestion(draft.rounds.length - 1, null);
      } else if (selection.kind === "round") {
        insertQuestion(selection.roundIndex, null);
      } else {
        insertQuestion(selection.roundIndex, selection.questionIndex + 1);
      }
    },
    addQuestionToRound: (roundIndex) => insertQuestion(roundIndex, null),
    duplicateSelectedQuestion: () => {
      if (selection.kind !== "question") return;
      duplicateQuestion(selection.roundIndex, selection.questionIndex);
    },
    duplicateQuestion,
    addRound,
    removeQuestion: (roundIndex, questionIndex) => {
      controller.removeQuestion(roundIndex, questionIndex);
      setStoredSelection(
        selectionAfterRemovingQuestion(selection, roundIndex, questionIndex),
      );
    },
    removeRound: (roundIndex) => {
      controller.removeRound(roundIndex);
      setStoredSelection(selectionAfterRemovingRound(selection, roundIndex));
    },
    moveQuestion: (roundIndex, fromIndex, toIndex) => {
      const questionCount = draft.rounds[roundIndex]?.questions.length ?? 0;
      const isMove =
        fromIndex !== toIndex &&
        isInRange(fromIndex, questionCount) &&
        isInRange(toIndex, questionCount);
      if (!isMove) return;
      controller.moveQuestion(roundIndex, fromIndex, toIndex);
      if (
        selection.kind === "question" &&
        selection.roundIndex === roundIndex
      ) {
        setStoredSelection({
          ...selection,
          questionIndex: indexAfterMove(
            selection.questionIndex,
            fromIndex,
            toIndex,
          ),
        });
      }
    },
    moveRound: (fromIndex, toIndex) => {
      const roundCount = draft.rounds.length;
      const isMove =
        fromIndex !== toIndex &&
        isInRange(fromIndex, roundCount) &&
        isInRange(toIndex, roundCount);
      if (!isMove) return;
      controller.moveRound(fromIndex, toIndex);
      if (selection.kind !== "quiz") {
        setStoredSelection({
          ...selection,
          roundIndex: indexAfterMove(selection.roundIndex, fromIndex, toIndex),
        });
      }
    },
  };

  return { selection, select: setStoredSelection, actions };
}
