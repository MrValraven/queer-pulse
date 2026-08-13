import type { GroupListing, VettedGroup } from "../housingGroups.data";
import type { GroupListingDTO, HousingGroupDTO } from "./housingGroups.api";

/** Map a live `HousingGroupDTO` to the `VettedGroup` view-model (no listings —
 *  those are fetched separately on the detail view). */
export function groupDtoToVettedGroup(dto: HousingGroupDTO): VettedGroup {
  return {
    id: dto.slug,
    name: dto.name,
    nameEm: dto.nameEm ?? undefined,
    city: dto.city,
    blurb: dto.blurb,
    isAccessGated: dto.isAccessGated,
    memberCount: dto.memberCount,
    norms: dto.norms,
    screeningQuestions: dto.screeningQuestions,
  };
}

export function listingDtoToGroupListing(dto: GroupListingDTO): GroupListing {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    neighbourhood: dto.neighbourhood,
    priceEuros: dto.priceEuros,
    accessibilityInfo: dto.accessibilityInfo,
  };
}
