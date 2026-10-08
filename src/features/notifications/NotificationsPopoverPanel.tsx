import { useMemo, useRef } from "react";
import { FiAlertCircle, FiBell } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { NotificationItem } from "./NotificationItem";
import { NotificationsListSkeleton } from "./NotificationsSkeleton";
import { useNotifications } from "./api/useNotifications";
import { useNotificationsReadState } from "./useNotificationsReadState";
import type { Notification } from "./notifications.types";
import styles from "./NotificationsPopover.module.css";

/** How many of the newest notifications the popover lists. The full history,
 * its filters and its pagination stay on the notifications page. */
const RECENT_NOTIFICATION_LIMIT = 20;

/**
 * The inside of the bell's popover: a header with "Mark all as read", the
 * newest notifications in a scrolling list, and a footer button to the full
 * page. Rows are the page's own `NotificationItem`, so reading and answering a
 * connection request behave exactly as they do there. The X differs: here it
 * hides the row from the bell and marks it read, and the page keeps the row.
 */
export function NotificationsPopoverPanel({ titleId }: { titleId: string }) {
  const { t } = useTranslation();
  const {
    items: notifications,
    isLoading,
    isError,
    refetch,
  } = useNotifications();
  const { readIds, resolvedIds, markRead, markAllRead, resolve, hideFromBell } =
    useNotificationsReadState(notifications);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Hidden rows leave before the slice, so the bell still shows up to the
  // limit of rows the member has not hidden.
  const recent = useMemo(
    () =>
      notifications
        .filter(
          (notification) =>
            !resolvedIds.has(notification.id) && !notification.isHiddenFromBell,
        )
        .slice(0, RECENT_NOTIFICATION_LIMIT),
    [notifications, resolvedIds],
  );
  const isNotificationUnread = (notification: Notification) =>
    notification.unread && !readIds.has(notification.id);
  const hasUnread = recent.some(isNotificationUnread);

  // The X that was pressed leaves with its row, so focus moves to the panel's
  // title, where a keyboard member can carry on from the top of the list.
  function hideRowFromBell(id: Notification["id"]) {
    titleRef.current?.focus();
    hideFromBell(id);
  }

  function renderBody() {
    if (isLoading) return <NotificationsListSkeleton count={4} />;
    // ENG-501: React Query also sets `isError` when a background refetch, or a
    // next page loaded on the full page (same cache), failed. Rows already
    // shown stay; the panel is for an inbox with nothing loaded.
    if (isError && notifications.length === 0) {
      // A failed fetch must not read as an empty inbox.
      return (
        <div className={styles.state} role="alert">
          <FiAlertCircle aria-hidden className={styles.stateIcon} />
          <p className={styles.stateTitle}>
            {t("notifications:page.error.title")}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
          >
            {t("notifications:page.error.retry")}
          </Button>
        </div>
      );
    }
    if (recent.length === 0) {
      return (
        <div className={styles.state}>
          <FiBell aria-hidden className={styles.stateIcon} />
          <p className={styles.stateTitle}>
            {t("notifications:page.empty.title")}
          </p>
          <p className={styles.stateText}>
            {t("notifications:popover.emptyDescription")}
          </p>
        </div>
      );
    }
    return (
      <div className={styles.list}>
        {recent.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            index={index}
            isUnread={isNotificationUnread(notification)}
            onMarkRead={markRead}
            onResolve={resolve}
            onDismiss={hideRowFromBell}
            dismissAction="hideFromBell"
            isCompact
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <h2 id={titleId} ref={titleRef} tabIndex={-1} className={styles.title}>
          {t("notifications:page.title")}
        </h2>
        {hasUnread && (
          <Button type="button" variant="ghost" size="sm" onClick={markAllRead}>
            {t("notifications:page.markAllRead")}
          </Button>
        )}
      </div>
      <div className={styles.scroll}>{renderBody()}</div>
      <div className={styles.footer}>
        <Button
          to={routes.notifications}
          variant="ghost"
          size="sm"
          className={styles.seeAll}
        >
          {t("notifications:popover.seeAll")}
        </Button>
      </div>
    </>
  );
}
