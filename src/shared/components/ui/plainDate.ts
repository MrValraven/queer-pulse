/**
 * Zero-dependency plain-calendar-date model. `PlainDate`/`PlainTime` are pure
 * value objects (year/month/day, hour/minute) with no time zone attached, so
 * they never suffer the classic `new Date("2026-03-05")` UTC-parses-to-local-4th
 * off-by-one bug. All arithmetic below runs on an integer civil-day count
 * (Howard Hinnant's `days_from_civil` / `civil_from_days`), never on JS `Date`,
 * so it is immune to DST shifts. This underpins the shared Calendar/DatePicker
 * primitive.
 */

export interface PlainDate {
  year: number;
  month: number; // 1..12
  day: number; // 1..31
}

export interface PlainTime {
  hour: number; // 0..23
  minute: number; // 0..59
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_ONLY = /^(\d{4})-(\d{2})$/;
const TIME_ONLY = /^(\d{2}):(\d{2})$/;

/** Parse a bare `yyyy-mm-dd` string into a `PlainDate`. Returns `null` for
 *  malformed input or a date that does not exist (e.g. `2026-02-30`). */
export function parseDate(iso: string): PlainDate | null {
  const match = DATE_ONLY.exec(iso ?? "");
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > getDaysInMonth(year, month)) return null;
  return { year, month, day };
}

/** Format a `PlainDate` as `yyyy-mm-dd`. */
export function formatIsoDate(date: PlainDate): string {
  const year = String(date.year).padStart(4, "0");
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse a bare `yyyy-mm` string (what `<input type="month">` emits) into a
 *  `PlainDate` with `day` fixed to 1. Returns `null` for malformed input. */
export function parseMonth(iso: string): PlainDate | null {
  const match = MONTH_ONLY.exec(iso ?? "");
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month, day: 1 };
}

/** Format a `PlainDate` as `yyyy-mm` (dropping the day). */
export function formatIsoMonth(date: PlainDate): string {
  const year = String(date.year).padStart(4, "0");
  const month = String(date.month).padStart(2, "0");
  return `${year}-${month}`;
}

/** Parse a bare `hh:mm` string into a `PlainTime`. Returns `null` for
 *  malformed input or an out-of-range hour/minute. */
export function parseTime(iso: string): PlainTime | null {
  const match = TIME_ONLY.exec(iso ?? "");
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23) return null;
  if (minute < 0 || minute > 59) return null;
  return { hour, minute };
}

/** Format a `PlainTime` as `hh:mm`. */
export function formatIsoTime(time: PlainTime): string {
  const hour = String(time.hour).padStart(2, "0");
  const minute = String(time.minute).padStart(2, "0");
  return `${hour}:${minute}`;
}

/** Today's local calendar date. Reads `new Date()` once for the local
 *  year/month/day (reading the current date, not doing arithmetic on it). */
export function todayPlain(): PlainDate {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

/** Days elapsed from the epoch (1970-01-01 = 0) to `date`, using Howard
 *  Hinnant's `days_from_civil` integer algorithm. Never touches JS `Date`, so
 *  it is DST-proof. */
export function daysFromCivil({ year, month, day }: PlainDate): number {
  const shiftedYear = month <= 2 ? year - 1 : year;
  const era = Math.floor(shiftedYear / 400);
  const yearOfEra = shiftedYear - era * 400;
  const dayOfYear =
    Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  const dayOfEra =
    yearOfEra * 365 +
    Math.floor(yearOfEra / 4) -
    Math.floor(yearOfEra / 100) +
    dayOfYear;
  return era * 146097 + dayOfEra - 719468;
}

/** Inverse of `daysFromCivil`: the calendar date `days` days after the epoch
 *  (1970-01-01 = 0), using Howard Hinnant's `civil_from_days` algorithm. */
export function civilFromDays(days: number): PlainDate {
  const shiftedDays = days + 719468;
  const era = Math.floor(shiftedDays / 146097);
  const dayOfEra = shiftedDays - era * 146097;
  const yearOfEra = Math.floor(
    (dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) /
      365,
  );
  const shiftedYear = yearOfEra + era * 400;
  const dayOfYear =
    dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const monthPosition = Math.floor((5 * dayOfYear + 2) / 153);
  const day = dayOfYear - Math.floor((153 * monthPosition + 2) / 5) + 1;
  const month = monthPosition + (monthPosition < 10 ? 3 : -9);
  const year = shiftedYear + (month <= 2 ? 1 : 0);
  return { year, month, day };
}

/** Add (or subtract, for a negative `amount`) whole days to `date`, crossing
 *  month/year boundaries as needed. */
export function addDays(date: PlainDate, amount: number): PlainDate {
  return civilFromDays(daysFromCivil(date) + amount);
}

/** Add (or subtract) whole calendar months to `date` via integer month math,
 *  clamping the day to the target month's length (e.g. Jan 31 + 1mo = Feb 28). */
export function addMonths(date: PlainDate, amount: number): PlainDate {
  const totalMonths = date.year * 12 + (date.month - 1) + amount;
  const year = Math.floor(totalMonths / 12);
  const month = totalMonths - year * 12 + 1;
  const day = Math.min(date.day, getDaysInMonth(year, month));
  return { year, month, day };
}

/** Add (or subtract) whole calendar years to `date`, clamping the day to the
 *  target month's length (relevant for Feb 29 on a non-leap target year). */
export function addYears(date: PlainDate, amount: number): PlainDate {
  return addMonths(date, amount * 12);
}

/** Number of days in `month` (1..12) of `year`, accounting for leap years. */
export function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  }
  const daysInMonth: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonth[month - 1] as number;
}

/** Day of the week for `date`: 0 = Sunday .. 6 = Saturday. */
export function weekdayOf(date: PlainDate): number {
  // 1970-01-01 (day 0) was a Thursday (4). +7000 keeps the operand positive
  // for any date this model will realistically see before the final `% 7`.
  return ((daysFromCivil(date) % 7) + 4 + 7000) % 7;
}

/** Chronological comparator: negative if `a` is before `b`, positive if
 *  after, `0` if the same date. Suitable for `Array#sort`. */
export function compareDate(a: PlainDate, b: PlainDate): number {
  return daysFromCivil(a) - daysFromCivil(b);
}

/** Whether `a` and `b` are the same calendar date. `null` is never equal to
 *  anything, including another `null` (there is no date to compare). */
export function isSameDate(a: PlainDate | null, b: PlainDate | null): boolean {
  if (a === null || b === null) return false;
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

const LOCALE_WEEK_START: Record<string, number> = {
  en: 0,
  "en-US": 0,
  pt: 1,
  "pt-BR": 1,
  "pt-PT": 1,
};

/** The first day of the week for `locale`: 0 = Sunday .. 6 = Saturday. Prefers
 *  the runtime's `Intl.Locale` week info (spec range 1=Mon..7=Sun, normalized
 *  here), falls back to a small locale table, then defaults to Monday. */
export function firstDayOfWeek(locale: string): number {
  try {
    const localeWithWeekInfo = new Intl.Locale(locale) as Intl.Locale & {
      weekInfo?: { firstDay: number };
    };
    const firstDay = localeWithWeekInfo.weekInfo?.firstDay;
    if (typeof firstDay === "number") {
      // Spec: 1=Monday..7=Sunday. Normalize to 0=Sunday..6=Saturday.
      return firstDay % 7;
    }
  } catch {
    // Unsupported locale tag or no weekInfo support: fall through.
  }
  const localeWeekStart = LOCALE_WEEK_START[locale];
  if (localeWeekStart !== undefined) return localeWeekStart;
  const language = locale.split("-")[0] ?? locale;
  const languageWeekStart = LOCALE_WEEK_START[language];
  if (languageWeekStart !== undefined) return languageWeekStart;
  return 1;
}

/** The date of the first day of the week containing `date`, given `weekStart`
 *  (0 = Sunday .. 6 = Saturday). */
export function startOfWeek(date: PlainDate, weekStart: number): PlainDate {
  const offset = (weekdayOf(date) - weekStart + 7) % 7;
  return addDays(date, -offset);
}

/** Clamp `date` into `[min, max]` (either bound may be `null` to leave that
 *  side open). */
export function clampDate(date: PlainDate, min: PlainDate | null, max: PlainDate | null): PlainDate {
  if (min !== null && compareDate(date, min) < 0) return min;
  if (max !== null && compareDate(date, max) > 0) return max;
  return date;
}
