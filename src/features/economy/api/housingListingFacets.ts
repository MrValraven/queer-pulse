import { BEDROOM_OPTIONS, FILTERS } from "../housing.data";
import { matchesHousingFilters, type HousingFilters } from "../housingFilters";
import { HOUSING_MUST_HAVE_OPTIONS } from "../housingFilterSections";
import type { HousingListing } from "../housingListings";
import type {
  HousingBoardFacets,
  HousingMustHaveFlag,
} from "./housingListing.api";

/** The neighbourhood key the facet counts use: the lowercased name, the same
 *  comparison the `areas` filter makes on both sides. */
export function housingAreaFacetKey(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Demo mode's stand-in for the live endpoint's `facets`, with the same
 * rules: each group is counted with its own filter lifted and every other
 * filter applied, through `matchesHousingFilters`, the one demo filter the
 * board itself runs. The bedroom thresholds nest, so "Any" is counted on its
 * own; a "Must have" flag is counted with it ticked on top of the others.
 */
export function countDemoHousingFacets(
  listings: readonly HousingListing[],
  filters: HousingFilters,
): HousingBoardFacets {
  const typeCounts: Record<string, number> = Object.fromEntries(
    FILTERS.filter((option) => option.value !== "all").map((option) => [
      option.value,
      0,
    ]),
  );
  let allTypesCount = 0;
  const areaCounts: Record<string, number> = {};
  const bedroomThresholds = BEDROOM_OPTIONS.filter(
    (option) => option.value !== "",
  ).map((option) => option.value);
  const bedroomCounts: Record<string, number> = Object.fromEntries(
    bedroomThresholds.map((threshold) => [threshold, 0]),
  );
  let allBedroomsCount = 0;
  const mustHaveFlags = HOUSING_MUST_HAVE_OPTIONS.map(([flag]) => flag);
  const mustHaveCounts = Object.fromEntries(
    mustHaveFlags.map((flag) => [flag, 0]),
  ) as Record<HousingMustHaveFlag, number>;

  const typeLiftedFilters = { ...filters, type: "all" };
  const areaLiftedFilters = { ...filters, areas: undefined, area: undefined };
  const bedroomsLiftedFilters = { ...filters, bedroomsMin: undefined };
  for (const listing of listings) {
    if (matchesHousingFilters(listing, typeLiftedFilters)) {
      allTypesCount += 1;
      typeCounts[listing.type] = (typeCounts[listing.type] ?? 0) + 1;
    }
    if (matchesHousingFilters(listing, areaLiftedFilters)) {
      const areaKey = housingAreaFacetKey(listing.hood);
      areaCounts[areaKey] = (areaCounts[areaKey] ?? 0) + 1;
    }
    if (matchesHousingFilters(listing, bedroomsLiftedFilters)) {
      allBedroomsCount += 1;
      for (const threshold of bedroomThresholds) {
        if (
          listing.bedrooms !== undefined &&
          listing.bedrooms >= Number(threshold)
        ) {
          bedroomCounts[threshold] = (bedroomCounts[threshold] ?? 0) + 1;
        }
      }
    }
    for (const flag of mustHaveFlags) {
      if (matchesHousingFilters(listing, { ...filters, [flag]: true })) {
        mustHaveCounts[flag] += 1;
      }
    }
  }

  return {
    type: typeCounts,
    allTypes: allTypesCount,
    areas: areaCounts,
    bedroomsMin: bedroomCounts,
    allBedrooms: allBedroomsCount,
    mustHave: mustHaveCounts,
  };
}

/** What a `FilterOptionRow` needs to draw its availability count. */
export interface HousingFacetRowState {
  count: number | undefined;
  isDisabled: boolean;
  isCountStale: boolean;
  ariaLabel: string;
}

/**
 * One sidebar row's count, dimming and spoken label. A count is undefined
 * while the first page is in flight, after it failed, and on a server that
 * predates the facets: that draws no number and never disables the row.
 * A zero disables the row (picking it could only empty the board), except
 * while it is checked, so it can be undone, and never for the option that
 * only lifts its filter ("All", "Any"). A stale count, left over from the
 * previous filter run while the next one loads, is drawn dimmed and
 * disables nothing.
 */
export function housingFacetRowState({
  label,
  count,
  isChecked,
  isLiftOption = false,
  areFacetsStale,
  describeWithCount,
}: {
  label: string;
  count: number | undefined;
  isChecked: boolean;
  isLiftOption?: boolean;
  areFacetsStale: boolean;
  describeWithCount: (label: string, count: number) => string;
}): HousingFacetRowState {
  return {
    count,
    isDisabled: count === 0 && !isChecked && !isLiftOption && !areFacetsStale,
    isCountStale: areFacetsStale && count !== undefined,
    ariaLabel: count === undefined ? label : describeWithCount(label, count),
  };
}
