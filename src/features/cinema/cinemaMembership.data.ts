export interface Feature {
  yes: boolean;
  /** Catalog key — Pattern A, resolved via t() in the consumer. */
  textKey: string;
}

export interface Tier {
  tagKey: string;
  nameKey: string;
  amount: string;
  per: string;
  /** Numeric monthly price, for `{price}` interpolation in desc/cta (via
   * `useFormat().currency()`) — kept separate from the display-only `amount`. */
  priceValue?: number;
  descKey: string;
  features: Feature[];
  ctaKey: string;
  ctaVariant: "primary" | "ghost";
  ctaTo: string;
  noteKey?: string;
  featured?: boolean;
  badgeKey?: string;
}

/** Patron tier's share of their fee that flows to the commissioning pool,
 * for `{poolShare}` interpolation. */
export const PATRON_POOL_SHARE = 4.8;

/** i18n Pattern A — every tier's copy is platform pricing chrome; the
 * consumer resolves each key via t()/<Translation> and formats `amount` via
 * `useFormat().currency()`. */
export const TIERS: Tier[] = [
  {
    tagKey: "cinema:membership.tier.free.tag",
    nameKey: "cinema:membership.tier.free.name",
    amount: "€0",
    per: "/ forever",
    descKey: "cinema:membership.tier.free.desc",
    features: [
      { yes: true, textKey: "cinema:membership.tier.free.feature1" },
      { yes: true, textKey: "cinema:membership.tier.free.feature2" },
      { yes: true, textKey: "cinema:membership.tier.free.feature3" },
      { yes: true, textKey: "cinema:membership.tier.free.feature4" },
      { yes: false, textKey: "cinema:membership.tier.free.feature5" },
      { yes: false, textKey: "cinema:membership.tier.free.feature6" },
      { yes: false, textKey: "cinema:membership.tier.free.feature7" },
    ],
    ctaKey: "cinema:membership.tier.free.cta",
    ctaVariant: "ghost",
    ctaTo: "/cinema/browse",
  },
  {
    tagKey: "cinema:membership.tier.sustainer.tag",
    nameKey: "cinema:membership.tier.sustainer.name",
    amount: "€7",
    per: "/ month",
    priceValue: 7,
    descKey: "cinema:membership.tier.sustainer.desc",
    features: [
      { yes: true, textKey: "cinema:membership.tier.sustainer.feature1" },
      { yes: true, textKey: "cinema:membership.tier.sustainer.feature2" },
      { yes: true, textKey: "cinema:membership.tier.sustainer.feature3" },
      { yes: true, textKey: "cinema:membership.tier.sustainer.feature4" },
      { yes: true, textKey: "cinema:membership.tier.sustainer.feature5" },
      { yes: true, textKey: "cinema:membership.tier.sustainer.feature6" },
      { yes: true, textKey: "cinema:membership.tier.sustainer.feature7" },
    ],
    ctaKey: "cinema:membership.tier.sustainer.cta",
    ctaVariant: "primary",
    ctaTo: "/checkout",
    noteKey: "cinema:membership.tier.sustainer.note",
    featured: true,
    badgeKey: "cinema:membership.tier.sustainer.badge",
  },
  {
    tagKey: "cinema:membership.tier.patron.tag",
    nameKey: "cinema:membership.tier.patron.name",
    amount: "€20",
    per: "/ month",
    priceValue: 20,
    descKey: "cinema:membership.tier.patron.desc",
    features: [
      { yes: true, textKey: "cinema:membership.tier.patron.feature1" },
      { yes: true, textKey: "cinema:membership.tier.patron.feature2" },
      { yes: true, textKey: "cinema:membership.tier.patron.feature3" },
      { yes: true, textKey: "cinema:membership.tier.patron.feature4" },
      { yes: true, textKey: "cinema:membership.tier.patron.feature5" },
      { yes: true, textKey: "cinema:membership.tier.patron.feature6" },
      { yes: true, textKey: "cinema:membership.tier.patron.feature7" },
    ],
    ctaKey: "cinema:membership.tier.patron.cta",
    ctaVariant: "ghost",
    ctaTo: "/checkout",
    noteKey: "cinema:membership.tier.patron.note",
  },
];

export const LEDGER: { labelKey: string; v: string; noteKey: string }[] = [
  {
    labelKey: "cinema:membership.ledger.sustainers.label",
    v: "1,240",
    noteKey: "cinema:membership.ledger.sustainers.note",
  },
  {
    labelKey: "cinema:ledger.card.paidToFilmmakers",
    v: "€8.4k",
    noteKey: "cinema:membership.ledger.paidToFilmmakers.note",
  },
  {
    labelKey: "cinema:about.gov.ledger.filmsInCatalogue",
    v: "142",
    noteKey: "cinema:membership.ledger.filmsInCatalogue.note",
  },
  {
    labelKey: "cinema:membership.ledger.commissionPool.label",
    v: "€13.2k",
    noteKey: "cinema:membership.ledger.commissionPool.note",
  },
];
