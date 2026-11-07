import { describe, expect, it } from "vitest";
import {
  VJ_EFFECT_CATALOG,
  VJ_EFFECT_IDS,
  type VjEffectId,
  type VjEffectSettings,
} from "../../../shared/contracts/vj";
import {
  createVjDomBeatPose,
  fillVjDomBeatPose,
  vjDomDuotoneOf,
  vjDomFilter,
  vjDomLayersOf,
  vjDomMaskClipPath,
  vjDomSettingOf,
  vjDomTintColour,
  vjDomTransform,
} from "./vjDomEffectsStyle";

function on(
  effectId: VjEffectId,
  amount = VJ_EFFECT_CATALOG[effectId].defaultAmount,
  variant = VJ_EFFECT_CATALOG[effectId].defaultVariant,
): VjEffectSettings {
  return { [effectId]: { isOn: true, amount, variant } };
}

function everyEffectOn(): VjEffectSettings {
  return VJ_EFFECT_IDS.reduce<VjEffectSettings>(
    (settings, effectId) => ({ ...settings, ...on(effectId) }),
    {},
  );
}

describe("vjDomEffectsStyle", () => {
  it("renders only DOM-capable effects", () => {
    for (const effectId of VJ_EFFECT_IDS) {
      const setting = vjDomSettingOf(on(effectId), effectId);
      expect(setting !== null).toBe(VJ_EFFECT_CATALOG[effectId].isDomCapable);
    }
    const onlyEngineEffects = VJ_EFFECT_IDS.filter(
      (effectId) => !VJ_EFFECT_CATALOG[effectId].isDomCapable,
    ).reduce<VjEffectSettings>(
      (settings, effectId) => ({ ...settings, ...on(effectId) }),
      {},
    );
    expect(vjDomFilter(onlyEngineEffects)).toBe("none");
    expect(vjDomTransform(onlyEngineEffects)).toBe("none");
    expect(vjDomLayersOf(onlyEngineEffects)).toEqual({
      tint: null,
      tintAmount: 0,
      scanlines: 0,
      vignette: 0,
      mirror: null,
      mask: null,
    });
    expect(
      vjDomFilter({ monochrome: { isOn: false, amount: 1, variant: null } }),
    ).toBe("none");
  });

  it("maps amounts to filter values per the contract table", () => {
    expect(vjDomFilter(on("monochrome", 0.4))).toBe("grayscale(0.4)");
    expect(vjDomFilter(on("invert", 0.7, "steady"))).toBe(
      "invert(var(--vj-dom-invert, 0.7))",
    );
    expect(vjDomFilter(on("invert", 0.7, "beat"))).toBe(
      "invert(var(--vj-dom-invert, 0))",
    );
    expect(vjDomFilter(on("saturate", 0.5))).toBe("saturate(2)");
    expect(vjDomFilter(on("contrast", 0.35))).toBe("contrast(1.525)");
    expect(vjDomFilter(on("hueShift", 0.25))).toBe(
      "hue-rotate(calc(90deg + var(--vj-dom-hue, 0deg)))",
    );
    expect(vjDomFilter(on("hueCycle", 0.5))).toBe(
      "hue-rotate(calc(0deg + var(--vj-dom-hue, 0deg)))",
    );
    expect(vjDomFilter(on("dream", 0.5))).toBe("blur(1cqh)");
    expect(vjDomFilter(on("beatPulse", 0.5))).toBe(
      "brightness(var(--vj-dom-brightness, 1))",
    );
    expect(vjDomFilter({}, { shouldHoldInvert: true })).toBe(
      "invert(var(--vj-dom-invert, 0))",
    );
    expect(vjDomFilter(everyEffectOn())).toBe(
      [
        "grayscale(1)",
        "invert(var(--vj-dom-invert, 1))",
        "saturate(2)",
        "contrast(1.75)",
        "hue-rotate(calc(180deg + var(--vj-dom-hue, 0deg)))",
        "blur(1cqh)",
        "brightness(var(--vj-dom-brightness, 1))",
      ].join(" "),
    );
    expect(vjDomTransform(everyEffectOn())).toBe(
      "var(--vj-dom-kenburns, scale(1)) rotate(var(--vj-dom-rotate, 0deg)) scale(var(--vj-dom-zoom, 1))",
    );
  });

  it("answers the tint, scanlines, vignette, mirror and mask layers", () => {
    const layers = vjDomLayersOf({
      ...on("tint", 0.6, "jade"),
      ...on("scanlines", 0.3),
      ...on("vignette", 0.8),
      ...on("mirror", 1, "vertical"),
      ...on("mask", 0.5, "heart"),
    });
    expect(layers).toEqual({
      tint: "jade",
      tintAmount: 0.6,
      scanlines: 0.3,
      vignette: 0.8,
      mirror: "vertical",
      mask: { shape: "heart", amount: 0.5 },
    });
    expect(vjDomTintColour("jade")).toBe("var(--vj-palette-jade)");
    expect(vjDomLayersOf(on("mirror", 1, "quad")).mirror).toBe("horizontal");
    expect(vjDomLayersOf(on("mirror", 1, "horizontal")).mirror).toBe(
      "horizontal",
    );
  });

  it("reads the duotone pair as shadow then highlight over a grey picture", () => {
    expect(vjDomDuotoneOf(on("duotone", 0.6, "plum-jade"))).toEqual({
      shadow: "plum",
      highlight: "jade",
      amount: 0.6,
    });
    expect(vjDomDuotoneOf(on("duotone", 1, "nope-cream"))).toEqual({
      shadow: "plum",
      highlight: "cream",
      amount: 1,
    });
    expect(vjDomFilter(on("duotone", 0.6, "plum-jade"))).toBe("grayscale(0.6)");
  });

  it("sizes the mask from 30 to 100 percent of the frame height", () => {
    expect(vjDomMaskClipPath({ shape: "circle", amount: 0 })).toBe(
      "circle(15cqh at 50% 50%)",
    );
    expect(vjDomMaskClipPath({ shape: "circle", amount: 1 })).toBe(
      "circle(50cqh at 50% 50%)",
    );
    const star = vjDomMaskClipPath({ shape: "star", amount: 1 });
    expect(star.startsWith("polygon(calc(50% + 0cqh) calc(50% - 50cqh),")).toBe(
      true,
    );
    expect(star.split("), calc(").length).toBe(10);
    const heart = vjDomMaskClipPath({ shape: "heart", amount: 0.5 });
    expect(heart.startsWith("polygon(")).toBe(true);
    expect(heart).not.toContain("px");
  });

  it("turns the hue amount times 90 degrees per beat and bumps on the beat", () => {
    const pose = createVjDomBeatPose();
    const settings = {
      ...on("hueCycle", 0.5),
      ...on("zoomPulse", 1),
      ...on("beatPulse", 1),
    };
    fillVjDomBeatPose(pose, settings, 3, 0);
    expect(pose.hueDegrees).toBe(135);
    expect(pose.zoom).toBeCloseTo(1.15);
    expect(pose.pulseGain).toBeCloseTo(1.5);
    fillVjDomBeatPose(pose, settings, 3.5, 0.5);
    expect(pose.zoom).toBeCloseTo(1 + 0.15 * 0.25);
    fillVjDomBeatPose(pose, {}, 3.5, 0.5);
    expect(pose).toEqual(createVjDomBeatPose());
  });
});
