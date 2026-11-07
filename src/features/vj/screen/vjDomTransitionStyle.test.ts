import { describe, expect, it } from "vitest";
import {
  VJ_BLEND_MODES,
  VJ_TRANSITION_CATALOG,
  VJ_TRANSITION_IDS,
} from "../../../shared/contracts/vj";
import {
  vjDomBlendOf,
  vjDomMixOpacities,
  vjDomTransitionOf,
} from "./vjDomTransitionStyle";

describe("vjDomTransitionOf", () => {
  it("answers a clip-path animation for wipes and iris", () => {
    // wipeLeft uncovers from the right edge moving left, as the shader does.
    expect(vjDomTransitionOf("wipeLeft")).toEqual({
      kind: "clip",
      dipColor: null,
      clipFrom: "inset(0 0 0 100%)",
      clipTo: "inset(0 0 0 0)",
    });
    // wipeRight uncovers from the left edge moving right.
    expect(vjDomTransitionOf("wipeRight")).toEqual({
      kind: "clip",
      dipColor: null,
      clipFrom: "inset(0 100% 0 0)",
      clipTo: "inset(0 0 0 0)",
    });
    const iris = vjDomTransitionOf("iris");
    expect(iris.kind).toBe("clip");
    expect(iris.clipFrom).toBe("circle(0% at 50% 50%)");
    expect(iris.clipTo).toMatch(/^circle\(7\d% at 50% 50%\)$/);
    expect(vjDomTransitionOf("wipeRadial").kind).toBe("sweep");
  });

  it("answers a white dip for dipWhite", () => {
    expect(vjDomTransitionOf("dipWhite")).toMatchObject({
      kind: "dip",
      dipColor: "white",
    });
    expect(vjDomTransitionOf("dipBlack")).toMatchObject({
      kind: "dip",
      dipColor: "black",
    });
  });

  it("answers the fade for every id the catalog marks DOM-incapable", () => {
    const domIncapable = VJ_TRANSITION_IDS.filter(
      (mode) => !VJ_TRANSITION_CATALOG[mode].isDomCapable,
    );
    expect(domIncapable.length).toBeGreaterThan(0);
    for (const mode of domIncapable) {
      expect(vjDomTransitionOf(mode)).toEqual(vjDomTransitionOf("fade"));
    }
    expect(vjDomTransitionOf("fade").kind).toBe("fade");
    expect(vjDomTransitionOf("cut").kind).toBe("cut");
  });

  it("draws every DOM-capable id with its own kind", () => {
    for (const mode of VJ_TRANSITION_IDS) {
      if (!VJ_TRANSITION_CATALOG[mode].isDomCapable || mode === "fade") {
        continue;
      }
      expect(vjDomTransitionOf(mode).kind).not.toBe("fade");
    }
  });
});

describe("vjDomBlendOf", () => {
  it("maps add to plus-lighter", () => {
    expect(vjDomBlendOf("add")).toBe("plus-lighter");
  });

  it("passes every other blend mode through by name", () => {
    for (const blendMode of VJ_BLEND_MODES) {
      if (blendMode === "add") continue;
      expect(vjDomBlendOf(blendMode)).toBe(blendMode);
    }
  });
});

describe("vjDomMixOpacities", () => {
  it("crossfades linearly in normal mode", () => {
    expect(vjDomMixOpacities(0, "normal")).toEqual({
      layerOpacity: 0,
      baseOpacity: 1,
    });
    expect(vjDomMixOpacities(0.4, "normal")).toEqual({
      layerOpacity: 0.4,
      baseOpacity: 1,
    });
    expect(vjDomMixOpacities(1, "normal")).toEqual({
      layerOpacity: 1,
      baseOpacity: 1,
    });
  });

  it("ramps the blend in to half way, then fades the base out", () => {
    expect(vjDomMixOpacities(0, "screen")).toEqual({
      layerOpacity: 0,
      baseOpacity: 1,
    });
    expect(vjDomMixOpacities(0.25, "screen")).toEqual({
      layerOpacity: 0.5,
      baseOpacity: 1,
    });
    expect(vjDomMixOpacities(0.5, "multiply")).toEqual({
      layerOpacity: 1,
      baseOpacity: 1,
    });
    expect(vjDomMixOpacities(0.75, "difference").baseOpacity).toBeCloseTo(0.5);
    expect(vjDomMixOpacities(1, "add")).toEqual({
      layerOpacity: 1,
      baseOpacity: 0,
    });
  });

  it("clamps an amount outside 0..1", () => {
    expect(vjDomMixOpacities(Number.NaN, "normal").layerOpacity).toBe(0);
    expect(vjDomMixOpacities(3, "lighten")).toEqual({
      layerOpacity: 1,
      baseOpacity: 0,
    });
  });
});
