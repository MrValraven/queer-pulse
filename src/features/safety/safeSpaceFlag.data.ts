import type { SafeSpaceFlagReason } from "./api/safeSpaceGovernance.api";

/**
 * The reasons a member can pick when they raise something about a badged safe
 * space, in the order the picker offers them: the safety reasons first,
 * because that is what the mechanism is for.
 *
 * Kept as a closed set so the moderator queue can group and count without
 * anyone reading the member's prose, and so the reason itself never carries
 * identifying detail.
 */
export const SAFE_SPACE_FLAG_REASON_OPTIONS: {
  code: SafeSpaceFlagReason;
  labelKey: string;
  descriptionKey: string;
}[] = [
  {
    code: "not_safe",
    labelKey: "safety:flag.reason.not_safe.label",
    descriptionKey: "safety:flag.reason.not_safe.desc",
  },
  {
    code: "discrimination",
    labelKey: "safety:flag.reason.discrimination.label",
    descriptionKey: "safety:flag.reason.discrimination.desc",
  },
  {
    code: "staff_conduct",
    labelKey: "safety:flag.reason.staff_conduct.label",
    descriptionKey: "safety:flag.reason.staff_conduct.desc",
  },
  {
    code: "accessibility",
    labelKey: "safety:flag.reason.accessibility.label",
    descriptionKey: "safety:flag.reason.accessibility.desc",
  },
  {
    code: "closed_or_changed",
    labelKey: "safety:flag.reason.closed_or_changed.label",
    descriptionKey: "safety:flag.reason.closed_or_changed.desc",
  },
  {
    code: "other",
    labelKey: "safety:flag.reason.other.label",
    descriptionKey: "safety:flag.reason.other.desc",
  },
];
