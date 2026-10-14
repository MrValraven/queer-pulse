/** A 32-bit FNV-1a hash of a string: stable seeds for demo data and for
 *  shuffles that tests can repeat. */
export function hashOfText(text: string): number {
  let hash = 0x811c9dc5;
  for (const character of text) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** A small seeded generator (mulberry32): the same seed gives the same
 *  sequence of numbers from 0 (inclusive) to 1 (exclusive). */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
