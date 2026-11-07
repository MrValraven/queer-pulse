import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  type VjSetlistDTO,
  type VjStageState,
} from "../../../../shared/contracts/vj";
import { vjNextUpOf, type VjNextUpInput } from "./vjNextUp";

const SETLIST: VjSetlistDTO = {
  id: "setlist-1",
  name: "Main set",
  position: 0,
  items: [
    { id: "item-1", sceneId: "scene-a", position: 0 },
    { id: "item-2", sceneId: "scene-b", position: 1 },
    { id: "item-3", sceneId: "scene-c", position: 2 },
  ],
  createdBy: null,
  createdAt: "2026-11-06T00:00:00.000Z",
  updatedAt: "2026-11-06T00:00:00.000Z",
};

function stateWith(overrides: Partial<VjStageState>): VjStageState {
  return { ...createVjStageState("epoch-1", 0), ...overrides };
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
  it("cue wins over set list and shuffle", () => {
    const nextUp = vjNextUpOf(
      inputWith({
        isCueMode: true,
        armedClipId: "clip-cued",
        state: {
          ...SHUFFLE_ON_STATE,
          activeSetlistId: SETLIST.id,
          setlistIndex: 0,
        },
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

  it("set list shows the next scene and its position", () => {
    const nextUp = vjNextUpOf(
      inputWith({
        state: stateWith({ activeSetlistId: SETLIST.id, setlistIndex: 1 }),
        activeSetlist: SETLIST,
      }),
    );
    expect(nextUp).toEqual({
      kind: "setlist",
      sceneId: "scene-c",
      position: 3,
      total: 3,
    });
  });

  it("an armed set list with nothing recalled shows its first scene", () => {
    const nextUp = vjNextUpOf(
      inputWith({
        state: stateWith({ activeSetlistId: SETLIST.id, setlistIndex: null }),
        activeSetlist: SETLIST,
      }),
    );
    expect(nextUp).toEqual({
      kind: "setlist",
      sceneId: "scene-a",
      position: 1,
      total: 3,
    });
  });

  it("past the end of the set list falls through to shuffle", () => {
    const nextUp = vjNextUpOf(
      inputWith({
        state: {
          ...SHUFFLE_ON_STATE,
          activeSetlistId: SETLIST.id,
          setlistIndex: 2,
        },
        leadNextClipId: "clip-shuffled",
        activeSetlist: SETLIST,
      }),
    );
    expect(nextUp).toEqual({ kind: "shuffle", clipId: "clip-shuffled" });
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
