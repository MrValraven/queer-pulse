import { describe, expect, it } from "vitest";
import {
  VJ_BLEND_MODES,
  VJ_GENERATOR_IDS,
  VJ_TRANSITION_IDS,
} from "../../../../shared/contracts/vj";
import { VJ_FRAME_UNIFORM_NAMES } from "./vjGlslCommon";
import { VJ_GENERATOR_PROGRAMS } from "./vjGlslGenerators";
import { VJ_MIX_PROGRAMS } from "./vjGlslMix";
import { VJ_SOURCE_PROGRAMS } from "./vjGlslSource";
import { VJ_TRANSITION_PROGRAMS } from "./vjGlslTransitions";
import type { VjProgramKey, VjShaderSource } from "./vjProgramKeys";

const ALL_PROGRAMS = {
  ...VJ_SOURCE_PROGRAMS,
  ...VJ_TRANSITION_PROGRAMS,
  ...VJ_MIX_PROGRAMS,
  ...VJ_GENERATOR_PROGRAMS,
};

const PROGRAM_ENTRIES = Object.entries(ALL_PROGRAMS) as [
  VjProgramKey,
  VjShaderSource,
][];

function programOf(programKey: VjProgramKey): VjShaderSource {
  const program = ALL_PROGRAMS[programKey];
  if (!program) throw new Error(`missing program ${programKey}`);
  return program;
}

/** Every `uniform <type> <name>` the fragment declares, array brackets dropped. */
function declaredUniforms(fragment: string): Map<string, string> {
  const declared = new Map<string, string>();
  for (const match of fragment.matchAll(
    /uniform\s+(\w+)\s+(\w+)(\[\d+\])?\s*;/g,
  )) {
    const [, uniformType, uniformName] = match;
    if (uniformType && uniformName) declared.set(uniformName, uniformType);
  }
  return declared;
}

describe("vj source, transition, mix and generator shaders", () => {
  it("has a program for every transition id except cut", () => {
    const transitionsByKey: Readonly<
      Record<string, VjShaderSource | undefined>
    > = VJ_TRANSITION_PROGRAMS;
    for (const transitionId of VJ_TRANSITION_IDS) {
      const program = transitionsByKey[`transition.${transitionId}`];
      if (transitionId === "cut") {
        expect(program).toBeUndefined();
      } else {
        expect(program, transitionId).toBeDefined();
      }
    }
    expect(Object.keys(VJ_TRANSITION_PROGRAMS)).toHaveLength(
      VJ_TRANSITION_IDS.length - 1,
    );
  });

  it("has a program for every generator id", () => {
    expect(Object.keys(VJ_GENERATOR_PROGRAMS).sort()).toEqual(
      VJ_GENERATOR_IDS.map((generatorId) => `generator.${generatorId}`).sort(),
    );
  });

  it("declares uFrom, uTo, uProgress and uSeed in every transition", () => {
    for (const program of Object.values(VJ_TRANSITION_PROGRAMS)) {
      const declared = declaredUniforms(program?.fragment ?? "");
      expect(declared.get("uFrom")).toBe("sampler2D");
      expect(declared.get("uTo")).toBe("sampler2D");
      expect(declared.get("uProgress")).toBe("float");
      expect(declared.get("uSeed")).toBe("float");
      expect(program?.samplers).toEqual(["uFrom", "uTo"]);
    }
  });

  it("branches on all six blend modes in the mix program", () => {
    const { fragment } = programOf("mix");
    expect(VJ_BLEND_MODES).toHaveLength(6);
    VJ_BLEND_MODES.forEach((blendMode, modeIndex) => {
      expect(fragment, blendMode).toContain(`uBlendMode == ${modeIndex}`);
      expect(fragment, blendMode).toContain(`// ${blendMode}`);
    });
  });

  it("declares every uniform and sampler each program lists", () => {
    for (const [programKey, program] of PROGRAM_ENTRIES) {
      const declared = declaredUniforms(program.fragment);
      for (const uniformName of program.uniforms) {
        expect(
          declared.get(uniformName),
          `${programKey} ${uniformName}`,
        ).toMatch(/^(float|int|vec2|vec3)$/);
      }
      for (const samplerName of program.samplers) {
        expect(
          declared.get(samplerName),
          `${programKey} ${samplerName}`,
        ).toMatch(/^sampler2D(Array)?$/);
      }
      const listed = new Set([
        ...program.uniforms,
        ...program.samplers,
        ...VJ_FRAME_UNIFORM_NAMES,
      ]);
      for (const uniformName of declared.keys()) {
        expect(listed.has(uniformName), `${programKey} ${uniformName}`).toBe(
          true,
        );
      }
    }
  });

  it("flips v in both source programs", () => {
    for (const programKey of ["source.clip", "source.ring"] as const) {
      expect(programOf(programKey).fragment).toContain("1.0 - sourceUv.y");
    }
    expect(programOf("source.ring").samplers[0]).toBe("uRing");
    expect(
      declaredUniforms(programOf("source.ring").fragment).get("uRing"),
    ).toBe("sampler2DArray");
  });

  it("starts every fragment with the version line and marks it with its program key", () => {
    for (const [programKey, program] of PROGRAM_ENTRIES) {
      expect(program.fragment.startsWith("#version 300 es\n")).toBe(true);
      expect(program.fragment).toContain(`// vj-program-key: ${programKey}\n`);
    }
  });

  it("reads generator colours from uniforms with no colour constants in the bodies", () => {
    for (const program of Object.values(VJ_GENERATOR_PROGRAMS)) {
      const body = program?.fragment.split("// vj-program-key:")[1] ?? "";
      const colourLiterals = body.match(/vec3\(\s*0?\.\d+\s*,/g) ?? [];
      expect(colourLiterals).toEqual([]);
    }
  });
});
