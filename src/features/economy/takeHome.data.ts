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
  label: string;
}

/** Regime-simplificado coefficient by activity type (Art. 31.º CIRS). */
export const ACTIVITY_OPTIONS: SelectOption<ActivityKey>[] = [
  { value: "services", label: "Liberal profession (0.75)" },
  { value: "otherServices", label: "Other services (0.35)" },
  { value: "goods", label: "Sale of goods / hospitality (0.15)" },
  { value: "ipCapital", label: "IP / capital (0.95)" },
];

export const YEAR_OPTIONS: SelectOption<TaxYear>[] = [
  { value: 2025, label: "2025" },
  { value: 2026, label: "2026" },
];

/** Start-of-activity reduction tier (Art. 31.º n.º 10). */
export const STARTUP_OPTIONS: SelectOption<StartupYear>[] = [
  { value: 0, label: "Not in first 2 years" },
  { value: 1, label: "Year 1 (×0.5 coefficient)" },
  { value: 2, label: "Year 2 (×0.75 coefficient)" },
];

export const STATUS_OPTIONS: SelectOption<WorkerStatus>[] = [
  { value: "freelancer", label: "Freelancer (21.4% SS)" },
  { value: "eni", label: "ENI — empresário em nome individual (25.2% SS)" },
];
