import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (demoMode) {
      const lowerQuery = trimmedQuery.toLowerCase();
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
          if (cancelled) return;
          setResults(page.results);
          setNextPage(page.nextPage);
        })
        .catch(() => {
          if (cancelled) return;
          setError(true);
          setResults([]);
          setNextPage(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmedQuery, demoMode]);

  function loadMore() {
    if (demoMode || nextPage === null || loading) return;
    setLoading(true);
    const request = trimmedQuery
      ? gifProvider.search(trimmedQuery, nextPage)
      : gifProvider.featured(nextPage);
    request
      .then((page) => {
        setResults((previous) => [...previous, ...page.results]);
        setNextPage(page.nextPage);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  return {
    results,
    loading,
    error,
    hasMore: !demoMode && nextPage !== null,
    loadMore,
  };
}
