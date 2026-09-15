// ── Content warnings ────────────────────────────────────────────────────────
// The eight things a member can flag on the way in, so the thread card carries
// a "CW" pill and a reader decides for themselves whether to open it.
//
// `id` is the canonical value the state, the draft and the publish call carry,
// so a warning set in English still reads as the same warning in Portuguese.
// Only `labelKey` changes with language.

export interface ComposeContentWarning {
  id: string;
  labelKey: string;
}

export const CONTENT_WARNINGS: readonly ComposeContentWarning[] = [
  { id: "medical", labelKey: "forum:composePage.warning.medical" },
  { id: "violence", labelKey: "forum:composePage.warning.violence" },
  { id: "substances", labelKey: "forum:composePage.warning.substances" },
  { id: "family-rejection", labelKey: "forum:composePage.warning.family" },
  { id: "sexual-content", labelKey: "forum:composePage.warning.sexual" },
  { id: "self-harm", labelKey: "forum:composePage.warning.selfHarm" },
  { id: "housing-loss", labelKey: "forum:composePage.warning.housingLoss" },
  { id: "police", labelKey: "forum:composePage.warning.police" },
];

/** Every valid id, for dropping a stale one out of a restored draft. */
export const CONTENT_WARNING_IDS: readonly string[] = CONTENT_WARNINGS.map(
  (warning) => warning.id,
);
