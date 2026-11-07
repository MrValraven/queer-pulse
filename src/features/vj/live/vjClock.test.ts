import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { VjClockSample } from "../../../shared/contracts/vj";
import { createVjClock, useVjClockOffset } from "./vjClock";

const WALL_EPOCH_MS = 1_800_000_000_000;

/** A fake device: a local clock and a wall clock the test moves by hand. */
function fakeDevice(localStartMs = 5_000) {
  const device = { localMs: localStartMs, wallMs: WALL_EPOCH_MS };
  const clock = createVjClock({
    localNow: () => device.localMs,
    wallNow: () => device.wallMs,
  });
  return { device, clock };
}

/** One sample whose offset is exactly offsetMs, with a short round trip. */
function sampleWithOffset(
  offsetMs: number,
  sentAt = 5_000,
  roundTripMs = 10,
): VjClockSample {
  return {
    sentAt,
    receivedAt: sentAt + roundTripMs,
    serverNow: sentAt + roundTripMs / 2 + offsetMs,
  };
}

describe("createVjClock", () => {
  it("serverNow follows the wall clock before any sample", () => {
    const { device, clock } = fakeDevice();
    expect(clock.offsetMs()).toBeNull();
    expect(clock.isSynced()).toBe(false);
    expect(clock.serverNow()).toBe(WALL_EPOCH_MS);
    device.localMs += 250;
    device.wallMs += 250;
    expect(clock.serverNow()).toBe(WALL_EPOCH_MS + 250);
    expect(clock.toLocalTime(WALL_EPOCH_MS + 250)).toBe(device.localMs);
  });

  it("the first sample sets the offset", () => {
    const { device, clock } = fakeDevice();
    clock.addSample(sampleWithOffset(1_000));
    expect(clock.offsetMs()).toBe(1_000);
    expect(clock.isSynced()).toBe(true);
    expect(clock.serverNow()).toBe(device.localMs + 1_000);
  });

  it("a near sample moves the offset halfway", () => {
    const { clock } = fakeDevice();
    clock.addSample(sampleWithOffset(1_000));
    // Two samples: the target is their mean, 1010, which sits 10 ms away.
    clock.addSample(sampleWithOffset(1_020));
    expect(clock.offsetMs()).toBe(1_005);
  });

  it("a far sample jumps", () => {
    const { clock } = fakeDevice();
    clock.addSample(sampleWithOffset(1_000));
    // The target is the mean of 1000 and 1200: 1100, well past the slew threshold.
    clock.addSample(sampleWithOffset(1_200));
    expect(clock.offsetMs()).toBe(1_100);
  });

  it("a sample with an unusable round trip leaves the clock unsynced", () => {
    const { clock } = fakeDevice();
    clock.addSample(sampleWithOffset(1_000, 5_000, 2_000));
    expect(clock.offsetMs()).toBeNull();
    expect(clock.isSynced()).toBe(false);
  });

  it("a seed counts until a live sample and isSynced stays false", () => {
    const { device, clock } = fakeDevice();
    clock.seedOffset(400);
    expect(clock.offsetMs()).toBe(400);
    expect(clock.isSynced()).toBe(false);
    expect(clock.serverNow()).toBe(device.localMs + 400);

    clock.addSample(sampleWithOffset(410));
    expect(clock.offsetMs()).toBe(410);
    expect(clock.isSynced()).toBe(true);

    clock.seedOffset(9_000);
    expect(clock.offsetMs()).toBe(410);
  });

  it("toLocalTime and toServerTime invert each other", () => {
    const { clock } = fakeDevice();
    clock.addSample(sampleWithOffset(-2_500));
    expect(clock.toServerTime(10_000)).toBe(7_500);
    expect(clock.toLocalTime(7_500)).toBe(10_000);
    expect(clock.toLocalTime(clock.toServerTime(12_345))).toBe(12_345);
  });

  it("subscribers hear an offset change and stop after unsubscribe", () => {
    const { clock } = fakeDevice();
    const listener = vi.fn();
    const unsubscribe = clock.subscribe(listener);

    clock.addSample(sampleWithOffset(1_000));
    expect(listener).toHaveBeenCalledTimes(1);

    clock.addSample(sampleWithOffset(1_200));
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    clock.addSample(sampleWithOffset(3_000));
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe("useVjClockOffset", () => {
  it("the hook re-renders on a new offset", () => {
    const { clock } = fakeDevice();
    const { result } = renderHook(() => useVjClockOffset(clock));
    expect(result.current).toEqual({ offsetMs: null, isSynced: false });

    act(() => {
      clock.seedOffset(300);
    });
    expect(result.current).toEqual({ offsetMs: 300, isSynced: false });

    act(() => {
      clock.addSample(sampleWithOffset(800));
    });
    expect(result.current).toEqual({ offsetMs: 800, isSynced: true });
  });
});
