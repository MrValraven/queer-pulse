import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { QuizshowWheelSpin } from "../../../shared/contracts/quizshow";
import { useQuizshowWheelClock } from "./useQuizshowWheelClock";

const START_AT = 1_000_000;
const SPIN_MS = 5500;

function spinStartedAt(startedAt: number): QuizshowWheelSpin {
  return {
    landedSliceIndex: 0,
    startedAt,
    durationMs: SPIN_MS,
    turns: 5,
    jitterSeed: 0,
    startAngle: 0,
  };
}

/** A spin that lands `landsInMs` from the faked now. */
function spinLandingIn(landsInMs: number): QuizshowWheelSpin {
  return spinStartedAt(START_AT + landsInMs - SPIN_MS);
}

describe("useQuizshowWheelClock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START_AT);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("flips to landed exactly at the landing", () => {
    const { result } = renderHook(() =>
      useQuizshowWheelClock(spinLandingIn(1000), 0),
    );
    expect(result.current.isLanded).toBe(false);
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current.isLanded).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isLanded).toBe(true);
  });

  it("waits the extra delay after the landing", () => {
    const { result } = renderHook(() =>
      useQuizshowWheelClock(spinLandingIn(1000), 0, 250),
    );
    act(() => {
      vi.advanceTimersByTime(1249);
    });
    expect(result.current.isLanded).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isLanded).toBe(true);
  });

  it("is landed on the first render for a spin that landed 10 s ago", () => {
    const { result } = renderHook(() =>
      useQuizshowWheelClock(spinLandingIn(-10_000), 0),
    );
    expect(result.current.isLanded).toBe(true);
  });

  it("is never landed without a spin", () => {
    const { result } = renderHook(() => useQuizshowWheelClock(null, 0));
    expect(result.current.isLanded).toBe(false);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.isLanded).toBe(false);
  });

  it("reads the server clock through the offset", () => {
    const startedAt = Date.now() + 5000 - 5500;
    const { result } = renderHook(() =>
      useQuizshowWheelClock(spinStartedAt(startedAt), 5000),
    );
    expect(result.current.serverNowMs).toBe(START_AT + 5000);
    expect(result.current.isLanded).toBe(true);
  });

  it("keeps at most one timer while waiting and none after unmount", () => {
    const { unmount } = renderHook(() =>
      useQuizshowWheelClock(spinLandingIn(1000), 0),
    );
    expect(vi.getTimerCount()).toBeLessThanOrEqual(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("restarts the wait when a new spin arrives", () => {
    const { result, rerender } = renderHook(
      ({ spin }: { spin: QuizshowWheelSpin | null }) =>
        useQuizshowWheelClock(spin, 0),
      { initialProps: { spin: spinLandingIn(1000) } },
    );
    rerender({ spin: spinLandingIn(3000) });
    expect(vi.getTimerCount()).toBeLessThanOrEqual(1);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.isLanded).toBe(false);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.isLanded).toBe(true);
  });

  it("lands at once when an already landed spin replaces null", () => {
    const { result, rerender } = renderHook(
      ({ spin }: { spin: QuizshowWheelSpin | null }) =>
        useQuizshowWheelClock(spin, 0),
      { initialProps: { spin: null as QuizshowWheelSpin | null } },
    );
    expect(result.current.isLanded).toBe(false);
    rerender({ spin: spinLandingIn(-10_000) });
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current.isLanded).toBe(true);
  });

  it("moves the landing moment when the clock offset changes", () => {
    const { result, rerender } = renderHook(
      ({ clockOffsetMs }: { clockOffsetMs: number }) =>
        useQuizshowWheelClock(spinLandingIn(1000), clockOffsetMs),
      { initialProps: { clockOffsetMs: 0 } },
    );
    expect(result.current.isLanded).toBe(false);
    rerender({ clockOffsetMs: 600 });
    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(result.current.isLanded).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isLanded).toBe(true);
  });
});
