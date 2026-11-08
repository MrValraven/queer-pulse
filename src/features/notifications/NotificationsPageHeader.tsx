import { useEffect, useRef, type RefObject } from "react";
import { LuCheckCheck } from "react-icons/lu";
import { Button, Tabs } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { notificationTabs, type NotifType } from "./data";
import styles from "./NotificationsPage.module.css";

/** The page's filter: a notification kind, everything, or the Mentions feed. */
export type NotificationsFilter = "all" | NotifType | "mentions";

/**
 * The page title with its unread count, and "Mark all as read" on the same
 * line. The control is the shared ghost <Button>, quietened to a text-style
 * control so the header stays one short row at every width.
 */
export function NotificationsPageHeader({
  titleRef,
  unreadCount,
  isMarkAllShown,
  onMarkAllRead,
}: {
  /** Where focus lands after a row is deleted. */
  titleRef: RefObject<HTMLDivElement | null>;
  unreadCount: number;
  isMarkAllShown: boolean;
  onMarkAllRead: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.header}>
      <div ref={titleRef} tabIndex={-1} className={styles.title}>
        {t("notifications:page.title")}
        {unreadCount > 0 && (
          <span className={styles.badge}>
            <RollingNumber
              value={fmt.number(unreadCount)}
              numericValue={unreadCount}
            />
          </span>
        )}
      </div>
      {/* Always mounted: where it has nothing to mark (Mentions) it fades
          out and is taken out of focus and the accessibility tree, and its
          space stays, so the tabs below never move. */}
      <div
        className={[styles.actions, !isMarkAllShown && styles.actionsHidden]
          .filter(Boolean)
          .join(" ")}
        inert={!isMarkAllShown}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={styles.markAll}
          onClick={onMarkAllRead}
        >
          <LuCheckCheck aria-hidden className={styles.markAllIcon} />
          {t("notifications:page.markAllRead")}
        </Button>
      </div>
    </div>
  );
}

/**
 * The filter tabs. On a phone they are one sideways-scrolling row, and a tab
 * picked while partly off the edge scrolls fully into view.
 */
export function NotificationsFilterTabs({
  filter,
  unreadMentions,
  onChange,
}: {
  filter: NotificationsFilter;
  unreadMentions: number;
  onChange: (filter: NotificationsFilter) => void;
}) {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const tabsFrameRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);

  // Skips the first render, so opening the page never scrolls anything.
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    const activeTab = tabsFrameRef.current?.querySelector<HTMLElement>(
      '[role="tab"][aria-selected="true"]',
    );
    activeTab?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [filter, prefersReducedMotion]);

  return (
    <div ref={tabsFrameRef} className={styles.tabsFrame}>
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
            countTone: "accent",
          },
          ...notificationTabs.slice(1).map((tab) => ({
            id: tab.value,
            label: t(tab.labelKey),
          })),
        ]}
        active={filter}
        onChange={(id) => onChange(id as NotificationsFilter)}
      />
    </div>
  );
}
