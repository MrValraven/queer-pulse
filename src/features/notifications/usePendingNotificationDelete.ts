import { useEffect, useRef, useState, type RefObject } from "react";
import type { Notification } from "./notifications.types";

/** Opaque row id: a uuid in live mode, a number in the demo mock. */
type NotificationId = Notification["id"];

export interface PendingNotificationDelete {
  /** The row whose X opened the confirm dialog, or `null` while it is shut. */
  pendingDeleteId: NotificationId | null;
  /** The page's X: open the confirm dialog for this row. */
  requestDelete: (id: NotificationId) => void;
  /** "Keep it", Escape or click-out: close the dialog, and the shared modal
   *  returns focus to the row's X. */
  cancelDelete: () => void;
  /** "Delete notification": delete the pending row and close the dialog. */
  confirmDelete: () => void;
}

/**
 * The page's confirm-then-delete step for one notification.
 *
 * The page hosts the dialog once, keyed by the pending row's id. A dialog
 * inside the row would unmount mid-confirm, since the delete removes the row
 * from the list at once. That same removal takes the X with it, so the shared
 * modal's focus return has nowhere to land after a confirmed delete; focus
 * moves to `focusAfterDeleteRef` instead (the page title). The effect runs
 * after the closing dialog's own cleanup, so the title has the last word.
 */
export function usePendingNotificationDelete(
  deleteNotification: (id: NotificationId) => void,
  focusAfterDeleteRef: RefObject<HTMLElement | null>,
): PendingNotificationDelete {
  const [pendingDeleteId, setPendingDeleteId] = useState<NotificationId | null>(
    null,
  );
  const shouldFocusAfterDeleteRef = useRef(false);

  useEffect(() => {
    if (pendingDeleteId !== null || !shouldFocusAfterDeleteRef.current) return;
    shouldFocusAfterDeleteRef.current = false;
    focusAfterDeleteRef.current?.focus();
  }, [pendingDeleteId, focusAfterDeleteRef]);

  function confirmDelete() {
    if (pendingDeleteId === null) return;
    shouldFocusAfterDeleteRef.current = true;
    deleteNotification(pendingDeleteId);
    setPendingDeleteId(null);
  }

  return {
    pendingDeleteId,
    requestDelete: setPendingDeleteId,
    cancelDelete: () => setPendingDeleteId(null),
    confirmDelete,
  };
}
