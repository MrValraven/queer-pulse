/**
 * Small ISO-shape helpers for `DatePicker`'s date/datetime popover: pulling
 * the bare `"yyyy-mm-dd"` date out of a `date`/`datetime` value for `Calendar`
 * (whose `value` is always a plain date), and combining a newly picked date
 * with whatever time was already there. Split out of `DatePicker.tsx` to keep
 * that component small.
 */

import type { FieldMode } from "./DateField";

/** The date-only portion of a `date`/`datetime` value, for handing to
 *  `Calendar`. `month`/`time` have no date portion, so this returns `null`. */
export function datePartOf(
  mode: FieldMode,
  value: string | null,
): string | null {
  if (!value) return null;
  if (mode === "date") return value;
  if (mode === "datetime") return value.split("T")[0] ?? null;
  return null;
}

/** Combine a newly picked `"yyyy-mm-dd"` date with the time portion already
 *  in `previousValue` (defaulting to midnight when there wasn't one yet),
 *  producing `datetime` mode's `"yyyy-mm-ddThh:mm"` ISO shape. */
export function combineDatetimeValue(
  datePart: string,
  previousValue: string | null,
): string {
  const timePart = previousValue?.split("T")[1] ?? "00:00";
  return `${datePart}T${timePart}`;
}
