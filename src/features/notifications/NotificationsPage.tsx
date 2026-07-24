import { useMemo, useState } from "react";
import { FiBell } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { Avatar, FadeIn, Tabs } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { linkToPath } from "../../app/routeMap";
import { NotificationsListSkeleton } from "./NotificationsSkeleton";
import { MentionsPanel } from "./MentionsPanel";
import { useNotifications } from "./api/useNotifications";
import { useMentions } from "./api/useMentions";
import { useMarkNotificationRead } from "./api/useMarkNotificationRead";
import { useMarkAllRead } from "./api/useMarkAllRead";
import { notificationTabs, type NotifType, type Notification } from "./data";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import styles from "./NotificationsPage.module.css";

/** Opaque row id: a uuid in live mode, a number in the demo mock. */
type NotificationId = Notification["id"];

export function NotificationsPage() {
  const { t } = useTranslation();
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: mentionDays = [] } = useMentions();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllRead();
  const navigate = useNavigate();
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

  function renderItem(notification: Notification, index: number) {
    const isUnread = notification.unread && !readIds.has(notification.id);
    return (
      <FadeIn
        key={notification.id}
        delay={Math.min(index, 8) * 60}
        className={[styles.item, isUnread && styles.unread]
          .filter(Boolean)
          .join(" ")}
        onClick={() => markRead(notification.id)}
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
            style={{ background: notification.icon?.bg }}
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
                      resolve(notification.id, action.resolve.toast);
                    } else if (action.href !== "#") {
                      navigate(linkToPath(action.href));
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
