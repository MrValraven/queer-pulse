import type { FetchStatus } from "@tanstack/react-query";

/** The slice of a react-query result these helpers read. */
interface QueryLoadState {
  data: unknown;
  isError: boolean;
  fetchStatus: FetchStatus;
  errorUpdateCount: number;
}

/**
 * DES-424: the read failed and nothing ever loaded, including while a retry of
 * that failure runs.
 *
 * react-query puts a query with no data back to `pending` the moment it
 * refetches, which clears `isError`. Read on its own, a Retry would swap the
 * error panel for a skeleton, unmount the focused button and drop keyboard
 * focus to the page body. `errorUpdateCount` survives that reset, so it tells
 * a retry of a failed read apart from a first load. A failed `fetchNextPage`
 * keeps its loaded pages in `data`, so it never counts here.
 */
export function hasFailedWithoutData(query: QueryLoadState): boolean {
  if (query.data !== undefined) return false;
  if (query.isError) return true;
  return query.errorUpdateCount > 0 && query.fetchStatus !== "idle";
}

/** A retry of a read that failed with nothing loaded is in flight. */
export function isRetryingFailedRead(query: QueryLoadState): boolean {
  return hasFailedWithoutData(query) && query.fetchStatus !== "idle";
}
