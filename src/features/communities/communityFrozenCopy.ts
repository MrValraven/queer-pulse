import type { CommunityFrozenReason } from "./api/useCommunityFreezeDetail";

export type FrozenReasonKey = CommunityFrozenReason | "unknown";

/** One body sentence per reason. A manual pause has no report behind it, so it
 *  must not be narrated as one: telling a community its moderators are
 *  reviewing reports when nobody reported anything is simply untrue. A space
 *  (subcommunity) paused because its parent is paused gets its own sentence,
 *  naming the parent, since the space's own staff has nothing to review here.
 *  The `unknown` line is the honest fallback for a backend that reports the
 *  pause without saying why. Shared by the hub's pause banner and the join
 *  wizard's pause refusal, so both say the same true thing. */
export const FROZEN_BODY_KEY: Record<FrozenReasonKey, string> = {
  manual: "communities:detail.frozen.body.manual",
  emergency_report: "communities:detail.frozen.body.emergencyReport",
  report_pileup: "communities:detail.frozen.body.reportPileup",
  parent_frozen: "communities:spaces.paused.parent",
  unknown: "communities:detail.frozen.body.unknown",
};

/** The catalog key for a pause's body line. `parent_frozen` names the parent
 *  only when its name is known; otherwise the honest generic line. */
export function frozenBodyKeyFor(
  reason: string | null | undefined,
  hasParentName: boolean,
): string {
  if (reason === "parent_frozen" && !hasParentName)
    return FROZEN_BODY_KEY.unknown;
  // `Object.hasOwn` keeps an inherited name such as "toString" off the table.
  if (reason && Object.hasOwn(FROZEN_BODY_KEY, reason))
    return FROZEN_BODY_KEY[reason as FrozenReasonKey];
  return FROZEN_BODY_KEY.unknown;
}

/** The pause title: a space (subcommunity) names itself a space, so its
 *  title agrees with its body line ("This space is paused because {name} is
 *  paused"). Shared by the hub's pause banner and the join wizard's pause
 *  refusal. */
export function frozenTitleKeyFor(isSpace: boolean): string {
  return isSpace
    ? "communities:spaces.paused.title"
    : "communities:detail.frozen.title";
}
