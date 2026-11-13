import { describe, expect, it } from "vitest";
import {
  createVjSetlistPlayback,
  createVjStageState,
  DEFAULT_VJ_STEP_DURATION,
  vjSceneLookOf,
  type VjClipDTO,
  type VjSceneDTO,
  type VjSetlistDTO,
  type VjSetlistItemDTO,
  type VjSetlistPlayback,
  type VjSetlistPlaybackStatus,
  type VjStageState,
} from "../../../../shared/contracts/vj";
import {
  isVjSetlistPlayable,
  VJ_SETLIST_PLAY_CONTROL_KEYS,
  VJ_SETLIST_STEP_GONE_KEYS,
  VJ_SETLIST_STRIP_PLAY_CONTROL_KEYS,
  vjActiveSetlistOf,
  vjSetlistFlashingIndexOf,
  vjSetlistHasFlashingStep,
  vjSetlistItemFlashes,
  vjSetlistNextIndex,
  vjSetlistPlayControlOf,
  vjSetlistPreviousIndex,
  vjSetlistReasonCopyOf,
  vjSetlistReasonLineOf,
  vjSetlistSkipFlashingIndexOf,
  vjSetlistSkipTargetIndex,
  vjSetlistStepNameOf,
  vjSetlistStepPositionCopy,
  vjSetlistStepPositionOf,
} from "./vjSetlistPlayback";

function sceneOf(id: string, name: string, isFlashing: boolean): VjSceneDTO {
  const look = vjSceneLookOf(createVjStageState("scene-epoch", 0));
  look.effects.settings = isFlashing
    ? { invert: { isOn: true, amount: 1, variant: null } }
    : {};
  return { id, name, look } as VjSceneDTO;
}

const CALM_SCENE = sceneOf("scene-calm", "Slow open", false);
const FLASH_SCENE = sceneOf("scene-flash", "Big drop", true);
const SCENES_BY_ID: ReadonlyMap<string, VjSceneDTO> = new Map([
  [CALM_SCENE.id, CALM_SCENE],
  [FLASH_SCENE.id, FLASH_SCENE],
]);
const CLIPS_BY_ID: ReadonlyMap<string, Pick<VjClipDTO, "title">> = new Map([
  ["clip-haze", { title: "Warm haze" }],
]);

function sceneStep(id: string, sceneId: string): VjSetlistItemDTO {
  return {
    id,
    position: 0,
    kind: "scene",
    sceneId,
    clipId: null,
    duration: null,
  };
}

function clipStep(id: string, clipId: string): VjSetlistItemDTO {
  return {
    id,
    position: 0,
    kind: "clip",
    sceneId: null,
    clipId,
    duration: null,
  };
}

function setlistOf(items: VjSetlistItemDTO[]): VjSetlistDTO {
  return {
    id: "setlist-1",
    name: "Friday set",
    position: 0,
    isLooping: false,
    stepDuration: DEFAULT_VJ_STEP_DURATION,
    items: items.map((item, position) => ({ ...item, position })),
    createdBy: null,
    createdAt: "2026-11-13T00:00:00.000Z",
    updatedAt: "2026-11-13T00:00:00.000Z",
  };
}

/** calm, flash, clip, flash */
const MIXED_SETLIST = setlistOf([
  sceneStep("item-1", CALM_SCENE.id),
  sceneStep("item-2", FLASH_SCENE.id),
  clipStep("item-3", "clip-haze"),
  sceneStep("item-4", FLASH_SCENE.id),
]);

function stateWith(
  setlistIndex: number | null,
  playback: Partial<VjSetlistPlayback> = {},
  isShuffleOn = false,
): VjStageState {
  const baseState = createVjStageState("epoch-1", 0);
  return {
    ...baseState,
    activeSetlistId: MIXED_SETLIST.id,
    setlistIndex,
    setlistPlayback: { ...createVjSetlistPlayback(false), ...playback },
    shuffle: { ...baseState.shuffle, isOn: isShuffleOn },
  };
}

describe("vjSetlistItemFlashes", () => {
  it("a clip step never flashes", () => {
    expect(
      vjSetlistItemFlashes(clipStep("item", "clip-haze"), SCENES_BY_ID),
    ).toBe(false);
  });

  it("a scene step reads its scene's look", () => {
    expect(
      vjSetlistItemFlashes(sceneStep("item", CALM_SCENE.id), SCENES_BY_ID),
    ).toBe(false);
    expect(
      vjSetlistItemFlashes(sceneStep("item", FLASH_SCENE.id), SCENES_BY_ID),
    ).toBe(true);
  });

  it("a scene the library has not loaded counts as flashing", () => {
    expect(
      vjSetlistItemFlashes(sceneStep("item", "scene-unknown"), SCENES_BY_ID),
    ).toBe(true);
  });

  it("a scene step with no scene id cannot flash", () => {
    expect(
      vjSetlistItemFlashes(
        { ...sceneStep("item", CALM_SCENE.id), sceneId: null },
        SCENES_BY_ID,
      ),
    ).toBe(false);
  });
});

describe("vjSetlistHasFlashingStep", () => {
  it("is true when any scene step flashes", () => {
    expect(vjSetlistHasFlashingStep(MIXED_SETLIST, SCENES_BY_ID)).toBe(true);
  });

  it("is false for calm scenes and clips only", () => {
    const calmSetlist = setlistOf([
      sceneStep("item-1", CALM_SCENE.id),
      clipStep("item-2", "clip-haze"),
    ]);
    expect(vjSetlistHasFlashingStep(calmSetlist, SCENES_BY_ID)).toBe(false);
    expect(vjSetlistHasFlashingStep(setlistOf([]), SCENES_BY_ID)).toBe(false);
  });
});

describe("vjSetlistSkipTargetIndex", () => {
  it("lands on the first step after the flashing one that does not flash", () => {
    expect(
      vjSetlistSkipTargetIndex(MIXED_SETLIST, SCENES_BY_ID, 1, false),
    ).toBe(2);
  });

  it("skips over further flashing steps to a calm one two or more on", () => {
    const runOfFlashes = setlistOf([
      sceneStep("item-1", CALM_SCENE.id),
      sceneStep("item-2", FLASH_SCENE.id),
      sceneStep("item-3", FLASH_SCENE.id),
      sceneStep("item-4", "scene-unknown"),
      clipStep("item-5", "clip-haze"),
    ]);
    expect(vjSetlistSkipTargetIndex(runOfFlashes, SCENES_BY_ID, 1, false)).toBe(
      4,
    );
  });

  it("answers null past the end without Loop", () => {
    expect(
      vjSetlistSkipTargetIndex(MIXED_SETLIST, SCENES_BY_ID, 3, false),
    ).toBeNull();
  });

  it("wraps to the start with Loop", () => {
    expect(vjSetlistSkipTargetIndex(MIXED_SETLIST, SCENES_BY_ID, 3, true)).toBe(
      0,
    );
  });

  it("answers null when every other step flashes too", () => {
    const flashingSetlist = setlistOf([
      sceneStep("item-1", FLASH_SCENE.id),
      sceneStep("item-2", FLASH_SCENE.id),
    ]);
    expect(
      vjSetlistSkipTargetIndex(flashingSetlist, SCENES_BY_ID, 0, true),
    ).toBeNull();
  });

  it("answers null for an index outside the sequence", () => {
    expect(
      vjSetlistSkipTargetIndex(MIXED_SETLIST, SCENES_BY_ID, 9, true),
    ).toBeNull();
    expect(
      vjSetlistSkipTargetIndex(MIXED_SETLIST, SCENES_BY_ID, -1, true),
    ).toBeNull();
  });
});

describe("vjSetlistNextIndex and vjSetlistPreviousIndex", () => {
  it("next counts on from the step on screen, step 1 while armed", () => {
    expect(vjSetlistNextIndex(null, 3, false)).toBe(0);
    expect(vjSetlistNextIndex(1, 3, false)).toBe(2);
  });

  it("next past the end wraps with Loop, else null", () => {
    expect(vjSetlistNextIndex(2, 3, true)).toBe(0);
    expect(vjSetlistNextIndex(2, 3, false)).toBeNull();
    expect(vjSetlistNextIndex(null, 0, true)).toBeNull();
  });

  it("previous from the first step wraps to the last with Loop, else null", () => {
    expect(vjSetlistPreviousIndex(0, 3, true)).toBe(2);
    expect(vjSetlistPreviousIndex(null, 3, true)).toBe(2);
    expect(vjSetlistPreviousIndex(0, 3, false)).toBeNull();
    expect(vjSetlistPreviousIndex(null, 0, true)).toBeNull();
  });

  it("previous steps back one, null when the index fell off the list", () => {
    expect(vjSetlistPreviousIndex(2, 3, false)).toBe(1);
    expect(vjSetlistPreviousIndex(6, 3, false)).toBeNull();
  });
});

describe("vjSetlistReasonLineOf", () => {
  it("names a takeover by a pick or by shuffle", () => {
    expect(vjSetlistReasonLineOf(stateWith(1, { status: "takenOver" }))).toBe(
      "takenOverPick",
    );
    expect(
      vjSetlistReasonLineOf(stateWith(1, { status: "takenOver" }, true)),
    ).toBe("takenOverShuffle");
  });

  it("names finished, the flash wait and a pause", () => {
    expect(vjSetlistReasonLineOf(stateWith(3, { status: "finished" }))).toBe(
      "finished",
    );
    expect(
      vjSetlistReasonLineOf(stateWith(0, { status: "needsFlashConsent" })),
    ).toBe("flashWaiting");
    expect(vjSetlistReasonLineOf(stateWith(0, { status: "paused" }))).toBe(
      "paused",
    );
  });

  it("shows no line while manual, playing or with no sequence", () => {
    expect(vjSetlistReasonLineOf(stateWith(0, { status: "manual" }))).toBe(
      null,
    );
    expect(vjSetlistReasonLineOf(stateWith(0, { status: "playing" }))).toBe(
      null,
    );
    expect(
      vjSetlistReasonLineOf({
        ...stateWith(0, { status: "takenOver" }),
        activeSetlistId: null,
      }),
    ).toBeNull();
  });
});

describe("vjSetlistPlayControlOf", () => {
  it("maps every status to its one play control", () => {
    const expected: Record<VjSetlistPlaybackStatus, string> = {
      manual: "play",
      playing: "pause",
      paused: "resume",
      takenOver: "resume",
      needsFlashConsent: "resume",
      finished: "playAgain",
    };
    for (const [status, control] of Object.entries(expected)) {
      expect(vjSetlistPlayControlOf(status as VjSetlistPlaybackStatus)).toBe(
        control,
      );
    }
  });

  it("labels each control with a catalog key", () => {
    expect(VJ_SETLIST_PLAY_CONTROL_KEYS.playAgain).toBe("vj:scenes.playAgain");
    expect(VJ_SETLIST_STRIP_PLAY_CONTROL_KEYS.pause).toBe(
      "vj:strip.setlistPause",
    );
  });
});

describe("isVjSetlistPlayable and vjActiveSetlistOf", () => {
  it("an empty sequence cannot play", () => {
    expect(isVjSetlistPlayable(setlistOf([]))).toBe(false);
    expect(isVjSetlistPlayable(MIXED_SETLIST)).toBe(true);
  });

  it("finds the active sequence among the loaded ones", () => {
    expect(vjActiveSetlistOf(stateWith(0), [MIXED_SETLIST])).toBe(
      MIXED_SETLIST,
    );
    expect(vjActiveSetlistOf(stateWith(0), [])).toBeNull();
    expect(vjActiveSetlistOf(null, [MIXED_SETLIST])).toBeNull();
    expect(
      vjActiveSetlistOf({ ...stateWith(0), activeSetlistId: null }, [
        MIXED_SETLIST,
      ]),
    ).toBeNull();
  });
});

describe("vjSetlistFlashingIndexOf and vjSetlistSkipFlashingIndexOf", () => {
  it("the flashing step is the one after the step on screen", () => {
    const waitingState = stateWith(0, { status: "needsFlashConsent" });
    expect(vjSetlistFlashingIndexOf(waitingState, MIXED_SETLIST)).toBe(1);
    expect(
      vjSetlistSkipFlashingIndexOf(waitingState, MIXED_SETLIST, SCENES_BY_ID),
    ).toBe(2);
  });

  it("wraps with Loop from the last step", () => {
    const waitingState = stateWith(3, {
      status: "needsFlashConsent",
      isLooping: true,
    });
    expect(vjSetlistFlashingIndexOf(waitingState, MIXED_SETLIST)).toBe(0);
  });

  it("skip has no target past the last flashing step without Loop", () => {
    const waitingState = stateWith(2, { status: "needsFlashConsent" });
    expect(vjSetlistFlashingIndexOf(waitingState, MIXED_SETLIST)).toBe(3);
    expect(
      vjSetlistSkipFlashingIndexOf(waitingState, MIXED_SETLIST, SCENES_BY_ID),
    ).toBeNull();
  });

  it("answers null outside needsFlashConsent or for another sequence", () => {
    expect(
      vjSetlistFlashingIndexOf(
        stateWith(0, { status: "playing" }),
        MIXED_SETLIST,
      ),
    ).toBeNull();
    expect(
      vjSetlistFlashingIndexOf(stateWith(0, { status: "needsFlashConsent" }), {
        ...MIXED_SETLIST,
        id: "setlist-other",
      }),
    ).toBeNull();
    expect(
      vjSetlistSkipFlashingIndexOf(
        stateWith(0, { status: "paused" }),
        MIXED_SETLIST,
        SCENES_BY_ID,
      ),
    ).toBeNull();
  });
});

describe("vjSetlistStepNameOf", () => {
  it("names a scene step by its scene and a clip step by its clip", () => {
    expect(
      vjSetlistStepNameOf(
        sceneStep("item", FLASH_SCENE.id),
        SCENES_BY_ID,
        CLIPS_BY_ID,
      ),
    ).toBe("Big drop");
    expect(
      vjSetlistStepNameOf(
        clipStep("item", "clip-haze"),
        SCENES_BY_ID,
        CLIPS_BY_ID,
      ),
    ).toBe("Warm haze");
  });

  it("answers null when the library has not loaded it", () => {
    expect(
      vjSetlistStepNameOf(
        clipStep("item", "clip-gone"),
        SCENES_BY_ID,
        CLIPS_BY_ID,
      ),
    ).toBeNull();
    expect(
      vjSetlistStepNameOf(
        sceneStep("item", "scene-gone"),
        SCENES_BY_ID,
        CLIPS_BY_ID,
      ),
    ).toBeNull();
    expect(
      vjSetlistStepNameOf(
        { ...clipStep("item", "clip-haze"), clipId: null },
        SCENES_BY_ID,
        CLIPS_BY_ID,
      ),
    ).toBeNull();
  });

  it("has a fallback key per kind", () => {
    expect(VJ_SETLIST_STEP_GONE_KEYS.scene).toBe("vj:setlistItems.sceneGone");
    expect(VJ_SETLIST_STEP_GONE_KEYS.clip).toBe("vj:setlistItems.clipGone");
  });
});

describe("vjSetlistReasonCopyOf", () => {
  const stepNameOf = (item: VjSetlistItemDTO | null) =>
    item === null
      ? "Friday set"
      : (vjSetlistStepNameOf(item, SCENES_BY_ID, CLIPS_BY_ID) ?? "gone");

  it("names the flashing step that waits", () => {
    expect(
      vjSetlistReasonCopyOf(
        stateWith(0, { status: "needsFlashConsent" }),
        MIXED_SETLIST,
        stepNameOf,
      ),
    ).toEqual({ key: "vj:scenes.flashWaiting", values: { step: "Big drop" } });
  });

  it("the flash line names the sequence when the set list is not loaded", () => {
    expect(
      vjSetlistReasonCopyOf(
        stateWith(0, { status: "needsFlashConsent" }),
        null,
        stepNameOf,
      ),
    ).toEqual({
      key: "vj:scenes.flashWaiting",
      values: { step: "Friday set" },
    });
  });

  it("the flash line names the sequence when the step fell past the end", () => {
    expect(
      vjSetlistReasonCopyOf(
        stateWith(7, { status: "needsFlashConsent" }),
        MIXED_SETLIST,
        stepNameOf,
      ),
    ).toEqual({
      key: "vj:scenes.flashWaiting",
      values: { step: "Friday set" },
    });
  });

  it("a pause shows its whole seconds left", () => {
    expect(
      vjSetlistReasonCopyOf(
        stateWith(0, {
          status: "paused",
          stepDurationMs: 8_000,
          pausedRemainingMs: 4_200,
        }),
        MIXED_SETLIST,
        stepNameOf,
      ),
    ).toEqual({ key: "vj:scenes.pausedLine", values: { seconds: 5 } });
  });

  it("names takeovers and finished", () => {
    expect(
      vjSetlistReasonCopyOf(
        stateWith(1, { status: "takenOver" }),
        MIXED_SETLIST,
        stepNameOf,
      ),
    ).toEqual({
      key: "vj:scenes.takenOverPickNext",
      values: { position: 3, step: "Warm haze" },
    });
    expect(
      vjSetlistReasonCopyOf(
        stateWith(1, { status: "takenOver" }, true),
        MIXED_SETLIST,
        stepNameOf,
      ),
    ).toEqual({
      key: "vj:scenes.takenOverShuffleNext",
      values: { position: 3, step: "Warm haze" },
    });
    expect(
      vjSetlistReasonCopyOf(
        stateWith(3, { status: "finished" }),
        MIXED_SETLIST,
        stepNameOf,
      ),
    ).toEqual({ key: "vj:scenes.finished", values: {} });
  });

  it("a takeover on the last step names step 1 as what Resume plays", () => {
    expect(
      vjSetlistReasonCopyOf(
        stateWith(3, { status: "takenOver" }),
        MIXED_SETLIST,
        stepNameOf,
      ),
    ).toEqual({
      key: "vj:scenes.takenOverPickNext",
      values: { position: 1, step: "Slow open" },
    });
  });

  it("a takeover without a readable sequence names only the reason", () => {
    expect(
      vjSetlistReasonCopyOf(
        stateWith(1, { status: "takenOver" }, true),
        null,
        stepNameOf,
      ),
    ).toEqual({ key: "vj:scenes.takenOverShuffle", values: {} });
  });

  it("shows nothing while playing", () => {
    expect(
      vjSetlistReasonCopyOf(
        stateWith(1, { status: "playing" }),
        MIXED_SETLIST,
        stepNameOf,
      ),
    ).toBeNull();
  });
});

describe("vjSetlistStepPositionOf", () => {
  it("reads Ready at step 1 while armed", () => {
    const position = vjSetlistStepPositionOf(stateWith(null), MIXED_SETLIST);
    expect(position).toEqual({ kind: "armed", total: 4 });
    expect(position && vjSetlistStepPositionCopy(position)).toEqual({
      key: "vj:scenes.stepArmed",
      values: {},
    });
  });

  it("reads the 1-based step and the total", () => {
    const position = vjSetlistStepPositionOf(stateWith(2), MIXED_SETLIST);
    expect(position).toEqual({ kind: "step", position: 3, total: 4 });
    expect(position && vjSetlistStepPositionCopy(position)).toEqual({
      key: "vj:scenes.stepPosition",
      values: { position: 3, total: 4 },
    });
  });

  it("clamps an index past the end to the last step", () => {
    expect(vjSetlistStepPositionOf(stateWith(9), MIXED_SETLIST)).toEqual({
      kind: "step",
      position: 4,
      total: 4,
    });
  });

  it("an empty sequence shows no position", () => {
    expect(
      vjSetlistStepPositionOf(stateWith(null), {
        ...MIXED_SETLIST,
        items: [],
      }),
    ).toBeNull();
  });

  it("answers null for a sequence that is not active", () => {
    expect(
      vjSetlistStepPositionOf(stateWith(2), {
        ...MIXED_SETLIST,
        id: "setlist-other",
      }),
    ).toBeNull();
  });
});
