import { describe, expect, it } from "vitest";
import type {
  QuizshowMyReveal,
  QuizshowQuestionType,
  QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import {
  summariseNight,
  withNightEntry,
  type QuizshowNightEntry,
} from "./quizshowNightLog";

function questionWith(
  questionId: string,
  type: QuizshowQuestionType = "true_false",
): QuizshowQuestionView {
  return {
    questionId,
    roundIndex: 0,
    questionIndex: 0,
    roundKind: "quiz",
    type,
    prompt: { en: "Is this a question", pt: "Isto e uma pergunta" },
    mediaUrl: null,
    points: 1000,
    timeLimitSeconds: 20,
    mediaAlt: { en: "", pt: "" },
    mediaReveal: "instant",
    numberUnit: { en: "", pt: "" },
    readMs: 4000,
    options: null,
  };
}

function myRevealWith(
  questionId: string,
  overrides: Partial<QuizshowMyReveal> = {},
): QuizshowMyReveal {
  return {
    phaseId: "5",
    questionId,
    hasAnswered: true,
    ownAnswerId: "answer-1",
    isCorrect: true,
    correctPositions: null,
    pointsAwarded: 900,
    streakBonus: 0,
    isJokerActive: false,
    streak: 1,
    score: 900,
    teamScore: null,
    rank: 1,
    ...overrides,
  };
}

function entryWith(
  questionId: string,
  overrides: Partial<QuizshowNightEntry> = {},
): QuizshowNightEntry {
  return {
    questionId,
    roundIndex: 0,
    questionIndex: 0,
    isWarmUp: false,
    question: questionWith(questionId),
    myAnswer: null,
    myReveal: null,
    correct: null,
    note: null,
    ...overrides,
  };
}

describe("withNightEntry", () => {
  it("appends a question the log has not seen, with empty answer fields", () => {
    const log = withNightEntry([], {
      questionId: "q1",
      question: questionWith("q1"),
      isWarmUp: true,
    });
    expect(log).toEqual([entryWith("q1", { isWarmUp: true })]);
  });

  it("leaves the log as it was for an unknown question without a view", () => {
    const log = [entryWith("q1")];
    expect(withNightEntry(log, { questionId: "q2", note: null })).toEqual(log);
  });

  it("clears a field given as an explicit null", () => {
    const log = withNightEntry(
      [entryWith("q1", { myReveal: myRevealWith("q1") })],
      { questionId: "q1", myReveal: null },
    );
    expect(log[0]?.myReveal).toBeNull();
  });

  it("merges an update into its entry and keeps the fields it leaves out", () => {
    const reveal = myRevealWith("q1");
    const log = withNightEntry([entryWith("q1"), entryWith("q2")], {
      questionId: "q1",
      myReveal: reveal,
      correct: undefined,
    });
    expect(log[0]?.myReveal).toBe(reveal);
    expect(log[0]?.question.questionId).toBe("q1");
    expect(log[1]).toEqual(entryWith("q2"));
  });
});

describe("summariseNight", () => {
  it("counts scored questions only and leaves polls, warm-ups and skips out", () => {
    const log = [
      entryWith("q1", { myReveal: myRevealWith("q1", { streak: 1 }) }),
      entryWith("q2", {
        myReveal: myRevealWith("q2", { isCorrect: false, streak: 0 }),
      }),
      entryWith("q3", {
        question: questionWith("q3", "poll"),
        myReveal: myRevealWith("q3", { isCorrect: null }),
      }),
      entryWith("q4", {
        isWarmUp: true,
        myReveal: myRevealWith("q4", { isCorrect: true }),
      }),
      entryWith("q5"),
      entryWith("q6", {
        myReveal: myRevealWith("q6", { hasAnswered: false, isCorrect: false }),
      }),
    ];
    expect(summariseNight(log, 3)).toEqual({
      rightCount: 1,
      answeredCount: 2,
      bestStreak: 1,
      jokerPoints: 0,
      finalPlace: 3,
    });
  });

  it("reads the best streak and the joker's doubled half", () => {
    const log = [
      entryWith("q1", { myReveal: myRevealWith("q1", { streak: 1 }) }),
      entryWith("q2", {
        myReveal: myRevealWith("q2", {
          streak: 2,
          pointsAwarded: 2000,
          isJokerActive: true,
        }),
      }),
      entryWith("q3", { myReveal: myRevealWith("q3", { streak: 3 }) }),
      entryWith("q4", {
        myReveal: myRevealWith("q4", { isCorrect: false, streak: 0 }),
      }),
    ];
    const summary = summariseNight(log, null);
    expect(summary.bestStreak).toBe(3);
    expect(summary.jokerPoints).toBe(1000);
    expect(summary.finalPlace).toBeNull();
  });

  it("leaves an answer out until its reveal says it was scored", () => {
    const log = [
      entryWith("q1", {
        myAnswer: {
          questionId: "q1",
          phaseId: "5",
          payload: { type: "true_false", isTrue: true },
          receivedAt: 1_000,
        },
      }),
    ];
    expect(summariseNight(log, null).answeredCount).toBe(0);
  });
});
