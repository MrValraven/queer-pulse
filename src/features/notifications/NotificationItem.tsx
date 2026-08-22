import { Link, useNavigate } from "react-router-dom";
import { Avatar, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { linkToPath } from "../../app/routeMap";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { Notification } from "./data";
import styles from "./NotificationsPage.module.css";

/** Opaque row id: a uuid in live mode, a number in the demo mock. */
type NotificationId = Notification["id"];

export function NotificationItem({
  notification,
  index,
  isUnread,
  onMarkRead,
  onResolve,
}: {
  notification: Notification;
  index: number;
  isUnread: boolean;
  onMarkRead: (id: NotificationId) => void;
  onResolve: (id: NotificationId, toast: string) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Where the whole row navigates on click/keypress. A specific source
  // deep-link (thread/post/event) wins; otherwise an actor-driven row
  // (invite accepted, connection accepted, …) falls back to the actor's
  // profile so tapping anywhere on the row reaches the person.
  const rowHref = notification.sourceHref ?? notification.actor?.href;
  const rowGoesToProfile = !notification.sourceHref && Boolean(rowHref);

  // The row's accessible name for the overlay link below.
  const rowLabel = `${
    typeof notification.text === "string"
      ? notification.text
      : notification.meta
  }. ${t(
    rowGoesToProfile
      ? "notifications:actions.viewProfile"
      : "notifications:actions.viewThread",
  )}`;

  return (
    <FadeIn
      key={notification.id}
      delay={Math.min(index, 8) * 60}
      className={[styles.item, isUnread && styles.unread]
        .filter(Boolean)
        .join(" ")}
      // The container is plain, non-interactive markup: it holds real links
      // (avatar, actor name) and action buttons, and ARIA forbids interactive
      // content inside a role="button". Row-level navigation lives on the
      // overlay link below instead; clicking or keyboard-activating anything
      // in the row bubbles here and marks it read.
      onClick={() => onMarkRead(notification.id)}
    >
      {rowHref && (
        <Link to={linkToPath(rowHref)} className={styles.rowLink}>
          <span className="visuallyHidden">{rowLabel}</span>
        </Link>
      )}
      {isUnread && <span className={styles.unreadDot} aria-hidden />}
      {notification.avatar ? (
        notification.actor ? (
          <Link
            to={linkToPath(notification.actor.href)}
            className={styles.avatarLink}
            aria-label={notification.actor.name}
          >
            <Avatar
              initials={notification.avatar.initials}
              tint={notification.avatar.tint}
              src={notification.avatar.src}
              size={40}
            />
          </Link>
        ) : (
          <Avatar
            initials={notification.avatar.initials}
            tint={notification.avatar.tint}
            src={notification.avatar.src}
            size={40}
          />
        )
      ) : (
        <span
          className={styles.icon}
          style={{ background: notification.icon?.background }}
        >
          {notification.icon && <notification.icon.Glyph />}
        </span>
      )}
      <MemberStaffBadge slug={notification.actorSlug} />
      <div className={styles.body}>
        <div className={styles.text}>
          {notification.actor?.textKey ? (
            <Translation
              i18nKey={notification.actor.textKey}
              components={{
                profile: (
                  <Link
                    to={linkToPath(notification.actor.href)}
                    className={styles.actorLink}
                  />
                ),
              }}
              values={{ name: notification.actor.name }}
            />
          ) : (
            notification.text
          )}
        </div>
        <div className={styles.meta}>{notification.meta}</div>
        {notification.actions && (
          <div className={styles.itemActions}>
            {notification.actions.map((action) => {
              // An action only earns an interactive control when it can
              // actually DO something on click: resolve the row in place, or
              // navigate to a real destination. A placeholder `href` of "#"
              // with no resolve handler would be a dead button — so we render
              // it as plain, non-interactive text instead of a fake affordance.
              const canResolve = Boolean(action.resolve);
              const canNavigate = Boolean(action.href) && action.href !== "#";
              if (!canResolve && !canNavigate) {
                return (
                  <span key={action.label} className={styles.meta}>
                    {action.label}
                  </span>
                );
              }
              return (
                <button
                  type="button"
                  key={action.label}
                  className={[
                    styles.btn,
                    action.variant === "primary"
                      ? styles.btnPrimary
                      : styles.btnGhost,
                  ].join(" ")}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (action.resolve) {
                      onResolve(notification.id, action.resolve.toast);
                    } else {
                      void navigate(linkToPath(action.href));
                    }
                  }}
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className={styles.time}>{notification.time}</div>
    </FadeIn>
  );
}
