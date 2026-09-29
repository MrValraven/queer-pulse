import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { FadeIn, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { linkToPath } from "../../app/routeMap";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { NotificationItemActions } from "./NotificationItemActions";
import { NotificationItemLead } from "./NotificationItemLead";
import type { Notification } from "./data";
import styles from "./NotificationsPage.module.css";

/** Opaque row id: a uuid in live mode, a number in the demo mock. */
type NotificationId = Notification["id"];

/** Closes a spoken phrase with a full stop unless it already ends a sentence. */
function asSentence(phrase: string): string {
  return /[.!?…]$/.test(phrase) ? phrase : `${phrase}.`;
}

export function NotificationItem({
  notification,
  index,
  isUnread,
  onMarkRead,
  onResolve,
  onDismiss,
  isCompact = false,
}: {
  notification: Notification;
  index: number;
  isUnread: boolean;
  onMarkRead: (id: NotificationId) => void;
  onResolve: (id: NotificationId, toast: string) => void;
  /** PRD-224. Clear this row for good, here and on the member's other devices. */
  onDismiss: (id: NotificationId) => void;
  /** Tighter row for the nav bell's popover, where the panel is 400px wide. */
  isCompact?: boolean;
}) {
  const { t } = useTranslation();

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

  // DES-400. The coral dot is sighted-only, so an unread row also says
  // "Unread" to a screen reader: first in the overlay link's name when the row
  // has one, and as hidden text beside the dot when it does not.
  const unreadLabel = isUnread ? t("notifications:row.unread") : "";

  // The written reason behind a decision, shown in full under the sentence.
  // Absent on every row whose payload carried no reason. Staff wrote most of
  // them; the lead-in names a member as the author when a member wrote it.
  const reason = notification.reason?.trim() ?? "";
  const reasonLead = t(
    notification.reasonLeadKey ??
      (notification.isReasonFromMember
        ? "notifications:row.reasonLeadMember"
        : "notifications:row.reasonLead"),
  );
  const spokenReason = reason ? ` ${reasonLead} ${asSentence(reason)}` : "";

  // The row's accessible name for the overlay link below. The bundle count is
  // part of it: a screen reader must hear "and 39 others", since that is the
  // difference between one reply and a conversation. The reason follows the
  // sentence, so the overlay link carries everything the row shows.
  const rowLabel = `${unreadLabel ? `${unreadLabel}. ` : ""}${
    typeof notification.text === "string"
      ? notification.text
      : notification.meta
  }${othersLabel ? ` ${othersLabel}` : ""}.${spokenReason} ${t(
    rowGoesToProfile
      ? "notifications:actions.viewProfile"
      : "notifications:actions.viewThread",
  )}`;

  return (
    <FadeIn
      key={notification.id}
      delay={Math.min(index, 8) * 60}
      className={[
        styles.item,
        styles.notificationRow,
        isCompact && styles.itemCompact,
        isUnread && styles.unread,
      ]
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
      {isUnread && !rowHref && (
        <span className="visuallyHidden">{unreadLabel}</span>
      )}
      <NotificationItemLead notification={notification} isCompact={isCompact} />
      <div className={styles.body}>
        {/* Its own line above the sentence: the actor's name sits inside
            translated copy, so the badge cannot go beside it, and as a row
            sibling it took a whole column from the text. Collapses when the
            actor is not staff. */}
        <div className={styles.staffBadges}>
          <MemberStaffBadge slug={notification.actorSlug} />
        </div>
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
        <div className={styles.meta}>{notification.meta}</div>
        {/* The whole reason as a plain text node, so the member reads every
            word of the moderators' free text exactly as it was written. */}
        {reason && (
          <p className={styles.reason}>
            <span className={styles.reasonLead}>{reasonLead}</span> {reason}
          </p>
        )}
        {notification.actions && (
          <NotificationItemActions
            notificationId={notification.id}
            actions={notification.actions}
            onResolve={onResolve}
          />
        )}
      </div>
      <div className={styles.time}>{notification.time}</div>
      {/* PRD-224. Every row can be cleared, so a member is never stuck looking
          at something they have already dealt with. Sits above the overlay row
          link and stops the click there, so clearing a row never also
          navigates into it. */}
      <IconButton
        size="sm"
        className={styles.dismiss}
        aria-label={t("notifications:actions.dismiss")}
        onClick={(event) => {
          event.stopPropagation();
          onDismiss(notification.id);
        }}
      >
        <FiX aria-hidden />
      </IconButton>
    </FadeIn>
  );
}
