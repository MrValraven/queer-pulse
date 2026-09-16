import type { InfiniteData, Query, QueryClient } from "@tanstack/react-query";
import type { MessageResponse } from "./messages.api";

/** One page of the infinite thread query. Items are newest-first; `nextCursor`
 *  is null once the oldest message is loaded. Mirrors `MessagePage` in
 *  `shared/api/messageCache.ts`, which patches the same cache. */
export interface MessagePage {
  items: MessageResponse[];
  nextCursor: string | null;
}

type ThreadData = InfiniteData<MessagePage>;

/**
 * ENG-199: staleness only matters to an OPEN thread through react-query's own
 * refetch triggers, and there it is the expensive kind: an infinite query
 * refetches every loaded page in sequence. The joined room streams every
 * message, edit and reaction frame into the cache and the socket's reconnect
 * reconcile backfills a gap, so an open thread needs no background refetch for
 * a short blip. Five minutes still lets the browser's online-again refetch
 * repair a real outage. A CLOSED thread receives no frames at all, so it is
 * marked stale the moment it goes inactive (see below) whatever this value is.
 */
export const THREAD_HISTORY_STALE_TIME_MS = 5 * 60_000;

const clientsWithTrim = new WeakSet<QueryClient>();

function isThreadQuery(query: Query): boolean {
  return query.queryKey[0] === "messages";
}

/**
 * Once a thread has no observer and no fetch in flight: keep only its newest
 * page (and page param), preserving `dataUpdatedAt`, then invalidate it
 * without refetching. Reopening therefore costs exactly one GET for page 0,
 * which also picks up whatever arrived while it was closed, and a long session
 * of deep reads holds one page per visited thread.
 *
 * Page 0 is the one kept on purpose: live upserts write there. `maxPages` would
 * be the obvious tool, but it drops pages from the end opposite the fetch
 * direction, which for this load-older query is page 0 itself.
 */
function trimIfInactive(queryClient: QueryClient, query: Query): void {
  if (query.getObserversCount() > 0) return;
  if (query.state.fetchStatus !== "idle") return;
  if (queryClient.getQueryCache().get(query.queryHash) !== query) return;
  const data = query.state.data as ThreadData | undefined;
  if (!data || !Array.isArray(data.pages)) return;
  if (data.pages.length > 1) {
    // A manual set clears `isInvalidated`, so trim first and invalidate after.
    queryClient.setQueryData<ThreadData>(
      query.queryKey,
      {
        pages: data.pages.slice(0, 1),
        pageParams: data.pageParams.slice(0, 1),
      },
      { updatedAt: query.state.dataUpdatedAt },
    );
  }
  if (!query.state.isInvalidated) {
    void queryClient.invalidateQueries({
      queryKey: query.queryKey,
      exact: true,
      refetchType: "none",
    });
  }
}

/**
 * Install the inactive-thread trim on a client, once. A query cache
 * subscription is used over trimming in the hook's effect cleanup because the
 * cleanup runs before react-query detaches the observer (it cannot tell whether
 * another observer still holds the thread), and an in-flight `fetchNextPage`
 * settling after it would write the dropped pages straight back. The cache
 * event sees the real observer count, and the `updated` event that ends (or
 * reverts) a fetch re-runs the check once the query is idle. The check is
 * deferred a microtask so an observer swapped within one commit is not trimmed.
 * The subscription lives as long as the client, so it is never torn down.
 */
export function ensureInactiveThreadTrim(queryClient: QueryClient): void {
  if (clientsWithTrim.has(queryClient)) return;
  clientsWithTrim.add(queryClient);
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== "observerRemoved" && event.type !== "updated") return;
    const query = event.query as Query;
    if (!isThreadQuery(query) || query.getObserversCount() > 0) return;
    queueMicrotask(() => trimIfInactive(queryClient, query));
  });
}
