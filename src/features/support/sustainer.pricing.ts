/**
 * Pricing model for the supporting-membership (Sustainer) page.
 *
 * All amounts are stored as a monthly EUR base; currency and frequency are
 * applied on top. Kept as pure functions so components and the store can derive
 * prices without holding formatting state.
 */

export type TierIndex = 0 | 1 | 2;

export const TIER_NAMES = ["Supporter", "Friend", "Patron"] as const;
export type TierName = (typeof TIER_NAMES)[number];

/**
 * i18n Pattern A — label-key indirection. `TierName` (plus the "Custom"
 * amount) is the canonical, never-translated id: it's the value persisted to
 * `localStorage` (`Supporter.tier`, see `useSustainer.ts`) and used to index
 * `TIER_MICROLABELS`/`TIER_PERKS`. Only the *displayed* tier name is
 * translated, via this map, everywhere a tier name renders (`TierCard.tsx`,
 * `SustainerTiers.tsx`, `SustainerRecapBar.tsx`, `SustainerMemberBanner.tsx`,
 * `SustainerPaymentModal.tsx`).
 */
export const TIER_LABEL_KEYS: Record<TierName | "Custom", string> = {
  Supporter: "support:tiers.name.supporter",
  Friend: "support:tiers.name.friend",
  Patron: "support:tiers.name.patron",
  Custom: "support:tiers.name.custom",
};

/** Monthly base amount per tier, in EUR. */
export const BASE_EUR: readonly number[] = [5, 10, 25];

export type CurrencyCode = "EUR" | "GBP" | "USD";

/** `label` here is a currency-code display (e.g. "€ EUR") — a universal ISO
 * code + symbol pairing, not prose, so it isn't routed through the i18n
 * catalog (see `docs/i18n/extraction-brief.md` §1 — chrome is *authored*
 * copy; this is data). */
export const CURRENCIES: Record<
  CurrencyCode,
  { sym: string; rate: number; label: string }
> = {
  EUR: { sym: "€", rate: 1, label: "€ EUR" },
  GBP: { sym: "£", rate: 0.86, label: "£ GBP" },
  USD: { sym: "$", rate: 1.08, label: "$ USD" },
};

export type FreqKey = "monthly" | "annual" | "once";

/**
 * i18n Pattern A — `FreqKey` ("monthly"/"annual"/"once") is the canonical,
 * never-translated id; `perKey`/`shortKey`/`billingKey`/`subKey` are catalog
 * keys resolved with `t()` at the consuming component. `short` for "once"
 * has no word to translate (an empty suffix), so it stays a plain string.
 */
export const FREQS: Record<
  FreqKey,
  {
    mult: number;
    perKey: string;
    shortKey?: string;
    short?: string;
    billingKey: string;
    subKey: string;
  }
> = {
  monthly: {
    mult: 1,
    perKey: "support:freq.monthly.per",
    shortKey: "support:freq.monthly.short",
    billingKey: "support:freq.monthly.billing",
    subKey: "support:freq.monthly.sub",
  },
  annual: {
    mult: 10,
    perKey: "support:freq.annual.per",
    shortKey: "support:freq.annual.short",
    billingKey: "support:freq.annual.billing",
    subKey: "support:freq.annual.sub",
  },
  once: {
    mult: 5,
    perKey: "support:freq.once.per",
    short: "",
    billingKey: "support:freq.once.billing",
    subKey: "support:freq.once.sub",
  },
};

/** Pay-it-forward add-on, per period, in EUR. */
export const SOLID_EUR = 2;

const round = (v: number) => Math.round(v);

/** Amount for a tier in the given currency + frequency. */
export function amountFor(
  tier: number,
  cur: CurrencyCode,
  freq: FreqKey,
): number {
  return round(BASE_EUR[tier]! * FREQS[freq].mult * CURRENCIES[cur].rate);
}

/** The solidarity add-on amount in the active currency + frequency. */
export function solidAdd(cur: CurrencyCode, freq: FreqKey): number {
  return round(SOLID_EUR * FREQS[freq].mult * CURRENCIES[cur].rate);
}

/** Yearly-full and yearly-saving figures for the annual "2 mo free" note. */
export function annualSaving(tier: number, cur: CurrencyCode) {
  return {
    full: round(BASE_EUR[tier]! * 12 * CURRENCIES[cur].rate),
    save: round(BASE_EUR[tier]! * 2 * CURRENCIES[cur].rate),
  };
}

/** Rough EUR-monthly equivalent of a chosen amount, for impact framing. */
export function eurMonthlyEquiv(
  baseInCur: number,
  cur: CurrencyCode,
  freq: FreqKey,
): number {
  return baseInCur / CURRENCIES[cur].rate / FREQS[freq].mult;
}

/**
 * Warm, concrete framing of where a contribution goes — returns a catalog
 * key (i18n Pattern A) rather than a sentence; `useSustainer.ts`'s
 * `impactText()` resolves it with `t()`.
 */
export function impactMsgKey(eurMonthly: number): string {
  if (eurMonthly >= 22) return "support:impact.msg.high";
  if (eurMonthly >= 9) return "support:impact.msg.mid";
  return "support:impact.msg.low";
}
