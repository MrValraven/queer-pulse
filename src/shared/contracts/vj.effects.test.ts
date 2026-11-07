import { describe, expect, it } from "vitest";
import {
  VJ_EFFECT_CATALOG,
  VJ_EFFECT_IDS,
  VJ_GENERATOR_CATALOG,
  VJ_GENERATOR_IDS,
  VJ_TRANSITION_CATALOG,
  type VjEffectId,
} from "./vj.effects";
import {
  VJ_LIMITS,
  VJ_PRIDE_FLAGS,
  VJ_SPEEDS,
  VJ_TRANSITION_IDS,
} from "./vj.lists";

const FIXED_AMOUNT_EFFECT_IDS: readonly VjEffectId[] = [
  "mirror",
  "tile",
  "freeze",
  "reverse",
  "pingPong",
];

describe("vj effects catalog", () => {
  it("every effect id has a catalog entry and the ids keep catalog order", () => {
    expect(Object.keys(VJ_EFFECT_CATALOG)).toEqual([...VJ_EFFECT_IDS]);
    expect(new Set(VJ_EFFECT_IDS).size).toBe(VJ_EFFECT_IDS.length);
  });

  it("an entry with variants names its pinned or first variant as the default and an entry without names null", () => {
    // Mirrors the backend contract spec: tint opens on the coral accent and
    // kaleidoscope on six segments; every other variant effect opens on its
    // first variant.
    const pinnedDefaultVariants: Partial<Record<VjEffectId, string>> = {
      tint: "coral",
      kaleidoscope: "6",
    };
    for (const effectId of VJ_EFFECT_IDS) {
      const entry = VJ_EFFECT_CATALOG[effectId];
      const expectedDefault =
        entry.variants.length > 0
          ? (pinnedDefaultVariants[effectId] ?? entry.variants[0])
          : null;
      expect(entry.defaultVariant, effectId).toBe(expectedDefault);
      if (entry.variants.length > 0) {
        expect(entry.variants, effectId).toContain(entry.defaultVariant);
      }
    }
  });

  it("every default amount is a multiple of 0.01 inside 0..1", () => {
    for (const effectId of VJ_EFFECT_IDS) {
      const { defaultAmount } = VJ_EFFECT_CATALOG[effectId];
      expect(defaultAmount, effectId).toBeGreaterThanOrEqual(0);
      expect(defaultAmount, effectId).toBeLessThanOrEqual(1);
      const hundredths = defaultAmount / VJ_LIMITS.amountStep;
      expect(
        Math.abs(hundredths - Math.round(hundredths)),
        effectId,
      ).toBeLessThan(1e-9);
    }
  });

  it("exactly freeze, reverse and pingPong share the playhead group", () => {
    const playheadIds = VJ_EFFECT_IDS.filter(
      (effectId) => VJ_EFFECT_CATALOG[effectId].exclusiveGroup === "playhead",
    );
    expect(playheadIds).toEqual(["freeze", "reverse", "pingPong"]);
    const otherGroups = VJ_EFFECT_IDS.filter(
      (effectId) =>
        VJ_EFFECT_CATALOG[effectId].exclusiveGroup !== null &&
        VJ_EFFECT_CATALOG[effectId].exclusiveGroup !== "playhead",
    );
    expect(otherGroups).toEqual([]);
  });

  it("a fixed-amount effect defaults to amount 1 or its listed value", () => {
    const fixedIds = VJ_EFFECT_IDS.filter(
      (effectId) => !VJ_EFFECT_CATALOG[effectId].isAmountAdjustable,
    );
    expect(fixedIds).toEqual([...FIXED_AMOUNT_EFFECT_IDS]);
    for (const effectId of fixedIds) {
      expect(VJ_EFFECT_CATALOG[effectId].defaultAmount, effectId).toBe(1);
    }
  });

  it("the flash-capable effects are invert, glitch and beatPulse", () => {
    const flashIds = VJ_EFFECT_IDS.filter(
      (effectId) => VJ_EFFECT_CATALOG[effectId].isFlashCapable,
    );
    expect(flashIds).toEqual(["invert", "glitch", "beatPulse"]);
  });

  it("every generator and transition id has a catalog entry", () => {
    expect(Object.keys(VJ_GENERATOR_CATALOG)).toEqual([...VJ_GENERATOR_IDS]);
    expect(Object.keys(VJ_TRANSITION_CATALOG)).toEqual([...VJ_TRANSITION_IDS]);
    for (const generatorId of VJ_GENERATOR_IDS) {
      const entry = VJ_GENERATOR_CATALOG[generatorId];
      const expectedDefault =
        entry.variants.length > 0 ? entry.variants[0] : null;
      expect(entry.defaultVariant, generatorId).toBe(expectedDefault);
    }
  });

  it("the prideFlagWave variants are the pride flags", () => {
    expect(VJ_GENERATOR_CATALOG.prideFlagWave.variants).toEqual([
      ...VJ_PRIDE_FLAGS,
    ]);
    expect(VJ_GENERATOR_CATALOG.prideFlagWave.defaultVariant).toBe("rainbow");
  });
});

describe("vj lists and limits", () => {
  it("VJ_SPEEDS runs 0.25 to 4", () => {
    expect([...VJ_SPEEDS]).toEqual([0.25, 0.5, 1, 1.5, 2, 4]);
  });

  it("VJ_LIMITS keeps every v1 value", () => {
    expect(VJ_LIMITS).toMatchObject({
      clipMaxBytes: 104_857_600,
      thumbnailMaxBytes: 262_144,
      thumbnailLongEdgePx: 480,
      clipTitleMax: 120,
      packNameMax: 60,
      packsMax: 50,
      packClipsMax: 200,
      libraryClipsMax: 1000,
      dimensionMax: 16_384,
      durationMsMax: 3_600_000,
      fadeMsMin: 0,
      fadeMsMax: 4000,
      fadeMsDefault: 800,
      overlayTextMax: 80,
      shuffleSecondsMin: 2,
      shuffleSecondsMax: 60,
      shuffleSecondsDefault: 8,
      shuffleBeatsDefault: 8,
      bpmMin: 60,
      bpmMax: 200,
      bpmDefault: 124,
      strobeMaxFlashesPerSecond: 3,
      strobeMaxDurationMs: 10_000,
      mediaUrlTtlSeconds: 900,
      mediaClipIdsMax: 200,
    });
  });
});
