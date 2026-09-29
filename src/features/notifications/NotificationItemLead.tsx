import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { linkToPath } from "../../app/routeMap";
import type { Notification } from "./data";
import styles from "./NotificationsPage.module.css";

/**
 * The leading visual of a notification row: the actor's avatar (a link to
 * their profile when the row names a member), a bare avatar, or the kind's
 * icon tile. Every branch carries `.lead`, which is what the narrow-row grid
 * in NotificationsPage.module.css places in the first column.
 */
export function NotificationItemLead({
  notification,
  isCompact,
}: {
  notification: Notification;
  isCompact: boolean;
}) {
  const avatarSize = isCompact ? 36 : 40;

  if (notification.avatar && notification.actor) {
    return (
      <Link
        to={linkToPath(notification.actor.href)}
        className={`${styles.avatarLink} ${styles.lead}`}
        aria-label={notification.actor.name}
      >
        <Avatar
          initials={notification.avatar.initials}
          tint={notification.avatar.tint}
          src={notification.avatar.src}
          size={avatarSize}
        />
      </Link>
    );
  }

  if (notification.avatar) {
    return (
      <Avatar
        className={styles.lead}
        initials={notification.avatar.initials}
        tint={notification.avatar.tint}
        src={notification.avatar.src}
        size={avatarSize}
      />
    );
  }

  return (
    <span
      className={`${styles.icon} ${styles.lead}`}
      style={{ background: notification.icon?.background }}
    >
      {notification.icon && <notification.icon.Glyph />}
    </span>
  );
}
