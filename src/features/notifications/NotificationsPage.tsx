import { useMemo, useState } from "react";
import { FiBell, FiAlertCircle } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Tabs } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { NotificationsListSkeleton } from "./NotificationsSkeleton";
import { MentionsPanel } from "./MentionsPanel";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "./api/useNotifications";
import { useMentions } from "./api/useMentions";
import { useMarkNotificationRead } from "./api/useMarkNotificationRead";
import { useMarkAllRead } from "./api/useMarkAllRead";
import { notificationTabs, type NotifType, type Notification } from "./data";
import styles from "./NotificationsPage.module.css";

/** Opaque row id: a uuid in live mode, a number in the demo mock. */
type NotificationId = Notification["id"];

export function NotificationsPage() {
  const { t } = useTranslation();
  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useNotifications();
  const { data: mentionDays = [] } = useMentions();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllRead();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<"all" | NotifType | "mentions">("all");
  const [readIds, setReadIds] = useState<Set<NotificationId>>(new Set());
  const [resolvedIds, setResolvedIds] = useState<Set<NotificationId>>(
    new Set(),
  );
  const onMentions = filter === "mentions";

  // "mentions" is a pseudo-filter that swaps the whole list for <MentionsPanel>,
  // so for the notifications list itself treat it as "all" — this keeps the
  // header/nav unread count meaningful while the Mentions tab is active.
  const visible = useMemo(() => {
    const listFilter = filter === "mentions" ? "all" : filter;
    return notifications.filter(
      (n) =>
        (listFilter === "all" || n.type === listFilter) &&
        !resolvedIds.has(n.id),
    );
  }, [notifications, filter, resolvedIds]);
  const unreadCount = visible.filter(
    (n) => n.unread && !readIds.has(n.id),
  ).length;

  // Unread @-mentions for the "Mentions" tab badge — from the same demo/live
  // source the Mentions thread renders, so it's 0 (hidden) in live mode until a
  // backend endpoint exists rather than showing the mock count.
  const unreadMentions = useMemo(
    () =>
      mentionDays
        .flatMap((group) => group.items)
        .filter((mention) => mention.unread).length,
    [mentionDays],
  );

  const recent = visible.slice(0, 7);
  const earlier = visible.slice(7);

  function markRead(id: NotificationId) {
    // Skip no-op clicks on rows that are already read (avoids a stray live POST).
    const item = notifications.find((n) => n.id === id);
    if (!item?.unread || readIds.has(id)) return;
    setReadIds((current) => new Set(current).add(id));
    markReadMutation.mutate(id);
  }
  function markAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
    markAllReadMutation.mutate();
  }
  function resolve(id: NotificationId, toast: string) {
    setResolvedIds((current) => new Set(current).add(id));
    showToast(toast, "success");
  }

  const renderItem = (notification: Notification, index: number) => (
    <NotificationItem
      key={notification.id}
      notification={notification}
      index={index}
      isUnread={notification.unread && !readIds.has(notification.id)}
      onMarkRead={markRead}
      onResolve={resolve}
    />
  );

  return (
    <AppShell unreadCount={unreadCount}>
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <div className={styles.title}>
              {t("notifications:page.title")}
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </div>
            {!onMentions && (
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.markRead}
                  onClick={markAllRead}
                >
                  {t("notifications:page.markAllRead")}
                </button>
              </div>
            )}
          </div>

          <Tabs
            className={styles.tabs}
            variant="underline"
            tabs={[
              ...notificationTabs.slice(0, 1).map((tab) => ({
                id: tab.value,
                label: t(tab.labelKey),
              })),
              {
                id: "mentions",
                label: t("notifications:tabs.mentions"),
                count: unreadMentions || undefined,
              },
              ...notificationTabs.slice(1).map((tab) => ({
                id: tab.value,
                label: t(tab.labelKey),
              })),
            ]}
            active={filter}
            onChange={(id) => setFilter(id as "all" | NotifType | "mentions")}
          />

          {onMentions ? (
            <MentionsPanel />
          ) : isLoading ? (
            <NotificationsListSkeleton count={7} />
          ) : isError ? (
            // Distinct from "all caught up": a failed fetch must not read as an
            // empty inbox, or a real backend fault looks like zero notifications.
            <div className={styles.empty} role="alert">
              <div style={{ fontSize: 40 }}>
                <FiAlertCircle />
              </div>
              <div className={styles.emptyTitle}>
                {t("notifications:page.error.title")}
              </div>
              <div>{t("notifications:page.error.description")}</div>
              <button
                type="button"
                className={[styles.btn, styles.btnPrimary].join(" ")}
                style={{ marginTop: 14 }}
                onClick={() => void refetch()}
              >
                {t("notifications:page.error.retry")}
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className={styles.empty}>
              <div style={{ fontSize: 40 }}>
                <FiBell />
              </div>
              <div className={styles.emptyTitle}>
                {t("notifications:page.empty.title")}
              </div>
              <div>{t("notifications:page.empty.description")}</div>
            </div>
          ) : (
            <div className={styles.list}>
              {recent.length > 0 && (
                <div className={styles.day}>
                  {t("notifications:page.dayRecent")}
                </div>
              )}
              {recent.map((n, i) => renderItem(n, i))}
              {earlier.length > 0 && (
                <div className={styles.day}>
                  {t("notifications:page.dayEarlier")}
                </div>
              )}
              {earlier.map((n, i) => renderItem(n, recent.length + i))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
