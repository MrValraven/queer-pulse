import { describe, expect, it } from "vitest";
import {
  createVjSetlistPlayback,
  createVjStageState,
  DEFAULT_VJ_STEP_DURATION,
  type VjSetlistDTO,
  type VjSetlistItemDTO,
  type VjSetlistPlaybackStatus,
  type VjStageState,
} from "../../../../shared/contracts/vj";
import { vjNextUpOf, type VjNextUpInput } from "./vjNextUp";

const SCENE_STEP_A: VjSetlistItemDTO = {
  id: "item-1",
  position: 0,
  kind: "scene",
  sceneId: "scene-a",
  clipId: null,
  duration: null,
};
const CLIP_STEP_B: VjSetlistItemDTO = {
  id: "item-2",
  position: 1,
  kind: "clip",
  sceneId: null,
  clipId: "clip-b",
  duration: { kind: "beats", value: 16 },
};
const SCENE_STEP_C: VjSetlistItemDTO = {
  id: "item-3",
  position: 2,
  kind: "scene",
  sceneId: "scene-c",
  clipId: null,
  duration: null,
};

const SETLIST: VjSetlistDTO = {
  id: "setlist-1",
  name: "Main set",
  position: 0,
  isLooping: false,
  stepDuration: DEFAULT_VJ_STEP_DURATION,
  items: [SCENE_STEP_A, CLIP_STEP_B, SCENE_STEP_C],
  createdBy: null,
  createdAt: "2026-11-06T00:00:00.000Z",
  updatedAt: "2026-11-06T00:00:00.000Z",
};

function stateWith(overrides: Partial<VjStageState>): VjStageState {
  return { ...createVjStageState("epoch-1", 0), ...overrides };
}

function activeStateWith(
  setlistIndex: number | null,
  options: {
    isLooping?: boolean;
    status?: VjSetlistPlaybackStatus;
    isShuffleOn?: boolean;
  } = {},
): VjStageState {
  const baseState = createVjStageState("epoch-1", 0);
  return stateWith({
    activeSetlistId: SETLIST.id,
    setlistIndex,
    setlistPlayback: {
      ...createVjSetlistPlayback(options.isLooping ?? false),
      status: options.status ?? "manual",
    },
    shuffle: { ...baseState.shuffle, isOn: options.isShuffleOn ?? false },
  });
}

const SHUFFLE_ON_STATE = stateWith({
  shuffle: { ...createVjStageState("epoch-1", 0).shuffle, isOn: true },
});

function inputWith(overrides: Partial<VjNextUpInput>): VjNextUpInput {
  return {
    isCueMode: false,
    armedClipId: null,
    state: stateWith({}),
    leadNextClipId: null,
    activeSetlist: null,
    ...overrides,
  };
}

describe("vjNextUpOf", () => {
  it("cue wins over the sequence and shuffle", () => {
    const nextUp = vjNextUpOf(
      inputWith({
        isCueMode: true,
        armedClipId: "clip-cued",
        state: activeStateWith(0, { isShuffleOn: true }),
        leadNextClipId: "clip-shuffled",
        activeSetlist: SETLIST,
      }),
    );
    expect(nextUp).toEqual({ kind: "cue", clipId: "clip-cued" });
  });

  it("an armed clip outside cue mode is skipped", () => {
    const nextUp = vjNextUpOf(
      inputWith({ isCueMode: false, armedClipId: "clip-cued" }),
    );
    expect(nextUp).toEqual({ kind: "none" });
  });

  it("shows the next clip step and its position", () => {
    const nextUp = vjNextUpOf(
      inputWith({ state: activeStateWith(0), activeSetlist: SETLIST }),
    );
    expect(nextUp).toEqual({
      kind: "setlist",
      item: CLIP_STEP_B,
      position: 2,
      total: 3,
    });
  });

  it("shows the next scene step and its position", () => {
    const nextUp = vjNextUpOf(
      inputWith({
        state: activeStateWith(1, { status: "playing" }),
        activeSetlist: SETLIST,
      }),
    );
    expect(nextUp).toEqual({
      kind: "setlist",
      item: SCENE_STEP_C,
      position: 3,
      total: 3,
    });
  });

  it("an armed sequence with nothing recalled shows step 1", () => {
    const nextUp = vjNextUpOf(
      inputWith({ state: activeStateWith(null), activeSetlist: SETLIST }),
    );
    expect(nextUp).toEqual({
      kind: "setlist",
      item: SCENE_STEP_A,
      position: 1,
      total: 3,
    });
  });

  it("wraps to step 1 at the last step with Loop on", () => {
    const nextUp = vjNextUpOf(
      inputWith({
        state: activeStateWith(2, { isLooping: true, status: "playing" }),
        activeSetlist: SETLIST,
      }),
    );
    expect(nextUp).toEqual({
      kind: "setlist",
      item: SCENE_STEP_A,
      position: 1,
      total: 3,
    });
  });

  it("reads Last step at the last step with Loop off, even with shuffle on", () => {
    const nextUp = vjNextUpOf(
      inputWith({
        state: activeStateWith(2, { isShuffleOn: true }),
        leadNextClipId: "clip-shuffled",
        activeSetlist: SETLIST,
      }),
    );
    expect(nextUp).toEqual({ kind: "setlistLast" });
  });

  it("after a takeover at the last step without Loop it shows step 1, which Resume plays", () => {
    const nextUp = vjNextUpOf(
      inputWith({
        state: activeStateWith(2, { status: "takenOver" }),
        activeSetlist: SETLIST,
      }),
    );
    expect(nextUp).toEqual({
      kind: "setlist",
      item: SCENE_STEP_A,
      position: 1,
      total: 3,
    });
  });

  it("after a takeover mid sequence it shows the next step", () => {
    const nextUp = vjNextUpOf(
      inputWith({
        state: activeStateWith(0, { status: "takenOver" }),
        activeSetlist: SETLIST,
      }),
    );
    expect(nextUp).toEqual({
      kind: "setlist",
      item: CLIP_STEP_B,
      position: 2,
      total: 3,
    });
  });

  it("a finished sequence falls through to shuffle", () => {
    const nextUp = vjNextUpOf(
      inputWith({
        state: activeStateWith(2, { status: "finished", isShuffleOn: true }),
        leadNextClipId: "clip-shuffled",
        activeSetlist: SETLIST,
      }),
    );
    expect(nextUp).toEqual({ kind: "shuffle", clipId: "clip-shuffled" });
  });

  it("an empty sequence says nothing", () => {
    const nextUp = vjNextUpOf(
      inputWith({
        state: activeStateWith(null, { isLooping: true }),
        activeSetlist: { ...SETLIST, items: [] },
      }),
    );
    expect(nextUp).toEqual({ kind: "none" });
  });

  it("a loaded set list that is not the active one says nothing", () => {
    const nextUp = vjNextUpOf(
      inputWith({
        state: { ...activeStateWith(0), activeSetlistId: "setlist-other" },
        activeSetlist: SETLIST,
      }),
    );
    expect(nextUp).toEqual({ kind: "none" });
  });

  it("shuffle uses the lead screen's next clip", () => {
    const nextUp = vjNextUpOf(
      inputWith({ state: SHUFFLE_ON_STATE, leadNextClipId: "clip-shuffled" }),
    );
    expect(nextUp).toEqual({ kind: "shuffle", clipId: "clip-shuffled" });
  });

  it("nothing next reads none", () => {
    expect(vjNextUpOf(inputWith({}))).toEqual({ kind: "none" });
    expect(vjNextUpOf(inputWith({ state: SHUFFLE_ON_STATE }))).toEqual({
      kind: "none",
    });
  });
});
