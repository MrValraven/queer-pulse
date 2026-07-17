/**
 * Static option lists for the take-home calculator. The actual tax figures all
 * live in `tax.constants.ts` (single source of truth) — these are just the
 * human-readable labels for the form's selects.
 */
import type { SIMPLIFIED_COEFFICIENTS } from "./tax.constants";
import type { TaxYear } from "./tax.calc";

export type ActivityKey = keyof typeof SIMPLIFIED_COEFFICIENTS;
export type StartupYear = 0 | 1 | 2;
export type WorkerStatus = "freelancer" | "eni";

export interface SelectOption<T> {
  value: T;
  labelKey: string;
}

/** i18n Pattern A — labelKey resolved via t() by TakeHomeForm.
 *  Regime-simplificado coefficient by activity type (Art. 31.º CIRS). */
export const ACTIVITY_OPTIONS: SelectOption<ActivityKey>[] = [
  { value: "services", labelKey: "economy:takeHome.activityOption.services" },
  {
    value: "otherServices",
    labelKey: "economy:takeHome.activityOption.otherServices",
  },
  { value: "goods", labelKey: "economy:takeHome.activityOption.goods" },
  {
    value: "ipCapital",
    labelKey: "economy:takeHome.activityOption.ipCapital",
  },
];

/** Bare years — not translated (a year number reads the same in every locale). */
export const YEAR_OPTIONS: { value: TaxYear; label: string }[] = [
  { value: 2025, label: "2025" },
  { value: 2026, label: "2026" },
];

/** Start-of-activity reduction tier (Art. 31.º n.º 10). */
export const STARTUP_OPTIONS: SelectOption<StartupYear>[] = [
  { value: 0, labelKey: "economy:takeHome.startupOption.none" },
  { value: 1, labelKey: "economy:takeHome.startupOption.year1" },
  { value: 2, labelKey: "economy:takeHome.startupOption.year2" },
];

export const STATUS_OPTIONS: SelectOption<WorkerStatus>[] = [
  {
    value: "freelancer",
    labelKey: "economy:takeHome.statusOption.freelancer",
  },
  { value: "eni", labelKey: "economy:takeHome.statusOption.eni" },
];
