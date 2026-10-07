import type { InfiniteData } from "@tanstack/react-query";
import type { AttendeeArrival } from "./events.api";
import type { AttendeeRow } from "./events.adapters";
import type { AttendeePage } from "./useAttendeePages";
import { foldForSearch } from "../../../shared/lib/foldForSearch";

/**
 * Moves one guest's arrival stamp through a cached door group, so the row
 * changes under the host's thumb before the server answers. A guest the host
 * just acted on joins a searched cache only when the name matches that
 * cache's term; the refetch settles any remaining difference.
 */
export function patchPagesArrival(
  data: InfiniteData<AttendeePage> | undefined,
  arrival: AttendeeArrival | undefined,
  attendee: AttendeeRow,
  checkedInAt: Date | null,
  searchTerm = "",
): InfiniteData<AttendeePage> | undefined {
  if (!data) return data;
  let isPresent = false;
  const pages = data.pages.map((page) => ({
    ...page,
    rows: page.rows.map((candidate) => {
      if (candidate.slug !== attendee.slug) return candidate;
      isPresent = true;
      return { ...candidate, checkedInAt };
    }),
  }));
  const firstPage = pages[0];
  if (isPresent || !firstPage) return { ...data, pages };
  const isSearchMatch =
    searchTerm === "" ||
    foldForSearch(attendee.name).includes(foldForSearch(searchTerm));
  if (!isSearchMatch) return { ...data, pages };
  const movedRow = { ...attendee, checkedInAt };
  if (checkedInAt && arrival === "arrived") {
    pages[0] = {
      ...firstPage,
      rows: [movedRow, ...firstPage.rows],
      total: firstPage.total + 1,
    };
  } else if (!checkedInAt && arrival === "expected") {
    const rows = [...firstPage.rows, movedRow].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
    pages[0] = { ...firstPage, rows, total: firstPage.total + 1 };
  }
  return { ...data, pages };
}
