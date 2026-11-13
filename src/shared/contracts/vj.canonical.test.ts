import { describe, expect, it } from "vitest";
import {
  canonicalVjStageState,
  isSameVjStageContent,
  vjEffectSettingOf,
  vjIsQuantizedChange,
  vjSceneLookOf,
} from "./vj.canonical";
import { createVjStageState, type VjStageState } from "./vj.state";

const PACK_ID = "6f1c2d3e-4a5b-4c6d-8e7f-0a1b2c3d4e5f";
const CLIP_ID = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const OTHER_CLIP_ID = "9f8e7d6c-5b4a-4c3d-8e2f-1a0b9c8d7e6f";

function buildStage(): VjStageState {
  return createVjStageState("0d9c8b7a-6f5e-4d3c-8b2a-190817263544", 1000);
}

describe("vjEffectSettingOf", () => {
  it("reads a stored setting and falls back to the catalog off default", () => {
    const stage = buildStage();
    stage.effects.settings = {
      glitch: { isOn: true, amount: 0.7, variant: null },
    };
    expect(vjEffectSettingOf(stage.effects, "glitch")).toEqual({
      isOn: true,
      amount: 0.7,
      variant: null,
    });
    expect(vjEffectSettingOf(stage.effects, "tint")).toEqual({
      isOn: false,
      amount: 0.5,
      variant: "coral",
    });
  });
});

describe("canonicalVjStageState", () => {
  it("orders settings by catalog and drops off defaults", () => {
    const stage = buildStage();
    stage.effects.settings = {
      mirror: { isOn: true, amount: 1, variant: "quad" },
      glitch: { isOn: true, amount: 0.4, variant: null },
      tint: { isOn: false, amount: 0.5, variant: "coral" },
      saturate: { isOn: false, amount: 0.8, variant: null },
      monochrome: { isOn: true, amount: 1, variant: null },
    };
    const canonical = canonicalVjStageState(stage);
    expect(Object.keys(canonical.effects.settings)).toEqual([
      "monochrome",
      "saturate",
      "glitch",
      "mirror",
    ]);
    expect(canonical.effects.settings.saturate).toEqual({
      isOn: false,
      amount: 0.8,
      variant: null,
    });
    expect(canonical.effects.settings.tint).toBeUndefined();
  });

  it("drops effect ids the catalog does not know", () => {
    const stage = buildStage();
    stage.effects.settings = {
      vhs: { isOn: true, amount: 0.6, variant: null },
    };
    // A stored record from a later catalog can carry an id this one lacks.
    Object.assign(stage.effects.settings, {
      sparkle: { isOn: true, amount: 0.5, variant: null },
    });
    expect(canonicalVjStageState(stage).effects.settings).toEqual({
      vhs: { isOn: true, amount: 0.6, variant: null },
    });
  });

  it("sorts override keys and lowercases every uuid", () => {
    const stage = buildStage();
    stage.stageEpoch = "0D9C8B7A-6F5E-4D3C-8B2A-190817263544";
    stage.activePackId = PACK_ID.toUpperCase();
    stage.liveClipId = CLIP_ID.toUpperCase();
    stage.mix.clipId = OTHER_CLIP_ID.toUpperCase();
    stage.activeSetlistId = PACK_ID.toUpperCase();
    stage.recentClipIds = [CLIP_ID.toUpperCase(), OTHER_CLIP_ID];
    stage.screenOverrides = {
      "B-SCREEN": {
        clipId: CLIP_ID.toUpperCase(),
        generatorId: null,
        generatorVariant: null,
      },
      "a-screen": {
        clipId: null,
        generatorId: "prideFlagWave",
        generatorVariant: "trans",
      },
    };
    const canonical = canonicalVjStageState(stage);
    expect(canonical.stageEpoch).toBe("0d9c8b7a-6f5e-4d3c-8b2a-190817263544");
    expect(canonical.activePackId).toBe(PACK_ID);
    expect(canonical.liveClipId).toBe(CLIP_ID);
    expect(canonical.mix.clipId).toBe(OTHER_CLIP_ID);
    expect(canonical.activeSetlistId).toBe(PACK_ID);
    expect(canonical.recentClipIds).toEqual([CLIP_ID, OTHER_CLIP_ID]);
    expect(Object.keys(canonical.screenOverrides)).toEqual([
      "a-screen",
      "b-screen",
    ]);
    expect(canonical.screenOverrides["b-screen"]?.clipId).toBe(CLIP_ID);
  });

  it("dedupes and sorts excluded clip ids", () => {
    const stage = buildStage();
    stage.shuffle.excludedClipIds = [
      OTHER_CLIP_ID,
      CLIP_ID.toUpperCase(),
      CLIP_ID,
    ];
    expect(canonicalVjStageState(stage).shuffle.excludedClipIds).toEqual([
      CLIP_ID,
      OTHER_CLIP_ID,
    ]);
  });

  it("keeps amounts as written", () => {
    const stage = buildStage();
    stage.effects.settings = {
      glitch: { isOn: true, amount: 0.333, variant: null },
    };
    expect(canonicalVjStageState(stage).effects.settings.glitch?.amount).toBe(
      0.333,
    );
  });
});

describe("canonicalVjStageState setlistPlayback", () => {
  it("lowercases the item id and copies every playback field in order", () => {
    const stage = buildStage();
    stage.setlistPlayback = {
      status: "paused",
      itemId: "ABCDEF01-2345-4678-8ABC-DEF012345678",
      isFlashConfirmed: true,
      stepStartedAt: null,
      stepEndsAt: null,
      stepDurationMs: 8000,
      pausedRemainingMs: 3000,
      isLooping: true,
    };
    const canonical = canonicalVjStageState(stage);
    expect(canonical.setlistPlayback).toEqual({
      status: "paused",
      itemId: "abcdef01-2345-4678-8abc-def012345678",
      isFlashConfirmed: true,
      stepStartedAt: null,
      stepEndsAt: null,
      stepDurationMs: 8000,
      pausedRemainingMs: 3000,
      isLooping: true,
    });
    expect(Object.keys(canonical.setlistPlayback)).toEqual([
      "status",
      "itemId",
      "isFlashConfirmed",
      "stepStartedAt",
      "stepEndsAt",
      "stepDurationMs",
      "pausedRemainingMs",
      "isLooping",
    ]);
    expect(Object.keys(canonical).indexOf("setlistPlayback")).toBe(
      Object.keys(canonical).indexOf("setlistIndex") + 1,
    );
  });

  it("keeps a null item id null and builds a fresh object", () => {
    const stage = buildStage();
    const canonical = canonicalVjStageState(stage);
    expect(canonical.setlistPlayback.itemId).toBeNull();
    expect(canonical.setlistPlayback).not.toBe(stage.setlistPlayback);
  });

  it("sees a playback difference as different content and an id case difference as the same", () => {
    const first = buildStage();
    const second = buildStage();
    expect(isSameVjStageContent(first, second)).toBe(true);
    first.setlistPlayback.itemId = "ABCDEF01-2345-4678-8ABC-DEF012345678";
    second.setlistPlayback.itemId = "abcdef01-2345-4678-8abc-def012345678";
    expect(isSameVjStageContent(first, second)).toBe(true);
    second.setlistPlayback.isLooping = true;
    expect(isSameVjStageContent(first, second)).toBe(false);
  });
});

describe("isSameVjStageContent", () => {
  it("isSameVjStageContent ignores revision and updatedAt and sees a key order difference as the same", () => {
    const first = buildStage();
    first.effects.settings = {
      monochrome: { isOn: true, amount: 1, variant: null },
      glitch: { isOn: true, amount: 0.4, variant: null },
    };
    const second = buildStage();
    second.revision = 9;
    second.updatedAt = 99_999;
    second.effects.settings = {
      glitch: { isOn: true, amount: 0.4, variant: null },
      monochrome: { isOn: true, amount: 1, variant: null },
    };
    expect(isSameVjStageContent(first, second)).toBe(true);
    second.overlay.text = "Hello";
    expect(isSameVjStageContent(first, second)).toBe(false);
  });
});

describe("vjIsQuantizedChange", () => {
  it("vjIsQuantizedChange is true for a live source, a re-tap in the same pack, a mix clip, overlay visibility and overrides, false for a pack change alone and for effects", () => {
    const previous = buildStage();
    previous.activePackId = PACK_ID;

    const liveClip = { ...previous, liveClipId: CLIP_ID };
    const liveGenerator = {
      ...previous,
      liveGeneratorId: "plasma" as const,
    };
    const reTap = { ...previous, clipSequence: previous.clipSequence + 1 };
    const mixClip = { ...previous, mix: { ...previous.mix, clipId: CLIP_ID } };
    const overlayShown = {
      ...previous,
      overlay: { ...previous.overlay, text: "Hi", isVisible: true },
    };
    const overridden = {
      ...previous,
      screenOverrides: {
        "a-screen": {
          clipId: CLIP_ID,
          generatorId: null,
          generatorVariant: null,
        },
      },
    };
    const packChange = {
      ...previous,
      activePackId: OTHER_CLIP_ID,
      clipSequence: previous.clipSequence + 1,
    };
    const effectsChange = {
      ...previous,
      effects: {
        ...previous.effects,
        settings: { glitch: { isOn: true, amount: 0.4, variant: null } },
      },
    };

    expect(vjIsQuantizedChange(previous, liveClip)).toBe(true);
    expect(vjIsQuantizedChange(previous, liveGenerator)).toBe(true);
    expect(vjIsQuantizedChange(previous, reTap)).toBe(true);
    expect(vjIsQuantizedChange(previous, mixClip)).toBe(true);
    expect(vjIsQuantizedChange(previous, overlayShown)).toBe(true);
    expect(vjIsQuantizedChange(previous, overridden)).toBe(true);
    expect(vjIsQuantizedChange(previous, packChange)).toBe(false);
    expect(vjIsQuantizedChange(previous, effectsChange)).toBe(false);
  });
});

describe("vjSceneLookOf", () => {
  it("vjSceneLookOf reads a clip, a generator and nothing live", () => {
    const stage = buildStage();
    stage.overlay = {
      ...stage.overlay,
      text: "Hello",
      isVisible: true,
      hideAt: 5000,
    };
    stage.effects.speed = 2;
    stage.effects.isStrobing = true;
    stage.effects.settings = {
      mirror: { isOn: true, amount: 1, variant: "vertical" },
      tint: { isOn: false, amount: 0.5, variant: "coral" },
    };

    const emptyLook = vjSceneLookOf(stage);
    expect(emptyLook.source).toBeNull();
    expect(emptyLook.effects).toEqual({
      speed: 2,
      settings: { mirror: { isOn: true, amount: 1, variant: "vertical" } },
    });
    expect(emptyLook.overlay).toEqual({
      text: "Hello",
      style: "big",
      isVisible: true,
      position: "center",
      size: "l",
      colorToken: "cream",
    });
    expect(emptyLook.transition).toEqual(stage.transition);
    expect(emptyLook.mix).toEqual(stage.mix);
    expect(Object.keys(emptyLook)).toEqual([
      "source",
      "effects",
      "transition",
      "overlay",
      "mix",
    ]);

    expect(vjSceneLookOf({ ...stage, liveClipId: CLIP_ID }).source).toEqual({
      kind: "clip",
      clipId: CLIP_ID,
    });
    expect(
      vjSceneLookOf({
        ...stage,
        liveGeneratorId: "prideFlagWave",
        liveGeneratorVariant: "bi",
      }).source,
    ).toEqual({
      kind: "generator",
      generatorId: "prideFlagWave",
      generatorVariant: "bi",
    });
  });
});
