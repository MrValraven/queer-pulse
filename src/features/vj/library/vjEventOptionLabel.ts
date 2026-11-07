import type { VjEventOptionDTO } from "../../../shared/contracts/vj";

/** Each part is formatted on its own: some locales turn a short month into a
 *  number when it shares a pattern with the day ("13/11" in pt-PT). */
const WEEKDAY_OPTIONS: Intl.DateTimeFormatOptions = { weekday: "short" };
const DAY_OPTIONS: Intl.DateTimeFormatOptions = { day: "numeric" };
const MONTH_OPTIONS: Intl.DateTimeFormatOptions = { month: "short" };
const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
};

/** "Fri 13 Nov, 22:00" in the app language (`locale` is a BCP-47 tag, as
 *  `intlLocale` answers; Portuguese reads "sexta 13 nov, 22:00"). `timeZone`
 *  defaults to the device's own zone, the zone the admin reads every other
 *  date in. An unreadable date answers "". */
export function vjEventWhenOf(
  startAt: string,
  locale: string,
  timeZone?: string,
): string {
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) return "";
  const partOf = (options: Intl.DateTimeFormatOptions): string =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone })
      .format(start)
      // "nov." and "sex." read as abbreviations without the full stop.
      .replace(/\.$/, "");
  const day = [
    partOf(WEEKDAY_OPTIONS),
    partOf(DAY_OPTIONS),
    partOf(MONTH_OPTIONS),
  ].join(" ");
  return `${day}, ${partOf(TIME_OPTIONS)}`;
}

/** Title, date and area joined for the Select's search, so typing a
 *  weekday, a month or a neighbourhood finds the event. */
export function vjEventSearchTextOf(
  option: VjEventOptionDTO,
  locale: string,
  timeZone?: string,
): string {
  return [
    option.title,
    vjEventWhenOf(option.startAt, locale, timeZone),
    option.area?.trim() ?? "",
  ]
    .filter((part) => part !== "")
    .join(" ");
}
