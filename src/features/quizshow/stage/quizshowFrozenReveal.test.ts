import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  QuizshowCursor,
  QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import { slowRevealOf } from "../screen/quizshowScreenTileModel";
import { frozenRevealProgressOf } from "./quizshowFrozenReveal";
import { useHeldSlowReveal } from "./useHeldSlowReveal";

const WINDOW = { startsAt: 0, endsAt: 10_000, isCleared: false };

describe("frozenRevealProgressOf", () => {
  const pausedOpen = {
    status: "paused",
    phase: "open",
    pausedRemainingMs: 2_000,
  } as const;

  it("is null while the session runs", () => {
    expect(
      frozenRevealProgressOf(WINDOW, { ...pausedOpen, status: "running" }, 0),
    ).toBeNull();
    expect(frozenRevealProgressOf(WINDOW, null, 0)).toBeNull();
  });

  it("holds the share of the window already played when open is paused", () => {
    expect(frozenRevealProgressOf(WINDOW, pausedOpen, 5_000)).toBeCloseTo(0.8);
  });

  it("counts the answer limit still to come when read is paused", () => {
    const pausedRead = { ...pausedOpen, phase: "read" } as const;
    expect(frozenRevealProgressOf(WINDOW, pausedRead, 5_000)).toBeCloseTo(0.3);
  });

  it("clamps to clear when the remaining time is negative", () => {
    expect(
      frozenRevealProgressOf(
        WINDOW,
        { ...pausedOpen, pausedRemainingMs: -500 },
        0,
      ),
    ).toBe(1);
  });

  it("is null in a phase other than read or open", () => {
    expect(
      frozenRevealProgressOf(WINDOW, { ...pausedOpen, phase: "reveal" }, 0),
    ).toBeNull();
    expect(
      frozenRevealProgressOf(
        WINDOW,
        { ...pausedOpen, phase: "leaderboard" },
        0,
      ),
    ).toBeNull();
  });

  it("is null when nothing is left to freeze", () => {
    expect(frozenRevealProgressOf(null, pausedOpen, 5_000)).toBeNull();
    expect(
      frozenRevealProgressOf({ ...WINDOW, isCleared: true }, pausedOpen, 0),
    ).toBeNull();
    expect(
      frozenRevealProgressOf(
        WINDOW,
        { ...pausedOpen, pausedRemainingMs: null },
        0,
      ),
    ).toBeNull();
  });
});

describe("the frozen value after the host added time", () => {
  const PHASE_STARTED_AT = 1_000_000;
  const READ_MS = 4_000;
  const LIMIT_MS = 20_000;
  const ADDED_MS = 10_000;
  const PAUSED_AT = PHASE_STARTED_AT + 6_000;
  const RUNNING_DEADLINE = PHASE_STARTED_AT + LIMIT_MS + ADDED_MS;

  const question: QuizshowQuestionView = {
    questionId: "question-1",
    roundIndex: 0,
    questionIndex: 0,
    roundKind: "quiz",
    type: "multiple_choice",
    prompt: { en: "Whose flag is this?", pt: "De quem é esta bandeira?" },
    mediaUrl: "https://example.test/flag.jpg",
    points: 1000,
    timeLimitSeconds: LIMIT_MS / 1000,
    mediaAlt: { en: "", pt: "" },
    mediaReveal: "slow",
    numberUnit: { en: "", pt: "" },
    readMs: READ_MS,
    options: [
      { id: "option-a", text: { en: "Bi", pt: "Bi" } },
      { id: "option-b", text: { en: "Pan", pt: "Pan" } },
    ],
  };

  function cursorWith(overrides: Partial<QuizshowCursor>): QuizshowCursor {
    return {
      phaseId: "1",
      status: "running",
      phase: "open",
      roundIndex: 0,
      questionIndex: 0,
      roundCount: 3,
      phaseStartedAt: PHASE_STARTED_AT,
      deadline: RUNNING_DEADLINE,
      extraTimeDeadline: null,
      pausedRemainingMs: null,
      pausedExtraTimeRemainingMs: null,
      isRestartRecovery: false,
      roundNumber: 1,
      upNext: null,
      canSpinForNextRound: false,
      talkStartsAt: null,
      autoAdvanceAt: null,
      podiumRevealedCount: null,
      ...overrides,
    };
  }

  it("equals the live value just before the pause", () => {
    const running = cursorWith({});
    const paused = cursorWith({
      status: "paused",
      deadline: null,
      pausedRemainingMs: RUNNING_DEADLINE - PAUSED_AT,
    });
    const hook = renderHook(
      ({ cursor }: { cursor: QuizshowCursor }) =>
        useHeldSlowReveal(question, cursor, 0),
      { initialProps: { cursor: running } },
    );
    const liveWindow = hook.result.current;
    if (liveWindow === null) {
      throw new Error("A running open phase has a reveal window");
    }
    const liveProgress =
      (PAUSED_AT - liveWindow.startsAt) /
      (liveWindow.endsAt - liveWindow.startsAt);
    hook.rerender({ cursor: paused });
    expect(
      frozenRevealProgressOf(hook.result.current, paused, LIMIT_MS),
    ).toBeCloseTo(liveProgress);
    // The bare window drops the added seconds, which is what the hold avoids.
    const bareProgress = frozenRevealProgressOf(
      slowRevealOf(question, paused, 0),
      paused,
      LIMIT_MS,
    );
    expect(bareProgress).not.toBeCloseTo(liveProgress);
  });
});
