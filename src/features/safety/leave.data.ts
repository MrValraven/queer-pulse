export type LeaveState = "considering" | "pausing" | "paused" | "confirmed";

export type PauseDurationId = "oneMonth" | "threeMonths" | "sixMonths";

/** i18n Pattern A — chrome list, sole consumer is `LeaveConsidering`. */
export const DELETED_KEYS = [
  "safety:leave.deleted.profile",
  "safety:leave.deleted.connections",
  "safety:leave.deleted.gatherings",
  "safety:leave.deleted.savedArticles",
  "safety:leave.deleted.invites",
];

/** i18n Pattern A — chrome list, sole consumer is `LeavePausing`. */
export const PAUSE_EFFECT_KEYS = [
  "safety:leave.pausing.effects.profileInvisible",
  "safety:leave.pausing.effects.notInSearch",
  "safety:leave.pausing.effects.notificationsPaused",
  "safety:leave.pausing.effects.dataPreserved",
  "safety:leave.pausing.effects.reactivateAnytime",
];

/**
 * Each pause option's label key + the real reactivation `Date`. `backDate` is
 * formatted through `useFormat()` at render (`leave.duration.backOn`,
 * `{date}`) instead of baking a formatted string in here — see the extraction
 * brief's "hand-rolled formatting" trap.
 */
export const DURATIONS: {
  id: PauseDurationId;
  labelKey: string;
  backDate: Date;
}[] = [
  {
    id: "oneMonth",
    labelKey: "safety:leave.duration.oneMonth",
    backDate: new Date(2026, 6, 6),
  },
  {
    id: "threeMonths",
    labelKey: "safety:leave.duration.threeMonths",
    backDate: new Date(2026, 8, 6),
  },
  {
    id: "sixMonths",
    labelKey: "safety:leave.duration.sixMonths",
    backDate: new Date(2026, 11, 6),
  },
];
