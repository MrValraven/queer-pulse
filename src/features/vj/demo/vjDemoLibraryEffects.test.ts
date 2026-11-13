import { describe, expect, it } from "vitest";
import {
  createVjSetlistPlayback,
  createVjStageState,
  type VjLibraryChange,
  type VjSetlistFollowRead,
  type VjSetlistPlayback,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjDemoLibraryLookup } from "./vjDemoCommandKit";
import {
  applyVjDemoLibraryChange,
  readVjDemoSetlistFollows,
  vjDemoLibraryChangeState,
} from "./vjDemoLibraryEffects";

const STAGE_EPOCH = "11111111-1111-4111-8111-111111111111";
const NOW = 1_800_000_000_000;
const PACK_ID = "44444444-4444-4444-8444-444444444444";
const OTHER_PACK_ID = "88888888-8888-4888-8888-888888888888";
const CLIP_ID = "22222222-2222-4222-8222-222222222222";
const OTHER_CLIP_ID = "33333333-3333-4333-8333-333333333333";
const SCREEN_ID = "99999999-9999-4999-8999-999999999999";
const OTHER_SCREEN_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const SETLIST_ID = "77777777-7777-4777-8777-777777777777";
const OTHER_SETLIST_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const SCENE_ID = "66666666-6666-4666-8666-666666666666";
const EVENT_ID = "55555555-5555-4555-8555-555555555555";
const ITEM_A = "c0000000-0000-4000-8000-0000000000a1";
const ITEM_B = "c0000000-0000-4000-8000-0000000000a2";
const ITEM_C = "c0000000-0000-4000-8000-0000000000a3";
const ITEM_D = "c0000000-0000-4000-8000-0000000000a4";
const ITEM_X = "c0000000-0000-4000-8000-0000000000a9";
const OLD_ITEM_IDS = [ITEM_A, ITEM_B, ITEM_C, ITEM_D];

/** A library whose only answer that matters is the set list follow read. */
function libraryWithFollow(
  read: VjSetlistFollowRead | null,
): VjDemoLibraryLookup {
  return {
    hasPack: () => false,
    hasClip: () => false,
    isClipInPack: () => false,
    readPackForStage: () => null,
    existingClipIds: () => new Set<string>(),
    clipIdsInPack: () => new Set<string>(),
    readPackClipForAdvance: () => null,
    readSceneLook: () => null,
    readSetlist: () => null,
    readSetlistFollow: () => read,
  };
}

const LIBRARY = libraryWithFollow({ itemIds: OLD_ITEM_IDS, isLooping: false });

function libraryChange(
  kind: VjLibraryChange["kind"],
  fields: Partial<VjLibraryChange> = {},
): VjLibraryChange {
  return {
    kind,
    packId: null,
    clipId: null,
    packIds: [],
    sceneId: null,
    setlistId: null,
    setlistIds: [],
    eventId: null,
    ...fields,
  };
}

function stageState(overrides: Partial<VjStageState> = {}): VjStageState {
  const base = createVjStageState(STAGE_EPOCH, NOW);
  return {
    ...base,
    revision: 5,
    clipSequence: 3,
    activePackId: PACK_ID,
    liveClipId: CLIP_ID,
    liveSince: NOW - 10_000,
    eventCard: { isVisible: true, kind: "qr" },
    mix: { clipId: CLIP_ID, amount: 0.6, blendMode: "multiply" },
    shuffle: {
      ...base.shuffle,
      isOn: true,
      excludedClipIds: [CLIP_ID, OTHER_CLIP_ID],
    },
    recentClipIds: [CLIP_ID, OTHER_CLIP_ID],
    screenOverrides: {
      [SCREEN_ID]: {
        clipId: CLIP_ID,
        generatorId: null,
        generatorVariant: null,
      },
      [OTHER_SCREEN_ID]: {
        clipId: OTHER_CLIP_ID,
        generatorId: null,
        generatorVariant: null,
      },
    },
    activeSetlistId: SETLIST_ID,
    setlistIndex: 3,
    ...overrides,
  };
}

describe("applyVjDemoLibraryChange", () => {
  it("clears the active pack, the shuffle, its exclusions and the event card on pack_deleted", () => {
    const state = stageState();
    const next = applyVjDemoLibraryChange(
      state,
      libraryChange("pack_deleted", { packId: PACK_ID.toUpperCase() }),
      LIBRARY,
    );
    expect(next).toEqual({
      ...state,
      activePackId: null,
      clipSequence: 4,
      shuffle: { ...state.shuffle, isOn: false, excludedClipIds: [] },
      eventCard: { isVisible: false, kind: "qr" },
    });
    expect(next.liveClipId).toBe(CLIP_ID);
    expect(
      applyVjDemoLibraryChange(
        state,
        libraryChange("pack_deleted", { packId: OTHER_PACK_ID }),
        LIBRARY,
      ),
    ).toBe(state);
  });

  it("clears the live clip, the mix, overrides, history and skipped entries on clip_deleted", () => {
    const state = stageState();
    const next = applyVjDemoLibraryChange(
      state,
      libraryChange("clip_deleted", { clipId: CLIP_ID, packIds: [PACK_ID] }),
      LIBRARY,
    );
    expect(next).toEqual({
      ...state,
      liveClipId: null,
      liveSince: null,
      clipSequence: 4,
      mix: { clipId: null, amount: 0, blendMode: "multiply" },
      screenOverrides: {
        [OTHER_SCREEN_ID]: state.screenOverrides[OTHER_SCREEN_ID],
      },
      recentClipIds: [OTHER_CLIP_ID],
      shuffle: { ...state.shuffle, excludedClipIds: [OTHER_CLIP_ID] },
    });
  });

  it("keeps a live generator and the sequence when the deleted clip is only in the history", () => {
    const state = stageState({
      liveClipId: null,
      liveGeneratorId: "plasma",
      mix: { clipId: null, amount: 0, blendMode: "normal" },
      screenOverrides: {},
      shuffle: { ...stageState().shuffle, excludedClipIds: [] },
    });
    const next = applyVjDemoLibraryChange(
      state,
      libraryChange("clip_deleted", { clipId: CLIP_ID.toUpperCase() }),
      LIBRARY,
    );
    expect(next).toEqual({ ...state, recentClipIds: [OTHER_CLIP_ID] });
    expect(next.clipSequence).toBe(3);
    expect(next.liveSince).toBe(NOW - 10_000);
  });

  it("hides the event card when the active pack unlinks its event", () => {
    const state = stageState();
    expect(
      applyVjDemoLibraryChange(
        state,
        libraryChange("pack_event_changed", { packId: PACK_ID, eventId: null }),
        LIBRARY,
      ),
    ).toEqual({ ...state, eventCard: { isVisible: false, kind: "qr" } });
    expect(
      applyVjDemoLibraryChange(
        state,
        libraryChange("pack_event_changed", {
          packId: PACK_ID,
          eventId: EVENT_ID,
        }),
        LIBRARY,
      ),
    ).toBe(state);
    expect(
      applyVjDemoLibraryChange(
        state,
        libraryChange("pack_event_changed", {
          packId: OTHER_PACK_ID,
          eventId: null,
        }),
        LIBRARY,
      ),
    ).toBe(state);
  });

  it("clears the active set list on setlist_deleted, the playback back to the default", () => {
    const state = stageState({
      setlistPlayback: {
        ...createVjSetlistPlayback(true),
        status: "playing",
        itemId: ITEM_D,
        stepStartedAt: NOW - 1_000,
        stepEndsAt: NOW + 7_000,
        stepDurationMs: 8_000,
      },
    });
    expect(
      applyVjDemoLibraryChange(
        state,
        libraryChange("setlist_deleted", {
          setlistId: SETLIST_ID,
          setlistIds: [SETLIST_ID],
        }),
        LIBRARY,
      ),
    ).toEqual({
      ...state,
      activeSetlistId: null,
      setlistIndex: null,
      setlistPlayback: createVjSetlistPlayback(false),
    });
  });

  it("keeps skipped ids that left the pack after pack_clips_changed", () => {
    const state = stageState();
    expect(
      applyVjDemoLibraryChange(
        state,
        libraryChange("pack_clips_changed", {
          packId: PACK_ID,
          packIds: [PACK_ID],
        }),
        LIBRARY,
      ),
    ).toBe(state);
  });

  it("an unrelated change returns the same object", () => {
    const state = stageState();
    expect(
      applyVjDemoLibraryChange(
        state,
        libraryChange("clip_deleted", { clipId: SCENE_ID }),
        LIBRARY,
      ),
    ).toBe(state);
    expect(
      applyVjDemoLibraryChange(
        state,
        libraryChange("setlist_deleted", {
          setlistId: OTHER_SETLIST_ID,
          setlistIds: [OTHER_SETLIST_ID],
        }),
        LIBRARY,
      ),
    ).toBe(state);
    expect(
      applyVjDemoLibraryChange(
        state,
        libraryChange("scene_updated", { sceneId: SCENE_ID }),
        LIBRARY,
      ),
    ).toBe(state);
  });
});

/** Step C on screen at index 2 of the old list [A, B, C, D]. */
function onStep(
  index: number | null,
  playback: Partial<VjSetlistPlayback> = {},
): VjStageState {
  return stageState({
    setlistIndex: index,
    setlistPlayback: { ...createVjSetlistPlayback(false), ...playback },
  });
}

const ITEMS_CHANGED = libraryChange("setlist_items_changed", {
  setlistId: SETLIST_ID,
  setlistIds: [SETLIST_ID],
});

function followed(
  state: VjStageState,
  itemIds: string[],
  change: VjLibraryChange = ITEMS_CHANGED,
  previousItemIds: readonly string[] | null = OLD_ITEM_IDS,
): VjStageState {
  return applyVjDemoLibraryChange(
    state,
    change,
    libraryWithFollow({ itemIds, isLooping: false }),
    previousItemIds,
  );
}

describe("the active set list follows its items (sequences contract 7)", () => {
  it("follows the worked cases of the contract table", () => {
    const onC = onStep(2, { itemId: ITEM_C });
    const cases: Array<{
      state: VjStageState;
      itemIds: string[];
      index: number | null;
      itemId: string | null;
    }> = [
      {
        state: onC,
        itemIds: [ITEM_C, ITEM_A, ITEM_B, ITEM_D],
        index: 0,
        itemId: ITEM_C,
      },
      {
        state: onC,
        itemIds: [ITEM_B, ITEM_C, ITEM_D],
        index: 1,
        itemId: ITEM_C,
      },
      { state: onC, itemIds: [ITEM_A, ITEM_B, ITEM_D], index: 1, itemId: null },
      { state: onC, itemIds: [ITEM_A, ITEM_D], index: 0, itemId: null },
      {
        state: onStep(0, { itemId: ITEM_A }),
        itemIds: [ITEM_B, ITEM_C, ITEM_D],
        index: null,
        itemId: null,
      },
      {
        state: onC,
        itemIds: [ITEM_A, ITEM_B, ITEM_C, ITEM_X, ITEM_D],
        index: 2,
        itemId: ITEM_C,
      },
    ];
    for (const { state, itemIds, index, itemId } of cases) {
      const next = followed(state, itemIds);
      expect(next.setlistIndex).toBe(index);
      expect(next.setlistPlayback.itemId).toBe(itemId);
    }
  });

  it("an index anchored on the old list follows an insert when the item id is gone", () => {
    const next = followed(
      onStep(0, { itemId: null }),
      [ITEM_A, ITEM_X, ITEM_C, ITEM_D],
      ITEMS_CHANGED,
      [ITEM_A, ITEM_C, ITEM_D],
    );
    expect(next.setlistIndex).toBe(0);
    expect(next.setlistPlayback.itemId).toBeNull();
  });

  it("the step removed while playing keeps its clock running", () => {
    const running: Partial<VjSetlistPlayback> = {
      status: "playing",
      itemId: ITEM_C,
      stepStartedAt: NOW - 1_000,
      stepEndsAt: NOW + 7_000,
      stepDurationMs: 8_000,
    };
    const next = followed(onStep(2, running), [ITEM_A, ITEM_B, ITEM_D]);
    expect(next.setlistIndex).toBe(1);
    expect(next.setlistPlayback).toEqual({
      ...createVjSetlistPlayback(false),
      ...running,
      itemId: null,
    });
  });

  it("an emptied set list stays selected, manual, with no index and no clock", () => {
    const next = followed(
      onStep(2, {
        status: "playing",
        itemId: ITEM_C,
        stepStartedAt: NOW - 1_000,
        stepEndsAt: NOW + 7_000,
        stepDurationMs: 8_000,
      }),
      [],
    );
    expect(next.activeSetlistId).toBe(SETLIST_ID);
    expect(next.setlistIndex).toBeNull();
    expect(next.setlistPlayback).toEqual(createVjSetlistPlayback(false));
  });

  it("with the old ids unknown, a removed item clamps to the step before", () => {
    const next = followed(
      onStep(2, { itemId: ITEM_X }),
      [ITEM_A, ITEM_B],
      ITEMS_CHANGED,
      null,
    );
    expect(next.setlistIndex).toBe(1);
    expect(next.setlistPlayback.itemId).toBeNull();
  });
});

describe("the follow after scene, clip and set list changes (sequences contract 5.9)", () => {
  it("a scene delete naming the set list follows like an item edit", () => {
    const change = libraryChange("scene_deleted", {
      sceneId: SCENE_ID,
      setlistIds: [SETLIST_ID],
    });
    const next = followed(
      onStep(2, { itemId: ITEM_C }),
      [ITEM_A, ITEM_B, ITEM_D],
      change,
    );
    expect(next.setlistIndex).toBe(1);
    expect(next.setlistPlayback.itemId).toBeNull();
  });

  it("a clip delete runs the clip effects, then follows when it names the active set list", () => {
    const change = libraryChange("clip_deleted", {
      clipId: CLIP_ID,
      packIds: [PACK_ID],
      setlistIds: [SETLIST_ID],
    });
    const next = followed(
      onStep(2, { itemId: ITEM_B }),
      [ITEM_A, ITEM_C, ITEM_D],
      change,
    );
    expect(next.liveClipId).toBeNull();
    expect(next.setlistIndex).toBe(0);
    expect(next.setlistPlayback.itemId).toBeNull();
  });

  it("setlist_updated copies the saved Loop onto the playback", () => {
    const change = libraryChange("setlist_updated", {
      setlistId: SETLIST_ID,
      setlistIds: [SETLIST_ID],
    });
    const state = onStep(2, { itemId: ITEM_C });
    const next = applyVjDemoLibraryChange(
      state,
      change,
      libraryWithFollow({ itemIds: OLD_ITEM_IDS, isLooping: true }),
      OLD_ITEM_IDS,
    );
    expect(next).toEqual({
      ...state,
      setlistPlayback: { ...state.setlistPlayback, isLooping: true },
    });
  });

  it("a set list gone before its follow read clears the selection and the playback", () => {
    const state = onStep(2, {
      status: "paused",
      itemId: ITEM_C,
      stepDurationMs: 8_000,
      pausedRemainingMs: 1_000,
    });
    const next = applyVjDemoLibraryChange(
      state,
      ITEMS_CHANGED,
      libraryWithFollow(null),
      OLD_ITEM_IDS,
    );
    expect(next).toEqual({
      ...state,
      activeSetlistId: null,
      setlistIndex: null,
      setlistPlayback: createVjSetlistPlayback(false),
    });
  });

  it("an edit of another set list, or a follow kind with no read, changes nothing", () => {
    const state = onStep(2, { itemId: ITEM_C });
    const otherChange = libraryChange("setlist_items_changed", {
      setlistId: OTHER_SETLIST_ID,
      setlistIds: [OTHER_SETLIST_ID],
    });
    expect(followed(state, [], otherChange)).toBe(state);
    expect(
      vjDemoLibraryChangeState(
        state,
        ITEMS_CHANGED,
        new Map(),
        OLD_ITEM_IDS,
        NOW,
      ),
    ).toBeNull();
  });

  it("an unchanged follow answers null, so nothing lands", () => {
    const state = onStep(2, { itemId: ITEM_C });
    expect(
      vjDemoLibraryChangeState(
        state,
        ITEMS_CHANGED,
        new Map([[SETLIST_ID, { itemIds: OLD_ITEM_IDS, isLooping: false }]]),
        OLD_ITEM_IDS,
        NOW,
      ),
    ).toBeNull();
  });

  it("reads the active set list only for a follow kind that names it", () => {
    const state = onStep(2, { itemId: ITEM_C });
    const read = { itemIds: OLD_ITEM_IDS, isLooping: false };
    const library = libraryWithFollow(read);
    expect(readVjDemoSetlistFollows(state, ITEMS_CHANGED, library)).toEqual(
      new Map([[SETLIST_ID, read]]),
    );
    expect(
      readVjDemoSetlistFollows(
        state,
        libraryChange("setlist_deleted", { setlistId: SETLIST_ID }),
        library,
      ).size,
    ).toBe(0);
    // The gateway reads the ids `setlistIds` lists, never `setlistId` alone.
    expect(
      readVjDemoSetlistFollows(
        state,
        libraryChange("setlist_items_changed", {
          setlistId: SETLIST_ID,
          setlistIds: [],
        }),
        library,
      ).size,
    ).toBe(0);
    expect(
      readVjDemoSetlistFollows(
        state,
        libraryChange("scene_deleted", {
          sceneId: SCENE_ID,
          setlistIds: [SETLIST_ID.toUpperCase()],
        }),
        library,
      ),
    ).toEqual(new Map([[SETLIST_ID, read]]));
    expect(
      readVjDemoSetlistFollows(
        stageState({ activeSetlistId: null, setlistIndex: null }),
        ITEMS_CHANGED,
        library,
      ).size,
    ).toBe(0);
  });
});

describe("a clip delete that empties the frame of a playing step", () => {
  it("ends the clock of a playing step at now when the delete empties its frame and removes its item", () => {
    const state = onStep(2, {
      status: "playing",
      itemId: ITEM_C,
      isFlashConfirmed: true,
      stepStartedAt: NOW - 2_000,
      stepEndsAt: NOW + 6_000,
      stepDurationMs: 8_000,
    });
    const change = libraryChange("clip_deleted", {
      clipId: CLIP_ID,
      setlistIds: [SETLIST_ID],
    });
    const later = NOW + 1_500;
    const next = applyVjDemoLibraryChange(
      state,
      change,
      libraryWithFollow({
        itemIds: [ITEM_A, ITEM_B, ITEM_D],
        isLooping: false,
      }),
      OLD_ITEM_IDS,
      later,
    );
    expect(next.liveClipId).toBeNull();
    expect(next.setlistIndex).toBe(1);
    expect(next.setlistPlayback).toEqual({
      ...state.setlistPlayback,
      itemId: null,
      stepStartedAt: later - 8_000,
      stepEndsAt: later,
      stepDurationMs: 8_000,
    });
    const clock = next.setlistPlayback;
    expect((clock.stepEndsAt ?? 0) - (clock.stepStartedAt ?? 0)).toBe(
      clock.stepDurationMs,
    );
  });

  it("keeps the step clock when the delete keeps the step item, leaves the live clip, or the run is paused", () => {
    const state = onStep(2, {
      status: "playing",
      itemId: ITEM_C,
      isFlashConfirmed: true,
      stepStartedAt: NOW - 2_000,
      stepEndsAt: NOW + 6_000,
      stepDurationMs: 8_000,
    });
    const change = libraryChange("clip_deleted", {
      clipId: CLIP_ID,
      setlistIds: [SETLIST_ID],
    });
    const later = NOW + 1_500;
    const keptItem = applyVjDemoLibraryChange(
      state,
      change,
      libraryWithFollow({
        itemIds: [ITEM_A, ITEM_C, ITEM_D],
        isLooping: false,
      }),
      OLD_ITEM_IDS,
      later,
    );
    expect(keptItem.setlistPlayback).toEqual(state.setlistPlayback);

    const keptLive = applyVjDemoLibraryChange(
      { ...state, liveClipId: OTHER_CLIP_ID },
      change,
      libraryWithFollow({
        itemIds: [ITEM_A, ITEM_B, ITEM_D],
        isLooping: false,
      }),
      OLD_ITEM_IDS,
      later,
    );
    expect(keptLive.setlistPlayback).toEqual({
      ...state.setlistPlayback,
      itemId: null,
    });

    const paused = onStep(2, {
      status: "paused",
      itemId: ITEM_C,
      stepStartedAt: null,
      stepEndsAt: null,
      stepDurationMs: 8_000,
      pausedRemainingMs: 6_000,
    });
    const keptPaused = applyVjDemoLibraryChange(
      paused,
      change,
      libraryWithFollow({
        itemIds: [ITEM_A, ITEM_B, ITEM_D],
        isLooping: false,
      }),
      OLD_ITEM_IDS,
      later,
    );
    expect(keptPaused.setlistPlayback).toEqual({
      ...paused.setlistPlayback,
      itemId: null,
    });
  });
});
