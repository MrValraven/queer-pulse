import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  VJ_LIMITS,
  type VjSceneLook,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type {
  VjDemoCommandContext,
  VjDemoCommandOutcome,
  VjDemoLibraryLookup,
} from "./vjDemoCommandKit";
import {
  applyRecallScene,
  applySetlistNext,
  applySetlistPrevious,
  applySetlistSelect,
  recallVjSceneLook,
} from "./vjDemoSceneCommands";
import { applyVjStageCommand } from "./vjDemoStageCommands";

const STAGE_EPOCH = "33333333-3333-4333-8333-333333333333";
const PACK_ID = "11111111-1111-4111-8111-1111111111a1";
const LIVE_CLIP_ID = "00000000-0000-4000-8000-0000000000c1";
const SCENE_CLIP_ID = "00000000-0000-4000-8000-0000000000c2";
const MIX_CLIP_ID = "00000000-0000-4000-8000-0000000000c3";
const OVERRIDE_CLIP_ID = "00000000-0000-4000-8000-0000000000c4";
const CLIP_SCENE_ID = "44444444-4444-4444-8444-4444444444a1";
const GENERATOR_SCENE_ID = "44444444-4444-4444-8444-4444444444a2";
const SOURCELESS_SCENE_ID = "44444444-4444-4444-8444-4444444444a3";
const UNKNOWN_ID = "44444444-4444-4444-8444-4444444444ff";
const SETLIST_ID = "55555555-5555-4555-8555-5555555555b1";
const EMPTY_SETLIST_ID = "55555555-5555-4555-8555-5555555555b2";
const SCREEN_ID = "66666666-6666-4666-8666-6666666666d1";
const NOW = 500_000;

/** A look with a clip source and every part away from its default. */
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

const SCENE_LOOKS: Record<string, VjSceneLook> = {
  [CLIP_SCENE_ID]: CLIP_LOOK,
  [GENERATOR_SCENE_ID]: GENERATOR_LOOK,
  [SOURCELESS_SCENE_ID]: SOURCELESS_LOOK,
};

const SETLIST_SCENE_IDS: Record<string, string[]> = {
  [SETLIST_ID]: [CLIP_SCENE_ID, GENERATOR_SCENE_ID],
  [EMPTY_SETLIST_ID]: [],
};

/** Answers like the demo store: null for an unknown set list, a null look
 *  past the last item or for a null index. */
function readSetlistItem(
  setlistId: string,
  index: number | null,
): ReturnType<VjDemoLibraryLookup["readSetlistItem"]> {
  const sceneIds = SETLIST_SCENE_IDS[setlistId];
  if (sceneIds === undefined) return null;
  const sceneId = index === null ? undefined : sceneIds[index];
  if (sceneId === undefined) {
    return { itemCount: sceneIds.length, sceneId: null, look: null };
  }
  return {
    itemCount: sceneIds.length,
    sceneId,
    look: SCENE_LOOKS[sceneId] ?? null,
  };
}

function demoLibrary(): VjDemoLibraryLookup {
  return {
    hasPack: () => true,
    hasClip: () => true,
    isClipInPack: () => true,
    readPackForStage: () => ({ eventId: null }),
    existingClipIds: (clipIds) => new Set(clipIds),
    clipIdsInPack: (_packId, clipIds) => new Set(clipIds),
    readPackClipForAdvance: () => ({ isFavorite: false }),
    readSceneLook: (sceneId) => SCENE_LOOKS[sceneId] ?? null,
    readSetlistItem,
    setlistItemCount: (setlistId) =>
      readSetlistItem(setlistId, null)?.itemCount ?? null,
  };
}

function contextOf(): VjDemoCommandContext {
  return {
    now: NOW,
    library: demoLibrary(),
    connectedScreenIds: new Set<string>(),
    isLeadMicOn: false,
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
): VjStageState {
  return { ...state, activeSetlistId: setlistId, setlistIndex };
}

function nextStateOf(outcome: VjDemoCommandOutcome): VjStageState {
  if ("error" in outcome) throw new Error(`refused: ${outcome.error}`);
  return outcome.next;
}

function errorOf(outcome: VjDemoCommandOutcome): string | null {
  return "error" in outcome ? outcome.error : null;
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

  it("select with an index on an empty set list answers vj_setlist_empty", () => {
    const outcome = applySetlistSelect(
      busyState(),
      { setlistId: EMPTY_SETLIST_ID, index: 0 },
      contextOf(),
    );
    expect(errorOf(outcome)).toBe("vj_setlist_empty");
  });

  it("answers vj_setlist_index_invalid for an index past the last item", () => {
    const outcome = applySetlistSelect(
      busyState(),
      { setlistId: SETLIST_ID, index: 2 },
      contextOf(),
    );
    expect(errorOf(outcome)).toBe("vj_setlist_index_invalid");
  });

  it("select null clears both", () => {
    const state = withSetlist(busyState(), SETLIST_ID, 1);
    const next = nextStateOf(
      applySetlistSelect(state, { setlistId: null, index: null }, contextOf()),
    );
    expect(next.activeSetlistId).toBeNull();
    expect(next.setlistIndex).toBeNull();
    expect(next.liveClipId).toBe(LIVE_CLIP_ID);
  });

  it("a null index arms the set list and keeps the look, an empty one included", () => {
    const state = busyState();
    const outcome = applySetlistSelect(
      state,
      { setlistId: EMPTY_SETLIST_ID.toUpperCase(), index: null },
      contextOf(),
    );
    const next = nextStateOf(outcome);
    expect(next.activeSetlistId).toBe(EMPTY_SETLIST_ID);
    expect(next.setlistIndex).toBeNull();
    expect(next.overlay).toEqual(state.overlay);
    expect(outcome).toMatchObject({
      stamps: { isLiveSourceSet: false, overlayHideAfterMs: undefined },
    });
  });

  it("an index recalls that item and sets the set list fields", () => {
    const next = nextStateOf(
      applySetlistSelect(
        busyState(),
        { setlistId: SETLIST_ID, index: 1 },
        contextOf(),
      ),
    );
    expect(next.liveGeneratorId).toBe("plasma");
    expect(next.activeSetlistId).toBe(SETLIST_ID);
    expect(next.setlistIndex).toBe(1);
    expect(next.overlay.hideAt).toBeNull();
  });
});

describe("applySetlistNext codes in check order", () => {
  it("answers vj_setlist_none with no active set list, even with isImmediate", () => {
    const outcome = applySetlistNext(busyState(), contextOf(), {
      isImmediate: true,
    });
    expect(errorOf(outcome)).toBe("vj_setlist_none");
  });

  it("checks isImmediate before reading the item", () => {
    const state = withSetlist(busyState(), SETLIST_ID, 1);
    const outcome = applySetlistNext(state, contextOf(), {
      isImmediate: true,
    });
    expect(errorOf(outcome)).toBe("vj_immediate_not_allowed");
  });

  it("answers vj_setlist_not_found once the set list is gone", () => {
    const state = withSetlist(busyState(), UNKNOWN_ID, null);
    expect(errorOf(applySetlistNext(state, contextOf()))).toBe(
      "vj_setlist_not_found",
    );
  });

  it("answers vj_setlist_empty for an armed empty set list", () => {
    const state = withSetlist(busyState(), EMPTY_SETLIST_ID, null);
    expect(errorOf(applySetlistNext(state, contextOf()))).toBe(
      "vj_setlist_empty",
    );
  });

  it("answers vj_setlist_end at the last item", () => {
    const state = withSetlist(busyState(), SETLIST_ID, 1);
    expect(errorOf(applySetlistNext(state, contextOf()))).toBe(
      "vj_setlist_end",
    );
  });

  it("next from an armed set list recalls item 0", () => {
    const state = withSetlist(busyState(), SETLIST_ID, null);
    const outcome = applySetlistNext(state, contextOf());
    const next = nextStateOf(outcome);
    expect(next.setlistIndex).toBe(0);
    expect(next.activeSetlistId).toBe(SETLIST_ID);
    expect(next.liveClipId).toBe(SCENE_CLIP_ID);
    expect(outcome).toMatchObject({
      isAlwaysChange: true,
      stamps: { isLiveSourceSet: true, overlayHideAfterMs: null },
    });
  });

  it("next from item 0 recalls item 1", () => {
    const state = withSetlist(busyState(), SETLIST_ID, 0);
    const next = nextStateOf(applySetlistNext(state, contextOf()));
    expect(next.setlistIndex).toBe(1);
    expect(next.liveGeneratorId).toBe("plasma");
  });

  it("is a look switch through the dispatcher, which refuses isImmediate", () => {
    const state = withSetlist(busyState(), SETLIST_ID, null);
    const context = contextOf();
    expect(
      applyVjStageCommand(state, "stage:setlistNext", {}, context),
    ).toMatchObject({ isNoop: false, isLookSwitch: true });
    expect(
      applyVjStageCommand(
        state,
        "stage:setlistNext",
        { isImmediate: true },
        context,
      ),
    ).toEqual({ error: "vj_immediate_not_allowed" });
  });
});

describe("applySetlistPrevious codes in check order", () => {
  it("answers vj_setlist_none with no active set list", () => {
    expect(errorOf(applySetlistPrevious(busyState(), contextOf()))).toBe(
      "vj_setlist_none",
    );
  });

  it("answers vj_setlist_start for an armed set list", () => {
    const state = withSetlist(busyState(), SETLIST_ID, null);
    expect(errorOf(applySetlistPrevious(state, contextOf()))).toBe(
      "vj_setlist_start",
    );
  });

  it("answers vj_setlist_empty for an armed empty set list and vj_setlist_not_found once it is gone", () => {
    const empty = withSetlist(busyState(), EMPTY_SETLIST_ID, null);
    expect(errorOf(applySetlistPrevious(empty, contextOf()))).toBe(
      "vj_setlist_empty",
    );
    const gone = withSetlist(busyState(), UNKNOWN_ID, null);
    expect(errorOf(applySetlistPrevious(gone, contextOf()))).toBe(
      "vj_setlist_not_found",
    );
  });

  it("previous at item 0 answers vj_setlist_start, even with isImmediate", () => {
    const state = withSetlist(busyState(), SETLIST_ID, 0);
    const outcome = applySetlistPrevious(state, contextOf(), {
      isImmediate: true,
    });
    expect(errorOf(outcome)).toBe("vj_setlist_start");
  });

  it("checks isImmediate before reading the item", () => {
    const state = withSetlist(busyState(), UNKNOWN_ID, 1);
    const outcome = applySetlistPrevious(state, contextOf(), {
      isImmediate: true,
    });
    expect(errorOf(outcome)).toBe("vj_immediate_not_allowed");
  });

  it("answers vj_setlist_not_found once the set list is gone", () => {
    const state = withSetlist(busyState(), UNKNOWN_ID, 1);
    expect(errorOf(applySetlistPrevious(state, contextOf()))).toBe(
      "vj_setlist_not_found",
    );
  });

  it("answers vj_setlist_empty once the set list was emptied", () => {
    const state = withSetlist(busyState(), EMPTY_SETLIST_ID, 2);
    expect(errorOf(applySetlistPrevious(state, contextOf()))).toBe(
      "vj_setlist_empty",
    );
  });

  it("answers vj_setlist_index_invalid when the target is past a shortened set list", () => {
    const state = withSetlist(busyState(), SETLIST_ID, 3);
    expect(errorOf(applySetlistPrevious(state, contextOf()))).toBe(
      "vj_setlist_index_invalid",
    );
  });

  it("previous from item 1 recalls item 0", () => {
    const state = withSetlist(busyState(), SETLIST_ID, 1);
    const next = nextStateOf(applySetlistPrevious(state, contextOf()));
    expect(next.setlistIndex).toBe(0);
    expect(next.liveClipId).toBe(SCENE_CLIP_ID);
  });
});
