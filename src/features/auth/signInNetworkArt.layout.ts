import { clamp, randomBetween } from "./signInNetworkArt.random";
import type { Bokeh, DustMote, Tone } from "./signInNetworkArt.types";

/** How big the art is drawn, and the far layers behind the Q. The scale is
 *  measured against the tall desktop column (about 430x560), so the phone
 *  band (about 340x240) draws everyone a little smaller. */

const REFERENCE_AREA = 430 * 560;

export function measureScale(width: number, height: number): number {
  return clamp(Math.sqrt((width * height) / REFERENCE_AREA), 0.72, 1.15);
}

export function scatterDust(
  random: () => number,
  count: number,
  width: number,
  height: number,
): DustMote[] {
  return Array.from({ length: count }, () => {
    const depth = randomBetween(random, 0.12, 0.4);
    return {
      anchorX: random() * width,
      anchorY: random() * height,
      radius: randomBetween(random, 0.45, 1.25) * (0.7 + depth),
      brightness: randomBetween(random, 0.14, 0.55),
      depth,
      twinklePhase: random() * Math.PI * 2,
      twinkleSpeed: randomBetween(random, 0.35, 1.1),
      isJade: random() < 0.14,
    };
  });
}

export function scatterBokeh(
  random: () => number,
  count: number,
  width: number,
  height: number,
  scale: number,
): Bokeh[] {
  const tones: readonly Tone[] = ["coral", "jade", "cream"];
  return Array.from({ length: count }, (_, bokehIndex) => ({
    // Spread along the height in bands so no two lights stack up.
    anchorX: randomBetween(random, 0.08, 0.92) * width,
    anchorY: ((bokehIndex + randomBetween(random, 0.1, 0.9)) / count) * height,
    radius: randomBetween(random, 26, 64) * scale,
    brightness: randomBetween(random, 0.05, 0.1),
    tone: tones[bokehIndex % tones.length] ?? "cream",
    driftPhase: random() * Math.PI * 2,
  }));
}
