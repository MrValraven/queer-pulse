import { useEffect, useRef, useState } from "react";
import {
  gifProvider,
  isGifProviderConfigured,
  type GifResult,
} from "../../shared/api/gifs";
import { DEMO_GIFS } from "./demoGifs.data";

export interface GifSearchState {
  results: GifResult[];
  loading: boolean;
  error: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

/** Drives the GifPicker's results. Empty query → provider `featured` (trending);
 *  non-empty → `search`, debounced ~300ms. In demo mode it never touches the
 *  network — it filters the curated `DEMO_GIFS` by description instead. */
export function useGifSearch(query: string, demoMode: boolean): GifSearchState {
  const [results, setResults] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const trimmedQuery = query.trim();
  // Monotonic id of the most-recently-issued request. Every fetch (the search
  // effect below AND loadMore) claims the next id up front; a resolved response
  // only applies if it is still the current one. This discards an older page
  // that resolves after a newer request — a paginated loadMore that lands after
  // the query changed, or two loadMores racing — instead of clobbering newer
  // results (or appending a stale page onto a different query).
  const requestIdRef = useRef(0);

  useEffect(() => {
    // Claim an id for this effect run so any loadMore still in flight from the
    // previous query is discarded when its response lands.
    const requestId = ++requestIdRef.current;
    if (demoMode) {
      const lowerQuery = trimmedQuery.toLowerCase();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- this effect is a genuine external-system sync (a debounced provider fetch below); this early-return branch and the "not configured" one just resolve the same state synchronously instead of via a network round trip.
      setResults(
        lowerQuery
          ? DEMO_GIFS.filter((gif) =>
              gif.description.toLowerCase().includes(lowerQuery),
            )
          : DEMO_GIFS,
      );
      setError(false);
      setNextPage(null);
      setLoading(false);
      return;
    }
    // Live mode with no provider configured: the picker renders a "coming soon"
    // state, so don't attempt (and fail) a request here.
    if (!isGifProviderConfigured) {
      setResults([]);
      setError(false);
      setNextPage(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    const timer = window.setTimeout(() => {
      const request = trimmedQuery
        ? gifProvider.search(trimmedQuery)
        : gifProvider.featured();
      request
        .then((page) => {
          if (cancelled || requestIdRef.current !== requestId) return;
          setResults(page.results);
          setNextPage(page.nextPage);
        })
        .catch(() => {
          if (cancelled || requestIdRef.current !== requestId) return;
          setError(true);
          setResults([]);
          setNextPage(null);
        })
        .finally(() => {
          if (!cancelled && requestIdRef.current === requestId)
            setLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmedQuery, demoMode]);

  function loadMore() {
    if (demoMode || nextPage === null || loading) return;
    // Claim an id for this page fetch; if the query changes (the search effect
    // bumps the id) or another request supersedes it before this resolves, the
    // stale page is dropped rather than appended to a newer result set.
    const requestId = ++requestIdRef.current;
    setLoading(true);
    const request = trimmedQuery
      ? gifProvider.search(trimmedQuery, nextPage)
      : gifProvider.featured(nextPage);
    request
      .then((page) => {
        if (requestIdRef.current !== requestId) return;
        setResults((previous) => [...previous, ...page.results]);
        setNextPage(page.nextPage);
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setError(true);
      })
      .finally(() => {
        if (requestIdRef.current === requestId) setLoading(false);
      });
  }

  return {
    results,
    loading,
    error,
    hasMore: !demoMode && nextPage !== null,
    loadMore,
  };
}
