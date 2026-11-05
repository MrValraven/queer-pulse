import type { Language } from "../../shared/i18n/types";
import { parseEventDate } from "./eventDates";

/** The regional form each app language reads dates in: day before month in
 *  both, the way the poster block stacks them. */
const EVENT_DATE_LOCALE: Record<Language, string> = {
  en: "en-GB",
  pt: "pt-PT",
};

export interface EventDateLabels {
  /** "Sat" / "sáb", or null for a month-only date. */
  weekday: string | null;
  /** "14", or null for a month-only date. */
  day: string | null;
  /** "Nov" / "nov": three letters, the poster's month mark. */
  month: string;
  year: number;
  isMonthOnly: boolean;
  /** The whole date written out for a screen reader: "Saturday 14 November
   *  2026" / "sábado, 14 de novembro de 2026", or "November 2026" for a
   *  month-only date. */
  longLabel: string;
}

/** A short Intl part as the poster prints it: no abbreviation dot, three
 *  letters at most ("Sept" and "set." both become a three-letter mark). */
function posterMark(value: string): string {
  return value.replace(/\.$/, "").slice(0, 3);
}

/**
 * The labels a stacked poster date block shows for an event's `date`, in the
 * active language, or null when the date is empty or free text. UTC on both
 * ends, so no time zone moves the day.
 */
export function eventDateLabels(
  value: string | null | undefined,
  language: Language,
): EventDateLabels | null {
  const parts = parseEventDate(value);
  if (!parts) return null;
  const locale = EVENT_DATE_LOCALE[language];
  const moment = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day ?? 1),
  );
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(
      moment,
    );
  const month = posterMark(format({ month: "short" }));
  if (parts.day === null) {
    return {
      weekday: null,
      day: null,
      month,
      year: parts.year,
      isMonthOnly: true,
      longLabel: format({ month: "long", year: "numeric" }),
    };
  }
  return {
    weekday: posterMark(format({ weekday: "short" })),
    day: String(parts.day),
    month,
    year: parts.year,
    isMonthOnly: false,
    longLabel: format({
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}
