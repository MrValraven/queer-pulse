import { useEffect } from "react";
import { useQueryClient, type Query } from "@tanstack/react-query";

/** Coalesces a burst of inbox cache writes into one notification sweep. */
export const CLOSE_READ_NOTIFICATIONS_DEBOUNCE_MS = 250;

/** The inbox list's query-key root (`useConversations`). */
const CONVERSATIONS_QUERY_ROOT = "conversations";

/**
 * The ids of every inbox row that reports nothing unread. Returns `null` when
 * `data` is not a conversation list, so an unexpected entry under the same key
 * root closes nothing.
 */
export function readConversationIdsIn(data: unknown): Set<string> | null {
  if (!Array.isArray(data)) return null;
  const readIds = new Set<string>();
  for (const row of data as unknown[]) {
    if (typeof row !== "object" || row === null) continue;
    const { id, unread, unreadCount } = row as Record<string, unknown>;
    if (typeof id !== "string" || unread !== false) continue;
    if (typeof unreadCount === "number" && unreadCount > 0) continue;
    readIds.add(id);
  }
  return readIds;
}

/**
 * The shown notifications that belong to a read conversation. A message push
 * is tagged with its conversation id and carries the same id in `data`; both
 * must agree, so no other notification type is ever closed by accident.
 */
export function selectNotificationsToClose(
  notifications: readonly Notification[],
  readIds: ReadonlySet<string>,
): Notification[] {
  return notifications.filter((notification) => {
    const conversationId = (
      notification.data as { conversationId?: unknown } | null | undefined
    )?.conversationId;
    return (
      typeof conversationId === "string" &&
      notification.tag === conversationId &&
      readIds.has(conversationId)
    );
  });
}

/** The conversations query written most recently; stale variants lose. */
function latestConversationsQuery(queries: Query[]): Query | undefined {
  let latest: Query | undefined;
  for (const query of queries) {
    if (query.state.data === undefined) continue;
    if (!latest || query.state.dataUpdatedAt > latest.state.dataUpdatedAt) {
      latest = query;
    }
  }
  return latest;
}

async function closeNotificationsForRead(
  readIds: ReadonlySet<string>,
): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;
    // One unfiltered read instead of one `getNotifications({ tag })` per read
    // conversation: an inbox can hold hundreds of read rows, and only the few
    // notifications actually showing matter.
    const notifications = await registration.getNotifications();
    for (const notification of selectNotificationsToClose(
      notifications,
      readIds,
    )) {
      notification.close();
    }
  } catch {
    // Best-effort: a notification left open is corrected on the next sweep.
  }
}

/**
 * PRD-335, page half. Closes this device's message notifications for every
 * conversation the inbox cache reports as read, so a thread read here (or on
 * another device, once the inbox refetches) stops sitting in the tray.
 *
 * Reacts to react-query cache writes on the conversations list only: no
 * refetches, no network, live and demo alike. Debounced so the fan-out of one
 * `setQueriesData` across several cached variants costs a single sweep.
 */
export function useCloseReadNotifications(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const queryCache = queryClient.getQueryCache();
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    function sweep() {
      debounceTimer = undefined;
      const latest = latestConversationsQuery(
        queryCache.findAll({ queryKey: [CONVERSATIONS_QUERY_ROOT] }),
      );
      const readIds = readConversationIdsIn(latest?.state.data);
      if (!readIds || readIds.size === 0) return;
      void closeNotificationsForRead(readIds);
    }

    const unsubscribe = queryCache.subscribe((event) => {
      if (event.type !== "updated" || event.action.type !== "success") return;
      const updatedQueryKey = event.query.queryKey as readonly unknown[];
      const queryKeyRoot = updatedQueryKey[0];
      if (queryKeyRoot !== CONVERSATIONS_QUERY_ROOT) return;
      if (debounceTimer !== undefined) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(sweep, CLOSE_READ_NOTIFICATIONS_DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (debounceTimer !== undefined) clearTimeout(debounceTimer);
    };
  }, [queryClient]);
}
