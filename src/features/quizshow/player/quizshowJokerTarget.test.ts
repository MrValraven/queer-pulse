import { describe, expect, it } from "vitest";
import type {
  QuizshowCursor,
  QuizshowPhase,
  QuizshowRoundCard,
  QuizshowUpNext,
} from "../../../shared/contracts/quizshow";
import { jokerRoundNumberOf, lobbyJokerTargetOf } from "./quizshowJokerTarget";

function roundCard(
  roundIndex: number,
  overrides: Partial<QuizshowRoundCard> = {},
): QuizshowRoundCard {
  return {
    roundIndex,
    kind: "quiz",
    title: { en: `Round ${roundIndex}`, pt: `Ronda ${roundIndex}` },
    contentLabel: "none",
    questionCount: 5,
    isJokerAllowed: true,
    isSpeedBonusOn: false,
    ...overrides,
  };
}

function cursorOf(
  phase: QuizshowPhase,
  overrides: Partial<QuizshowCursor> = {},
): QuizshowCursor {
  return {
    phaseId: "1",
    status: "running",
    phase,
    roundIndex: null,
    questionIndex: null,
    roundCount: 3,
    phaseStartedAt: null,
    deadline: null,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    roundNumber: 0,
    upNext: null,
    canSpinForNextRound: false,
    ...overrides,
  };
}

const WHEEL_ROW = roundCard(0, { kind: "wheel", isJokerAllowed: false });
const ROUNDS = [roundCard(0), roundCard(1), roundCard(2)];

function lobbyWith(upNext: QuizshowUpNext | null) {
  return { cursor: cursorOf("lobby", { upNext }), rounds: ROUNDS };
}

describe("lobbyJokerTargetOf", () => {
  it("offers the wheel when the wheel is up next", () => {
    const target = lobbyJokerTargetOf(
      lobbyWith({ kind: "wheel", wheelRoundIndex: 0 }),
    );
    expect(target).toEqual({ kind: "wheel" });
  });

  it("offers the up next round when it allows jokers", () => {
    const target = lobbyJokerTargetOf(
      lobbyWith({ kind: "round", roundIndex: 0 }),
    );
    expect(target).toEqual({ kind: "round", round: ROUNDS[0] });
  });

  it("offers nothing for a round that does not allow jokers", () => {
    const rounds = [roundCard(0, { isJokerAllowed: false }), roundCard(1)];
    const target = lobbyJokerTargetOf({
      cursor: cursorOf("lobby", { upNext: { kind: "round", roundIndex: 0 } }),
      rounds,
    });
    expect(target).toEqual({ kind: "none" });
  });

  it("offers nothing when nothing is up next", () => {
    expect(lobbyJokerTargetOf(lobbyWith(null))).toEqual({ kind: "none" });
  });

  it("offers nothing before the podium", () => {
    const target = lobbyJokerTargetOf(lobbyWith({ kind: "podium" }));
    expect(target).toEqual({ kind: "none" });
  });

  it("offers nothing for a round index no card matches", () => {
    const target = lobbyJokerTargetOf(
      lobbyWith({ kind: "round", roundIndex: 9 }),
    );
    expect(target).toEqual({ kind: "none" });
  });

  it("follows the up next on a leaderboard, as the server does", () => {
    const session = {
      cursor: cursorOf("leaderboard", {
        roundIndex: 0,
        upNext: { kind: "round", roundIndex: 1 },
      }),
      rounds: ROUNDS,
    };
    expect(lobbyJokerTargetOf(session)).toEqual({
      kind: "round",
      round: ROUNDS[1],
    });
    const wheelSession = {
      cursor: cursorOf("leaderboard", {
        upNext: { kind: "wheel", wheelRoundIndex: 0 },
      }),
      rounds: ROUNDS,
    };
    expect(lobbyJokerTargetOf(wheelSession)).toEqual({ kind: "wheel" });
  });

  it("offers the round on its intro when it allows jokers", () => {
    const target = lobbyJokerTargetOf({
      cursor: cursorOf("round_intro", { roundIndex: 2 }),
      rounds: ROUNDS,
    });
    expect(target).toEqual({ kind: "round", round: ROUNDS[2] });
  });

  it("offers nothing on an intro of a round without jokers", () => {
    const rounds = [roundCard(0), roundCard(1, { isJokerAllowed: false })];
    const target = lobbyJokerTargetOf({
      cursor: cursorOf("round_intro", { roundIndex: 1 }),
      rounds,
    });
    expect(target).toEqual({ kind: "none" });
  });

  it("offers nothing on a wheel row, whatever its flag says", () => {
    const rounds = [roundCard(0, { kind: "wheel", isJokerAllowed: true })];
    const target = lobbyJokerTargetOf({
      cursor: cursorOf("round_intro", { roundIndex: 0 }),
      rounds,
    });
    expect(target).toEqual({ kind: "none" });
  });

  it("offers nothing in any other phase", () => {
    const phases: QuizshowPhase[] = ["wheel", "read", "scores", "podium"];
    for (const phase of phases) {
      const target = lobbyJokerTargetOf({
        cursor: cursorOf(phase, {
          roundIndex: 1,
          upNext: { kind: "round", roundIndex: 1 },
        }),
        rounds: ROUNDS,
      });
      expect(target).toEqual({ kind: "none" });
    }
  });
});

describe("jokerRoundNumberOf", () => {
  it("counts played rounds and skips wheel rows", () => {
    const rounds = [WHEEL_ROW, roundCard(1), roundCard(2)];
    expect(jokerRoundNumberOf(rounds, 2)).toBe(2);
    expect(jokerRoundNumberOf(rounds, 1)).toBe(1);
  });
});
