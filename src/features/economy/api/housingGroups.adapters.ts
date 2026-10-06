import { initialsFromParts } from "../../../shared/lib/initials";
import { tintForSlug } from "../../../shared/api/refs";
import type {
  GroupListing,
  GroupListingPoster,
  MyGroupListing,
  VettedGroup,
} from "../housingGroups.data";
import type {
  GroupListingPosterDTO,
  HousingGroupDTO,
  MyGroupListingDTO,
  PublicGroupListingDTO,
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

/** The poster's name, initials and avatar tint, with the same helpers the
 *  member-listing lister block uses (`posterFrom`), so one person keeps one
 *  colour across housing (PRD-443). */
function groupListingPosterFrom(
  poster: GroupListingPosterDTO,
): GroupListingPoster {
  return {
    slug: poster.slug,
    firstName: poster.firstName.trim(),
    fullName: `${poster.firstName} ${poster.lastName}`.trim(),
    initials: initialsFromParts(poster.firstName, poster.lastName),
    tint: tintForSlug(poster.slug),
    ...(poster.avatarUrl ? { avatarUrl: poster.avatarUrl } : {}),
  };
}

/** Maps a group room. `poster` and `isOwnListing` are set only when the wire
 *  carried them, so the poster's own `MyGroupListingDTO` rows, which carry
 *  neither, map exactly as before. */
export function listingDtoToGroupListing(
  dto: PublicGroupListingDTO,
): GroupListing {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    neighbourhood: dto.neighbourhood,
    priceEuros: dto.priceEuros,
    accessibilityInfo: dto.accessibilityInfo,
    ...(dto.poster ? { poster: groupListingPosterFrom(dto.poster) } : {}),
    ...(dto.isOwnListing ? { isOwnListing: true } : {}),
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
    moderationState: dto.moderationState ?? null,
    decidedAt: dto.decidedAt,
    decisionReason: dto.decisionReason,
    createdAt: dto.createdAt,
  };
}
