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
    titleKey: "resources:communityPrivacy.tier.outside.title",
    bodyKey: "resources:communityPrivacy.tier.outside.body",
  },
];

export const HOW_TO_KEYS = [
  "resources:communityPrivacy.howTo.decline",
  "resources:communityPrivacy.howTo.pins",
  "resources:communityPrivacy.howTo.leaving",
];
