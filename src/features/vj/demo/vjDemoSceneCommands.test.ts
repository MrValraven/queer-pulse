import { describe, expect, it, vi } from "vitest";
import {
  createVjSetlistPlayback,
  createVjStageState,
  stampVjSetlistClock,
  VJ_LIMITS,
  type VjSceneLook,
  type VjSetlistPlayback,
  type VjSetlistRead,
  type VjSetlistReadPosition,
  type VjSetlistStepRead,
  type VjStageState,
  type VjStepDuration,
} from "../../../shared/contracts/vj";
import type { VjCommandFrameName } from "../realtime/vjFrames";
import type {
  VjDemoCommandOutcome,
  VjDemoLibraryLookup,
} from "./vjDemoCommandKit";
import {
  applyRecallScene,
  applySetlistNext,
  applySetlistPrevious,
  applySetlistSelect,
  recallVjSceneLook,
  type VjDemoSetlistCommandContext,
  type VjDemoSetlistLoopingWrite,
} from "./vjDemoSceneCommands";
import {
  applyVjStageCommand,
  type VjStageCommandResult,
} from "./vjDemoStageCommands";

const STAGE_EPOCH = "33333333-3333-4333-8333-333333333333";
const PACK_ID = "11111111-1111-4111-8111-1111111111a1";
const OTHER_PACK_ID = "11111111-1111-4111-8111-1111111111a2";
const LIVE_CLIP_ID = "00000000-0000-4000-8000-0000000000c1";
const SCENE_CLIP_ID = "00000000-0000-4000-8000-0000000000c2";
const MIX_CLIP_ID = "00000000-0000-4000-8000-0000000000c3";
const OVERRIDE_CLIP_ID = "00000000-0000-4000-8000-0000000000c4";
const STEP_CLIP_ID = "00000000-0000-4000-8000-0000000000c5";
const CLIP_SCENE_ID = "44444444-4444-4444-8444-4444444444a1";
const GENERATOR_SCENE_ID = "44444444-4444-4444-8444-4444444444a2";
const SOURCELESS_SCENE_ID = "44444444-4444-4444-8444-4444444444a3";
const CALM_SCENE_ID = "44444444-4444-4444-8444-4444444444a4";
const CALM_GENERATOR_SCENE_ID = "44444444-4444-4444-8444-4444444444a5";
const UNKNOWN_ID = "44444444-4444-4444-8444-4444444444ff";
const SETLIST_ID = "55555555-5555-4555-8555-5555555555b1";
const EMPTY_SETLIST_ID = "55555555-5555-4555-8555-5555555555b2";
const FLASH_SETLIST_ID = "55555555-5555-4555-8555-5555555555b3";
const ITEM_A = "77777777-7777-4777-8777-7777777777a1";
const ITEM_B = "77777777-7777-4777-8777-7777777777a2";
const ITEM_C = "77777777-7777-4777-8777-7777777777a3";
const ITEM_D = "77777777-7777-4777-8777-7777777777a4";
const ITEM_E = "77777777-7777-4777-8777-7777777777a5";
const SCREEN_ID = "66666666-6666-4666-8666-6666666666d1";
const NOW = 500_000;

/** A look with a clip source and every part away from its default; its
 *  invert effect is flash capable, so a step of it flashes. */
const CLIP_LOOK: VjSceneLook = {
  source: { kind: "clip", clipId: SCENE_CLIP_ID.toUpperCase() },
  effects: {
    speed: 2,
    settings: { invert: { isOn: true, amount: 0.5, variant: null } },
  },
  transition: { mode: "cut", length: { unit: "beats", value: 4 } },
  overlay: {
    text: "Hello",
    style: "ticker",
    isVisible: true,
    position: "top",
    size: "xl",
    colorToken: "coral",
  },
  mix: { clipId: MIX_CLIP_ID.toUpperCase(), amount: 0.4, blendMode: "screen" },
};

const GENERATOR_LOOK: VjSceneLook = {
  ...CLIP_LOOK,
  source: { kind: "generator", generatorId: "plasma", generatorVariant: null },
};

const SOURCELESS_LOOK: VjSceneLook = { ...CLIP_LOOK, source: null };

/** A look that never flashes: no effect on, a fade. */
const CALM_LOOK: VjSceneLook = {
  ...CLIP_LOOK,
  effects: { speed: 1, settings: {} },
  transition: { mode: "fade", length: { unit: "beats", value: 4 } },
  mix: { clipId: null, amount: 0, blendMode: "screen" },
};

const CALM_GENERATOR_LOOK: VjSceneLook = {
  ...CALM_LOOK,
  source: { kind: "generator", generatorId: "plasma", generatorVariant: null },
};

const SCENE_LOOKS: Record<string, VjSceneLook> = {
  [CLIP_SCENE_ID]: CLIP_LOOK,
  [GENERATOR_SCENE_ID]: GENERATOR_LOOK,
  [SOURCELESS_SCENE_ID]: SOURCELESS_LOOK,
  [CALM_SCENE_ID]: CALM_LOOK,
  [CALM_GENERATOR_SCENE_ID]: CALM_GENERATOR_LOOK,
};

/** The sequence default of every fixture set list. */
const SEQUENCE_DEFAULT: VjStepDuration = { kind: "seconds", value: 8 };
const SEQUENCE_DEFAULT_MS = 8_000;
/** 16 beats at the busy state's 128 bpm. */
const SIXTEEN_BEATS_MS = Math.round((16 * 60_000) / 128);

type FixtureItem =
  | {
      id: string;
      kind: "scene";
      sceneId: string;
      duration: VjStepDuration | null;
    }
  | {
      id: string;
      kind: "clip";
      clipId: string;
      duration: VjStepDuration | null;
    };

/** "Set": a calm clip scene (A), a clip (B), a calm generator scene on 16
 *  beats (C). "Flash": a clip (D) then a flashing scene (E). */
const FIXTURE_SETLISTS: Record<string, FixtureItem[]> = {
  [SETLIST_ID]: [
    { id: ITEM_A, kind: "scene", sceneId: CALM_SCENE_ID, duration: null },
    { id: ITEM_B, kind: "clip", clipId: STEP_CLIP_ID, duration: null },
    {
      id: ITEM_C,
      kind: "scene",
      sceneId: CALM_GENERATOR_SCENE_ID,
      duration: { kind: "beats", value: 16 },
    },
  ],
  [FLASH_SETLIST_ID]: [
    { id: ITEM_D, kind: "clip", clipId: STEP_CLIP_ID, duration: null },
    { id: ITEM_E, kind: "scene", sceneId: CLIP_SCENE_ID, duration: null },
  ],
  [EMPTY_SETLIST_ID]: [],
};

/** The index a position reads, as the demo store answers it. */
function fixtureIndexOf(
  position: VjSetlistReadPosition,
  itemCount: number,
): number | null {
  if (position.kind === "count") return null;
  if (position.kind === "last") return itemCount > 0 ? itemCount - 1 : null;
  if (position.index < itemCount) return position.index;
  return position.wrapsToFirst && itemCount > 0 ? 0 : null;
}

function fixtureStepOf(item: FixtureItem, index: number): VjSetlistStepRead {
  const duration = item.duration ?? SEQUENCE_DEFAULT;
  if (item.kind === "clip") {
    return {
      kind: "clip",
      itemId: item.id,
      index,
      clipId: item.clipId,
      duration,
    };
  }
  const look = SCENE_LOOKS[item.sceneId];
  if (look === undefined) throw new Error(`no look for ${item.sceneId}`);
  return {
    kind: "scene",
    itemId: item.id,
    index,
    sceneId: item.sceneId,
    look,
    duration,
  };
}

/** Answers like the demo store: null for an unknown set list, a null step
 *  for 'count' and past the end. `loopingSetlistIds` names the set lists
 *  saved with Loop on. */
function readFixtureSetlist(
  setlistId: string,
  position: VjSetlistReadPosition,
  loopingSetlistIds: ReadonlySet<string>,
): VjSetlistRead | null {
  const items = FIXTURE_SETLISTS[setlistId.toLowerCase()];
  if (items === undefined) return null;
  const index = fixtureIndexOf(position, items.length);
  const item = index === null ? undefined : items[index];
  return {
    setlistId: setlistId.toLowerCase(),
    isLooping: loopingSetlistIds.has(setlistId.toLowerCase()),
    stepDuration: SEQUENCE_DEFAULT,
    itemIds: items.map((entry) => entry.id),
    step:
      item === undefined || index === null ? null : fixtureStepOf(item, index),
  };
}

function demoLibrary(
  loopingSetlistIds: ReadonlySet<string> = new Set(),
): VjDemoLibraryLookup {
  return {
    hasPack: () => true,
    hasClip: () => true,
    isClipInPack: () => true,
    readPackForStage: () => ({ eventId: null }),
    existingClipIds: (clipIds) => new Set(clipIds),
    clipIdsInPack: (_packId, clipIds) => new Set(clipIds),
    readPackClipForAdvance: () => ({ isFavorite: false }),
    readSceneLook: (sceneId) => SCENE_LOOKS[sceneId] ?? null,
    readSetlist: (setlistId, position) =>
      readFixtureSetlist(setlistId, position, loopingSetlistIds),
    readSetlistFollow: (setlistId) => {
      const read = readFixtureSetlist(
        setlistId,
        { kind: "count" },
        loopingSetlistIds,
      );
      return read === null
        ? null
        : { itemIds: read.itemIds, isLooping: read.isLooping };
    },
  };
}

function contextOf(
  options: {
    loopingSetlistIds?: ReadonlySet<string>;
    writeSetlistLooping?: VjDemoSetlistLoopingWrite;
  } = {},
): VjDemoSetlistCommandContext {
  return {
    now: NOW,
    library: demoLibrary(options.loopingSetlistIds),
    connectedScreenIds: new Set<string>(),
    isLeadMicOn: false,
    writeSetlistLooping: options.writeSetlistLooping,
  };
}

/** A stage with a live clip and every field recall keeps set away from its default. */
function busyState(): VjStageState {
  const state = createVjStageState(STAGE_EPOCH, 0);
  return {
    ...state,
    clipSequence: 7,
    activePackId: PACK_ID,
    liveClipId: LIVE_CLIP_ID,
    liveSince: 1_000,
    overlay: { ...state.overlay, text: "Old", isVisible: true, hideAt: 9_000 },
    countdown: { isVisible: true, targetAt: NOW + 60_000, label: "Doors" },
    logo: { isVisible: true, corner: "topLeft" },
    eventCard: { isVisible: true, kind: "qr" },
    effects: {
      ...state.effects,
      isBlackout: true,
      isStrobing: true,
      strobeStartedAt: NOW - 100,
    },
    tempo: {
      bpm: 128,
      downbeatAt: NOW - 4_000,
      quantize: "bar",
      source: "tap",
    },
    shuffle: { ...state.shuffle, isOn: true, excludedClipIds: [MIX_CLIP_ID] },
    recentClipIds: [LIVE_CLIP_ID],
    screenOverrides: {
      [SCREEN_ID]: {
        clipId: OVERRIDE_CLIP_ID,
        generatorId: null,
        generatorVariant: null,
      },
    },
  };
}

function withSetlist(
  state: VjStageState,
  setlistId: string,
  setlistIndex: number | null,
  playback: Partial<VjSetlistPlayback> = {},
): VjStageState {
  return {
    ...state,
    activeSetlistId: setlistId,
    setlistIndex,
    setlistPlayback: { ...createVjSetlistPlayback(false), ...playback },
  };
}

/** A running step: started 2 s ago, 6 s left of 8 s. */
const RUNNING_CLOCK: Partial<VjSetlistPlayback> = {
  status: "playing",
  stepStartedAt: NOW - 2_000,
  stepEndsAt: NOW + 6_000,
  stepDurationMs: SEQUENCE_DEFAULT_MS,
  pausedRemainingMs: null,
};

/** The set list at `index` with the playback of a running step on its item. */
function playingAt(index: number, itemId: string): VjStageState {
  return withSetlist(busyState(), SETLIST_ID, index, {
    ...RUNNING_CLOCK,
    itemId,
    isFlashConfirmed: true,
  });
}

function nextStateOf(outcome: VjDemoCommandOutcome): VjStageState {
  if ("error" in outcome) throw new Error(`refused: ${outcome.error}`);
  return outcome.next;
}

function errorOf(outcome: VjDemoCommandOutcome): string | null {
  return "error" in outcome ? outcome.error : null;
}

/** One command through the dispatcher, the takeover included. */
function command(
  state: VjStageState,
  name: VjCommandFrameName,
  payload: Record<string, unknown>,
  context: VjDemoSetlistCommandContext = contextOf(),
): VjStageCommandResult {
  return applyVjStageCommand(state, name, payload, context);
}

type AcceptedResult = Exclude<VjStageCommandResult, { error: unknown }>;

function acceptedOf(result: VjStageCommandResult): AcceptedResult {
  if ("error" in result) throw new Error(`refused: ${result.error}`);
  return result;
}

/** The accepted state with its clock stamped at `stampAt`, as the landing does. */
function landedState(
  result: VjStageCommandResult,
  stampAt = NOW,
): VjStageState {
  const accepted = acceptedOf(result);
  return {
    ...accepted.state,
    setlistPlayback: stampVjSetlistClock(
      accepted.state.setlistPlayback,
      accepted.setlistClock,
      stampAt,
    ),
  };
}

function errorCodeOf(result: VjStageCommandResult): string | null {
  return "error" in result ? result.error : null;
}

describe("recallVjSceneLook", () => {
  it("recall replaces the look and keeps pack, blackout, tempo, shuffle, countdown, logo, card and overrides", () => {
    const state = withSetlist(busyState(), SETLIST_ID, 0);
    const next = nextStateOf(recallVjSceneLook(state, CLIP_LOOK));
    expect(next.effects.speed).toBe(2);
    expect(next.effects.settings).toEqual(CLIP_LOOK.effects.settings);
    expect(next.transition).toEqual(CLIP_LOOK.transition);
    expect(next.overlay).toEqual({ ...CLIP_LOOK.overlay, hideAt: null });
    expect(next.mix).toEqual({
      clipId: MIX_CLIP_ID,
      amount: 0.4,
      blendMode: "screen",
    });
    expect(next.activePackId).toBe(PACK_ID);
    expect(next.effects.isBlackout).toBe(true);
    expect(next.effects.isStrobing).toBe(true);
    expect(next.effects.strobeStartedAt).toBe(state.effects.strobeStartedAt);
    expect(next.tempo).toEqual(state.tempo);
    expect(next.shuffle).toEqual(state.shuffle);
    expect(next.countdown).toEqual(state.countdown);
    expect(next.logo).toEqual(state.logo);
    expect(next.eventCard).toEqual(state.eventCard);
    expect(next.screenOverrides).toEqual(state.screenOverrides);
    expect(next.activeSetlistId).toBe(SETLIST_ID);
    expect(next.setlistIndex).toBe(0);
  });

  it("a clip source goes live lowercased, grows the sequence and leads the history", () => {
    const outcome = recallVjSceneLook(busyState(), CLIP_LOOK);
    const next = nextStateOf(outcome);
    expect(next.liveClipId).toBe(SCENE_CLIP_ID);
    expect(next.liveGeneratorId).toBeNull();
    expect(next.clipSequence).toBe(8);
    expect(next.recentClipIds).toEqual([SCENE_CLIP_ID, LIVE_CLIP_ID]);
    expect(outcome).toMatchObject({
      isAlwaysChange: true,
      stamps: { isLiveSourceSet: true, overlayHideAfterMs: null },
    });
  });

  it("a generator source clears the clip", () => {
    const next = nextStateOf(recallVjSceneLook(busyState(), GENERATOR_LOOK));
    expect(next.liveClipId).toBeNull();
    expect(next.liveGeneratorId).toBe("plasma");
    expect(next.liveGeneratorVariant).toBeNull();
    expect(next.clipSequence).toBe(8);
  });

  it("a look without a source keeps the live clip", () => {
    const state = busyState();
    const outcome = recallVjSceneLook(state, SOURCELESS_LOOK);
    const next = nextStateOf(outcome);
    expect(next.liveClipId).toBe(LIVE_CLIP_ID);
    expect(next.clipSequence).toBe(state.clipSequence);
    expect(next.liveSince).toBe(state.liveSince);
    expect(outcome).toMatchObject({
      isAlwaysChange: false,
      stamps: { isLiveSourceSet: false, overlayHideAfterMs: null },
    });
  });

  it("copies the effect settings so the state never shares an entry with the look", () => {
    const next = nextStateOf(recallVjSceneLook(busyState(), CLIP_LOOK));
    expect(next.effects.settings.invert).not.toBe(
      CLIP_LOOK.effects.settings.invert,
    );
  });
});

describe("applyRecallScene codes in check order", () => {
  it("answers vj_scene_not_found for a malformed id, even with isImmediate", () => {
    const outcome = applyRecallScene(
      busyState(),
      { sceneId: "scene-1", isImmediate: true },
      contextOf(),
    );
    expect(errorOf(outcome)).toBe("vj_scene_not_found");
  });

  it("checks isImmediate before reading the scene", () => {
    const outcome = applyRecallScene(
      busyState(),
      { sceneId: UNKNOWN_ID, isImmediate: true },
      contextOf(),
    );
    expect(errorOf(outcome)).toBe("vj_immediate_not_allowed");
  });

  it("answers vj_effect_flag_invalid for a non-boolean isImmediate", () => {
    const outcome = applyRecallScene(
      busyState(),
      { sceneId: CLIP_SCENE_ID, isImmediate: "yes" },
      contextOf(),
    );
    expect(errorOf(outcome)).toBe("vj_effect_flag_invalid");
  });

  it("answers vj_scene_not_found for an id no scene has", () => {
    const outcome = applyRecallScene(
      busyState(),
      { sceneId: UNKNOWN_ID },
      contextOf(),
    );
    expect(errorOf(outcome)).toBe("vj_scene_not_found");
  });

  it("recalls a scene whose id was sent in capitals", () => {
    const next = nextStateOf(
      applyRecallScene(
        busyState(),
        { sceneId: CLIP_SCENE_ID.toUpperCase() },
        contextOf(),
      ),
    );
    expect(next.liveClipId).toBe(SCENE_CLIP_ID);
  });

  it("is a look switch through the dispatcher and a noop when the look is already up", () => {
    const recalled = nextStateOf(
      recallVjSceneLook(busyState(), SOURCELESS_LOOK),
    );
    const result = applyVjStageCommand(
      recalled,
      "stage:recallScene",
      { sceneId: SOURCELESS_SCENE_ID },
      contextOf(),
    );
    expect(result).toMatchObject({ isNoop: true, isLookSwitch: true });
  });
});

describe("applySetlistSelect codes in check order", () => {
  it("answers vj_setlist_not_found for a malformed or absent set list id", () => {
    const context = contextOf();
    expect(
      errorOf(
        applySetlistSelect(busyState(), { setlistId: "x", index: 0 }, context),
      ),
    ).toBe("vj_setlist_not_found");
    expect(
      errorOf(applySetlistSelect(busyState(), { index: null }, context)),
    ).toBe("vj_setlist_not_found");
  });

  it("answers vj_setlist_index_invalid for a negative, fractional, text, absent or over-limit index", () => {
    const context = contextOf();
    for (const index of [
      -1,
      1.5,
      "0",
      undefined,
      VJ_LIMITS.setlistItemsMax,
      3_000_000_000,
    ]) {
      const outcome = applySetlistSelect(
        busyState(),
        { setlistId: SETLIST_ID, index },
        context,
      );
      expect(errorOf(outcome)).toBe("vj_setlist_index_invalid");
    }
  });

  it("answers vj_setlist_index_invalid for an index with a null set list", () => {
    const outcome = applySetlistSelect(
      busyState(),
      { setlistId: null, index: 0 },
      contextOf(),
    );
    expect(errorOf(outcome)).toBe("vj_setlist_index_invalid");
  });

  it("answers vj_effect_flag_invalid for a non-boolean isPlaying or isFlashConfirmed", () => {
    for (const flags of [{ isPlaying: "yes" }, { isFlashConfirmed: 1 }]) {
      const outcome = applySetlistSelect(
        busyState(),
        { setlistId: SETLIST_ID, index: 0, ...flags },
        contextOf(),
      );
      expect(errorOf(outcome)).toBe("vj_effect_flag_invalid");
    }
  });

  it("answers vj_setlist_none for a null set list with isPlaying true", () => {
    const outcome = applySetlistSelect(
      busyState(),
      { setlistId: null, index: null, isPlaying: true },
      contextOf(),
    );
    expect(errorOf(outcome)).toBe("vj_setlist_none");
  });

  it("checks isImmediate before reading the set list", () => {
    const outcome = applySetlistSelect(
      busyState(),
      { setlistId: UNKNOWN_ID, index: 0, isImmediate: true },
      contextOf(),
    );
    expect(errorOf(outcome)).toBe("vj_immediate_not_allowed");
  });

  it("answers vj_setlist_not_found for an id no set list has", () => {
    const outcome = applySetlistSelect(
      busyState(),
      { setlistId: UNKNOWN_ID, index: null },
      contextOf(),
    );
    expect(errorOf(outcome)).toBe("vj_setlist_not_found");
  });

  it("select with an index, or Play, on an empty set list answers vj_setlist_empty", () => {
    for (const payload of [
      { setlistId: EMPTY_SETLIST_ID, index: 0 },
      { setlistId: EMPTY_SETLIST_ID, index: null, isPlaying: true },
    ]) {
      expect(
        errorOf(applySetlistSelect(busyState(), payload, contextOf())),
      ).toBe("vj_setlist_empty");
    }
  });

  it("answers vj_setlist_index_invalid for an index past the last step", () => {
    const outcome = applySetlistSelect(
      busyState(),
      { setlistId: SETLIST_ID, index: 3 },
      contextOf(),
    );
    expect(errorOf(outcome)).toBe("vj_setlist_index_invalid");
  });

  it("Play on a flashing step without confirmation answers vj_setlist_flash_unconfirmed, even when the run before had it", () => {
    const confirmedRun = withSetlist(busyState(), FLASH_SETLIST_ID, 0, {
      ...RUNNING_CLOCK,
      itemId: ITEM_D,
      isFlashConfirmed: true,
    });
    const outcome = applySetlistSelect(
      confirmedRun,
      { setlistId: FLASH_SETLIST_ID, index: 1, isPlaying: true },
      contextOf(),
    );
    expect(errorOf(outcome)).toBe("vj_setlist_flash_unconfirmed");
  });
});

describe("design 13.1: Play and Step through on a row", () => {
  it("Play recalls step 1 by default, plays it and turns shuffle off", () => {
    const result = command(busyState(), "stage:setlistSelect", {
      setlistId: SETLIST_ID.toUpperCase(),
      index: null,
      isPlaying: true,
    });
    const accepted = acceptedOf(result);
    expect(accepted.isLookSwitch).toBe(true);
    expect(accepted.setlistClock).toEqual({
      kind: "start",
      durationMs: SEQUENCE_DEFAULT_MS,
      remainingMs: SEQUENCE_DEFAULT_MS,
    });
    const landed = landedState(result);
    expect(landed.activeSetlistId).toBe(SETLIST_ID);
    expect(landed.setlistIndex).toBe(0);
    expect(landed.liveClipId).toBe(SCENE_CLIP_ID);
    expect(landed.overlay.hideAt).toBeNull();
    expect(landed.shuffle.isOn).toBe(false);
    expect(landed.setlistPlayback).toEqual({
      status: "playing",
      itemId: ITEM_A,
      isFlashConfirmed: false,
      stepStartedAt: NOW,
      stepEndsAt: NOW + SEQUENCE_DEFAULT_MS,
      stepDurationMs: SEQUENCE_DEFAULT_MS,
      pausedRemainingMs: null,
      isLooping: false,
    });
  });

  it("Play at a clip step changes only the live source: hideAt, pack and effects stay", () => {
    const state = busyState();
    const result = command(state, "stage:setlistSelect", {
      setlistId: SETLIST_ID,
      index: 1,
      isPlaying: true,
    });
    const accepted = acceptedOf(result);
    expect(accepted.isLookSwitch).toBe(true);
    expect(accepted.stamps).toMatchObject({
      isLiveSourceSet: true,
      overlayHideAfterMs: undefined,
    });
    const landed = landedState(result);
    expect(landed.liveClipId).toBe(STEP_CLIP_ID);
    expect(landed.clipSequence).toBe(state.clipSequence + 1);
    expect(landed.recentClipIds[0]).toBe(STEP_CLIP_ID);
    expect(landed.overlay).toEqual(state.overlay);
    expect(landed.effects).toEqual(state.effects);
    expect(landed.transition).toEqual(state.transition);
    expect(landed.mix).toEqual(state.mix);
    expect(landed.activePackId).toBe(PACK_ID);
    expect(landed.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: ITEM_B,
      stepEndsAt: NOW + SEQUENCE_DEFAULT_MS,
    });
  });

  it("Play on a beats step runs its length at the state tempo", () => {
    const landed = landedState(
      command(busyState(), "stage:setlistSelect", {
        setlistId: SETLIST_ID,
        index: 2,
        isPlaying: true,
      }),
    );
    expect(landed.liveGeneratorId).toBe("plasma");
    expect(landed.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: ITEM_C,
      stepDurationMs: SIXTEEN_BEATS_MS,
      stepEndsAt: NOW + SIXTEEN_BEATS_MS,
    });
  });

  it("Play with confirmation plays a flashing step and stores the flag for the run", () => {
    const landed = landedState(
      command(busyState(), "stage:setlistSelect", {
        setlistId: FLASH_SETLIST_ID,
        index: 1,
        isPlaying: true,
        isFlashConfirmed: true,
      }),
    );
    expect(landed.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: ITEM_E,
      isFlashConfirmed: true,
    });
  });

  it("Play from any status starts a fresh run, Loop copied from the set list", () => {
    const takenOver = withSetlist(busyState(), SETLIST_ID, 2, {
      status: "takenOver",
      itemId: ITEM_C,
      isFlashConfirmed: true,
      stepDurationMs: 4_000,
    });
    const landed = landedState(
      command(
        takenOver,
        "stage:setlistSelect",
        { setlistId: SETLIST_ID, index: 0, isPlaying: true },
        contextOf({ loopingSetlistIds: new Set([SETLIST_ID]) }),
      ),
    );
    expect(landed.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: ITEM_A,
      isFlashConfirmed: false,
      isLooping: true,
      stepDurationMs: SEQUENCE_DEFAULT_MS,
    });
  });

  it("Step through recalls the step by hand: manual, no clock", () => {
    const running = playingAt(2, ITEM_C);
    const result = command(running, "stage:setlistSelect", {
      setlistId: SETLIST_ID,
      index: 0,
    });
    expect(acceptedOf(result).setlistClock).toEqual({ kind: "clear" });
    const landed = landedState(result);
    expect(landed.setlistIndex).toBe(0);
    expect(landed.liveClipId).toBe(SCENE_CLIP_ID);
    expect(landed.shuffle.isOn).toBe(true);
    expect(landed.setlistPlayback).toEqual({
      ...createVjSetlistPlayback(false),
      itemId: ITEM_A,
    });
  });

  it("a null index arms the set list, keeps the look and shows nothing", () => {
    const state = busyState();
    const result = command(
      state,
      "stage:setlistSelect",
      { setlistId: EMPTY_SETLIST_ID.toUpperCase(), index: null },
      contextOf({ loopingSetlistIds: new Set([EMPTY_SETLIST_ID]) }),
    );
    const accepted = acceptedOf(result);
    expect(accepted.isLookSwitch).toBe(false);
    expect(accepted.stamps).toMatchObject({
      isLiveSourceSet: false,
      overlayHideAfterMs: undefined,
    });
    const landed = landedState(result);
    expect(landed.activeSetlistId).toBe(EMPTY_SETLIST_ID);
    expect(landed.setlistIndex).toBeNull();
    expect(landed.overlay).toEqual(state.overlay);
    expect(landed.setlistPlayback).toEqual(createVjSetlistPlayback(true));
  });

  it("Stop clears the selection and puts the playback back to the default, the look kept", () => {
    const running = playingAt(1, ITEM_B);
    const result = command(running, "stage:setlistSelect", {
      setlistId: null,
      index: null,
    });
    const accepted = acceptedOf(result);
    expect(accepted.isLookSwitch).toBe(false);
    const landed = landedState(result);
    expect(landed.activeSetlistId).toBeNull();
    expect(landed.setlistIndex).toBeNull();
    expect(landed.setlistPlayback).toEqual(createVjSetlistPlayback(false));
    expect(landed.liveClipId).toBe(running.liveClipId);
  });

  it("the select hands its read on for the stage's item ids", () => {
    const accepted = acceptedOf(
      command(busyState(), "stage:setlistSelect", {
        setlistId: SETLIST_ID,
        index: 0,
      }),
    );
    expect(accepted.setlistReads[0]?.itemIds).toEqual([ITEM_A, ITEM_B, ITEM_C]);
  });
});

describe("applySetlistNext and applySetlistPrevious codes in check order", () => {
  it("answers vj_setlist_none with no active set list, even with isImmediate", () => {
    expect(
      errorOf(
        applySetlistNext(busyState(), contextOf(), { isImmediate: true }),
      ),
    ).toBe("vj_setlist_none");
    expect(errorOf(applySetlistPrevious(busyState(), contextOf()))).toBe(
      "vj_setlist_none",
    );
  });

  it("checks isImmediate before reading the set list, at step 1 too", () => {
    for (const index of [0, 1]) {
      const state = withSetlist(busyState(), UNKNOWN_ID, index);
      expect(
        errorOf(applySetlistNext(state, contextOf(), { isImmediate: true })),
      ).toBe("vj_immediate_not_allowed");
      expect(
        errorOf(
          applySetlistPrevious(state, contextOf(), { isImmediate: true }),
        ),
      ).toBe("vj_immediate_not_allowed");
    }
  });

  it("answers vj_setlist_not_found once the set list is gone", () => {
    const state = withSetlist(busyState(), UNKNOWN_ID, 1);
    expect(errorOf(applySetlistNext(state, contextOf()))).toBe(
      "vj_setlist_not_found",
    );
    expect(errorOf(applySetlistPrevious(state, contextOf()))).toBe(
      "vj_setlist_not_found",
    );
  });

  it("answers vj_setlist_empty for an emptied set list, armed or not", () => {
    for (const index of [null, 2]) {
      const state = withSetlist(busyState(), EMPTY_SETLIST_ID, index);
      expect(errorOf(applySetlistNext(state, contextOf()))).toBe(
        "vj_setlist_empty",
      );
      expect(errorOf(applySetlistPrevious(state, contextOf()))).toBe(
        "vj_setlist_empty",
      );
    }
  });

  it("with Loop off Next answers vj_setlist_end at the last step and Previous vj_setlist_start at step 1 or armed", () => {
    expect(
      errorOf(
        applySetlistNext(withSetlist(busyState(), SETLIST_ID, 2), contextOf()),
      ),
    ).toBe("vj_setlist_end");
    for (const index of [0, null]) {
      expect(
        errorOf(
          applySetlistPrevious(
            withSetlist(busyState(), SETLIST_ID, index),
            contextOf(),
          ),
        ),
      ).toBe("vj_setlist_start");
    }
  });

  it("answers vj_setlist_index_invalid when Previous targets past a shortened set list", () => {
    const state = withSetlist(busyState(), SETLIST_ID, 4);
    expect(errorOf(applySetlistPrevious(state, contextOf()))).toBe(
      "vj_setlist_index_invalid",
    );
  });

  it("with Loop on Next wraps from the last step to step 1 and Previous from step 1 to the last", () => {
    const looping = { isLooping: true };
    const context = contextOf({ loopingSetlistIds: new Set([SETLIST_ID]) });
    const wrappedNext = nextStateOf(
      applySetlistNext(
        withSetlist(busyState(), SETLIST_ID, 2, looping),
        context,
      ),
    );
    expect(wrappedNext.setlistIndex).toBe(0);
    expect(wrappedNext.setlistPlayback.itemId).toBe(ITEM_A);
    const wrappedPrevious = nextStateOf(
      applySetlistPrevious(
        withSetlist(busyState(), SETLIST_ID, 0, looping),
        context,
      ),
    );
    expect(wrappedPrevious.setlistIndex).toBe(2);
    expect(wrappedPrevious.setlistPlayback.itemId).toBe(ITEM_C);
  });

  it("Next from an armed set list shows step 1", () => {
    const outcome = applySetlistNext(
      withSetlist(busyState(), SETLIST_ID, null),
      contextOf(),
    );
    const next = nextStateOf(outcome);
    expect(next.setlistIndex).toBe(0);
    expect(next.liveClipId).toBe(SCENE_CLIP_ID);
    expect(outcome).toMatchObject({
      isLookSwitch: true,
      stamps: { isLiveSourceSet: true, overlayHideAfterMs: null },
    });
  });

  it("answers vj_effect_flag_invalid for a non-boolean isFlashConfirmed, before isImmediate", () => {
    const state = withSetlist(busyState(), FLASH_SETLIST_ID, 0, {
      itemId: ITEM_D,
    });
    for (const isFlashConfirmed of ["true", 1, null]) {
      expect(
        errorOf(applySetlistNext(state, contextOf(), { isFlashConfirmed })),
      ).toBe("vj_effect_flag_invalid");
      expect(
        errorOf(
          applySetlistPrevious(state, contextOf(), {
            isFlashConfirmed,
            isImmediate: true,
          }),
        ),
      ).toBe("vj_effect_flag_invalid");
    }
    expect(
      errorOf(
        applySetlistNext(busyState(), contextOf(), { isFlashConfirmed: 1 }),
      ),
    ).toBe("vj_setlist_none");
  });

  it("Next and Previous refuse a flashing step nobody confirmed", () => {
    const beforeFlash = withSetlist(busyState(), FLASH_SETLIST_ID, 0, {
      itemId: ITEM_D,
    });
    expect(errorOf(applySetlistNext(beforeFlash, contextOf()))).toBe(
      "vj_setlist_flash_unconfirmed",
    );
    expect(
      errorOf(
        applySetlistNext(beforeFlash, contextOf(), {
          isFlashConfirmed: false,
        }),
      ),
    ).toBe("vj_setlist_flash_unconfirmed");
    const pastFlash = withSetlist(busyState(), FLASH_SETLIST_ID, 2, {
      status: "paused",
    });
    expect(errorOf(applySetlistPrevious(pastFlash, contextOf()))).toBe(
      "vj_setlist_flash_unconfirmed",
    );
  });

  it("Next lands a flashing step the tap confirmed", () => {
    const state = withSetlist(busyState(), FLASH_SETLIST_ID, 0, {
      itemId: ITEM_D,
    });
    const next = nextStateOf(
      applySetlistNext(state, contextOf(), { isFlashConfirmed: true }),
    );
    expect(next.setlistPlayback.itemId).toBe(ITEM_E);
    expect(next.setlistPlayback.isFlashConfirmed).toBe(false);
    expect(next.effects.settings.invert?.isOn).toBe(true);
  });

  it("Next lands a flashing step the stored run flag confirmed", () => {
    const state = withSetlist(busyState(), FLASH_SETLIST_ID, 0, {
      itemId: ITEM_D,
      isFlashConfirmed: true,
    });
    const next = nextStateOf(applySetlistNext(state, contextOf()));
    expect(next.setlistPlayback.itemId).toBe(ITEM_E);
    expect(next.effects.settings.invert?.isOn).toBe(true);
  });

  it("the dispatcher refuses isImmediate after the rule", () => {
    expect(
      command(withSetlist(busyState(), SETLIST_ID, null), "stage:setlistNext", {
        isImmediate: true,
      }),
    ).toEqual({ error: "vj_immediate_not_allowed" });
  });
});

describe("design 13.1: Next and Previous by status", () => {
  it("playing: the new step shows and its clock restarts at full length", () => {
    const result = command(playingAt(0, ITEM_A), "stage:setlistNext", {});
    expect(acceptedOf(result).isLookSwitch).toBe(true);
    const landed = landedState(result, NOW + 100);
    expect(landed.liveClipId).toBe(STEP_CLIP_ID);
    expect(landed.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: ITEM_B,
      stepStartedAt: NOW + 100,
      stepEndsAt: NOW + 100 + SEQUENCE_DEFAULT_MS,
      stepDurationMs: SEQUENCE_DEFAULT_MS,
      isFlashConfirmed: true,
    });
  });

  it("playing: Previous onto a beats step restarts the clock at its length", () => {
    const state = withSetlist(busyState(), SETLIST_ID, 0, {
      ...RUNNING_CLOCK,
      itemId: ITEM_A,
      isLooping: true,
    });
    const landed = landedState(
      command(
        state,
        "stage:setlistPrevious",
        {},
        contextOf({ loopingSetlistIds: new Set([SETLIST_ID]) }),
      ),
    );
    expect(landed.setlistIndex).toBe(2);
    expect(landed.setlistPlayback).toMatchObject({
      status: "playing",
      stepDurationMs: SIXTEEN_BEATS_MS,
      stepEndsAt: NOW + SIXTEEN_BEATS_MS,
    });
  });

  it("manual: the new step shows and stays manual with no clock", () => {
    const state = withSetlist(busyState(), SETLIST_ID, 0, { itemId: ITEM_A });
    const result = command(state, "stage:setlistNext", {});
    expect(acceptedOf(result).setlistClock).toEqual({ kind: "clear" });
    const landed = landedState(result);
    expect(landed.setlistIndex).toBe(1);
    expect(landed.setlistPlayback).toMatchObject({
      status: "manual",
      itemId: ITEM_B,
      stepStartedAt: null,
      stepEndsAt: null,
    });
  });

  it("paused, takenOver, finished and needsFlashConsent: the new step waits paused with its full length", () => {
    for (const status of [
      "paused",
      "takenOver",
      "finished",
      "needsFlashConsent",
    ] as const) {
      const state = withSetlist(busyState(), SETLIST_ID, 1, {
        status,
        itemId: ITEM_B,
        stepDurationMs: SEQUENCE_DEFAULT_MS,
        pausedRemainingMs: status === "paused" ? 3_000 : null,
      });
      expect(state.shuffle.isOn).toBe(true);
      const landed = landedState(command(state, "stage:setlistNext", {}));
      expect(landed.setlistIndex).toBe(2);
      expect(landed.shuffle.isOn).toBe(false);
      expect(landed.liveGeneratorId).toBe("plasma");
      expect(landed.setlistPlayback).toMatchObject({
        status: "paused",
        itemId: ITEM_C,
        stepStartedAt: null,
        stepEndsAt: null,
        stepDurationMs: SIXTEEN_BEATS_MS,
        pausedRemainingMs: SIXTEEN_BEATS_MS,
      });
    }
  });
});

describe("applySetlistSetPlaying codes in check order", () => {
  it("answers vj_effect_flag_invalid for an absent or non-boolean isPlaying, or a non-boolean isFlashConfirmed", () => {
    const state = playingAt(0, ITEM_A);
    for (const payload of [
      {},
      { isPlaying: "true" },
      { isPlaying: true, isFlashConfirmed: "yes" },
    ]) {
      expect(
        errorCodeOf(command(state, "stage:setlistSetPlaying", payload)),
      ).toBe("vj_effect_flag_invalid");
    }
  });

  it("checks isImmediate before the state rule", () => {
    expect(
      errorCodeOf(
        command(busyState(), "stage:setlistSetPlaying", {
          isPlaying: true,
          isImmediate: true,
        }),
      ),
    ).toBe("vj_immediate_not_allowed");
  });

  it("answers vj_setlist_none with no active set list", () => {
    expect(
      errorCodeOf(
        command(busyState(), "stage:setlistSetPlaying", { isPlaying: false }),
      ),
    ).toBe("vj_setlist_none");
  });

  it("Play answers vj_setlist_not_found, vj_setlist_empty and vj_setlist_index_invalid from the read", () => {
    const gone = withSetlist(busyState(), UNKNOWN_ID, 0, {
      status: "finished",
    });
    const empty = withSetlist(busyState(), EMPTY_SETLIST_ID, null);
    const shortened = withSetlist(busyState(), SETLIST_ID, 5);
    expect(
      errorCodeOf(
        command(gone, "stage:setlistSetPlaying", { isPlaying: true }),
      ),
    ).toBe("vj_setlist_not_found");
    expect(
      errorCodeOf(
        command(empty, "stage:setlistSetPlaying", { isPlaying: true }),
      ),
    ).toBe("vj_setlist_empty");
    expect(
      errorCodeOf(
        command(shortened, "stage:setlistSetPlaying", { isPlaying: true }),
      ),
    ).toBe("vj_setlist_index_invalid");
  });
});

describe("design 13.1: Play, Pause, Resume and Play again", () => {
  it("manual: Play restarts the step on screen at full length, showing nothing new", () => {
    const state = withSetlist(busyState(), SETLIST_ID, 2, { itemId: ITEM_C });
    const result = command(state, "stage:setlistSetPlaying", {
      isPlaying: true,
    });
    const accepted = acceptedOf(result);
    expect(accepted.isLookSwitch).toBe(false);
    expect(accepted.setlistClock).toEqual({
      kind: "start",
      durationMs: SIXTEEN_BEATS_MS,
      remainingMs: SIXTEEN_BEATS_MS,
    });
    const landed = landedState(result);
    expect(landed.liveClipId).toBe(state.liveClipId);
    expect(landed.clipSequence).toBe(state.clipSequence);
    expect(landed.shuffle.isOn).toBe(false);
    expect(landed.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: ITEM_C,
      stepEndsAt: NOW + SIXTEEN_BEATS_MS,
    });
  });

  it("manual with no index: Play recalls step 1", () => {
    const state = withSetlist(busyState(), SETLIST_ID, null);
    const result = command(state, "stage:setlistSetPlaying", {
      isPlaying: true,
    });
    expect(acceptedOf(result).isLookSwitch).toBe(true);
    const landed = landedState(result);
    expect(landed.setlistIndex).toBe(0);
    expect(landed.liveClipId).toBe(SCENE_CLIP_ID);
    expect(landed.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: ITEM_A,
    });
  });

  it("playing: Pause stores the time left and stops the clock, the step stays", () => {
    const state = playingAt(1, ITEM_B);
    const result = command(state, "stage:setlistSetPlaying", {
      isPlaying: false,
    });
    const accepted = acceptedOf(result);
    expect(accepted.isLookSwitch).toBe(false);
    expect(accepted.setlistClock).toEqual({ kind: "clear" });
    const landed = landedState(result);
    expect(landed.liveClipId).toBe(state.liveClipId);
    expect(landed.setlistPlayback).toMatchObject({
      status: "paused",
      itemId: ITEM_B,
      stepStartedAt: null,
      stepEndsAt: null,
      stepDurationMs: SEQUENCE_DEFAULT_MS,
      pausedRemainingMs: 6_000,
    });
  });

  it("paused: Resume runs the time left, the full length kept for the ring", () => {
    const paused = withSetlist(busyState(), SETLIST_ID, 1, {
      status: "paused",
      itemId: ITEM_B,
      stepDurationMs: SEQUENCE_DEFAULT_MS,
      pausedRemainingMs: 6_000,
    });
    const result = command(paused, "stage:setlistSetPlaying", {
      isPlaying: true,
    });
    expect(acceptedOf(result)).toMatchObject({
      isLookSwitch: false,
      setlistClock: {
        kind: "start",
        durationMs: SEQUENCE_DEFAULT_MS,
        remainingMs: 6_000,
      },
    });
    const landed = landedState(result);
    expect(landed.shuffle.isOn).toBe(false);
    expect(landed.setlistPlayback).toMatchObject({
      status: "playing",
      stepEndsAt: NOW + 6_000,
      stepStartedAt: NOW + 6_000 - SEQUENCE_DEFAULT_MS,
      stepDurationMs: SEQUENCE_DEFAULT_MS,
      pausedRemainingMs: null,
    });
  });
});

describe("design 13.1: Resume after a takeover, Play again and the flash consent", () => {
  it("takenOver: Resume plays the next step", () => {
    const takenOver = withSetlist(busyState(), SETLIST_ID, 0, {
      status: "takenOver",
      itemId: ITEM_A,
    });
    const result = command(takenOver, "stage:setlistSetPlaying", {
      isPlaying: true,
    });
    expect(acceptedOf(result).isLookSwitch).toBe(true);
    const landed = landedState(result);
    expect(landed.setlistIndex).toBe(1);
    expect(landed.liveClipId).toBe(STEP_CLIP_ID);
    expect(landed.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: ITEM_B,
      stepEndsAt: NOW + SEQUENCE_DEFAULT_MS,
    });
  });

  it("takenOver at the last step: Resume plays step 1, Loop off or on", () => {
    for (const isLooping of [false, true]) {
      const takenOver = withSetlist(busyState(), SETLIST_ID, 2, {
        status: "takenOver",
        itemId: ITEM_C,
        isLooping,
      });
      const landed = landedState(
        command(
          takenOver,
          "stage:setlistSetPlaying",
          { isPlaying: true },
          contextOf({
            loopingSetlistIds: new Set(isLooping ? [SETLIST_ID] : []),
          }),
        ),
      );
      expect(landed.setlistIndex).toBe(0);
      expect(landed.setlistPlayback).toMatchObject({
        status: "playing",
        itemId: ITEM_A,
        isLooping,
      });
    }
  });

  it("finished: Play again plays step 1", () => {
    const finished = withSetlist(busyState(), SETLIST_ID, 2, {
      status: "finished",
      itemId: ITEM_C,
    });
    const landed = landedState(
      command(finished, "stage:setlistSetPlaying", { isPlaying: true }),
    );
    expect(landed.setlistIndex).toBe(0);
    expect(landed.liveClipId).toBe(SCENE_CLIP_ID);
    expect(landed.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: ITEM_A,
    });
  });

  it("needsFlashConsent: Resume without confirmation answers vj_setlist_flash_unconfirmed", () => {
    const waiting = withSetlist(busyState(), FLASH_SETLIST_ID, 0, {
      status: "needsFlashConsent",
      itemId: ITEM_D,
    });
    expect(
      errorCodeOf(
        command(waiting, "stage:setlistSetPlaying", { isPlaying: true }),
      ),
    ).toBe("vj_setlist_flash_unconfirmed");
  });

  it("needsFlashConsent: Resume with confirmation recalls the flashing step and stores the flag", () => {
    const waiting = withSetlist(busyState(), FLASH_SETLIST_ID, 0, {
      status: "needsFlashConsent",
      itemId: ITEM_D,
    });
    const landed = landedState(
      command(waiting, "stage:setlistSetPlaying", {
        isPlaying: true,
        isFlashConfirmed: true,
      }),
    );
    expect(landed.setlistIndex).toBe(1);
    expect(landed.effects.settings.invert?.isOn).toBe(true);
    expect(landed.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: ITEM_E,
      isFlashConfirmed: true,
    });
  });

  it("Skip the flashing step reuses Play at an index with the flag false", () => {
    const waiting = withSetlist(busyState(), FLASH_SETLIST_ID, 0, {
      status: "needsFlashConsent",
      itemId: ITEM_D,
    });
    const landed = landedState(
      command(waiting, "stage:setlistSelect", {
        setlistId: FLASH_SETLIST_ID,
        index: 0,
        isPlaying: true,
        isFlashConfirmed: false,
      }),
    );
    expect(landed.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: ITEM_D,
      isFlashConfirmed: false,
    });
  });

  it("Pause from any status but playing, and Play while playing, are accepted noops", () => {
    for (const status of [
      "manual",
      "paused",
      "takenOver",
      "finished",
      "needsFlashConsent",
    ] as const) {
      const state = withSetlist(busyState(), SETLIST_ID, 1, {
        status,
        itemId: ITEM_B,
        stepDurationMs: status === "paused" ? SEQUENCE_DEFAULT_MS : null,
        pausedRemainingMs: status === "paused" ? 1_000 : null,
      });
      const result = command(state, "stage:setlistSetPlaying", {
        isPlaying: false,
      });
      expect(landedState(result)).toEqual(state);
    }
    const playing = playingAt(1, ITEM_B);
    expect(
      acceptedOf(
        command(playing, "stage:setlistSetPlaying", { isPlaying: true }),
      ),
    ).toMatchObject({ isNoop: true });
  });
});

describe("design 13.1: a manual pick takes a running sequence over", () => {
  /** A state with shuffle off, the mix holding a clip, and the playback given. */
  function runningState(playback: Partial<VjSetlistPlayback>): VjStageState {
    const state = busyState();
    return withSetlist(
      {
        ...state,
        shuffle: { ...state.shuffle, isOn: false },
        mix: { clipId: MIX_CLIP_ID, amount: 0.5, blendMode: "screen" },
      },
      SETLIST_ID,
      1,
      { itemId: ITEM_B, isFlashConfirmed: true, isLooping: true, ...playback },
    );
  }

  const TAKEOVER_COMMANDS: ReadonlyArray<{
    name: VjCommandFrameName;
    payload: Record<string, unknown>;
  }> = [
    { name: "stage:goClip", payload: { clipId: STEP_CLIP_ID } },
    { name: "stage:goGenerator", payload: { generatorId: "plasma" } },
    { name: "stage:setPack", payload: { packId: OTHER_PACK_ID } },
    { name: "stage:swapMix", payload: {} },
    { name: "stage:recallScene", payload: { sceneId: CALM_SCENE_ID } },
    { name: "stage:recallScene", payload: { sceneId: SOURCELESS_SCENE_ID } },
    { name: "stage:setShuffle", payload: { isOn: true } },
  ];

  const TAKEN_OVER_STATUSES = [
    { status: "playing", ...RUNNING_CLOCK },
    {
      status: "paused",
      stepDurationMs: SEQUENCE_DEFAULT_MS,
      pausedRemainingMs: 2_000,
    },
    { status: "needsFlashConsent", stepDurationMs: SEQUENCE_DEFAULT_MS },
  ] as const;

  it("playing, paused and needsFlashConsent become takenOver: clock cleared, step data kept", () => {
    for (const { name, payload } of TAKEOVER_COMMANDS) {
      for (const playback of TAKEN_OVER_STATUSES) {
        const state = runningState(playback);
        const landed = landedState(command(state, name, payload));
        expect(landed.setlistIndex).toBe(1);
        expect(landed.activeSetlistId).toBe(SETLIST_ID);
        expect(landed.setlistPlayback).toEqual({
          status: "takenOver",
          itemId: ITEM_B,
          isFlashConfirmed: true,
          stepStartedAt: null,
          stepEndsAt: null,
          stepDurationMs: null,
          pausedRemainingMs: null,
          isLooping: true,
        });
      }
    }
  });

  it("manual, takenOver and finished never change", () => {
    for (const { name, payload } of TAKEOVER_COMMANDS) {
      for (const status of ["manual", "takenOver", "finished"] as const) {
        const state = runningState({ status, stepDurationMs: 4_000 });
        const landed = landedState(command(state, name, payload));
        expect(landed.setlistPlayback).toEqual(state.setlistPlayback);
      }
    }
  });

  it("a command that moves nothing live keeps the run going", () => {
    const state = runningState(RUNNING_CLOCK);
    for (const { name, payload } of [
      { name: "stage:setPack", payload: { packId: PACK_ID } },
      { name: "stage:setShuffle", payload: { isOn: false } },
      { name: "stage:setTransition", payload: { mode: "cut" } },
      { name: "stage:setEffects", payload: { speed: 2 } },
    ] as const) {
      const landed = landedState(command(state, name, payload));
      expect(landed.setlistPlayback).toEqual(state.setlistPlayback);
    }
  });
});

describe("applySetlistSetLooping", () => {
  it("answers vj_effect_flag_invalid, then isImmediate, then vj_setlist_none, before any write", () => {
    const writeSetlistLooping = vi.fn<VjDemoSetlistLoopingWrite>(() => null);
    const context = contextOf({ writeSetlistLooping });
    const active = withSetlist(busyState(), SETLIST_ID, 0);
    expect(
      errorCodeOf(command(active, "stage:setlistSetLooping", {}, context)),
    ).toBe("vj_effect_flag_invalid");
    expect(
      errorCodeOf(
        command(
          active,
          "stage:setlistSetLooping",
          { isLooping: true, isImmediate: true },
          context,
        ),
      ),
    ).toBe("vj_immediate_not_allowed");
    expect(
      errorCodeOf(
        command(
          busyState(),
          "stage:setlistSetLooping",
          { isLooping: true },
          context,
        ),
      ),
    ).toBe("vj_setlist_none");
    expect(writeSetlistLooping).not.toHaveBeenCalled();
  });

  it("saves Loop on the active set list, then lands the Loop copy with the clock kept", () => {
    const writeSetlistLooping = vi.fn<VjDemoSetlistLoopingWrite>(() => null);
    const state = playingAt(1, ITEM_B);
    const result = command(
      state,
      "stage:setlistSetLooping",
      { isLooping: true },
      contextOf({ writeSetlistLooping }),
    );
    expect(writeSetlistLooping).toHaveBeenCalledWith(SETLIST_ID, true);
    const accepted = acceptedOf(result);
    expect(accepted).toMatchObject({
      isLookSwitch: false,
      setlistClock: { kind: "keep" },
    });
    expect(landedState(result).setlistPlayback).toEqual({
      ...state.setlistPlayback,
      isLooping: true,
    });
  });

  it("a failed write refuses with its code and lands nothing", () => {
    for (const code of ["vj_setlist_not_found", "vj_server_error"] as const) {
      const result = command(
        playingAt(1, ITEM_B),
        "stage:setlistSetLooping",
        { isLooping: true },
        contextOf({ writeSetlistLooping: () => code }),
      );
      expect(result).toEqual({ error: code });
    }
  });

  it("the same Loop again is an accepted noop", () => {
    const state = withSetlist(busyState(), SETLIST_ID, 0, { isLooping: true });
    expect(
      acceptedOf(
        command(state, "stage:setlistSetLooping", { isLooping: true }),
      ),
    ).toMatchObject({ isNoop: true });
  });
});
