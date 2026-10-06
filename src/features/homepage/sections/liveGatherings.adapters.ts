import type { TFunction } from "../../../shared/i18n/types";
import type { LandingGatheringFeatureDTO } from "../../admin/api/landingFeatures.api";
import type { CalendarEvent } from "../../gatherings/data";

/**
 * One row of the homepage's live "what's on" teaser, whichever source fed it:
 * the real events board (a signed-in member) or the admin-curated gathering
 * slice of `GET /landing/features` (a signed-out visitor). `LiveGatherings`
 * renders this shape alone, so both sources reach the same row layout.
 */
export interface HomepageGatheringRow {
  key: string;
  /** The gathering's detail path, or null when the reader cannot open it.
   *  Detail pages sit under the gated `/gatherings/*`, so a curated row for a
   *  signed-out visitor carries null and opens the membership explainer. */
  to: string | null;
  /** Start instant, including the clock time. */
  date: Date;
  /** The small accent line above the title. */
  kicker: string;
  title: string;
  /** Area-level place: a neighbourhood, "Online", or empty. */
  place: string;
  /** The going count, when the source carries one. The curated slice
   *  carries none: the public payload stays silent about attendance, counts
   *  included. */
  attendeeCount?: number;
}

/** A card off the signed-in member's events board. */
export function calendarEventToGatheringRow(
  event: CalendarEvent,
): HomepageGatheringRow {
  return {
    key: event.to,
    to: event.to,
    date: event.date,
    kicker: event.org,
    title: event.title,
    place: event.hood,
    ...(typeof event.attendeeCount === "number"
      ? { attendeeCount: event.attendeeCount }
      : {}),
  };
}

/** An admin-curated public gathering. The admin's kicker line leads when they
 *  wrote one; the place falls back to "Online" for an online gathering with
 *  no neighbourhood, the same order the board's own cards use. `to` is null:
 *  this slice only ever reaches a signed-out visitor, whom the gated detail
 *  page would bounce to sign-in. */
export function landingGatheringToGatheringRow(
  feature: LandingGatheringFeatureDTO,
  translate: TFunction,
): HomepageGatheringRow {
  return {
    key: feature.id,
    to: null,
    date: new Date(feature.startAt),
    kicker: feature.blurb ?? translate("homepage:liveGatherings.curatedKicker"),
    title: feature.title,
    place:
      feature.area ??
      (feature.isOnline ? translate("gatherings:common.online") : ""),
  };
}
