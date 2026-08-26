import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getNotificationsPage } from "./notifications.api";
import { notificationDtoToView } from "./notifications.adapters";
import type { Notification } from "../notifications.types";

export interface NotificationsResult {
  /** Every notification loaded so far, flattened across loaded pages. */
  items: Notification[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

interface NotificationsPageVM {
  items: Notification[];
  total: number;
  page: number;
}

/**
 * Notification feed source, paginated (mirrors `useMembers`' offset-page
 * `useInfiniteQuery` shape). Demo mode returns the colocated mock list as a
 * single synthetic page (full fidelity: avatars + action buttons); live mode
 * calls GET /notifications?page= and appends each page, stopping at the
 * server `total`, adapting each row's text from `type` + `payload` via i18n.
 * `unreadOnly` filters to unread notifications on both paths.
 *
 * `language` is part of the queryKey because the adapted rows carry translated
 * text — switching language must re-render the feed in the new language rather
 * than serve a stale English cache entry.
 */
export function useNotifications(unreadOnly = false): NotificationsResult {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();

  const query = useInfiniteQuery<NotificationsPageVM>({
    queryKey: ["notifications", demoMode, unreadOnly, language],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        // Code-split: the demo mock is only pulled into the bundle in demo mode.
        const { buildNotifications } =
          await import("../notificationsList.data");
        const list = buildNotifications(t, fmt);
        const items = unreadOnly ? list.filter((n) => n.unread) : list;
        return { items, total: items.length, page: 1 };
      }
      const res = await getNotificationsPage(unreadOnly, pageParam as number);
      // New-DM alerts are deliberately excluded from the notifications centre —
      // they surface only via the message-icon unread badge and push. The live
      // backend already never writes a `new_message` row, so this is a
      // belt-and-braces guard against a future regression re-introducing one.
      const items = res.items
        .filter((dto) => dto.type !== "new_message")
        // `otherActorCount` is carried across here rather than inside
        // `notificationDtoToView`, which owns the text/actor/icon mapping and
        // is deliberately left alone: a bundled row differs from an ordinary
        // one only by this count, and the row component is what renders it.
        .map((dto) => ({
          ...notificationDtoToView(dto, t, fmt),
          otherActorCount: dto.otherActorCount ?? 0,
        }));
      return { items, total: res.total, page: res.page };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((count, page) => count + page.items.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const pages = query.data?.pages ?? [];
  return {
    items: pages.flatMap((page) => page.items),
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
