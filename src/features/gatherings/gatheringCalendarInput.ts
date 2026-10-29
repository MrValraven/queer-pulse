import type { CalendarEventInput } from "../../shared/lib/calendarExport";
import type { useFormat } from "../../shared/i18n/format";
import { intlLocale } from "../../shared/i18n/locale";
import type { Language, TFunction } from "../../shared/i18n/types";
import { eventZoneFormat } from "./eventTimezone";
import type { GatheringDetail } from "./data";
import { gatheringShareUrl } from "./gatheringPaths";
import { readableMentionText } from "./shareKit/gatheringCalendar";

/** Assumed length of a gathering whose host stated no end time: long enough
 *  that a calendar entry does not read as a five-minute appointment, short
 *  enough that it does not swallow the evening. */
export const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

/**
 * The calendar entry's credit line: "Hosted by Ana Lopes for Coletivo Gula and
 * Drama Club", or "Hosted by Ana Lopes" with no community to name. Empty
 * without a host name. `communityNames` holds only the communities this viewer
 * may see named, lead first.
 */
export function calendarHostedByLine({
  host,
  communityNames,
  t,
  language,
}: {
  host: string;
  communityNames: readonly string[];
  t: TFunction;
  language: Language;
}): string {
  const trimmedHost = host.trim();
  if (!trimmedHost) return "";
  if (communityNames.length === 0) {
    return t("gatherings:common.calendarHostedBy", { host: trimmedHost });
  }
  const communities = new Intl.ListFormat(intlLocale(language), {
    type: "conjunction",
  }).format(communityNames);
  return t("gatherings:common.calendarHostedByFor", {
    host: trimmedHost,
    communities,
  });
}

/**
 * The calendar entry's notes: the host's description, the credit line, then
 * the gathering's QueerPulse link, each as its own paragraph and skipped when
 * empty. Mentions read as their bare slug, as the publish screen's file has
 * them.
 */
export function calendarDescription({
  body,
  hostedByLine,
  url,
}: {
  body: string;
  hostedByLine: string;
  url: string;
}): string {
  return [readableMentionText(body.trim()), hostedByLine, url]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * The gathering as one calendar event. The description carries the host's
 * own words, who hosts it and for which communities, and the gathering's
 * QueerPulse link, so the calendar entry leads back to the page with its
 * address, RSVP and updates. The location is the street address when the
 * viewer holds one, so the calendar can map it, else the venue.
 */
export function toCalendarInput(
  gathering: GatheringDetail,
  hostedByLine: string,
): CalendarEventInput {
  const start = gathering.date;
  const end =
    gathering.endAt ?? new Date(start.getTime() + DEFAULT_DURATION_MS);
  const streetAddress =
    gathering.address?.trim() || gathering.venueListing?.address?.trim();
  return {
    title: gathering.title,
    start,
    end,
    location: streetAddress || (gathering.venue ?? gathering.hood),
    description: calendarDescription({
      body: gathering.body,
      hostedByLine,
      url: gatheringShareUrl(gathering.slug),
    }),
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
