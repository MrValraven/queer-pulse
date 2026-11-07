import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  type VjStageState,
} from "../../../../shared/contracts/vj";
import type { VjStageController, VjUpcomingFrame } from "../../live/useVjStage";
import { useVjMirrorFrames } from "./useVjMirrorFrames";
import { useVjRemoteClock, type VjRemoteClock } from "./useVjRemoteClock";
import { useVjSyncedNow } from "./useVjSyncedNow";

interface FakeStageFields {
  state?: VjStageState | null;
  upcoming?: VjUpcomingFrame | null;
  isClockSynced?: boolean;
  offsetMs?: number;
}

/** A stage with only the fields the clock and mirror adapters read. */
function fakeStage(fields: FakeStageFields = {}): VjStageController {
  const offsetMs = fields.offsetMs ?? 0;
  const partialStage: Partial<VjStageController> = {
    state: fields.state ?? null,
    latestState: fields.state ?? null,
    upcoming: fields.upcoming ?? null,
    isClockSynced: fields.isClockSynced ?? false,
    serverNow: () => 1_000 + offsetMs,
    toLocalTime: (serverMs: number) => serverMs - offsetMs,
  };
  return partialStage as VjStageController;
}

function fakeClock(readings: number[]): VjRemoteClock {
  let readingIndex = 0;
  return {
    serverNow: () => {
      const reading = readings[Math.min(readingIndex, readings.length - 1)];
      if (reading === undefined) throw new Error("fakeClock needs a reading");
      readingIndex += 1;
      return reading;
    },
    toLocalTime: (serverMs: number) => serverMs,
    isSynced: true,
  };
}

function stateAt(revision: number): VjStageState {
  return { ...createVjStageState("mirror-epoch", 0), revision };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("useVjRemoteClock", () => {
  it("serverNow follows the stage clock", () => {
    const { result, rerender } = renderHook(
      ({ stage }: { stage: VjStageController }) => useVjRemoteClock(stage),
      { initialProps: { stage: fakeStage({ offsetMs: 250 }) } },
    );
    expect(result.current.serverNow()).toBe(1_250);
    expect(result.current.toLocalTime(5_250)).toBe(5_000);
    expect(result.current.isSynced).toBe(false);

    rerender({ stage: fakeStage({ offsetMs: -40, isClockSynced: true }) });
    expect(result.current.serverNow()).toBe(960);
    expect(result.current.isSynced).toBe(true);
  });
});

describe("useVjMirrorFrames", () => {
  it("the mirror shows the applied state and the upcoming one as pending", () => {
    const appliedState = stateAt(4);
    const queuedState = stateAt(5);
    const stage = fakeStage({
      state: appliedState,
      upcoming: { state: queuedState, applyAt: 9_000 },
    });
    const { result } = renderHook(() =>
      useVjMirrorFrames(stage, fakeClock([8_200])),
    );
    expect(result.current.shownState).toBe(appliedState);
    expect(result.current.pendingState).toBe(queuedState);
    expect(result.current.nextApplyAt).toBe(9_000);
  });

  it("stamps when a frame was queued", () => {
    const appliedState = stateAt(4);
    const queuedState = stateAt(5);
    const clock = fakeClock([8_400, 9_900]);
    const { result, rerender } = renderHook(
      ({ stage }: { stage: VjStageController }) =>
        useVjMirrorFrames(stage, clock),
      { initialProps: { stage: fakeStage({ state: appliedState }) } },
    );
    expect(result.current.frameReceivedAt).toBeNull();

    rerender({
      stage: fakeStage({
        state: appliedState,
        upcoming: { state: queuedState, applyAt: 9_000 },
      }),
    });
    expect(result.current.frameReceivedAt).toBe(8_400);

    // The queue rebuilds the same earliest frame: the stamp stays.
    rerender({
      stage: fakeStage({
        state: appliedState,
        upcoming: { state: queuedState, applyAt: 9_000 },
      }),
    });
    expect(result.current.frameReceivedAt).toBe(8_400);

    rerender({ stage: fakeStage({ state: queuedState }) });
    expect(result.current.shownState).toBe(queuedState);
    expect(result.current.pendingState).toBeNull();
    expect(result.current.nextApplyAt).toBeNull();
    expect(result.current.frameReceivedAt).toBeNull();
  });
});

describe("useVjSyncedNow", () => {
  it("re-reads the synced time every interval while enabled", () => {
    vi.useFakeTimers();
    let serverMs = 5_000;
    const clock: VjRemoteClock = {
      serverNow: () => serverMs,
      toLocalTime: (value: number) => value,
      isSynced: true,
    };
    const { result, rerender } = renderHook(
      ({ isEnabled }: { isEnabled: boolean }) =>
        useVjSyncedNow(clock, { intervalMs: 250, isEnabled }),
      { initialProps: { isEnabled: true } },
    );
    expect(result.current).toBe(5_000);

    serverMs = 5_250;
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe(5_250);

    rerender({ isEnabled: false });
    serverMs = 6_000;
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(result.current).toBe(5_250);
  });
});
