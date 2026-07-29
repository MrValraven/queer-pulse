/**
 * Date helpers shared across features. Absolute dates round-tripped through
 * `<input type="date">` are ISO `yyyy-mm-dd` strings; `formatDate` also accepts
 * full ISO timestamps, epoch numbers, and `Date` objects so adapters can drop
 * their hand-rolled `toLocaleDateString` calls onto one helper.
 */

import type { Formatters } from "../i18n/format";

/** Today as `yyyy-mm-dd`, for seeding date inputs. */
export const todayIso = (): string => new Date().toISOString().slice(0, 10);

/** A bare `yyyy-mm-dd` (what a date input emits) — parsed at local midnight so
 *  it never slips a day across time zones, unlike a full ISO timestamp. */
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Format a date as a readable string. Accepts a bare ISO `yyyy-mm-dd` string
 * (parsed at local midnight), a full ISO timestamp, an epoch number, or a
 * `Date`. An empty string stays empty; an unparseable string is returned
 * unchanged and any other unparseable value becomes `""`.
 *
 * `locale` is forwarded straight to `Intl` — omit it (or pass `undefined`) to
 * use the runtime default locale, or pass an explicit tag like `"en-GB"` or the
 * active app language.
 */
export function formatDate(
  value: string | number | Date,
  locale?: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string {
  if (value === "") return "";
  const parsedDate =
    typeof value === "string" && DATE_ONLY_PATTERN.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return typeof value === "string" ? value : "";
  }
  return parsedDate.toLocaleDateString(locale, options);
}

/**
 * "2 hours ago" style relative label from an ISO timestamp, localized through
 * the caller's `Formatters` (backed by `Intl.RelativeTimeFormat`, so it reads
 * "há 2 horas" in PT). Lifted here from the feed adapter so every relative-time
 * site shares one implementation. Returns `""` for an unparseable value.
 */
export function formatRelative(iso: string, formatters: Formatters): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const differenceInSeconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (differenceInSeconds < 60) {
    return formatters.relativeTime(-differenceInSeconds, "second");
  }
  const differenceInMinutes = Math.round(differenceInSeconds / 60);
  if (differenceInMinutes < 60) {
    return formatters.relativeTime(-differenceInMinutes, "minute");
  }
  const differenceInHours = Math.round(differenceInMinutes / 60);
  if (differenceInHours < 24) {
    return formatters.relativeTime(-differenceInHours, "hour");
  }
  const differenceInDays = Math.round(differenceInHours / 24);
  return formatters.relativeTime(-differenceInDays, "day");
}
