import { describe, expect, it } from "vitest";
import {
  nextVjRenderScale,
  vjCanvasSize,
  VJ_ENGINE_MAX_PIXELS,
  type VjRenderScaleSample,
} from "./vjRenderScale";

const STEADY: VjRenderScaleSample = {
  fps: 60,
  refreshHz: 60,
  activeEffectCount: 0,
  msBelowTarget: 0,
  msAtTarget: 0,
  msSinceChange: 60_000,
};

describe("nextVjRenderScale", () => {
  it("drops one step after 3 s below target with effects on", () => {
    const struggling = {
      ...STEADY,
      fps: 40,
      activeEffectCount: 2,
      msBelowTarget: 3000,
    };

    expect(nextVjRenderScale(1, struggling)).toBe(0.75);
    expect(nextVjRenderScale(0.75, struggling)).toBe(0.5);
    expect(nextVjRenderScale(0.5, struggling)).toBe(0.5);
    expect(nextVjRenderScale(1, { ...struggling, msBelowTarget: 2999 })).toBe(
      1,
    );
    expect(nextVjRenderScale(1, { ...struggling, msSinceChange: 2000 })).toBe(
      1,
    );
  });

  it("holds full scale with every effect off", () => {
    const slowWithoutEffects = {
      ...STEADY,
      fps: 30,
      activeEffectCount: 0,
      msBelowTarget: 20_000,
    };

    expect(nextVjRenderScale(1, slowWithoutEffects)).toBe(1);
  });

  it("rises after 10 s at target", () => {
    const recovered = { ...STEADY, fps: 59, msAtTarget: 10_000 };

    expect(nextVjRenderScale(0.5, recovered)).toBe(0.75);
    expect(nextVjRenderScale(0.75, recovered)).toBe(1);
    expect(nextVjRenderScale(1, recovered)).toBe(1);
    expect(nextVjRenderScale(0.5, { ...recovered, msAtTarget: 9999 })).toBe(
      0.5,
    );
    expect(nextVjRenderScale(0.5, { ...recovered, msSinceChange: 2999 })).toBe(
      0.5,
    );
  });
});

describe("vjCanvasSize", () => {
  it("caps a 4K projector canvas at 1080p worth of pixels", () => {
    expect(vjCanvasSize(3840, 2160, 1)).toEqual({ width: 1920, height: 1080 });
    expect(vjCanvasSize(1920, 1080, 2)).toEqual({ width: 1920, height: 1080 });

    const ultrawide = vjCanvasSize(3440, 1440, 1);
    expect(ultrawide.width * ultrawide.height).toBeLessThanOrEqual(
      VJ_ENGINE_MAX_PIXELS,
    );
    expect(ultrawide.width / ultrawide.height).toBeCloseTo(3440 / 1440, 2);
  });

  it("keeps a small canvas at its device pixel size", () => {
    expect(vjCanvasSize(800, 450, 1.5)).toEqual({ width: 1200, height: 675 });
  });
});
