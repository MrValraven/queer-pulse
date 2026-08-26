import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { APPEALS } from "../adminModeration.data";
import type { AppealView } from "../moderationAge";
import type { AppealTabId } from "../moderationQueue.types";
import { getAppeals } from "./moderation.api";
import { appealDtoToView } from "./moderation.adapters";

/** One fetched page of the appeals queue. */
interface AppealsPage {
  appeals: AppealView[];
  counts: { awaiting: number; decided: number; overdue: number };
  nextCursor: string | null;
}

/** The opaque keyset cursor `GET /mod/appeals` returns; absent on page one. */
type AppealsCursor = string | undefined;

/**
 * The appeals queue, split into the two tabs the published process has (TS-11).
 *
 * A hook of its own rather than another branch inside `useModReports`, and the
 * reason is the pagination: the reports queue is one infinite query keyed on a
 * REPORT cursor, and appeals now page independently on their own keyset. Riding
 * along inside it would have meant appeals loading exactly once, on page one of
 * the reports queue, which is the shape TS-11 exists to replace. `useModReports`
 * still owns the header's appeal COUNT, which comes from the reports endpoint.
 *
 * Ordering is the server's: awaiting appeals soonest-due first, so the one the
 * platform is closest to being late on is at the top; decided appeals newest
 * first, because that tab is a history view.
 *
 * Demo mode reads the colocated seed and never hits the network, exactly as the
 * reports queue does. The seed carries no decided appeals, so the decided tab
 * demos as empty rather than as invented history.
 */
export function useAppealsQueue(
  tab: AppealTabId = "awaiting",
  isOverdueOnly = false,
) {
  const { demoMode } = useDemoMode();

  const query = useInfiniteQuery<
    AppealsPage,
    Error,
    InfiniteData<AppealsPage, AppealsCursor>,
    QueryKey,
    AppealsCursor
  >({
    queryKey: ["mod-appeals", demoMode, tab, isOverdueOnly],
    initialPageParam: undefined,
    queryFn: async ({ pageParam: cursor }) => {
      if (demoMode) {
        // The whole fixture is one page, so `getNextPageParam` yields undefined
        // and demo mode never issues a second fetch. Every seeded appeal is
        // awaiting, which is what the demo is for: the queue a moderator works.
        const appeals = tab === "awaiting" ? APPEALS : [];
        return {
          appeals: isOverdueOnly
            ? appeals.filter((appeal) => appeal.isOverdue)
            : appeals,
          counts: {
            awaiting: APPEALS.length,
            decided: 0,
            overdue: APPEALS.filter((appeal) => appeal.isOverdue).length,
          },
          nextCursor: null,
        };
      }
      const page = await getAppeals({
        tab,
        filter: isOverdueOnly ? "overdue" : undefined,
        cursor,
      });
      return {
        appeals: page.data.map(appealDtoToView),
        counts: page.counts,
        nextCursor: page.pageInfo.hasMore ? page.pageInfo.nextCursor : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const pages = query.data?.pages;
  // Memoized so the flattened array identity stays stable between renders: the
  // queue mirrors this reference into optimistic local state, and a fresh array
  // every render would re-seed it and clobber a row mid-undo.
  const appeals = useMemo<AppealView[] | undefined>(
    () => (pages ? pages.flatMap((page) => page.appeals) : undefined),
    [pages],
  );
  const counts = pages?.[pages.length - 1]?.counts ?? {
    awaiting: 0,
    decided: 0,
    overdue: 0,
  };

  return {
    appeals,
    counts,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
  };
}
