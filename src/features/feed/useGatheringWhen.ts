import { useMemo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { eventZoneFormat } from "../gatherings/eventTimezone";
import type { FeedItem } from "./api/feed.api";
import { daysFromToday } from "./sidebarUpcomingDay";

/** A parsed ISO instant, or `null` when it is missing or unreadable. */
function parseInstant(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * The live event card's date row, read on the event's own clock: "Today ·
 * 19:00", "Tomorrow · 19:00" or "Tue, Oct 27 · 07:00 PM" for an event still to
 * come or under way, and "Took place on October 13" once it has ended (its
 * end, or its start when the host set no end). The year shows only when it is
 * not the current one, and the time carries a zone label whenever the event's
 * zone reads differently from the viewer's (`eventZoneFormat`).
 *
 * `null` when the item carries no readable `startsAt` (an older backend, or
 * any item that is not a gathering), which the card reads as "show the posted
 * time as before".
 */
export function useGatheringWhen(item?: FeedItem): string | null {
  const { t } = useTranslation();
  const fmt = useFormat();
  // One clock per mount, so the past check and "today" agree.
  const now = useMemo(() => new Date(), []);

  const startDate = parseInstant(item?.startsAt);
  if (!startDate) return null;
  const endDate = parseInstant(item?.endsAt);
  const zone = eventZoneFormat(item?.timezone, startDate);
  const yearIn = (at: Date) =>
    fmt.date(at, { year: "numeric", ...zone.dateOptions });
  const yearOptions: Intl.DateTimeFormatOptions =
    yearIn(startDate) === yearIn(now) ? {} : { year: "numeric" };

  const finishedAt = endDate ?? startDate;
  if (finishedAt.getTime() < now.getTime()) {
    const date = fmt.date(startDate, {
      day: "numeric",
      month: "long",
      ...yearOptions,
      ...zone.dateOptions,
    });
    return t("feed:gathering.tookPlace", { date });
  }

  const time = fmt.time(startDate, zone.timeOptions);
  const dayOffset = daysFromToday(startDate, now, zone.dateOptions.timeZone);
  if (dayOffset === 0) return t("feed:gathering.whenToday", { time });
  if (dayOffset === 1) return t("feed:gathering.whenTomorrow", { time });
  const date = fmt.date(startDate, {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...yearOptions,
    ...zone.dateOptions,
  });
  return t("feed:gathering.when", { date, time });
}
