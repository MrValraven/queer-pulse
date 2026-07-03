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

/** Monthly base amount per tier, in EUR. */
export const BASE_EUR: readonly number[] = [5, 10, 25];

export type CurrencyCode = "EUR" | "GBP" | "USD";

export const CURRENCIES: Record<
  CurrencyCode,
  { sym: string; rate: number; label: string }
> = {
  EUR: { sym: "€", rate: 1, label: "€ EUR" },
  GBP: { sym: "£", rate: 0.86, label: "£ GBP" },
  USD: { sym: "$", rate: 1.08, label: "$ USD" },
};

export type FreqKey = "monthly" | "annual" | "once";

export const FREQS: Record<
  FreqKey,
  { mult: number; per: string; short: string; billing: string; sub: string }
> = {
  monthly: {
    mult: 1,
    per: "per month",
    short: "/month",
    billing: "Monthly",
    sub: "Recurring · cancel any time",
  },
  annual: {
    mult: 10,
    per: "per year",
    short: "/year",
    billing: "Yearly",
    sub: "Billed once a year · cancel any time",
  },
  once: {
    mult: 5,
    per: "one time",
    short: "",
    billing: "One-time",
    sub: "A single contribution",
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

/** Format a number in the active currency, e.g. `€1,900`. */
export function money(cur: CurrencyCode, v: number): string {
  return CURRENCIES[cur].sym + v.toLocaleString();
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

/** Warm, concrete framing of where a contribution goes. */
export function impactMsg(eurMonthly: number): string {
  if (eurMonthly >= 22)
    return "funds nearly a full day of the team keeping this place running and cared for.";
  if (eurMonthly >= 9)
    return "covers a month of hosting and email for dozens of members.";
  return "keeps the forum and the moderation tools running.";
}
