import { describe, expect, it } from "vitest";
import {
  QUIZSHOW_LIMITS,
  type QuizshowQuiz,
} from "../../shared/contracts/quizshow";
import {
  foldNameKey,
  normaliseStoredQuestion,
  normaliseStoredQuiz,
  normaliseStoredQuizShape,
  normaliseStoredRoundSettings,
  suggestedScreenNameFor,
  type QuizshowStoredQuestionInput,
  type QuizshowStoredRoundSettings,
} from "./quizshowNormalise";

const EMPTY_TEXT = { en: "", pt: "" };

function storedMultipleChoice(): QuizshowStoredQuestionInput {
  return {
    type: "multiple_choice",
    prompt: { en: "Which city", pt: "Que cidade" },
    mediaRef: null,
    timeLimitSeconds: null,
    points: 1000,
    options: [
      { id: "o1", text: { en: "Lisbon", pt: "Lisboa" } },
      { id: "o2", text: { en: "Porto", pt: "Porto" } },
    ],
    answer: { correctIndex: 1 },
    acceptedAnswers: [],
  };
}

function storedClosest(): QuizshowStoredQuestionInput {
  return {
    type: "closest_number",
    prompt: { en: "How many", pt: "Quantos" },
    mediaRef: null,
    timeLimitSeconds: null,
    points: 1000,
    options: [],
    answer: { value: 1969 },
    acceptedAnswers: [],
  };
}

function storedSettings(): QuizshowStoredRoundSettings {
  return {
    timeLimitSeconds: 20,
    isSpeedBonusOn: true,
    isJokerAllowed: true,
    writeSeconds: 60,
    voteSeconds: 30,
    wheelBonus: 0,
    wheelPick: "round",
    sliceCount: null,
  };
}

describe("normaliseStoredQuestion", () => {
  it("reads a stored multiple choice answer as a list of correct indexes", () => {
    const question = normaliseStoredQuestion(storedMultipleChoice());
    expect(question.answer).toEqual({ correctIndexes: [1] });
  });

  it("reads a closest answer without a tolerance as within the legacy percent", () => {
    const question = normaliseStoredQuestion({
      ...storedClosest(),
      answer: { value: 250 },
    });
    expect(question.answer).toEqual({
      value: 250,
      tolerance: {
        mode: "percent",
        amount: QUIZSHOW_LIMITS.closestLegacyPercent,
      },
    });
    expect(QUIZSHOW_LIMITS.closestLegacyPercent).toBe(10);
  });

  it("reads a whole year without a tolerance as within 10 years before 1990 and 5 from 1990", () => {
    const answerFor = (value: number) =>
      normaliseStoredQuestion({ ...storedClosest(), answer: { value } }).answer;
    expect(answerFor(1969)).toEqual({
      value: 1969,
      tolerance: { mode: "absolute", amount: 10 },
    });
    expect(answerFor(1000)).toEqual({
      value: 1000,
      tolerance: { mode: "absolute", amount: 10 },
    });
    expect(answerFor(1990)).toEqual({
      value: 1990,
      tolerance: { mode: "absolute", amount: 5 },
    });
    expect(answerFor(2100)).toEqual({
      value: 2100,
      tolerance: { mode: "absolute", amount: 5 },
    });
  });

  it("keeps the legacy percent for a value outside the years or with a fraction", () => {
    const legacyPercent = {
      mode: "percent",
      amount: QUIZSHOW_LIMITS.closestLegacyPercent,
    };
    for (const value of [999, 2101, 1984.5]) {
      const answer = normaliseStoredQuestion({
        ...storedClosest(),
        answer: { value },
      }).answer;
      expect(answer).toEqual({ value, tolerance: legacyPercent });
    }
  });

  it("keeps a closest answer that already carries a tolerance", () => {
    const question = normaliseStoredQuestion({
      ...storedClosest(),
      answer: { value: 12, tolerance: { mode: "absolute", amount: 2 } },
    });
    expect(question.answer).toEqual({
      value: 12,
      tolerance: { mode: "absolute", amount: 2 },
    });
  });

  it("fills the missing picture text, reveal note and number unit with blank text", () => {
    const question = normaliseStoredQuestion(storedClosest());
    expect(question.mediaAlt).toEqual(EMPTY_TEXT);
    expect(question.revealNote).toEqual(EMPTY_TEXT);
    expect(question.numberUnit).toEqual(EMPTY_TEXT);
  });

  it("reads a missing picture reveal as instant", () => {
    expect(normaliseStoredQuestion(storedClosest()).mediaReveal).toBe(
      "instant",
    );
  });

  it("keeps a null answer null", () => {
    const question = normaliseStoredQuestion({
      ...storedMultipleChoice(),
      answer: null,
    });
    expect(question.answer).toBeNull();
  });

  it("keeps the id and picture url of a stored question", () => {
    const question = normaliseStoredQuestion({
      ...storedMultipleChoice(),
      id: "question-1",
      mediaUrl: "https://example.com/picture.jpg",
    });
    expect(question.id).toBe("question-1");
    expect(question.mediaUrl).toBe("https://example.com/picture.jpg");
  });

  it("gives the same question when run twice", () => {
    for (const stored of [storedMultipleChoice(), storedClosest()]) {
      const once = normaliseStoredQuestion(stored);
      expect(normaliseStoredQuestion(once)).toEqual(once);
    }
  });

  it("leaves its input untouched", () => {
    const stored = storedMultipleChoice();
    normaliseStoredQuestion(stored);
    expect(stored.answer).toEqual({ correctIndex: 1 });
    expect(stored.mediaAlt).toBeUndefined();
  });
});

describe("normaliseStoredRoundSettings", () => {
  it("reads missing warm-up and talk seconds as off and 0", () => {
    const settings = normaliseStoredRoundSettings(storedSettings());
    expect(settings.isWarmUp).toBe(false);
    expect(settings.talkSeconds).toBe(0);
  });

  it("keeps stored warm-up and talk seconds", () => {
    const settings = normaliseStoredRoundSettings({
      ...storedSettings(),
      isWarmUp: true,
      talkSeconds: 20,
    });
    expect(settings.isWarmUp).toBe(true);
    expect(settings.talkSeconds).toBe(20);
  });

  it("gives the same settings when run twice", () => {
    const once = normaliseStoredRoundSettings(storedSettings());
    expect(normaliseStoredRoundSettings(once)).toEqual(once);
  });
});

describe("normaliseStoredQuizShape and normaliseStoredQuiz", () => {
  it("normalises every round and question of a stored quiz shape", () => {
    const shape = normaliseStoredQuizShape({
      title: "Pride quiz",
      languages: "both",
      screenLanguage: "en",
      rounds: [
        {
          kind: "quiz",
          title: { en: "Round one", pt: "Ronda um" },
          contentLabel: "none",
          settings: storedSettings(),
          questions: [storedMultipleChoice(), storedClosest()],
        },
      ],
    });
    expect(shape.rounds[0]?.settings.isWarmUp).toBe(false);
    expect(shape.rounds[0]?.questions[0]?.answer).toEqual({
      correctIndexes: [1],
    });
    expect(shape.rounds[0]?.questions[1]?.mediaReveal).toBe("instant");
    expect(normaliseStoredQuizShape(shape)).toEqual(shape);
  });

  it("fills a missing template reference with null and keeps the ids", () => {
    const quiz: QuizshowQuiz = normaliseStoredQuiz({
      title: "Pride quiz",
      languages: "en",
      screenLanguage: "en",
      sourceTemplateId: null,
      updatedAt: "2026-11-01T00:00:00.000Z",
      rounds: [
        {
          id: "round-1",
          kind: "quiz",
          title: { en: "Round one", pt: "" },
          contentLabel: "none",
          settings: storedSettings(),
          questions: [
            { ...storedMultipleChoice(), id: "question-1", mediaUrl: null },
          ],
        },
      ],
    });
    expect(quiz.sourceTemplate).toBeNull();
    expect(quiz.rounds[0]?.id).toBe("round-1");
    expect(quiz.rounds[0]?.questions[0]?.id).toBe("question-1");
    expect(quiz.rounds[0]?.questions[0]?.answer).toEqual({
      correctIndexes: [1],
    });
    expect(normaliseStoredQuiz(quiz)).toEqual(quiz);
  });
});

describe("foldNameKey", () => {
  it("folds accents, case and spacing into one key", () => {
    expect(foldNameKey("  Álex   Silva ")).toBe(foldNameKey("alex silva"));
    expect(foldNameKey("alex silva")).toBe("alex silva");
  });
});

describe("suggestedScreenNameFor", () => {
  it("skips a taken suggestion and returns the next free one", () => {
    expect(suggestedScreenNameFor("Alex", ["Alex", "alex 2"])).toBe("Alex 3");
  });

  it("starts at 2 when nothing numbered is taken", () => {
    expect(suggestedScreenNameFor("Alex", ["Alex"])).toBe("Alex 2");
  });

  it("trims a long base so the suggestion fits the screen name limit", () => {
    const base = "A".repeat(QUIZSHOW_LIMITS.screenNameMax);
    const suggestion = suggestedScreenNameFor(base, [base]);
    expect(suggestion).toHaveLength(QUIZSHOW_LIMITS.screenNameMax);
    expect(suggestion).toBe(`${"A".repeat(28)} 2`);
  });

  it("returns null when every number from 2 to 99 is taken", () => {
    const taken = Array.from(
      { length: 98 },
      (_, offset) => `Alex ${offset + 2}`,
    );
    expect(suggestedScreenNameFor("Alex", taken)).toBeNull();
  });
});
