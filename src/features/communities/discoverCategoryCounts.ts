import type { CommunityBrowseFacets } from "./api/communities.api";
import type { CommunityType } from "../homepage/data/types";
import { FILTERS } from "./communitiesDiscover.data";

/** Category row → how many communities picking it would give. A row MISSING
 *  from this map was not counted (first page in flight, a failed read, or a
 *  server that predates the facet), so the UI shows the label alone and keeps
 *  the row enabled. */
export type DiscoverCategoryCounts = Partial<
  Record<"all" | CommunityType, number>
>;

/**
 * The Category rows' counts, read off the browse's own `facets`: the server
 * (or the demo mirror in `useCommunities`) counts each type under the search,
 * both quick filters and the tags, with the `type` filter itself lifted. So a
 * row answers "how many would I get if I switched to this category", and its
 * number follows every other filter the member applies.
 *
 * "All communities" is `allTypes`, the lifted base's distinct total. Each
 * community has one type, so it equals the sum of the rows below it.
 */
export function toDiscoverCategoryCounts(
  facets: CommunityBrowseFacets | undefined,
): DiscoverCategoryCounts {
  const counts: DiscoverCategoryCounts = {};
  for (const option of FILTERS) {
    const count =
      option.value === "all" ? facets?.allTypes : facets?.types?.[option.value];
    if (count !== undefined) counts[option.value] = count;
  }
  return counts;
}
