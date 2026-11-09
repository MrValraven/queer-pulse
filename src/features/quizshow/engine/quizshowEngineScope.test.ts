import { describe, expect, it } from "vitest";
import {
  QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
  type QuizshowContentLabel,
  type QuizshowLobbyJoinInput,
  type QuizshowQuestion,
  type QuizshowQuiz,
  type QuizshowRound,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import { emptyWheelProgress, normaliseWheelRounds } from "../quizshowWheel";
import { createBotState, planBotActions } from "./quizshowBots";
import { createQuizshowEngine, reduceQuizshowEngine } from "./quizshowEngine";
import type {
  QuizshowEngineOptions,
  QuizshowEngineState,
  QuizshowEngineStep,
} from "./quizshowEngineTypes";
import { engineSessionStateFor } from "./quizshowEngineViews";
import { QUIZSHOW_SIMULATED_PLAYERS } from "./quizshowSimulatedPlayers.data";
import {
  PICK_ROUND_NIGHT,
  UNPLANNED_NIGHT,
  wheelTestEngineOptions,
  wheelTestQuiz,
  wheelTestRound,
  wheelTestWheel,
} from "./quizshowWheelTestFixtures";

const GAME_ID = "demo-game-after-dark";
const RITA = "member-rita";

function bilingual(english: string): QuizshowText {
  return { en: english, pt: english };
}

const CHOICE_QUESTION: QuizshowQuestion = {
  id: "question-choice",
  type: "multiple_choice",
  prompt: bilingual("Which option is the right one?"),
  options: [
    { id: "a", text: bilingual("First") },
    { id: "b", text: bilingual("Second") },
  ],
  answer: { correctIndex: 1 },
  acceptedAnswers: [],
  mediaRef: null,
  mediaUrl: null,
  timeLimitSeconds: null,
  points: 1000,
};

function roundOf(
  id: string,
  contentLabel: QuizshowContentLabel,
): QuizshowRound {
  return {
    id,
    kind: "quiz",
    title: bilingual(`Round ${id}`),
    contentLabel,
    settings: {
      timeLimitSeconds: 20,
      isSpeedBonusOn: true,
      isJokerAllowed: true,
      writeSeconds: 60,
      voteSeconds: 30,
      ...QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
    },
    questions: [{ ...CHOICE_QUESTION, id: `${id}-question` }],
  };
}

function quizOf(rounds: QuizshowRound[]): QuizshowQuiz {
  return {
    title: "After dark trivia",
    languages: "both",
    screenLanguage: "en",
    sourceTemplateId: null,
    updatedAt: "2026-10-20T00:00:00.000Z",
    rounds,
  };
}

const PLAIN_QUIZ = quizOf([
  roundOf("first", "none"),
  roundOf("second", "none"),
]);
const ADULTS_ROUND_QUIZ = quizOf([
  roundOf("first", "none"),
  roundOf("second", "adults"),
]);

function engineWith(
  overrides: Partial<QuizshowEngineOptions> = {},
): QuizshowEngineState {
  return createQuizshowEngine({
    quiz: PLAIN_QUIZ,
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: true,
    eventSlug: "pride-brunch-jun",
    eventTitle: "Pride brunch",
    joinCode: "QZ7KP4",
    sessionId: "demo-session",
    seed: 7,
    now: 0,
    ...overrides,
  });
}

function gameEngineWith(
  overrides: Partial<QuizshowEngineOptions> = {},
): QuizshowEngineState {
  return engineWith({
    eventSlug: null,
    eventTitle: null,
    gameId: GAME_ID,
    ...overrides,
  });
}

function joinPayload(
  overrides: Partial<QuizshowLobbyJoinInput> = {},
): QuizshowLobbyJoinInput {
  return {
    screenName: "Rita",
    isAvatarShown: false,
    hasExtraTime: false,
    team: null,
    ...overrides,
  };
}

function joinStep(
  state: QuizshowEngineState,
  payload: QuizshowLobbyJoinInput,
  now = 100,
): QuizshowEngineStep {
  return reduceQuizshowEngine(state, {
    type: "player",
    memberKey: RITA,
    name: "lobby:join",
    payload,
    now,
  });
}

describe("Pulse Live engine scope", () => {
  it("emits kind game and the game id on a game session", () => {
    const state = gameEngineWith();
    const sessionState = engineSessionStateFor(state, { role: "screen" });
    expect(sessionState).toMatchObject({
      kind: "game",
      gameId: GAME_ID,
      eventSlug: null,
      eventTitle: null,
      nextEvent: null,
    });
  });

  it("emits kind event as before when no game id is given", () => {
    const state = engineWith();
    expect(state.gameId).toBeNull();
    const sessionState = engineSessionStateFor(state, { role: "host" });
    expect(sessionState).toMatchObject({
      kind: "event",
      gameId: null,
      eventSlug: "pride-brunch-jun",
      eventTitle: "Pride brunch",
      isAdultsOnly: false,
    });
  });

  it("marks a session 18+ when a round holds the adults label", () => {
    const state = gameEngineWith({
      quiz: ADULTS_ROUND_QUIZ,
      isAdultsOnly: false,
    });
    expect(state.isAdultsOnly).toBe(true);
    expect(engineSessionStateFor(state, { role: "screen" }).isAdultsOnly).toBe(
      true,
    );
    expect(gameEngineWith({ isAdultsOnly: false }).isAdultsOnly).toBe(false);
    expect(gameEngineWith({ isAdultsOnly: true }).isAdultsOnly).toBe(true);
  });
});

describe("Pulse Live 18+ join rule", () => {
  it("refuses an 18+ join without consent", () => {
    const state = gameEngineWith({ isAdultsOnly: true });
    const refused = joinStep(state, joinPayload());
    expect(refused.ack).toMatchObject({
      ok: false,
      code: "quizshow_adult_consent_required",
    });
    expect(refused.state.players).toHaveLength(0);
    expect(refused.frames).toEqual([]);
    const declined = joinStep(
      state,
      joinPayload({ hasAcceptedAdultContent: false }),
    );
    expect(declined.ack).toMatchObject({
      ok: false,
      code: "quizshow_adult_consent_required",
    });
    expect(declined.state.players).toHaveLength(0);
  });

  it("lets an 18+ join through with consent", () => {
    const state = engineWith({ quiz: ADULTS_ROUND_QUIZ });
    const joined = joinStep(
      state,
      joinPayload({ hasAcceptedAdultContent: true }),
    );
    expect(joined.ack).toMatchObject({ ok: true });
    expect(joined.state.players).toHaveLength(1);
    expect(joined.state.players[0]?.memberKey).toBe(RITA);
  });

  it("lets a rejoin through without consent", () => {
    const state = gameEngineWith({ isAdultsOnly: true });
    const joined = joinStep(
      state,
      joinPayload({ hasAcceptedAdultContent: true }),
    );
    expect(joined.ack).toMatchObject({ ok: true });
    const rejoined = joinStep(joined.state, joinPayload(), 200);
    expect(rejoined.ack).toMatchObject({
      ok: true,
      me: { screenName: "Rita" },
    });
    expect(rejoined.state.players).toHaveLength(1);
  });

  it("joins bots to an 18+ game", () => {
    let state = gameEngineWith({ isAdultsOnly: true });
    let botState = createBotState(3, 0);
    for (let joinIndex = 0; joinIndex < 3; joinIndex += 1) {
      const planned = planBotActions(botState, state, 700 * (joinIndex + 1));
      botState = planned.botState;
      const [action] = planned.actions;
      if (action === undefined) throw new Error("expected one join");
      expect(action).toMatchObject({
        type: "player",
        name: "lobby:join",
        memberKey: QUIZSHOW_SIMULATED_PLAYERS[joinIndex]?.memberKey,
        payload: { hasAcceptedAdultContent: true },
      });
      const joined = reduceQuizshowEngine(state, action);
      expect(joined.ack).toMatchObject({ ok: true });
      state = joined.state;
    }
    expect(state.players).toHaveLength(3);
  });
});

describe("engine wheel state", () => {
  it("opens the lobby with empty wheel progress and the four cursor fields", () => {
    const state = createQuizshowEngine(
      wheelTestEngineOptions(PICK_ROUND_NIGHT),
    );
    expect(state.wheelProgress).toEqual(emptyWheelProgress());
    expect(state.cursor).toMatchObject({
      roundNumber: 0,
      roundCount: 5,
      upNext: { kind: "round", roundIndex: 0 },
      canSpinForNextRound: false,
    });
  });

  it("normalises the frozen quiz", () => {
    const outsideRound = wheelTestRound("r0", "Warm up", 1, 500);
    const wheelRow = {
      ...wheelTestWheel("w1", "round", 2),
      contentLabel: "spicy" as const,
    };
    const quiz = wheelTestQuiz([
      outsideRound,
      wheelRow,
      wheelTestRound("r2", "Music", 1),
      wheelTestRound("r3", "Film", 1),
    ]);
    const options = wheelTestEngineOptions(quiz);
    const state = createQuizshowEngine(options);
    expect(state.quiz.rounds[0]?.settings.wheelBonus).toBe(0);
    expect(state.quiz.rounds[1]?.contentLabel).toBe("none");
    expect(state.quiz.rounds).toEqual(normaliseWheelRounds(quiz.rounds));
    expect(options.quiz.rounds[0]?.settings.wheelBonus).toBe(500);
    expect(options.quiz.rounds[1]?.contentLabel).toBe("spicy");
  });

  it("recounts the cursor fields on every phase move", () => {
    const lobby = createQuizshowEngine(wheelTestEngineOptions(UNPLANNED_NIGHT));
    const joined = reduceQuizshowEngine(lobby, {
      type: "player",
      memberKey: RITA,
      name: "lobby:join",
      payload: {
        screenName: "Rita",
        isAvatarShown: false,
        hasExtraTime: false,
        team: null,
      },
      now: 100,
    }).state;
    const hostAction = (
      current: QuizshowEngineState,
      name: "host:start" | "host:next" | "host:skip",
      now: number,
    ): QuizshowEngineState =>
      reduceQuizshowEngine(current, {
        type: "host",
        name,
        payload: { phaseId: current.cursor.phaseId },
        now,
      }).state;
    const started = hostAction(joined, "host:start", 200);
    expect(started.cursor).toMatchObject({ roundNumber: 1, upNext: null });
    const reading = hostAction(started, "host:next", 300);
    const onLeaderboard = hostAction(reading, "host:skip", 400);
    expect(onLeaderboard.cursor).toMatchObject({
      phase: "leaderboard",
      upNext: { kind: "round", roundIndex: 1 },
      canSpinForNextRound: true,
    });
  });

  it("copies wheel progress with the state", () => {
    const state = createQuizshowEngine(
      wheelTestEngineOptions(PICK_ROUND_NIGHT),
    );
    expect(structuredClone(state).wheelProgress).toEqual(state.wheelProgress);
  });
});
