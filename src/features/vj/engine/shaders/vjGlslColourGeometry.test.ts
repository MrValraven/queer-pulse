import { describe, expect, it } from "vitest";
import {
  VJ_EFFECT_CATALOG,
  VJ_EFFECT_IDS,
  type VjEffectGroup,
  type VjEffectId,
} from "../../../../shared/contracts/vj";
import {
  VJ_FRAME_UNIFORM_NAMES,
  VJ_GLSL_HELPERS,
  VJ_GLSL_VERSION,
  VJ_GLSL_VERTEX,
  vjFragment,
} from "./vjGlslCommon";
import { VJ_COLOUR_PROGRAMS } from "./vjGlslColour";
import { VJ_GEOMETRY_PROGRAMS } from "./vjGlslGeometry";
import {
  VJ_PROGRAM_KEYS,
  type VjProgramKey,
  type VjShaderSource,
} from "./vjProgramKeys";

const PROGRAMS: Array<[VjProgramKey, VjShaderSource]> = [
  ...Object.entries(VJ_COLOUR_PROGRAMS),
  ...Object.entries(VJ_GEOMETRY_PROGRAMS),
] as Array<[VjProgramKey, VjShaderSource]>;

function escapeForPattern(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function declarationPattern(uniformName: string, flags = "m"): RegExp {
  return new RegExp(
    `^uniform \\w+ ${escapeForPattern(uniformName)}(\\[\\d+\\])?;$`,
    flags,
  );
}

function declaredUniformNames(fragment: string): string[] {
  return [...fragment.matchAll(/^uniform \w+ (\w+)(\[\d+\])?;$/gm)].flatMap(
    (match) => (match[1] === undefined ? [] : [match[1]]),
  );
}

function effectFunctionName(effectId: VjEffectId): string {
  return `vjEffect${effectId.charAt(0).toUpperCase()}${effectId.slice(1)}`;
}

function idsOfGroup(group: VjEffectGroup): VjEffectId[] {
  return VJ_EFFECT_IDS.filter(
    (effectId) => VJ_EFFECT_CATALOG[effectId].group === group,
  );
}

function fragmentOf(
  record: Readonly<Partial<Record<VjProgramKey, VjShaderSource>>>,
  programKey: VjProgramKey,
): string {
  const source = record[programKey];
  if (!source) {
    throw new Error(`missing program ${programKey}`);
  }
  return source.fragment;
}

describe("VJ GLSL prelude, colour and geometry programs", () => {
  it("starts every fragment with the GLSL ES 3.00 version line", () => {
    expect(PROGRAMS.length).toBe(2);
    for (const [, source] of PROGRAMS) {
      expect(source.fragment.startsWith("#version 300 es\n")).toBe(true);
      expect(source.fragment.startsWith(VJ_GLSL_VERSION)).toBe(true);
    }
    expect(VJ_GLSL_VERTEX.startsWith("#version 300 es\n")).toBe(true);
  });

  it("declares every uniform and sampler each program lists", () => {
    for (const [, source] of PROGRAMS) {
      for (const uniformName of source.uniforms) {
        expect(source.fragment).toMatch(declarationPattern(uniformName));
      }
      for (const samplerName of source.samplers) {
        expect(source.fragment).toMatch(
          new RegExp(`^uniform sampler2D(Array)? ${samplerName};$`, "m"),
        );
      }
    }
  });

  it("lists every declared uniform outside the frame uniforms", () => {
    const frameNames: readonly string[] = VJ_FRAME_UNIFORM_NAMES;
    for (const [, source] of PROGRAMS) {
      const listed = [...source.uniforms, ...source.samplers].sort();
      const declared = declaredUniformNames(source.fragment)
        .filter((uniformName) => !frameNames.includes(uniformName))
        .sort();
      expect(declared).toEqual(listed);
      for (const uniformName of source.uniforms) {
        expect(frameNames).not.toContain(uniformName);
      }
    }
  });

  it("declares the seven frame uniforms once", () => {
    expect(VJ_FRAME_UNIFORM_NAMES).toHaveLength(7);
    for (const [, source] of PROGRAMS) {
      for (const uniformName of VJ_FRAME_UNIFORM_NAMES) {
        const matches = source.fragment.match(
          declarationPattern(uniformName, "gm"),
        );
        expect(matches).toHaveLength(1);
      }
    }
  });

  it("has a function for every color-group id of the catalog", () => {
    const fragment = fragmentOf(VJ_COLOUR_PROGRAMS, "colour");
    const colourIds = idsOfGroup("color");
    expect(colourIds).toHaveLength(10);
    for (const effectId of colourIds) {
      expect(fragment).toMatch(
        new RegExp(`\\bvec3 ${effectFunctionName(effectId)}\\(`),
      );
    }
  });

  it("applies the colour functions in catalog order", () => {
    const fragment = fragmentOf(VJ_COLOUR_PROGRAMS, "colour");
    const mainBody = fragment.slice(fragment.indexOf("void main()"));
    const callPositions = idsOfGroup("color").map((effectId) =>
      mainBody.indexOf(`colour = ${effectFunctionName(effectId)}(`),
    );
    for (const position of callPositions) {
      expect(position).toBeGreaterThan(-1);
    }
    expect([...callPositions].sort((first, second) => first - second)).toEqual(
      callPositions,
    );
  });

  it("has a function for every geometry-group id of the catalog", () => {
    const fragment = fragmentOf(VJ_GEOMETRY_PROGRAMS, "geometry");
    const geometryIds = idsOfGroup("geometry");
    expect(geometryIds).toHaveLength(7);
    for (const effectId of geometryIds) {
      expect(fragment).toMatch(
        new RegExp(`\\b(vec2|float) ${effectFunctionName(effectId)}\\(`),
      );
    }
  });

  it("chains the geometry remaps before one fetch and masks after it", () => {
    const fragment = fragmentOf(VJ_GEOMETRY_PROGRAMS, "geometry");
    const mainBody = fragment.slice(fragment.indexOf("void main()"));
    const chainOrder = [
      "vjEffectKenBurns(",
      "vjEffectZoomPulse(",
      "vjEffectRotate(",
      "vjEffectTile(",
      "vjEffectMirror(",
      "vjEffectKaleidoscope(",
      "texture(uSource",
      "vjEffectMask(",
    ].map((call) => mainBody.indexOf(call));
    for (const position of chainOrder) {
      expect(position).toBeGreaterThan(-1);
    }
    expect([...chainOrder].sort((first, second) => first - second)).toEqual(
      chainOrder,
    );
    expect(mainBody.match(/texture\(/g)).toHaveLength(1);
  });

  it("marks each fragment with its program key", () => {
    for (const [programKey, source] of PROGRAMS) {
      expect(VJ_PROGRAM_KEYS).toContain(programKey);
      expect(source.fragment).toContain(`// vj-program-key: ${programKey}\n`);
      expect(source.fragment.match(/\/\/ vj-program-key: /g)).toHaveLength(1);
    }
  });

  it("puts the prelude parts in order ahead of the body", () => {
    const fragment = vjFragment("colour", "void main() {}\n");
    const partPositions = [
      fragment.indexOf("#version 300 es"),
      fragment.indexOf("in vec2 vUv;"),
      fragment.indexOf("out vec4 outColour;"),
      fragment.indexOf("uniform vec2 uResolution;"),
      fragment.indexOf(VJ_GLSL_HELPERS),
      fragment.indexOf("// vj-program-key: colour"),
      fragment.indexOf("void main() {}"),
    ];
    expect(partPositions.every((position) => position > -1)).toBe(true);
    expect([...partPositions].sort((first, second) => first - second)).toEqual(
      partPositions,
    );
  });

  it("builds the vertex triangle from gl_VertexID and hands vUv on", () => {
    expect(VJ_GLSL_VERTEX).toContain("gl_VertexID");
    expect(VJ_GLSL_VERTEX).toContain("out vec2 vUv;");
    expect(VJ_GLSL_VERTEX).not.toMatch(/^in /m);
  });

  it("defines every helper the plan names", () => {
    for (const helperName of [
      "vjLuma",
      "vjRgbToHsv",
      "vjHsvToRgb",
      "vjHueRotate",
      "vjHash12",
      "vjNoise2",
      "vjRotate2",
      "vjSrgbToLinear",
      "vjLinearToSrgb",
    ]) {
      expect(VJ_GLSL_HELPERS).toMatch(
        new RegExp(`^(float|vec2|vec3|mat2) ${helperName}\\(`, "m"),
      );
    }
  });

  it("reflects the left half onto the right for horizontal mirror", () => {
    const fragment = fragmentOf(VJ_GEOMETRY_PROGRAMS, "geometry");
    const mirrorBody = fragment.slice(
      fragment.indexOf("vec2 vjEffectMirror("),
      fragment.indexOf("vec2 vjMirrorRepeat("),
    );
    expect(mirrorBody).toContain("if (mirrorMode == 1 || mirrorMode == 3)");
    expect(mirrorBody).toContain("uv.x = 0.5 - abs(uv.x - 0.5);");
    expect(mirrorBody).toContain("if (mirrorMode == 2 || mirrorMode == 3)");
    expect(mirrorBody).toContain("uv.y = 0.5 + abs(uv.y - 0.5);");
  });
});
