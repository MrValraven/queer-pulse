import { useFormat } from "../../shared/i18n/format";

const DATE_FORMAT = {
  day: "numeric",
  month: "short",
  year: "numeric",
} as const;

/** The staff review cards' dates ("Oct 12, 2026" in the active locale), and
 *  an empty string when the date is missing. */
export function useReviewDate() {
  const format = useFormat();
  return (iso: string | null) =>
    iso ? format.date(new Date(iso), DATE_FORMAT) : "";
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Whole days from `iso` until now (0 for under a day, or a bad date). */
export function reviewDaysSince(iso: string | null, now = Date.now()): number {
  if (!iso) return 0;
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return 0;
  return Math.max(0, Math.floor((now - time) / DAY_MS));
}

/** A span as staff read it on a card: hours under two days ("5 hours"),
 *  whole days after that ("3 days"), in the active locale's words. */
export function useReviewSpan() {
  const format = useFormat();
  return (milliseconds: number) => {
    const span = Math.abs(milliseconds);
    if (span < 2 * DAY_MS)
      return format.unit(Math.max(1, Math.round(span / HOUR_MS)), "hour", {
        unitDisplay: "long",
      });
    return format.unit(Math.round(span / DAY_MS), "day", {
      unitDisplay: "long",
    });
  };
}
