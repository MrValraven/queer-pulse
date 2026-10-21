import { useEffect, useRef } from "react";

/** The paging half of every Studio "Show more" list. */
export interface StudioPager {
  hasMore: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage: () => void;
}

/** The most pages one run reads, whatever the server keeps answering. */
export const STUDIO_LOAD_ALL_MAX_PAGES = 100;

interface LoadAllRun {
  pagesRequested: number;
  /** The distinct item count when the last page was asked for; -1 before
   *  the first ask. */
  countAtRequest: number;
  isStopped: boolean;
}

const freshRun = (): LoadAllRun => ({
  pagesRequested: 0,
  countAtRequest: -1,
  isStopped: false,
});

/**
 * Reads the remaining pages one after another while `shouldLoadAll` holds,
 * so a filter or a sort covers the whole set and never only the pages on
 * screen. `distinctCount` is how many distinct items the list holds now.
 * The run stops for good on a page that added nothing new (an empty page
 * that still says there is more, or a cursor that repeats and brings the
 * same items back), and after 100 pages. A failed page pauses it (Show more
 * offers the retry, which picks the run up again). Turning `shouldLoadAll`
 * off ends the run, and the next one starts fresh.
 */
export function useStudioLoadAllPages(
  pager: StudioPager,
  shouldLoadAll: boolean,
  distinctCount: number,
): void {
  const { hasMore, isFetchingNextPage, isFetchNextPageError } = pager;
  const fetchNextPageRef = useRef(pager.fetchNextPage);
  const runRef = useRef<LoadAllRun>(freshRun());
  useEffect(() => {
    fetchNextPageRef.current = pager.fetchNextPage;
  });
  useEffect(() => {
    if (!shouldLoadAll) runRef.current = freshRun();
  }, [shouldLoadAll]);
  useEffect(() => {
    const run = runRef.current;
    if (!shouldLoadAll || run.isStopped || !hasMore) return;
    if (isFetchingNextPage || isFetchNextPageError) return;
    const hasAddedNothing =
      run.countAtRequest !== -1 && distinctCount <= run.countAtRequest;
    if (hasAddedNothing || run.pagesRequested >= STUDIO_LOAD_ALL_MAX_PAGES) {
      run.isStopped = true;
      return;
    }
    run.pagesRequested += 1;
    run.countAtRequest = distinctCount;
    fetchNextPageRef.current();
  }, [
    shouldLoadAll,
    hasMore,
    isFetchingNextPage,
    isFetchNextPageError,
    distinctCount,
  ]);
}

/** How many distinct ids a list holds, for `useStudioLoadAllPages`. */
export function distinctIdCount(items: readonly { id: string }[]): number {
  return new Set(items.map((item) => item.id)).size;
}

/** Two pagers read as one, the first to the end before the second. */
export function chainStudioPagers(
  first: StudioPager,
  second: StudioPager,
): StudioPager {
  return {
    hasMore: first.hasMore || second.hasMore,
    isFetchingNextPage: first.isFetchingNextPage || second.isFetchingNextPage,
    isFetchNextPageError:
      first.isFetchNextPageError || second.isFetchNextPageError,
    fetchNextPage: () => {
      if (first.hasMore || first.isFetchNextPageError) first.fetchNextPage();
      else second.fetchNextPage();
    },
  };
}
