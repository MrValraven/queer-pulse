/**
 * Remote haptics through the Vibration API. iOS Safari has no
 * `navigator.vibrate`, so iPhones stay silent; every call is guarded and a
 * throwing implementation counts as no vibration.
 */

export type VjHapticKind =
  "press" | "latch" | "release" | "refused" | "downbeat";

export const VJ_HAPTIC_PATTERNS: Readonly<
  Record<VjHapticKind, number | readonly number[]>
> = {
  press: 8,
  latch: 14,
  release: 6,
  refused: [30, 40, 30],
  downbeat: 20,
};

interface VjVibrateTarget {
  vibrate?: (pattern: number | number[]) => boolean;
}

function defaultVjVibrateTarget(): VjVibrateTarget | undefined {
  return typeof navigator === "undefined" ? undefined : navigator;
}

export function vibrateVj(
  kind: VjHapticKind,
  target: VjVibrateTarget | undefined = defaultVjVibrateTarget(),
): boolean {
  if (target === undefined || typeof target.vibrate !== "function") {
    return false;
  }
  const pattern = VJ_HAPTIC_PATTERNS[kind];
  try {
    return target.vibrate(typeof pattern === "number" ? pattern : [...pattern]);
  } catch {
    return false;
  }
}
