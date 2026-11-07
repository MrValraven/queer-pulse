import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VJ_DRAG_THROTTLE_MS } from "../../vj.constants";
import { createVjSendGate, createVjTrailingSender } from "./vjThrottle";

describe("createVjSendGate", () => {
  it("the gate lets the first send through and blocks inside the interval", () => {
    const gate = createVjSendGate(VJ_DRAG_THROTTLE_MS);
    expect(gate.shouldSend(1_000)).toBe(true);
    gate.markSent(1_000);
    expect(gate.shouldSend(1_049)).toBe(false);
    expect(gate.shouldSend(1_050)).toBe(true);
    gate.reset();
    expect(gate.shouldSend(1_001)).toBe(true);
  });
});

describe("createVjTrailingSender", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createSender(): {
    sentValues: number[];
    sender: ReturnType<typeof createVjTrailingSender<number>>;
  } {
    const sentValues: number[] = [];
    const sender = createVjTrailingSender<number>({
      intervalMs: VJ_DRAG_THROTTLE_MS,
      send: (value) => sentValues.push(value),
    });
    return { sentValues, sender };
  }

  it("the trailing sender sends the first value at once", () => {
    const { sentValues, sender } = createSender();
    sender.push(0.2, 0);
    expect(sentValues).toEqual([0.2]);
  });

  it("sends at most one value per 50 ms while values stream", () => {
    vi.setSystemTime(0);
    const sentAtTimes: number[] = [];
    const sentValues: number[] = [];
    const sender = createVjTrailingSender<number>({
      intervalMs: VJ_DRAG_THROTTLE_MS,
      send: (value) => {
        sentValues.push(value);
        sentAtTimes.push(Date.now());
      },
    });
    // A drag sending a value every 10 ms for 200 ms.
    for (let elapsedMs = 0; elapsedMs <= 200; elapsedMs += 10) {
      sender.push(elapsedMs, elapsedMs);
      vi.advanceTimersByTime(10);
    }
    vi.advanceTimersByTime(VJ_DRAG_THROTTLE_MS);
    expect(sentAtTimes).toEqual([0, 50, 100, 150, 200, 250]);
    expect(sentValues).toEqual([0, 40, 90, 140, 190, 200]);
    sentAtTimes.slice(1).forEach((sentAt, sendIndex) => {
      const previousSentAt = sentAtTimes[sendIndex] ?? 0;
      expect(sentAt - previousSentAt).toBeGreaterThanOrEqual(
        VJ_DRAG_THROTTLE_MS,
      );
    });
  });

  it("always sends the final value after the stream stops", () => {
    const { sentValues, sender } = createSender();
    sender.push(0.1, 0);
    sender.push(0.4, 10);
    sender.push(0.7, 20);
    expect(sentValues).toEqual([0.1]);
    // The timer started with the push at 10 ms and ends on the 50 ms boundary.
    vi.advanceTimersByTime(VJ_DRAG_THROTTLE_MS - 10 - 1);
    expect(sentValues).toEqual([0.1]);
    vi.advanceTimersByTime(1);
    expect(sentValues).toEqual([0.1, 0.7]);
  });

  it("flushNow sends the waiting value at once", () => {
    const { sentValues, sender } = createSender();
    sender.push(0.1, 0);
    sender.push(0.9, 15);
    sender.flushNow();
    expect(sentValues).toEqual([0.1, 0.9]);
    vi.advanceTimersByTime(VJ_DRAG_THROTTLE_MS * 2);
    expect(sentValues).toEqual([0.1, 0.9]);
  });

  it("cancel drops the pending value", () => {
    const { sentValues, sender } = createSender();
    sender.push(0.1, 0);
    sender.push(0.5, 20);
    sender.cancel();
    vi.advanceTimersByTime(VJ_DRAG_THROTTLE_MS * 2);
    expect(sentValues).toEqual([0.1]);
    sender.push(0.3, 25);
    expect(sentValues).toEqual([0.1, 0.3]);
  });

  it("uses the injected timer functions", () => {
    const scheduled: Array<() => void> = [];
    const setTimer = vi.fn((callback: () => void) => {
      scheduled.push(callback);
      return scheduled.length;
    }) as unknown as typeof setTimeout;
    const clearTimer = vi.fn() as unknown as typeof clearTimeout;
    const sentValues: number[] = [];
    const sender = createVjTrailingSender<number>({
      intervalMs: VJ_DRAG_THROTTLE_MS,
      send: (value) => sentValues.push(value),
      setTimer,
      clearTimer,
    });
    sender.push(1, 0);
    sender.push(2, 30);
    expect(setTimer).toHaveBeenCalledWith(expect.any(Function), 20);
    scheduled[0]?.();
    expect(sentValues).toEqual([1, 2]);
  });
});
