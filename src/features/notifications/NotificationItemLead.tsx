import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { linkToPath } from "../../app/routeMap";
import type { Notification } from "./data";
import styles from "./NotificationsPage.module.css";

/**
 * The shape of a row's leading picture. `round` is the 40px circle the bell
 * popover uses (36px there); `rect` is the notifications page's 4:5 portrait
 * picture, 64px wide by 80px tall.
 */
export type NotificationLeadShape = "round" | "rect";

/**
 * The size each shape asks <Avatar> for, so the photo is fetched at the
 * resolution it is drawn at. The portrait picture asks for its height: the
 * square crop it gets back is cut down to the row's `--lead-w` by
 * `object-fit: cover`.
 */
const AVATAR_SIZE_BY_SHAPE = {
  round: 40,
  rect: 80,
} as const satisfies Record<NotificationLeadShape, number>;

/** The CSS-module class that draws the larger page shape. */
const SHAPE_CLASS_BY_SHAPE: Record<NotificationLeadShape, string | undefined> =
  {
    round: undefined,
    rect: styles.leadRect,
  };

/**
 * The leading visual of a notification row: the actor's avatar (a link to
 * their profile when the row names a member), a bare avatar, or the kind's
 * icon tile. Every branch carries `.lead`, which is what the narrow-row grid
 * in NotificationsPage.module.css places in the first column.
 */
export function NotificationItemLead({
  notification,
  isCompact,
  shape = "round",
}: {
  notification: Notification;
  isCompact: boolean;
  /** Defaults to the round avatar, which the bell popover keeps. */
  shape?: NotificationLeadShape;
}) {
  const avatarSize =
    isCompact && shape === "round" ? 36 : AVATAR_SIZE_BY_SHAPE[shape];
  const shapeClass = SHAPE_CLASS_BY_SHAPE[shape];
  const joinClasses = (...classNames: (string | undefined)[]) =>
    classNames.filter(Boolean).join(" ");

  // An actor with an empty href (a matched Go together chat's mention) has no
  // profile to open, so their avatar falls through to the bare branch below.
  if (notification.avatar && notification.actor?.href) {
    return (
      <Link
        to={linkToPath(notification.actor.href)}
        className={joinClasses(styles.avatarLink, styles.lead, shapeClass)}
        aria-label={notification.actor.name}
      >
        <Avatar
          className={shapeClass}
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
        className={joinClasses(styles.lead, shapeClass)}
        initials={notification.avatar.initials}
        tint={notification.avatar.tint}
        src={notification.avatar.src}
        size={avatarSize}
      />
    );
  }

  return (
    <span
      className={joinClasses(styles.icon, styles.lead, shapeClass)}
      style={{ background: notification.icon?.background }}
    >
      {notification.icon && <notification.icon.Glyph />}
    </span>
  );
}

/**
 * The page row's larger picture with its unread dot on the top-right corner.
 * The dot stays mounted, so marking the row read fades it out.
 */
export function NotificationItemLeadFrame({
  notification,
  shape,
  isUnread,
}: {
  notification: Notification;
  shape: NotificationLeadShape;
  isUnread: boolean;
}) {
  return (
    <div className={styles.leadFrame}>
      <NotificationItemLead
        notification={notification}
        isCompact={false}
        shape={shape}
      />
      <span
        className={[styles.leadDot, isUnread && styles.leadDotVisible]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      />
    </div>
  );
}
