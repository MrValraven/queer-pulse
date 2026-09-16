// src/features/messages/dayHeading.ts
import type { TFunction } from "../../shared/i18n/types";

/**
 * `day` is a stable canonical id ("Today" / "Yesterday", or an already
 * locale-formatted date string from the adapter). Only the two chrome buckets
 * computed client-side resolve through the catalog; any other value is a date
 * string rendered as-is. Shared by the in-flow day separator
 * (`MessageAreaRow`) and the floating day header (`FloatingDayHeader`) so the
 * two always print the same words for the same day.
 */
export function dayHeading(day: string, t: TFunction): string {
  if (day === "Today") return t("messages:day.today");
  if (day === "Yesterday") return t("messages:day.yesterday");
  return day;
}
