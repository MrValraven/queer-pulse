const RIGHT_PATTERN_MS = [40];
const WRONG_PATTERN_MS = [20, 60, 20];
const NEUTRAL_PATTERN_MS = [15];

/** A short buzz when the reveal lands: one tap for right, a double tap for wrong,
 *  a light one for party questions. A no-op where `navigator.vibrate` does not exist. */
export function vibrateForReveal(isCorrect: boolean | null): void {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  if (isCorrect === true) navigator.vibrate(RIGHT_PATTERN_MS);
  else if (isCorrect === false) navigator.vibrate(WRONG_PATTERN_MS);
  else navigator.vibrate(NEUTRAL_PATTERN_MS);
}
