import { describe, expect, it } from "vitest";
import type { QuizshowQuestion } from "../../../shared/contracts/quizshow";
import {
  captionAuthorPoints,
  closestNumberOutcomes,
  competitionRanks,
  isFakeTooClose,
  isTypedAnswerCorrect,
  lieDetectorPlayerPoints,
  normaliseAnswerText,
  scoreQuizAnswer,
  speedPoints,
  streakBonusFor,
  teamQuestionPoints,
  type QuizAnswerScoringInput,
} from "./quizshowScoring";

const questionShared = {
  id: "question-1",
  prompt: { en: "Which one?", pt: "Qual?" },
  mediaRef: null,
  mediaUrl: null,
  timeLimitSeconds: null,
};

function multipleChoice(points: number): QuizshowQuestion {
  return {
    ...questionShared,
    type: "multiple_choice",
    points,
    options: [
      { id: "first", text: { en: "First", pt: "Primeira" } },
      { id: "second", text: { en: "Second", pt: "Segunda" } },
      { id: "third", text: { en: "Third", pt: "Terceira" } },
    ],
    answer: { correctIndex: 1 },
    acceptedAnswers: [],
  };
}

function orderQuestion(optionIds: string[]): QuizshowQuestion {
  return {
    ...questionShared,
    type: "order",
    points: 1000,
    options: optionIds.map((optionId) => ({
      id: optionId,
      text: { en: optionId, pt: optionId },
    })),
    answer: { orderedIds: optionIds },
    acceptedAnswers: [],
  };
}

function closestNumberQuestion(points: number): QuizshowQuestion {
  return {
    ...questionShared,
    type: "closest_number",
    points,
    options: [],
    answer: { value: 1969 },
    acceptedAnswers: [],
  };
}

const base: QuizAnswerScoringInput = {
  question: multipleChoice(1000),
  payload: { type: "multiple_choice", optionIndex: 1 },
  elapsedMs: 0,
  limitMs: 20_000,
  isSpeedBonusOn: true,
  streakBefore: 0,
  isJokerActive: false,
  closest: null,
};

const orderInput: QuizAnswerScoringInput = {
  ...base,
  question: orderQuestion(["a", "b", "c", "d"]),
  payload: { type: "order", orderedIds: ["a", "b", "c", "d"] },
};

const closestInput: QuizAnswerScoringInput = {
  ...base,
  question: closestNumberQuestion(1000),
  payload: { type: "closest_number", value: 1800 },
  closest: { isClosest: true, isWithinBand: true },
};

describe("quizshow scoring", () => {
  it("scores a correct answer at half the limit as 750", () => {
    expect(speedPoints(1000, 10_000, 20_000, true)).toBe(750);
  });
  it("gives the slowest correct answer half and the instant one full", () => {
    expect(speedPoints(1000, 20_000, 20_000, true)).toBe(500);
    expect(speedPoints(1000, 0, 20_000, true)).toBe(1000);
    expect(speedPoints(1000, 25_000, 20_000, true)).toBe(500); // clamped to the limit
  });
  it("gives every correct answer the full base with the speed bonus off", () => {
    expect(speedPoints(2000, 19_000, 20_000, false)).toBe(2000);
  });
  it("measures an extra-time player against their own longer limit", () => {
    expect(speedPoints(1000, 15_000, 30_000, true)).toBe(750);
  });
  it("adds 100 per correct answer in a row and caps the streak bonus at 500", () => {
    expect(streakBonusFor(1)).toBe(100);
    expect(streakBonusFor(5)).toBe(500);
    expect(streakBonusFor(9)).toBe(500);
  });
  it("resets the streak on a miss and on no answer", () => {
    const missed = scoreQuizAnswer({
      ...base,
      payload: { type: "multiple_choice", optionIndex: 2 },
      streakBefore: 4,
    });
    expect(missed).toMatchObject({
      isCorrect: false,
      pointsAwarded: 0,
      streakAfter: 0,
    });
    const silent = scoreQuizAnswer({ ...base, payload: null, streakBefore: 4 });
    expect(silent.streakAfter).toBe(0);
  });
  it("doubles a joker round after the streak", () => {
    const score = scoreQuizAnswer({
      ...base,
      elapsedMs: 10_000,
      streakBefore: 2,
      isJokerActive: true,
    });
    expect(score).toMatchObject({
      basePoints: 750,
      streakBonus: 300,
      streakAfter: 3,
      pointsAwarded: 2100,
    });
  });
  it("leaves order positions null for a silent player and for a payload of another type", () => {
    const silent = scoreQuizAnswer({ ...orderInput, payload: null });
    expect(silent).toMatchObject({
      isCorrect: false,
      correctPositions: null,
      basePoints: 0,
      pointsAwarded: 0,
      streakAfter: 0,
    });
    const mismatched = scoreQuizAnswer({
      ...orderInput,
      payload: { type: "multiple_choice", optionIndex: 0 },
    });
    expect(mismatched).toMatchObject({
      isCorrect: false,
      correctPositions: null,
      pointsAwarded: 0,
    });
  });
  it("scores an exact order with the speed bonus and a partial order by position with none", () => {
    const exact = scoreQuizAnswer({
      ...orderInput,
      payload: { type: "order", orderedIds: ["a", "b", "c", "d"] },
      elapsedMs: 10_000,
    });
    expect(exact).toMatchObject({
      isCorrect: true,
      correctPositions: 4,
      basePoints: 750,
    });
    const partial = scoreQuizAnswer({
      ...orderInput,
      payload: { type: "order", orderedIds: ["a", "b", "d", "c"] },
      elapsedMs: 1_000,
    });
    expect(partial).toMatchObject({
      isCorrect: false,
      correctPositions: 2,
      basePoints: 500,
      streakAfter: 0,
    });
  });
  it("gives the closest players the base and anyone within 10% half", () => {
    const outcomes = closestNumberOutcomes(1969, [
      { playerId: "rita", value: 1970 },
      { playerId: "nuno", value: 1968 },
      { playerId: "ines", value: 1800 },
      { playerId: "tomas", value: 2500 },
    ]);
    expect(outcomes.get("rita")).toEqual({
      isClosest: true,
      isWithinBand: true,
    });
    expect(outcomes.get("nuno")).toEqual({
      isClosest: true,
      isWithinBand: true,
    });
    expect(outcomes.get("ines")).toEqual({
      isClosest: false,
      isWithinBand: true,
    });
    expect(outcomes.get("tomas")).toEqual({
      isClosest: false,
      isWithinBand: false,
    });
    const half = scoreQuizAnswer({
      ...closestInput,
      closest: { isClosest: false, isWithinBand: true },
    });
    expect(half).toMatchObject({ basePoints: 500, isCorrect: false });
  });
  it("keeps a decimal tie fair", () => {
    const outcomes = closestNumberOutcomes(0.3, [
      { playerId: "rita", value: 0.2 },
      { playerId: "nuno", value: 0.4 },
    ]);
    expect(outcomes.get("rita")?.isClosest).toBe(true);
    expect(outcomes.get("nuno")?.isClosest).toBe(true);
  });
  it("counts an answer exactly at the band edge", () => {
    const outcomes = closestNumberOutcomes(2, [
      { playerId: "rita", value: 2.2 },
      { playerId: "nuno", value: 1.8 },
    ]);
    expect(outcomes.get("rita")?.isWithinBand).toBe(true);
    expect(outcomes.get("nuno")?.isWithinBand).toBe(true);
    const withExactAnswer = closestNumberOutcomes(2, [
      { playerId: "ines", value: 2 },
      { playerId: "rita", value: 2.2 },
      { playerId: "nuno", value: 1.8 },
    ]);
    expect(withExactAnswer.get("rita")).toEqual({
      isClosest: false,
      isWithinBand: true,
    });
    expect(withExactAnswer.get("nuno")).toEqual({
      isClosest: false,
      isWithinBand: true,
    });
  });
  it("never counts an order with no items as correct", () => {
    const empty = scoreQuizAnswer({
      ...base,
      question: orderQuestion([]),
      payload: { type: "order", orderedIds: [] },
    });
    expect(empty).toMatchObject({
      isCorrect: false,
      correctPositions: 0,
      basePoints: 0,
      pointsAwarded: 0,
      streakAfter: 0,
    });
  });
});

describe("quizshow answer matching, party points and ranks", () => {
  it("matches typed answers without case, accents or punctuation, with one slip on long answers", () => {
    const key = { en: "Marsha P. Johnson", pt: "Marsha P. Johnson" };
    expect(isTypedAnswerCorrect("marsha p johnson", key, [])).toBe(true);
    expect(isTypedAnswerCorrect("Marsha P Jonson", key, [])).toBe(true);
    expect(
      isTypedAnswerCorrect(
        "Stonewall",
        { en: "Stonewall", pt: "Stonewall" },
        [],
      ),
    ).toBe(true);
    expect(
      isTypedAnswerCorrect("Lisboa", { en: "Lisbon", pt: "Lisboa" }, []),
    ).toBe(true);
    expect(isTypedAnswerCorrect("cat", { en: "car", pt: "" }, [])).toBe(false); // under five letters: exact only
    expect(
      isTypedAnswerCorrect("Conchita", { en: "Conchita Wurst", pt: "" }, [
        "Conchita",
      ]),
    ).toBe(true);
    expect(
      isTypedAnswerCorrect("Conchtia", { en: "Conchita", pt: "" }, []),
    ).toBe(true); // a swap of neighbours
    expect(isTypedAnswerCorrect("RU PAUL", { en: "RuPaul", pt: "" }, [])).toBe(
      true,
    ); // spaces never count
    expect(isTypedAnswerCorrect("", { en: "Stonewall", pt: "" }, [])).toBe(
      false,
    );
    expect(normaliseAnswerText("  Ça   Va?! ")).toBe("ca va");
  });
  it("turns away a fake the typed-answer matcher would accept as the truth", () => {
    expect(isFakeTooClose("1969!", { en: "1969", pt: "1969" })).toBe(true);
    expect(isFakeTooClose("1970", { en: "1969", pt: "1969" })).toBe(false);
    expect(
      isFakeTooClose("Amsterdan", { en: "Amsterdam", pt: "Amesterdão" }),
    ).toBe(true);
  });
  it("pays party authors per vote plus the favourite, doubled by a joker", () => {
    expect(
      captionAuthorPoints({
        votesReceived: 3,
        isFavourite: true,
        isJokerActive: false,
      }),
    ).toBe(1250);
    expect(
      captionAuthorPoints({
        votesReceived: 2,
        isFavourite: false,
        isJokerActive: true,
      }),
    ).toBe(1000);
    expect(
      lieDetectorPlayerPoints({
        hasPickedTruth: true,
        playersFooled: 2,
        isJokerActive: false,
      }),
    ).toBe(2000);
  });
  it("averages a team over members present when the question opened", () => {
    expect(teamQuestionPoints([1000, 0, 500])).toBe(500);
    expect(teamQuestionPoints([750, 760])).toBe(755);
    expect(teamQuestionPoints([])).toBe(0);
  });
  it("ranks ties together and skips the next place", () => {
    const ranked = competitionRanks([
      { entrantId: "entrant-b", name: "Bea", score: 900 },
      { entrantId: "entrant-a", name: "Alex", score: 900 },
      { entrantId: "entrant-k", name: "Kiko", score: 400 },
    ]);
    expect(ranked.map((entry) => [entry.name, entry.rank])).toEqual([
      ["Alex", 1],
      ["Bea", 1],
      ["Kiko", 3],
    ]);
  });
  it("orders tied scores with names equal ignoring case by entrant id", () => {
    const ranked = competitionRanks([
      { entrantId: "entrant-2", name: "alex", score: 600 },
      { entrantId: "entrant-1", name: "Alex", score: 600 },
      { entrantId: "entrant-3", name: "ALEX", score: 600 },
    ]);
    expect(ranked.map((entry) => [entry.entrantId, entry.rank])).toEqual([
      ["entrant-1", 1],
      ["entrant-2", 1],
      ["entrant-3", 1],
    ]);
  });
});
