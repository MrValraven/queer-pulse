import type {
  GroupListing,
  MyGroupListing,
  VettedGroup,
} from "../housingGroups.data";
import type {
  GroupListingDTO,
  HousingGroupDTO,
  MyGroupListingDTO,
} from "./housingGroups.api";

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

/**
 * Map the poster's own listing row. The moderation fields come across as they
 * are: the state and the moderator's reason are the whole reason this surface
 * exists, so nothing here is smoothed over or defaulted away.
 */
export function myListingDtoToMyGroupListing(
  dto: MyGroupListingDTO,
): MyGroupListing {
  return {
    ...listingDtoToGroupListing(dto),
    status: dto.status,
    hidden: dto.hidden,
    hiddenReason: dto.hiddenReason,
    decidedAt: dto.decidedAt,
    decisionReason: dto.decisionReason,
    createdAt: dto.createdAt,
  };
}
