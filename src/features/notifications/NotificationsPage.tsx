import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FiBell, FiAlertCircle } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import {
  Button,
  Tabs,
  FeatureHelp,
  PullToRefresh,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { NotificationsListSkeleton } from "./NotificationsSkeleton";
import { MentionsPanel } from "./MentionsPanel";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "./api/useNotifications";
import { useMentions } from "./api/useMentions";
import { useNotificationsReadState } from "./useNotificationsReadState";
import { bucketNotificationsByDay } from "./notificationDayBuckets";
import { notificationTabs, type NotifType, type Notification } from "./data";
import styles from "./NotificationsPage.module.css";

export function NotificationsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    items: notifications,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useNotifications();
  const { data: mentionDays = [] } = useMentions();
  const { readIds, resolvedIds, markRead, markAllRead, resolve } =
    useNotificationsReadState(notifications);
  const [filter, setFilter] = useState<"all" | NotifType | "mentions">("all");
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

  // Day headers come from each row's real `createdAtIso`; see the helper.
  const { recent, earlier } = useMemo(
    () => bucketNotificationsByDay(visible),
    [visible],
  );

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
    <AppShell>
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <div className={styles.title}>
              {t("notifications:page.title")}
              <FeatureHelp id="notifications.hub" />
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </div>
            {!onMentions && (
              <div className={styles.actions}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={markAllRead}
                >
                  {t("notifications:page.markAllRead")}
                </Button>
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
              <div className={styles.errorAction}>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => void refetch()}
                >
                  {t("notifications:page.error.retry")}
                </Button>
              </div>
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
            // `queryKey: ["notifications"]` matches useNotifications' inline
            // `["notifications", demoMode, unreadOnly, language]` as a prefix —
            // the same convention useMarkAllRead/useMarkNotificationRead already
            // use to invalidate this feed (also catches the unread-count query,
            // which is fine — it should refresh alongside the list).
            <PullToRefresh
              onRefresh={() =>
                queryClient.invalidateQueries({ queryKey: ["notifications"] })
              }
            >
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
              {hasNextPage && (
                <div className={styles.loadMore}>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isFetchingNextPage}
                    onClick={fetchNextPage}
                  >
                    {isFetchingNextPage
                      ? t("notifications:page.loadingMore")
                      : t("notifications:page.loadMoreCta")}
                  </Button>
                </div>
              )}
            </PullToRefresh>
          )}
        </div>
      </div>
    </AppShell>
  );
}
