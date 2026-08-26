import { useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useConnections } from "../../../app/providers/useConnections";
import { useSocial } from "../../../app/providers/useSocial";
import { useVouchActions } from "../../../app/providers/useVouch";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getBlocks } from "../../social/api/social.api";
import {
  CONNECTION_META,
  connectionViews,
  type ConnectionView,
  type TabId,
} from "../connections.data";
import { filterAndSortViews } from "../connectionsFilter";
import {
  getConnections,
  type ConnectionSort,
  type ConnectionsPageDTO,
} from "./connections.api";
import {
  API_TAB,
  blockDtoToView,
  connectionDtoToView,
} from "./connections.adapters";

/** The search term and ordering the page is asking for. */
export interface ConnectionsListFilters {
  searchTerm: string;
  sort: ConnectionSort;
}

const NO_FILTERS: ConnectionsListFilters = { searchTerm: "", sort: "recent" };

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
 * at the server `total`. The "blocked" tab has no /connections counterpart —
 * blocks are their own resource — so live mode reads `GET /blocks` (the same
 * query SocialProvider hydrates from, so the cache is shared) and adapts each
 * row. It must never fall through to the demo registry: a real block names a
 * member the mock registry has never heard of, and the tab would render empty.
 */
export function useConnectionsList(
  tab: TabId,
  filters: ConnectionsListFilters = NO_FILTERS,
): ConnectionsListResult {
  const { demoMode } = useDemoMode();
  const { searchTerm, sort } = filters;
  const { t, language } = useTranslation();
  const fmt = useFormat();
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
  const isLiveBlocked = !demoMode && tab === "blocked";

  // Same key/queryFn as SocialProvider's hydration, so opening the tab reuses
  // the already-warm cache instead of firing a second request.
  const blocksQuery = useQuery({
    queryKey: ["blocks", demoMode],
    enabled: isLiveBlocked,
    queryFn: () => getBlocks(),
  });

  const query = useInfiniteQuery<ConnPageVM>({
    // `language` is part of the key because the adapted rows now carry a
    // localized "sent 3 days ago" label — switching language must rebuild the
    // list rather than serve the previous language's strings.
    // The term and the ordering are part of the key: they change WHICH rows
    // the server returns and in what order, so a change must start a fresh
    // infinite query rather than append a differently-filtered page 2 onto
    // pages fetched under the old filter.
    queryKey: ["connections", tab, demoMode, language, searchTerm.trim(), sort],
    // Blocked has no /connections endpoint; demo mode never fetches. In both
    // cases we short out to the resolved views below and keep the query idle.
    enabled: !demoMode && apiTab !== undefined,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res: ConnectionsPageDTO = await getConnections(
        apiTab!,
        pageParam as number,
        { searchTerm, sort },
      );
      return {
        views: res.items.map((dto) => connectionDtoToView(dto, t, fmt)),
        total: res.total,
        page: res.page,
      };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.views.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  // Demo mode has no server to filter or order for it, so the same rules the
  // backend applies in SQL are applied here to the mock relationships. Live
  // mode never runs this: the server already did the work, and re-filtering
  // would drop a row it matched on a field the local matcher does not read.
  const demoViews = useMemo(
    () => filterAndSortViews(connectionViews(demoSlugs), searchTerm, sort),
    [demoSlugs, searchTerm, sort],
  );

  // Live blocked: the /blocks resource, never the mock registry.
  if (isLiveBlocked) {
    return {
      // `GET /blocks` takes no query params, so the Blocked tab's search and
      // ordering are applied to the fetched rows. The tab is small by nature
      // (it lists people you had to block), so there is no page to miss.
      views: filterAndSortViews(
        (blocksQuery.data?.items ?? []).map(blockDtoToView),
        searchTerm,
        sort,
      ),
      loading: blocksQuery.isPending,
      hasNextPage: false,
      fetchNextPage: () => {},
      isFetchingNextPage: false,
      total: blocksQuery.data?.total,
    };
  }

  // Demo, or a tab with no live endpoint: resolve from local state.
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
