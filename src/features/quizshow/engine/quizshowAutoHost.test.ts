import { describe, expect, it } from "vitest";
import type {
  QuizshowPhase,
  QuizshowWheelSpin,
} from "../../../shared/contracts/quizshow";
import { createWheelState, emptyWheelProgress } from "../quizshowWheel";
import {
  planAutoHostAction,
  QUIZSHOW_AUTO_HOST_DELAYS_MS,
} from "./quizshowAutoHost";
import { createQuizshowEngine } from "./quizshowEngine";
import { createQuizshowDemoController } from "./useQuizshowDemoEngine";
import type { QuizshowEngineState } from "./quizshowEngineTypes";

const baseEngine = createQuizshowEngine({
  quiz: {
    title: "Fixture",
    languages: "en",
    screenLanguage: "en",
    sourceTemplateId: null,
    updatedAt: "2026-10-19T00:00:00.000Z",
    rounds: [],
  },
  playMode: "solo",
  maxTeamSize: null,
  isReviewOn: true,
  eventSlug: "fixture",
  eventTitle: "Fixture",
  joinCode: "QZ7KP4",
  sessionId: "session",
  seed: 1,
  now: 0,
});

function engineIn(phase: QuizshowPhase, phaseStartedAt: number) {
  return {
    ...baseEngine,
    cursor: { ...baseEngine.cursor, phaseId: "42", phase, phaseStartedAt },
  };
}

function withPlayers(
  engine: QuizshowEngineState,
  joinTimes: number[],
): QuizshowEngineState {
  return {
    ...engine,
    players: joinTimes.map((joinedAt, index) => ({
      playerId: `player-${index}`,
      memberKey: `member-${index}`,
      screenName: `Player ${index}`,
      teamId: null,
      isAvatarShown: false,
      hasExtraTime: false,
      isCohostPlayer: false,
      score: 0,
      streak: 0,
      hasUsedJoker: false,
      jokerRoundIndex: null,
      joinedAt,
      isRemoved: false,
    })),
  };
}

const expected = { expectedPlayerCount: 3 };

function wheelEngine(
  phaseStartedAt: number,
  spin: QuizshowWheelSpin | null,
  isWheelOpen = true,
): QuizshowEngineState {
  const wheelProgress = emptyWheelProgress();
  if (isWheelOpen) {
    wheelProgress.wheel = { ...createWheelState([], null, []), spin };
  }
  return { ...engineIn("wheel", phaseStartedAt), wheelProgress };
}

const WHEEL_TEST_SPIN: QuizshowWheelSpin = {
  landedSliceIndex: 0,
  startedAt: 10_000,
  durationMs: 5_500,
  turns: 5,
  jitterSeed: 500,
  startAngle: 0,
};

describe("auto host", () => {
  it("starts the game once everyone expected has joined and the lobby has settled for three seconds", () => {
    const lobby = withPlayers(engineIn("lobby", 0), [1_000, 2_000, 5_000]);
    expect(planAutoHostAction(lobby, 7_999, expected)).toBeNull();
    expect(planAutoHostAction(lobby, 8_000, expected)).toMatchObject({
      type: "host",
      name: "host:start",
    });
    const missingOne = withPlayers(engineIn("lobby", 0), [1_000, 2_000]);
    expect(planAutoHostAction(missingOne, 60_000, expected)).toBeNull();
  });

  it("moves on from each untimed phase after its delay", () => {
    const cases: Array<[QuizshowPhase, number, string]> = [
      ["round_intro", QUIZSHOW_AUTO_HOST_DELAYS_MS.round_intro, "host:next"],
      ["reveal", QUIZSHOW_AUTO_HOST_DELAYS_MS.reveal, "host:next"],
      ["scores", QUIZSHOW_AUTO_HOST_DELAYS_MS.scores, "host:next"],
      ["leaderboard", QUIZSHOW_AUTO_HOST_DELAYS_MS.leaderboard, "host:next"],
      ["review", QUIZSHOW_AUTO_HOST_DELAYS_MS.review, "host:showAnswers"],
      ["podium", QUIZSHOW_AUTO_HOST_DELAYS_MS.podium, "host:next"],
    ];
    for (const [phase, delay, commandName] of cases) {
      const engine = engineIn(phase, 1_000);
      expect(
        planAutoHostAction(engine, 1_000 + delay - 1, expected),
      ).toBeNull();
      expect(planAutoHostAction(engine, 1_000 + delay, expected)).toMatchObject(
        {
          type: "host",
          name: commandName,
        },
      );
    }
  });

  it("leaves timed phases to the clock", () => {
    for (const phase of ["read", "open", "write", "vote"] as const) {
      expect(
        planAutoHostAction(engineIn(phase, 0), 600_000, expected),
      ).toBeNull();
    }
  });

  it("asks for a restart on the thank-you screen", () => {
    const ended = engineIn("ended", 5_000);
    const delay = QUIZSHOW_AUTO_HOST_DELAYS_MS.ended;
    expect(planAutoHostAction(ended, 5_000 + delay - 1, expected)).toBeNull();
    expect(planAutoHostAction(ended, 5_000 + delay, expected)).toBe("restart");
  });

  it("carries the current phase id on every command", () => {
    const lobby = withPlayers(engineIn("lobby", 0), [0, 0, 0]);
    const actions = [
      planAutoHostAction(lobby, 3_000, expected),
      planAutoHostAction(engineIn("reveal", 0), 5_000, expected),
      planAutoHostAction(engineIn("review", 0), 2_500, expected),
    ];
    for (const action of actions) {
      expect(action).toMatchObject({ payload: { phaseId: "42" } });
    }
  });
});

describe("auto host on the wheel", () => {
  it("spins 2.5 seconds after the wheel opens", () => {
    const engine = wheelEngine(0, null);
    expect(planAutoHostAction(engine, 2_499, expected)).toBeNull();
    expect(planAutoHostAction(engine, 2_500, expected)).toMatchObject({
      type: "host",
      name: "host:spin",
      payload: { phaseId: "42" },
    });
  });

  it("presses next 3 seconds after the spin lands", () => {
    const engine = wheelEngine(0, WHEEL_TEST_SPIN);
    expect(planAutoHostAction(engine, 18_499, expected)).toBeNull();
    expect(planAutoHostAction(engine, 18_500, expected)).toMatchObject({
      type: "host",
      name: "host:next",
      payload: { phaseId: "42" },
    });
  });

  it("waits while no wheel is open", () => {
    const engine = wheelEngine(0, null, false);
    expect(planAutoHostAction(engine, 600_000, expected)).toBeNull();
  });

  it("only ever presses spin and next, never finish the wheel", () => {
    const engines = [wheelEngine(0, null), wheelEngine(0, WHEEL_TEST_SPIN)];
    const pressedNames = new Set<string>();
    for (const engine of engines) {
      for (let now = 0; now <= 60_000; now += 500) {
        const action = planAutoHostAction(engine, now, expected);
        if (action && action !== "restart" && action.type === "host") {
          pressedNames.add(action.name);
        }
      }
    }
    expect([...pressedNames].sort()).toEqual(["host:next", "host:spin"]);
  });

  it("presses nothing while paused", () => {
    const paused = { ...wheelEngine(0, null), pausedAt: 1_000 };
    expect(planAutoHostAction(paused, 60_000, expected)).toBeNull();
    const pausedAfterSpin = { ...wheelEngine(0, WHEEL_TEST_SPIN), pausedAt: 1 };
    expect(planAutoHostAction(pausedAfterSpin, 60_000, expected)).toBeNull();
  });
});

describe("demo engine controller", () => {
  it("rejoins the visitor after a restart", async () => {
    const controller = createQuizshowDemoController(() => ({
      role: "player",
      eventSlug: "fixture",
      eventTitle: "Fixture",
      isAutoHost: true,
      hasSelfPlayer: true,
      playMode: "solo",
      suggestedScreenName: "Visitor",
      shouldLoop: true,
    }));
    const ack = await controller.engineApi.send("lobby:join", {
      screenName: "Visitor",
      isAvatarShown: false,
      hasExtraTime: false,
      team: null,
    });
    expect(ack.ok).toBe(true);
    const events: string[] = [];
    controller.engineApi.subscribe((frame) => events.push(frame.event));
    controller.engineApi.restart();
    expect(events[0]).toBe("session:state");
    expect(events.slice(1)).toContain("lobby:update");
  });
});
