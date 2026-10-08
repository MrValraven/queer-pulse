import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { hideNotificationFromBell } from "./notifications.api";
import { demoHiddenFromBellIds } from "./demoHiddenFromBellIds";
import type { NotificationsPageVM } from "./useNotifications";
import type { Notification } from "../notifications.types";

type NotificationId = Notification["id"];
type CachedNotificationsFeed = InfiniteData<NotificationsPageVM>;

/** What `onMutate` saw before the hide, so a failed write can put it back. */
interface HideNotificationSnapshot {
  previousFeeds: [QueryKey, CachedNotificationsFeed | undefined][];
  previousUnreadCount: number | undefined;
  wasUnread: boolean;
}

/** The cached feed with one row flagged hidden from the bell and read. */
function withRowHiddenFromBell(
  feed: CachedNotificationsFeed,
  id: NotificationId,
): CachedNotificationsFeed {
  return {
    ...feed,
    pages: feed.pages.map((page) => ({
      ...page,
      items: page.items.map((notification) =>
        notification.id === id
          ? { ...notification, isHiddenFromBell: true, unread: false }
          : notification,
      ),
    })),
  };
}

/**
 * Hide one notification from the nav bell's dropdown and mark it read. The row
 * stays on the notifications page. Live mode POSTs /notifications/:id/hide;
 * demo mode makes no call.
 *
 * The bell's panel unmounts every time it closes, so the hide lives in the
 * react-query cache, where reopening the bell finds it. `onMutate` patches the
 * row in every cached feed (`["notifications", demoMode]`, any `unreadOnly`
 * and language) and takes one off the bell badge when the row was unread, so
 * the row leaves the bell and the count drops at once. A failed write restores
 * both from the snapshot.
 *
 * Live mode then invalidates `["notifications"]` on settle, like the read and
 * delete mutations beside it: a FAILED write must refetch too, so the server's
 * truth replaces the optimistic patch. Demo mode skips the invalidation, since
 * a refetch rebuilds the feed from the mock; it records the id in
 * `demoHiddenFromBellIds` instead, which the demo feed and badge read on every
 * rebuild.
 */
export function useHideNotification() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  // A prefix of the feed key `["notifications", demoMode, unreadOnly,
  // language]`. It never matches the badge key `["notifications",
  // "unread-count", demoMode]`, whose second element is a string.
  const feedQueryKey = ["notifications", demoMode];
  const unreadCountQueryKey = ["notifications", "unread-count", demoMode];

  return useMutation<void, Error, NotificationId, HideNotificationSnapshot>({
    mutationFn: async (id) => {
      if (demoMode) return;
      await hideNotificationFromBell(id);
    },
    // `useNotificationsReadState` toasts this write's failure with its own
    // copy, so the app-wide mutation toast stays quiet for it.
    meta: { silentError: true },
    onMutate: async (id) => {
      // An in-flight refetch landing after the patch would bring the row back.
      await Promise.all([
        queryClient.cancelQueries({ queryKey: feedQueryKey }),
        queryClient.cancelQueries({ queryKey: unreadCountQueryKey }),
      ]);
      const previousFeeds = queryClient.getQueriesData<CachedNotificationsFeed>(
        { queryKey: feedQueryKey },
      );
      const previousUnreadCount =
        queryClient.getQueryData<number>(unreadCountQueryKey);
      const wasUnread = previousFeeds.some(([, feed]) =>
        feed?.pages.some((page) =>
          page.items.some(
            (notification) => notification.id === id && notification.unread,
          ),
        ),
      );

      queryClient.setQueriesData<CachedNotificationsFeed>(
        { queryKey: feedQueryKey },
        (feed) => (feed ? withRowHiddenFromBell(feed, id) : feed),
      );
      if (wasUnread) {
        queryClient.setQueryData<number>(unreadCountQueryKey, (count) =>
          count === undefined ? count : Math.max(0, count - 1),
        );
      }
      if (demoMode) demoHiddenFromBellIds.add(id);
      return { previousFeeds, previousUnreadCount, wasUnread };
    },
    onError: (_error, id, snapshot) => {
      if (demoMode) demoHiddenFromBellIds.delete(id);
      if (!snapshot) return;
      for (const [queryKey, feed] of snapshot.previousFeeds) {
        queryClient.setQueryData(queryKey, feed);
      }
      if (snapshot.wasUnread) {
        queryClient.setQueryData(
          unreadCountQueryKey,
          snapshot.previousUnreadCount,
        );
      }
    },
    onSettled: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
