/**
 * Segment-list derivation, labels, and placeholders for the shared `DateField`
 * spinbutton input. Locale-correct day/month/year order comes from
 * `Intl.DateTimeFormat(...).formatToParts` on a reference date (never a
 * hardcoded mm/dd/yyyy assumption); 12h-vs-24h is detected the same way, by
 * checking whether a formatted time carries a `dayPeriod` part.
 *
 * Segment labels are resolved straight off the eager "shared" catalog (see
 * `src/shared/i18n/catalogs/index.ts`) for the segment's OWN locale, rather
 * than through `useTranslation()`'s app-wide `t()`. A `DateField` can be
 * asked to render in a locale that differs from the active app language
 * (e.g. a `pt` field embedded in an `en` page), and `t()` has no per-call
 * locale override — so labels are looked up directly, the same strings `t()`
 * would return if the app's language matched `locale`.
 */

import { catalogs } from "../../i18n/catalogs";
import type { Language } from "../../i18n/types";

export type SegmentType =
  "day" | "month" | "year" | "hour" | "minute" | "meridiem";

const REFERENCE_DATE = new Date(2000, 0, 2);
const DATE_TYPES: SegmentType[] = ["day", "month", "year"];
const TIME_TYPES: SegmentType[] = ["hour", "minute"];

/** Detects a 12-hour clock: `locale` formats a time with an AM/PM `dayPeriod` part. */
export function isTwelveHourLocale(locale: string): boolean {
  const parts = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "numeric",
  }).formatToParts(new Date(2000, 0, 1, 13, 0));
  return parts.some((part) => part.type === "dayPeriod");
}

/** Locale-correct day/month/year order via `formatToParts` on a reference date. */
function dateOrder(locale: string): SegmentType[] {
  const parts = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(REFERENCE_DATE);
  return parts
    .filter(
      (part) =>
        part.type === "day" || part.type === "month" || part.type === "year",
    )
    .map((part) => part.type as SegmentType);
}

function timeOrder(is12Hour: boolean): SegmentType[] {
  return is12Hour ? ["hour", "minute", "meridiem"] : ["hour", "minute"];
}

/** The ordered segment list for a `date | datetime | time | month` field mode. */
export function buildSegmentOrder(
  mode: "date" | "datetime" | "time" | "month",
  locale: string,
  is12Hour: boolean,
): SegmentType[] {
  if (mode === "month")
    return dateOrder(locale).filter((type) => type !== "day");
  if (mode === "time") return timeOrder(is12Hour);
  if (mode === "date") return dateOrder(locale);
  return [...dateOrder(locale), ...timeOrder(is12Hour)];
}

/** The visible separator glyph between two adjacent segments, or `null` for a
 *  boundary that only needs the layout gap (date→time, before the meridiem). */
export function separatorAfter(
  type: SegmentType,
  nextType: SegmentType | undefined,
): string | null {
  if (!nextType) return null;
  if (DATE_TYPES.includes(type) && DATE_TYPES.includes(nextType)) return "/";
  if (TIME_TYPES.includes(type) && TIME_TYPES.includes(nextType)) return ":";
  return null;
}

const SEGMENT_LABEL_PATHS: Record<SegmentType, string> = {
  day: "calendar.segment.day",
  month: "calendar.segment.month",
  year: "calendar.segment.year",
  hour: "calendar.segment.hour",
  minute: "calendar.segment.minute",
  meridiem: "calendar.segment.meridiem",
};

export const SEGMENT_PLACEHOLDER: Record<SegmentType, string> = {
  day: "dd",
  month: "mm",
  year: "yyyy",
  hour: "hh",
  minute: "mm",
  meridiem: "am",
};

function normalizeLanguage(locale: string): Language {
  return locale.toLowerCase().startsWith("pt") ? "pt" : "en";
}

/** The segment's accessible label, resolved for `locale` (not the app's
 *  active language) off the eager "shared" catalog. Falls back through
 *  English, then the raw path, so a missing key degrades visibly. */
export function segmentLabel(locale: string, type: SegmentType): string {
  const language = normalizeLanguage(locale);
  const path = SEGMENT_LABEL_PATHS[type];
  return catalogs[language].shared[path] ?? catalogs.en.shared[path] ?? path;
}
