import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  VJ_CLOCK_SYNC_BURST_COUNT,
  VJ_CLOCK_SYNC_BURST_SPACING_MS,
  VJ_CLOCK_SYNC_INTERVAL_MS,
} from "../vj.constants";
import {
  createVjClockSyncSchedule,
  vjClockSampleOf,
  vjLocalNow,
} from "./vjClockSync";

const BURST_LENGTH_MS =
  (VJ_CLOCK_SYNC_BURST_COUNT - 1) * VJ_CLOCK_SYNC_BURST_SPACING_MS;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("createVjClockSyncSchedule", () => {
  it("sends five syncs 250 ms apart then one every 30 s", () => {
    const sendSync = vi.fn();
    const schedule = createVjClockSyncSchedule(sendSync);

    schedule.start();
    expect(sendSync).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(VJ_CLOCK_SYNC_BURST_SPACING_MS - 1);
    expect(sendSync).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(sendSync).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(BURST_LENGTH_MS - VJ_CLOCK_SYNC_BURST_SPACING_MS);
    expect(sendSync).toHaveBeenCalledTimes(VJ_CLOCK_SYNC_BURST_COUNT);

    vi.advanceTimersByTime(VJ_CLOCK_SYNC_INTERVAL_MS - 1);
    expect(sendSync).toHaveBeenCalledTimes(VJ_CLOCK_SYNC_BURST_COUNT);
    vi.advanceTimersByTime(1);
    expect(sendSync).toHaveBeenCalledTimes(VJ_CLOCK_SYNC_BURST_COUNT + 1);
    vi.advanceTimersByTime(VJ_CLOCK_SYNC_INTERVAL_MS);
    expect(sendSync).toHaveBeenCalledTimes(VJ_CLOCK_SYNC_BURST_COUNT + 2);
    schedule.stop();
  });

  it("start restarts the burst", () => {
    const sendSync = vi.fn();
    const schedule = createVjClockSyncSchedule(sendSync);
    schedule.start();
    vi.advanceTimersByTime(BURST_LENGTH_MS + VJ_CLOCK_SYNC_INTERVAL_MS);
    const sentBeforeRestart = sendSync.mock.calls.length;

    schedule.start();
    expect(sendSync).toHaveBeenCalledTimes(sentBeforeRestart + 1);
    vi.advanceTimersByTime(BURST_LENGTH_MS);
    expect(sendSync).toHaveBeenCalledTimes(
      sentBeforeRestart + VJ_CLOCK_SYNC_BURST_COUNT,
    );
    schedule.stop();
  });

  it("stop clears every timer", () => {
    const sendSync = vi.fn();
    const schedule = createVjClockSyncSchedule(sendSync);
    schedule.start();
    vi.advanceTimersByTime(VJ_CLOCK_SYNC_BURST_SPACING_MS);

    schedule.stop();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(10 * VJ_CLOCK_SYNC_INTERVAL_MS);
    expect(sendSync).toHaveBeenCalledTimes(2);
  });
});

describe("vjClockSampleOf", () => {
  it("vjClockSampleOf reads serverNow and ignores an ack without it", () => {
    expect(vjClockSampleOf(100, 140, { ok: true, serverNow: 5_000 })).toEqual({
      sentAt: 100,
      receivedAt: 140,
      serverNow: 5_000,
    });
    expect(
      vjClockSampleOf(100, 140, {
        ok: false,
        code: "vj_rate_limited",
        message: "Slow down",
        serverNow: 5_020,
      }),
    ).toEqual({ sentAt: 100, receivedAt: 140, serverNow: 5_020 });
    expect(vjClockSampleOf(100, 140, { ok: true })).toBeNull();
    expect(vjClockSampleOf(100, 140, { serverNow: "5000" })).toBeNull();
    expect(vjClockSampleOf(100, 140, { serverNow: Number.NaN })).toBeNull();
    expect(vjClockSampleOf(100, 140, null)).toBeNull();
    expect(vjClockSampleOf(100, 140, undefined)).toBeNull();
  });
});

describe("vjLocalNow", () => {
  it("reads performance.timeOrigin plus performance.now", () => {
    // Fake timers may replace performance; this test reads the real one.
    vi.useRealTimers();
    vi.spyOn(performance, "now").mockReturnValue(250.5);

    expect(vjLocalNow()).toBe(performance.timeOrigin + 250.5);
    vi.restoreAllMocks();
  });
});
