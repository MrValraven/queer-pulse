import { describe, expect, it } from "vitest";
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
  type QuizshowAnswerPayload,
  type QuizshowClosestTolerance,
  type QuizshowPhase,
  type QuizshowPlayMode,
  type QuizshowQuestion,
  type QuizshowRoundKind,
  type QuizshowRoundSettings,
} from "../../../shared/contracts/quizshow";
import {
  createQuizshowEngineState,
  currentPlayContext,
} from "./quizshowEngineSetup";
import {
  effectiveAnswerKey,
  rescoreQuestion,
  scoreQuestionOnce,
} from "./quizshowEngineScoringStep";
import type {
  QuizshowEngineAnswer,
  QuizshowEnginePlayer,
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
  QuizshowEngineTeam,
} from "./quizshowEngineTypes";
import { quizshowRandomFrom } from "./quizshowRandom";
import {
  captionAuthorPoints,
  closestBandWidth,
  closestNumberOutcomes,
  competitionRanks,
  isFakeTooClose,
  isTypedAnswerCorrect,
  lieDetectorPlayerPoints,
  normaliseAnswerText,
  normaliseTypedAnswer,
  pointsSinceBaseline,
  scoreQuizAnswer,
  speedPoints,
  streakBonusFor,
  teamQuestionPoints,
  wheelBonusWinnerIds,
  type QuizAnswerScoringInput,
} from "./quizshowScoring";

const questionShared = {
  id: "question-1",
  prompt: { en: "Which one?", pt: "Qual?" },
  mediaRef: null,
  mediaUrl: null,
  mediaAlt: { en: "", pt: "" },
  mediaReveal: "instant" as const,
  revealNote: { en: "", pt: "" },
  numberUnit: { en: "", pt: "" },
  timeLimitSeconds: null,
};

const EXACT: QuizshowClosestTolerance = { mode: "exact", amount: 0 };
const WITHIN_10: QuizshowClosestTolerance = { mode: "absolute", amount: 10 };
const WITHIN_10_PERCENT: QuizshowClosestTolerance = {
  mode: "percent",
  amount: 10,
};

function multipleChoice(
  points: number,
  correctIndexes: number[] = [1],
): QuizshowQuestion {
  return {
    ...questionShared,
    type: "multiple_choice",
    points,
    options: [
      { id: "first", text: { en: "First", pt: "Primeira" } },
      { id: "second", text: { en: "Second", pt: "Segunda" } },
      { id: "third", text: { en: "Third", pt: "Terceira" } },
    ],
    answer: { correctIndexes },
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
    answer: { value: 1969, tolerance: WITHIN_10_PERCENT },
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
    const outcomes = closestNumberOutcomes(1969, WITHIN_10_PERCENT, [
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
    const outcomes = closestNumberOutcomes(0.3, WITHIN_10_PERCENT, [
      { playerId: "rita", value: 0.2 },
      { playerId: "nuno", value: 0.4 },
    ]);
    expect(outcomes.get("rita")?.isClosest).toBe(true);
    expect(outcomes.get("nuno")?.isClosest).toBe(true);
  });
  it("counts an answer exactly at the band edge", () => {
    const outcomes = closestNumberOutcomes(2, WITHIN_10_PERCENT, [
      { playerId: "rita", value: 2.2 },
      { playerId: "nuno", value: 1.8 },
    ]);
    expect(outcomes.get("rita")?.isWithinBand).toBe(true);
    expect(outcomes.get("nuno")?.isWithinBand).toBe(true);
    const withExactAnswer = closestNumberOutcomes(2, WITHIN_10_PERCENT, [
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

describe("closest-number tolerance", () => {
  it("reads the band width from the tolerance mode", () => {
    expect(closestBandWidth(1969, EXACT)).toBe(0);
    expect(closestBandWidth(1969, WITHIN_10)).toBe(10);
    expect(closestBandWidth(1969, WITHIN_10_PERCENT)).toBeCloseTo(196.9);
    expect(closestBandWidth(-50, WITHIN_10_PERCENT)).toBe(5);
    expect(closestBandWidth(0, WITHIN_10_PERCENT)).toBe(0);
  });

  it("scores exact ties as closest and nothing else under an exact tolerance", () => {
    const outcomes = closestNumberOutcomes(1969, EXACT, [
      { playerId: "rita", value: 1970 },
      { playerId: "nuno", value: 1968 },
      { playerId: "ines", value: 1971 },
    ]);
    expect(outcomes.get("rita")?.isClosest).toBe(true);
    expect(outcomes.get("nuno")?.isClosest).toBe(true);
    expect(outcomes.get("ines")).toEqual({
      isClosest: false,
      isWithinBand: false,
    });
  });

  it("bands an absolute 10 on 1969 up to the edge and no further", () => {
    const outcomes = closestNumberOutcomes(1969, WITHIN_10, [
      { playerId: "rita", value: 1969 },
      { playerId: "nuno", value: 1979 },
      { playerId: "ines", value: 1959 },
      { playerId: "tomas", value: 1980 },
    ]);
    expect(outcomes.get("rita")?.isClosest).toBe(true);
    expect(outcomes.get("nuno")).toEqual({
      isClosest: false,
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
  });

  it("bands a percent of 0 at 0, so only the closest answers score", () => {
    const outcomes = closestNumberOutcomes(0, WITHIN_10_PERCENT, [
      { playerId: "rita", value: 1 },
      { playerId: "nuno", value: -1 },
      { playerId: "ines", value: 2 },
    ]);
    expect(outcomes.get("rita")?.isClosest).toBe(true);
    expect(outcomes.get("nuno")?.isClosest).toBe(true);
    expect(outcomes.get("ines")).toEqual({
      isClosest: false,
      isWithinBand: false,
    });
  });

  it("compares distances at 12 significant digits at the band edge", () => {
    // 0.4 - 0.3 and 0.3 - 0.2 miss 0.1 by float noise; both still band.
    const outcomes = closestNumberOutcomes(
      0.3,
      { mode: "absolute", amount: 0.1 },
      [
        { playerId: "rita", value: 0.3 },
        { playerId: "nuno", value: 0.4 },
        { playerId: "ines", value: 0.2 },
        { playerId: "tomas", value: 0.41 },
      ],
    );
    expect(outcomes.get("rita")?.isClosest).toBe(true);
    expect(outcomes.get("nuno")?.isWithinBand).toBe(true);
    expect(outcomes.get("ines")?.isWithinBand).toBe(true);
    expect(outcomes.get("tomas")?.isWithinBand).toBe(false);
  });
});

describe("several correct options, polls, warm-up and accepted texts", () => {
  const twoCorrect = multipleChoice(1000, [0, 2]);
  const poll: QuizshowQuestion = {
    ...questionShared,
    type: "poll",
    points: 1000,
    options: [
      { id: "first", text: { en: "First", pt: "Primeira" } },
      { id: "second", text: { en: "Second", pt: "Segunda" } },
    ],
    answer: null,
    acceptedAnswers: [],
  };

  it("counts any of two correct options as right", () => {
    for (const optionIndex of [0, 2]) {
      const score = scoreQuizAnswer({
        ...base,
        question: twoCorrect,
        payload: { type: "multiple_choice", optionIndex },
      });
      expect(score).toMatchObject({ isCorrect: true, basePoints: 1000 });
    }
    const wrong = scoreQuizAnswer({
      ...base,
      question: twoCorrect,
      payload: { type: "multiple_choice", optionIndex: 1 },
    });
    expect(wrong).toMatchObject({ isCorrect: false, pointsAwarded: 0 });
  });

  it("judges by a host's changed key when one is given", () => {
    const changed = scoreQuizAnswer({
      ...base,
      answerKey: { type: "multiple_choice", correctIndexes: [2] },
      payload: { type: "multiple_choice", optionIndex: 2 },
    });
    expect(changed.isCorrect).toBe(true);
    const formerKey = scoreQuizAnswer({
      ...base,
      answerKey: { type: "multiple_choice", correctIndexes: [2] },
      payload: { type: "multiple_choice", optionIndex: 1 },
    });
    expect(formerKey.isCorrect).toBe(false);
  });

  it("scores nothing on a poll and keeps the streak", () => {
    const score = scoreQuizAnswer({
      ...base,
      question: poll,
      payload: { type: "poll", optionIndex: 1 },
      streakBefore: 4,
      isJokerActive: true,
    });
    expect(score).toEqual({
      isCorrect: null,
      correctPositions: null,
      basePoints: 0,
      streakBonus: 0,
      streakAfter: 4,
      pointsAwarded: 0,
    });
  });

  it("judges a warm-up answer at 0 points with the streak unchanged", () => {
    const right = scoreQuizAnswer({ ...base, isWarmUp: true, streakBefore: 3 });
    expect(right).toEqual({
      isCorrect: true,
      correctPositions: null,
      basePoints: 0,
      streakBonus: 0,
      streakAfter: 3,
      pointsAwarded: 0,
    });
    const wrong = scoreQuizAnswer({
      ...base,
      isWarmUp: true,
      streakBefore: 3,
      payload: { type: "multiple_choice", optionIndex: 0 },
    });
    expect(wrong).toMatchObject({ isCorrect: false, streakAfter: 3 });
    const silent = scoreQuizAnswer({
      ...base,
      isWarmUp: true,
      streakBefore: 3,
      payload: null,
    });
    expect(silent).toMatchObject({ isCorrect: false, streakAfter: 3 });
  });

  it("takes a typed answer a host accepted by its normalised text", () => {
    const key = { en: "Freddie Mercury", pt: "Freddie Mercury" };
    expect(isTypedAnswerCorrect("Farrokh Bulsara", key, [])).toBe(false);
    expect(
      isTypedAnswerCorrect(
        "Farrokh  Bulsara!",
        key,
        [],
        [normaliseTypedAnswer("farrokh bulsara")],
      ),
    ).toBe(true);
    expect(normaliseTypedAnswer).toBe(normaliseAnswerText);
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

describe("wheel bonus scoring", () => {
  it("gives no winner for no entries", () => {
    expect(wheelBonusWinnerIds([])).toEqual([]);
  });

  it("gives no winner when the best is 0", () => {
    expect(
      wheelBonusWinnerIds([
        { entrantId: "a", points: 0 },
        { entrantId: "b", points: 0 },
      ]),
    ).toEqual([]);
  });

  it("gives no winner when every entrant is negative", () => {
    expect(
      wheelBonusWinnerIds([
        { entrantId: "a", points: -200 },
        { entrantId: "b", points: -100 },
      ]),
    ).toEqual([]);
  });

  it("picks the single best entrant", () => {
    expect(
      wheelBonusWinnerIds([
        { entrantId: "a", points: 300 },
        { entrantId: "b", points: 900 },
        { entrantId: "c", points: 500 },
      ]),
    ).toEqual(["b"]);
  });

  it("keeps every tied winner in input order", () => {
    expect(
      wheelBonusWinnerIds([
        { entrantId: "c", points: 900 },
        { entrantId: "a", points: 300 },
        { entrantId: "b", points: 900 },
      ]),
    ).toEqual(["c", "b"]);
  });

  it("counts points since the baseline and starts a missing entrant at 0", () => {
    expect(
      pointsSinceBaseline({ a: 1000, b: 500 }, [
        { entrantId: "a", score: 1800 },
        { entrantId: "b", score: 500 },
        { entrantId: "c", score: 700 },
      ]),
    ).toEqual([
      { entrantId: "a", points: 800 },
      { entrantId: "b", points: 0 },
      { entrantId: "c", points: 700 },
    ]);
  });
});

/* Engine scoring step: one question in play, speed bonus off so points stay round. */

const typedQuestion: QuizshowQuestion = {
  ...questionShared,
  id: "question-typed",
  type: "type_answer",
  points: 1000,
  options: [],
  answer: { text: { en: "Freddie Mercury", pt: "Freddie Mercury" } },
  acceptedAnswers: [],
};

const choiceQuestion: QuizshowQuestion = {
  ...questionShared,
  id: "question-choice",
  type: "multiple_choice",
  points: 1000,
  options: [
    { id: "first", text: { en: "First", pt: "Primeira" } },
    { id: "second", text: { en: "Second", pt: "Segunda" } },
    { id: "third", text: { en: "Third", pt: "Terceira" } },
  ],
  answer: { correctIndexes: [0] },
  acceptedAnswers: [],
};

const pollQuestion: QuizshowQuestion = {
  ...questionShared,
  id: "question-poll",
  type: "poll",
  points: 1000,
  options: [
    { id: "first", text: { en: "First", pt: "Primeira" } },
    { id: "second", text: { en: "Second", pt: "Segunda" } },
  ],
  answer: null,
  acceptedAnswers: [],
};

function scoringPlayer(
  playerId: string,
  streak: number,
  teamId: string | null = null,
): QuizshowEnginePlayer {
  return {
    playerId,
    memberKey: `member-${playerId}`,
    screenName: playerId,
    teamId,
    isAvatarShown: false,
    hasExtraTime: false,
    isCohostPlayer: false,
    score: 0,
    streak,
    hasUsedJoker: false,
    jokerRoundIndex: null,
    joinedAt: 0,
    isRemoved: false,
    leftAt: null,
    disconnectedAt: null,
  };
}

function answerFrom(
  playerId: string,
  questionId: string,
  payload: QuizshowAnswerPayload,
): QuizshowEngineAnswer {
  return {
    answerId: `answer-${playerId}`,
    playerId,
    questionId,
    phaseId: "5",
    payload,
    receivedAt: 101_000,
    elapsedMs: 1_000,
    isHidden: false,
    pointsAwarded: 0,
  };
}

interface ScoredStateInput {
  question: QuizshowQuestion;
  players: QuizshowEnginePlayer[];
  answers: QuizshowEngineAnswer[];
  playMode?: QuizshowPlayMode;
  teams?: QuizshowEngineTeam[];
  phase?: QuizshowPhase;
  settings?: Partial<QuizshowRoundSettings>;
  roundKind?: QuizshowRoundKind;
  votes?: QuizshowEngineQuestionPlay["votes"];
  voteOptions?: QuizshowEngineQuestionPlay["voteOptions"];
}

/** A session in `reveal` (or the given phase) with the question already scored once. */
function scoredState(input: ScoredStateInput): QuizshowEngineState {
  const created = createQuizshowEngineState({
    quiz: {
      title: "Fixture",
      languages: "en",
      screenLanguage: "en",
      sourceTemplateId: null,
      sourceTemplate: null,
      updatedAt: "2026-11-24T00:00:00.000Z",
      rounds: [
        {
          id: "round-quiz",
          kind: input.roundKind ?? "quiz",
          title: { en: "Round", pt: "Ronda" },
          contentLabel: "none",
          settings: {
            timeLimitSeconds: 20,
            isSpeedBonusOn: false,
            isJokerAllowed: true,
            writeSeconds: 60,
            voteSeconds: 30,
            ...QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
            isWarmUp: false,
            talkSeconds: 0,
            ...input.settings,
          },
          questions: [input.question],
        },
      ],
    },
    playMode: input.playMode ?? "solo",
    maxTeamSize: null,
    isReviewOn: false,
    eventSlug: "fixture",
    eventTitle: "Fixture",
    joinCode: "QZ7KP4",
    sessionId: "session",
    seed: 7,
    now: 0,
  });
  const state: QuizshowEngineState = {
    ...created,
    players: input.players,
    teams: input.teams ?? [],
    cursor: {
      ...created.cursor,
      phaseId: "6",
      status: "running",
      phase: input.phase ?? "reveal",
      roundIndex: 0,
      questionIndex: 0,
      phaseStartedAt: 120_000,
    },
    current: {
      questionId: input.question.id,
      roundIndex: 0,
      questionIndex: 0,
      eligiblePlayerIds: input.players.map((player) => player.playerId),
      extraTimePlayerIds: [],
      answers: input.answers,
      votes: input.votes ?? [],
      voteOptions: input.voteOptions ?? null,
      favouriteOptionId: null,
      isScored: false,
      wasSkipped: false,
      pointsByPlayer: {},
      teamPoints: {},
      myReveals: {},
      awayPlayerIds: [],
      readMs: 4_000,
      streakBeforeByPlayer: {},
      keyOverride: null,
      acceptedTexts: [],
      wasCorrected: false,
    },
  };
  scoreQuestionOnce(state, currentPlayContext(state));
  return state;
}

function playOf(state: QuizshowEngineState) {
  if (state.current === null) throw new Error("expected a question in play");
  return state.current;
}

function rescore(state: QuizshowEngineState) {
  return rescoreQuestion({ state, random: quizshowRandomFrom(1) });
}

function standingsOf(state: QuizshowEngineState) {
  return state.players.map((player) => [
    player.playerId,
    player.score,
    player.streak,
  ]);
}

/** Rita answered the key, Nuno a name the host may accept, Ines nothing. */
function typedNight(overrides: Partial<ScoredStateInput> = {}) {
  return scoredState({
    question: typedQuestion,
    players: [
      scoringPlayer(
        "rita",
        2,
        overrides.playMode === "teams" ? "team-a" : null,
      ),
      scoringPlayer(
        "nuno",
        1,
        overrides.playMode === "teams" ? "team-a" : null,
      ),
      scoringPlayer(
        "ines",
        4,
        overrides.playMode === "teams" ? "team-b" : null,
      ),
    ],
    answers: [
      answerFrom("rita", typedQuestion.id, {
        type: "type_answer",
        text: "Freddie Mercury",
      }),
      answerFrom("nuno", typedQuestion.id, {
        type: "type_answer",
        text: "Farrokh Bulsara",
      }),
    ],
    ...overrides,
  });
}

function acceptFarrokh(state: QuizshowEngineState) {
  playOf(state).acceptedTexts.push(normaliseTypedAnswer("Farrokh Bulsara"));
  return rescore(state);
}

describe("engine scoring step", () => {
  it("records each streak before the first scoring", () => {
    const state = typedNight();
    expect(playOf(state).streakBeforeByPlayer).toEqual({
      rita: 2,
      nuno: 1,
      ines: 4,
    });
    expect(standingsOf(state)).toEqual([
      ["rita", 1300, 3],
      ["nuno", 0, 0],
      ["ines", 0, 0],
    ]);
  });

  it("rescores after an accept from the streaks before the question", () => {
    const state = typedNight();
    const effects = acceptFarrokh(state);
    expect(standingsOf(state)).toEqual([
      ["rita", 1300, 3],
      ["nuno", 1200, 2],
      ["ines", 0, 0],
    ]);
    expect(playOf(state).wasCorrected).toBe(true);
    expect(playOf(state).myReveals.nuno).toMatchObject({
      isCorrect: true,
      pointsAwarded: 1200,
      streak: 2,
    });
    expect(effects).toEqual([
      {
        kind: "reveal_updated",
        playerIds: ["rita", "nuno", "ines"],
        scope: "everyone",
      },
      { kind: "lobby_changed" },
      { kind: "me_changed", playerIds: ["rita", "nuno", "ines"] },
    ]);
  });

  it("gives the same totals when it rescores twice", () => {
    const state = typedNight();
    acceptFarrokh(state);
    rescore(state);
    expect(standingsOf(state)).toEqual([
      ["rita", 1300, 3],
      ["nuno", 1200, 2],
      ["ines", 0, 0],
    ]);
    expect(playOf(state).pointsByPlayer).toEqual({
      rita: 1300,
      nuno: 1200,
      ines: 0,
    });
  });

  it("rescores a player who left after the reveal and leaves a host-removed player untouched", () => {
    const state = typedNight();
    const [rita, nuno] = state.players;
    if (rita === undefined || nuno === undefined) {
      throw new Error("expected Rita and Nuno");
    }
    rita.isRemoved = true;
    nuno.leftAt = 130_000;
    const effects = acceptFarrokh(state);
    expect(standingsOf(state)).toEqual([
      ["rita", 1300, 3],
      ["nuno", 1200, 2],
      ["ines", 0, 0],
    ]);
    expect(playOf(state).pointsByPlayer).toEqual({
      rita: 1300,
      nuno: 1200,
      ines: 0,
    });
    expect(effects).toContainEqual({
      kind: "me_changed",
      playerIds: ["ines"],
    });
  });

  it("leaves a player who left before the reveal unpaid", () => {
    const state = typedNight({
      players: [
        scoringPlayer("rita", 2),
        { ...scoringPlayer("nuno", 1), leftAt: 110_000 },
        scoringPlayer("ines", 4),
      ],
    });
    expect(Object.keys(playOf(state).streakBeforeByPlayer)).toEqual([
      "rita",
      "ines",
    ]);
    acceptFarrokh(state);
    expect(standingsOf(state)).toEqual([
      ["rita", 1300, 3],
      ["nuno", 0, 1],
      ["ines", 0, 0],
    ]);
    expect(playOf(state).pointsByPlayer).not.toHaveProperty("nuno");
  });

  it("clamps at 0 when a take-back follows an adjustment to 0", () => {
    const state = scoredState({
      question: choiceQuestion,
      players: [scoringPlayer("rita", 2), scoringPlayer("nuno", 1)],
      answers: [
        answerFrom("rita", choiceQuestion.id, {
          type: "multiple_choice",
          optionIndex: 0,
        }),
        answerFrom("nuno", choiceQuestion.id, {
          type: "multiple_choice",
          optionIndex: 1,
        }),
      ],
    });
    const [rita] = state.players;
    if (rita === undefined) throw new Error("expected Rita");
    expect(rita.score).toBe(1300);
    rita.score -= 1300;
    playOf(state).keyOverride = {
      type: "multiple_choice",
      correctIndexes: [1],
    };
    rescore(state);
    expect(standingsOf(state)).toEqual([
      ["rita", 0, 0],
      ["nuno", 1200, 2],
    ]);
  });

  it("keeps a host adjustment through a rescore", () => {
    const state = typedNight();
    const rita = state.players.find((player) => player.playerId === "rita");
    if (rita === undefined) throw new Error("expected Rita");
    rita.score += 500;
    acceptFarrokh(state);
    expect(standingsOf(state)).toEqual([
      ["rita", 1800, 3],
      ["nuno", 1200, 2],
      ["ines", 0, 0],
    ]);
  });
});

describe("engine scoring step: teams, keys and question kinds", () => {
  it("moves a team by the difference so its adjustment stays", () => {
    const team = (teamId: string, colorKey: "circle" | "triangle") => ({
      teamId,
      name: teamId,
      colorKey,
      score: 0,
      hasUsedJoker: false,
      jokerRoundIndex: null,
      isHostMade: false,
    });
    const state = typedNight({
      playMode: "teams",
      teams: [team("team-a", "circle"), team("team-b", "triangle")],
    });
    const [teamA] = state.teams;
    if (teamA === undefined) throw new Error("expected a team");
    expect(teamA.score).toBe(650);
    teamA.score += 100;
    acceptFarrokh(state);
    expect(teamA.score).toBe(1350);
    expect(playOf(state).teamPoints).toEqual({ "team-a": 1250, "team-b": 0 });
  });

  it("takes the corrected totals as the frame totals in scores", () => {
    const state = typedNight({ phase: "scores" });
    const effects = acceptFarrokh(state);
    expect(state.scoresAtLastFrame).toEqual({
      rita: 1300,
      nuno: 1200,
      ines: 0,
    });
    expect(effects.map((effect) => effect.kind)).toEqual([
      "reveal_updated",
      "scores_shown",
      "lobby_changed",
      "me_changed",
    ]);
  });

  it("judges again by a changed key", () => {
    const state = scoredState({
      question: choiceQuestion,
      players: [scoringPlayer("rita", 2), scoringPlayer("nuno", 1)],
      answers: [
        answerFrom("rita", choiceQuestion.id, {
          type: "multiple_choice",
          optionIndex: 0,
        }),
        answerFrom("nuno", choiceQuestion.id, {
          type: "multiple_choice",
          optionIndex: 1,
        }),
      ],
    });
    const keyOverride = {
      type: "multiple_choice" as const,
      correctIndexes: [1],
    };
    playOf(state).keyOverride = keyOverride;
    expect(effectiveAnswerKey(state, playOf(state))).toEqual(keyOverride);
    rescore(state);
    expect(standingsOf(state)).toEqual([
      ["rita", 0, 0],
      ["nuno", 1200, 2],
    ]);
  });

  it("doubles the corrected points under a joker", () => {
    const nuno = { ...scoringPlayer("nuno", 1), hasUsedJoker: true };
    const state = typedNight({
      players: [
        scoringPlayer("rita", 2),
        { ...nuno, jokerRoundIndex: 0 },
        scoringPlayer("ines", 4),
      ],
    });
    acceptFarrokh(state);
    expect(standingsOf(state)[1]).toEqual(["nuno", 2400, 2]);
  });

  it("judges a warm-up question at 0 points and keeps every streak", () => {
    const state = typedNight({ settings: { isWarmUp: true } });
    expect(standingsOf(state)).toEqual([
      ["rita", 0, 2],
      ["nuno", 0, 1],
      ["ines", 0, 4],
    ]);
    expect(playOf(state).myReveals.rita).toMatchObject({
      isCorrect: true,
      pointsAwarded: 0,
      streak: 2,
    });
    expect(playOf(state).myReveals.nuno?.isCorrect).toBe(false);
  });

  it("never scores a poll", () => {
    const state = scoredState({
      question: pollQuestion,
      players: [scoringPlayer("rita", 2), scoringPlayer("nuno", 1)],
      answers: [
        answerFrom("rita", pollQuestion.id, { type: "poll", optionIndex: 0 }),
      ],
    });
    expect(standingsOf(state)).toEqual([
      ["rita", 0, 2],
      ["nuno", 0, 1],
    ]);
    expect(playOf(state).myReveals.rita).toMatchObject({
      hasAnswered: true,
      isCorrect: null,
      pointsAwarded: 0,
    });
  });

  it("pays nobody for the vote of a voter removed with rejoin during the vote", () => {
    const captionQuestion: QuizshowQuestion = {
      ...questionShared,
      id: "question-caption",
      type: "prompt",
      points: 1000,
      mediaRef: "covers/caption.jpg",
      options: [],
      answer: null,
      acceptedAnswers: [],
    };
    const state = scoredState({
      question: captionQuestion,
      roundKind: "caption_this",
      players: [
        scoringPlayer("rita", 0),
        scoringPlayer("nuno", 0),
        scoringPlayer("ines", 0),
        { ...scoringPlayer("tomas", 0), leftAt: 125_000 },
      ],
      answers: [
        answerFrom("rita", captionQuestion.id, {
          type: "prompt",
          text: "rita line",
        }),
        answerFrom("nuno", captionQuestion.id, {
          type: "prompt",
          text: "nuno line",
        }),
      ],
      voteOptions: [
        {
          optionId: "option-rita",
          answerId: "answer-rita",
          isTruth: false,
          text: "rita line",
        },
        {
          optionId: "option-nuno",
          answerId: "answer-nuno",
          isTruth: false,
          text: "nuno line",
        },
      ],
      votes: [
        { voterPlayerId: "ines", optionId: "option-rita" },
        { voterPlayerId: "tomas", optionId: "option-rita" },
        { voterPlayerId: "rita", optionId: "option-nuno" },
      ],
    });
    expect(standingsOf(state)).toEqual([
      ["rita", QUIZSHOW_LIMITS.partyVotePoints, 0],
      ["nuno", QUIZSHOW_LIMITS.partyVotePoints, 0],
      ["ines", 0, 0],
      ["tomas", 0, 0],
    ]);
  });
});
