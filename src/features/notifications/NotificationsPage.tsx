import { useMemo, useState } from "react";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { Avatar, Button, FadeIn, Tabs } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath, routes } from "../../app/routeMap";
import { NotificationsListSkeleton } from "./NotificationsSkeleton";
import {
  notificationTabs,
  notifications,
  type NotifType,
  type Notification,
} from "./data";
import styles from "./NotificationsPage.module.css";

export function NotificationsPage() {
  const loading = useSimulatedLoad();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<"all" | NotifType>("all");
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const [resolvedIds, setResolvedIds] = useState<Set<number>>(new Set());

  const visible = useMemo(
    () =>
      notifications.filter(
        (n) =>
          (filter === "all" || n.type === filter) && !resolvedIds.has(n.id),
      ),
    [filter, resolvedIds],
  );
  const unreadCount = visible.filter(
    (n) => n.unread && !readIds.has(n.id),
  ).length;

  const recent = visible.slice(0, 7);
  const earlier = visible.slice(7);

  function markRead(id: number) {
    setReadIds((current) => new Set(current).add(id));
  }
  function markAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }
  function resolve(id: number, toast: string) {
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
          <Avatar
            initials={notification.avatar.initials}
            tint={notification.avatar.tint}
            size={40}
          />
        ) : (
          <span
            className={styles.icon}
            style={{ background: notification.icon?.bg }}
          >
            {notification.icon && <notification.icon.Glyph />}
          </span>
        )}
        <div className={styles.body}>
          <div className={styles.text}>{notification.text}</div>
          <div className={styles.meta}>{notification.meta}</div>
          {notification.actions && (
            <div className={styles.itemActions}>
              {notification.actions.map((action) => (
                <button
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
              Notifications
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </div>
            <div className={styles.actions}>
              <button className={styles.markRead} onClick={markAllRead}>
                Mark all as read
              </button>
              <Button
                variant="ghost"
                to={routes.newsletter}
                style={{ padding: "8px 16px", fontSize: 13 }}
              >
                Preferences
              </Button>
            </div>
          </div>

          <Tabs
            className={styles.tabs}
            variant="underline"
            tabs={notificationTabs.map((tab) => ({
              id: tab.value,
              label: tab.label,
            }))}
            active={filter}
            onChange={(id) => setFilter(id as "all" | NotifType)}
          />

          {loading ? (
            <NotificationsListSkeleton count={7} />
          ) : visible.length === 0 ? (
            <div className={styles.empty}>
              <div style={{ fontSize: 40 }}>
                <FiBell />
              </div>
              <div className={styles.emptyTitle}>All caught up</div>
              <div>No notifications in this category.</div>
            </div>
          ) : (
            <div className={styles.list}>
              {recent.length > 0 && (
                <div className={styles.day}>Today &amp; recent</div>
              )}
              {recent.map((n, i) => renderItem(n, i))}
              {earlier.length > 0 && <div className={styles.day}>Earlier</div>}
              {earlier.map((n, i) => renderItem(n, recent.length + i))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
