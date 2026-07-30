import { Link } from "react-router-dom";
import { FiCalendar, FiDownload } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import { gatheringPath } from "../gatherings/data";
import {
  buildGoogleCalendarUrl,
  downloadUpcomingIcs,
} from "./upcomingCalendar";
import s from "./DirectorySpacePage.module.css";

interface Props {
  upcoming: NonNullable<DirectoryPlace["upcoming"]>;
  placeName: string;
  /** Moderation preview: skip the add-to-calendar affordance (nothing to add
   * to your own calendar from a read-only preview) — the deep link to the
   * event's own page stays, it's harmless in preview too. */
  preview?: boolean;
}

/** "Upcoming here" card body: one row per event, each linking through to its
 * full Events Hub page (`/gatherings/:slug`) — that's also where RSVP lives,
 * this card intentionally doesn't duplicate it — plus an optional
 * add-to-calendar affordance (Google Calendar + .ics) built from the event's
 * raw `startAt` ISO. Gracefully omits the calendar affordance when `startAt`
 * is absent (older/incomplete data). */
export function DirectoryUpcoming({ upcoming, placeName, preview }: Props) {
  const { t } = useTranslation();

  return (
    <>
      {upcoming.map((upcomingEvent) => (
        <p key={upcomingEvent.slug} className={s.upRow}>
          <b>{upcomingEvent.when}</b>
          <br />
          <Link to={gatheringPath(upcomingEvent.slug)} className={s.upTitle}>
            {upcomingEvent.title}
          </Link>
          {!preview && upcomingEvent.startAt && (
            <span className={s.upCalendarRow}>
              <FiCalendar aria-hidden="true" />
              {t("marketing:directory.detail.upcoming.addToCalendar")}
              <a
                href={buildGoogleCalendarUrl({
                  title: upcomingEvent.title,
                  startISO: upcomingEvent.startAt,
                  location: placeName,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className={s.upCalendarLink}
              >
                {t("marketing:directory.detail.upcoming.googleCalendar")}
              </a>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                className={s.upCalendarLink}
                onClick={() =>
                  downloadUpcomingIcs(
                    {
                      title: upcomingEvent.title,
                      startISO: upcomingEvent.startAt!,
                      location: placeName,
                    },
                    `${upcomingEvent.slug}.ics`,
                  )
                }
              >
                <FiDownload aria-hidden="true" />
                {t("marketing:directory.detail.upcoming.downloadIcs")}
              </button>
            </span>
          )}
        </p>
      ))}
    </>
  );
}
