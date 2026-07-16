/** i18n Pattern A — platform-authored chrome, resolved via `t()` in CommunityPrivacyPage. */
export interface Tier {
  icon: "globe" | "users" | "shield";
  titleKey: string;
  bodyKey: string;
}

export const TIERS: Tier[] = [
  {
    icon: "globe",
    titleKey: "resources:communityPrivacy.tier.public.title",
    bodyKey: "resources:communityPrivacy.tier.public.body",
  },
  {
    icon: "users",
    titleKey: "resources:communityPrivacy.tier.community.title",
    bodyKey: "resources:communityPrivacy.tier.community.body",
  },
  {
    icon: "shield",
    titleKey: "resources:communityPrivacy.tier.modTeam.title",
    bodyKey: "resources:communityPrivacy.tier.modTeam.body",
  },
];

export const HOW_TO_KEYS = [
  "resources:communityPrivacy.howTo.default",
  "resources:communityPrivacy.howTo.settings",
  "resources:communityPrivacy.howTo.leaving",
];
