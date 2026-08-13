import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { VETTED_GROUPS, type VettedGroup } from "../housingGroups.data";
import { getGroupListings, getHousingGroup } from "./housingGroups.api";
import {
  groupDtoToVettedGroup,
  listingDtoToGroupListing,
} from "./housingGroups.adapters";

const HOUSING_GROUP_KEY = "housing-group";

/**
 * One group plus its visible listings, for the detail view. Demo mode reads the
 * colocated fixture (listings already embedded); live mode fetches the group and
 * its listings and stitches them together, so the detail view has one query to
 * await. Returns `null` when a live group slug is unknown.
 */
export function useHousingGroup(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<VettedGroup | null>({
    queryKey: [HOUSING_GROUP_KEY, slug, demoMode],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (demoMode) {
        return VETTED_GROUPS.find((group) => group.id === slug) ?? null;
      }
      const [dto, listingDtos] = await Promise.all([
        getHousingGroup(slug!),
        getGroupListings(slug!),
      ]);
      return {
        ...groupDtoToVettedGroup(dto),
        listings: listingDtos.map(listingDtoToGroupListing),
      };
    },
  });
}
