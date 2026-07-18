import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { GUIDES, type Guide } from "../library.data";
import { getResources } from "./resources.api";
import { resourceToGuide } from "./resources.adapters";

export interface LibraryDataResult {
  /** All guides fetched so far, flattened across loaded pages. */
  guides: Guide[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
  /** True when another page is available (always false in demo). */
  hasNextPage: boolean;
  /** Fetch and append the next page (no-op in demo). */
  fetchNextPage: () => void;
  /** True while a subsequent page loads. */
  isFetchingNextPage: boolean;
}

interface LibraryPageVM {
  items: Guide[];
  total: number;
  page: number;
}

/**
 * Data source for the Guide Library (`LibraryPage`), paginated in live mode.
 *
 * Demo mode returns the page's own `GUIDES` mock unchanged, resolved before the
 * query is ever touched (`enabled: !demoMode`), with `hasNextPage` hard-false —
 * so demo never fetches, never paginates and renders exactly as before.
 *
 * Live mode calls GET /resources?page= and appends each page, stopping at the
 * server `total`, so a library larger than one page is fully reachable via
 * "Load more" instead of being silently truncated. Each row is adapted to the
 * page's local `Guide` shape. The page's own category/search filtering
 * (`useMemo` over the returned list) stays entirely client-side in both modes,
 * unchanged.
 */
export function useLibraryData(): LibraryDataResult {
  const { demoMode } = useDemoMode();

  const query = useInfiniteQuery<LibraryPageVM>({
    queryKey: ["resources", "library", demoMode],
    enabled: !demoMode,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getResources({ page: pageParam as number });
      return {
        items: res.items.map(resourceToGuide),
        total: res.total,
        page: res.page,
      };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  // Memoised so the "no data yet" case keeps a stable array identity across
  // renders (what the old EMPTY_GUIDES constant guarded against) and the page's
  // filtering `useMemo` isn't invalidated on every render.
  const guides = useMemo(
    () => (query.data?.pages ?? []).flatMap((p) => p.items),
    [query.data],
  );

  if (demoMode) {
    return {
      guides: GUIDES,
      loading: false,
      hasNextPage: false,
      fetchNextPage: () => {},
      isFetchingNextPage: false,
    };
  }
  return {
    guides,
    loading: query.isPending,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
