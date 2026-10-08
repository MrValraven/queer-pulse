import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { reasonFor } from "../../shared/api/errorMessage";
import { useMarkNotificationRead } from "./api/useMarkNotificationRead";
import { useMarkAllRead } from "./api/useMarkAllRead";
import { useDismissNotification } from "./api/useDismissNotification";
import { useHideNotification } from "./api/useHideNotification";
import type { Notification } from "./notifications.types";

/** Opaque row id: a uuid in live mode, a number in the demo mock. */
type NotificationId = Notification["id"];

export interface NotificationsReadState {
  /** Rows read in this session, on top of each row's own `unread` flag. */
  readIds: Set<NotificationId>;
  /** Rows deleted in this session, by an inline action or the page's X
   *  (removed from the list while the DELETE runs). */
  resolvedIds: Set<NotificationId>;
  markRead: (id: NotificationId) => void;
  markAllRead: () => void;
  /** Resolve one row in place, confirm it with `toast`, and delete it. */
  resolve: (id: NotificationId, toast: string) => void;
  /** The bell's X: take one row out of the bell and mark it read. The row
   *  stays on the notifications page. */
  hideFromBell: (id: NotificationId) => void;
  /** The page's X, once the member confirms: delete one row on every
   *  device. */
  deleteNotification: (id: NotificationId) => void;
}

/**
 * Read / resolved state for the notifications feed, plus the writes that
 * persist it: mark one read, mark all read, hide one from the bell, and delete
 * one for good.
 *
 * Every write path flips the row locally for instant feedback, then undoes
 * that and says why when the write fails. Without the undo the page showed
 * "all read" (and a 0 header badge) while the nav bell still carried the true
 * count, and a reload silently brought every row back unread with no
 * explanation. The mutations invalidate on settle (the hide in live mode
 * only), so a failure also refetches the server's truth.
 */
export function useNotificationsReadState(
  notifications: Notification[],
): NotificationsReadState {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllRead();
  const dismissMutation = useDismissNotification();
  const hideMutation = useHideNotification();
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
   * row back and says why, so the list the member sees keeps matching the
   * server.
   */
  function deleteRow(id: NotificationId, toast: string, errorKey: string) {
    const previous = resolvedIds;
    setResolvedIds((current) => new Set(current).add(id));
    showToast(toast, "success");
    dismissMutation.mutate(id, {
      onError: (error) => {
        setResolvedIds(previous);
        showToast(reasonFor(error) ?? t(errorKey), "error");
      },
    });
  }

  /** An inline action (accept or decline a connection request, "Got it")
   *  settled the row, so it goes for good, on both surfaces. */
  function resolve(id: NotificationId, toast: string) {
    deleteRow(id, toast, "notifications:page.dismissError");
  }

  /**
   * The bell's X. It used to delete the row everywhere (PRD-224), which also
   * emptied the notifications page of anything a member only wanted out of
   * the dropdown. Now it hides the row from the bell and marks it read; the
   * page keeps it. `useHideNotification` patches the row in the react-query
   * cache, so the hide outlives the bell's panel, which unmounts on close. A
   * failed write restores the cache there and says why here.
   */
  function hideFromBell(id: NotificationId) {
    showToast(t("notifications:page.hiddenFromBellToast"), "success");
    hideMutation.mutate(id, {
      onError: (error) => {
        showToast(
          reasonFor(error) ?? t("notifications:page.hideError"),
          "error",
        );
      },
    });
  }

  /** The page's X, after the member confirms in the dialog. */
  function deleteNotification(id: NotificationId) {
    deleteRow(
      id,
      t("notifications:page.deletedToast"),
      "notifications:page.deleteError",
    );
  }

  return {
    readIds,
    resolvedIds,
    markRead,
    markAllRead,
    resolve,
    hideFromBell,
    deleteNotification,
  };
}
