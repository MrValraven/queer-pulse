/**
 * The quiet facts chapter 2 knows about a date: which days Portugal takes off,
 * when a Sunday evening counts as late, and how close another gathering has to
 * start to share its crowd.
 *
 * Ruling R3: only FIXED-DATE Portuguese public holidays, plus Santo António
 * (13 June, Lisbon's own). The movable feasts (Carnival, Good Friday, Easter,
 * Corpus Christi) and Pride dates move every year, and a hand-guessed date
 * would tell a host something false about their evening.
 */

/** Holiday name keys by `"MM-DD"`. */
export const HOLIDAY_NAME_KEYS: Readonly<Record<string, string>> = {
  "01-01": "gatherings:create.v2.when.holiday.newYear",
  "04-25": "gatherings:create.v2.when.holiday.freedomDay",
  "05-01": "gatherings:create.v2.when.holiday.labourDay",
  "06-10": "gatherings:create.v2.when.holiday.portugalDay",
  "06-13": "gatherings:create.v2.when.holiday.santoAntonio",
  "08-15": "gatherings:create.v2.when.holiday.assumption",
  "10-05": "gatherings:create.v2.when.holiday.republicDay",
  "11-01": "gatherings:create.v2.when.holiday.allSaints",
  "12-01": "gatherings:create.v2.when.holiday.restoration",
  "12-08": "gatherings:create.v2.when.holiday.immaculateConception",
  "12-25": "gatherings:create.v2.when.holiday.christmas",
};

/** The holiday a local calendar day falls on, as a catalog key, if any. */
export function holidayNameKeyFor(day: Date): string | undefined {
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(day.getDate()).padStart(2, "0");
  return HOLIDAY_NAME_KEYS[`${month}-${dayOfMonth}`];
}

/** A Sunday start at or after this hour gets the late-Sunday note. */
export const LATE_SUNDAY_START_HOUR = 20;

/** Another gathering starting within this many minutes of the host's start,
 *  in the same neighbourhood, gets a clash note. */
export const CLASH_WINDOW_MINUTES = 120;

/** At most this many clash notes, the closest first. */
export const MAX_CLASH_NOTES = 2;

/** The neighbourhood value of an online gathering: it has no street to share
 *  a crowd on, so it asks for a join link and skips the clash check. */
export const ONLINE_HOOD_VALUE = "Online";

/** "8 Thursdays": the series summary's count, keyed by `Date.getDay()`
 *  (0 is Sunday). Read with `count`. */
export const SERIES_WEEKDAY_COUNT_KEYS = [
  "gatherings:create.v2.when.series.weekday.sunday",
  "gatherings:create.v2.when.series.weekday.monday",
  "gatherings:create.v2.when.series.weekday.tuesday",
  "gatherings:create.v2.when.series.weekday.wednesday",
  "gatherings:create.v2.when.series.weekday.thursday",
  "gatherings:create.v2.when.series.weekday.friday",
  "gatherings:create.v2.when.series.weekday.saturday",
] as const;

/** How a single day reads in the series list and its summary: "Thu, 4 Sep". */
export const SERIES_DAY_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};
