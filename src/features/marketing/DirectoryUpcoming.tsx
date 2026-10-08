import { Link } from "react-router-dom";
import { FiCalendar, FiDownload } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
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
 * is absent (older/incomplete data). A gathering the listing runs carries a
 * "Run by" line and no calendar location. */
export function DirectoryUpcoming({ upcoming, placeName, preview }: Props) {
  const { t } = useTranslation();
  const fmt = useFormat();

  // A row with a real start time is formatted here in the viewer's language,
  // the same shape the live adapter builds; a row with only a preformatted
  // string shows it as given.
  const whenLabel = (upcomingEvent: Props["upcoming"][number]) => {
    if (!upcomingEvent.startAt) return upcomingEvent.when;
    const startAt = new Date(upcomingEvent.startAt);
    if (Number.isNaN(startAt.getTime())) return upcomingEvent.when;
    return `${fmt.date(startAt, {
      weekday: "short",
      day: "numeric",
      month: "short",
    })} · ${fmt.time(startAt, { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <>
      {upcoming.map((upcomingEvent) => (
        <p key={upcomingEvent.slug} className={s.upRow}>
          <b>{whenLabel(upcomingEvent)}</b>
          <br />
          <Link to={gatheringPath(upcomingEvent.slug)} className={s.upTitle}>
            {upcomingEvent.title}
          </Link>
          {upcomingEvent.role === "runBy" && (
            <>
              <br />
              {t("marketing:directory.detail.upcoming.runBy", {
                name: placeName,
              })}
            </>
          )}
          {!preview && upcomingEvent.startAt && (
            <span className={s.upCalendarRow}>
              <FiCalendar aria-hidden="true" />
              {t("marketing:directory.detail.upcoming.addToCalendar")}
              <a
                href={buildGoogleCalendarUrl({
                  title: upcomingEvent.title,
                  startISO: upcomingEvent.startAt,
                  location: upcomingEvent.role === "runBy" ? "" : placeName,
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
                      location: upcomingEvent.role === "runBy" ? "" : placeName,
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
