import type { CalendarEventInput } from "../../shared/lib/calendarExport";
import type { useFormat } from "../../shared/i18n/format";
import { eventZoneFormat } from "./eventTimezone";
import type { GatheringDetail } from "./data";

/** Assumed length of a gathering whose host stated no end time: long enough
 *  that a calendar entry does not read as a five-minute appointment, short
 *  enough that it does not swallow the evening. */
export const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

export function toCalendarInput(
  gathering: GatheringDetail,
): CalendarEventInput {
  const start = gathering.date;
  const end =
    gathering.endAt ?? new Date(start.getTime() + DEFAULT_DURATION_MS);
  return {
    title: gathering.title,
    start,
    end,
    location: gathering.venue ?? gathering.hood,
  };
}

/**
 * The line under the "Add to calendar" sheet's title: weekday and date, start
 * time, and the neighbourhood. The date and time are written in the event's own
 * timezone when the host set one, so a member browsing from elsewhere sees the
 * wall clock the gathering actually starts at. `formatters` comes from the
 * caller's `useFormat()`, which keeps this a plain function any component can
 * share.
 */
export function gatheringCalendarSubtitle(
  gathering: GatheringDetail,
  formatters: ReturnType<typeof useFormat>,
): string {
  const zone = eventZoneFormat(gathering.timezone, gathering.date);
  return [
    formatters.date(gathering.date, {
      weekday: "short",
      month: "short",
      day: "numeric",
      ...zone.dateOptions,
    }),
    formatters.time(gathering.date, zone.timeOptions),
    gathering.hood,
  ]
    .filter(Boolean)
    .join(" · ");
}
