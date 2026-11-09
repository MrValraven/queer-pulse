import { describe, expect, it } from "vitest";
import type {
  QuizshowCursor,
  QuizshowHostState,
  QuizshowPhase,
  QuizshowWheelPick,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import { isBeforeFirstScore } from "./quizshowRemoteEndCopy";

type EndCopyState = Pick<QuizshowHostState, "cursor" | "wheel">;

function cursorIn(
  phase: QuizshowPhase,
  overrides: Partial<QuizshowCursor> = {},
): QuizshowCursor {
  return {
    phaseId: "7",
    status: "running",
    phase,
    roundIndex: 0,
    questionIndex: null,
    roundCount: 3,
    phaseStartedAt: null,
    deadline: null,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    roundNumber: 1,
    upNext: null,
    canSpinForNextRound: false,
    ...overrides,
  };
}

function wheelWith(
  pick: QuizshowWheelPick,
  overrides: Partial<QuizshowWheelView> = {},
): QuizshowWheelView {
  return {
    wheelRoundIndex: 0,
    pick,
    slices: [],
    spinNumber: 1,
    spinTotal: 3,
    spin: null,
    playingRoundIndex: null,
    ...overrides,
  };
}

function stateWith(
  cursor: QuizshowCursor,
  wheel: QuizshowWheelView | null,
): QuizshowHostState {
  const state: EndCopyState = { cursor, wheel };
  return state as QuizshowHostState;
}

describe("isBeforeFirstScore on a wheel", () => {
  it("is true on a question wheel at spin 1 of round 1", () => {
    const state = stateWith(
      cursorIn("wheel", { roundNumber: 1 }),
      wheelWith("question", { spinNumber: 1 }),
    );
    expect(isBeforeFirstScore(state)).toBe(true);
  });

  it("is false on a question wheel at spin 2", () => {
    const state = stateWith(
      cursorIn("wheel", { roundNumber: 1 }),
      wheelWith("question", { spinNumber: 2 }),
    );
    expect(isBeforeFirstScore(state)).toBe(false);
  });

  it("is true on a question of a question wheel at spin 1", () => {
    const state = stateWith(
      cursorIn("open", { roundIndex: 2, roundNumber: 1, questionIndex: 0 }),
      wheelWith("question", { spinNumber: 1, playingRoundIndex: 2 }),
    );
    expect(isBeforeFirstScore(state)).toBe(true);
  });

  it("is false on a pick-a-round wheel once round 1 has been played", () => {
    const state = stateWith(
      cursorIn("wheel", { roundNumber: 1 }),
      wheelWith("round", { spinNumber: 1 }),
    );
    expect(isBeforeFirstScore(state)).toBe(false);
  });
});
