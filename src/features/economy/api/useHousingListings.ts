import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { HOUSING_LISTINGS, type HousingListing } from "../housingListings";
import {
  EMPTY_HOUSING_FILTERS,
  matchesHousingFilters,
  type HousingFilters,
} from "../housingFilters";
import { getHousingListings } from "./housingListing.api";
import { listingDtoToHousingListing } from "./housingListing.adapters";

const HOUSING_LISTINGS_KEY = "housing-listings";

interface HousingListingsPageVM {
  items: HousingListing[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * The housing board, paginated. Demo returns the colocated fixture (filtered
 * client-side by the same criteria the backend applies) as a single synthetic
 * page and never hits the network; live queries the member-only directory with
 * the filters as server-side query params, one page at a time.
 *
 * Paginated because the board previously read `page.items` from page 1 only and
 * dropped `total`: past the first server page, listings silently vanished from
 * both the grid and the map's neighbourhood clusters with nothing on screen to
 * say so. `hasNextPage`/`fetchNextPage` back the grid's "Load more" control.
 * An empty array is still an honest live state (empty board).
 */
export function useHousingListings(
  filters: HousingFilters = EMPTY_HOUSING_FILTERS,
) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const query = useInfiniteQuery<HousingListingsPageVM>({
    // The full filter set is part of the key so demo + live both refetch/
    // re-derive when any filter changes; demoMode keeps the two caches apart.
    // `language` joins them because the adapter resolves each card's beds chip
    // and rent through `t`/`fmt`.
    queryKey: [HOUSING_LISTINGS_KEY, demoMode, filters, language],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        // One synthetic page holding the whole fixture: `page * pageSize`
        // equals `total`, so `getNextPageParam` yields undefined and demo
        // mode never issues a page-2 fetch.
        const items = HOUSING_LISTINGS.filter((listing) =>
          matchesHousingFilters(listing, filters),
        );
        return { items, total: items.length, page: 1, pageSize: items.length };
      }
      const listingPage = await getHousingListings({
        ...filters,
        page: pageParam as number,
      });
      return {
        items: listingPage.items.map((listingDto) =>
          listingDtoToHousingListing(listingDto, t, fmt),
        ),
        total: listingPage.total,
        page: listingPage.page,
        pageSize: listingPage.pageSize,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
    // Keep the previous filter's results on screen while the new ones load, so
    // changing a chip doesn't blank the board.
    placeholderData: keepPreviousData,
  });
  const listings = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? listings.length;
  return { ...query, listings, total };
}
