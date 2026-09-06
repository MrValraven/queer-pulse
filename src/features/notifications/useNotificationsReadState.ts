import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { reasonFor } from "../../shared/api/errorMessage";
import { useMarkNotificationRead } from "./api/useMarkNotificationRead";
import { useMarkAllRead } from "./api/useMarkAllRead";
import { useDismissNotification } from "./api/useDismissNotification";
import type { Notification } from "./notifications.types";

/** Opaque row id: a uuid in live mode, a number in the demo mock. */
type NotificationId = Notification["id"];

export interface NotificationsReadState {
  /** Rows read in this session, on top of each row's own `unread` flag. */
  readIds: Set<NotificationId>;
  /** Rows an inline action resolved away (removed from the list). */
  resolvedIds: Set<NotificationId>;
  markRead: (id: NotificationId) => void;
  markAllRead: () => void;
  /** Resolve one row in place and confirm it with `toast`. */
  resolve: (id: NotificationId, toast: string) => void;
  /** Clear one row the member does not want, with the standard confirmation. */
  dismiss: (id: NotificationId) => void;
}

/**
 * Read / resolved state for the notifications feed, plus the three writes that
 * persist it: mark one read, mark all read, and clear one for good.
 *
 * Both write paths flip the row locally for instant feedback, then undo that
 * and say why when the write fails. Without the undo the page showed "all
 * read" (and a 0 header badge) while the nav bell still carried the true
 * count, and a reload silently brought every row back unread with no
 * explanation. The mutations invalidate on settle, so a failure also refetches
 * the server's truth.
 */
export function useNotificationsReadState(
  notifications: Notification[],
): NotificationsReadState {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllRead();
  const dismissMutation = useDismissNotification();
  const [readIds, setReadIds] = useState<Set<NotificationId>>(new Set());
  const [resolvedIds, setResolvedIds] = useState<Set<NotificationId>>(
    new Set(),
  );

  function markRead(id: NotificationId) {
    // Skip no-op clicks on rows that are already read (avoids a stray live POST).
    const item = notifications.find((n) => n.id === id);
    if (!item?.unread || readIds.has(id)) return;
    const previous = readIds;
    setReadIds((current) => new Set(current).add(id));
    markReadMutation.mutate(id, {
      onError: (error) => {
        setReadIds(previous);
        showToast(
          reasonFor(error) ?? t("notifications:page.markReadError"),
          "error",
        );
      },
    });
  }

  function markAllRead() {
    const previous = readIds;
    setReadIds(new Set(notifications.map((n) => n.id)));
    markAllReadMutation.mutate(undefined, {
      onError: (error) => {
        setReadIds(previous);
        showToast(
          reasonFor(error) ?? t("notifications:page.markAllReadError"),
          "error",
        );
      },
    });
  }

  /**
   * PRD-224. Take one row out of the list and out of the member's bell
   * everywhere, then say so.
   *
   * This used to be local state and nothing else: an answered "Ana wants to
   * connect" came back unread on the next load, on this device and on every
   * other one, still offering Accept and Decline for a request that had
   * already been answered. The write is a real DELETE, so the row cannot
   * return.
   *
   * Same undo contract as the two read paths above: a refused write puts the
   * row back and says why, rather than leaving the member looking at a list
   * that disagrees with the server.
   */
  function clearRow(id: NotificationId, toast: string) {
    const previous = resolvedIds;
    setResolvedIds((current) => new Set(current).add(id));
    showToast(toast, "success");
    dismissMutation.mutate(id, {
      onError: (error) => {
        setResolvedIds(previous);
        showToast(
          reasonFor(error) ?? t("notifications:page.dismissError"),
          "error",
        );
      },
    });
  }

  function resolve(id: NotificationId, toast: string) {
    clearRow(id, toast);
  }

  function dismiss(id: NotificationId) {
    clearRow(id, t("notifications:page.dismissedToast"));
  }

  return { readIds, resolvedIds, markRead, markAllRead, resolve, dismiss };
}
