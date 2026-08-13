/**
 * Option-list builders for the Calendar header's month/year `<Select>`
 * dropdowns (Task 4: far-jump navigation, e.g. a birthdate decades back).
 * Split out of `CalendarHeader.tsx` to keep that component small.
 */

import type { SelectOption } from "./Select";
import type { PlainDate } from "./plainDate";

const MONTHS_IN_YEAR = 12;
const DEFAULT_YEARS_BEFORE = 100;
const DEFAULT_YEARS_AFTER = 10;

/** 12 localized month options ("January".."December" for `locale`), value
 *  is the 1-indexed month number as a string ("1".."12"). */
export function buildMonthOptions(locale: string): SelectOption[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: "long" });
  return Array.from({ length: MONTHS_IN_YEAR }, (_unused, index) => {
    const month = index + 1;
    return { value: String(month), label: formatter.format(new Date(2000, index, 1)) };
  });
}

/** Year options covering `minDate`..`maxDate` when the Calendar has bounds,
 *  else a window around `currentYear` (100 years back, 10 forward). Always
 *  includes `currentYear` itself, even if it falls outside supplied bounds,
 *  so the Select never renders with no matching option. Newest year first. */
export function buildYearOptions(
  currentYear: number,
  minDate?: PlainDate | null,
  maxDate?: PlainDate | null,
): SelectOption[] {
  const minYear = Math.min(minDate?.year ?? currentYear - DEFAULT_YEARS_BEFORE, currentYear);
  const maxYear = Math.max(maxDate?.year ?? currentYear + DEFAULT_YEARS_AFTER, currentYear);
  const count = maxYear - minYear + 1;
  return Array.from({ length: count }, (_unused, index) => {
    const year = maxYear - index;
    return { value: String(year), label: String(year) };
  });
}
