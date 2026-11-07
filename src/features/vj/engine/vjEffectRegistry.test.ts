import { describe, expect, it } from "vitest";
import {
  VJ_COLOR_TOKENS,
  VJ_DUOTONE_PAIRS,
  VJ_EFFECT_CATALOG,
  VJ_EFFECT_IDS,
  VJ_GENERATOR_IDS,
  VJ_PRIDE_FLAGS,
  VJ_TRANSITION_IDS,
  type VjEffectId,
  type VjTempo,
} from "../../../shared/contracts/vj";
import { VJ_COLOUR_PROGRAMS } from "./shaders/vjGlslColour";
import { VJ_GENERATOR_PROGRAMS } from "./shaders/vjGlslGenerators";
import { VJ_GEOMETRY_PROGRAMS } from "./shaders/vjGlslGeometry";
import { VJ_MIX_PROGRAMS } from "./shaders/vjGlslMix";
import { VJ_OUTPUT_PROGRAMS } from "./shaders/vjGlslOutput";
import { VJ_SOURCE_PROGRAMS } from "./shaders/vjGlslSource";
import { VJ_TEXTURE_PROGRAMS } from "./shaders/vjGlslTexture";
import { VJ_TEXTURE_NEIGHBOUR_PROGRAMS } from "./shaders/vjGlslTextureNeighbours";
import { VJ_TIME_PROGRAMS } from "./shaders/vjGlslTime";
import { VJ_TRANSITION_PROGRAMS } from "./shaders/vjGlslTransitions";
import {
  VJ_EFFECT_REGISTRY,
  activeVjEffects,
  type VjEffectStage,
} from "./vjEffectRegistry";
import { colourUniformsOf, geometryUniformsOf } from "./vjEffectUniforms";
import { VJ_GENERATOR_REGISTRY } from "./vjGeneratorRegistry";
import type { VjPalette, VjRgb } from "./vjPalette";
import {
  VJ_TRANSITION_REGISTRY,
  resolveVjTransition,
  vjTransitionProgramKey,
} from "./vjTransitionRegistry";

const SHADER_RECORDS = [
  VJ_COLOUR_PROGRAMS,
  VJ_GEOMETRY_PROGRAMS,
  VJ_TEXTURE_PROGRAMS,
  VJ_TEXTURE_NEIGHBOUR_PROGRAMS,
  VJ_TIME_PROGRAMS,
  VJ_OUTPUT_PROGRAMS,
  VJ_SOURCE_PROGRAMS,
  VJ_TRANSITION_PROGRAMS,
  VJ_MIX_PROGRAMS,
  VJ_GENERATOR_PROGRAMS,
];

const TEMPO_120: VjTempo = {
  bpm: 120,
  downbeatAt: 0,
  quantize: "off",
  source: "manual",
};

function grey(level: number): VjRgb {
  return [level, level, level];
}

function testPalette(): VjPalette {
  const colours = Object.fromEntries(
    VJ_COLOR_TOKENS.map((colorToken, index) => [colorToken, grey(index / 10)]),
  ) as VjPalette["colours"];
  const duotones = Object.fromEntries(
    VJ_DUOTONE_PAIRS.map((pair) => [pair, [grey(0.1), grey(0.9)]]),
  ) as unknown as VjPalette["duotones"];
  const flags = Object.fromEntries(
    VJ_PRIDE_FLAGS.map((flag, index) => [
      flag,
      Array.from({ length: index + 4 }, () => grey(0.5)),
    ]),
  ) as unknown as VjPalette["flags"];
  return { colours, duotones, flags };
}

function expectedStageOf(effectId: VjEffectId): VjEffectStage {
  const { group } = VJ_EFFECT_CATALOG[effectId];
  if (group === "color") return "colour";
  if (group === "beat") return "output";
  if (group === "time") return effectId === "echo" ? "time" : "playhead";
  return group;
}

describe("VJ_EFFECT_REGISTRY", () => {
  it("covers exactly VJ_EFFECT_IDS", () => {
    expect(Object.keys(VJ_EFFECT_REGISTRY)).toEqual([...VJ_EFFECT_IDS]);
    for (const effectId of VJ_EFFECT_IDS) {
      expect(VJ_EFFECT_REGISTRY[effectId].effectId).toBe(effectId);
    }
  });

  it("puts each id in the stage its catalog group implies", () => {
    for (const effectId of VJ_EFFECT_IDS) {
      expect(VJ_EFFECT_REGISTRY[effectId].stage).toBe(
        expectedStageOf(effectId),
      );
    }
    expect(VJ_EFFECT_REGISTRY.monochrome.isFused).toBe(true);
    expect(VJ_EFFECT_REGISTRY.mirror.isFused).toBe(true);
    expect(VJ_EFFECT_REGISTRY.vhs.isFused).toBe(false);
    expect(VJ_EFFECT_REGISTRY.freeze.programKeys).toEqual([]);
    expect(VJ_EFFECT_REGISTRY.dream.programKeys).toEqual([
      "texture.dreamBlur",
      "texture.dreamCombine",
    ]);
  });

  it("names only program keys that have a shader source", () => {
    const shaderKeys = new Set(
      SHADER_RECORDS.flatMap((record) => Object.keys(record)),
    );
    const namedKeys = [
      ...VJ_EFFECT_IDS.flatMap(
        (effectId) => VJ_EFFECT_REGISTRY[effectId].programKeys,
      ),
      ...VJ_TRANSITION_IDS.flatMap((transitionId) => {
        const programKey = VJ_TRANSITION_REGISTRY[transitionId].programKey;
        return programKey === null ? [] : [programKey];
      }),
      ...VJ_GENERATOR_IDS.map(
        (generatorId) => VJ_GENERATOR_REGISTRY[generatorId].programKey,
      ),
    ];
    for (const programKey of namedKeys) {
      expect(shaderKeys.has(programKey), programKey).toBe(true);
    }
  });

  it("lists active effects in catalog order and skips amount 0", () => {
    const active = activeVjEffects({
      mirror: { isOn: true, amount: 0, variant: "quad" },
      vhs: { isOn: true, amount: 0.6, variant: null },
      monochrome: { isOn: true, amount: 0.3, variant: null },
      contrast: { isOn: true, amount: 0, variant: null },
      echo: { isOn: false, amount: 0.5, variant: null },
    });
    // mirror is fixed-amount, so it draws with its catalog default of 1.
    expect(active).toEqual(["monochrome", "vhs", "mirror"]);
  });

  it("maps every transition id and every generator id", () => {
    expect(Object.keys(VJ_TRANSITION_REGISTRY).sort()).toEqual(
      [...VJ_TRANSITION_IDS].sort(),
    );
    expect(Object.keys(VJ_GENERATOR_REGISTRY).sort()).toEqual(
      [...VJ_GENERATOR_IDS].sort(),
    );
    expect(VJ_TRANSITION_REGISTRY.cut.programKey).toBeNull();
    expect(VJ_TRANSITION_REGISTRY.dipWhite.whenDenied).toBe("fade");
    expect(VJ_TRANSITION_REGISTRY.glitch.whenDenied).toBe("fade");
    expect(vjTransitionProgramKey("dipWhite", false)).toBe("transition.fade");
    expect(vjTransitionProgramKey("dipWhite", true)).toBe(
      "transition.dipWhite",
    );
    expect(vjTransitionProgramKey("iris", false)).toBe("transition.iris");
  });

  it("resolves 4 beats at 120 BPM to 2000 ms and cut to 0 ms", () => {
    expect(
      resolveVjTransition(
        { mode: "fade", length: { unit: "beats", value: 4 } },
        TEMPO_120,
      ),
    ).toEqual({ mode: "fade", durationMs: 2000 });
    expect(
      resolveVjTransition(
        { mode: "cut", length: { unit: "ms", value: 800 } },
        TEMPO_120,
      ),
    ).toEqual({ mode: "cut", durationMs: 0 });
  });
});

describe("effect uniforms", () => {
  it("gates a beat invert by the beat gate and a steady invert by the ramp", () => {
    const palette = testPalette();
    const gates = { invertBeatGate: 0, invertRamp: 0.5 };
    expect(
      colourUniformsOf(
        { invert: { isOn: true, amount: 0.8, variant: "beat" } },
        palette,
        gates,
      ).uInvert,
    ).toBe(0);
    expect(
      colourUniformsOf(
        { invert: { isOn: true, amount: 0.8, variant: "steady" } },
        palette,
        gates,
      ).uInvert,
    ).toBeCloseTo(0.4);
  });

  it("carries 0 for every colour amount while its effect is off", () => {
    const uniforms = colourUniformsOf(
      { saturate: { isOn: false, amount: 0.7, variant: null } },
      testPalette(),
      { invertBeatGate: 1, invertRamp: 1 },
    );
    expect(uniforms.uSaturate).toBe(0);
    expect(uniforms.uMonochrome).toBe(0);
  });

  it("sends the pride flag's stripes and count for prideGrade", () => {
    const palette = testPalette();
    const uniforms = colourUniformsOf(
      { prideGrade: { isOn: true, amount: 0.6, variant: "trans" } },
      palette,
      { invertBeatGate: 1, invertRamp: 1 },
    );
    expect(uniforms.uPrideColourCount).toBe(palette.flags.trans.length);
    expect((uniforms.uPrideColours as Float32Array).length).toBe(33);
  });

  it("turns geometry variants into the ints the shader branches on", () => {
    const uniforms = geometryUniformsOf({
      mirror: { isOn: true, amount: 1, variant: "quad" },
      tile: { isOn: true, amount: 1, variant: "3x3" },
      kaleidoscope: { isOn: true, amount: 0.5, variant: "8" },
      mask: { isOn: false, amount: 0.8, variant: "heart" },
    });
    expect(uniforms.uMirrorMode).toBe(3);
    expect(uniforms.uTileCount).toBe(3);
    expect(uniforms.uKaleidoSegments).toBe(8);
    expect(uniforms.uMaskShape).toBe(0);
  });

  it("answers the flag index as uVariant for the flag wave generator", () => {
    const uniforms = VJ_GENERATOR_REGISTRY.prideFlagWave.uniformsOf(
      "lesbian",
      testPalette(),
    );
    expect(uniforms.uVariant).toBe(VJ_PRIDE_FLAGS.indexOf("lesbian"));
    expect(
      VJ_GENERATOR_REGISTRY.plasma.uniformsOf(null, testPalette()).uVariant,
    ).toBe(0);
  });
});
