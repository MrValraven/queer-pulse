import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
  type QuizshowPhase,
  type QuizshowQuestion,
  type QuizshowQuiz,
} from "../../../shared/contracts/quizshow";
import type * as ScoringModule from "./quizshowScoring";
import { competitionRanks } from "./quizshowScoring";
import { createQuizshowEngine } from "./quizshowEngine";
import { buildRankIndex, rankOf } from "./quizshowEngineRanks";
import type {
  QuizshowEnginePlayer,
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
} from "./quizshowEngineTypes";
import { engineFramesFor, engineSessionStateFor } from "./quizshowEngineViews";

vi.mock("./quizshowScoring", async (importOriginal) => {
  const actual = await importOriginal<typeof ScoringModule>();
  return { ...actual, competitionRanks: vi.fn(actual.competitionRanks) };
});

const competitionRanksSpy = vi.mocked(competitionRanks);

const PLAYER_COUNT = 200;
const BLANK_TEXT = { en: "", pt: "" };

const CHOICE_QUESTION: QuizshowQuestion = {
  id: "question-choice",
  type: "multiple_choice",
  prompt: { en: "Which one is right?", pt: "Qual é a certa?" },
  options: [
    { id: "a", text: { en: "First", pt: "Primeira" } },
    { id: "b", text: { en: "Second", pt: "Segunda" } },
  ],
  answer: { correctIndexes: [1] },
  acceptedAnswers: [],
  mediaRef: null,
  mediaUrl: null,
  mediaAlt: BLANK_TEXT,
  mediaReveal: "instant",
  revealNote: BLANK_TEXT,
  numberUnit: BLANK_TEXT,
  timeLimitSeconds: null,
  points: 1000,
};

const QUIZ: QuizshowQuiz = {
  title: "Rank night",
  languages: "en",
  screenLanguage: "en",
  sourceTemplateId: null,
  sourceTemplate: null,
  updatedAt: "2026-11-24T00:00:00.000Z",
  rounds: [
    {
      id: "round-quiz",
      kind: "quiz",
      title: { en: "Warm hearts", pt: "Corações quentes" },
      contentLabel: "none",
      settings: {
        timeLimitSeconds: 20,
        isSpeedBonusOn: true,
        isJokerAllowed: true,
        writeSeconds: 60,
        voteSeconds: 30,
        ...QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
        isWarmUp: false,
        talkSeconds: 0,
      },
      questions: [CHOICE_QUESTION],
    },
  ],
};

function playerRow(index: number): QuizshowEnginePlayer {
  return {
    playerId: `player-${index}`,
    memberKey: `member-${index}`,
    screenName: `Player ${index}`,
    teamId: null,
    isAvatarShown: false,
    hasExtraTime: false,
    isCohostPlayer: false,
    // Every tenth score repeats, so the competition ranks hold ties.
    score: (index % 10) * 100,
    streak: 0,
    hasUsedJoker: false,
    jokerRoundIndex: null,
    joinedAt: index,
    isRemoved: false,
    leftAt: null,
    disconnectedAt: null,
  };
}

function playOf(playerIds: string[]): QuizshowEngineQuestionPlay {
  return {
    questionId: CHOICE_QUESTION.id,
    roundIndex: 0,
    questionIndex: 0,
    eligiblePlayerIds: playerIds,
    extraTimePlayerIds: [],
    answers: [],
    votes: [],
    voteOptions: null,
    favouriteOptionId: null,
    isScored: true,
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
  };
}

/** 200 solo players parked on the only question, in the given phase. */
function crowdIn(phase: QuizshowPhase): QuizshowEngineState {
  const state = createQuizshowEngine({
    quiz: QUIZ,
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: true,
    eventSlug: "rank-night",
    eventTitle: "Rank night",
    joinCode: "QZ7KP4",
    sessionId: "rank-session",
    seed: 1,
    now: 0,
  });
  state.players = Array.from({ length: PLAYER_COUNT }, (_, index) =>
    playerRow(index),
  );
  state.current = playOf(state.players.map((player) => player.playerId));
  state.cursor = {
    ...state.cursor,
    status: "running",
    phase,
    phaseId: "9",
    phaseStartedAt: 0,
    roundIndex: 0,
    questionIndex: 0,
  };
  return state;
}

describe("rank index (contract 7.1, W1)", () => {
  beforeEach(() => {
    competitionRanksSpy.mockClear();
  });

  it("ranks once for a reveal sent to 200 players", () => {
    const state = crowdIn("reveal");
    const frames = engineFramesFor(state, [{ kind: "revealed" }]);
    expect(competitionRanksSpy).toHaveBeenCalledTimes(1);
    expect(
      frames.filter(({ frame }) => frame.event === "reveal:mine"),
    ).toHaveLength(PLAYER_COUNT);
  });

  it("ranks once for scores sent to 200 players", () => {
    const state = crowdIn("scores");
    const frames = engineFramesFor(state, [{ kind: "scores_shown" }]);
    expect(competitionRanksSpy).toHaveBeenCalledTimes(1);
    expect(
      frames.filter(({ frame }) => frame.event === "scores:mine"),
    ).toHaveLength(PLAYER_COUNT);
  });

  it("ranks once for a player's whole session state", () => {
    const state = crowdIn("scores");
    engineSessionStateFor(state, {
      role: "player",
      memberKey: "member-7",
      suggestedScreenName: "Player 7",
    });
    expect(competitionRanksSpy).toHaveBeenCalledTimes(1);
  });

  it("reads competition ranks with ties and puts unknown entrants last", () => {
    const index = buildRankIndex(crowdIn("scores"));
    expect(rankOf(index, "player-9")).toBe(1);
    expect(rankOf(index, "player-19")).toBe(1);
    expect(rankOf(index, "player-8")).toBe(21);
    expect(rankOf(index, "nobody")).toBe(PLAYER_COUNT + 1);
    expect(rankOf(index, null)).toBe(PLAYER_COUNT + 1);
  });
});
