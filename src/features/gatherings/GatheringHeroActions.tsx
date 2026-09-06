import { useState } from "react";
import { FiAlertCircle, FiArrowRight, FiCalendar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AddToCalendarSheet } from "../../shared/components/calendar/AddToCalendarSheet";
import type { CalendarEventInput } from "../../shared/lib/calendarExport";
import { routes } from "../../app/routeMap";
import { GatheringBookmarkButton } from "./GatheringBookmarkButton";
import { eventZoneFormat } from "./eventTimezone";
import type { GatheringDetail } from "./data";
import type { GatheringRsvpState } from "./useGatheringRsvp";
import styles from "./GatheringPage.module.css";

/** Assumed length of a gathering whose host stated no end time — long enough
 *  that a calendar entry does not read as a five-minute appointment, short
 *  enough that it does not swallow the evening. */
const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

function toCalendarInput(gathering: GatheringDetail): CalendarEventInput {
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
 * The hero action row: the primary RSVP, Save, "Add to calendar", and the way
 * back to the board.
 *
 * WHY THE STATE BANNER IS HERE. A cancelled gathering and one that has already
 * happened both used to render an ordinary, enabled RSVP button on this page.
 * The server refuses both (a cancelled event is "not open for RSVPs"; a past
 * one now is too), so the member pressed a button and got an error about a
 * fact the page had never told them (PRD-181, PRD-183). The banner states it,
 * and the actions that no longer make sense are gone rather than disabled.
 *
 * "Add to calendar" lives here because the moment a member confirms a seat is
 * the moment they want the date, and until now the only way to get it was to
 * leave for My Events and find a card's menu (PRD-189).
 */
export function GatheringHeroActions({
  gathering,
  routeParam,
  rsvp,
}: {
  gathering: GatheringDetail;
  /** The raw `:slug` route param — the bookmark toggle keys its cache on it. */
  routeParam: string | undefined;
  /** Shared with the sidebar's RSVP panel — see `GatheringDetailBody`. */
  rsvp: GatheringRsvpState;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const zone = eventZoneFormat(gathering.timezone, gathering.date);
  const calendarSubtitle = [
    fmt.date(gathering.date, {
      weekday: "short",
      month: "short",
      day: "numeric",
      ...zone.dateOptions,
    }),
    fmt.time(gathering.date, zone.timeOptions),
    gathering.hood,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      {!rsvp.canRsvp && (
        <div className={styles.stateBanner} role="status">
          <span className={styles.stateBannerIcon} aria-hidden>
            <FiAlertCircle />
          </span>
          <span>
            {t(
              rsvp.isCancelled
                ? "gatherings:gathering.cancelledBanner"
                : "gatherings:gathering.endedBanner",
            )}
          </span>
        </div>
      )}
      <div className={styles.cta}>
        {rsvp.canRsvp && (
          <Button
            size="lg"
            disabled={rsvp.isPending}
            onClick={rsvp.isConfirmed ? rsvp.cancelRsvp : rsvp.goOrWaitlist}
          >
            {rsvp.isConfirmed
              ? t("gatherings:rsvpControl.cancelCta")
              : rsvp.isPending
                ? t("gatherings:rsvpControl.pendingCta")
                : t(
                    gathering.isFull
                      ? "gatherings:rsvpControl.waitlistCta"
                      : gathering.ctaKey,
                  )}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        )}
        <GatheringBookmarkButton
          slug={gathering.slug}
          param={routeParam}
          bookmarked={gathering.bookmarked ?? false}
        />
        {/* Pointless once the evening is over or off, so it goes with the
            RSVP rather than sitting there offering to diarise the past. */}
        {rsvp.canRsvp && (
          <Button
            size="lg"
            variant="ghost"
            onClick={() => setCalendarOpen(true)}
          >
            <FiCalendar aria-hidden /> {t("shared:addToCalendar.title")}
          </Button>
        )}
        <Button size="lg" variant="ghost" to={routes.calendar}>
          {t("gatherings:gathering.seeAllCta")}
        </Button>
      </div>
      {isCalendarOpen && (
        <AddToCalendarSheet
          input={toCalendarInput(gathering)}
          subtitle={calendarSubtitle}
          filename={`${gathering.title.replace(/\s+/g, "-")}.ics`}
          onToast={(message) => showToast(message, "success")}
          onClose={() => setCalendarOpen(false)}
        />
      )}
    </>
  );
}
