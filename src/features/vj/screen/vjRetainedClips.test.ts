import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  VJ_LIMITS,
  type VjSceneDTO,
  type VjSceneLook,
  type VjStageState,
} from "../../../shared/contracts/vj";
import {
  vjRetainedClips,
  vjSceneClipIds,
  type VjRetainedClipsInput,
} from "./vjRetainedClips";

const NOW = Date.parse("2026-11-06T20:00:00.000Z");
const SCREEN_ID = "screen-1";

function stateWith(patch: Partial<VjStageState>): VjStageState {
  return { ...createVjStageState("epoch-1", NOW), ...patch };
}

function inputWith(patch: Partial<VjRetainedClipsInput>): VjRetainedClipsInput {
  return {
    activePackClipIds: ["pack-a", "pack-b"],
    previousPackClipIds: ["old-a"],
    state: null,
    screenId: SCREEN_ID,
    setlistSceneClipIds: [],
    ...patch,
  };
}

function sceneNamed(
  id: string,
  sourceClipId: string | null,
  mixClipId: string | null,
): VjSceneDTO {
  const baseState = createVjStageState("epoch-1", NOW);
  const look: VjSceneLook = {
    source:
      sourceClipId === null ? null : { kind: "clip", clipId: sourceClipId },
    effects: { speed: 1, settings: {} },
    transition: baseState.transition,
    overlay: {
      text: "",
      style: "big",
      isVisible: false,
      position: "center",
      size: "l",
      colorToken: "cream",
    },
    mix: { clipId: mixClipId, amount: 0.5, blendMode: "normal" },
  };
  return {
    id,
    name: `Scene ${id}`,
    packId: null,
    position: 0,
    look,
    setlistItemCount: 1,
    createdBy: null,
    createdAt: "2026-11-06T19:00:00.000Z",
    updatedAt: "2026-11-06T19:00:00.000Z",
  };
}

describe("vjRetainedClips", () => {
  it("keeps both packs, the live clip, the mix clip and this screen's override clip", () => {
    const state = stateWith({
      liveClipId: "live-1",
      mix: { clipId: "mix-1", amount: 0.4, blendMode: "screen" },
      screenOverrides: {
        [SCREEN_ID]: {
          clipId: "override-1",
          generatorId: null,
          generatorVariant: null,
        },
      },
    });

    const { keptClipIds } = vjRetainedClips(inputWith({ state }));

    expect([...keptClipIds].sort()).toEqual(
      ["live-1", "mix-1", "old-a", "override-1", "pack-a", "pack-b"].sort(),
    );
  });

  it("ignores another screen's override", () => {
    const state = stateWith({
      screenOverrides: {
        "screen-2": {
          clipId: "override-2",
          generatorId: null,
          generatorVariant: null,
        },
      },
    });

    const { keptClipIds, extraClipIds } = vjRetainedClips(inputWith({ state }));

    expect(keptClipIds.has("override-2")).toBe(false);
    expect(extraClipIds).toEqual([]);
  });

  it("lists clips outside both packs as extra", () => {
    const state = stateWith({
      liveClipId: "pack-a",
      mix: { clipId: "mix-1", amount: 0.4, blendMode: "normal" },
      screenOverrides: {
        [SCREEN_ID]: {
          clipId: "mix-1",
          generatorId: null,
          generatorVariant: null,
        },
      },
    });

    const { extraClipIds } = vjRetainedClips(
      inputWith({ state, setlistSceneClipIds: ["old-a", "scene-1"] }),
    );

    expect(extraClipIds).toEqual(["mix-1", "scene-1"]);
  });

  it("caps the extra clips at the media query limit", () => {
    const setlistSceneClipIds = Array.from(
      { length: VJ_LIMITS.mediaClipIdsMax + 5 },
      (_unused, index) => `scene-clip-${index}`,
    );

    const { keptClipIds, extraClipIds } = vjRetainedClips(
      inputWith({ setlistSceneClipIds }),
    );

    expect(extraClipIds).toHaveLength(VJ_LIMITS.mediaClipIdsMax);
    expect(extraClipIds[0]).toBe("scene-clip-0");
    expect(keptClipIds.has(`scene-clip-${VJ_LIMITS.mediaClipIdsMax}`)).toBe(
      true,
    );
  });

  it("keeps the set list's scene clips", () => {
    const { keptClipIds, extraClipIds } = vjRetainedClips(
      inputWith({ setlistSceneClipIds: ["scene-1", "scene-2"] }),
    );

    expect(keptClipIds.has("scene-1")).toBe(true);
    expect(keptClipIds.has("scene-2")).toBe(true);
    expect(extraClipIds).toEqual(["scene-1", "scene-2"]);
  });

  it("answers an empty extra list when everything sits in the pack", () => {
    const state = stateWith({
      liveClipId: "pack-a",
      mix: { clipId: "old-a", amount: 0.2, blendMode: "normal" },
    });

    const { keptClipIds, extraClipIds } = vjRetainedClips(
      inputWith({ state, setlistSceneClipIds: ["pack-b"] }),
    );

    expect(extraClipIds).toEqual([]);
    expect([...keptClipIds].sort()).toEqual(["old-a", "pack-a", "pack-b"]);
  });
});

describe("vjSceneClipIds", () => {
  it("collects source and mix clips in set list order, each once", () => {
    const scenes = [
      sceneNamed("scene-a", "clip-1", "clip-2"),
      sceneNamed("scene-b", null, "clip-3"),
      sceneNamed("scene-c", "clip-2", null),
    ];

    expect(
      vjSceneClipIds(scenes, ["scene-c", "scene-a", "scene-b", "scene-a"]),
    ).toEqual(["clip-2", "clip-1", "clip-3"]);
  });

  it("skips scene ids the list does not hold", () => {
    const scenes = [sceneNamed("scene-a", "clip-1", null)];

    expect(vjSceneClipIds(scenes, ["scene-gone", "scene-a"])).toEqual([
      "clip-1",
    ]);
  });
});
