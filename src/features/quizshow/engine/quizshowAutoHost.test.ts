import { describe, expect, it } from "vitest";
import type { QuizshowPhase } from "../../../shared/contracts/quizshow";
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
