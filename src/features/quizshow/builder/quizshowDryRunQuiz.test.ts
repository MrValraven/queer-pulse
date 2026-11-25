import { describe, expect, it } from "vitest";
import type { QuizshowQuestionInput } from "../../../shared/contracts/quizshow";
import {
  blankDraft,
  newQuestion,
  newRound,
  newWheel,
  draftToInput,
  type QuizshowDraft,
  type QuizshowDraftRound,
} from "./quizshowDraft";
import {
  dryRunDraftOf,
  dryRunQuizOf,
  sliceProblemsOf,
  type QuizshowDryRunSlice,
} from "./quizshowDryRunQuiz";
import { quizshowProblemsFor } from "./quizshowValidation";

const NO_PICKED_PREVIEWS: ReadonlyMap<string, string> = new Map();

/** What the studio holds for a slice: the problems of the whole draft, then the slice's own. */
function sliceProblemsOfWholeDraft(
  draft: QuizshowDraft,
  slice: QuizshowDryRunSlice,
) {
  const wholeDraftProblems = quizshowProblemsFor(draftToInput(draft, null), {
    isAdultsEvent: true,
  });
  return sliceProblemsOf(wholeDraftProblems, draft, slice);
}

const filled = (text: string) => ({ en: text, pt: text });

type MultipleChoiceInput = Extract<
  QuizshowQuestionInput,
  { type: "multiple_choice" }
>;

/** A multiple choice question with nothing missing, its prompt naming it. */
function readyQuestion(prompt: string): MultipleChoiceInput {
  return {
    ...newQuestion("multiple_choice", "quiz"),
    prompt: filled(prompt),
    options: [
      { id: "a", text: filled("One") },
      { id: "b", text: filled("Two") },
    ],
    answer: { correctIndexes: [0] },
  };
}

/** A question whose every option is marked right: a structural problem (C2.2). */
function everyOptionCorrect(prompt: string): MultipleChoiceInput {
  return { ...readyQuestion(prompt), answer: { correctIndexes: [0, 1] } };
}

function roundOf(
  title: string,
  questions: QuizshowQuestionInput[],
): QuizshowDraftRound {
  const round = newRound("quiz");
  return {
    ...round,
    title: filled(title),
    questions: questions.map((question, questionIndex) => ({
      draftKey: `${round.draftKey}-${questionIndex}`,
      question,
      mediaUrl: null,
    })),
  };
}

function draftOf(rounds: QuizshowDraftRound[]): QuizshowDraft {
  return { ...blankDraft("en"), title: "Tuesday trivia", rounds };
}

/** Round 1 with two questions, a wheel, then a slice round with three. */
function wheelDraft(): QuizshowDraft {
  return draftOf([
    roundOf("Opener", [readyQuestion("Q1"), readyQuestion("Q2")]),
    newWheel(),
    roundOf("On the wheel", [
      readyQuestion("W1"),
      readyQuestion("W2"),
      readyQuestion("W3"),
    ]),
  ]);
}

function promptsOf(
  draft: QuizshowDraft,
  slice?: Parameters<typeof dryRunQuizOf>[2],
) {
  return dryRunQuizOf(draft, NO_PICKED_PREVIEWS, slice).rounds.map((round) =>
    round.questions.map((question) => question.prompt.en),
  );
}

describe("dryRunQuizOf", () => {
  it("plays the whole draft without a slice, as the full Try it always did", () => {
    const draft = wheelDraft();

    const quiz = dryRunQuizOf(draft, NO_PICKED_PREVIEWS);

    expect(quiz.rounds.map((round) => round.kind)).toEqual([
      "quiz",
      "wheel",
      "quiz",
    ]);
    expect(promptsOf(draft)).toEqual([["Q1", "Q2"], [], ["W1", "W2", "W3"]]);
    expect(dryRunDraftOf(draft)).toBe(draft);
  });

  it("Try this round holds that one round with every question", () => {
    expect(promptsOf(wheelDraft(), { roundIndex: 0 })).toEqual([["Q1", "Q2"]]);
  });

  it("Try from this question starts the round at that question", () => {
    expect(
      promptsOf(wheelDraft(), { roundIndex: 2, fromQuestionIndex: 1 }),
    ).toEqual([["W2", "W3"]]);
  });

  it("a round inside a wheel plays as a plain round, the wheel left out", () => {
    const quiz = dryRunQuizOf(wheelDraft(), NO_PICKED_PREVIEWS, {
      roundIndex: 2,
    });

    expect(quiz.rounds).toHaveLength(1);
    expect(quiz.rounds[0]?.kind).toBe("quiz");
    expect(quiz.rounds[0]?.title.en).toBe("On the wheel");
  });
});

describe("sliceProblemsOf on the whole draft's problems", () => {
  it("finds nothing in a round that can play", () => {
    expect(sliceProblemsOfWholeDraft(wheelDraft(), { roundIndex: 0 })).toEqual(
      [],
    );
  });

  it("blocks Try this round on a structural problem in the round", () => {
    const draft = draftOf([
      roundOf("Opener", [readyQuestion("Q1"), everyOptionCorrect("Q2")]),
    ]);

    const problems = sliceProblemsOfWholeDraft(draft, { roundIndex: 0 });

    expect(problems).toContainEqual(
      expect.objectContaining({
        code: "too_many_correct_options",
        roundIndex: 0,
        questionIndex: 1,
      }),
    );
  });

  it("leaves out problems before the question the slice starts from", () => {
    const draft = draftOf([
      roundOf("Opener", [everyOptionCorrect("Q1"), readyQuestion("Q2")]),
    ]);

    expect(
      sliceProblemsOfWholeDraft(draft, { roundIndex: 0, fromQuestionIndex: 1 }),
    ).toEqual([]);
    expect(
      sliceProblemsOfWholeDraft(draft, { roundIndex: 0, fromQuestionIndex: 0 }),
    ).not.toEqual([]);
  });

  it("reads a wheel row or a slice past the last question as an empty round", () => {
    const draft = wheelDraft();

    expect(sliceProblemsOfWholeDraft(draft, { roundIndex: 1 })).toEqual([
      expect.objectContaining({ code: "round_empty", roundIndex: 1 }),
    ]);
    expect(
      sliceProblemsOfWholeDraft(draft, { roundIndex: 0, fromQuestionIndex: 2 }),
    ).toEqual([expect.objectContaining({ code: "round_empty" })]);
  });

  it("lets a warm-up later in the draft play as its own slice", () => {
    const warmUp = roundOf("Warm up", [readyQuestion("Easy one")]);
    const draft = draftOf([
      roundOf("Opener", [readyQuestion("Q1")]),
      { ...warmUp, settings: { ...warmUp.settings, isWarmUp: true } },
    ]);

    // The whole draft holds a warm-up after the first round, which blocks it.
    expect(
      quizshowProblemsFor(draftToInput(draft, null), { isAdultsEvent: true }),
    ).toContainEqual(
      expect.objectContaining({ code: "warm_up_not_first", roundIndex: 1 }),
    );
    // Sliced, the warm-up opens the try-out, so it plays.
    expect(sliceProblemsOfWholeDraft(draft, { roundIndex: 1 })).toEqual([]);
    const quiz = dryRunQuizOf(draft, NO_PICKED_PREVIEWS, { roundIndex: 1 });
    expect(quiz.rounds).toHaveLength(1);
    expect(quiz.rounds[0]?.settings.isWarmUp).toBe(true);
  });
});

describe("sliceProblemsOf", () => {
  it("reads the slice's problems from a list worked out for the whole draft", () => {
    const draft = draftOf([
      roundOf("Opener", [readyQuestion("Q1"), everyOptionCorrect("Q2")]),
      roundOf("Second", [everyOptionCorrect("R1")]),
    ]);
    const wholeDraftProblems = quizshowProblemsFor(draftToInput(draft, null), {
      isAdultsEvent: true,
    });

    expect(
      sliceProblemsOf(wholeDraftProblems, draft, { roundIndex: 0 }),
    ).toContainEqual(
      expect.objectContaining({
        code: "too_many_correct_options",
        roundIndex: 0,
        questionIndex: 1,
      }),
    );
    expect(
      sliceProblemsOf(wholeDraftProblems, draft, { roundIndex: 0 }).every(
        (found) => found.roundIndex === 0,
      ),
    ).toBe(true);
    expect(
      sliceProblemsOf(wholeDraftProblems, draft, {
        roundIndex: 0,
        fromQuestionIndex: 5,
      }),
    ).toEqual([expect.objectContaining({ code: "round_empty" })]);
  });
});
