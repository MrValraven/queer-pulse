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

/**
 * The person the block/mute flow acts on. When the page is opened without a
 * target (the generic explainer), this is the fictional demo member above;
 * when opened from a real member's profile, the page builds one from that
 * member so the same screens narrate the real name.
 */
export interface BlockMuteTarget {
  firstName: string;
  fullName: string;
  initials: string;
  /** Small secondary line under the name (e.g. "she/her · Lisbon"). */
  meta: string;
}

export const DEMO_BLOCK_MUTE_TARGET: BlockMuteTarget = {
  firstName: MEMBER_FIRST_NAME,
  fullName: MEMBER_FULL_NAME,
  initials: "SR",
  meta: "she/her · Lisbon",
};
