import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getSubprofileDirectory, type SubprofileCardDTO } from "./subprofiles.api";

/** Backend page size. The directory endpoint caps `limit` at 100, so this is
 *  the largest slice a single request can pull. */
const DIRECTORY_PAGE_LIMIT = 100;
/** Hard ceiling on how many pages we'll walk (100 × 20 = 2000 personas). A
 *  stale/runaway `total` can never spin this into an unbounded fetch loop. */
const DIRECTORY_MAX_PAGES = 20;

/**
 * The full standalone (unlinked + published + open) persona set, fetched once
 * per demo/live mode. Personas redesign Phase 4 (design plan Decision §2): the
 * directory page filters by skin family, tags, free-text search, and
 * open-to-collabs entirely CLIENT-SIDE over this set, so the fetch itself takes
 * no `kind`/`query` network param and never re-runs as filters change — demo
 * filters nothing out of the mock registry, live reconstructs the whole set
 * from the paginated endpoint.
 *
 * The live endpoint paginates (default `limit=40`, capped at 100) and returns
 * `total`, so "the whole set" is rebuilt here by walking pages at `limit=100`
 * (page 1, 2, …) until we've collected `total` rows, bounded by
 * `DIRECTORY_MAX_PAGES`. This is a SEQUENTIAL fetch (each page awaits the
 * previous): fine for the sub-~100 standalone personas this feature
 * realistically holds, but if the directory ever grows large the right answer
 * is server-side filtering + infinite scroll, not more (parallel) pages here.
 * Because it's a fetch-once set, the query carries an infinite `staleTime` so
 * revisiting the directory reuses the cache instead of re-walking every page.
 */
export function useSubprofileDirectory() {
  const { demoMode } = useDemoMode();
  return useQuery<SubprofileCardDTO[]>({
    queryKey: ["subprofiles", "directory", demoMode],
    // A fetch-once, filter-locally set: it never goes stale on its own, so
    // navigating away and back never triggers a fresh page-walk.
    staleTime: Infinity,
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { mockDirectory } = await import("../data/subprofiles.data");
        return mockDirectory();
      }
      const firstPage = await getSubprofileDirectory(
        { page: 1, limit: DIRECTORY_PAGE_LIMIT },
        signal,
      );
      const items = [...firstPage.items];
      // `total` is the full standalone count. If the backend omits it, the
      // first page is all we can know about — stop there rather than loop.
      const total = firstPage.total ?? items.length;
      let page = 1;
      while (items.length < total && page < DIRECTORY_MAX_PAGES) {
        page += 1;
        const nextPage = await getSubprofileDirectory(
          { page, limit: DIRECTORY_PAGE_LIMIT },
          signal,
        );
        // Defensive: an empty page means there's nothing more to collect, even
        // if `total` overshot — never keep requesting past the real end.
        if (nextPage.items.length === 0) break;
        items.push(...nextPage.items);
      }
      return items;
    },
  });
}
