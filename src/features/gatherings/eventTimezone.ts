/**
 * A gathering's start instant is stored in UTC, but its *wall clock* belongs to
 * the zone the host scheduled it in (`event.timezone`, an IANA name captured at
 * creation). Formatting that instant in whatever zone the reader's browser
 * happens to resolve shows the wrong hour to an organiser abroad, a travelling
 * member, or anyone on an online gathering — silently, with nothing on screen
 * to say which clock the number belongs to.
 *
 * This builds the `Intl.DateTimeFormatOptions` that put the wall clock back in
 * the gathering's own zone, and asks for the short zone name only when that
 * zone actually reads differently from the viewer's own. A gathering with no
 * `timezone` (every demo-registry gathering, and any older event) falls all the
 * way back to the browser's zone with no label, exactly as before.
 */

/** The wall clock `at` shows in `timeZone`, or in the viewer's own zone when
 *  `timeZone` is omitted. `null` when the zone name is unusable. */
function wallClockIn(timeZone: string | undefined, at: Date): string | null {
  try {
    return new Intl.DateTimeFormat("en-US", {
      ...(timeZone ? { timeZone } : {}),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(at);
  } catch {
    // An unvalidated/invalid IANA name (mock data, an old row) must never take
    // the page down — the caller treats `null` as "no usable zone".
    return null;
  }
}

export interface EventZoneFormat {
  /** Spread into a `fmt.date(...)` call so the DATE is the gathering's own. */
  dateOptions: Intl.DateTimeFormatOptions;
  /** Spread into a `fmt.time(...)` call: the gathering's own clock, plus the
   *  short zone name whenever that clock differs from the viewer's. */
  timeOptions: Intl.DateTimeFormatOptions;
  /** True when the gathering's zone reads differently from the viewer's at
   *  this instant — the cue that a zone label is worth showing at all. */
  isForeignZone: boolean;
}

/** Empty options + no label: format in the viewer's own zone, as before. */
const VIEWER_ZONE_FORMAT: EventZoneFormat = {
  dateOptions: {},
  timeOptions: {},
  isForeignZone: false,
};

/**
 * Formatting options for a gathering starting at `at` in `timezone`.
 *
 * @example
 * const zone = eventZoneFormat(gathering.timezone, gathering.date);
 * fmt.date(gathering.date, { day: "numeric", month: "long", ...zone.dateOptions });
 * fmt.time(gathering.date, zone.timeOptions); // "19:00" — or "19:00 GMT+1"
 */
export function eventZoneFormat(
  timezone: string | undefined,
  at: Date,
): EventZoneFormat {
  if (!timezone) return VIEWER_ZONE_FORMAT;
  const eventWallClock = wallClockIn(timezone, at);
  if (eventWallClock === null) return VIEWER_ZONE_FORMAT;
  const isForeignZone = eventWallClock !== wallClockIn(undefined, at);
  return {
    dateOptions: { timeZone: timezone },
    timeOptions: isForeignZone
      ? { timeZone: timezone, timeZoneName: "short" }
      : { timeZone: timezone },
    isForeignZone,
  };
}
