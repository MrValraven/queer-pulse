/**
 * Fire a short device haptic tick, when the platform supports it. A no-op on
 * desktop and on devices without the Vibration API (notably iOS Safari), so
 * callers never need to feature-detect. Only ever call this from inside a real
 * user gesture — the browser ignores vibration requests outside one.
 *
 * Keep durations tiny: this is a confirmation "tap", never an alert buzz.
 */
export function hapticTap(durationMs = 10): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(durationMs);
  }
}
