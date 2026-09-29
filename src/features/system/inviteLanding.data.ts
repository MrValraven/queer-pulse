import type { TFunction } from "../../shared/i18n/types";

/**
 * i18n Pattern B. The decorative "unsealing" steps mix chrome with the
 * inviter's first name, so this needs `t` at call time — memoized by its sole
 * consumer, `InviteLandingViews.tsx`, via `useMemo(() => buildLoaderSteps(t,
 * name), [t, name])`.
 */
export function buildLoaderSteps(t: TFunction, inviterFirst: string): string[] {
  return [
    t("system:inviteLanding.loader.verifying"),
    t("system:inviteLanding.loader.unsealing", { name: inviterFirst }),
    t("system:inviteLanding.loader.preparing"),
  ];
}

/**
 * i18n Pattern A. The three "what this is" promises on the opened invitation
 * card — pure chrome, resolved by `InviteLandingViews.tsx` with `t()`.
 */
export const WHAT_ITEMS: { strongKey: string; restKey: string }[] = [
  {
    strongKey: "system:inviteLanding.what.vouched.strong",
    restKey: "system:inviteLanding.what.vouched.rest",
  },
  {
    strongKey: "system:inviteLanding.what.privacy.strong",
    restKey: "system:inviteLanding.what.privacy.rest",
  },
  {
    strongKey: "system:inviteLanding.what.lisbon.strong",
    restKey: "system:inviteLanding.what.lisbon.rest",
  },
];
