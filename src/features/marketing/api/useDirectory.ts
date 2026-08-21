import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDirectoryListingsActions } from "../../../app/providers/useDirectoryListingsActions";
import { toItemsPage } from "../../../shared/api/pagination";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  DIRECTORY_PLACES,
  getPlace,
  type DirectoryPlace,
} from "../directoryPlaces";
import {
  cardDtoToPlace,
  detailDtoToPlace,
  submittedToPlace,
} from "./directory.adapters";
import { getDirectory, getDirectoryPage, getDirectorySpace } from "./directory.api";
import { ApiError } from "../../../shared/api/client";

export const DIRECTORY_KEY = "directory";

/**
 * Whole-catalog source for callers that need every live business client-side
 * rather than a browsable page: the gatherings venue picker, @mention
 * suggestions, and the directory detail page's "related places" strip. The
 * `/local/directory` grid itself uses `useDirectoryPlacesPage` below (real
 * server-side filtering + pagination) — this hook stays a small, unfiltered,
 * unpaginated read for surfaces that just want "every business" to search/
 * match against locally.
 *
 * Demo mode returns the prototype's own `DIRECTORY_PLACES` registry and never
 * hits the network. Live mode fetches the public `GET /directory` (every live
 * listing, capped at the backend's `DEFAULT_LIST_LIMIT`) and adapts each card
 * — so with "Populate platform" OFF these surfaces work against real
 * businesses, and the fabricated fixture only appears in demo.
 *
 * Returns a plain array (callers keep their own loading UI), so this stays a
 * drop-in for the previous synchronous read point.
 */
export function useDirectoryPlaces(): DirectoryPlace[] {
  const { demoMode } = useDemoMode();
  const query = useQuery<DirectoryPlace[]>({
    queryKey: [DIRECTORY_KEY, demoMode],
    initialData: demoMode ? DIRECTORY_PLACES : undefined,
    queryFn: async () => {
      if (demoMode) return DIRECTORY_PLACES;
      const cards = await getDirectory();
      return cards.map(cardDtoToPlace);
    },
  });
  return query.data ?? [];
}

export interface DirectoryPlacesPageFilters {
  /** Free-text search — sent server-side as `q` in live mode. */
  query?: string;
  /** `"verified"` restricts to safe-space-verified listings — sent
   * server-side as `safe`. `null`/absent = no restriction. */
  safe?: "verified" | null;
}

export interface DirectoryPlacesPageResult {
  /** Every place loaded so far, flattened across loaded pages. */
  places: DirectoryPlace[];
  /** Server-reported grand total matching the current query/safe filter
   * (live); the full fixture length in demo. */
  total: number;
  /** True while the first page is in flight. */
  isLoading: boolean;
  /** True when another page is available (always false in demo). */
  hasNextPage: boolean;
  /** Fetch and append the next page. */
  fetchNextPage: () => void;
  /** True while a subsequent page loads. */
  isFetchingNextPage: boolean;
}

interface DirectoryPageVM {
  items: DirectoryPlace[];
  total: number;
  page: number;
}

/**
 * Paginated, server-filtered source for the `/local/directory` grid
 * (gap-audit HSG-5): sends the active `query`/`safe` filters to the backend
 * as `q`/`safe` query params — instead of `useDirectoryPlaces`' old pattern of
 * fetching every live listing unfiltered and filtering client-side — and
 * pages through the real backend `total` via `getDirectoryPage` rather than
 * silently stopping at `DEFAULT_LIST_LIMIT`. `cat` (category) deliberately
 * stays a client-side filter over the loaded pages (see
 * `useDirectoryFilters`'s `categoryCounts`), and `vibe` is demo-only (see
 * `LocalFilterFields`'s `useDemoMode` gate) — neither is a real server-side
 * concept here.
 *
 * Demo mode returns the full `DIRECTORY_PLACES` fixture as a single terminal
 * page (`hasNextPage: false`), so demo renders exactly as before with no
 * "Load more" ever offered. Mirrors `useCompanies`'s identical
 * `useInfiniteQuery` shape.
 */
export function useDirectoryPlacesPage(
  filters: DirectoryPlacesPageFilters = {},
): DirectoryPlacesPageResult {
  const { demoMode } = useDemoMode();
  const trimmedQuery = (filters.query ?? "").trim();
  const safe = filters.safe ?? undefined;

  const query = useInfiniteQuery<DirectoryPageVM>({
    queryKey: [DIRECTORY_KEY, "page", demoMode, trimmedQuery, safe],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        return {
          items: DIRECTORY_PLACES,
          total: DIRECTORY_PLACES.length,
          page: 1,
        };
      }
      const res = toItemsPage(
        await getDirectoryPage({
          q: trimmedQuery || undefined,
          safe,
          page: pageParam as number,
        }),
      );
      return {
        items: res.items.map(cardDtoToPlace),
        total: res.total,
        page: res.page,
      };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((count, page) => count + page.items.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const pages = query.data?.pages ?? [];
  return {
    places: pages.flatMap((page) => page.items),
    total: pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

/**
 * A single directory place by slug, for the detail page
 * (`/local/directory/:slug`). Demo resolves against the mock registry, then
 * falls back to the member's own submitted-listings overlay (so a demo
 * user's wizard-created listing is viewable and its owner-only affordances —
 * "Edit this listing", replying to reviews — are reachable); live fetches the
 * public `GET /directory/:slug` and adapts it.
 *
 * Returns `{ place, isLoading, isError, refetch }` rather than a bare value:
 * the live fetch is async, so the detail page must distinguish "still loading"
 * (show a skeleton), "settled, not found" (redirect), and "the read failed"
 * (show an error state) instead of redirecting on the initial undefined. Only a
 * genuine 404 resolves to `undefined` (not found) with `isLoading` false; any
 * other failure (5xx, network) propagates so `isError` is true and the page can
 * offer a retry rather than a misleading not-found redirect.
 */
export function useDirectoryPlace(slug: string | undefined): {
  place: DirectoryPlace | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const fmt = useFormat();
  const { user } = useAuth();
  // Hook-safe: read the demo/session listings overlay at the hook's top
  // level (never inside queryFn). `local` is the whole demo store — same
  // source `useDirectoryListings`' `submitted` reads in demo mode — and, in
  // live mode, only ever a same-session optimistic overlay never consulted
  // below (the demo branch is the sole caller of `demoPlace`).
  const { local: submittedListings } = useDirectoryListingsActions();

  // Fixture-first, then the member's own submitted listing for that slug.
  // Kept synchronous to match `getPlace`'s existing demo pattern. A demo
  // submission is always the signed-in viewer's own listing, so their real
  // profile photo (not a mock registry lookup) is the right "who runs it"
  // avatar — mirrors the live detail's resolved `owner.avatarUrl`.
  const demoPlace = (): DirectoryPlace | undefined => {
    const fixture = getPlace(slug);
    if (fixture) return fixture;
    const submitted = submittedListings.find((listing) => listing.slug === slug);
    return submitted
      ? submittedToPlace(submitted, user?.profile.avatarUrl)
      : undefined;
  };

  const query = useQuery<DirectoryPlace | undefined>({
    queryKey: [DIRECTORY_KEY, "detail", slug, demoMode, language],
    enabled: slug !== undefined,
    initialData: demoMode ? demoPlace() : undefined,
    queryFn: async () => {
      if (demoMode) return demoPlace();
      if (slug === undefined) return undefined;
      try {
        return detailDtoToPlace(await getDirectorySpace(slug), fmt);
      } catch (error) {
        // Only a real 404 means "no such listing" → resolve to undefined so the
        // page redirects to the directory. Any other failure (5xx, network)
        // re-throws so the query enters its error state and the page can offer
        // a retry, rather than falsely claiming the listing doesn't exist.
        if (error instanceof ApiError && error.status === 404) return undefined;
        throw error;
      }
    },
  });
  return {
    place: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
