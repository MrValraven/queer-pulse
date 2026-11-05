import type { EventDateLabels } from "./eventDateLabels";

/**
 * The stacked poster date on an event row: weekday caps, the day number large,
 * month caps, and the year small when the timeline asks for it. A month-only
 * date prints its month large with no day or weekday. An event without a
 * usable date keeps the column (so titles still align) and shows its free text
 * small, or nothing. The block is decoration for sighted readers: the row
 * carries the same date written out in full for a screen reader, so the
 * block itself is `aria-hidden`.
 */
export function EventDateBlock({
  labels,
  rawDate,
  shouldShowYear,
}: {
  labels: EventDateLabels | null;
  /** The stored date, shown small when it could not be parsed. */
  rawDate: string;
  shouldShowYear: boolean;
}) {
  if (!labels) {
    return (
      <span className="pp-ev-date is-undated" aria-hidden="true">
        {rawDate && <span className="pp-ev-raw">{rawDate}</span>}
      </span>
    );
  }
  return (
    <span
      className={`pp-ev-date${labels.isMonthOnly ? " is-month" : ""}`}
      aria-hidden="true"
    >
      {labels.weekday && <span className="pp-ev-dow">{labels.weekday}</span>}
      <span className="pp-ev-day">{labels.day ?? labels.month}</span>
      {labels.day && <span className="pp-ev-mon">{labels.month}</span>}
      {shouldShowYear && <span className="pp-ev-yr">{labels.year}</span>}
    </span>
  );
}
