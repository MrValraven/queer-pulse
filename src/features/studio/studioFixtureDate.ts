/**
 * Demo fixture dates. Mock data stores a bare `yyyy-mm-dd` and the page
 * formats it with `useFormat().date` in the active locale, so a Portuguese
 * reader sees "10/06" where an English one sees "Jun 10".
 */

/** Noon UTC keeps a date-only fixture on its day in every time zone. */
export const fixtureDate = (dateIso: string) =>
  new Date(`${dateIso}T12:00:00Z`);

/** Day and month: "Jun 9" (EN), "9/06" (PT). */
export const DAY_MONTH: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

/** Weekday, day and month: "Wed, Jun 10" (EN), "quarta, 10/06" (PT). */
export const WEEKDAY_DAY_MONTH: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};

/** Day, month and year: "Apr 12, 2026" (EN), "12/04/2026" (PT). */
export const DAY_MONTH_YEAR: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};
