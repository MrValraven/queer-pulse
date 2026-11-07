/**
 * The echo feedback pass (contract 3.2): each frame keeps the brighter of the
 * source and the previous echo output faded by `0.9 * amount`, so moving light
 * leaves a trail. `uFeedback` is the echo target of the previous frame.
 */

import { vjFragment } from "./vjGlslCommon";
import type { VjProgramKey, VjShaderSource } from "./vjProgramKeys";

const ECHO_BODY = `
uniform sampler2D uSource;
uniform sampler2D uFeedback;
uniform float uEchoAmount;

void main() {
  vec3 source = texture(uSource, vUv).rgb;
  vec3 feedback = texture(uFeedback, vUv).rgb;
  outColour = vec4(max(source, feedback * 0.9 * uEchoAmount), 1.0);
}
`;

export const VJ_TIME_PROGRAMS: Readonly<
  Partial<Record<VjProgramKey, VjShaderSource>>
> = {
  "time.echo": {
    fragment: vjFragment("time.echo", ECHO_BODY),
    uniforms: ["uEchoAmount"],
    samplers: ["uSource", "uFeedback"],
  },
};
