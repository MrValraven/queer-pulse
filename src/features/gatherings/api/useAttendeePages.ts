import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { foldForSearch } from "../../../shared/lib/foldForSearch";
import { getAttendees, type AttendeeArrival } from "./events.api";
import { attendeeToRow, type AttendeeRow } from "./events.adapters";
import { eventKeys } from "./eventKeys";
import { useAttendees } from "./useAttendees";

export interface AttendeePagesFilter {
  status: "going" | "waitlisted";
  arrival?: AttendeeArrival;
  q?: string;
}

export interface AttendeePage {
  rows: AttendeeRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AttendeePagesResult {
  rows: AttendeeRow[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isFetchingMore: boolean;
  /** The group's own load failed. A failed load-more page also sets the
   *  query's isError, so that case is left out here. */
  isLoadError: boolean;
  /** A further page failed; the rows already shown stay. */
  isLoadMoreError: boolean;
  loadMore: () => void;
  retry: () => void;
}

/** Under the roster's own key, so every existing invalidation of a
 *  gathering's attendees also refreshes the door's groups. */
export const attendeePagesRoot = (
  slug: string | undefined,
  demoMode: boolean,
) => [...eventKeys.attendees(slug, demoMode), "pages"] as const;

/** Index 5 is the arrival filter and index 7 the search term; the check-in
 *  cache patch reads them back off each cached key. */
export const attendeePagesKey = (
  slug: string | undefined,
  demoMode: boolean,
  filter: AttendeePagesFilter,
) =>
  [
    ...attendeePagesRoot(slug, demoMode),
    filter.status,
    filter.arrival ?? "any",
    "q",
    filter.q ?? "",
  ] as const;

/** A stable non-negative number per slug, so a guest keeps the same avatar
 *  tint however the rows around them shift between refreshes. */
export function tintIndexForSlug(slug: string): number {
  let hash = 0;
  for (let position = 0; position < slug.length; position += 1) {
    hash = (hash * 31 + slug.charCodeAt(position)) >>> 0;
  }
  return hash;
}

function demoRows(
  source: AttendeeRow[],
  filter: AttendeePagesFilter,
): AttendeeRow[] {
  const needle = foldForSearch(filter.q ?? "");
  const matching = source.filter((attendee) => {
    const hasArrived = attendee.checkedInAt != null;
    if (filter.arrival === "arrived" && !hasArrived) return false;
    if (filter.arrival === "expected" && hasArrived) return false;
    return !needle || foldForSearch(attendee.name).includes(needle);
  });
  if (filter.arrival === "arrived") {
    return matching.sort(
      (left, right) =>
        (right.checkedInAt?.getTime() ?? 0) -
        (left.checkedInAt?.getTime() ?? 0),
    );
  }
  if (filter.arrival === "expected") {
    return matching.sort((left, right) => left.name.localeCompare(right.name));
  }
  return matching;
}

/**
 * One server-paginated slice of a gathering's roster: the door's "still to
 * arrive" and "arrived" groups, and a name search over either RSVP status.
 * Rows are shown exactly as the server returns them; nothing filters them
 * again by text on the client.
 */
export function useAttendeePages(
  slug: string | undefined,
  filter: AttendeePagesFilter,
  options: { isEnabled?: boolean } = {},
): AttendeePagesResult {
  const { demoMode } = useDemoMode();
  const isEnabled = options.isEnabled ?? true;
  // Only demo derives its groups from the roster; live leaves it alone.
  const { data: roster } = useAttendees(demoMode ? slug : undefined);

  const query = useInfiniteQuery<AttendeePage>({
    queryKey: attendeePagesKey(slug, demoMode, filter),
    enabled: Boolean(slug) && !demoMode && isEnabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const pageNumber = pageParam as number;
      const response = await getAttendees(
        slug ?? "",
        filter.status,
        pageNumber,
        {
          arrival: filter.arrival,
          q: filter.q || undefined,
        },
      );
      return {
        rows: response.items.map((item) =>
          attendeeToRow(item, tintIndexForSlug(item.slug)),
        ),
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
    // A new search keeps the previous rows on screen until its own land.
    placeholderData: keepPreviousData,
  });

  const demoSource =
    filter.status === "going" ? roster?.going : roster?.waitlist;
  const { status, arrival, q } = filter;
  // The filter's primitive fields, because callers pass a fresh object
  // literal every render.
  const demoResult = useMemo(
    () => (demoMode ? demoRows(demoSource ?? [], { status, arrival, q }) : []),
    [demoMode, demoSource, status, arrival, q],
  );

  const { hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = query;
  // An explicit press, so it may try again after a failed load-more.
  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (demoMode) {
    return {
      rows: isEnabled ? demoResult : [],
      total: demoResult.length,
      hasMore: false,
      isLoading: !roster,
      isFetchingMore: false,
      isLoadError: false,
      isLoadMoreError: false,
      loadMore: () => undefined,
      retry: () => undefined,
    };
  }

  const pages = query.data?.pages ?? [];
  // A page-boundary shift can repeat a guest; the first occurrence stays.
  const seenSlugs = new Set<string>();
  const liveRows = pages
    .flatMap((page) => page.rows)
    .filter((row) => {
      if (seenSlugs.has(row.slug)) return false;
      seenSlugs.add(row.slug);
      return true;
    });
  return {
    rows: liveRows,
    total: pages[0]?.total ?? 0,
    hasMore: Boolean(hasNextPage),
    isLoading: query.isLoading,
    isFetchingMore: isFetchingNextPage,
    isLoadError: query.isError && !query.isFetchNextPageError,
    isLoadMoreError: query.isFetchNextPageError,
    loadMore,
    retry,
  };
}
