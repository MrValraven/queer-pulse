import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  VJ_LIMITS,
  createVjSetlistPlayback,
  createVjStageState,
  type VjSetlistPlayback,
  type VjStageState,
} from "../../../shared/contracts/vj";
import {
  createVjDemoStageTimers,
  createVjDemoTimer,
  vjDemoTimerTargetsOf,
  type VjDemoTimerEventKind,
} from "./vjDemoTimers";

const START_MS = 1_000_000;
const STAGE_EPOCH = "6f1c1d5e-7a1b-4c11-9d8e-0a1b2c3d4e5f";

function baseState(): VjStageState {
  return createVjStageState(STAGE_EPOCH, START_MS);
}

function strobingState(strobeStartedAt: number | null): VjStageState {
  const state = baseState();
  return {
    ...state,
    effects: { ...state.effects, isStrobing: true, strobeStartedAt },
  };
}

function overlayState(isVisible: boolean, hideAt: number | null) {
  const state = baseState();
  return {
    ...state,
    overlay: { ...state.overlay, text: "Hello", isVisible, hideAt },
  };
}

function setlistState(playback: Partial<VjSetlistPlayback>): VjStageState {
  return {
    ...baseState(),
    activeSetlistId: "55555555-5555-4555-8555-5555555555b1",
    setlistIndex: 0,
    setlistPlayback: { ...createVjSetlistPlayback(false), ...playback },
  };
}

function playingUntil(stepEndsAt: number): VjStageState {
  return setlistState({
    status: "playing",
    stepStartedAt: stepEndsAt - 8_000,
    stepEndsAt,
    stepDurationMs: 8_000,
  });
}

function countdownState(isVisible: boolean, targetAt: number | null) {
  const state = baseState();
  return {
    ...state,
    countdown: { ...state.countdown, isVisible, targetAt },
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(START_MS);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("createVjDemoTimer", () => {
  it("fires at the server time", () => {
    const onFire = vi.fn();
    const timer = createVjDemoTimer(() => Date.now(), onFire);

    timer.arm(START_MS + 5_000);
    vi.advanceTimersByTime(4_999);
    expect(onFire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(onFire).toHaveBeenCalledTimes(1);
    expect(timer.target()).toBeNull();
  });

  it("fires at once for a time already past", () => {
    const onFire = vi.fn();
    const timer = createVjDemoTimer(() => Date.now(), onFire);

    timer.arm(START_MS - 2_000);
    vi.advanceTimersByTime(0);

    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it("re-arming at the same time keeps one timer", () => {
    const onFire = vi.fn();
    const timer = createVjDemoTimer(() => Date.now(), onFire);

    timer.arm(START_MS + 1_000);
    vi.advanceTimersByTime(600);
    timer.arm(START_MS + 1_000);
    timer.arm(START_MS + 1_000);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(400);

    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it("re-arming at a new time replaces the old timer", () => {
    const onFire = vi.fn();
    const timer = createVjDemoTimer(() => Date.now(), onFire);

    timer.arm(START_MS + 1_000);
    timer.arm(START_MS + 3_000);
    vi.advanceTimersByTime(1_000);
    expect(onFire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2_000);

    expect(onFire).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("null clears", () => {
    const onFire = vi.fn();
    const timer = createVjDemoTimer(() => Date.now(), onFire);

    timer.arm(START_MS + 1_000);
    timer.arm(null);
    vi.advanceTimersByTime(5_000);

    expect(onFire).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    expect(timer.target()).toBeNull();
  });

  it("a fire before its target re-arms for the rest", () => {
    const onFire = vi.fn();
    let serverClockShiftMs = 0;
    const timer = createVjDemoTimer(
      () => Date.now() + serverClockShiftMs,
      onFire,
    );

    timer.arm(START_MS + 1_000);
    serverClockShiftMs = -500;
    vi.advanceTimersByTime(1_000);
    expect(onFire).not.toHaveBeenCalled();
    expect(timer.target()).toBe(START_MS + 1_000);
    vi.advanceTimersByTime(500);

    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it("a wait past the setTimeout maximum re-arms until its time", () => {
    const onFire = vi.fn();
    const timer = createVjDemoTimer(() => Date.now(), onFire);
    const farAway = 2_147_483_647 + 10_000;

    timer.arm(START_MS + farAway);
    vi.advanceTimersByTime(2_147_483_647);
    expect(onFire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10_000);

    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it("never arms again for the target it last fired for; null forgets it", () => {
    const onFire = vi.fn();
    const timer = createVjDemoTimer(() => Date.now(), onFire);

    timer.arm(START_MS + 1_000);
    vi.advanceTimersByTime(1_000);
    timer.arm(START_MS + 1_000);
    expect(timer.target()).toBeNull();
    vi.advanceTimersByTime(5_000);
    expect(onFire).toHaveBeenCalledTimes(1);

    timer.arm(null);
    timer.arm(START_MS + 1_000);
    vi.advanceTimersByTime(0);
    expect(onFire).toHaveBeenCalledTimes(2);
  });

  it("a retry fires later for the fired target and survives a sync with that target", () => {
    const onFire = vi.fn();
    const timer = createVjDemoTimer(() => Date.now(), onFire);

    timer.arm(START_MS + 1_000);
    vi.advanceTimersByTime(1_000);
    timer.retry(START_MS + 2_000);
    timer.arm(START_MS + 1_000);
    expect(timer.target()).toBe(START_MS + 2_000);
    vi.advanceTimersByTime(999);
    expect(onFire).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(onFire).toHaveBeenCalledTimes(2);
    timer.arm(START_MS + 1_000);
    expect(timer.target()).toBeNull();
  });

  it("a retry keeps a timer already armed, and a new target replaces a retry", () => {
    const onFire = vi.fn();
    const timer = createVjDemoTimer(() => Date.now(), onFire);

    timer.arm(START_MS + 5_000);
    timer.retry(START_MS + 1_000);
    expect(timer.target()).toBe(START_MS + 5_000);
    timer.arm(START_MS + 5_000);
    vi.advanceTimersByTime(5_000);
    timer.retry(START_MS + 6_000);
    timer.arm(START_MS + 9_000);
    expect(timer.target()).toBe(START_MS + 9_000);
  });

  it("clear forgets the fired target", () => {
    const onFire = vi.fn();
    const timer = createVjDemoTimer(() => Date.now(), onFire);

    timer.arm(START_MS + 1_000);
    vi.advanceTimersByTime(1_000);
    timer.clear();
    timer.arm(START_MS + 1_000);
    vi.advanceTimersByTime(0);

    expect(onFire).toHaveBeenCalledTimes(2);
  });

  it("fireIfDue fires an overdue timer at once and leaves a future one armed", () => {
    const onFire = vi.fn();
    let serverClockShiftMs = 0;
    const timer = createVjDemoTimer(
      () => Date.now() + serverClockShiftMs,
      onFire,
    );

    timer.arm(START_MS + 1_000);
    timer.fireIfDue();
    expect(onFire).not.toHaveBeenCalled();
    serverClockShiftMs = 2_000;
    timer.fireIfDue();

    expect(onFire).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("vjDemoTimerTargetsOf", () => {
  it("targets read the strobe start plus 10 s, hideAt, and the countdown target plus 10 s only while visible", () => {
    expect(vjDemoTimerTargetsOf(baseState())).toEqual({
      strobeEndsAt: null,
      overlayHidesAt: null,
      countdownEndsAt: null,
      setlistAdvancesAt: null,
    });
    expect(vjDemoTimerTargetsOf(strobingState(START_MS)).strobeEndsAt).toBe(
      START_MS + VJ_LIMITS.strobeMaxDurationMs,
    );
    expect(
      vjDemoTimerTargetsOf(overlayState(true, START_MS + 4_000)).overlayHidesAt,
    ).toBe(START_MS + 4_000);
    expect(
      vjDemoTimerTargetsOf(overlayState(false, START_MS + 4_000))
        .overlayHidesAt,
    ).toBeNull();
    expect(
      vjDemoTimerTargetsOf(overlayState(true, null)).overlayHidesAt,
    ).toBeNull();
    expect(
      vjDemoTimerTargetsOf(countdownState(true, START_MS + 60_000))
        .countdownEndsAt,
    ).toBe(START_MS + 60_000 + VJ_LIMITS.countdownHoldMs);
    expect(
      vjDemoTimerTargetsOf(countdownState(false, START_MS + 60_000))
        .countdownEndsAt,
    ).toBeNull();
  });

  it("the step timer targets quantizedAdvanceEarlyMs before the step end, only while playing", () => {
    expect(
      vjDemoTimerTargetsOf(playingUntil(START_MS + 8_000)).setlistAdvancesAt,
    ).toBe(START_MS + 8_000 - VJ_LIMITS.quantizedAdvanceEarlyMs);
    for (const status of [
      "manual",
      "paused",
      "takenOver",
      "finished",
      "needsFlashConsent",
    ] as const) {
      expect(
        vjDemoTimerTargetsOf(setlistState({ status, stepDurationMs: 8_000 }))
          .setlistAdvancesAt,
      ).toBeNull();
    }
  });

  it("a strobe that is off has no target even with a stale stamp", () => {
    const state = strobingState(START_MS);
    const stopped = {
      ...state,
      effects: { ...state.effects, isStrobing: false },
    };

    expect(vjDemoTimerTargetsOf(stopped).strobeEndsAt).toBeNull();
  });
});

describe("createVjDemoStageTimers", () => {
  function recordFires() {
    const fired: VjDemoTimerEventKind[] = [];
    let serverClockShiftMs = 0;
    const timers = createVjDemoStageTimers(
      () => Date.now() + serverClockShiftMs,
      (kind) => fired.push(kind),
    );
    const shiftServerClock = (shiftMs: number) => {
      serverClockShiftMs = shiftMs;
    };
    return { fired, timers, shiftServerClock };
  }

  it("fires the strobe timeout 10 s after its stamp", () => {
    const { fired, timers } = recordFires();

    timers.sync(strobingState(START_MS));
    vi.advanceTimersByTime(VJ_LIMITS.strobeMaxDurationMs - 1);
    expect(fired).toEqual([]);
    vi.advanceTimersByTime(1);

    expect(fired).toEqual(["strobeTimeout"]);
  });

  it("a sync with the same targets keeps every timer", () => {
    const { fired, timers } = recordFires();

    timers.sync(strobingState(START_MS));
    vi.advanceTimersByTime(6_000);
    timers.sync(strobingState(START_MS));
    vi.advanceTimersByTime(4_000);

    expect(fired).toEqual(["strobeTimeout"]);
  });

  it("a sync without the field clears its timer", () => {
    const { fired, timers } = recordFires();

    timers.sync(overlayState(true, START_MS + 2_000));
    timers.sync(overlayState(false, null));
    vi.advanceTimersByTime(5_000);

    expect(fired).toEqual([]);
  });

  it("an unstamped strobe still ends 10 s after the first sync that saw it", () => {
    const { fired, timers } = recordFires();

    timers.sync(strobingState(null));
    vi.advanceTimersByTime(4_000);
    timers.sync(strobingState(null));
    vi.advanceTimersByTime(VJ_LIMITS.strobeMaxDurationMs - 4_000);

    expect(fired).toEqual(["strobeTimeout"]);
  });

  it("fireOverdue fires every passed target at once, earliest first", () => {
    const { fired, timers, shiftServerClock } = recordFires();
    const state = baseState();
    timers.sync({
      ...state,
      effects: {
        ...state.effects,
        isStrobing: true,
        strobeStartedAt: START_MS,
      },
      overlay: {
        ...state.overlay,
        text: "Hello",
        isVisible: true,
        hideAt: START_MS + 2_000,
      },
      countdown: { ...state.countdown, isVisible: true, targetAt: START_MS },
    });

    shiftServerClock(VJ_LIMITS.strobeMaxDurationMs);
    timers.fireOverdue();

    expect(fired).toEqual(["overlayTimeout", "strobeTimeout", "countdownEnd"]);
  });

  it("fires the step timer 300 ms before the step end, once per target", () => {
    const { fired, timers } = recordFires();
    const state = playingUntil(START_MS + 8_000);

    timers.sync(state);
    vi.advanceTimersByTime(8_000 - VJ_LIMITS.quantizedAdvanceEarlyMs - 1);
    expect(fired).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(fired).toEqual(["setlistTimer"]);
    // The state stays as it was until the advance lands; no second fire.
    timers.sync(state);
    vi.advanceTimersByTime(10_000);
    expect(fired).toEqual(["setlistTimer"]);
  });

  it("a passed step end fires the step timer at once (a restore advances once)", () => {
    const { fired, timers } = recordFires();

    timers.sync(playingUntil(START_MS - 5_000));
    vi.advanceTimersByTime(0);

    expect(fired).toEqual(["setlistTimer"]);
  });

  it("a retry fires the step timer again after setlistTimerRetryMs", () => {
    const { fired, timers } = recordFires();
    const state = playingUntil(START_MS + 1_000);

    timers.sync(state);
    vi.advanceTimersByTime(1_000);
    timers.sync(state);
    timers.retry("setlistTimer", Date.now() + VJ_LIMITS.setlistTimerRetryMs);
    timers.sync(state);
    vi.advanceTimersByTime(VJ_LIMITS.setlistTimerRetryMs - 1);
    expect(fired).toEqual(["setlistTimer"]);
    vi.advanceTimersByTime(1);

    expect(fired).toEqual(["setlistTimer", "setlistTimer"]);
  });

  it("Pause then Resume onto the same step end arms again", () => {
    const { fired, timers } = recordFires();
    const state = playingUntil(START_MS + 1_000);

    timers.sync(state);
    vi.advanceTimersByTime(1_000);
    timers.sync(setlistState({ status: "paused", stepDurationMs: 8_000 }));
    timers.sync(state);
    vi.advanceTimersByTime(0);

    expect(fired).toEqual(["setlistTimer", "setlistTimer"]);
  });

  it("clear stops every timer", () => {
    const { fired, timers } = recordFires();

    timers.sync(strobingState(START_MS));
    timers.sync(countdownState(true, START_MS + 1_000));
    timers.clear();
    vi.advanceTimersByTime(60_000);

    expect(fired).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });
});
