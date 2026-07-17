/**
 * Static option lists + copy for the freelance-vs-salaried comparator. Tax
 * figures live in `tax.constants.ts` (single source of truth); these are only
 * the human-readable labels and the "hidden costs" prose.
 */
import type { SIMPLIFIED_COEFFICIENTS } from "./tax.constants";
import type { TaxYear } from "./tax.calc";

export type ActivityKey = keyof typeof SIMPLIFIED_COEFFICIENTS;
export type StartupYear = 0 | 1 | 2;

export interface SelectOption<T> {
  value: T;
  labelKey: string;
}

/** i18n Pattern A — labelKey resolved via t() by ComparatorForm.
 *  Regime-simplificado coefficient by activity type (Art. 31.º CIRS). */
export const ACTIVITY_OPTIONS: SelectOption<ActivityKey>[] = [
  { value: "services", labelKey: "economy:comparator.activityOption.services" },
  {
    value: "otherServices",
    labelKey: "economy:comparator.activityOption.otherServices",
  },
  { value: "goods", labelKey: "economy:comparator.activityOption.goods" },
  {
    value: "ipCapital",
    labelKey: "economy:comparator.activityOption.ipCapital",
  },
];

/** Bare years — not translated (a year number reads the same in every locale). */
export const YEAR_OPTIONS: { value: TaxYear; label: string }[] = [
  { value: 2025, label: "2025" },
  { value: 2026, label: "2026" },
];

/** Start-of-activity reduction tier (Art. 31.º n.º 10). */
export const STARTUP_OPTIONS: SelectOption<StartupYear>[] = [
  { value: 0, labelKey: "economy:comparator.startupOption.none" },
  { value: 1, labelKey: "economy:comparator.startupOption.year1" },
  { value: 2, labelKey: "economy:comparator.startupOption.year2" },
];

/**
 * The things a salaried employee gets that a freelancer funds themselves. The
 * last item is the upside — flagged positive in the UI.
 * i18n Pattern A — `textKey` resolved via t() by ComparatorResult.
 */
export interface HiddenCost {
  textKey: string;
  positive: boolean;
}

export const HIDDEN_COSTS: HiddenCost[] = [
  { textKey: "economy:comparator.hiddenCost.noHoliday", positive: false },
  { textKey: "economy:comparator.hiddenCost.noSubsidio", positive: false },
  { textKey: "economy:comparator.hiddenCost.noSickLeave", positive: false },
  { textKey: "economy:comparator.hiddenCost.ownSS", positive: false },
  { textKey: "economy:comparator.hiddenCost.lumpyIncome", positive: false },
  { textKey: "economy:comparator.hiddenCost.upside", positive: true },
];
