/** Deterministic randomness for the network art, so the composition is the
 *  same good-looking arrangement on every visit at a given size. */

/** Mulberry32: a tiny, fast seeded generator returning values in [0, 1). */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomBetween(
  random: () => number,
  minimum: number,
  maximum: number,
): number {
  return minimum + random() * (maximum - minimum);
}

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function easeOutCubic(progress: number): number {
  const inverse = 1 - progress;
  return 1 - inverse * inverse * inverse;
}

export function easeInOutSine(progress: number): number {
  return 0.5 - 0.5 * Math.cos(Math.PI * progress);
}
