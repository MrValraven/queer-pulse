import { describe, expect, it } from "vitest";
import {
  VJ_COLOR_TOKENS,
  VJ_DUOTONE_PAIRS,
  VJ_PRIDE_FLAGS,
  type VjEffectSettings,
} from "../../../shared/contracts/vj";
import {
  buildVjPassGraph,
  type VjLayerDraw,
  type VjPassGraphInput,
  type VjPassStep,
} from "./vjPassGraph";
import type { VjPalette, VjRgb } from "./vjPalette";

function grey(level: number): VjRgb {
  return [level, level, level];
}

function testPalette(): VjPalette {
  const colours = Object.fromEntries(
    VJ_COLOR_TOKENS.map((colorToken) => [colorToken, grey(0.5)]),
  ) as VjPalette["colours"];
  const duotones = Object.fromEntries(
    VJ_DUOTONE_PAIRS.map((pair) => [pair, [grey(0.1), grey(0.9)]]),
  ) as unknown as VjPalette["duotones"];
  const flags = Object.fromEntries(
    VJ_PRIDE_FLAGS.map((flag) => [flag, [grey(0.2), grey(0.8)]]),
  ) as unknown as VjPalette["flags"];
  return { colours, duotones, flags };
}

const CLIP_DRAW: VjLayerDraw = {
  programKey: "source.clip",
  uniforms: { uFitMode: 0 },
  hasBackdrop: false,
};

function graphInput(
  overrides: Partial<VjPassGraphInput> = {},
): VjPassGraphInput {
  return {
    live: CLIP_DRAW,
    outgoing: null,
    mix: null,
    transition: null,
    mixBlend: null,
    settings: {},
    palette: testPalette(),
    gates: {
      invertBeatGate: 1,
      invertRamp: 1,
      glitchSeed: 0,
      glitchBurst: 0,
      isGlitchLumaShiftGranted: false,
      drive: 1,
    },
    output: { gain: 1, blackout: 0, curtain: 0, strobe: 0, slewLimit: 0 },
    outputHeight: 1080,
    isOutputIdle: false,
    ...overrides,
  };
}

function on(amount: number, variant: string | null = null) {
  return { isOn: true, amount, variant };
}

function programKeysOf(steps: readonly VjPassStep[]): string[] {
  return steps.map((step) => step.programKey);
}

const EVERY_EFFECT_ON: VjEffectSettings = {
  monochrome: on(0.5),
  invert: on(1, "beat"),
  tint: on(0.5, "jade"),
  vhs: on(0.6),
  glitch: on(0.4),
  dream: on(0.5),
  vignette: on(0.5),
  mirror: on(1, "horizontal"),
  rotate: on(0.25),
  echo: on(0.5),
  beatPulse: on(0.5),
  freeze: on(1),
};

describe("buildVjPassGraph", () => {
  it("draws only the live source and the output with every effect off", () => {
    const steps = buildVjPassGraph(graphInput());
    expect(programKeysOf(steps)).toEqual(["source.clip", "output"]);
    expect(steps[0]).toMatchObject({ output: "live", inputs: [] });
    expect(steps[1]).toMatchObject({
      inputs: ["live", "outputPrevious"],
      output: "outputCurrent",
    });
  });

  it("orders colour before texture before geometry before echo", () => {
    const keys = programKeysOf(
      buildVjPassGraph(graphInput({ settings: EVERY_EFFECT_ON })),
    );
    expect(keys).toEqual([
      "source.clip",
      "colour",
      "texture.vhs",
      "texture.glitch",
      "texture.dreamBlur",
      "texture.dreamBlur",
      "texture.dreamCombine",
      "texture.vignette",
      "geometry",
      "time.echo",
      "output",
    ]);
  });

  it("runs one colour step for three colour effects", () => {
    const keys = programKeysOf(
      buildVjPassGraph(
        graphInput({
          settings: {
            monochrome: on(0.5),
            saturate: on(0.5),
            hueShift: on(0.2),
          },
        }),
      ),
    );
    expect(keys.filter((programKey) => programKey === "colour")).toHaveLength(
      1,
    );
  });

  it("adds the transition step only while a transition runs", () => {
    const withoutTransition = buildVjPassGraph(
      graphInput({ outgoing: CLIP_DRAW }),
    );
    expect(programKeysOf(withoutTransition)).toEqual(["source.clip", "output"]);

    const steps = buildVjPassGraph(
      graphInput({
        outgoing: CLIP_DRAW,
        transition: { programKey: "transition.iris", progress: 0.4, seed: 7 },
      }),
    );
    const transitionStep = steps.find(
      (step) => step.programKey === "transition.iris",
    );
    expect(steps.map((step) => step.output)).toContain("outgoing");
    expect(transitionStep).toMatchObject({
      inputs: ["outgoing", "live"],
      uniforms: { uProgress: 0.4, uSeed: 7 },
    });
  });

  it("skips the mix step at amount 0 and blends at 0.5", () => {
    const atZero = buildVjPassGraph(
      graphInput({
        mix: CLIP_DRAW,
        mixBlend: { amount: 0, blendModeIndex: 1 },
      }),
    );
    expect(programKeysOf(atZero)).toEqual(["source.clip", "output"]);

    const atHalf = buildVjPassGraph(
      graphInput({
        mix: CLIP_DRAW,
        mixBlend: { amount: 0.5, blendModeIndex: 1 },
      }),
    );
    const mixStep = atHalf.find((step) => step.programKey === "mix");
    expect(mixStep).toMatchObject({
      inputs: ["live", "mix"],
      uniforms: { uMixAmount: 0.5, uBlendMode: 1 },
    });
    expect(atHalf.filter((step) => step.output === "mix")).toHaveLength(1);
  });

  it("feeds the mix layer straight into the chain at amount 1 in normal", () => {
    const steps = buildVjPassGraph(
      graphInput({
        mix: CLIP_DRAW,
        mixBlend: { amount: 1, blendModeIndex: 0 },
      }),
    );
    expect(programKeysOf(steps)).not.toContain("mix");
    expect(steps.at(-1)?.inputs[0]).toBe("mix");
  });

  it("never reads and writes the same target in one step", () => {
    const steps = buildVjPassGraph(
      graphInput({
        settings: EVERY_EFFECT_ON,
        outgoing: CLIP_DRAW,
        mix: CLIP_DRAW,
        transition: { programKey: "transition.fade", progress: 0.5, seed: 1 },
        mixBlend: { amount: 0.5, blendModeIndex: 2 },
      }),
    );
    for (const step of steps) {
      expect(step.inputs).not.toContain(step.output);
    }
  });

  it("runs dream as two half-size blurs and a combine", () => {
    const steps = buildVjPassGraph(
      graphInput({ settings: { dream: on(0.5) } }),
    );
    const [horizontal, vertical, combine] = steps.filter((step) =>
      step.programKey.startsWith("texture.dream"),
    );
    expect(horizontal).toMatchObject({
      inputs: ["live"],
      output: "dreamHalfA",
      scale: 0.5,
      uniforms: { uBlurDirection: [1, 0] },
    });
    expect(vertical).toMatchObject({
      inputs: ["dreamHalfA"],
      output: "dreamHalfB",
      scale: 0.5,
      uniforms: { uBlurDirection: [0, 1] },
    });
    // 2% of 1080 lines at amount 0.5, on a half-size target.
    expect(horizontal?.uniforms.uBlurRadius).toBeCloseTo(5.4);
    expect(combine).toMatchObject({
      programKey: "texture.dreamCombine",
      inputs: ["live", "dreamHalfB"],
      scale: 1,
      uniforms: { uDreamAmount: 0.5 },
    });
  });

  it("answers the output step alone while the blackout is fully up", () => {
    const steps = buildVjPassGraph(
      graphInput({
        settings: EVERY_EFFECT_ON,
        isOutputIdle: true,
        output: { gain: 1, blackout: 1, curtain: 0, strobe: 0, slewLimit: 0 },
      }),
    );
    expect(programKeysOf(steps)).toEqual(["output"]);
    expect(steps[0]?.uniforms.uBlackout).toBe(1);
  });

  it("passes the governed glitch and invert gates through", () => {
    const steps = buildVjPassGraph(
      graphInput({
        settings: {
          invert: on(1, "beat"),
          glitch: on(0.4),
          rgbSplit: on(0.4, "beat"),
        },
        gates: {
          invertBeatGate: 0,
          invertRamp: 1,
          glitchSeed: 42,
          glitchBurst: 0.7,
          isGlitchLumaShiftGranted: true,
          drive: 0.3,
        },
      }),
    );
    const uniformsOf = (programKey: string) =>
      steps.find((step) => step.programKey === programKey)?.uniforms;
    expect(uniformsOf("colour")?.uInvert).toBe(0);
    expect(uniformsOf("texture.glitch")).toMatchObject({
      uGlitchSeed: 42,
      uGlitchBurst: 0.7,
      uGlitchLumaShift: 1,
    });
    expect(uniformsOf("texture.rgbSplit")?.uRgbSplitDrive).toBe(0.3);
  });

  it("feeds echo the chain and the feedback target", () => {
    const steps = buildVjPassGraph(graphInput({ settings: { echo: on(0.5) } }));
    expect(steps.find((step) => step.programKey === "time.echo")).toMatchObject(
      {
        inputs: ["live", "feedback"],
        uniforms: { uEchoAmount: 0.5 },
      },
    );
  });
});
