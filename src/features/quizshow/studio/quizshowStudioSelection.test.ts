import { describe, expect, it } from "vitest";
import {
  newQuestion,
  newRound,
  removeAt,
  type QuizshowDraft,
  type QuizshowDraftRound,
} from "../builder/quizshowDraft";
import {
  clampStudioSelection,
  indexAfterMove,
  nextQuestionSelection,
  problemsForSelection,
  selectionAfterRemovingQuestion,
  selectionAfterRemovingRound,
  type QuizshowStudioSelection,
} from "./quizshowStudioSelection";

function roundWith(questionCount: number): QuizshowDraftRound {
  const round = newRound("quiz");
  return {
    ...round,
    questions: Array.from({ length: questionCount }, (_unused, index) => ({
      draftKey: `${round.draftKey}-q${index}`,
      question: newQuestion("multiple_choice", "quiz"),
      mediaUrl: null,
    })),
  };
}

function draftWith(...questionCounts: number[]): QuizshowDraft {
  return {
    title: "Pride trivia",
    languages: "en",
    screenLanguage: "en",
    rounds: questionCounts.map(roundWith),
  };
}

function withoutQuestion(
  draft: QuizshowDraft,
  roundIndex: number,
  questionIndex: number,
): QuizshowDraft {
  return {
    ...draft,
    rounds: draft.rounds.map((round, index) =>
      index === roundIndex
        ? { ...round, questions: removeAt(round.questions, questionIndex) }
        : round,
    ),
  };
}

function withoutRound(draft: QuizshowDraft, roundIndex: number): QuizshowDraft {
  return { ...draft, rounds: removeAt(draft.rounds, roundIndex) };
}

const question = (
  roundIndex: number,
  questionIndex: number,
): QuizshowStudioSelection => ({ kind: "question", roundIndex, questionIndex });

describe("clampStudioSelection", () => {
  it("keeps a selection that still fits, as the same object", () => {
    const selection = question(1, 0);
    expect(clampStudioSelection(selection, draftWith(2, 1))).toBe(selection);
  });

  it("selects the previous question after the last question is deleted", () => {
    const draft = withoutQuestion(draftWith(3), 0, 2);
    expect(clampStudioSelection(question(0, 2), draft)).toEqual(question(0, 1));
  });

  it("selects the round's header after its only question is deleted", () => {
    const draft = withoutQuestion(draftWith(1, 1), 1, 0);
    expect(clampStudioSelection(question(1, 0), draft)).toEqual({
      kind: "round",
      roundIndex: 1,
    });
  });

  it("selects the previous round's header after the last round is deleted", () => {
    const draft = withoutRound(draftWith(2, 2), 1);
    expect(
      clampStudioSelection({ kind: "round", roundIndex: 1 }, draft),
    ).toEqual({ kind: "round", roundIndex: 0 });
    expect(clampStudioSelection(question(1, 1), draft)).toEqual({
      kind: "round",
      roundIndex: 0,
    });
  });

  it("selects the quiz when no round is left", () => {
    const draft = withoutRound(draftWith(1), 0);
    expect(
      clampStudioSelection({ kind: "round", roundIndex: 0 }, draft),
    ).toEqual({ kind: "quiz" });
    expect(clampStudioSelection(question(0, 0), draft)).toEqual({
      kind: "quiz",
    });
  });

  it("clamps an index past the end", () => {
    const draft = draftWith(2, 3);
    expect(clampStudioSelection(question(1, 9), draft)).toEqual(question(1, 2));
    expect(
      clampStudioSelection({ kind: "round", roundIndex: 7 }, draft),
    ).toEqual({ kind: "round", roundIndex: 1 });
  });

  it("keeps the quiz selected whatever the draft", () => {
    expect(clampStudioSelection({ kind: "quiz" }, draftWith())).toEqual({
      kind: "quiz",
    });
  });
});

describe("nextQuestionSelection", () => {
  const draft = draftWith(2, 0, 2);

  it("moves within a round", () => {
    expect(nextQuestionSelection(question(0, 0), draft, 1)).toEqual(
      question(0, 1),
    );
    expect(nextQuestionSelection(question(2, 1), draft, -1)).toEqual(
      question(2, 0),
    );
  });

  it("crosses round boundaries, skipping an empty round", () => {
    expect(nextQuestionSelection(question(0, 1), draft, 1)).toEqual(
      question(2, 0),
    );
    expect(nextQuestionSelection(question(2, 0), draft, -1)).toEqual(
      question(0, 1),
    );
  });

  it("stops at the ends", () => {
    expect(nextQuestionSelection(question(0, 0), draft, -1)).toEqual(
      question(0, 0),
    );
    expect(nextQuestionSelection(question(2, 1), draft, 1)).toEqual(
      question(2, 1),
    );
  });

  it("goes from the quiz to the first question, and from a header into its round", () => {
    expect(nextQuestionSelection({ kind: "quiz" }, draft, 1)).toEqual(
      question(0, 0),
    );
    expect(
      nextQuestionSelection({ kind: "round", roundIndex: 2 }, draft, 1),
    ).toEqual(question(2, 0));
    expect(
      nextQuestionSelection({ kind: "round", roundIndex: 2 }, draft, -1),
    ).toEqual(question(0, 1));
  });

  it("stays put on a draft with no questions", () => {
    expect(nextQuestionSelection({ kind: "quiz" }, draftWith(), 1)).toEqual({
      kind: "quiz",
    });
  });
});

describe("selection after an edit", () => {
  it("removing a round selects the previous round's header, or the quiz", () => {
    expect(
      selectionAfterRemovingRound({ kind: "round", roundIndex: 2 }, 2),
    ).toEqual({ kind: "round", roundIndex: 1 });
    expect(selectionAfterRemovingRound(question(0, 1), 0)).toEqual({
      kind: "quiz",
    });
    expect(selectionAfterRemovingRound(question(3, 1), 1)).toEqual(
      question(2, 1),
    );
  });

  it("removing a question selects the previous one, or the round's header", () => {
    expect(selectionAfterRemovingQuestion(question(1, 2), 1, 2)).toEqual(
      question(1, 1),
    );
    expect(selectionAfterRemovingQuestion(question(1, 0), 1, 0)).toEqual({
      kind: "round",
      roundIndex: 1,
    });
    expect(selectionAfterRemovingQuestion(question(1, 3), 1, 0)).toEqual(
      question(1, 2),
    );
  });

  it("a move keeps the selection on the moved item", () => {
    expect(indexAfterMove(1, 1, 3)).toBe(3);
    expect(indexAfterMove(1, 0, 2)).toBe(0);
    expect(indexAfterMove(1, 3, 0)).toBe(2);
    expect(indexAfterMove(1, 2, 3)).toBe(1);
  });

  it("lists the problems of the selected item only", () => {
    const problems = [
      {
        code: "title_missing",
        roundIndex: null,
        questionIndex: null,
        language: null,
      },
      {
        code: "round_empty",
        roundIndex: 0,
        questionIndex: null,
        language: null,
      },
      {
        code: "prompt_missing",
        roundIndex: 0,
        questionIndex: 1,
        language: "en",
      },
    ] as const;
    expect(problemsForSelection(problems, question(0, 1))).toEqual([
      problems[2],
    ]);
    expect(
      problemsForSelection(problems, { kind: "round", roundIndex: 0 }),
    ).toEqual([problems[1]]);
    expect(problemsForSelection(problems, { kind: "quiz" })).toEqual([
      problems[0],
    ]);
  });
});
