import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  type VjLibraryChange,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjDemoLibraryLookup } from "./vjDemoCommandKit";
import { applyVjDemoLibraryChange } from "./vjDemoLibraryEffects";

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

/** A library whose only answer that matters is the set list item count. */
function libraryWithCount(itemCount: number | null): VjDemoLibraryLookup {
  return {
    hasPack: () => false,
    hasClip: () => false,
    isClipInPack: () => false,
    readPackForStage: () => null,
    existingClipIds: () => new Set<string>(),
    clipIdsInPack: () => new Set<string>(),
    readPackClipForAdvance: () => null,
    readSceneLook: () => null,
    readSetlistItem: () => null,
    setlistItemCount: () => itemCount,
  };
}

const LIBRARY = libraryWithCount(4);

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

  it("clears the active set list on setlist_deleted", () => {
    const state = stageState();
    expect(
      applyVjDemoLibraryChange(
        state,
        libraryChange("setlist_deleted", {
          setlistId: SETLIST_ID,
          setlistIds: [SETLIST_ID],
        }),
        LIBRARY,
      ),
    ).toEqual({ ...state, activeSetlistId: null, setlistIndex: null });
  });

  it("nulls the index when setlist_items_changed shrinks the active set list past it", () => {
    const state = stageState();
    const change = libraryChange("setlist_items_changed", {
      setlistId: SETLIST_ID,
      setlistIds: [SETLIST_ID],
    });
    expect(
      applyVjDemoLibraryChange(state, change, libraryWithCount(3)),
    ).toEqual({ ...state, setlistIndex: null });
    expect(applyVjDemoLibraryChange(state, change, libraryWithCount(4))).toBe(
      state,
    );
  });

  it("nulls the index when a scene delete lists the active set list", () => {
    const state = stageState();
    const change = libraryChange("scene_deleted", {
      sceneId: SCENE_ID,
      setlistIds: [SETLIST_ID],
    });
    expect(
      applyVjDemoLibraryChange(state, change, libraryWithCount(2)),
    ).toEqual({ ...state, setlistIndex: null });
    expect(
      applyVjDemoLibraryChange(state, change, libraryWithCount(null)),
    ).toEqual({ ...state, activeSetlistId: null, setlistIndex: null });
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
