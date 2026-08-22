import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { reasonFor } from "../../shared/api/errorMessage";
import { useMarkNotificationRead } from "./api/useMarkNotificationRead";
import { useMarkAllRead } from "./api/useMarkAllRead";
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
}

/**
 * Read / resolved state for the notifications feed, plus the two writes that
 * persist reads.
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

  function resolve(id: NotificationId, toast: string) {
    setResolvedIds((current) => new Set(current).add(id));
    showToast(toast, "success");
  }

  return { readIds, resolvedIds, markRead, markAllRead, resolve };
}
