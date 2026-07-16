export type BlockMuteState = "choose" | "muted" | "blocked";

export type MuteDurationId = "untilUnmute" | "sevenDays" | "thirtyDays";

/** i18n Pattern A — chrome list, resolved via `t()` in BlockMuteScreens.tsx. */
export const MUTE_DURATIONS: { id: MuteDurationId; labelKey: string }[] = [
  { id: "untilUnmute", labelKey: "safety:blockMute.duration.untilUnmute" },
  { id: "sevenDays", labelKey: "safety:blockMute.duration.sevenDays" },
  { id: "thirtyDays", labelKey: "safety:blockMute.duration.thirtyDays" },
];

/**
 * Fictional demo member being muted/blocked in this flow. Stays English in
 * both catalogs (content, matching the member-bio convention) — passed as the
 * `{name}` interpolation value into the chrome sentences around it.
 */
export const MEMBER_FIRST_NAME = "Sofia";
export const MEMBER_FULL_NAME = "Sofia Rodrigues";
