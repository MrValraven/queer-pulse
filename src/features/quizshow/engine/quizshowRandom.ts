/**
 * Seeded randomness for the Pulse Live demo engine (mulberry32), so a demo
 * plays the same way twice and the engine tests stay exact. The whole
 * generator state is one 32-bit integer, which the engine keeps in its state.
 */

export interface QuizshowRandom {
  next(): number;
  integerBelow(limit: number): number;
  shuffle<Item>(items: readonly Item[]): Item[];
}

/** mulberry32's increment (0x6D2B79F5). */
const MULBERRY_INCREMENT = 1_831_565_813;
const TWO_TO_THE_32 = 4_294_967_296;

/** mulberry32's output mix for one state, a float in [0, 1). */
function mulberryOutput(state: number): number {
  let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
  mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
  return ((mixed ^ (mixed >>> 14)) >>> 0) / TWO_TO_THE_32;
}

/** A generator that continues from a stored state; `state()` reads where it is now. */
export function quizshowRandomFrom(
  initialState: number,
): QuizshowRandom & { state: () => number } {
  let currentState = initialState | 0;
  const next = (): number => {
    currentState = (currentState + MULBERRY_INCREMENT) | 0;
    return mulberryOutput(currentState);
  };
  const integerBelow = (limit: number): number => Math.floor(next() * limit);
  /** Fisher-Yates over a copy, drawing `integerBelow(index + 1)` from the back, as the backend does. */
  const shuffle = <Item>(items: readonly Item[]): Item[] => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = integerBelow(index + 1);
      // Both indexes are in range by construction (swapIndex <= index < length).
      const held = shuffled[index] as Item;
      shuffled[index] = shuffled[swapIndex] as Item;
      shuffled[swapIndex] = held;
    }
    return shuffled;
  };
  return { next, integerBelow, shuffle, state: () => currentState };
}

/** A fresh generator for a seed, with a reader for its state to store. */
export function createQuizshowRandom(seed: number): {
  random: QuizshowRandom;
  stateOf: () => number;
} {
  const random = quizshowRandomFrom(seed);
  return { random, stateOf: () => random.state() };
}
