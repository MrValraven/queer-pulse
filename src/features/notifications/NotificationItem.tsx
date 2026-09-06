import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { Avatar, FadeIn } from "../../shared/components/ui";
import { useConnectionActions } from "../connect/api/useConnectionActions";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { linkToPath } from "../../app/routeMap";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { Notification } from "./data";
import type { NotifAction } from "./notifications.types";
import styles from "./NotificationsPage.module.css";

/** Opaque row id: a uuid in live mode, a number in the demo mock. */
type NotificationId = Notification["id"];

export function NotificationItem({
  notification,
  index,
  isUnread,
  onMarkRead,
  onResolve,
  onDismiss,
}: {
  notification: Notification;
  index: number;
  isUnread: boolean;
  onMarkRead: (id: NotificationId) => void;
  onResolve: (id: NotificationId, toast: string) => void;
  /** PRD-224. Clear this row for good, here and on the member's other devices. */
  onDismiss: (id: NotificationId) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // PRD-15. A "wants to connect" row answers the request from here, so the
  // mutations the connections page uses are wired straight into its buttons.
  // Every other row leaves these untouched.
  const { acceptRequest, declineRequest } = useConnectionActions();
  const [isAnswering, setIsAnswering] = useState(false);

  /**
   * Answer a connection request from the row. Resolves the row (removing it,
   * with a confirming toast) only once the server has agreed; a refusal has
   * already toasted its own reason and rolled the local move back, so the row
   * stays where it is and the member can try again.
   */
  async function answerConnection(
    response: NonNullable<NotifAction["connectionResponse"]>,
  ) {
    if (isAnswering) return;
    setIsAnswering(true);
    const respond =
      response.action === "accept" ? acceptRequest : declineRequest;
    const didSucceed = await respond({
      slug: response.memberSlug,
      id: response.connectionId,
    });
    setIsAnswering(false);
    if (didSucceed) onResolve(notification.id, response.toast);
  }

  // Where the whole row navigates on click/keypress. A specific source
  // deep-link (thread/post/event) wins; otherwise an actor-driven row
  // (invite accepted, connection accepted, …) falls back to the actor's
  // profile so tapping anywhere on the row reaches the person.
  const rowHref = notification.sourceHref ?? notification.actor?.href;
  const rowGoesToProfile = !notification.sourceHref && Boolean(rowHref);

  // How many members beyond the one named did the same thing to the same
  // subject. A bundled row is one row for one conversation: forty replies to a
  // thread used to be forty rows, forty unread, and forty taps to clear.
  //
  // `hasOwnBundleCount` rows are excluded because they bundle on a QUEUE
  // rather than on an actor, and their own copy already carries the count.
  // Appending "and 3 others" to "4 items are waiting for a look" would both
  // double-count and speak about people where there are none named.
  const otherActorCount = notification.otherActorCount ?? 0;
  const hasOwnBundleCount = notification.hasOwnBundleCount ?? false;
  const othersLabel =
    otherActorCount > 0 && !hasOwnBundleCount
      ? t("notifications:bundle.others", { count: otherActorCount })
      : "";

  // The row's accessible name for the overlay link below. The bundle count is
  // part of it: a screen reader must hear "and 39 others", since that is the
  // difference between one reply and a conversation.
  const rowLabel = `${
    typeof notification.text === "string"
      ? notification.text
      : notification.meta
  }${othersLabel ? ` ${othersLabel}` : ""}. ${t(
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
          {othersLabel && (
            <span className={styles.bundleCount}> {othersLabel}</span>
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
              const canAnswer = Boolean(action.connectionResponse);
              const canNavigate = Boolean(action.href) && action.href !== "#";
              if (!canResolve && !canAnswer && !canNavigate) {
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
                  disabled={canAnswer && isAnswering}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (action.connectionResponse) {
                      void answerConnection(action.connectionResponse);
                    } else if (action.resolve) {
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
      {/* PRD-224. Every row can be cleared, so a member is never stuck looking
          at something they have already dealt with. Sits above the overlay row
          link and stops the click there, so clearing a row never also
          navigates into it. */}
      <button
        type="button"
        className={styles.dismiss}
        aria-label={t("notifications:actions.dismiss")}
        onClick={(event) => {
          event.stopPropagation();
          onDismiss(notification.id);
        }}
      >
        <FiX aria-hidden />
      </button>
    </FadeIn>
  );
}
