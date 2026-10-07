import { useState } from "react";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { useAttendeePages } from "./api/useAttendeePages";
import type { AttendeeRow } from "./api/events.adapters";

/** What one group's section shows, whether it comes from the roster or from
 *  the search. */
export interface AttendeeSectionSource {
  attendees: AttendeeRow[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  headingCount: number;
}

/** Server-side name search over the going and waitlist groups. While a query
 *  is active each section source is the server's answer as returned; nothing
 *  here filters it by text again. With no query the roster source passes
 *  through unchanged. */
export function useAttendeeSearch(
  slug: string,
  roster: { going: AttendeeSectionSource; waitlist: AttendeeSectionSource },
) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 200);
  const isSearching = debouncedQuery !== "";
  const going = useAttendeePages(
    slug,
    { status: "going", q: debouncedQuery },
    { isEnabled: isSearching },
  );
  const waitlist = useAttendeePages(
    slug,
    { status: "waitlisted", q: debouncedQuery },
    { isEnabled: isSearching },
  );
  const asSource = (
    result: typeof going,
    fallback: AttendeeSectionSource,
  ): AttendeeSectionSource =>
    isSearching
      ? {
          attendees: result.rows,
          hasMore: result.hasMore,
          loadingMore: result.isFetchingMore,
          onLoadMore: result.loadMore,
          headingCount: result.total,
        }
      : fallback;
  const hasFailed =
    isSearching &&
    ((going.isLoadError && going.rows.length === 0) ||
      (waitlist.isLoadError && waitlist.rows.length === 0));
  return {
    query,
    setQuery,
    going: asSource(going, roster.going),
    waitlist: asSource(waitlist, roster.waitlist),
    hasFailed,
    retry: () => {
      if (going.isLoadError) going.retry();
      if (waitlist.isLoadError) waitlist.retry();
    },
  };
}
