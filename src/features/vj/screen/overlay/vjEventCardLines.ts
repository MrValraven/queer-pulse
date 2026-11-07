import type { VjEventCardDTO } from "../../../../shared/contracts/vj";

export interface VjEventCardLines {
  title: string;
  /** The start, in the event's own time zone and the app language. */
  dateLine: string;
  /** The area of an in-person event; null when unset or online. */
  placeLine: string | null;
  /** True makes the place line read "Online". */
  isOnline: boolean;
}

const DATE_LINE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "numeric",
  minute: "2-digit",
};

function formatStart(
  startAt: string,
  locale: string,
  timezone: string,
): string {
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      ...DATE_LINE_OPTIONS,
      timeZone: timezone,
    }).format(start);
  } catch {
    // An unknown zone name: the device zone keeps the line readable.
    return new Intl.DateTimeFormat(locale, DATE_LINE_OPTIONS).format(start);
  }
}

/** The lines of the event card, formatted for `locale` (a BCP-47 tag). */
export function vjEventCardLinesOf(
  card: VjEventCardDTO,
  locale: string,
): VjEventCardLines {
  const area = card.area?.trim() ?? "";
  return {
    title: card.title,
    dateLine: formatStart(card.startAt, locale, card.timezone),
    placeLine: card.isOnline || area === "" ? null : area,
    isOnline: card.isOnline,
  };
}
