import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getArchive, type ArchiveEntryDto } from "./pieces.api";
import { DEMO_ARCHIVE } from "../data/issueProduction.data";

function matchesQuery(entry: ArchiveEntryDto, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  const haystack = [entry.title, entry.by, ...entry.tags].join(" ").toLowerCase();
  return haystack.includes(normalizedQuery);
}

/**
 * The issue-production Archive tab's "have we run this before?" search.
 * Demo mode filters the static `DEMO_ARCHIVE` fixture client-side by `q`
 * (title/byline/tags, case-insensitive substring). Live mode calls
 * `GET /magazine/admin/archive?q=` (published articles + decks only, per
 * `magazine-piece.service.ts` `searchArchive`).
 *
 * `q` is part of the query key so each distinct search string gets its own
 * cache entry, and `placeholderData: keepPreviousData` keeps the previous
 * hits on screen while a new keystroke's request is in flight — no flash to
 * an empty/loading state while typing.
 */
export function useArchive(q: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<ArchiveEntryDto[]>({
    queryKey: ["magazine-archive", demoMode, q],
    queryFn: async () => {
      if (demoMode) {
        const normalizedQuery = q.trim().toLowerCase();
        return DEMO_ARCHIVE.filter((entry) => matchesQuery(entry, normalizedQuery));
      }
      return getArchive(q);
    },
    placeholderData: keepPreviousData,
  });

  return { entries: query.data ?? [], isLoading: query.isLoading, isError: query.isError };
}
