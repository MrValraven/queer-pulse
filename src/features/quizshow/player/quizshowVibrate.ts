const RIGHT_PATTERN_MS = [40];
const WRONG_PATTERN_MS = [20, 60, 20];
const NEUTRAL_PATTERN_MS = [15];

/** The per-device "Vibration" switch (C9.2 item 43). One of the two keys this feature keeps in `localStorage` (C9.1). */
export const QUIZSHOW_VIBRATION_STORAGE_KEY = "quizshow.vibration";
const VIBRATION_OFF_VALUE = "false";
const VIBRATION_ON_VALUE = "true";

/** On unless this device switched it off. A storage that throws or is missing keeps the default. */
export function isVibrationOn(): boolean {
  try {
    return (
      window.localStorage.getItem(QUIZSHOW_VIBRATION_STORAGE_KEY) !==
      VIBRATION_OFF_VALUE
    );
  } catch {
    return true;
  }
}

/** Keeps the switch for this device. A storage that throws leaves it unsaved. */
export function setVibrationOn(isOn: boolean): void {
  try {
    window.localStorage.setItem(
      QUIZSHOW_VIBRATION_STORAGE_KEY,
      isOn ? VIBRATION_ON_VALUE : VIBRATION_OFF_VALUE,
    );
  } catch {
    // Private mode or blocked storage: the switch holds for this page only.
  }
}

/** A short buzz when the reveal lands: one tap for right, a double tap for wrong,
 *  a light one for party questions. A no-op when the player switched vibration
 *  off, or where `navigator.vibrate` does not exist. Reduced motion has no say. */
export function vibrateForReveal(isCorrect: boolean | null): void {
  if (!isVibrationOn()) return;
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  if (isCorrect === true) navigator.vibrate(RIGHT_PATTERN_MS);
  else if (isCorrect === false) navigator.vibrate(WRONG_PATTERN_MS);
  else navigator.vibrate(NEUTRAL_PATTERN_MS);
}
