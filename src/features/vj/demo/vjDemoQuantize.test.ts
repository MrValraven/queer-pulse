import { describe, expect, it } from "vitest";
import {
  VJ_LIMITS,
  canonicalVjStageState,
  createVjSetlistPlayback,
  createVjStageState,
  vjBeatPositionAt,
  type VjQuantize,
  type VjSetlistPlayback,
  type VjStageState,
} from "../../../shared/contracts/vj";
import {
  NO_VJ_DEMO_STAMPS,
  withVjLiveClip,
  type VjDemoStamps,
} from "./vjDemoCommandKit";
import {
  isVjDemoTimerOrLibraryCause,
  settleVjDemoChange,
  vjDemoAttachApplyAt,
  type VjDemoSettleInput,
} from "./vjDemoQuantize";

const STAGE_EPOCH = "33333333-3333-4333-8333-333333333333";
const CLIP_GRID = "00000000-0000-4000-8000-0000000000c1";
const CLIP_HAZE = "00000000-0000-4000-8000-0000000000c2";
const SCREEN_A = "22222222-2222-4222-8222-22222222222a";
const SCREEN_B = "22222222-2222-4222-8222-22222222222b";

/** 120 bpm from downbeat 0: a beat every 500 ms, a bar every 2000 ms. */
const NOW = 10_000;

function stageWithQuantize(quantize: VjQuantize): VjStageState {
  const state = createVjStageState(STAGE_EPOCH, 0);
  return {
    ...state,
    revision: 4,
    tempo: { bpm: 120, downbeatAt: 0, quantize, source: "manual" },
  };
}

function settle(
  previous: VjStageState,
  next: VjStageState,
  overrides: Partial<VjDemoSettleInput> = {},
) {
  return settleVjDemoChange({
    previous,
    next,
    stamps: NO_VJ_DEMO_STAMPS,
    now: NOW,
    pendingApplyAt: null,
    isLookSwitch: false,
    isImmediate: false,
    cause: "command",
    knownScreenIds: new Set<string>(),
    ...overrides,
  });
}

function clipStamps(): VjDemoStamps {
  return { ...NO_VJ_DEMO_STAMPS, isLiveSourceSet: true };
}

describe("settleVjDemoChange", () => {
  it("quantize off applies at once", () => {
    const previous = stageWithQuantize("off");
    const result = settle(previous, withVjLiveClip(previous, CLIP_GRID), {
      stamps: clipStamps(),
    });
    expect(result.applyAt).toBeNull();
    expect(result.pendingApplyAt).toBeNull();
    expect(result.state.liveSince).toBe(NOW);
  });

  it("a clip change lands on the next beat at least 150 ms ahead", () => {
    const previous = stageWithQuantize("beat");
    const onTheBeat = settle(previous, withVjLiveClip(previous, CLIP_GRID));
    expect(onTheBeat.applyAt).toBe(10_500);
    expect(onTheBeat.pendingApplyAt).toBe(10_500);
    const lateInTheBeat = settle(
      previous,
      withVjLiveClip(previous, CLIP_GRID),
      { now: 10_400 },
    );
    expect(lateInTheBeat.applyAt).toBe(11_000);
    expect((lateInTheBeat.applyAt ?? 0) - 10_400).toBeGreaterThanOrEqual(
      VJ_LIMITS.quantizeMinLeadMs,
    );
  });

  it("bar quantize lands on the next 1", () => {
    const previous = stageWithQuantize("bar");
    const result = settle(previous, withVjLiveClip(previous, CLIP_GRID));
    expect(result.applyAt).toBe(12_000);
    expect(vjBeatPositionAt(previous.tempo, 12_000).beatInBar).toBe(0);
  });

  it("a scene recall lands on the grid even when the source stays", () => {
    const previous = stageWithQuantize("beat");
    const next: VjStageState = {
      ...previous,
      effects: { ...previous.effects, speed: 2 },
    };
    expect(settle(previous, next).applyAt).toBeNull();
    expect(settle(previous, next, { isLookSwitch: true }).applyAt).toBe(10_500);
  });

  it("an effect change while a clip waits takes the pending applyAt", () => {
    const previous = stageWithQuantize("beat");
    const next: VjStageState = {
      ...previous,
      effects: { ...previous.effects, speed: 2 },
    };
    const result = settle(previous, next, {
      now: 10_100,
      pendingApplyAt: 10_500,
    });
    expect(result.applyAt).toBe(10_500);
    expect(result.pendingApplyAt).toBe(10_500);
    const pastPending = settle(previous, next, {
      now: 10_600,
      pendingApplyAt: 10_500,
    });
    expect(pastPending.applyAt).toBeNull();
  });

  it("an immediate command lands at once and clears pending", () => {
    const previous = stageWithQuantize("bar");
    const next = {
      ...previous,
      effects: { ...previous.effects, isBlackout: true },
    };
    const result = settle(previous, next, {
      pendingApplyAt: 12_000,
      isImmediate: true,
    });
    expect(result.applyAt).toBeNull();
    expect(result.pendingApplyAt).toBeNull();
    expect(result.state.effects.isBlackout).toBe(true);
  });

  it("a timer change takes the pending applyAt", () => {
    const previous = withVjLiveClip(stageWithQuantize("beat"), CLIP_GRID);
    const clearedByLibrary = withVjLiveClip(previous, null);
    for (const cause of [
      "overlay_timeout",
      "countdown_end",
      "mic_tempo",
      "library",
    ] as const) {
      const withPending = settle(previous, clearedByLibrary, {
        cause,
        pendingApplyAt: 10_500,
      });
      expect(withPending.applyAt).toBe(10_500);
      const withoutPending = settle(previous, clearedByLibrary, { cause });
      expect(withoutPending.applyAt).toBeNull();
      expect(withoutPending.state.liveSince).toBeNull();
    }
  });

  it("only command, shuffle and setlist causes compute a grid time", () => {
    expect(isVjDemoTimerOrLibraryCause("command")).toBe(false);
    expect(isVjDemoTimerOrLibraryCause("shuffle")).toBe(false);
    expect(isVjDemoTimerOrLibraryCause("setlist")).toBe(false);
    for (const cause of [
      "strobe_timeout",
      "overlay_timeout",
      "countdown_end",
      "mic_tempo",
      "library",
    ] as const) {
      expect(isVjDemoTimerOrLibraryCause(cause)).toBe(true);
    }
  });

  it("liveSince, strobeStartedAt and hideAt stamp at applyAt", () => {
    const previous = stageWithQuantize("beat");
    const next: VjStageState = {
      ...withVjLiveClip(previous, CLIP_GRID),
      effects: { ...previous.effects, isStrobing: true },
      overlay: { ...previous.overlay, text: "Hello", isVisible: true },
    };
    const result = settle(previous, next, {
      stamps: {
        isLiveSourceSet: true,
        isStrobeStarted: true,
        overlayHideAfterMs: 5000,
      },
    });
    expect(result.applyAt).toBe(10_500);
    expect(result.state.liveSince).toBe(10_500);
    expect(result.state.effects.strobeStartedAt).toBe(10_500);
    expect(result.state.overlay.hideAt).toBe(15_500);
  });

  it("a strobe already on keeps its start and an absent hideAfterMs keeps hideAt", () => {
    const base = stageWithQuantize("off");
    const previous: VjStageState = {
      ...base,
      effects: { ...base.effects, isStrobing: true, strobeStartedAt: 9_000 },
      overlay: {
        ...base.overlay,
        text: "Hello",
        isVisible: true,
        hideAt: 20_000,
      },
    };
    const next: VjStageState = {
      ...previous,
      effects: { ...previous.effects, speed: 2 },
    };
    const kept = settle(previous, next);
    expect(kept.state.effects.strobeStartedAt).toBe(9_000);
    expect(kept.state.overlay.hideAt).toBe(20_000);
    const cleared = settle(previous, next, {
      stamps: { ...NO_VJ_DEMO_STAMPS, overlayHideAfterMs: null },
    });
    expect(cleared.state.overlay.hideAt).toBeNull();
  });

  it("an override for a pruned screen is dropped", () => {
    const base = stageWithQuantize("beat");
    const previous: VjStageState = {
      ...base,
      screenOverrides: {
        [SCREEN_A]: {
          clipId: CLIP_GRID,
          generatorId: null,
          generatorVariant: null,
        },
        [SCREEN_B]: {
          clipId: CLIP_HAZE,
          generatorId: null,
          generatorVariant: null,
        },
      },
    };
    const next: VjStageState = {
      ...previous,
      effects: { ...previous.effects, speed: 2 },
    };
    const result = settle(previous, next, {
      knownScreenIds: new Set([SCREEN_A]),
    });
    expect(Object.keys(result.state.screenOverrides)).toEqual([SCREEN_A]);
    expect(result.applyAt).toBeNull();
  });

  it("the result is canonical", () => {
    const previous = stageWithQuantize("off");
    const next: VjStageState = {
      ...withVjLiveClip(previous, CLIP_GRID.toUpperCase()),
      shuffle: {
        ...previous.shuffle,
        excludedClipIds: [CLIP_HAZE.toUpperCase(), CLIP_GRID, CLIP_HAZE],
      },
    };
    const result = settle(previous, next);
    expect(result.state).toEqual(canonicalVjStageState(result.state));
    expect(result.state.liveClipId).toBe(CLIP_GRID);
    expect(result.state.shuffle.excludedClipIds).toEqual([
      CLIP_GRID,
      CLIP_HAZE,
    ]);
    expect(result.state.revision).toBe(previous.revision + 1);
    expect(result.state.updatedAt).toBe(NOW);
  });
});

describe("settleVjDemoChange strobe cap", () => {
  it("a strobe timeout lands at once even with a quantized change pending", () => {
    const quantized = stageWithQuantize("bar");
    const previous = {
      ...quantized,
      tempo: { ...quantized.tempo, bpm: 60 },
      effects: { ...quantized.effects, isStrobing: true, strobeStartedAt: 0 },
    };
    const strobeOff = {
      ...previous,
      effects: {
        ...previous.effects,
        isStrobing: false,
        strobeStartedAt: null,
      },
    };
    const withPending = settle(previous, strobeOff, {
      cause: "strobe_timeout",
      pendingApplyAt: 12_000,
    });
    expect(withPending.applyAt).toBeNull();
    expect(withPending.pendingApplyAt).toBeNull();
    expect(withPending.state.effects.isStrobing).toBe(false);
    const withoutPending = settle(previous, strobeOff, {
      cause: "strobe_timeout",
    });
    expect(withoutPending.applyAt).toBeNull();
  });
});

describe("vjDemoAttachApplyAt", () => {
  it("the attach applyAt is the future pending one", () => {
    expect(vjDemoAttachApplyAt(10_500, NOW)).toBe(10_500);
    expect(vjDemoAttachApplyAt(NOW, NOW)).toBeNull();
    expect(vjDemoAttachApplyAt(9_000, NOW)).toBeNull();
    expect(vjDemoAttachApplyAt(null, NOW)).toBeNull();
  });
});

describe("settleVjDemoChange set list clock (sequences contract 3.5, 5.7)", () => {
  const SETLIST_ID = "55555555-5555-4555-8555-5555555555b1";

  function withPlayback(
    state: VjStageState,
    playback: Partial<VjSetlistPlayback>,
  ): VjStageState {
    return {
      ...state,
      activeSetlistId: SETLIST_ID,
      setlistIndex: 0,
      setlistPlayback: { ...createVjSetlistPlayback(false), ...playback },
    };
  }

  it("a start stamps the clock from applyAt: a look switch on the beat grid", () => {
    const previous = stageWithQuantize("beat");
    const next = withPlayback(withVjLiveClip(previous, CLIP_GRID), {
      status: "playing",
      stepDurationMs: 8_000,
    });
    const result = settle(previous, next, {
      stamps: clipStamps(),
      isLookSwitch: true,
      setlistClock: { kind: "start", durationMs: 8_000, remainingMs: 8_000 },
    });
    expect(result.applyAt).toBe(10_500);
    expect(result.state.setlistPlayback).toMatchObject({
      stepStartedAt: 10_500,
      stepEndsAt: 18_500,
      stepDurationMs: 8_000,
      pausedRemainingMs: null,
    });
  });

  it("a start with less time left than the full length keeps both numbers apart (Resume)", () => {
    const previous = stageWithQuantize("off");
    const next = withPlayback(previous, {
      status: "playing",
      stepDurationMs: 8_000,
    });
    const result = settle(previous, next, {
      setlistClock: { kind: "start", durationMs: 8_000, remainingMs: 3_000 },
    });
    expect(result.applyAt).toBeNull();
    expect(result.state.setlistPlayback).toMatchObject({
      stepStartedAt: NOW + 3_000 - 8_000,
      stepEndsAt: NOW + 3_000,
      stepDurationMs: 8_000,
    });
  });

  it("clear empties both times and keep leaves them as given", () => {
    const previous = stageWithQuantize("off");
    const running = withPlayback(previous, {
      status: "playing",
      stepStartedAt: 2_000,
      stepEndsAt: 10_000,
      stepDurationMs: 8_000,
    });
    const cleared = settle(previous, running, {
      setlistClock: { kind: "clear" },
    });
    expect(cleared.state.setlistPlayback).toMatchObject({
      stepStartedAt: null,
      stepEndsAt: null,
      stepDurationMs: 8_000,
    });
    const kept = settle(previous, running, { setlistClock: { kind: "keep" } });
    expect(kept.state.setlistPlayback).toEqual(running.setlistPlayback);
    const absent = settle(previous, running);
    expect(absent.state.setlistPlayback).toEqual(running.setlistPlayback);
  });

  it("a timer advance with quantize off lands at its step end, or at once once it passed", () => {
    const previous = stageWithQuantize("off");
    const next = withVjLiveClip(previous, CLIP_GRID);
    expect(
      settle(previous, next, { cause: "setlist", scheduledAt: NOW + 300 })
        .applyAt,
    ).toBe(NOW + 300);
    expect(
      settle(previous, next, { cause: "setlist", scheduledAt: NOW - 50 })
        .applyAt,
    ).toBeNull();
  });

  it("a timer advance with quantize on lands on the first boundary at or after its step end, look switch or not", () => {
    const previous = stageWithQuantize("beat");
    const next = withVjLiveClip(previous, CLIP_GRID);
    expect(
      settle(previous, next, {
        cause: "setlist",
        scheduledAt: NOW + 300,
        isLookSwitch: false,
      }).applyAt,
    ).toBe(10_500);
    // A step end one ms past a boundary (rounded beats) still lands on it.
    expect(
      settle(previous, next, { cause: "setlist", scheduledAt: 11_001 }).applyAt,
    ).toBe(11_000);
    // The minimum lead from now wins over a step end already passed.
    expect(
      settle(previous, next, { cause: "setlist", scheduledAt: NOW - 400 })
        .applyAt,
    ).toBe(10_500);
  });

  it("a timer advance never lands before a pending change", () => {
    const previous = stageWithQuantize("off");
    const next = withVjLiveClip(previous, CLIP_GRID);
    expect(
      settle(previous, next, {
        cause: "setlist",
        scheduledAt: NOW + 300,
        pendingApplyAt: NOW + 2_000,
      }).applyAt,
    ).toBe(NOW + 2_000);
  });
});
