/**
 * The GLSL ES 3.00 prelude every VJ engine program shares (engine plan, Task
 * E2): the version line, the attribute-free vertex shader, the frame uniforms
 * and the helper functions. `vjFragment()` joins them in front of a program
 * body, so each shader module only writes what is its own.
 *
 * Texture coordinates follow the GL convention: `vUv.y` is 0 at the bottom of
 * a render target and 1 at its top. The source passes flip v once on upload,
 * so every later pass reads an upright image.
 */

import type { VjProgramKey } from "./vjProgramKeys";

export const VJ_GLSL_VERSION =
  "#version 300 es\nprecision highp float;\nprecision highp sampler2DArray;\n";

/** The most colours a pride flag uniform array holds (`uPrideColours[11]`, `uFlagColours[11]`). */
export const VJ_GLSL_MAX_FLAG_STRIPES = 11;

/**
 * One triangle that covers the whole target, built from `gl_VertexID` alone
 * (vertices 0, 1 and 2 land on (0,0), (2,0) and (0,2) in uv space), so the
 * engine binds no vertex buffer.
 */
export const VJ_GLSL_VERTEX = `#version 300 es
out vec2 vUv;
void main() {
  vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = corner;
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const VJ_FRAME_UNIFORM_NAMES = [
  "uResolution",
  "uTime",
  "uBeats",
  "uBeatPhase",
  "uBarPhase",
  "uBeatPulse",
  "uDrive",
] as const;
type VjFrameUniformName = (typeof VJ_FRAME_UNIFORM_NAMES)[number];

const VJ_FRAME_UNIFORM_TYPES: Readonly<Record<VjFrameUniformName, string>> = {
  uResolution: "vec2",
  uTime: "float",
  uBeats: "float",
  uBeatPhase: "float",
  uBarPhase: "float",
  uBeatPulse: "float",
  uDrive: "float",
};

const VJ_GLSL_FRAME_UNIFORMS = VJ_FRAME_UNIFORM_NAMES.map(
  (uniformName) =>
    `uniform ${VJ_FRAME_UNIFORM_TYPES[uniformName]} ${uniformName};\n`,
).join("");

/**
 * Shared helpers. Luma uses the Rec. 709 weights on the encoded values. Hue turns are
 * fractions of a full circle, so 0.25 is 90 degrees.
 */
export const VJ_GLSL_HELPERS = `
const float VJ_TAU = 6.283185307179586;

float vjLuma(vec3 colour) {
  return dot(colour, vec3(0.2126, 0.7152, 0.0722));
}

vec3 vjRgbToHsv(vec3 colour) {
  vec4 hueKey = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 greenBlue = mix(vec4(colour.bg, hueKey.wz), vec4(colour.gb, hueKey.xy), step(colour.b, colour.g));
  vec4 ordered = mix(vec4(greenBlue.xyw, colour.r), vec4(colour.r, greenBlue.yzx), step(greenBlue.x, colour.r));
  float chroma = ordered.x - min(ordered.w, ordered.y);
  float epsilon = 1.0e-10;
  float hue = abs(ordered.z + (ordered.w - ordered.y) / (6.0 * chroma + epsilon));
  return vec3(hue, chroma / (ordered.x + epsilon), ordered.x);
}

vec3 vjHsvToRgb(vec3 hsv) {
  vec4 hueKey = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 channels = abs(fract(hsv.xxx + hueKey.xyz) * 6.0 - hueKey.www);
  return hsv.z * mix(hueKey.xxx, clamp(channels - hueKey.xxx, 0.0, 1.0), hsv.y);
}

vec3 vjHueRotate(vec3 colour, float turns) {
  vec3 hsv = vjRgbToHsv(colour);
  hsv.x = fract(hsv.x + turns);
  return vjHsvToRgb(hsv);
}

float vjHash12(vec2 point) {
  vec3 scrambled = fract(vec3(point.xyx) * 0.1031);
  scrambled += dot(scrambled, scrambled.yzx + 33.33);
  return fract((scrambled.x + scrambled.y) * scrambled.z);
}

float vjNoise2(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  vec2 blend = local * local * (3.0 - 2.0 * local);
  float bottomLeft = vjHash12(cell);
  float bottomRight = vjHash12(cell + vec2(1.0, 0.0));
  float topLeft = vjHash12(cell + vec2(0.0, 1.0));
  float topRight = vjHash12(cell + vec2(1.0, 1.0));
  return mix(mix(bottomLeft, bottomRight, blend.x), mix(topLeft, topRight, blend.x), blend.y);
}

mat2 vjRotate2(float angle) {
  float cosine = cos(angle);
  float sine = sin(angle);
  return mat2(cosine, sine, -sine, cosine);
}

vec3 vjSrgbToLinear(vec3 colour) {
  vec3 encoded = max(colour, vec3(0.0));
  vec3 low = encoded / 12.92;
  vec3 high = pow((encoded + 0.055) / 1.055, vec3(2.4));
  return mix(low, high, step(vec3(0.04045), encoded));
}

vec3 vjLinearToSrgb(vec3 colour) {
  vec3 linearColour = max(colour, vec3(0.0));
  vec3 low = linearColour * 12.92;
  vec3 high = 1.055 * pow(linearColour, vec3(1.0 / 2.4)) - 0.055;
  return mix(low, high, step(vec3(0.0031308), linearColour));
}
`;

/** Version, `in vec2 vUv; out vec4 outColour;`, frame uniforms, helpers, `// vj-program-key: <key>`, then the body. */
export function vjFragment(programKey: VjProgramKey, body: string): string {
  return [
    VJ_GLSL_VERSION,
    "in vec2 vUv;\nout vec4 outColour;\n",
    VJ_GLSL_FRAME_UNIFORMS,
    VJ_GLSL_HELPERS,
    `// vj-program-key: ${programKey}\n`,
    body,
  ].join("");
}
