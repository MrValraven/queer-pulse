import type { TaxYear } from "./tax.calc";
import { SIMPLIFIED_COEFFICIENTS } from "./tax.constants";

/** localStorage key for the running set-aside pot. */
export const POT_STORAGE_KEY = "qp.economy.setAsidePot";

/** One logged invoice the freelancer received, used to total the pot. */
export interface PotEntry {
  id: string;
  /** Gross amount received on the invoice, in euros. */
  amount: number;
  /** ISO yyyy-mm-dd date the invoice was received. */
  date: string;
}

/** Collision-resistant id for a pot entry (prototype-grade). */
export const makeEntryId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Activity types we let the planner model — keyed to SIMPLIFIED_COEFFICIENTS. */
export type Activity = "services" | "otherServices" | "goods";

export const ACTIVITY_OPTIONS: { value: Activity; label: string }[] = [
  { value: "services", label: "Services (liberal professions, art. 151.º)" },
  { value: "otherServices", label: "Other services (not in the 0.75 set)" },
  { value: "goods", label: "Sale of goods / hospitality" },
];

/** Coefficient lookup, narrowed to the activities this tool exposes. */
export const COEFFICIENT_FOR: Record<Activity, number> = {
  services: SIMPLIFIED_COEFFICIENTS.services,
  otherServices: SIMPLIFIED_COEFFICIENTS.otherServices,
  goods: SIMPLIFIED_COEFFICIENTS.goods,
};

export const YEAR_OPTIONS: { value: TaxYear; label: string }[] = [
  { value: 2026, label: "2026" },
  { value: 2025, label: "2025" },
];

/** Today as yyyy-mm-dd, for seeding the "log an invoice" date input. */
export { todayIso } from "../../shared/lib/date";
