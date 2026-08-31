import { useFormat } from "../../shared/i18n/format";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days between `iso` and now, floored at 0. Null for an unparseable
 *  timestamp, so a bad value drops the phrase instead of printing "NaN days". */
export function wholeDaysSince(iso: string): number | null {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((Date.now() - then) / DAY_MS));
}

/**
 * Whole days from now until `iso`, rounded UP so a deadline eleven hours away
 * reads as "1 day" rather than "0 days". Negative once the moment has passed,
 * and null for an unparseable timestamp.
 *
 * Rounding up is the safe direction for a deadline the applicant cannot be
 * reminded of: nothing will chase them, so the number on the page is the only
 * warning they get, and it must never round down to zero while the link still
 * works.
 */
export function wholeDaysUntil(iso: string): number | null {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.ceil((then - Date.now()) / DAY_MS);
}

/**
 * A localized day label, or null when there is no usable timestamp. Every date
 * on the status page goes through `useFormat()`; an ISO string must never reach
 * the screen, and neither must "Invalid Date", so an unparseable value falls
 * back to the state's own no-date copy.
 */
export function useDayLabel(): (iso: string | null) => string | null {
  const format = useFormat();
  return (iso) => {
    if (!iso) return null;
    const value = new Date(iso);
    return Number.isNaN(value.getTime()) ? null : format.date(value);
  };
}
