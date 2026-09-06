import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  VETTED_GROUPS,
  type GroupListing,
  type GroupListingsGate,
  type VettedGroup,
} from "../housingGroups.data";
import {
  getGroupListings,
  getHousingGroup,
  groupMembershipStandingFrom,
} from "./housingGroups.api";
import {
  groupDtoToVettedGroup,
  listingDtoToGroupListing,
} from "./housingGroups.adapters";
import { economyKeys } from "./economyKeys";

/** What the listings half of the detail read came back with: the rooms, or the
 *  gate that stands between the reader and them. */
interface GroupListingsRead {
  listings: GroupListing[];
  gate?: GroupListingsGate;
}

/**
 * The listings half of the detail read, with the gate handled as an ANSWER.
 *
 * An access-gated group refuses this read to anyone it has not let in
 * (`GROUP_MEMBERSHIP_REQUIRED`, ENG-172). That refusal is expected and
 * informative, so it resolves into a gate the page can render rather than
 * rejecting: letting it throw would fail the whole `Promise.all`, and the
 * detail page would answer a perfectly real, perfectly public group page with
 * its "no such group" empty state. Every other failure still throws and is
 * still a failure.
 */
async function readGroupListings(slug: string): Promise<GroupListingsRead> {
  try {
    const listingDtos = await getGroupListings(slug);
    return { listings: listingDtos.map(listingDtoToGroupListing) };
  } catch (error) {
    const membershipStanding = groupMembershipStandingFrom(error);
    if (!membershipStanding) throw error;
    return { listings: [], gate: { membershipStanding } };
  }
}

/**
 * One group plus its visible listings, for the detail view. Demo mode reads the
 * colocated fixture (listings already embedded); live mode fetches the group and
 * its listings and stitches them together, so the detail view has one query to
 * await. Returns `null` when a live group slug is unknown.
 *
 * The group itself stays public whatever the listings answer, so a stranger
 * reading a gated group still gets its name, its blurb and its norms, and the
 * way in.
 */
export function useHousingGroup(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<VettedGroup | null>({
    queryKey: economyKeys.housingGroup(slug, demoMode),
    enabled: Boolean(slug),
    queryFn: async () => {
      if (demoMode) {
        return VETTED_GROUPS.find((group) => group.id === slug) ?? null;
      }
      const [dto, listingsRead] = await Promise.all([
        getHousingGroup(slug!),
        readGroupListings(slug!),
      ]);
      return {
        ...groupDtoToVettedGroup(dto),
        listings: listingsRead.listings,
        listingsGate: listingsRead.gate,
      };
    },
  });
}
