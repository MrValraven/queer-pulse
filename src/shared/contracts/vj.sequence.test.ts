import { describe, expect, it } from "vitest";
import { vjSceneLookFlashes } from "./vj.effects";
import { VJ_LIMITS } from "./vj.lists";
import {
  DEFAULT_VJ_STEP_DURATION,
  createVjSetlistPlayback,
  isVjStepDuration,
  restoredVjSetlistPlayback,
  stampVjSetlistClock,
  vjIsLiveSourceChange,
  vjResolvedStepDuration,
  vjSetlistAdvanceApplyAt,
  vjSetlistClearedState,
  vjSetlistFollowState,
  vjSetlistIndexPosition,
  vjSetlistLoopingState,
  vjSetlistSelectReadPosition,
  vjSetlistSelectTransition,
  vjSetlistSetPlayingReadPosition,
  vjSetlistSetPlayingTransition,
  vjSetlistStepFlashes,
  vjSetlistStepReadPosition,
  vjSetlistStepTransition,
  vjSetlistTakeoverState,
  vjSetlistTimerReadPosition,
  vjSetlistTimerTargetAt,
  vjSetlistTimerTransition,
  type VjSetlistRead,
  type VjSetlistStepRead,
  type VjSetlistTransition,
  type VjSetlistTransitionResult,
} from "./vj.sequence";
import { vjSceneLookOf } from "./vj.canonical";
import {
  createVjStageState,
  type VjSceneLook,
  type VjSetlistPlayback,
  type VjStageState,
  type VjStepDuration,
} from "./vj.state";

const SETLIST_ID = "5e7f8a9b-0c1d-4e2f-8a3b-4c5d6e7f8a9b";
const SCENE_ID = "7a1b2c3d-4e5f-4a6b-8c7d-8e9f0a1b2c3d";
const CLIP_ID = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const ITEM_A = "item-a";
const ITEM_B = "item-b";
const ITEM_C = "item-c";
const ITEM_D = "item-d";
const ITEM_X = "item-x";
const SECONDS_8: VjStepDuration = { kind: "seconds", value: 8 };
const BEATS_16: VjStepDuration = { kind: "beats", value: 16 };
/** 16 beats at the default 124 bpm. */
const BEATS_16_MS = 7742;
const NOW = 100_000;

function buildState(): VjStageState {
  return createVjStageState("0d9c8b7a-6f5e-4d3c-8b2a-190817263544", 1000);
}

/** A state with an active set list, an index and a playback patch. */
function buildStateOn(
  setlistIndex: number | null,
  playbackPatch: Partial<VjSetlistPlayback> = {},
): VjStageState {
  const state = buildState();
  return {
    ...state,
    activeSetlistId: SETLIST_ID,
    setlistIndex,
    setlistPlayback: { ...state.setlistPlayback, ...playbackPatch },
  };
}

function buildPlayingState(
  setlistIndex: number | null,
  playbackPatch: Partial<VjSetlistPlayback> = {},
): VjStageState {
  return buildStateOn(setlistIndex, {
    status: "playing",
    stepStartedAt: 1000,
    stepEndsAt: 9000,
    stepDurationMs: 8000,
    ...playbackPatch,
  });
}

function buildLook(): VjSceneLook {
  return vjSceneLookOf(buildState());
}

function buildFlashingLook(): VjSceneLook {
  const look = buildLook();
  return { ...look, transition: { ...look.transition, mode: "dipWhite" } };
}

function buildSceneStep(
  index: number,
  itemId: string,
  options: { look?: VjSceneLook; duration?: VjStepDuration } = {},
): VjSetlistStepRead {
  return {
    kind: "scene",
    itemId,
    index,
    sceneId: SCENE_ID,
    look: options.look ?? buildLook(),
    duration: options.duration ?? SECONDS_8,
  };
}

function buildClipStep(
  index: number,
  itemId: string,
  duration: VjStepDuration = SECONDS_8,
): VjSetlistStepRead {
  return { kind: "clip", itemId, index, clipId: CLIP_ID, duration };
}

function buildRead(
  step: VjSetlistStepRead | null,
  options: { itemIds?: string[]; isLooping?: boolean; setlistId?: string } = {},
): VjSetlistRead {
  return {
    setlistId: options.setlistId ?? SETLIST_ID,
    isLooping: options.isLooping ?? false,
    stepDuration: SECONDS_8,
    itemIds: options.itemIds ?? [ITEM_A, ITEM_B, ITEM_C],
    step,
  };
}

function acceptedOf(result: VjSetlistTransitionResult): VjSetlistTransition {
  if (result.transition === null) {
    throw new Error(`Expected an accepted transition, got ${result.code}`);
  }
  return result.transition;
}

describe("isVjStepDuration", () => {
  it("accepts seconds from 2 to 600 and every beat count", () => {
    expect(isVjStepDuration({ kind: "seconds", value: 2 })).toBe(true);
    expect(isVjStepDuration({ kind: "seconds", value: 600 })).toBe(true);
    for (const beats of [4, 8, 16, 32, 64]) {
      expect(isVjStepDuration({ kind: "beats", value: beats })).toBe(true);
    }
  });

  it("refuses seconds out of range or not whole", () => {
    expect(isVjStepDuration({ kind: "seconds", value: 1 })).toBe(false);
    expect(isVjStepDuration({ kind: "seconds", value: 601 })).toBe(false);
    expect(isVjStepDuration({ kind: "seconds", value: 2.5 })).toBe(false);
    expect(isVjStepDuration({ kind: "seconds", value: "8" })).toBe(false);
    expect(isVjStepDuration({ kind: "seconds", value: Number.NaN })).toBe(
      false,
    );
  });

  it("refuses a beat count outside the list", () => {
    expect(isVjStepDuration({ kind: "beats", value: 2 })).toBe(false);
    expect(isVjStepDuration({ kind: "beats", value: 12 })).toBe(false);
    expect(isVjStepDuration({ kind: "beats", value: 128 })).toBe(false);
  });

  it("refuses a wrong kind, extra keys, a missing key and a non-object", () => {
    expect(isVjStepDuration({ kind: "ms", value: 8 })).toBe(false);
    expect(isVjStepDuration({ kind: "seconds", value: 8, extra: 1 })).toBe(
      false,
    );
    expect(isVjStepDuration({ kind: "seconds" })).toBe(false);
    expect(isVjStepDuration({ value: 8 })).toBe(false);
    expect(isVjStepDuration(null)).toBe(false);
    expect(isVjStepDuration([])).toBe(false);
    expect(isVjStepDuration(8)).toBe(false);
    expect(isVjStepDuration(undefined)).toBe(false);
  });

  it("holds the sequence default at 8 seconds, frozen and valid", () => {
    expect(DEFAULT_VJ_STEP_DURATION).toEqual({ kind: "seconds", value: 8 });
    expect(Object.isFrozen(DEFAULT_VJ_STEP_DURATION)).toBe(true);
    expect(isVjStepDuration(DEFAULT_VJ_STEP_DURATION)).toBe(true);
  });
});

describe("vjResolvedStepDuration", () => {
  it("plays the step's own length, else the sequence default", () => {
    expect(vjResolvedStepDuration(BEATS_16, SECONDS_8)).toBe(BEATS_16);
    expect(vjResolvedStepDuration(null, SECONDS_8)).toBe(SECONDS_8);
  });
});

describe("createVjSetlistPlayback", () => {
  it("builds the manual default with the saved Loop", () => {
    expect(createVjSetlistPlayback(true)).toEqual({
      status: "manual",
      itemId: null,
      isFlashConfirmed: false,
      stepStartedAt: null,
      stepEndsAt: null,
      stepDurationMs: null,
      pausedRemainingMs: null,
      isLooping: true,
    });
  });
});

describe("vjSetlistIndexPosition", () => {
  it("reads an index below the item cap as given", () => {
    expect(vjSetlistIndexPosition(0, false)).toEqual({
      kind: "index",
      index: 0,
      wrapsToFirst: false,
    });
    expect(vjSetlistIndexPosition(99, true)).toEqual({
      kind: "index",
      index: 99,
      wrapsToFirst: true,
    });
  });

  it("reads step 0 past the cap when wrapping and the count otherwise", () => {
    expect(VJ_LIMITS.setlistItemsMax).toBe(100);
    expect(vjSetlistIndexPosition(100, true)).toEqual({
      kind: "index",
      index: 0,
      wrapsToFirst: false,
    });
    expect(vjSetlistIndexPosition(100, false)).toEqual({ kind: "count" });
    expect(vjSetlistIndexPosition(250, false)).toEqual({ kind: "count" });
  });
});

describe("flash helpers", () => {
  it("a look flashes through a flash-capable transition", () => {
    expect(vjSceneLookFlashes(buildLook())).toBe(false);
    expect(vjSceneLookFlashes(buildFlashingLook())).toBe(true);
  });

  it("a look flashes through a flash-capable effect that is on", () => {
    const look = buildLook();
    expect(
      vjSceneLookFlashes({
        ...look,
        effects: {
          ...look.effects,
          settings: { glitch: { isOn: true, amount: 0.5, variant: null } },
        },
      }),
    ).toBe(true);
    expect(
      vjSceneLookFlashes({
        ...look,
        effects: {
          ...look.effects,
          settings: { glitch: { isOn: false, amount: 0.5, variant: null } },
        },
      }),
    ).toBe(false);
    expect(
      vjSceneLookFlashes({
        ...look,
        effects: {
          ...look.effects,
          settings: { monochrome: { isOn: true, amount: 1, variant: null } },
        },
      }),
    ).toBe(false);
  });

  it("a scene step flashes with its look and a clip step never flashes", () => {
    expect(vjSetlistStepFlashes(buildSceneStep(0, ITEM_A))).toBe(false);
    expect(
      vjSetlistStepFlashes(
        buildSceneStep(0, ITEM_A, { look: buildFlashingLook() }),
      ),
    ).toBe(true);
    expect(vjSetlistStepFlashes(buildClipStep(0, ITEM_A))).toBe(false);
  });
});

describe("vjIsLiveSourceChange", () => {
  it("is true for each live source field and the pack", () => {
    const previous = buildState();
    expect(
      vjIsLiveSourceChange(previous, { ...previous, liveClipId: "c" }),
    ).toBe(true);
    expect(
      vjIsLiveSourceChange(previous, {
        ...previous,
        liveGeneratorId: "plasma",
      }),
    ).toBe(true);
    expect(
      vjIsLiveSourceChange(previous, {
        ...previous,
        liveGeneratorVariant: "soft",
      }),
    ).toBe(true);
    expect(
      vjIsLiveSourceChange(previous, { ...previous, clipSequence: 1 }),
    ).toBe(true);
    expect(
      vjIsLiveSourceChange(previous, { ...previous, activePackId: "p" }),
    ).toBe(true);
  });

  it("is false for a change that moves nothing live", () => {
    const previous = buildState();
    expect(vjIsLiveSourceChange(previous, { ...previous, revision: 5 })).toBe(
      false,
    );
  });
});

describe("vjSetlistSelectReadPosition", () => {
  it("covers every case of the table", () => {
    expect(vjSetlistSelectReadPosition(null, false)).toEqual({ kind: "count" });
    expect(vjSetlistSelectReadPosition(null, true)).toEqual({
      kind: "index",
      index: 0,
      wrapsToFirst: false,
    });
    expect(vjSetlistSelectReadPosition(3, false)).toEqual({
      kind: "index",
      index: 3,
      wrapsToFirst: false,
    });
    expect(vjSetlistSelectReadPosition(3, true)).toEqual({
      kind: "index",
      index: 3,
      wrapsToFirst: false,
    });
    expect(vjSetlistSelectReadPosition(100, false)).toEqual({ kind: "count" });
  });
});

describe("vjSetlistClearedState", () => {
  it("drops the active set list, the index and the playback", () => {
    const cleared = vjSetlistClearedState(
      buildPlayingState(2, { itemId: ITEM_C, isLooping: true }),
    );
    expect(cleared.activeSetlistId).toBeNull();
    expect(cleared.setlistIndex).toBeNull();
    expect(cleared.setlistPlayback).toEqual(createVjSetlistPlayback(false));
  });
});

const baseInput = {
  setlistId: SETLIST_ID,
  index: 0,
  isPlaying: false,
  isFlashConfirmed: false,
};

describe("vjSetlistSelectTransition", () => {
  it("a null set list id answers the cleared state, no show, clock clear", () => {
    const transition = acceptedOf(
      vjSetlistSelectTransition(buildPlayingState(1), {
        ...baseInput,
        setlistId: null,
        index: null,
        read: null,
      }),
    );
    expect(transition.nextState.activeSetlistId).toBeNull();
    expect(transition.nextState.setlistPlayback).toEqual(
      createVjSetlistPlayback(false),
    );
    expect(transition.show).toBeNull();
    expect(transition.clock).toEqual({ kind: "clear" });
  });

  it("a missing read answers vj_setlist_not_found", () => {
    expect(
      vjSetlistSelectTransition(buildState(), { ...baseInput, read: null }),
    ).toEqual({ code: "vj_setlist_not_found", transition: null });
  });

  it("index null and not playing arms the set list with its saved Loop", () => {
    const transition = acceptedOf(
      vjSetlistSelectTransition(buildPlayingState(2), {
        ...baseInput,
        index: null,
        read: buildRead(null, { isLooping: true }),
      }),
    );
    expect(transition.nextState.activeSetlistId).toBe(SETLIST_ID);
    expect(transition.nextState.setlistIndex).toBeNull();
    expect(transition.nextState.setlistPlayback).toEqual(
      createVjSetlistPlayback(true),
    );
    expect(transition.show).toBeNull();
    expect(transition.clock).toEqual({ kind: "clear" });
  });

  it("arms an empty set list too", () => {
    const transition = acceptedOf(
      vjSetlistSelectTransition(buildState(), {
        ...baseInput,
        index: null,
        read: buildRead(null, { itemIds: [] }),
      }),
    );
    expect(transition.nextState.activeSetlistId).toBe(SETLIST_ID);
  });

  it("an empty set list answers vj_setlist_empty for an index and for play", () => {
    const read = buildRead(null, { itemIds: [] });
    expect(
      vjSetlistSelectTransition(buildState(), { ...baseInput, read }).code,
    ).toBe("vj_setlist_empty");
    expect(
      vjSetlistSelectTransition(buildState(), {
        ...baseInput,
        index: null,
        isPlaying: true,
        read,
      }).code,
    ).toBe("vj_setlist_empty");
  });

  it("a read with no step answers vj_setlist_index_invalid", () => {
    expect(
      vjSetlistSelectTransition(buildState(), {
        ...baseInput,
        index: 9,
        read: buildRead(null),
      }).code,
    ).toBe("vj_setlist_index_invalid");
  });

  it("play of a flashing step without confirmation answers vj_setlist_flash_unconfirmed", () => {
    const read = buildRead(
      buildSceneStep(0, ITEM_A, { look: buildFlashingLook() }),
    );
    expect(
      vjSetlistSelectTransition(buildState(), {
        ...baseInput,
        isPlaying: true,
        read,
      }),
    ).toEqual({ code: "vj_setlist_flash_unconfirmed", transition: null });
  });

  it("play of a flashing step passes with the payload's confirmation and stores it for the new run", () => {
    const read = buildRead(
      buildSceneStep(0, ITEM_A, { look: buildFlashingLook() }),
    );
    const transition = acceptedOf(
      vjSetlistSelectTransition(buildState(), {
        ...baseInput,
        isPlaying: true,
        isFlashConfirmed: true,
        read,
      }),
    );
    expect(transition.nextState.setlistPlayback.isFlashConfirmed).toBe(true);
  });

  it("the flash check counts only the payload: a flag the previous run stored never counts", () => {
    const read = buildRead(
      buildSceneStep(0, ITEM_A, { look: buildFlashingLook() }),
    );
    for (const status of ["playing", "paused", "manual", "finished"] as const) {
      expect(
        vjSetlistSelectTransition(
          buildStateOn(1, { status, isFlashConfirmed: true }),
          { ...baseInput, isPlaying: true, isFlashConfirmed: false, read },
        ),
      ).toEqual({ code: "vj_setlist_flash_unconfirmed", transition: null });
    }
  });

  it("not playing shows the step as manual with the payload's confirmation and a cleared clock", () => {
    const look = buildFlashingLook();
    const transition = acceptedOf(
      vjSetlistSelectTransition(
        buildPlayingState(2, { stepDurationMs: 9999, pausedRemainingMs: null }),
        {
          ...baseInput,
          index: 1,
          isFlashConfirmed: false,
          read: buildRead(buildSceneStep(1, ITEM_B, { look }), {
            isLooping: true,
          }),
        },
      ),
    );
    expect(transition.show).toEqual({ kind: "scene", look });
    expect(transition.clock).toEqual({ kind: "clear" });
    expect(transition.nextState.setlistIndex).toBe(1);
    expect(transition.nextState.activeSetlistId).toBe(SETLIST_ID);
    expect(transition.nextState.setlistPlayback).toEqual({
      ...createVjSetlistPlayback(true),
      status: "manual",
      itemId: ITEM_B,
      isFlashConfirmed: false,
      stepDurationMs: null,
    });
  });

  it("not playing shows a clip step", () => {
    const transition = acceptedOf(
      vjSetlistSelectTransition(buildState(), {
        ...baseInput,
        index: 1,
        isFlashConfirmed: true,
        read: buildRead(buildClipStep(1, ITEM_B)),
      }),
    );
    expect(transition.show).toEqual({ kind: "clip", clipId: CLIP_ID });
    expect(transition.nextState.setlistPlayback.isFlashConfirmed).toBe(true);
  });
});

describe("vjSetlistSelectTransition playing", () => {
  it("playing starts a fresh run from the step with shuffle off and the full length", () => {
    const state = buildStateOn(2, {
      status: "paused",
      stepDurationMs: 8000,
      pausedRemainingMs: 1000,
      isFlashConfirmed: true,
    });
    const transition = acceptedOf(
      vjSetlistSelectTransition(
        { ...state, shuffle: { ...state.shuffle, isOn: true } },
        {
          ...baseInput,
          index: 0,
          isPlaying: true,
          isFlashConfirmed: false,
          read: buildRead(buildClipStep(0, ITEM_A, BEATS_16)),
        },
      ),
    );
    expect(transition.show).toEqual({ kind: "clip", clipId: CLIP_ID });
    expect(transition.clock).toEqual({
      kind: "start",
      durationMs: BEATS_16_MS,
      remainingMs: BEATS_16_MS,
    });
    expect(transition.nextState.shuffle.isOn).toBe(false);
    expect(transition.nextState.setlistIndex).toBe(0);
    expect(transition.nextState.setlistPlayback).toEqual({
      ...createVjSetlistPlayback(false),
      status: "playing",
      itemId: ITEM_A,
      isFlashConfirmed: false,
      stepDurationMs: BEATS_16_MS,
      pausedRemainingMs: null,
    });
  });

  it("playing with an index of null plays the step the read found at 0", () => {
    const transition = acceptedOf(
      vjSetlistSelectTransition(buildState(), {
        ...baseInput,
        index: null,
        isPlaying: true,
        read: buildRead(buildSceneStep(0, ITEM_A)),
      }),
    );
    expect(transition.nextState.setlistIndex).toBe(0);
    expect(transition.nextState.setlistPlayback.status).toBe("playing");
  });
});

describe("vjSetlistSetPlayingReadPosition", () => {
  it("covers every row of the table", () => {
    expect(
      vjSetlistSetPlayingReadPosition(buildPlayingState(1), false),
    ).toBeNull();
    expect(
      vjSetlistSetPlayingReadPosition(buildPlayingState(1), true),
    ).toBeNull();
    expect(
      vjSetlistSetPlayingReadPosition(
        buildStateOn(1, { status: "paused" }),
        true,
      ),
    ).toBeNull();
    expect(vjSetlistSetPlayingReadPosition(buildStateOn(2), true)).toEqual({
      kind: "index",
      index: 2,
      wrapsToFirst: false,
    });
    expect(vjSetlistSetPlayingReadPosition(buildStateOn(null), true)).toEqual({
      kind: "index",
      index: 0,
      wrapsToFirst: false,
    });
    expect(
      vjSetlistSetPlayingReadPosition(
        buildStateOn(2, { status: "takenOver" }),
        true,
      ),
    ).toEqual({ kind: "index", index: 3, wrapsToFirst: true });
    expect(
      vjSetlistSetPlayingReadPosition(
        buildStateOn(null, { status: "takenOver" }),
        true,
      ),
    ).toEqual({ kind: "index", index: 0, wrapsToFirst: true });
    expect(
      vjSetlistSetPlayingReadPosition(
        buildStateOn(2, { status: "finished" }),
        true,
      ),
    ).toEqual({ kind: "index", index: 0, wrapsToFirst: false });
    expect(
      vjSetlistSetPlayingReadPosition(
        buildStateOn(2, { status: "needsFlashConsent", isLooping: false }),
        true,
      ),
    ).toEqual({ kind: "index", index: 3, wrapsToFirst: false });
    expect(
      vjSetlistSetPlayingReadPosition(
        buildStateOn(2, { status: "needsFlashConsent", isLooping: true }),
        true,
      ),
    ).toEqual({ kind: "index", index: 3, wrapsToFirst: true });
  });
});

function setPlaying(
  state: VjStageState,
  isPlaying: boolean,
  read: VjSetlistRead | null,
  isFlashConfirmed = false,
): VjSetlistTransitionResult {
  return vjSetlistSetPlayingTransition(state, {
    isPlaying,
    isFlashConfirmed,
    read,
    now: 4000,
  });
}

describe("vjSetlistSetPlayingTransition", () => {
  it("pause while playing keeps the time left and clears the clock", () => {
    const transition = acceptedOf(
      setPlaying(buildPlayingState(1, { itemId: ITEM_B }), false, null),
    );
    expect(transition.nextState.setlistPlayback.status).toBe("paused");
    expect(transition.nextState.setlistPlayback.pausedRemainingMs).toBe(5000);
    expect(transition.nextState.setlistPlayback.stepDurationMs).toBe(8000);
    expect(transition.nextState.setlistPlayback.itemId).toBe(ITEM_B);
    expect(transition.show).toBeNull();
    expect(transition.clock).toEqual({ kind: "clear" });
  });

  it("pause after the step end keeps no negative time", () => {
    const transition = acceptedOf(
      vjSetlistSetPlayingTransition(buildPlayingState(1), {
        isPlaying: false,
        isFlashConfirmed: false,
        read: null,
        now: 12_000,
      }),
    );
    expect(transition.nextState.setlistPlayback.pausedRemainingMs).toBe(0);
  });

  it("pause clamps the time left to the step length when the step is stamped at a future applyAt", () => {
    const transition = acceptedOf(
      vjSetlistSetPlayingTransition(
        buildPlayingState(1, { stepStartedAt: 6000, stepEndsAt: 14_000 }),
        {
          isPlaying: false,
          isFlashConfirmed: false,
          read: null,
          now: 4000,
        },
      ),
    );
    expect(transition.nextState.setlistPlayback.pausedRemainingMs).toBe(8000);
    const insideStep = acceptedOf(
      vjSetlistSetPlayingTransition(buildPlayingState(1), {
        isPlaying: false,
        isFlashConfirmed: false,
        read: null,
        now: 4000,
      }),
    );
    expect(insideStep.nextState.setlistPlayback.pausedRemainingMs).toBe(5000);
  });

  it("pause from any other status is a noop with the clock kept", () => {
    for (const status of [
      "manual",
      "paused",
      "takenOver",
      "finished",
      "needsFlashConsent",
    ] as const) {
      const state = buildStateOn(1, { status });
      const transition = acceptedOf(setPlaying(state, false, null));
      expect(transition.nextState).toBe(state);
      expect(transition.show).toBeNull();
      expect(transition.clock).toEqual({ kind: "keep" });
    }
  });

  it("play while playing changes nothing and keeps the clock", () => {
    const state = buildPlayingState(1);
    const transition = acceptedOf(setPlaying(state, true, null));
    expect(transition.nextState).toBe(state);
    expect(transition.clock).toEqual({ kind: "keep" });
  });

  it("resume from paused starts the clock at the time left of the full length with shuffle off", () => {
    const state = buildStateOn(1, {
      status: "paused",
      stepDurationMs: 8000,
      pausedRemainingMs: 3000,
    });
    const transition = acceptedOf(
      setPlaying(
        { ...state, shuffle: { ...state.shuffle, isOn: true } },
        true,
        null,
      ),
    );
    expect(transition.nextState.setlistPlayback.status).toBe("playing");
    expect(transition.nextState.shuffle.isOn).toBe(false);
    expect(transition.show).toBeNull();
    expect(transition.clock).toEqual({
      kind: "start",
      durationMs: 8000,
      remainingMs: 3000,
    });
  });

  it("resume without a stored full length falls back to the time left", () => {
    const transition = acceptedOf(
      setPlaying(
        buildStateOn(1, {
          status: "paused",
          stepDurationMs: null,
          pausedRemainingMs: 3000,
        }),
        true,
        null,
      ),
    );
    expect(transition.clock).toEqual({
      kind: "start",
      durationMs: 3000,
      remainingMs: 3000,
    });
  });

  it("play from manual with an index restarts the step in place without recall or flash check", () => {
    const state = buildStateOn(1, { itemId: ITEM_X });
    const transition = acceptedOf(
      setPlaying(
        { ...state, shuffle: { ...state.shuffle, isOn: true } },
        true,
        buildRead(
          buildSceneStep(1, ITEM_B, {
            look: buildFlashingLook(),
            duration: BEATS_16,
          }),
          { isLooping: true },
        ),
      ),
    );
    expect(transition.show).toBeNull();
    expect(transition.nextState.shuffle.isOn).toBe(false);
    expect(transition.nextState.setlistPlayback.status).toBe("playing");
    expect(transition.nextState.setlistPlayback.itemId).toBe(ITEM_X);
    expect(transition.nextState.setlistPlayback.isLooping).toBe(true);
    expect(transition.nextState.setlistIndex).toBe(1);
    expect(transition.clock).toEqual({
      kind: "start",
      durationMs: BEATS_16_MS,
      remainingMs: BEATS_16_MS,
    });
  });

  it("play from manual with an index refuses a missing, empty or ended read", () => {
    const state = buildStateOn(1);
    expect(setPlaying(state, true, null).code).toBe("vj_setlist_not_found");
    expect(setPlaying(state, true, buildRead(null, { itemIds: [] })).code).toBe(
      "vj_setlist_empty",
    );
    expect(setPlaying(state, true, buildRead(null)).code).toBe(
      "vj_setlist_index_invalid",
    );
  });

  it("play from manual with no index plays step 0 like finished, with the flash check", () => {
    const state = buildStateOn(null);
    const flashingRead = buildRead(
      buildSceneStep(0, ITEM_A, { look: buildFlashingLook() }),
    );
    expect(setPlaying(state, true, flashingRead).code).toBe(
      "vj_setlist_flash_unconfirmed",
    );
    const transition = acceptedOf(
      setPlaying(state, true, buildRead(buildClipStep(0, ITEM_A))),
    );
    expect(transition.show).toEqual({ kind: "clip", clipId: CLIP_ID });
    expect(transition.nextState.setlistIndex).toBe(0);
    expect(transition.nextState.setlistPlayback.itemId).toBe(ITEM_A);
    expect(transition.clock).toEqual({
      kind: "start",
      durationMs: 8000,
      remainingMs: 8000,
    });
  });
});

describe("vjSetlistSetPlayingTransition after a stop", () => {
  it("play from takenOver, finished and needsFlashConsent shows the step and plays from it", () => {
    for (const status of [
      "takenOver",
      "finished",
      "needsFlashConsent",
    ] as const) {
      const state = buildStateOn(2, { status, itemId: ITEM_C });
      const transition = acceptedOf(
        setPlaying(state, true, buildRead(buildClipStep(0, ITEM_A))),
      );
      expect(transition.show).toEqual({ kind: "clip", clipId: CLIP_ID });
      expect(transition.nextState.setlistIndex).toBe(0);
      expect(transition.nextState.setlistPlayback.status).toBe("playing");
      expect(transition.nextState.setlistPlayback.itemId).toBe(ITEM_A);
      expect(setPlaying(state, true, null).code).toBe("vj_setlist_not_found");
      expect(
        setPlaying(state, true, buildRead(null, { itemIds: [] })).code,
      ).toBe("vj_setlist_empty");
      expect(setPlaying(state, true, buildRead(null)).code).toBe(
        "vj_setlist_index_invalid",
      );
    }
  });

  it("a flashing step after needsFlashConsent needs the payload's confirmation, then stores it", () => {
    const state = buildStateOn(1, { status: "needsFlashConsent" });
    const read = buildRead(
      buildSceneStep(2, ITEM_C, { look: buildFlashingLook() }),
    );
    expect(setPlaying(state, true, read).code).toBe(
      "vj_setlist_flash_unconfirmed",
    );
    const transition = acceptedOf(setPlaying(state, true, read, true));
    expect(transition.nextState.setlistPlayback.isFlashConfirmed).toBe(true);
    expect(transition.nextState.setlistPlayback.status).toBe("playing");
  });

  it("a stored confirmation lets a flashing step play without the payload", () => {
    const state = buildStateOn(1, {
      status: "finished",
      isFlashConfirmed: true,
    });
    const read = buildRead(
      buildSceneStep(0, ITEM_A, { look: buildFlashingLook() }),
    );
    expect(setPlaying(state, true, read).code).toBeNull();
  });

  it("the payload's confirmation is stored on every accepted play", () => {
    const resumed = acceptedOf(
      setPlaying(
        buildStateOn(1, {
          status: "paused",
          stepDurationMs: 8000,
          pausedRemainingMs: 3000,
        }),
        true,
        null,
        true,
      ),
    );
    expect(resumed.nextState.setlistPlayback.isFlashConfirmed).toBe(true);
    const inPlace = acceptedOf(
      setPlaying(
        buildStateOn(1),
        true,
        buildRead(buildClipStep(1, ITEM_B)),
        true,
      ),
    );
    expect(inPlace.nextState.setlistPlayback.isFlashConfirmed).toBe(true);
  });
});

describe("vjSetlistStepReadPosition", () => {
  it("next reads the step after the index, wrapping only with Loop", () => {
    expect(vjSetlistStepReadPosition(buildStateOn(null), "next")).toEqual({
      kind: "index",
      index: 0,
      wrapsToFirst: false,
    });
    expect(
      vjSetlistStepReadPosition(buildStateOn(2, { isLooping: true }), "next"),
    ).toEqual({ kind: "index", index: 3, wrapsToFirst: true });
    expect(vjSetlistStepReadPosition(buildStateOn(99), "next")).toEqual({
      kind: "count",
    });
    expect(
      vjSetlistStepReadPosition(buildStateOn(99, { isLooping: true }), "next"),
    ).toEqual({ kind: "index", index: 0, wrapsToFirst: false });
  });

  it("previous at the start reads the last step with Loop and the count without", () => {
    expect(vjSetlistStepReadPosition(buildStateOn(0), "previous")).toEqual({
      kind: "count",
    });
    expect(vjSetlistStepReadPosition(buildStateOn(null), "previous")).toEqual({
      kind: "count",
    });
    expect(
      vjSetlistStepReadPosition(
        buildStateOn(0, { isLooping: true }),
        "previous",
      ),
    ).toEqual({ kind: "last" });
    expect(
      vjSetlistStepReadPosition(
        buildStateOn(null, { isLooping: true }),
        "previous",
      ),
    ).toEqual({ kind: "last" });
    expect(vjSetlistStepReadPosition(buildStateOn(3), "previous")).toEqual({
      kind: "index",
      index: 2,
      wrapsToFirst: false,
    });
  });
});

/** Every playback status a Next or Previous can start from. */
const VJ_STEP_TEST_STATUSES = [
  "manual",
  "playing",
  "paused",
  "takenOver",
  "finished",
  "needsFlashConsent",
] as const;

describe("vjSetlistStepTransition", () => {
  it("a missing read answers vj_setlist_not_found", () => {
    expect(
      vjSetlistStepTransition(buildStateOn(1), {
        direction: "next",
        read: null,
      }).code,
    ).toBe("vj_setlist_not_found");
  });

  it("an empty set list answers vj_setlist_empty", () => {
    expect(
      vjSetlistStepTransition(buildStateOn(null), {
        direction: "next",
        read: buildRead(null, { itemIds: [] }),
      }).code,
    ).toBe("vj_setlist_empty");
  });

  it("previous at the first step without Loop answers vj_setlist_start", () => {
    expect(
      vjSetlistStepTransition(buildStateOn(0), {
        direction: "previous",
        read: buildRead(null),
      }).code,
    ).toBe("vj_setlist_start");
  });

  it("next past the last step without Loop answers vj_setlist_end", () => {
    expect(
      vjSetlistStepTransition(buildStateOn(2), {
        direction: "next",
        read: buildRead(null),
      }).code,
    ).toBe("vj_setlist_end");
  });

  it("previous with no step found at an index answers vj_setlist_index_invalid", () => {
    expect(
      vjSetlistStepTransition(buildStateOn(5), {
        direction: "previous",
        read: buildRead(null),
      }).code,
    ).toBe("vj_setlist_index_invalid");
  });

  it("while playing it shows the step, stays playing and restarts the clock", () => {
    const transition = acceptedOf(
      vjSetlistStepTransition(buildPlayingState(0, { itemId: ITEM_A }), {
        direction: "next",
        read: buildRead(buildSceneStep(1, ITEM_B, { duration: BEATS_16 })),
      }),
    );
    expect(transition.show?.kind).toBe("scene");
    expect(transition.nextState.setlistIndex).toBe(1);
    expect(transition.nextState.setlistPlayback.status).toBe("playing");
    expect(transition.nextState.setlistPlayback.itemId).toBe(ITEM_B);
    expect(transition.clock).toEqual({
      kind: "start",
      durationMs: BEATS_16_MS,
      remainingMs: BEATS_16_MS,
    });
  });

  it("while manual it shows the step, stays manual and clears the clock", () => {
    const transition = acceptedOf(
      vjSetlistStepTransition(buildStateOn(0, { itemId: ITEM_A }), {
        direction: "next",
        read: buildRead(buildClipStep(1, ITEM_B)),
      }),
    );
    expect(transition.show).toEqual({ kind: "clip", clipId: CLIP_ID });
    expect(transition.nextState.setlistPlayback.status).toBe("manual");
    expect(transition.nextState.setlistPlayback.itemId).toBe(ITEM_B);
    expect(transition.clock).toEqual({ kind: "clear" });
  });

  it("from paused, takenOver, finished and needsFlashConsent it shows the step and pauses on its full length", () => {
    for (const status of [
      "paused",
      "takenOver",
      "finished",
      "needsFlashConsent",
    ] as const) {
      const transition = acceptedOf(
        vjSetlistStepTransition(
          buildStateOn(1, { status, pausedRemainingMs: null }),
          {
            direction: "previous",
            isFlashConfirmed: true,
            read: buildRead(
              buildSceneStep(0, ITEM_A, {
                look: buildFlashingLook(),
                duration: BEATS_16,
              }),
            ),
          },
        ),
      );
      expect(transition.show?.kind).toBe("scene");
      expect(transition.nextState.setlistIndex).toBe(0);
      expect(transition.nextState.setlistPlayback.status).toBe("paused");
      expect(transition.nextState.setlistPlayback.pausedRemainingMs).toBe(
        BEATS_16_MS,
      );
      expect(transition.nextState.setlistPlayback.stepDurationMs).toBe(
        BEATS_16_MS,
      );
      expect(transition.clock).toEqual({ kind: "clear" });
    }
  });

  it("previous from the first step with Loop shows the last step", () => {
    const transition = acceptedOf(
      vjSetlistStepTransition(buildStateOn(0, { isLooping: true }), {
        direction: "previous",
        read: buildRead(buildClipStep(2, ITEM_C), { isLooping: true }),
      }),
    );
    expect(transition.nextState.setlistIndex).toBe(2);
  });

  it("copies the read's Loop into the playback", () => {
    const transition = acceptedOf(
      vjSetlistStepTransition(buildStateOn(0), {
        direction: "next",
        read: buildRead(buildClipStep(1, ITEM_B), { isLooping: true }),
      }),
    );
    expect(transition.nextState.setlistPlayback.isLooping).toBe(true);
  });
});

describe("vjSetlistStepTransition flash check and shuffle", () => {
  it("refuses a flashing step nobody confirmed in every status, both ways", () => {
    for (const status of VJ_STEP_TEST_STATUSES) {
      for (const direction of ["next", "previous"] as const) {
        const state =
          status === "playing"
            ? buildPlayingState(1, { itemId: ITEM_B })
            : buildStateOn(1, { status, itemId: ITEM_B });
        const flashingStep =
          direction === "next"
            ? buildSceneStep(2, ITEM_C, { look: buildFlashingLook() })
            : buildSceneStep(0, ITEM_A, { look: buildFlashingLook() });
        expect(
          vjSetlistStepTransition(state, {
            direction,
            read: buildRead(flashingStep),
          }),
        ).toEqual({ code: "vj_setlist_flash_unconfirmed", transition: null });
        expect(
          vjSetlistStepTransition(state, {
            direction,
            isFlashConfirmed: false,
            read: buildRead(flashingStep),
          }).code,
        ).toBe("vj_setlist_flash_unconfirmed");
      }
    }
  });

  it("lands a flashing step the tap confirmed and keeps the stored run flag", () => {
    for (const status of VJ_STEP_TEST_STATUSES) {
      const state =
        status === "playing"
          ? buildPlayingState(1, { itemId: ITEM_B })
          : buildStateOn(1, { status, itemId: ITEM_B });
      const transition = acceptedOf(
        vjSetlistStepTransition(state, {
          direction: "next",
          isFlashConfirmed: true,
          read: buildRead(
            buildSceneStep(2, ITEM_C, { look: buildFlashingLook() }),
          ),
        }),
      );
      expect(transition.show?.kind).toBe("scene");
      expect(transition.nextState.setlistIndex).toBe(2);
      expect(transition.nextState.setlistPlayback.isFlashConfirmed).toBe(false);
    }
  });

  it("lands a flashing step the stored run flag confirmed", () => {
    for (const status of VJ_STEP_TEST_STATUSES) {
      const state =
        status === "playing"
          ? buildPlayingState(1, { itemId: ITEM_B, isFlashConfirmed: true })
          : buildStateOn(1, {
              status,
              itemId: ITEM_B,
              isFlashConfirmed: true,
            });
      const transition = acceptedOf(
        vjSetlistStepTransition(state, {
          direction: "previous",
          read: buildRead(
            buildSceneStep(0, ITEM_A, { look: buildFlashingLook() }),
          ),
        }),
      );
      expect(transition.nextState.setlistIndex).toBe(0);
      expect(transition.nextState.setlistPlayback.isFlashConfirmed).toBe(true);
    }
  });

  it("lands clip steps and steady scene steps with no confirmation", () => {
    for (const step of [
      buildClipStep(2, ITEM_C),
      buildSceneStep(2, ITEM_C, { look: buildLook() }),
    ]) {
      expect(
        vjSetlistStepTransition(buildStateOn(1, { itemId: ITEM_B }), {
          direction: "next",
          read: buildRead(step),
        }).code,
      ).toBeNull();
    }
  });

  it("answers the read refusals before the flash check", () => {
    const flashingFirstStep = buildSceneStep(0, ITEM_A, {
      look: buildFlashingLook(),
    });
    expect(
      vjSetlistStepTransition(buildStateOn(0), {
        direction: "previous",
        read: buildRead(flashingFirstStep),
      }).code,
    ).toBe("vj_setlist_start");
    expect(
      vjSetlistStepTransition(buildStateOn(1), {
        direction: "next",
        read: buildRead(flashingFirstStep, { itemIds: [] }),
      }).code,
    ).toBe("vj_setlist_empty");
    expect(
      vjSetlistStepTransition(buildStateOn(1), {
        direction: "next",
        read: null,
      }).code,
    ).toBe("vj_setlist_not_found");
  });

  it("turns shuffle off when the step lands paused", () => {
    for (const status of [
      "paused",
      "takenOver",
      "finished",
      "needsFlashConsent",
    ] as const) {
      const base = buildStateOn(1, { status, itemId: ITEM_B });
      const state = { ...base, shuffle: { ...base.shuffle, isOn: true } };
      const transition = acceptedOf(
        vjSetlistStepTransition(state, {
          direction: "next",
          read: buildRead(buildClipStep(2, ITEM_C)),
        }),
      );
      expect(transition.nextState.setlistPlayback.status).toBe("paused");
      expect(transition.nextState.shuffle).toEqual({
        ...state.shuffle,
        isOn: false,
      });
    }
  });
});

describe("the step timer", () => {
  it("targets the step end less the early lead, only while playing", () => {
    expect(
      vjSetlistTimerTargetAt(buildPlayingState(0, { stepEndsAt: 10_000 })),
    ).toBe(10_000 - VJ_LIMITS.quantizedAdvanceEarlyMs);
    expect(vjSetlistTimerTargetAt(buildPlayingState(0))).toBe(8700);
    expect(vjSetlistTimerTargetAt(buildStateOn(0))).toBeNull();
    expect(
      vjSetlistTimerTargetAt(buildStateOn(0, { status: "paused" })),
    ).toBeNull();
    expect(
      vjSetlistTimerTargetAt(buildPlayingState(0, { stepEndsAt: null })),
    ).toBeNull();
  });

  it("reads the step after the index, wrapping with Loop", () => {
    expect(vjSetlistTimerReadPosition(buildPlayingState(1))).toEqual({
      kind: "index",
      index: 2,
      wrapsToFirst: false,
    });
    expect(
      vjSetlistTimerReadPosition(buildPlayingState(1, { isLooping: true })),
    ).toEqual({ kind: "index", index: 2, wrapsToFirst: true });
    expect(vjSetlistTimerReadPosition(buildPlayingState(null))).toEqual({
      kind: "index",
      index: 0,
      wrapsToFirst: false,
    });
    expect(vjSetlistTimerReadPosition(buildPlayingState(99))).toEqual({
      kind: "count",
    });
    expect(
      vjSetlistTimerReadPosition(buildPlayingState(99, { isLooping: true })),
    ).toEqual({ kind: "index", index: 0, wrapsToFirst: false });
  });

  it("reads nothing without a target or an active set list", () => {
    expect(vjSetlistTimerReadPosition(buildStateOn(1))).toBeNull();
    expect(
      vjSetlistTimerReadPosition({
        ...buildPlayingState(1),
        activeSetlistId: null,
      }),
    ).toBeNull();
  });

  it("lands nothing when the state is not playing, has no set list, has no read or another read", () => {
    const read = buildRead(buildClipStep(2, ITEM_C));
    expect(vjSetlistTimerTransition(buildStateOn(1), read)).toBeNull();
    expect(
      vjSetlistTimerTransition(
        { ...buildPlayingState(1), activeSetlistId: null },
        read,
      ),
    ).toBeNull();
    expect(vjSetlistTimerTransition(buildPlayingState(1), null)).toBeNull();
    expect(
      vjSetlistTimerTransition(
        buildPlayingState(1),
        buildRead(buildClipStep(2, ITEM_C), {
          setlistId: "aaaaaaaa-0000-4000-8000-000000000000",
        }),
      ),
    ).toBeNull();
  });

  it("compares the set list id without case", () => {
    expect(
      vjSetlistTimerTransition(
        buildPlayingState(1),
        buildRead(buildClipStep(2, ITEM_C), {
          setlistId: SETLIST_ID.toUpperCase(),
        }),
      ),
    ).not.toBeNull();
  });

  it("an empty set list goes manual with no index", () => {
    const transition = vjSetlistTimerTransition(
      buildPlayingState(1, { itemId: ITEM_B }),
      buildRead(null, { itemIds: [] }),
    );
    expect(transition?.nextState.setlistIndex).toBeNull();
    expect(transition?.nextState.setlistPlayback.status).toBe("manual");
    expect(transition?.nextState.setlistPlayback.itemId).toBeNull();
    expect(transition?.nextState.setlistPlayback.stepDurationMs).toBeNull();
    expect(transition?.show).toBeNull();
    expect(transition?.clock).toEqual({ kind: "clear" });
  });

  it("past the end it finishes and keeps the index and item", () => {
    const transition = vjSetlistTimerTransition(
      buildPlayingState(2, { itemId: ITEM_C }),
      buildRead(null),
    );
    expect(transition?.nextState.setlistPlayback.status).toBe("finished");
    expect(transition?.nextState.setlistIndex).toBe(2);
    expect(transition?.nextState.setlistPlayback.itemId).toBe(ITEM_C);
    expect(transition?.show).toBeNull();
    expect(transition?.clock).toEqual({ kind: "clear" });
  });

  it("a flashing step without the stored confirmation lands needsFlashConsent and keeps the step on screen", () => {
    const transition = vjSetlistTimerTransition(
      buildPlayingState(0, { itemId: ITEM_A }),
      buildRead(buildSceneStep(1, ITEM_B, { look: buildFlashingLook() })),
    );
    expect(transition?.nextState.setlistPlayback.status).toBe(
      "needsFlashConsent",
    );
    expect(transition?.nextState.setlistIndex).toBe(0);
    expect(transition?.nextState.setlistPlayback.itemId).toBe(ITEM_A);
    expect(transition?.show).toBeNull();
    expect(transition?.clock).toEqual({ kind: "clear" });
  });

  it("a flashing step plays when the stored flag is true", () => {
    const transition = vjSetlistTimerTransition(
      buildPlayingState(0, { isFlashConfirmed: true }),
      buildRead(buildSceneStep(1, ITEM_B, { look: buildFlashingLook() })),
    );
    expect(transition?.nextState.setlistPlayback.status).toBe("playing");
    expect(transition?.show?.kind).toBe("scene");
  });

  it("otherwise it shows the step, stays playing and starts the full clock", () => {
    const transition = vjSetlistTimerTransition(
      buildPlayingState(0, { itemId: ITEM_A }),
      buildRead(buildClipStep(1, ITEM_B, BEATS_16), { isLooping: true }),
    );
    expect(transition?.show).toEqual({ kind: "clip", clipId: CLIP_ID });
    expect(transition?.nextState.setlistIndex).toBe(1);
    expect(transition?.nextState.setlistPlayback.status).toBe("playing");
    expect(transition?.nextState.setlistPlayback.itemId).toBe(ITEM_B);
    expect(transition?.nextState.setlistPlayback.isLooping).toBe(true);
    expect(transition?.clock).toEqual({
      kind: "start",
      durationMs: BEATS_16_MS,
      remainingMs: BEATS_16_MS,
    });
  });

  it("a looping wrap plays step 0", () => {
    const transition = vjSetlistTimerTransition(
      buildPlayingState(2, { isLooping: true, itemId: ITEM_C }),
      buildRead(buildClipStep(0, ITEM_A), { isLooping: true }),
    );
    expect(transition?.nextState.setlistIndex).toBe(0);
    expect(transition?.nextState.setlistPlayback.itemId).toBe(ITEM_A);
  });
});

describe("playing transitions leave the clock unstamped", () => {
  it("every accepted transition into playing nulls stepStartedAt and stepEndsAt", () => {
    const steppedWhilePlaying = acceptedOf(
      vjSetlistStepTransition(buildPlayingState(0, { itemId: ITEM_A }), {
        direction: "next",
        read: buildRead(buildClipStep(1, ITEM_B)),
      }),
    );
    const byTimer = vjSetlistTimerTransition(
      buildPlayingState(0, { itemId: ITEM_A }),
      buildRead(buildClipStep(1, ITEM_B)),
    );
    const bySelect = acceptedOf(
      vjSetlistSelectTransition(buildPlayingState(2), {
        setlistId: SETLIST_ID,
        index: 0,
        isPlaying: true,
        isFlashConfirmed: false,
        read: buildRead(buildClipStep(0, ITEM_A)),
      }),
    );
    const byResume = acceptedOf(
      setPlaying(
        buildStateOn(1, {
          status: "paused",
          stepDurationMs: 8000,
          pausedRemainingMs: 3000,
        }),
        true,
        null,
      ),
    );
    const nextStates = [
      steppedWhilePlaying.nextState,
      byTimer?.nextState,
      bySelect.nextState,
      byResume.nextState,
    ];
    for (const nextState of nextStates) {
      expect(nextState?.setlistPlayback.status).toBe("playing");
      expect(nextState?.setlistPlayback.stepStartedAt).toBeNull();
      expect(nextState?.setlistPlayback.stepEndsAt).toBeNull();
    }
  });
});

describe("playback fields a transition builds, field for field", () => {
  const playingWithTimes = buildPlayingState(1, {
    itemId: ITEM_B,
    stepStartedAt: 1000,
    stepEndsAt: 9000,
    stepDurationMs: 8000,
  });

  it("every branch into playing carries the step's full length and no time left", () => {
    const steppedWhilePlaying = acceptedOf(
      vjSetlistStepTransition(playingWithTimes, {
        direction: "next",
        read: buildRead(buildClipStep(2, ITEM_C, BEATS_16)),
      }),
    ).nextState;
    const byTimer = vjSetlistTimerTransition(
      playingWithTimes,
      buildRead(buildClipStep(2, ITEM_C, BEATS_16)),
    )?.nextState;
    const bySelect = acceptedOf(
      vjSetlistSelectTransition(buildState(), {
        setlistId: SETLIST_ID,
        index: 0,
        isPlaying: true,
        isFlashConfirmed: false,
        read: buildRead(buildClipStep(0, ITEM_A, BEATS_16)),
      }),
    ).nextState;
    const byTakenOver = acceptedOf(
      setPlaying(
        buildStateOn(0, { status: "takenOver", itemId: ITEM_A }),
        true,
        buildRead(buildClipStep(1, ITEM_B, BEATS_16)),
      ),
    ).nextState;
    const byManualInPlace = acceptedOf(
      setPlaying(
        buildStateOn(1),
        true,
        buildRead(buildClipStep(1, ITEM_B, BEATS_16)),
      ),
    ).nextState;
    const byResume = acceptedOf(
      setPlaying(
        buildStateOn(1, {
          status: "paused",
          stepDurationMs: BEATS_16_MS,
          pausedRemainingMs: 3000,
        }),
        true,
        null,
      ),
    ).nextState;
    const nextStates = [
      steppedWhilePlaying,
      byTimer,
      bySelect,
      byTakenOver,
      byManualInPlace,
      byResume,
    ];
    for (const nextState of nextStates) {
      expect(nextState?.setlistPlayback.status).toBe("playing");
      expect(nextState?.setlistPlayback.stepStartedAt).toBeNull();
      expect(nextState?.setlistPlayback.stepEndsAt).toBeNull();
      expect(nextState?.setlistPlayback.stepDurationMs).toBe(BEATS_16_MS);
      expect(nextState?.setlistPlayback.pausedRemainingMs).toBeNull();
    }
  });

  it("pause leaves both clock times null", () => {
    const transition = acceptedOf(setPlaying(playingWithTimes, false, null));
    expect(transition.nextState.setlistPlayback.status).toBe("paused");
    expect(transition.nextState.setlistPlayback.stepStartedAt).toBeNull();
    expect(transition.nextState.setlistPlayback.stepEndsAt).toBeNull();
  });

  it("the timer landing finished leaves both clock times and the time left null", () => {
    const transition = vjSetlistTimerTransition(
      playingWithTimes,
      buildRead(null),
    );
    expect(transition?.nextState.setlistPlayback.status).toBe("finished");
    expect(transition?.nextState.setlistPlayback.stepStartedAt).toBeNull();
    expect(transition?.nextState.setlistPlayback.stepEndsAt).toBeNull();
    expect(transition?.nextState.setlistPlayback.pausedRemainingMs).toBeNull();
  });

  it("the timer landing needsFlashConsent leaves both clock times and the time left null", () => {
    const transition = vjSetlistTimerTransition(
      playingWithTimes,
      buildRead(buildSceneStep(2, ITEM_C, { look: buildFlashingLook() })),
    );
    expect(transition?.nextState.setlistPlayback.status).toBe(
      "needsFlashConsent",
    );
    expect(transition?.nextState.setlistPlayback.stepStartedAt).toBeNull();
    expect(transition?.nextState.setlistPlayback.stepEndsAt).toBeNull();
    expect(transition?.nextState.setlistPlayback.pausedRemainingMs).toBeNull();
  });

  it("resume takes the time left, else the full length, else 0", () => {
    const resumeClockOf = (
      stepDurationMs: number | null,
      pausedRemainingMs: number | null,
    ) =>
      acceptedOf(
        setPlaying(
          buildStateOn(1, {
            status: "paused",
            stepDurationMs,
            pausedRemainingMs,
          }),
          true,
          null,
        ),
      ).clock;
    expect(resumeClockOf(8000, 3000)).toEqual({
      kind: "start",
      durationMs: 8000,
      remainingMs: 3000,
    });
    expect(resumeClockOf(8000, null)).toEqual({
      kind: "start",
      durationMs: 8000,
      remainingMs: 8000,
    });
    expect(resumeClockOf(null, null)).toEqual({
      kind: "start",
      durationMs: 0,
      remainingMs: 0,
    });
  });

  it("Play while already playing with isFlashConfirmed true stores the flag and keeps the clock", () => {
    const transition = acceptedOf(
      setPlaying(playingWithTimes, true, null, true),
    );
    expect(transition.nextState.setlistPlayback).toEqual({
      ...playingWithTimes.setlistPlayback,
      isFlashConfirmed: true,
    });
    expect(transition.clock).toEqual({ kind: "keep" });
    const withoutConfirmation = acceptedOf(
      setPlaying(playingWithTimes, true, null, false),
    );
    expect(withoutConfirmation.nextState).toBe(playingWithTimes);
  });
});

describe("vjSetlistTakeoverState", () => {
  it("moves playing, paused and needsFlashConsent to takenOver and drops the clock", () => {
    for (const status of ["playing", "paused", "needsFlashConsent"] as const) {
      const previous = buildStateOn(1, {
        status,
        itemId: ITEM_B,
        isFlashConfirmed: true,
        stepStartedAt: status === "playing" ? 1000 : null,
        stepEndsAt: status === "playing" ? 9000 : null,
        stepDurationMs: 8000,
        pausedRemainingMs: status === "paused" ? 3000 : null,
      });
      const next = { ...previous, clipSequence: previous.clipSequence + 1 };
      const result = vjSetlistTakeoverState(previous, next);
      expect(result.setlistPlayback).toEqual({
        status: "takenOver",
        itemId: ITEM_B,
        isFlashConfirmed: true,
        stepStartedAt: null,
        stepEndsAt: null,
        stepDurationMs: null,
        pausedRemainingMs: null,
        isLooping: false,
      });
      expect(result.setlistIndex).toBe(1);
    }
  });

  it("takes over for each live source field and for the pack", () => {
    const previous = buildPlayingState(1);
    for (const patch of [
      { liveClipId: CLIP_ID },
      { liveGeneratorId: "plasma" as const },
      { activePackId: SCENE_ID },
    ]) {
      const result = vjSetlistTakeoverState(previous, {
        ...previous,
        ...patch,
      });
      expect(result.setlistPlayback.status).toBe("takenOver");
    }
  });

  it("turning shuffle on takes over, shuffle already on does not", () => {
    const previous = buildPlayingState(1);
    const turnedOn = {
      ...previous,
      shuffle: { ...previous.shuffle, isOn: true },
    };
    expect(
      vjSetlistTakeoverState(previous, turnedOn).setlistPlayback.status,
    ).toBe("takenOver");
    const alreadyOn = vjSetlistTakeoverState(turnedOn, {
      ...turnedOn,
      shuffle: { ...turnedOn.shuffle, intervalValue: 4 },
    });
    expect(alreadyOn.setlistPlayback.status).toBe("playing");
  });

  it("manual, takenOver and finished never change", () => {
    for (const status of ["manual", "takenOver", "finished"] as const) {
      const previous = buildStateOn(1, { status });
      const next = { ...previous, clipSequence: 1 };
      expect(vjSetlistTakeoverState(previous, next)).toBe(next);
    }
  });

  it("answers next itself when nothing live moved", () => {
    const previous = buildPlayingState(1);
    const next = { ...previous, revision: previous.revision + 1 };
    expect(vjSetlistTakeoverState(previous, next)).toBe(next);
  });
});

describe("vjSetlistLoopingState", () => {
  it("writes Loop on the active set list, compared without case", () => {
    const state = buildStateOn(1);
    expect(
      vjSetlistLoopingState(state, SETLIST_ID, true).setlistPlayback.isLooping,
    ).toBe(true);
    expect(
      vjSetlistLoopingState(state, SETLIST_ID.toUpperCase(), true)
        .setlistPlayback.isLooping,
    ).toBe(true);
  });

  it("leaves the state for another set list, no set list or an equal Loop", () => {
    const state = buildStateOn(1);
    expect(
      vjSetlistLoopingState(
        state,
        "aaaaaaaa-0000-4000-8000-000000000000",
        true,
      ),
    ).toBe(state);
    expect(vjSetlistLoopingState(buildState(), SETLIST_ID, true)).toEqual(
      buildState(),
    );
    expect(vjSetlistLoopingState(state, SETLIST_ID, false)).toBe(state);
  });
});

const OLD_IDS = [ITEM_A, ITEM_B, ITEM_C, ITEM_D];

function follow(
  state: VjStageState,
  nowIds: string[],
  previousItemIds: readonly string[] | null = OLD_IDS,
  isLooping = false,
): VjStageState {
  return vjSetlistFollowState(state, {
    setlistId: SETLIST_ID,
    previousItemIds,
    read: { itemIds: nowIds, isLooping },
  });
}

describe("vjSetlistFollowState", () => {
  const workedCases: ReadonlyArray<{
    name: string;
    index: number;
    itemId: string | null;
    nowIds: string[];
    expectedIndex: number | null;
    expectedItemId: string | null;
  }> = [
    {
      name: "C on screen, move C first",
      index: 2,
      itemId: ITEM_C,
      nowIds: [ITEM_C, ITEM_A, ITEM_B, ITEM_D],
      expectedIndex: 0,
      expectedItemId: ITEM_C,
    },
    {
      name: "C on screen, remove A",
      index: 2,
      itemId: ITEM_C,
      nowIds: [ITEM_B, ITEM_C, ITEM_D],
      expectedIndex: 1,
      expectedItemId: ITEM_C,
    },
    {
      name: "C on screen, remove C",
      index: 2,
      itemId: ITEM_C,
      nowIds: [ITEM_A, ITEM_B, ITEM_D],
      expectedIndex: 1,
      expectedItemId: null,
    },
    {
      name: "C on screen, remove B and C",
      index: 2,
      itemId: ITEM_C,
      nowIds: [ITEM_A, ITEM_D],
      expectedIndex: 0,
      expectedItemId: null,
    },
    {
      name: "A on screen, remove A",
      index: 0,
      itemId: ITEM_A,
      nowIds: [ITEM_B, ITEM_C, ITEM_D],
      expectedIndex: null,
      expectedItemId: null,
    },
    {
      name: "C on screen, insert X after C",
      index: 2,
      itemId: ITEM_C,
      nowIds: [ITEM_A, ITEM_B, ITEM_C, ITEM_X, ITEM_D],
      expectedIndex: 2,
      expectedItemId: ITEM_C,
    },
    {
      name: "C on screen, remove all",
      index: 2,
      itemId: ITEM_C,
      nowIds: [],
      expectedIndex: null,
      expectedItemId: null,
    },
    {
      name: "C on screen, the scene of C deleted",
      index: 2,
      itemId: ITEM_C,
      nowIds: [ITEM_A, ITEM_B, ITEM_D],
      expectedIndex: 1,
      expectedItemId: null,
    },
  ];

  it.each(workedCases)(
    "worked case: $name",
    ({ index, itemId, nowIds, expectedIndex, expectedItemId }) => {
      const result = follow(buildStateOn(index, { itemId }), nowIds);
      expect(result.setlistIndex).toBe(expectedIndex);
      expect(result.setlistPlayback.itemId).toBe(expectedItemId);
    },
  );
});

describe("vjSetlistFollowState anchors and clamps", () => {
  it("worked case: item id gone earlier (index 0 on A, item id null), insert X after A", () => {
    const result = follow(
      buildStateOn(0, { itemId: null }),
      [ITEM_A, ITEM_X, ITEM_C, ITEM_D],
      [ITEM_A, ITEM_C, ITEM_D],
    );
    expect(result.setlistIndex).toBe(0);
    expect(result.setlistPlayback.itemId).toBeNull();
  });

  it("worked case: remove all goes manual with every clock field null", () => {
    const result = follow(
      buildPlayingState(2, { itemId: ITEM_C, pausedRemainingMs: null }),
      [],
    );
    expect(result.setlistPlayback).toEqual({
      ...createVjSetlistPlayback(false),
      status: "manual",
      itemId: null,
      isFlashConfirmed: false,
    });
  });

  it("an item id that stays keeps a running clock", () => {
    const state = buildPlayingState(2, { itemId: ITEM_C });
    const result = follow(state, [ITEM_C, ITEM_A, ITEM_B, ITEM_D]);
    expect(result.setlistPlayback.status).toBe("playing");
    expect(result.setlistPlayback.stepStartedAt).toBe(1000);
    expect(result.setlistPlayback.stepEndsAt).toBe(9000);
  });

  it("rule 4 keeps the status and the clock", () => {
    const result = follow(buildPlayingState(2, { itemId: ITEM_C }), [
      ITEM_A,
      ITEM_B,
      ITEM_D,
    ]);
    expect(result.setlistPlayback.status).toBe("playing");
    expect(result.setlistPlayback.stepEndsAt).toBe(9000);
  });

  it("rule 5: no item id and no index stay null", () => {
    const result = follow(buildStateOn(null), [ITEM_A, ITEM_B]);
    expect(result.setlistIndex).toBeNull();
    expect(result.setlistPlayback.itemId).toBeNull();
  });

  it("rule 6 and 7: an index anchored on the old list when the item id is null", () => {
    expect(
      follow(buildStateOn(2), [ITEM_C, ITEM_A, ITEM_B, ITEM_D]).setlistIndex,
    ).toBe(0);
    expect(follow(buildStateOn(2), [ITEM_A, ITEM_D]).setlistIndex).toBe(0);
    expect(follow(buildStateOn(0), [ITEM_B, ITEM_D]).setlistIndex).toBeNull();
  });

  it("rule 8: a missing item id with an unknown old list clamps the index", () => {
    expect(
      follow(
        buildStateOn(2, { itemId: ITEM_C }),
        [ITEM_A, ITEM_B, ITEM_D, ITEM_X],
        null,
      ).setlistIndex,
    ).toBe(1);
    expect(
      follow(buildStateOn(0, { itemId: ITEM_C }), [ITEM_A, ITEM_B], null)
        .setlistIndex,
    ).toBeNull();
    expect(
      follow(
        buildStateOn(3, { itemId: ITEM_C }),
        [ITEM_A, ITEM_B],
        [ITEM_A, ITEM_B],
      ).setlistIndex,
    ).toBe(1);
    expect(
      follow(buildStateOn(null, { itemId: ITEM_C }), [ITEM_A, ITEM_B], null)
        .setlistIndex,
    ).toBeNull();
  });

  it("rule 9: no item id and an unknown or short old list clamps the index", () => {
    expect(follow(buildStateOn(3), [ITEM_A, ITEM_B], null).setlistIndex).toBe(
      1,
    );
    expect(
      follow(buildStateOn(3), [ITEM_A], [ITEM_A, ITEM_B]).setlistIndex,
    ).toBe(0);
  });

  it("rule 1: a set list that is gone answers the cleared state", () => {
    const result = vjSetlistFollowState(buildPlayingState(1), {
      setlistId: SETLIST_ID,
      previousItemIds: OLD_IDS,
      read: null,
    });
    expect(result.activeSetlistId).toBeNull();
    expect(result.setlistIndex).toBeNull();
    expect(result.setlistPlayback).toEqual(createVjSetlistPlayback(false));
  });

  it("answers the state for another set list and for no active set list", () => {
    const state = buildStateOn(1);
    expect(
      vjSetlistFollowState(state, {
        setlistId: "aaaaaaaa-0000-4000-8000-000000000000",
        previousItemIds: OLD_IDS,
        read: { itemIds: [], isLooping: true },
      }),
    ).toBe(state);
    const idle = buildState();
    expect(
      vjSetlistFollowState(idle, {
        setlistId: SETLIST_ID,
        previousItemIds: null,
        read: null,
      }),
    ).toBe(idle);
  });

  it("refreshes Loop from the read", () => {
    const result = follow(
      buildStateOn(1, { itemId: ITEM_B }),
      OLD_IDS,
      OLD_IDS,
      true,
    );
    expect(result.setlistPlayback.isLooping).toBe(true);
    expect(result.setlistIndex).toBe(1);
  });

  it("answers the state itself when nothing changes", () => {
    const state = buildStateOn(1, { itemId: ITEM_B });
    expect(follow(state, OLD_IDS)).toBe(state);
  });
});

describe("stampVjSetlistClock", () => {
  const playing = buildPlayingState(0).setlistPlayback;

  it("keep answers the playback as it is", () => {
    expect(stampVjSetlistClock(playing, { kind: "keep" }, NOW)).toBe(playing);
  });

  it("clear nulls the start and the end only", () => {
    const paused: VjSetlistPlayback = {
      ...playing,
      status: "paused",
      pausedRemainingMs: 3000,
    };
    expect(stampVjSetlistClock(paused, { kind: "clear" }, NOW)).toEqual({
      ...paused,
      stepStartedAt: null,
      stepEndsAt: null,
    });
  });

  it("start stamps the end from the remaining time and the start from the full length", () => {
    const stamped = stampVjSetlistClock(
      { ...playing, status: "paused", pausedRemainingMs: 3000 },
      { kind: "start", durationMs: 8000, remainingMs: 3000 },
      NOW,
    );
    expect(stamped.stepEndsAt).toBe(103_000);
    expect(stamped.stepStartedAt).toBe(95_000);
    expect(stamped.stepDurationMs).toBe(8000);
    expect(stamped.pausedRemainingMs).toBeNull();
    expect((stamped.stepEndsAt ?? 0) - (stamped.stepStartedAt ?? 0)).toBe(
      stamped.stepDurationMs,
    );
  });

  it("start with a full remaining time starts at the stamp", () => {
    const stamped = stampVjSetlistClock(
      playing,
      { kind: "start", durationMs: 8000, remainingMs: 8000 },
      NOW,
    );
    expect(stamped.stepStartedAt).toBe(NOW);
    expect(stamped.stepEndsAt).toBe(NOW + 8000);
  });
});

describe("vjSetlistAdvanceApplyAt", () => {
  const offTempo = {
    ...buildState().tempo,
    bpm: 120,
    downbeatAt: 0,
    quantize: "off" as const,
  };

  it("quantize off lands at the step end, or null once it has passed", () => {
    expect(vjSetlistAdvanceApplyAt(offTempo, 10_000, 9000)).toBe(10_000);
    expect(vjSetlistAdvanceApplyAt(offTempo, 10_000, 10_000)).toBeNull();
    expect(vjSetlistAdvanceApplyAt(offTempo, 10_000, 10_500)).toBeNull();
  });

  it("quantize beat lands on the boundary at the step end, the slack catching a rounded end", () => {
    const beatTempo = { ...offTempo, quantize: "beat" as const };
    expect(vjSetlistAdvanceApplyAt(beatTempo, 10_000, 9000)).toBe(10_000);
    expect(vjSetlistAdvanceApplyAt(beatTempo, 10_001, 9000)).toBe(10_000);
    expect(vjSetlistAdvanceApplyAt(beatTempo, 10_003, 9000)).toBe(10_500);
  });

  it("quantize lands at least the minimum lead from now", () => {
    const beatTempo = { ...offTempo, quantize: "beat" as const };
    expect(vjSetlistAdvanceApplyAt(beatTempo, 10_000, 9900)).toBe(10_500);
  });

  it("quantize bar lands on the bar boundary", () => {
    const barTempo = { ...offTempo, quantize: "bar" as const };
    expect(vjSetlistAdvanceApplyAt(barTempo, 10_000, 9000)).toBe(10_000);
    expect(vjSetlistAdvanceApplyAt(barTempo, 10_200, 9000)).toBe(12_000);
  });
});

describe("restoredVjSetlistPlayback", () => {
  const readWithStep = buildRead(buildClipStep(1, ITEM_B), {
    isLooping: true,
  });
  const restoreInput = { read: readWithStep, setlistIndex: 1, now: NOW };

  it("no read restores the default playback", () => {
    expect(
      restoredVjSetlistPlayback(
        { status: "playing", stepStartedAt: 1, stepEndsAt: 2 },
        { read: null, setlistIndex: null, now: NOW },
      ),
    ).toEqual(createVjSetlistPlayback(false));
  });

  it("reads a status outside the list as manual and never restores the flash flag", () => {
    const restored = restoredVjSetlistPlayback(
      { status: "rewinding", isFlashConfirmed: true },
      restoreInput,
    );
    expect(restored).toEqual({
      ...createVjSetlistPlayback(true),
      status: "manual",
      itemId: ITEM_B,
    });
  });

  it("a value that is no object restores as manual", () => {
    expect(restoredVjSetlistPlayback("nope", restoreInput).status).toBe(
      "manual",
    );
    expect(restoredVjSetlistPlayback(null, restoreInput).status).toBe("manual");
  });

  it("takes the item id from the read step, and null with no index", () => {
    expect(restoredVjSetlistPlayback({}, restoreInput).itemId).toBe(ITEM_B);
    expect(
      restoredVjSetlistPlayback(
        {},
        { read: buildRead(null), setlistIndex: 1, now: NOW },
      ).itemId,
    ).toBeNull();
    expect(
      restoredVjSetlistPlayback(
        {},
        { read: readWithStep, setlistIndex: null, now: NOW },
      ).itemId,
    ).toBeNull();
  });

  it("playing keeps its three clock numbers, a past end included", () => {
    const valid = {
      status: "playing",
      stepStartedAt: 90_000,
      stepEndsAt: 98_000,
      stepDurationMs: 8000,
    };
    expect(restoredVjSetlistPlayback(valid, restoreInput)).toEqual({
      ...createVjSetlistPlayback(true),
      status: "playing",
      itemId: ITEM_B,
      stepStartedAt: 90_000,
      stepEndsAt: 98_000,
      stepDurationMs: 8000,
    });
    const future = {
      ...valid,
      stepStartedAt: 600_000 + NOW - 8000,
      stepEndsAt: 600_000 + NOW,
    };
    expect(restoredVjSetlistPlayback(future, restoreInput).status).toBe(
      "playing",
    );
  });

  it("playing that fails its check restores as manual with no clock field", () => {
    const invalidRecords: Array<Record<string, unknown>> = [
      { stepStartedAt: 90_000, stepEndsAt: 98_000, stepDurationMs: 7999 },
      { stepStartedAt: 90_000.5, stepEndsAt: 98_000.5, stepDurationMs: 8000 },
      { stepStartedAt: 100_000, stepEndsAt: 100_000, stepDurationMs: 0 },
      {
        stepStartedAt: 0,
        stepEndsAt: 600_001,
        stepDurationMs: 600_001,
      },
      {
        stepStartedAt: 600_001 + NOW - 8000,
        stepEndsAt: 600_001 + NOW,
        stepDurationMs: 8000,
      },
      { stepStartedAt: "90000", stepEndsAt: 98_000, stepDurationMs: 8000 },
      { stepStartedAt: 90_000, stepEndsAt: null, stepDurationMs: 8000 },
      { stepStartedAt: 1, stepEndsAt: Number.MAX_VALUE, stepDurationMs: 8000 },
    ];
    for (const record of invalidRecords) {
      const restored = restoredVjSetlistPlayback(
        { status: "playing", ...record },
        restoreInput,
      );
      expect(restored.status).toBe("manual");
      expect(restored.stepStartedAt).toBeNull();
      expect(restored.stepEndsAt).toBeNull();
      expect(restored.stepDurationMs).toBeNull();
      expect(restored.pausedRemainingMs).toBeNull();
    }
  });

  it("paused keeps the full length and the time left", () => {
    expect(
      restoredVjSetlistPlayback(
        { status: "paused", stepDurationMs: 8000, pausedRemainingMs: 3000 },
        restoreInput,
      ),
    ).toEqual({
      ...createVjSetlistPlayback(true),
      status: "paused",
      itemId: ITEM_B,
      stepDurationMs: 8000,
      pausedRemainingMs: 3000,
    });
    expect(
      restoredVjSetlistPlayback(
        { status: "paused", stepDurationMs: 8000, pausedRemainingMs: 8000 },
        restoreInput,
      ).status,
    ).toBe("paused");
  });

  it("paused that fails its check restores as manual with no clock field", () => {
    const invalidRecords: Array<Record<string, unknown>> = [
      { stepDurationMs: 8000, pausedRemainingMs: 8001 },
      { stepDurationMs: 8000, pausedRemainingMs: -1 },
      { stepDurationMs: 600_001, pausedRemainingMs: 10 },
      { stepDurationMs: 8000, pausedRemainingMs: 1.5 },
      { stepDurationMs: 8000, pausedRemainingMs: null },
      { stepDurationMs: null, pausedRemainingMs: 10 },
    ];
    for (const record of invalidRecords) {
      const restored = restoredVjSetlistPlayback(
        { status: "paused", ...record },
        restoreInput,
      );
      expect(restored.status).toBe("manual");
      expect(restored.stepDurationMs).toBeNull();
      expect(restored.pausedRemainingMs).toBeNull();
    }
  });

  it("manual, takenOver, finished and needsFlashConsent drop the clock and keep a valid full length", () => {
    for (const status of [
      "manual",
      "takenOver",
      "finished",
      "needsFlashConsent",
    ] as const) {
      const restored = restoredVjSetlistPlayback(
        {
          status,
          stepStartedAt: 90_000,
          stepEndsAt: 98_000,
          stepDurationMs: 8000,
          pausedRemainingMs: 3000,
        },
        restoreInput,
      );
      expect(restored.status).toBe(status);
      expect(restored.stepStartedAt).toBeNull();
      expect(restored.stepEndsAt).toBeNull();
      expect(restored.pausedRemainingMs).toBeNull();
      expect(restored.stepDurationMs).toBe(8000);
    }
  });

  it("those statuses read an invalid full length as null", () => {
    for (const stepDurationMs of [0, 600_001, 1.5, "8000", null]) {
      expect(
        restoredVjSetlistPlayback(
          { status: "finished", stepDurationMs },
          restoreInput,
        ).stepDurationMs,
      ).toBeNull();
    }
    expect(
      restoredVjSetlistPlayback(
        { status: "finished", stepDurationMs: 600_000 },
        restoreInput,
      ).stepDurationMs,
    ).toBe(600_000);
    expect(
      restoredVjSetlistPlayback(
        { status: "finished", stepDurationMs: 1 },
        restoreInput,
      ).stepDurationMs,
    ).toBe(1);
  });
});
