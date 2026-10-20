/**
 * Early access feature keys, frontend mirror: pure vocabulary with zero imports.
 * Mirrors the `earlyAccess: true` entries of the backend registry in
 * `queerpulse-backend/src/launchedFeatures.ts`; edit both together.
 */

export const EARLY_ACCESS_FEATURE_KEYS = ["quizshow"] as const;
export type EarlyAccessFeatureKey = (typeof EARLY_ACCESS_FEATURE_KEYS)[number];

/** Narrows a wire string (a session or admin DTO `featureKey`) to a known key. */
export function isEarlyAccessFeatureKey(
  value: string,
): value is EarlyAccessFeatureKey {
  return (EARLY_ACCESS_FEATURE_KEYS as readonly string[]).includes(value);
}
