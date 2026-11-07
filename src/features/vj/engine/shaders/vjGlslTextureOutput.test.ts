import { describe, expect, it } from "vitest";
import {
  VJ_EFFECT_CATALOG,
  VJ_EFFECT_IDS,
} from "../../../../shared/contracts/vj";
import { VJ_GLSL_VERSION } from "./vjGlslCommon";
import { VJ_OUTPUT_PROGRAMS } from "./vjGlslOutput";
import { VJ_TEXTURE_PROGRAMS } from "./vjGlslTexture";
import { VJ_TEXTURE_NEIGHBOUR_PROGRAMS } from "./vjGlslTextureNeighbours";
import { VJ_TIME_PROGRAMS } from "./vjGlslTime";
import type { VjProgramKey, VjShaderSource } from "./vjProgramKeys";

const ALL_PROGRAMS: Readonly<Partial<Record<VjProgramKey, VjShaderSource>>> = {
  ...VJ_TEXTURE_PROGRAMS,
  ...VJ_TEXTURE_NEIGHBOUR_PROGRAMS,
  ...VJ_TIME_PROGRAMS,
  ...VJ_OUTPUT_PROGRAMS,
};

const PROGRAM_ENTRIES = Object.entries(ALL_PROGRAMS) as [
  VjProgramKey,
  VjShaderSource,
][];

function programOf(programKey: VjProgramKey): VjShaderSource {
  const shaderSource = ALL_PROGRAMS[programKey];
  if (!shaderSource) throw new Error(`missing program ${programKey}`);
  return shaderSource;
}

/** The program's own text: everything after the program key marker. */
function bodyOf(programKey: VjProgramKey): string {
  const fragment = programOf(programKey).fragment;
  const marker = `// vj-program-key: ${programKey}`;
  return fragment.slice(fragment.indexOf(marker) + marker.length);
}

function declaredUniformNames(body: string): string[] {
  return [...body.matchAll(/^\s*uniform\s+\w+\s+(\w+)/gm)].flatMap((match) =>
    match[1] === undefined ? [] : [match[1]],
  );
}

function declaresUniform(body: string, uniformName: string): boolean {
  return new RegExp(`^\\s*uniform\\s+\\w+\\s+${uniformName}\\s*;`, "m").test(
    body,
  );
}

function textureTapCount(body: string): number {
  return body.match(/\btexture\(/g)?.length ?? 0;
}

describe("vj texture, echo and output programs", () => {
  it("starts every fragment with the GLSL ES 3.00 version line", () => {
    for (const [, shaderSource] of PROGRAM_ENTRIES) {
      expect(shaderSource.fragment.startsWith(VJ_GLSL_VERSION)).toBe(true);
    }
  });

  it("declares every uniform and sampler each program lists", () => {
    for (const [programKey, shaderSource] of PROGRAM_ENTRIES) {
      const body = bodyOf(programKey);
      for (const uniformName of shaderSource.uniforms) {
        expect(declaresUniform(body, uniformName), uniformName).toBe(true);
      }
      for (const samplerName of shaderSource.samplers) {
        expect(body).toMatch(
          new RegExp(`^\\s*uniform\\s+sampler2D\\s+${samplerName}\\s*;`, "m"),
        );
      }
      expect(declaredUniformNames(body).sort()).toEqual(
        [...shaderSource.uniforms, ...shaderSource.samplers].sort(),
      );
    }
  });

  it("has a program for every texture-group id of the catalog (dream as blur plus combine)", () => {
    const textureEffectIds = VJ_EFFECT_IDS.filter(
      (effectId) => VJ_EFFECT_CATALOG[effectId].group === "texture",
    );
    expect(textureEffectIds.length).toBeGreaterThan(0);
    for (const effectId of textureEffectIds) {
      const programKeys: VjProgramKey[] =
        effectId === "dream"
          ? ["texture.dreamBlur", "texture.dreamCombine"]
          : [`texture.${effectId}` as VjProgramKey];
      for (const programKey of programKeys) {
        expect(ALL_PROGRAMS[programKey], programKey).toBeDefined();
      }
    }
  });

  it("has the echo program and the output program", () => {
    expect(programOf("time.echo").samplers).toEqual(["uSource", "uFeedback"]);
    expect(programOf("output").samplers).toEqual(["uSource", "uPrevious"]);
  });

  it("keeps every neighbour effect at 16 texture taps or fewer", () => {
    for (const programKey of Object.keys(
      VJ_TEXTURE_NEIGHBOUR_PROGRAMS,
    ) as VjProgramKey[]) {
      const body = bodyOf(programKey);
      expect(body).not.toMatch(/\bfor\s*\(|\bwhile\s*\(/);
      expect(textureTapCount(body), programKey).toBeLessThanOrEqual(16);
    }
    expect(textureTapCount(bodyOf("texture.dreamBlur"))).toBe(9);
  });

  it("changes glitch mean luminance only behind uGlitchLumaShift", () => {
    const body = bodyOf("texture.glitch");
    const inversions = body.match(/vec3\(1\.0\) - colour/g) ?? [];
    expect(inversions).toHaveLength(1);
    const gateMatch = body.match(/float (\w+) = uGlitchLumaShift \*/);
    expect(gateMatch).not.toBeNull();
    const gateName = gateMatch?.[1] ?? "";
    expect(body).toContain(
      `colour = mix(colour, vec3(1.0) - colour, ${gateName});`,
    );
    expect(body.match(/uGlitchLumaShift/g)).toHaveLength(2);
  });

  it("applies the slew limit only when uSlewLimit is above zero", () => {
    const body = bodyOf("output");
    const guardIndex = body.indexOf("if (uSlewLimit > 0.0) {");
    expect(guardIndex).toBeGreaterThan(-1);
    const guardedBlock = body.slice(guardIndex, body.indexOf("}", guardIndex));
    expect(guardedBlock).toContain("texture(uPrevious, vUv)");
    expect(guardedBlock).toContain(
      "colour = previous + clamp(colour - previous, -uSlewLimit, uSlewLimit);",
    );
    const unguardedBody = body.replace(guardedBlock, "");
    expect(unguardedBody).not.toContain("uPrevious, vUv");
  });

  it("feeds back at 0.9 times the echo amount", () => {
    expect(bodyOf("time.echo")).toContain(
      "max(source, feedback * 0.9 * uEchoAmount)",
    );
  });

  it("marks each fragment with its program key", () => {
    for (const [programKey, shaderSource] of PROGRAM_ENTRIES) {
      expect(shaderSource.fragment).toContain(
        `// vj-program-key: ${programKey}\n`,
      );
    }
  });
});
