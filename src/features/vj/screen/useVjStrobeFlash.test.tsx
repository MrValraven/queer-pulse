import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVjStrobeFlash } from "./useVjStrobeFlash";

interface StrobeProps {
  isStrobing: boolean;
  bpm: number;
  isEnabled?: boolean;
}

/** Renders the hook and records the clock time of every flash start. */
function renderStrobe(initialProps: StrobeProps) {
  const flashStartsMs: number[] = [];
  let wasFlashUp = false;
  const view = renderHook(
    (props: StrobeProps) => {
      const isFlashUp = useVjStrobeFlash(
        props.isStrobing,
        props.bpm,
        props.isEnabled,
      );
      if (isFlashUp && !wasFlashUp) flashStartsMs.push(Date.now());
      wasFlashUp = isFlashUp;
      return isFlashUp;
    },
    { initialProps },
  );
  return { ...view, flashStartsMs };
}

/**
 * Advances one millisecond at a time so every flash renders on its own. A
 * first zero step runs any timer already due, so a flash is recorded at the
 * moment its timer fired.
 */
function stepMilliseconds(durationMs: number): void {
  act(() => {
    vi.advanceTimersByTime(0);
  });
  for (let elapsedMs = 0; elapsedMs < durationMs; elapsedMs += 1) {
    act(() => {
      vi.advanceTimersByTime(1);
    });
  }
}

function startsBetween(
  flashStartsMs: number[],
  fromMs: number,
  toMs: number,
): number[] {
  return flashStartsMs.filter(
    (flashStartMs) => flashStartMs >= fromMs && flashStartMs < toMs,
  );
}

describe("useVjStrobeFlash", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("flashes at most 3 times a second at 200 BPM, 400 ms apart", () => {
    const { flashStartsMs } = renderStrobe({ isStrobing: true, bpm: 200 });
    stepMilliseconds(4000);
    expect(flashStartsMs.length).toBeGreaterThanOrEqual(9);
    for (const windowStartMs of flashStartsMs) {
      expect(
        startsBetween(flashStartsMs, windowStartMs, windowStartMs + 1000)
          .length,
      ).toBeLessThanOrEqual(3);
    }
    flashStartsMs.slice(1).forEach((flashStartMs, flashIndex) => {
      const previousStartMs = flashStartsMs[flashIndex] ?? 0;
      expect(flashStartMs - previousStartMs).toBeGreaterThanOrEqual(400);
    });
    // Four starts span more than a second plus one frame of paint delay.
    flashStartsMs.slice(3).forEach((flashStartMs, flashIndex) => {
      const threeEarlierMs = flashStartsMs[flashIndex] ?? 0;
      expect(flashStartMs - threeEarlierMs).toBeGreaterThan(1000 + 17);
    });
  });

  it("times the spacing on performance.now and waits out a timer that fires early", () => {
    const fakePerformanceNow = performance.now.bind(performance);
    let performanceLagMs = 0;
    vi.spyOn(performance, "now").mockImplementation(
      () => fakePerformanceNow() - performanceLagMs,
    );
    const { flashStartsMs } = renderStrobe({ isStrobing: true, bpm: 120 });
    stepMilliseconds(5);
    expect(flashStartsMs).toHaveLength(1);
    // From here the timer reaches its 500 ms 30 ms before performance.now does.
    performanceLagMs = 30;
    stepMilliseconds(600);
    expect(flashStartsMs).toHaveLength(2);
    const [firstStartMs = 0, secondStartMs = 0] = flashStartsMs;
    expect(secondStartMs - firstStartMs).toBeGreaterThanOrEqual(529);
    expect(secondStartMs - firstStartMs).toBeLessThanOrEqual(531);
  });

  it("shows no flash on a screen that is not enabled", () => {
    const { result, flashStartsMs } = renderStrobe({
      isStrobing: true,
      bpm: 120,
      isEnabled: false,
    });
    stepMilliseconds(3000);
    expect(flashStartsMs).toEqual([]);
    expect(result.current).toBe(false);
  });

  it("stops flashing at once when the screen is no longer enabled", () => {
    const { result, rerender, flashStartsMs } = renderStrobe({
      isStrobing: true,
      bpm: 120,
    });
    stepMilliseconds(1020);
    const countWhileEnabled = flashStartsMs.length;
    expect(countWhileEnabled).toBeGreaterThan(0);
    rerender({ isStrobing: true, bpm: 120, isEnabled: false });
    expect(result.current).toBe(false);
    stepMilliseconds(2000);
    expect(flashStartsMs).toHaveLength(countWhileEnabled);
  });

  it("waits a full period and keeps the original 10 s when enabled halfway through", () => {
    const { result, rerender, flashStartsMs } = renderStrobe({
      isStrobing: true,
      bpm: 120,
      isEnabled: false,
    });
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(flashStartsMs).toEqual([]);
    rerender({ isStrobing: true, bpm: 120, isEnabled: true });
    stepMilliseconds(1000);
    expect(flashStartsMs[0]).toBeGreaterThanOrEqual(6500);
    expect(flashStartsMs[0]).toBeLessThanOrEqual(6501);
    stepMilliseconds(6000);
    expect(startsBetween(flashStartsMs, 9000, 10_001).length).toBeGreaterThan(
      0,
    );
    expect(startsBetween(flashStartsMs, 10_001, 13_001)).toEqual([]);
    expect(result.current).toBe(false);
  });

  it("flashes once a beat at 120 BPM", () => {
    const { flashStartsMs } = renderStrobe({ isStrobing: true, bpm: 120 });
    stepMilliseconds(2000);
    const firstStartMs = flashStartsMs[0] ?? Number.NaN;
    expect(
      flashStartsMs.map((flashStartMs) => flashStartMs - firstStartMs),
    ).toEqual([0, 500, 1000, 1500]);
  });

  it("stops 10 s after it applied strobe on with the socket down", () => {
    const { result, flashStartsMs } = renderStrobe({
      isStrobing: true,
      bpm: 120,
    });
    act(() => {
      vi.advanceTimersByTime(9000);
    });
    const countBeforeLastSecond = flashStartsMs.length;
    stepMilliseconds(990);
    expect(flashStartsMs.length).toBeGreaterThan(countBeforeLastSecond);

    stepMilliseconds(3010);
    expect(startsBetween(flashStartsMs, 10_001, 13_001)).toEqual([]);
    expect(result.current).toBe(false);
  });

  it("does not extend the 10 s when strobe is sent on again", () => {
    const { result, rerender, flashStartsMs } = renderStrobe({
      isStrobing: true,
      bpm: 120,
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    rerender({ isStrobing: true, bpm: 180 });
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    stepMilliseconds(4000);
    expect(startsBetween(flashStartsMs, 9000, 10_001).length).toBeGreaterThan(
      0,
    );
    expect(startsBetween(flashStartsMs, 10_001, 13_001)).toEqual([]);
    expect(result.current).toBe(false);
  });

  it("starts a fresh 10 s after strobe went off and on", () => {
    const { result, rerender, flashStartsMs } = renderStrobe({
      isStrobing: true,
      bpm: 120,
    });
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    rerender({ isStrobing: false, bpm: 120 });
    expect(result.current).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    rerender({ isStrobing: true, bpm: 120 });
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    stepMilliseconds(3000);
    expect(startsBetween(flashStartsMs, 13_000, 14_000).length).toBeGreaterThan(
      0,
    );
    stepMilliseconds(3000);
    expect(startsBetween(flashStartsMs, 15_001, 17_000)).toEqual([]);
    expect(result.current).toBe(false);
  });
});
