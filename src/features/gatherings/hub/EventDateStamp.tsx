import { useFormat } from "../../../shared/i18n/format";
import type { CalendarEvent } from "../data";
import { eventZoneFormat } from "../eventTimezone";
import styles from "./EventDateStamp.module.css";

export type DateStampSize = "card" | "hero";
export type DateStampSurface = "paper" | "onImage";

export interface EventDateStampProps {
  event: CalendarEvent;
  size: DateStampSize;
  /** `onImage` is the cream ticket-stub chip that stays legible over any
   *  cover; `paper` is bare type for a card or row surface. */
  surface: DateStampSurface;
  /** True (the default) when the card names the date to assistive tech some
   *  other way, so the stamp is hidden from it. The ticket card and agenda
   *  row do this in their link's `aria-label` ("title, date"), since their
   *  visible text carries only a time. False names the full date here. */
  isDecorative?: boolean;
}

/** Intl prints some short months and weekdays with an abbreviation point
 *  ("out.", "ter."). A stamp sets them in small caps, where the point reads
 *  as noise. */
function withoutTrailingPoint(text: string): string {
  return text.replace(/\.$/, "");
}

/**
 * A printed date stamp: the day numeral large in Fraunces, the short month
 * above it and the short weekday below it in small caps. Every part reads in
 * the event's OWN zone (see `eventZoneFormat`), so a late gathering abroad does
 * not slide onto the reader's next day. A span across several days shows its
 * first day; the card's text carries the rest.
 */
export function EventDateStamp({
  event,
  size,
  surface,
  isDecorative = true,
}: EventDateStampProps) {
  const formatters = useFormat();
  const zone = eventZoneFormat(event.timezone, event.date);
  const dayNumeral = formatters.date(event.date, {
    day: "numeric",
    ...zone.dateOptions,
  });
  const shortMonth = withoutTrailingPoint(
    formatters.date(event.date, { month: "short", ...zone.dateOptions }),
  );
  const shortWeekday = withoutTrailingPoint(
    formatters.date(event.date, { weekday: "short", ...zone.dateOptions }),
  );
  const fullDate = formatters.date(event.date, {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...zone.dateOptions,
  });
  const className = [
    styles.stamp,
    size === "hero" ? styles.hero : styles.card,
    surface === "onImage" ? styles.onImage : styles.paper,
  ].join(" ");
  const accessibility = isDecorative
    ? { "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": fullDate };

  return (
    <span className={className} {...accessibility}>
      <span className={styles.month}>{shortMonth}</span>
      <span className={styles.day}>{dayNumeral}</span>
      <span className={styles.weekday}>{shortWeekday}</span>
    </span>
  );
}
