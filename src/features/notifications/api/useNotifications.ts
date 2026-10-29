import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import {
  getNotificationsPage,
  type NotificationDTO,
} from "./notifications.api";
import { notificationDtoToView } from "./notifications.adapters";
import { demoHiddenFromBellIds } from "./demoHiddenFromBellIds";
import type { Notification } from "../notifications.types";

export interface NotificationsResult {
  /** Every notification loaded so far, flattened across loaded pages. */
  items: Notification[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  /** ENG-501: the latest next-page fetch failed. React Query also sets
   *  `isError` then, so a consumer keeps its loaded rows on screen and lets
   *  the load-more footer retry that page. Always false in demo, which serves
   *  one page. */
  isFetchNextPageError: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/** One live page of the feed as cached under `["notifications", demoMode,
 *  unreadOnly, language]`: the rows exactly as the API served them, so the
 *  cache holds no translated text. Exported so `useHideNotification` can patch
 *  a row inside the cached pages. */
export interface LiveNotificationsPage {
  source: "live";
  items: NotificationDTO[];
  total: number;
  page: number;
}

/** The demo feed as cached: the mock's builder, run at render against the
 *  current `t`. `unreadIds` lets `useHideNotification` tell whether a hidden
 *  row was unread without building the rows. */
export interface DemoNotificationsPage {
  source: "demo";
  buildNotifications: (t: TFunction, fmt: Formatters) => Notification[];
  unreadIds: readonly Notification["id"][];
  total: number;
  page: number;
}

export type NotificationsPageVM = LiveNotificationsPage | DemoNotificationsPage;

/** One cached page as view rows, translated with the `t` and `fmt` current at
 *  render. */
function notificationsPageToViews(
  page: NotificationsPageVM,
  t: TFunction,
  fmt: Formatters,
  unreadOnly: boolean,
): Notification[] {
  if (page.source === "demo") {
    // A row hidden from the bell this session stays hidden (and read) across
    // every rebuild of the mock. See `demoHiddenFromBellIds`.
    const rows = page
      .buildNotifications(t, fmt)
      .map((notification) =>
        demoHiddenFromBellIds.has(notification.id)
          ? { ...notification, isHiddenFromBell: true, unread: false }
          : notification,
      );
    return unreadOnly
      ? rows.filter((notification) => notification.unread)
      : rows;
  }
  // `otherActorCount` is carried across here. `notificationDtoToView` owns the
  // text/actor/icon mapping and is deliberately left alone: a bundled row
  // differs from an ordinary one only by this count, and the row component is
  // what renders it.
  return page.items.map((dto) => ({
    ...notificationDtoToView(dto, t, fmt),
    otherActorCount: dto.otherActorCount ?? 0,
  }));
}

/**
 * Notification feed source, paginated (mirrors `useMembers`' offset-page
 * `useInfiniteQuery` shape). Demo mode returns the colocated mock list as a
 * single synthetic page (full fidelity: avatars + action buttons); live mode
 * calls GET /notifications?page= and appends each page, stopping at the
 * server `total`, adapting each row's text from `type` + `payload` via i18n.
 * `unreadOnly` filters to unread notifications on both paths.
 *
 * The cache holds language-neutral data (the raw DTO pages, or the demo
 * builder) and the rows are translated at render. A lazy catalog namespace
 * that arrives after the first fetch gives `t` a new identity, which
 * re-translates the cached rows without a refetch. Calling `t` inside the
 * `queryFn` would bake the empty string of a pending namespace into the cache.
 * `language` stays in the queryKey so each language keeps its own cache entry.
 */
export function useNotifications(unreadOnly = false): NotificationsResult {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();

  const query = useInfiniteQuery<NotificationsPageVM>({
    queryKey: ["notifications", demoMode, unreadOnly, language],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<NotificationsPageVM> => {
      if (demoMode) {
        // Code-split: the demo mock is only pulled into the bundle in demo mode.
        const { buildNotifications, DEMO_UNREAD_IDS } =
          await import("../notificationsList.data");
        return {
          source: "demo",
          buildNotifications,
          unreadIds: DEMO_UNREAD_IDS,
          total: DEMO_UNREAD_IDS.length,
          page: 1,
        };
      }
      const res = await getNotificationsPage(unreadOnly, pageParam as number);
      // New-DM alerts are deliberately excluded from the notifications centre.
      // They surface only via the message-icon unread badge and push. The live
      // backend already never writes a `new_message` row, so this is a
      // belt-and-braces guard against a future regression re-introducing one.
      // Filtering here keeps `getNextPageParam`'s loaded count in step with
      // the rows shown.
      const items = res.items.filter((dto) => dto.type !== "new_message");
      return { source: "live", items, total: res.total, page: res.page };
    },
    getNextPageParam: (last, all) => {
      // The demo serves one synthetic page.
      if (last.source === "demo") return undefined;
      const loaded = all.reduce(
        (count, page) =>
          count + (page.source === "live" ? page.items.length : 0),
        0,
      );
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const pages = query.data?.pages;
  const items = useMemo(
    () =>
      (pages ?? []).flatMap((page) =>
        notificationsPageToViews(page, t, fmt, unreadOnly),
      ),
    [pages, t, fmt, unreadOnly],
  );
  return {
    items,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
