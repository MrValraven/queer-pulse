import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VjBeatPosition, VjTempo } from "../../../../shared/contracts/vj";
import { useVjBeatTicker } from "./useVjBeatTicker";
import type { VjRemoteClock } from "./useVjRemoteClock";

/** 120 bpm: one beat every 500 ms, a "1" at server ms 10 000. */
const TEMPO: VjTempo = {
  bpm: 120,
  downbeatAt: 10_000,
  quantize: "off",
  source: "manual",
};

let pendingFrames = new Map<number, FrameRequestCallback>();
let nextFrameHandle = 1;
let serverMs = 10_000;

const clock: VjRemoteClock = {
  serverNow: () => serverMs,
  toLocalTime: (value: number) => value,
  isSynced: true,
};

/** Runs every animation frame requested so far, once. */
function runFrame() {
  const frames = [...pendingFrames.values()];
  pendingFrames = new Map();
  act(() => {
    for (const frame of frames) frame(0);
  });
}

function setVisibility(visibility: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => visibility,
  });
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

beforeEach(() => {
  pendingFrames = new Map();
  nextFrameHandle = 1;
  serverMs = 10_000;
  vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => {
    const frameHandle = nextFrameHandle;
    nextFrameHandle += 1;
    pendingFrames.set(frameHandle, frame);
    return frameHandle;
  });
  vi.stubGlobal("cancelAnimationFrame", (frameHandle: number) => {
    pendingFrames.delete(frameHandle);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  setVisibility("visible");
});

describe("useVjBeatTicker", () => {
  it("reports the beat position each frame", () => {
    const positions: VjBeatPosition[] = [];
    renderHook(() =>
      useVjBeatTicker({
        clock,
        tempo: TEMPO,
        isEnabled: true,
        onFrame: (position) => positions.push(position),
      }),
    );

    serverMs = 10_250;
    runFrame();
    serverMs = 11_500;
    runFrame();

    expect(positions).toHaveLength(2);
    expect(positions[0]).toMatchObject({
      beatIndex: 0,
      beatInBar: 0,
      phase: 0.5,
    });
    expect(positions[1]).toMatchObject({ beatIndex: 3, beatInBar: 3 });
  });

  it("stops when disabled", () => {
    const onFrame = vi.fn<(position: VjBeatPosition) => void>();
    const { rerender } = renderHook(
      ({ isEnabled }: { isEnabled: boolean }) =>
        useVjBeatTicker({ clock, tempo: TEMPO, isEnabled, onFrame }),
      { initialProps: { isEnabled: true } },
    );
    runFrame();
    expect(onFrame).toHaveBeenCalledTimes(1);

    rerender({ isEnabled: false });
    expect(pendingFrames.size).toBe(0);
    runFrame();
    expect(onFrame).toHaveBeenCalledTimes(1);
  });

  it("pauses while the tab is hidden", () => {
    const onFrame = vi.fn<(position: VjBeatPosition) => void>();
    renderHook(() =>
      useVjBeatTicker({ clock, tempo: TEMPO, isEnabled: true, onFrame }),
    );

    setVisibility("hidden");
    expect(pendingFrames.size).toBe(0);
    runFrame();
    expect(onFrame).not.toHaveBeenCalled();

    setVisibility("visible");
    runFrame();
    expect(onFrame).toHaveBeenCalledTimes(1);
  });

  it("asks for no frame without a tempo", () => {
    renderHook(() =>
      useVjBeatTicker({
        clock,
        tempo: null,
        isEnabled: true,
        onFrame: () => undefined,
      }),
    );
    expect(pendingFrames.size).toBe(0);
  });
});
