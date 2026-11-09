import { describe, expect, it } from "vitest";
import {
  INITIAL_VJ_LAYERS,
  reduceVjLayers,
  vjGeneratorSourceKey,
  type VjRenderableClip,
  type VjRenderableGenerator,
} from "./vjLayerMachine";
import {
  VJ_FIRST_TARGET_CUT,
  isVjLayerTargetInFlight,
  isVjLayersShowing,
  vjSimpleSlotOf,
  vjSimpleTargetOf,
  vjSimpleTransitionOf,
  vjSimpleUpcomingOf,
  vjTargetKeyOf,
} from "./vjStageLayerRules";

function videoClip(clipId: string): VjRenderableClip {
  return {
    clipId,
    mediaKind: "video",
    fitMode: "fill",
    width: 1920,
    height: 1080,
    sourceUrl: `blob:${clipId}`,
    durationMs: null,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    defaultSpeed: 1,
  };
}

const CLIP_ONE = videoClip("one");
const CLIP_TWO = videoClip("two");
const GENERATOR: VjRenderableGenerator = {
  clipId: vjGeneratorSourceKey("plasma", null),
  generatorId: "plasma",
  generatorVariant: null,
  mediaKind: "generator",
  sourceUrl: "",
};

describe("vjSimpleTransitionOf", () => {
  it("turns every transition but a cut into a fade of the same length", () => {
    expect(vjSimpleTransitionOf({ mode: "wipeLeft", durationMs: 600 })).toEqual(
      { mode: "fade", durationMs: 600 },
    );
    expect(
      vjSimpleTransitionOf({ mode: "dipWhite", durationMs: 1200 }),
    ).toEqual({ mode: "fade", durationMs: 1200 });
  });

  it("keeps a cut a cut", () => {
    expect(vjSimpleTransitionOf({ mode: "cut", durationMs: 0 })).toEqual({
      mode: "cut",
      durationMs: 0,
    });
  });
});

describe("vjSimpleTargetOf", () => {
  it("keeps the last clip under a generator", () => {
    expect(vjSimpleTargetOf(GENERATOR, CLIP_ONE)).toBe(CLIP_ONE);
  });

  it("shows black for a generator with no earlier clip", () => {
    expect(vjSimpleTargetOf(GENERATOR, null)).toBeNull();
  });

  it("shows a clip target itself", () => {
    expect(vjSimpleTargetOf(CLIP_TWO, CLIP_ONE)).toBe(CLIP_TWO);
  });

  it("shows black for no target whatever came before", () => {
    expect(vjSimpleTargetOf(null, CLIP_ONE)).toBeNull();
  });
});

describe("isVjLayersShowing", () => {
  it("counts black as showing when there is no target", () => {
    expect(isVjLayersShowing(INITIAL_VJ_LAYERS, false)).toBe(true);
  });

  it("waits for the target's first frame", () => {
    expect(isVjLayersShowing(INITIAL_VJ_LAYERS, true)).toBe(false);
    const loading = reduceVjLayers(INITIAL_VJ_LAYERS, {
      type: "target",
      clip: CLIP_ONE,
      transition: VJ_FIRST_TARGET_CUT,
    });
    expect(isVjLayersShowing(loading, true)).toBe(false);
    const loadingLayer = loading.incoming?.layer;
    if (!loadingLayer) throw new Error("clip one is not loading");
    const shown = reduceVjLayers(loading, {
      type: "firstFrame",
      layer: loadingLayer,
      clipId: "one",
    });
    expect(isVjLayersShowing(shown, true)).toBe(true);
  });
});

describe("vjTargetKeyOf", () => {
  it("keys a target by its source key and URL", () => {
    expect(vjTargetKeyOf(CLIP_ONE)).toBe("one|blob:one");
    expect(vjTargetKeyOf(null)).toBeNull();
  });
});

describe("VJ_FIRST_TARGET_CUT", () => {
  it("is an instant cut", () => {
    expect(VJ_FIRST_TARGET_CUT).toEqual({ mode: "cut", durationMs: 0 });
  });
});

describe("vjSimpleUpcomingOf", () => {
  it("pre-rolls a clip and nothing for a generator or no queue head", () => {
    expect(vjSimpleUpcomingOf(CLIP_ONE)).toBe(CLIP_ONE);
    expect(vjSimpleUpcomingOf(GENERATOR)).toBeNull();
    expect(vjSimpleUpcomingOf(null)).toBeNull();
  });
});

describe("vjSimpleSlotOf", () => {
  it("draws a primed pre-roll as a hidden loading layer and leaves other phases alone", () => {
    expect(vjSimpleSlotOf({ clip: CLIP_ONE, phase: "primed" })).toEqual({
      clip: CLIP_ONE,
      phase: "loading",
    });
    const shownSlot = { clip: CLIP_TWO, phase: "shown" } as const;
    expect(vjSimpleSlotOf(shownSlot)).toBe(shownSlot);
  });
});

describe("isVjLayerTargetInFlight", () => {
  it("is true for an armed target and false for a pre-roll or none", () => {
    expect(isVjLayerTargetInFlight(INITIAL_VJ_LAYERS)).toBe(false);
    const prepared = reduceVjLayers(INITIAL_VJ_LAYERS, {
      type: "prepare",
      source: CLIP_ONE,
    });
    expect(isVjLayerTargetInFlight(prepared)).toBe(false);
    const targeted = reduceVjLayers(INITIAL_VJ_LAYERS, {
      type: "target",
      clip: CLIP_TWO,
      transition: VJ_FIRST_TARGET_CUT,
    });
    expect(isVjLayerTargetInFlight(targeted)).toBe(true);
  });
});
