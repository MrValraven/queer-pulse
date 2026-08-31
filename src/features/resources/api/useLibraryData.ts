import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { Guide } from "../library.data";
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
  /** True when the guide fetch failed, so the page can say so instead of
   *  rendering an empty library (DES-22). */
  isError: boolean;
  /** Re-runs the failed request. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch: () => void;
}

interface LibraryPageVM {
  items: Guide[];
  total: number;
  page: number;
}

/**
 * Data source for the Guide Library — the canonical, nav-linked
 * `marketing/ResourceLibraryPage` (CNT-11 consolidated the resources
 * feature's old static-mock `LibraryPage` onto this same real, backend-driven
 * source; the old `/resources/library` route now redirects here), paginated
 * in live mode.
 *
 * Demo mode returns the page's own `GUIDES` mock as a single page with
 * `hasNextPage` hard-false — so demo never paginates and renders exactly as
 * before. The mock is code-split out of the live bundle via a demo-gated
 * dynamic `import()` inside the query function, so `GUIDES` only loads when
 * demo mode actually asks for it; the page already renders a loading state
 * (`useSimulatedLoad() || dataLoading`), so the extra tick is invisible.
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
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { GUIDES } = await import("../library.data");
        return { items: GUIDES, total: GUIDES.length, page: 1 };
      }
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

  return {
    guides,
    loading: query.isPending,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
