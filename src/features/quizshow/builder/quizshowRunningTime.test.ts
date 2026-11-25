import { describe, expect, it } from "vitest";
import {
  newQuestion,
  newRound,
  newWheel,
  type QuizshowDraft,
  type QuizshowDraftRound,
} from "./quizshowDraft";
import { estimateRunningMinutes } from "./quizshowRunningTime";

/** A quiz round of `count` blank multiple choice questions (each reads for the 3 s minimum). */
function quizRound(
  count: number,
  settings: Partial<QuizshowDraftRound["settings"]> = {},
): QuizshowDraftRound {
  const round = newRound("quiz");
  return {
    ...round,
    settings: { ...round.settings, ...settings },
    questions: Array.from({ length: count }, (_unused, questionIndex) => ({
      draftKey: `${round.draftKey}-question-${questionIndex}`,
      question: newQuestion("multiple_choice", "quiz"),
      mediaUrl: null,
    })),
  };
}

/** A Caption this round of `count` blank prompts. */
function partyRound(count: number): QuizshowDraftRound {
  const round = newRound("caption_this");
  return {
    ...round,
    questions: Array.from({ length: count }, (_unused, questionIndex) => ({
      draftKey: `${round.draftKey}-prompt-${questionIndex}`,
      question: newQuestion("prompt", "caption_this"),
      mediaUrl: null,
    })),
  };
}

function draftOf(rounds: QuizshowDraftRound[]): QuizshowDraft {
  return { title: "Quiz night", languages: "en", screenLanguage: "en", rounds };
}

describe("estimateRunningMinutes", () => {
  it("adds every question, round and wheel and rounds to 5 minutes", () => {
    // Quiz: 10 x (3 s read + 20 s limit + 12 s) + 8 s intro + 15 s leaderboard = 373 s.
    // Party: 3 x (60 s write + 30 s vote + 25 s) + 8 s + 15 s = 368 s. Wheel: 20 s.
    // 761 s is 12.7 minutes, so about 15.
    const draft = draftOf([quizRound(10), newWheel(), partyRound(3)]);
    expect(estimateRunningMinutes(draft)).toBe(15);
  });

  it("reads a question's own time limit over the round's", () => {
    // Round limit: 5 x (3 s + 20 s + 12 s) + 8 s + 15 s = 198 s, about 5.
    // Own 120 s limits: 5 x (3 s + 120 s + 12 s) + 8 s + 15 s = 698 s
    // (11.6 minutes), about 10.
    const round = quizRound(5);
    const withOwnLimits: QuizshowDraftRound = {
      ...round,
      questions: round.questions.map((draftQuestion) => ({
        ...draftQuestion,
        question: { ...draftQuestion.question, timeLimitSeconds: 120 },
      })),
    };
    expect(estimateRunningMinutes(draftOf([round]))).toBe(5);
    expect(estimateRunningMinutes(draftOf([withOwnLimits]))).toBe(10);
  });

  it("leaves the leaderboard out after a warm-up round", () => {
    // 4 x (3 s + 95 s + 12 s) + 8 s = 448 s (7.47 minutes) for the warm-up;
    // the 15 s leaderboard of a scored round makes 463 s (7.72 minutes).
    const warmUp = draftOf([
      quizRound(4, { timeLimitSeconds: 95, isWarmUp: true }),
    ]);
    const scored = draftOf([quizRound(4, { timeLimitSeconds: 95 })]);
    expect(estimateRunningMinutes(warmUp)).toBe(5);
    expect(estimateRunningMinutes(scored)).toBe(10);
  });

  it("never says less than 5 minutes", () => {
    expect(estimateRunningMinutes(draftOf([]))).toBe(5);
    expect(estimateRunningMinutes(draftOf([quizRound(1)]))).toBe(5);
  });
});
