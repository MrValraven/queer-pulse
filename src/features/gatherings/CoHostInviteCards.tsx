import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type {
  CohostInviteEventSummaryDTO,
  CohostInviteInviterDTO,
} from "./api/events.api";
import { eventZoneFormat } from "./eventTimezone";
import styles from "./CoHostInvitePage.module.css";

/** Who sent the invite: their avatar, how much hosting they've done, how many
 *  people you both know, and when they'd like an answer by. */
export function CoHostInviteFromCard({
  inviter,
  replyByDate,
}: {
  inviter: CohostInviteInviterDTO;
  replyByDate: string | null;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.fromCard}>
      <div className={styles.fromAv}>
        {inviter.avatarUrl ? (
          <img src={inviter.avatarUrl} alt="" />
        ) : (
          `${inviter.firstName[0] ?? ""}${inviter.lastName[0] ?? ""}`
        )}
      </div>
      <div>
        <div className={styles.fromName}>
          {inviter.firstName} {inviter.lastName}
        </div>
        <div className={styles.fromMeta}>
          <b>
            {t("gatherings:cohostInvite.hostedCount", {
              count: inviter.hostedEventsCount,
            })}
          </b>
          {inviter.mutualConnectionsCount > 0 && (
            <>
              <span className={styles.dot}>·</span>
              <b>
                {t("gatherings:cohostInvite.mutualsCount", {
                  count: inviter.mutualConnectionsCount,
                })}
              </b>
            </>
          )}
          {replyByDate && (
            <>
              <span className={styles.dot}>·</span>
              {t("gatherings:cohostInvite.replyBy", {
                date: fmt.date(new Date(replyByDate), {
                  day: "numeric",
                  month: "short",
                }),
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The gathering itself: date block, title, when/where, and how many people are
 * already coming — plus the host's personal note, when they wrote one.
 *
 * Times read on the gathering's OWN clock (`event.timezone`), labelled when
 * that clock differs from the reader's: a co-host invited from another country
 * needs the host's hours, not their own.
 */
export function CoHostInviteEventCard({
  event,
  message,
}: {
  event: CohostInviteEventSummaryDTO;
  message: string | null;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const startAt = new Date(event.startAt);
  const endAt = event.endAt ? new Date(event.endAt) : null;
  const zone = eventZoneFormat(event.timezone, startAt);
  return (
    <div className={styles.eventCard}>
      <div className={styles.eventH}>
        <div className={styles.eventDate}>
          <div className="d">
            {fmt.date(startAt, { day: "2-digit", ...zone.dateOptions })}
          </div>
          <div className="m">
            {fmt.date(startAt, { month: "short", ...zone.dateOptions })}
          </div>
        </div>
        <div className={styles.eventInfo}>
          <h2>{event.title}</h2>
          <div className={styles.eventMeta}>
            <b>
              {fmt.date(startAt, { weekday: "short", ...zone.dateOptions })}{" "}
              {fmt.time(startAt, zone.timeOptions)}
              {endAt ? ` – ${fmt.time(endAt, zone.timeOptions)}` : ""}
            </b>
            {event.venue && (
              <>
                <span className={styles.dot} />
                <b>{event.venue}</b>
              </>
            )}
            <span className={styles.dot} />
            <span>
              {t("gatherings:cohostInvite.rsvpsAndWaitlist", {
                rsvps: event.goingCount,
                waitlist: event.waitlistCount,
              })}
            </span>
          </div>
        </div>
      </div>
      {message && <p className={styles.personal}>{message}</p>}
    </div>
  );
}
