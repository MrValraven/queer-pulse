import type { QuizshowDraft } from "../builder/quizshowDraft";
import type { QuizshowLocalProblem } from "../builder/quizshowValidation";

/**
 * What the studio has selected: the quiz itself (its settings), a round's
 * header, or one question. Index based, so it survives the `resetTo` after a
 * save, which mints new ids and draft keys.
 */
export type QuizshowStudioSelection =
  | { kind: "quiz" }
  | { kind: "round"; roundIndex: number }
  | { kind: "question"; roundIndex: number; questionIndex: number };

export const QUIZ_SELECTION: QuizshowStudioSelection = { kind: "quiz" };

/** The last round's header, or the quiz when no round is left. */
function lastRoundOrQuiz(draft: QuizshowDraft): QuizshowStudioSelection {
  const roundCount = draft.rounds.length;
  return roundCount === 0
    ? QUIZ_SELECTION
    : { kind: "round", roundIndex: roundCount - 1 };
}

/**
 * The selection fitted to the draft. A round past the end falls back to the
 * last round's header (the quiz when none is left); a question past the end
 * of its round falls back to the round's last question, or to its header
 * when the round is empty. Returns the same object when nothing changes.
 */
export function clampStudioSelection(
  selection: QuizshowStudioSelection,
  draft: QuizshowDraft,
): QuizshowStudioSelection {
  if (selection.kind === "quiz") return selection;
  const round = draft.rounds[selection.roundIndex];
  if (round === undefined || selection.roundIndex < 0) {
    return lastRoundOrQuiz(draft);
  }
  if (selection.kind === "round") return selection;
  const questionCount = round.questions.length;
  if (questionCount === 0) {
    return { kind: "round", roundIndex: selection.roundIndex };
  }
  if (selection.questionIndex >= 0 && selection.questionIndex < questionCount) {
    return selection;
  }
  return {
    kind: "question",
    roundIndex: selection.roundIndex,
    questionIndex: Math.min(
      Math.max(selection.questionIndex, 0),
      questionCount - 1,
    ),
  };
}

/** Every question of the draft in rail order. */
function questionPositionsOf(
  draft: QuizshowDraft,
): Array<{ roundIndex: number; questionIndex: number }> {
  return draft.rounds.flatMap((round, roundIndex) =>
    round.questions.map((_question, questionIndex) => ({
      roundIndex,
      questionIndex,
    })),
  );
}

/**
 * The question before (-1) or after (1) the selection in rail order, crossing
 * round boundaries; the ends stay where they are. From the quiz, "next" is the
 * first question; from a round header, "next" is its first question (or the
 * next round's) and "previous" the last question before it.
 */
export function nextQuestionSelection(
  selection: QuizshowStudioSelection,
  draft: QuizshowDraft,
  direction: 1 | -1,
): QuizshowStudioSelection {
  const positions = questionPositionsOf(draft);
  if (positions.length === 0) return selection;
  const clamped = clampStudioSelection(selection, draft);
  let target: { roundIndex: number; questionIndex: number } | undefined;
  if (clamped.kind === "quiz") {
    target = direction === 1 ? positions[0] : undefined;
  } else if (clamped.kind === "round") {
    target =
      direction === 1
        ? positions.find(
            (position) => position.roundIndex >= clamped.roundIndex,
          )
        : positions.findLast(
            (position) => position.roundIndex < clamped.roundIndex,
          );
  } else {
    const currentIndex = positions.findIndex(
      (position) =>
        position.roundIndex === clamped.roundIndex &&
        position.questionIndex === clamped.questionIndex,
    );
    target = positions[currentIndex + direction];
  }
  return target === undefined ? clamped : { kind: "question", ...target };
}

/** Whether two selections point at the same item. */
export function isSameStudioSelection(
  first: QuizshowStudioSelection,
  second: QuizshowStudioSelection,
): boolean {
  if (first.kind !== second.kind) return false;
  if (first.kind === "quiz" || second.kind === "quiz") return true;
  if (first.roundIndex !== second.roundIndex) return false;
  if (first.kind === "question" && second.kind === "question") {
    return first.questionIndex === second.questionIndex;
  }
  return true;
}

/**
 * Where a problem sends the host: its question, else its round's header,
 * else the quiz settings (title, too many rounds).
 */
export function selectionOfProblem(
  problem: QuizshowLocalProblem,
): QuizshowStudioSelection {
  if (problem.roundIndex === null) return QUIZ_SELECTION;
  if (problem.questionIndex === null) {
    return { kind: "round", roundIndex: problem.roundIndex };
  }
  return {
    kind: "question",
    roundIndex: problem.roundIndex,
    questionIndex: problem.questionIndex,
  };
}

/**
 * The problems that belong to the selected item: a question's own, a round's
 * own (not its questions'), or the quiz-level ones.
 */
export function problemsForSelection(
  problems: readonly QuizshowLocalProblem[],
  selection: QuizshowStudioSelection,
): QuizshowLocalProblem[] {
  return problems.filter((problem) =>
    isSameStudioSelection(selectionOfProblem(problem), selection),
  );
}

/** The selection after removing round `roundIndex`: the previous round's header, or the quiz when none is left. */
export function selectionAfterRemovingRound(
  selection: QuizshowStudioSelection,
  roundIndex: number,
): QuizshowStudioSelection {
  if (selection.kind === "quiz" || selection.roundIndex < roundIndex) {
    return selection;
  }
  if (selection.roundIndex > roundIndex) {
    return { ...selection, roundIndex: selection.roundIndex - 1 };
  }
  return roundIndex === 0
    ? QUIZ_SELECTION
    : { kind: "round", roundIndex: roundIndex - 1 };
}

/** The selection after removing a question: the previous question, or the round's header when it was the first. */
export function selectionAfterRemovingQuestion(
  selection: QuizshowStudioSelection,
  roundIndex: number,
  questionIndex: number,
): QuizshowStudioSelection {
  if (selection.kind !== "question" || selection.roundIndex !== roundIndex) {
    return selection;
  }
  if (selection.questionIndex < questionIndex) return selection;
  if (selection.questionIndex > questionIndex) {
    return { ...selection, questionIndex: selection.questionIndex - 1 };
  }
  return questionIndex === 0
    ? { kind: "round", roundIndex }
    : { kind: "question", roundIndex, questionIndex: questionIndex - 1 };
}

/** The selection after moving an item from `fromIndex` to `toIndex` in a list: it follows the moved item. */
export function indexAfterMove(
  index: number,
  fromIndex: number,
  toIndex: number,
): number {
  if (index === fromIndex) return toIndex;
  if (fromIndex < index && toIndex >= index) return index - 1;
  if (fromIndex > index && toIndex <= index) return index + 1;
  return index;
}
