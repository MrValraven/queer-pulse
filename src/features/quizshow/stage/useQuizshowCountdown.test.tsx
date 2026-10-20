import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { QuizshowCursor } from "../../../shared/contracts/quizshow";
import { useQuizshowCountdown } from "./useQuizshowCountdown";

const START_AT = 1_000_000;
const CLOCK_OFFSET_MS = 500;

function cursorWith(overrides: Partial<QuizshowCursor>): QuizshowCursor {
  return {
    phaseId: "7",
    status: "running",
    phase: "open",
    roundIndex: 0,
    questionIndex: 0,
    roundCount: 1,
    phaseStartedAt: START_AT + CLOCK_OFFSET_MS,
    deadline: START_AT + CLOCK_OFFSET_MS + 20_000,
    extraTimeDeadline: START_AT + CLOCK_OFFSET_MS + 30_000,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    ...overrides,
  };
}

describe("useQuizshowCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START_AT);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down from the server deadline with the clock offset", () => {
    const { result } = renderHook(() =>
      useQuizshowCountdown(cursorWith({}), CLOCK_OFFSET_MS, {
        hasExtraTime: false,
      }),
    );
    expect(result.current.remainingMs).toBe(20_000);
    expect(result.current.fraction).toBe(1);
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.remainingMs).toBe(15_000);
    expect(result.current.fraction).toBeCloseTo(0.75);
    expect(result.current.isPaused).toBe(false);
  });

  it("counts an extra-time player to their own deadline", () => {
    const { result } = renderHook(() =>
      useQuizshowCountdown(cursorWith({}), CLOCK_OFFSET_MS, {
        hasExtraTime: true,
      }),
    );
    expect(result.current.remainingMs).toBe(30_000);
    act(() => {
      vi.advanceTimersByTime(25_000);
    });
    expect(result.current.remainingMs).toBe(5_000);
    expect(result.current.isFinishingUp).toBe(false);
  });

  it("says finishing up between the deadline and the extra-time deadline for everyone else", () => {
    const { result } = renderHook(() =>
      useQuizshowCountdown(cursorWith({}), CLOCK_OFFSET_MS, {
        hasExtraTime: false,
      }),
    );
    expect(result.current.isFinishingUp).toBe(false);
    act(() => {
      vi.advanceTimersByTime(22_000);
    });
    expect(result.current.remainingMs).toBe(0);
    expect(result.current.isFinishingUp).toBe(true);
  });

  it("stops saying finishing up once the extra-time deadline has passed", () => {
    const { result } = renderHook(() =>
      useQuizshowCountdown(cursorWith({}), CLOCK_OFFSET_MS, {
        hasExtraTime: false,
      }),
    );
    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    expect(result.current.isFinishingUp).toBe(false);
  });
});

describe("useQuizshowCountdown on paused and untimed phases", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START_AT);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports a paused phase with its frozen remainder", () => {
    const pausedCursor = cursorWith({
      status: "paused",
      deadline: null,
      extraTimeDeadline: null,
      pausedRemainingMs: 8_000,
      pausedExtraTimeRemainingMs: 12_000,
    });
    const { result } = renderHook(() =>
      useQuizshowCountdown(pausedCursor, CLOCK_OFFSET_MS, {
        hasExtraTime: false,
      }),
    );
    expect(result.current.isPaused).toBe(true);
    expect(result.current.remainingMs).toBe(8_000);
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.remainingMs).toBe(8_000);
  });

  it("holds the fraction where it stood when a pause arrives", () => {
    const runningCursor = cursorWith({});
    const pausedCursor = cursorWith({
      status: "paused",
      deadline: null,
      extraTimeDeadline: null,
      pausedRemainingMs: 15_000,
      pausedExtraTimeRemainingMs: 25_000,
    });
    const { result, rerender } = renderHook(
      ({ cursor }: { cursor: QuizshowCursor }) =>
        useQuizshowCountdown(cursor, CLOCK_OFFSET_MS, { hasExtraTime: false }),
      { initialProps: { cursor: runningCursor } },
    );
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.fraction).toBeCloseTo(0.75);
    rerender({ cursor: pausedCursor });
    expect(result.current.isPaused).toBe(true);
    expect(result.current.fraction).toBeCloseTo(0.75);
    act(() => {
      vi.advanceTimersByTime(8_000);
    });
    expect(result.current.fraction).toBeCloseTo(0.75);
    expect(result.current.remainingMs).toBe(15_000);
  });

  it("keeps the last running place through a restart pause", () => {
    const runningCursor = cursorWith({});
    const restartPausedCursor = cursorWith({
      status: "paused",
      deadline: null,
      extraTimeDeadline: null,
      pausedRemainingMs: null,
      pausedExtraTimeRemainingMs: null,
      isRestartRecovery: true,
    });
    const { result, rerender } = renderHook(
      ({ cursor }: { cursor: QuizshowCursor }) =>
        useQuizshowCountdown(cursor, CLOCK_OFFSET_MS, { hasExtraTime: false }),
      { initialProps: { cursor: runningCursor } },
    );
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    rerender({ cursor: restartPausedCursor });
    expect(result.current.isPaused).toBe(true);
    expect(result.current.remainingMs).toBeNull();
    expect(result.current.fraction).toBeCloseTo(0.5);
    act(() => {
      vi.advanceTimersByTime(6_000);
    });
    expect(result.current.fraction).toBeCloseTo(0.5);
  });

  it("measures a pause seen first against the own limit, or holds full", () => {
    const pausedCursor = cursorWith({
      status: "paused",
      deadline: null,
      extraTimeDeadline: null,
      pausedRemainingMs: 5_000,
      pausedExtraTimeRemainingMs: 15_000,
    });
    const { result: standardResult } = renderHook(() =>
      useQuizshowCountdown(pausedCursor, CLOCK_OFFSET_MS, {
        hasExtraTime: false,
        standardLimitMs: 20_000,
      }),
    );
    expect(standardResult.current.fraction).toBeCloseTo(0.25);
    const { result: extraTimeResult } = renderHook(() =>
      useQuizshowCountdown(pausedCursor, CLOCK_OFFSET_MS, {
        hasExtraTime: true,
        standardLimitMs: 20_000,
      }),
    );
    expect(extraTimeResult.current.fraction).toBeCloseTo(0.5);
    const restartPausedCursor = cursorWith({
      status: "paused",
      deadline: null,
      extraTimeDeadline: null,
      pausedRemainingMs: null,
      pausedExtraTimeRemainingMs: null,
      isRestartRecovery: true,
    });
    const { result: unknownResult } = renderHook(() =>
      useQuizshowCountdown(restartPausedCursor, CLOCK_OFFSET_MS, {
        hasExtraTime: false,
      }),
    );
    expect(unknownResult.current.fraction).toBe(1);
  });

  it("reports a pause in an untimed phase with no bar", () => {
    const pausedRevealCursor = cursorWith({
      status: "paused",
      phase: "reveal",
      deadline: null,
      extraTimeDeadline: null,
    });
    const { result } = renderHook(() =>
      useQuizshowCountdown(pausedRevealCursor, CLOCK_OFFSET_MS, {
        hasExtraTime: false,
      }),
    );
    expect(result.current).toEqual({
      remainingMs: null,
      fraction: null,
      isFinishingUp: false,
      isPaused: true,
    });
  });

  it("answers null on untimed phases", () => {
    const untimedCursor = cursorWith({
      phase: "reveal",
      phaseStartedAt: null,
      deadline: null,
      extraTimeDeadline: null,
    });
    const { result } = renderHook(() =>
      useQuizshowCountdown(untimedCursor, CLOCK_OFFSET_MS, {
        hasExtraTime: false,
      }),
    );
    expect(result.current).toEqual({
      remainingMs: null,
      fraction: null,
      isFinishingUp: false,
      isPaused: false,
    });
    const { result: noCursorResult } = renderHook(() =>
      useQuizshowCountdown(null, CLOCK_OFFSET_MS, { hasExtraTime: false }),
    );
    expect(noCursorResult.current.remainingMs).toBeNull();
  });
});
