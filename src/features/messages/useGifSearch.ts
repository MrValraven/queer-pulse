import { useEffect, useRef, useState } from "react";
import {
  gifProvider,
  isGifProviderConfigured,
  type GifResult,
} from "../../shared/api/gifs";
import { DEMO_GIFS } from "./demoGifs.data";

/** An aborted fetch rejects with a DOMException named "AbortError". That
 *  rejection is this hook cancelling its own superseded request, so it stays
 *  out of the picker's error state. Matches how the share sheets read a
 *  user-cancelled `navigator.share` (`shareSubprofile.ts`). */
function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

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
    // The network half of supersession. `clearTimeout` below already suppresses
    // a request superseded INSIDE the 300ms debounce window, but one that has
    // already fired stays in flight against KLIPY, a rate-limited third party,
    // and burns a slot of that limit for a response nobody will read. Aborting
    // in the cleanup stops the request itself, where `cancelled` and
    // `requestIdRef` only stop us from applying its result.
    //
    // Both layers stay. Abort is the network half, the requestId above is the
    // ordering half: `loadMore` deliberately runs without a controller (one
    // click-initiated page fetch at a time), so a loadMore that lands after
    // the query changed is still discarded by id alone. The
    // `cancelled` flag also covers the last sliver abort cannot reach, a
    // response that already resolved in the microtask queue before the cleanup
    // ran.
    const abortController = new AbortController();
    setLoading(true);
    setError(false);
    const timer = window.setTimeout(() => {
      const request = trimmedQuery
        ? gifProvider.search(trimmedQuery, undefined, abortController.signal)
        : gifProvider.featured(undefined, abortController.signal);
      request
        .then((page) => {
          if (cancelled || requestIdRef.current !== requestId) return;
          setResults(page.results);
          setNextPage(page.nextPage);
        })
        .catch((error: unknown) => {
          // Belt and braces: the guards below already stop an aborted run from
          // writing state, but an AbortError is never an error to surface.
          if (isAbortError(error)) return;
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
      abortController.abort();
    };
  }, [trimmedQuery, demoMode]);

  function loadMore() {
    if (demoMode || nextPage === null || loading) return;
    // Claim an id for this page fetch; if the query changes (the search effect
    // bumps the id) or another request supersedes it before this resolves, the
    // stale page is dropped rather than appended to a newer result set.
    // No AbortController here on purpose. This fires once per deliberate click
    // and only when nothing else is loading, so it cannot stack up requests
    // against KLIPY's rate limit the way a per-keystroke search can, and the id
    // guard already drops a page that lands late. Giving it a controller would
    // mean parking one in a ref for the search effect's cleanup to abort, which
    // buys at most one saved request per click for a real lifecycle tangle.
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
