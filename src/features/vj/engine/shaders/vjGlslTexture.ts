/**
 * Per-pixel texture effects (contract 3.2): vhs, filmGrain, scanlines,
 * vignette and lightLeaks. Each runs as its own full-screen pass over
 * `uSource`, and an amount of 0 draws the source unchanged. Pixel sizes are
 * given at 1080 lines and scale with the target height.
 */

import { vjFragment } from "./vjGlslCommon";
import type { VjProgramKey, VjShaderSource } from "./vjProgramKeys";

const VHS_BODY = `
uniform sampler2D uSource;
uniform float uVhsAmount;

void main() {
  float lineScale = uResolution.y / 1080.0;
  float bandCentre = fract(uTime * 0.07);
  float band = 1.0 - smoothstep(0.0, 0.08, abs(vUv.y - bandCentre));
  float lineJitter = vjNoise2(vec2(vUv.y * uResolution.y * 0.35, uTime * 24.0)) - 0.5;
  float shift = (band * 0.012 + lineJitter * 0.0025) * uVhsAmount;
  vec2 shiftedUv = vec2(vUv.x + shift, vUv.y);
  float bleed = 2.0 * lineScale / uResolution.x * uVhsAmount;
  vec3 centre = texture(uSource, shiftedUv).rgb;
  float red = texture(uSource, shiftedUv + vec2(bleed, 0.0)).r;
  float blue = texture(uSource, shiftedUv - vec2(bleed, 0.0)).b;
  vec3 colour = vec3(red, centre.g, blue);
  float lineNoise = vjHash12(vec2(floor(vUv.y * uResolution.y / lineScale), floor(uTime * 60.0)));
  colour += (lineNoise - 0.5) * 0.08 * uVhsAmount;
  colour += band * 0.05 * uVhsAmount;
  colour = mix(colour, vec3(vjLuma(colour)), 0.2 * uVhsAmount);
  outColour = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`;

const FILM_GRAIN_BODY = `
uniform sampler2D uSource;
uniform float uGrainAmount;

void main() {
  vec3 colour = texture(uSource, vUv).rgb;
  float frameSeed = fract(uTime * 7.31) * 613.0;
  float grain = vjHash12(gl_FragCoord.xy + frameSeed) - 0.5;
  float luma = vjLuma(colour);
  float midtoneWeight = 0.35 + 0.65 * (1.0 - abs(2.0 * luma - 1.0));
  colour += grain * 0.22 * uGrainAmount * midtoneWeight;
  outColour = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`;

const SCANLINES_BODY = `
uniform sampler2D uSource;
uniform float uScanlinesAmount;

void main() {
  vec3 colour = texture(uSource, vUv).rgb;
  float linePeriod = 3.0 * uResolution.y / 1080.0;
  float linePosition = fract(gl_FragCoord.y / linePeriod);
  float lineShape = smoothstep(0.5, 0.7, linePosition) * (1.0 - smoothstep(0.9, 1.0, linePosition));
  colour = mix(colour, vec3(0.0), lineShape * uScanlinesAmount);
  outColour = vec4(colour, 1.0);
}
`;

const VIGNETTE_BODY = `
uniform sampler2D uSource;
uniform float uVignetteAmount;

void main() {
  vec3 colour = texture(uSource, vUv).rgb;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 centred = (vUv - 0.5) * vec2(aspect, 1.0);
  float edgeDistance = length(centred) / length(vec2(aspect * 0.5, 0.5));
  float darkness = smoothstep(0.4, 1.0, edgeDistance) * uVignetteAmount;
  outColour = vec4(colour * (1.0 - darkness), 1.0);
}
`;

const LIGHT_LEAKS_BODY = `
uniform sampler2D uSource;
uniform float uLightLeaksAmount;
uniform vec3 uLeakColourA;
uniform vec3 uLeakColourB;

float leakGlow(vec2 centre, float radius) {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 offset = (vUv - centre) * vec2(aspect, 1.0);
  return exp(-dot(offset, offset) / (radius * radius));
}

void main() {
  vec3 colour = texture(uSource, vUv).rgb;
  vec2 centreA = vec2(0.12 + 0.18 * sin(uTime * 0.11), 0.25 + 0.2 * sin(uTime * 0.07 + 1.3));
  vec2 centreB = vec2(0.88 + 0.14 * sin(uTime * 0.09 + 2.1), 0.7 + 0.22 * sin(uTime * 0.05 + 0.4));
  float breathA = 0.75 + 0.25 * sin(uTime * 0.23);
  float breathB = 0.75 + 0.25 * sin(uTime * 0.19 + 1.7);
  vec3 leak = uLeakColourA * leakGlow(centreA, 0.55) * breathA;
  leak += uLeakColourB * leakGlow(centreB, 0.45) * breathB;
  leak = clamp(leak * uLightLeaksAmount, 0.0, 1.0);
  colour = vec3(1.0) - (vec3(1.0) - colour) * (vec3(1.0) - leak);
  outColour = vec4(colour, 1.0);
}
`;

function textureProgram(
  programKey: VjProgramKey,
  body: string,
  uniforms: readonly string[],
): VjShaderSource {
  return {
    fragment: vjFragment(programKey, body),
    uniforms,
    samplers: ["uSource"],
  };
}

export const VJ_TEXTURE_PROGRAMS: Readonly<
  Partial<Record<VjProgramKey, VjShaderSource>>
> = {
  "texture.vhs": textureProgram("texture.vhs", VHS_BODY, ["uVhsAmount"]),
  "texture.filmGrain": textureProgram("texture.filmGrain", FILM_GRAIN_BODY, [
    "uGrainAmount",
  ]),
  "texture.scanlines": textureProgram("texture.scanlines", SCANLINES_BODY, [
    "uScanlinesAmount",
  ]),
  "texture.vignette": textureProgram("texture.vignette", VIGNETTE_BODY, [
    "uVignetteAmount",
  ]),
  "texture.lightLeaks": textureProgram("texture.lightLeaks", LIGHT_LEAKS_BODY, [
    "uLightLeaksAmount",
    "uLeakColourA",
    "uLeakColourB",
  ]),
};
