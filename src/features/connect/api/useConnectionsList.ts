import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useConnections } from "../../../app/providers/ConnectionsProvider";
import { useSocial } from "../../../app/providers/SocialProvider";
import { useVouchActions } from "../../../app/providers/VouchProvider";
import {
  CONNECTION_META,
  connectionViews,
  type ConnectionView,
  type TabId,
} from "../connections.data";
import { getConnections, type ConnectionsPageDTO } from "./connections.api";
import { API_TAB, connectionDtoToView } from "./connections.adapters";

export interface ConnectionsListResult {
  /** The cards to render for this tab (all pages fetched so far in live mode). */
  views: ConnectionView[];
  /** True while the first live fetch is in flight (demo resolves instantly). */
  loading: boolean;
  /** True when another page is available (live only; false in demo/blocked). */
  hasNextPage: boolean;
  /** Fetch and append the next page (no-op in demo/blocked). */
  fetchNextPage: () => void;
  /** True while a subsequent page loads. */
  isFetchingNextPage: boolean;
  /**
   * How many entries this tab holds in total — the server `total` from the
   * paginated envelope in live mode, the exact local count in demo / blocked.
   * `undefined` only while the first live page is still in flight, i.e. when no
   * honest number exists yet.
   */
  total: number | undefined;
}

interface ConnPageVM {
  views: ConnectionView[];
  total: number;
  page: number;
}

/**
 * The list source for one connections tab, paginated in live mode.
 *
 * Demo mode returns the mock relationships exactly as before — resolved from
 * ConnectionsProvider / SocialProvider / VouchProvider through the member
 * registry — so the demo experience is byte-for-byte unchanged and never
 * touches the network.
 *
 * Live mode calls GET /connections?tab=&page= and appends each page, stopping
 * at the server `total`. The "blocked" tab has no API counterpart (it's owned
 * by SocialProvider), so it always resolves locally.
 */
export function useConnectionsList(tab: TabId): ConnectionsListResult {
  const { demoMode } = useDemoMode();
  const { connected, incoming, sent } = useConnections();
  const { blocked } = useSocial();
  const { vouched } = useVouchActions();

  // Slugs the mock/demo path renders for each tab.
  const demoSlugs = useMemo(() => {
    switch (tab) {
      case "all":
        return connected;
      case "incoming":
        return incoming;
      case "sent":
        return sent;
      case "blocked":
        return blocked;
      case "vouched": {
        const set = new Set<string>(vouched);
        for (const [slug, meta] of Object.entries(CONNECTION_META)) {
          if (meta.vouchBadge) set.add(slug);
        }
        return [...set];
      }
      default:
        return [];
    }
  }, [tab, connected, incoming, sent, blocked, vouched]);

  const apiTab = API_TAB[tab];

  const query = useInfiniteQuery<ConnPageVM>({
    queryKey: ["connections", tab, demoMode],
    // Blocked has no endpoint; demo mode never fetches. In both cases we short
    // out to the locally-resolved views below and keep the query idle.
    enabled: !demoMode && apiTab !== undefined,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res: ConnectionsPageDTO = await getConnections(
        apiTab!,
        pageParam as number,
      );
      return {
        views: res.items.map(connectionDtoToView),
        total: res.total,
        page: res.page,
      };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.views.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const demoViews = useMemo(() => connectionViews(demoSlugs), [demoSlugs]);

  // Demo, or a tab with no live endpoint (blocked): resolve from local state.
  if (demoMode || apiTab === undefined) {
    return {
      views: demoViews,
      loading: false,
      hasNextPage: false,
      fetchNextPage: () => {},
      isFetchingNextPage: false,
      total: demoViews.length,
    };
  }

  const views = (query.data?.pages ?? []).flatMap((p) => p.views);
  return {
    views,
    loading: query.isPending,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    // Every page echoes the same server total; take the freshest one.
    total: query.data?.pages.at(-1)?.total,
  };
}
