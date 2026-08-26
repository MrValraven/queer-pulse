import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EventAnnouncementDTO } from "./api/events.api";
import styles from "./GatheringDetailPanels.module.css";

/**
 * What the organisers have told everyone who is coming (LOC-06).
 *
 * The message travels as an in-app notification and a push, and a notification
 * is a moment that passes. Somebody who read "the door code is 4471" on the
 * tram needs to find it again standing at the door, so the same words live on
 * the page they are already looking at.
 *
 * Renders nothing at all when there is nothing to show: the backend sends an
 * empty list to a viewer with no stake in the gathering, and an empty
 * "announcements" heading at a passer-by would only read as an absence.
 */
export function GatheringAnnouncements({
  announcements,
}: {
  announcements: EventAnnouncementDTO[];
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  if (announcements.length === 0) return null;

  return (
    <section className={styles.panel}>
      <h2 className={styles.heading}>
        {t("gatherings:gathering.announcements.heading")}
      </h2>
      <p className={styles.lead}>
        {t("gatherings:gathering.announcements.lead")}
      </p>
      <ul className={styles.announcements}>
        {announcements.map((announcement) => {
          const authorName = announcement.author
            ? `${announcement.author.firstName} ${announcement.author.lastName}`.trim()
            : "";
          const sentAt = new Date(announcement.createdAt);
          return (
            <li key={announcement.id} className={styles.announcement}>
              <div className={styles.announcementMeta}>
                <span>
                  {authorName
                    ? t("gatherings:gathering.announcements.from", {
                        name: authorName,
                      })
                    : t("gatherings:gathering.announcements.fromOrganiser")}
                </span>
                <span aria-hidden>·</span>
                <time dateTime={announcement.createdAt}>
                  {fmt.date(sentAt, { day: "numeric", month: "short" })}{" "}
                  {fmt.time(sentAt)}
                </time>
              </div>
              <p className={styles.announcementBody}>{announcement.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
