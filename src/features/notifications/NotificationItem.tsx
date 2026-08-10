import { type KeyboardEvent, type MouseEvent } from "react";
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

  // A click/keypress that landed on the avatar or the inline profile link
  // (both render as <a>) is that link's own navigation — the actor
  // profile — and must not be overridden by the row's own navigation.
  function activateRow(target: EventTarget | null) {
    onMarkRead(notification.id);
    const clickedLink = (target as HTMLElement).closest?.("a");
    if (rowHref && !clickedLink) {
      void navigate(linkToPath(rowHref));
    }
  }
  return (
    <FadeIn
      key={notification.id}
      delay={Math.min(index, 8) * 60}
      className={[styles.item, isUnread && styles.unread]
        .filter(Boolean)
        .join(" ")}
      onClick={(event: MouseEvent<HTMLElement>) => activateRow(event.target)}
      // Only a row with somewhere to go (a source deep-link, or an actor
      // profile to fall back to) is keyboard-operable — a row with neither
      // stays a plain (mark-read-on-click) div.
      role={rowHref ? "button" : undefined}
      tabIndex={rowHref ? 0 : undefined}
      aria-label={
        rowHref
          ? `${
              typeof notification.text === "string"
                ? notification.text
                : notification.meta
            } — ${t(
              rowGoesToProfile
                ? "notifications:actions.viewProfile"
                : "notifications:actions.viewThread",
            )}`
          : undefined
      }
      onKeyDown={
        rowHref
          ? (event: KeyboardEvent<HTMLElement>) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              // Space's default is page scroll; Enter has no default to guard
              // here, but preventDefault is harmless on it.
              event.preventDefault();
              activateRow(event.target);
            }
          : undefined
      }
    >
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
            {notification.actions.map((action) => (
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
                  } else if (action.href !== "#") {
                    void navigate(linkToPath(action.href));
                  }
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className={styles.time}>{notification.time}</div>
    </FadeIn>
  );
}
