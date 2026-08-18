import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { Avatar, Button, SkeletonAvatar, SkeletonLine } from "../../../shared/components/ui";
import { useScrollLock } from "../../../shared/hooks";
import {
  pushModal,
  popModal,
  isTopmostModal,
} from "../../../shared/components/ui/modalStack";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { stripEm } from "../data/desk.copy";
import { useMagazineNotifications } from "../api/useMagazineNotifications";
import styles from "./DeskNotifications.module.css";

export interface DeskNotificationsProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

/** First one or two initials from a free-form display name, for the avatar
 * fallback (no photos on desk notification rows). */
function initialsFor(name: string): string {
  const [firstWord, secondWord] = name.trim().split(/\s+/).filter(Boolean);
  if (!firstWord) return "?";
  if (!secondWord) return firstWord.slice(0, 2).toUpperCase();
  return (firstWord.charAt(0) + secondWord.charAt(0)).toUpperCase();
}

/**
 * Right-anchored notifications panel: what's happened on the desk since the
 * last visit. Demo mode shows the colocated `deskNotifications.data.ts`
 * fixture; live mode calls `GET /magazine/admin/notifications` (real
 * editorial events — who did what, when) via `useMagazineNotifications`,
 * which converges both onto one canonical row shape. Renders nothing while
 * closed.
 */
export function DeskNotifications({ open, onClose, onNavigate }: DeskNotificationsProps) {
  const { t } = useTranslation();
  const panelId = useId();
  const { notifications: rows, isLoading, markAllRead } = useMagazineNotifications();

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    pushModal(panelId);
    return () => popModal(panelId);
  }, [open, panelId]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isTopmostModal(panelId)) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, panelId]);

  if (!open) return null;

  function goTo(route: string) {
    onClose();
    onNavigate(route);
  }

  return createPortal(
    <div
      className={styles.scrim}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t("magazine:desk.notifications.ariaLabel")}
      >
        <div className={styles.head}>
          <h3>{t("magazine:desk.notifications.sinceFriday")}</h3>
          <p className={styles.sub}>{t("magazine:desk.notifications.subhead")}</p>
        </div>

        <div className={styles.list}>
          {isLoading ? (
            [0, 1, 2].map((skeletonIndex) => (
              <div className={styles.row} key={`notif-skeleton-${skeletonIndex}`}>
                <SkeletonAvatar size={34} />
                <span className={styles.body}>
                  <SkeletonLine height={13} width="85%" />
                </span>
              </div>
            ))
          ) : rows.length === 0 ? (
            <p className={styles.empty}>
              {t("magazine:desk.notifications.empty")}
            </p>
          ) : (
            rows.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={styles.row}
                onClick={() => goTo(notification.route)}
              >
                <Avatar
                  initials={initialsFor(notification.who)}
                  tint={notification.tone === "warn" ? "coral" : "jade"}
                  size={34}
                />
                <span className={styles.body}>
                  <b>{notification.who}</b> {stripEm(notification.what)}
                </span>
                <time className={styles.time}>{notification.when}</time>
              </button>
            ))
          )}
        </div>

        <div className={styles.foot}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              markAllRead();
              onClose();
            }}
          >
            {t("magazine:desk.notifications.markAllRead")}
          </Button>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
