import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { eventZoneFormat } from "./eventTimezone";
import { gatheringWhen } from "./gatheringSchedule";
import { ONLINE_HOOD_VALUE } from "./shareKit/shareKit.data";
import { hoodDisplayName } from "./shareKit/shareText";
import type { GatheringDetail } from "./data";

/** The fields of a gathering the share message reads. */
export type ShareMessageGathering = Pick<
  GatheringDetail,
  | "slug"
  | "title"
  | "date"
  | "endAt"
  | "timezone"
  | "hood"
  | "neighbourhood"
  | "venue"
  | "venueListing"
  | "isOnline"
  | "visibility"
  | "cancelled"
>;

/** The audiences any member can open. A gathering kept to a smaller circle
 *  (a community, a network, an invite list) shares its title and link only:
 *  a forwarded message reaches people the host never meant to tell when and
 *  where. The demo registry carries no `visibility` and reads as open. */
const OPEN_AUDIENCES: ReadonlySet<string> = new Set(["public", "members"]);

/** Day and month spelled out: a message reads as prose, where the hero's
 *  short chips would read as shorthand. */
const MESSAGE_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
};

/** "Saturday 6 June · 19:30", on the gathering's own clock, with the
 *  "(next day)" note when it runs past midnight. */
function whenLine(
  gathering: ShareMessageGathering,
  t: TFunction,
  fmt: Formatters,
): string {
  const zone = eventZoneFormat(gathering.timezone, gathering.date);
  const when = gatheringWhen(
    gathering.date,
    gathering.endAt,
    fmt,
    t,
    { ...MESSAGE_DATE_OPTIONS, ...zone.dateOptions },
    zone.timeOptions,
  );
  const time = when.nextDayNote
    ? t("gatherings:headerToolbar.share.message.timeWithNote", {
        time: when.timeText,
        note: when.nextDayNote,
      })
    : when.timeText;
  return t("gatherings:headerToolbar.share.message.when", {
    date: when.dateText,
    time,
  });
}

/**
 * Where it happens, as anyone may know it: the venue and the neighbourhood,
 * or "Online". The street address stays out. The server discloses it to
 * confirmed attendees only, and a forwarded message reaches whoever it
 * reaches. The demo registry carries no `isOnline`, so its "Online" hood
 * stands in for the flag there.
 */
function publicPlaceLine(
  gathering: ShareMessageGathering,
  t: TFunction,
): string {
  const isOnline = gathering.isOnline ?? gathering.hood === ONLINE_HOOD_VALUE;
  if (isOnline) return t("gatherings:common.online");
  const venueName = (
    gathering.venueListing?.name ??
    gathering.venue ??
    ""
  ).trim();
  const neighbourhood = hoodDisplayName(
    gathering.neighbourhood?.trim() || gathering.hood,
    t,
  );
  if (!venueName) return neighbourhood;
  // `hood` falls back to the venue name, so a neighbourhood that only repeats
  // the venue is dropped.
  const isRepeat =
    !neighbourhood || neighbourhood.toLowerCase() === venueName.toLowerCase();
  if (isRepeat) return venueName;
  return t("gatherings:headerToolbar.share.message.venueAndHood", {
    venue: venueName,
    neighbourhood,
  });
}

/**
 * The lines a member passes on above the link when they share a gathering:
 * its title, when it is and where it is in public terms. A cancelled
 * gathering says so first and drops the place, so nobody turns up to it.
 * Each line comes from the catalog, so it reads naturally in the sender's
 * language, and a line with nothing to say is left out.
 *
 * Deliberately separate from `buildSharePlansMessage`, which speaks for an
 * attendee and carries the street address they were given.
 */
export function buildGatheringShareMessage(
  gathering: ShareMessageGathering,
  t: TFunction,
  fmt: Formatters,
): string {
  const title = gathering.title.trim();
  const isOpenAudience =
    !gathering.visibility || OPEN_AUDIENCES.has(gathering.visibility);
  if (!isOpenAudience) return title;
  const isCancelled = gathering.cancelled ?? false;
  return [
    isCancelled ? t("gatherings:headerToolbar.share.message.cancelled") : "",
    title,
    whenLine(gathering, t, fmt),
    isCancelled ? "" : publicPlaceLine(gathering, t),
  ]
    .filter(Boolean)
    .join("\n");
}
