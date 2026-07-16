/**
 * Static content for the Sustainer page. Values are copy + light structure only;
 * anything that depends on the CSS module (tint class maps) stays in components.
 *
 * i18n Pattern A throughout: every field that used to hold literal English
 * copy now holds a catalog key (`*Key` suffix), resolved with `t()` in the
 * consuming component. See `docs/i18n/extraction-brief.md`.
 */
import type { TierName } from "./sustainer.pricing";

/** Where contributions go — the impact grid. `tint` maps to a dot colour class. */
export type ImpactTint = "jade" | "accent" | "plumSoft" | "jadeSoft";
export const IMPACT_CARDS: {
  tint: ImpactTint;
  titleKey: string;
  descKey: string;
}[] = [
  {
    tint: "jade",
    titleKey: "support:impact.card.moderation.title",
    descKey: "support:impact.card.moderation.desc",
  },
  {
    tint: "accent",
    titleKey: "support:impact.card.hosting.title",
    descKey: "support:impact.card.hosting.desc",
  },
  {
    tint: "plumSoft",
    titleKey: "support:impact.card.team.title",
    descKey: "support:impact.card.team.desc",
  },
  {
    tint: "jadeSoft",
    titleKey: "support:impact.card.freeAccess.title",
    descKey: "support:impact.card.freeAccess.desc",
  },
];

/** Monthly running-cost breakdown for the transparency block. `amountEur` is
 * a plain number now (not a pre-formatted "€1,900" string) — formatted with
 * `useFormat().currency()` at render so pt-PT gets its comma + suffix. */
export type BudgetTint = "plum" | "accent" | "jade" | "plumSoft" | "ink";
export const BUDGET_ROWS: {
  nameKey: string;
  pct: number;
  tint: BudgetTint;
  amountEur: number;
}[] = [
  {
    nameKey: "support:budget.row.team",
    pct: 100,
    tint: "plum",
    amountEur: 1900,
  },
  {
    nameKey: "support:budget.row.magazine",
    pct: 19,
    tint: "accent",
    amountEur: 360,
  },
  {
    nameKey: "support:impact.card.hosting.title",
    pct: 13,
    tint: "jade",
    amountEur: 240,
  },
  {
    nameKey: "support:budget.row.moderationTools",
    pct: 8,
    tint: "plumSoft",
    amountEur: 160,
  },
  {
    nameKey: "support:budget.row.payments",
    pct: 5,
    tint: "ink",
    amountEur: 90,
  },
];
export const BUDGET_TOTAL_EUR = 2750;

/** Per-tier perk lists and the little microlabel under each name — catalog
 * keys, resolved by `TierCard.tsx`. */
export const TIER_MICROLABEL_KEYS: Record<TierName, string> = {
  Supporter: "support:tiers.microlabel.supporter",
  Friend: "support:tiers.microlabel.friend",
  Patron: "support:tiers.microlabel.patron",
};
export const TIER_PERK_KEYS: Record<TierName, string[]> = {
  Supporter: [
    "support:tiers.perk.supporter.badge",
    "support:tiers.perk.supporter.thankYou",
    "support:tiers.perk.supporter.gratitude",
  ],
  Friend: [
    "support:tiers.perk.friend.everythingSupporter",
    "support:tiers.perk.friend.earlyAccess",
    "support:tiers.perk.friend.rareBadge",
    "support:tiers.perk.friend.xp",
  ],
  Patron: [
    "support:tiers.perk.patron.everythingFriend",
    "support:tiers.perk.patron.annualList",
    "support:tiers.perk.patron.directLine",
    "support:tiers.perk.patron.roadmap",
  ],
};

export const HERO_CHIP_KEYS = [
  "support:hero.chip.smallTeam",
  "support:hero.chip.noInvestors",
  "support:hero.chip.freeForever",
];

export const HOW_STEP_KEYS = [
  "support:howItWorks.step1",
  "support:howItWorks.step2",
  "support:howItWorks.step3",
  "support:howItWorks.step4",
];

/** Stacked-avatar initials + tint for the social-proof cards. */
export type AvatarTint =
  "jade" | "accent" | "cream" | "jadeDim" | "accentDim" | "creamDim";
export const HERO_AVATARS: { initials: string; bg: string; fg: string }[] = [
  { initials: "TM", bg: "#4a8c6f", fg: "#fff" },
  { initials: "AK", bg: "#e8775a", fg: "#fff" },
  { initials: "JP", bg: "#6a4f80", fg: "#fff" },
  { initials: "MF", bg: "#3c7a5f", fg: "#fff" },
  { initials: "KL", bg: "#c85a40", fg: "#fff" },
];
export const SIDEBAR_AVATARS: { initials: string; tint: AvatarTint }[] = [
  { initials: "TM", tint: "jade" },
  { initials: "AK", tint: "accent" },
  { initials: "JP", tint: "cream" },
  { initials: "MF", tint: "jadeDim" },
  { initials: "KL", tint: "accentDim" },
  { initials: "BK", tint: "creamDim" },
  { initials: "NC", tint: "jadeDim" },
];

/** `unitKey` translates a short word-unit appended after `num` (e.g. "years")
 * — kept separate from `num` so a fused "3 yrs" style string doesn't bake an
 * untranslated English abbreviation into the data. */
export const IMPACT_STATS: {
  num: string;
  unitKey?: string;
  labelKey: string;
}[] = [
  { num: "€18k", labelKey: "support:impactStats.mentalHealthFund" },
  { num: "47", labelKey: "support:impactStats.freeMemberships" },
  {
    num: "3",
    unitKey: "support:impactStats.years",
    labelKey: "support:impactStats.yearsRunning",
  },
  { num: "100%", labelKey: "support:impactStats.communityFunded" },
];

/** Fictional-member testimonials — content (a member's own quote, name and
 * role), left untranslated per the extraction brief's scope rule: these are
 * the same "attributed quote from a fictional person" case as a mock member
 * bio, not platform-authored chrome. */
export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  tint: "jade" | "accent" | "plum";
};
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I found my flat, my GP and half my friends here. Ten euro a month is nothing next to that.",
    name: "Teresa M.",
    role: "Friend · 14 months",
    tint: "jade",
  },
  {
    quote:
      "I like knowing exactly where my money goes. They actually publish the numbers. That's rare.",
    name: "András K.",
    role: "Patron · 8 months",
    tint: "accent",
  },
  {
    quote:
      "No investors means no one's trying to sell me. I'll pay to keep it that way.",
    name: "Joana P.",
    role: "Supporter · 3 months",
    tint: "plum",
  },
];

export const FAQS: { qKey: string; aKey: string }[] = [
  { qKey: "support:faq.change.q", aKey: "support:faq.change.a" },
  { qKey: "support:faq.cancel.q", aKey: "support:faq.cancel.a" },
  { qKey: "support:faq.refunds.q", aKey: "support:faq.refunds.a" },
  { qKey: "support:faq.methods.q", aKey: "support:faq.methods.a" },
  { qKey: "support:faq.invoice.q", aKey: "support:faq.invoice.a" },
  {
    qKey: "support:faq.taxDeductible.q",
    aKey: "support:faq.taxDeductible.a",
  },
  { qKey: "support:faq.currency.q", aKey: "support:faq.currency.a" },
  { qKey: "support:faq.cantAfford.q", aKey: "support:faq.cantAfford.a" },
];
