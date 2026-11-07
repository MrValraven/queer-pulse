import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { linkToPath } from "../../app/routeMap";
import type { Notification } from "./data";
import styles from "./NotificationsPage.module.css";

/**
 * A notification's sentence: the translated copy with the actor's name as a
 * link to their profile, or the row's plain text, followed by the bundle's
 * "and 39 others" when other members did the same thing.
 */
export function NotificationItemSentence({
  notification,
  othersLabel,
}: {
  notification: Notification;
  /** "and 39 others", or empty when the row names one member. */
  othersLabel: string;
}) {
  return (
    <div className={styles.text}>
      {notification.actor?.textKey ? (
        <Translation
          i18nKey={notification.actor.textKey}
          // A matched Go together chat's mention actor carries an empty
          // href (no profile to open): an unmapped `profile` tag renders
          // its plain inner text, so the name still shows with no link
          // (see `Translation`'s own doc on that fallback).
          components={
            notification.actor.href
              ? {
                  profile: (
                    <Link
                      to={linkToPath(notification.actor.href)}
                      className={styles.actorLink}
                    />
                  ),
                }
              : undefined
          }
          values={{
            ...notification.actor.textValues,
            name: notification.actor.name,
          }}
        />
      ) : (
        notification.text
      )}
      {othersLabel && (
        <span className={styles.bundleCount}> {othersLabel}</span>
      )}
    </div>
  );
}

/** How the catalog copy joins the parts of a kind label ("Reading group ·
 *  Invitation"). */
const META_PART_SEPARATOR = " · ";

/**
 * The page row's one quiet line under the sentence: what kind of
 * notification it is, then when. A kind label that already joins two parts
 * is split, so every separator on the line is the same dot, drawn in CSS.
 */
export function NotificationItemMetaLine({
  notification,
}: {
  notification: Notification;
}) {
  const metaParts = notification.meta
    .split(META_PART_SEPARATOR)
    .map((metaPart) => metaPart.trim())
    .filter(Boolean);
  return (
    <div className={styles.metaLine}>
      {metaParts.map((metaPart, partIndex) => (
        <span key={`${partIndex}-${metaPart}`} className={styles.metaItem}>
          {metaPart}
        </span>
      ))}
      {notification.time && (
        <span className={`${styles.metaItem} ${styles.metaTime}`}>
          {notification.time}
        </span>
      )}
    </div>
  );
}
