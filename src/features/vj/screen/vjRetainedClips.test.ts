import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  VJ_LIMITS,
  type VjClipDTO,
  type VjSceneDTO,
  type VjSceneLook,
  type VjSetlistItemDTO,
  type VjStageState,
} from "../../../shared/contracts/vj";
import {
  vjClipSetSignatureOf,
  vjRetainedClips,
  vjSetlistClipIds,
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
    setlistClipIds: [],
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

function sceneStep(position: number, sceneId: string): VjSetlistItemDTO {
  return {
    id: `item-${position}`,
    position,
    kind: "scene",
    sceneId,
    clipId: null,
    duration: null,
  };
}

function clipStep(position: number, clipId: string): VjSetlistItemDTO {
  return {
    id: `item-${position}`,
    position,
    kind: "clip",
    sceneId: null,
    clipId,
    duration: { kind: "seconds", value: 8 },
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
      inputWith({ state, setlistClipIds: ["old-a", "scene-1"] }),
    );

    expect(extraClipIds).toEqual(["mix-1", "scene-1"]);
  });

  it("caps the extra clips at the media query limit", () => {
    const setlistClipIds = Array.from(
      { length: VJ_LIMITS.mediaClipIdsMax + 5 },
      (_unused, index) => `scene-clip-${index}`,
    );

    const { keptClipIds, extraClipIds } = vjRetainedClips(
      inputWith({ setlistClipIds }),
    );

    expect(extraClipIds).toHaveLength(VJ_LIMITS.mediaClipIdsMax);
    expect(extraClipIds[0]).toBe("scene-clip-0");
    expect(keptClipIds.has(`scene-clip-${VJ_LIMITS.mediaClipIdsMax}`)).toBe(
      true,
    );
  });

  it("keeps the set list's scene clips", () => {
    const { keptClipIds, extraClipIds } = vjRetainedClips(
      inputWith({ setlistClipIds: ["scene-1", "scene-2"] }),
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
      inputWith({ state, setlistClipIds: ["pack-b"] }),
    );

    expect(extraClipIds).toEqual([]);
    expect([...keptClipIds].sort()).toEqual(["old-a", "pack-a", "pack-b"]);
  });
});

describe("vjSetlistClipIds", () => {
  const scenes = [
    sceneNamed("scene-a", "clip-1", "clip-2"),
    sceneNamed("scene-b", null, "clip-3"),
    sceneNamed("scene-c", "clip-2", null),
  ];

  it("collects source and mix clips in set list order, each once", () => {
    const items = [
      sceneStep(0, "scene-c"),
      sceneStep(1, "scene-a"),
      sceneStep(2, "scene-b"),
      sceneStep(3, "scene-a"),
    ];

    expect(vjSetlistClipIds(items, scenes, 0)).toEqual([
      "clip-2",
      "clip-1",
      "clip-3",
    ]);
  });

  it("names a clip step's clip beside the scene steps' clips", () => {
    const items = [
      clipStep(0, "clip-step-1"),
      sceneStep(1, "scene-a"),
      clipStep(2, "clip-step-2"),
      clipStep(3, "clip-1"),
    ];

    expect(vjSetlistClipIds(items, scenes, 0)).toEqual([
      "clip-step-1",
      "clip-1",
      "clip-2",
      "clip-step-2",
    ]);
  });

  it("starts at the given step and wraps round, so the next step is fetched first", () => {
    const items = [
      clipStep(0, "clip-step-1"),
      sceneStep(1, "scene-b"),
      clipStep(2, "clip-step-2"),
      clipStep(3, "clip-step-3"),
    ];

    expect(vjSetlistClipIds(items, scenes, 2)).toEqual([
      "clip-step-2",
      "clip-step-3",
      "clip-step-1",
      "clip-3",
    ]);
    // One past the last step wraps to the first.
    expect(vjSetlistClipIds(items, scenes, 4)[0]).toBe("clip-step-1");
  });

  it("walks the steps by position whatever order the list holds", () => {
    const items = [
      clipStep(2, "clip-step-3"),
      clipStep(0, "clip-step-1"),
      clipStep(1, "clip-step-2"),
    ];

    expect(vjSetlistClipIds(items, [], 1)).toEqual([
      "clip-step-2",
      "clip-step-3",
      "clip-step-1",
    ]);
  });

  it("skips scene ids the list does not hold and answers none for no steps", () => {
    const items = [sceneStep(0, "scene-gone"), sceneStep(1, "scene-a")];

    expect(vjSetlistClipIds(items, scenes, 0)).toEqual(["clip-1", "clip-2"]);
    expect(vjSetlistClipIds(items, [], 0)).toEqual([]);
    expect(vjSetlistClipIds([], scenes, 3)).toEqual([]);
  });

  it("keeps the next step's clip inside the extra clips cap", () => {
    const items = Array.from(
      { length: VJ_LIMITS.mediaClipIdsMax + 4 },
      (_unused, index) => clipStep(index, `clip-step-${index}`),
    );
    const nextStepIndex = VJ_LIMITS.mediaClipIdsMax + 2;

    const { extraClipIds } = vjRetainedClips(
      inputWith({
        setlistClipIds: vjSetlistClipIds(items, [], nextStepIndex),
      }),
    );

    expect(extraClipIds).toHaveLength(VJ_LIMITS.mediaClipIdsMax);
    expect(extraClipIds[0]).toBe(`clip-step-${nextStepIndex}`);
  });
});

function clipOf(id: string, byteSize = 2048): VjClipDTO {
  return {
    id,
    title: `Clip ${id}`,
    mediaKind: "video",
    mimeType: "video/mp4",
    byteSize,
    width: 1920,
    height: 1080,
    durationMs: 4000,
    fitMode: "fill",
    thumbnailUrl: `https://files.example/${id}.jpg`,
    mediaUrl: `https://files.example/${id}.mp4`,
    packIds: [],
    packCount: 0,
    createdBy: null,
    createdAt: "2026-11-13T19:00:00.000Z",
    updatedAt: "2026-11-13T19:00:00.000Z",
    isFavorite: false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    previewUrl: null,
    setlistItemCount: 0,
  };
}

describe("vjClipSetSignatureOf", () => {
  it("keeps the run key when a step turns the list round", () => {
    const stepOneOrder = [clipOf("clip-b"), clipOf("clip-c"), clipOf("clip-a")];
    const stepTwoOrder = [clipOf("clip-c"), clipOf("clip-a"), clipOf("clip-b")];

    expect(vjClipSetSignatureOf(stepTwoOrder)).toBe(
      vjClipSetSignatureOf(stepOneOrder),
    );
  });

  it("changes the run key when a clip joins, leaves or is replaced", () => {
    const clips = [clipOf("clip-a"), clipOf("clip-b")];
    const signature = vjClipSetSignatureOf(clips);

    expect(vjClipSetSignatureOf([...clips, clipOf("clip-c")])).not.toBe(
      signature,
    );
    expect(vjClipSetSignatureOf([clipOf("clip-a")])).not.toBe(signature);
    expect(
      vjClipSetSignatureOf([clipOf("clip-a"), clipOf("clip-b", 4096)]),
    ).not.toBe(signature);
  });
});
