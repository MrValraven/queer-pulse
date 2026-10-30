import { businessPath, personaPath, routes } from "../../../../app/routeMap";
import { initialsFromName } from "../../../../shared/lib/initials";
import {
  personaNameBesideCraft,
  personaTitleName,
} from "../../../subprofiles/personaTitleName";
import {
  LISTING_TEAM_LIMITS,
  type ListingTeamCandidatesDTO,
  type ListingTeamListingCandidateDTO,
  type ListingTeamListingCandidateView,
  type ListingTeamListingDTO,
  type ListingTeamListingView,
  type ListingTeamManagerListDTO,
  type ListingTeamManagerListView,
  type ListingTeamManagerRowDTO,
  type ListingTeamManagerRowView,
  type ListingTeamMemberLinkListDTO,
  type ListingTeamMemberLinkListView,
  type ListingTeamMemberLinkRowDTO,
  type ListingTeamMemberLinkRowView,
  type ListingTeamMemberProfileDTO,
  type ListingTeamMemberProfileView,
  type ListingTeamMemberPublicDTO,
  type ListingTeamMemberView,
  type ListingTeamPersonaCandidateDTO,
  type ListingTeamPersonaCandidateView,
  type ListingTeamPersonaDTO,
  type ListingTeamPersonaListDTO,
  type ListingTeamPersonaListView,
  type ListingTeamPersonaRowDTO,
  type ListingTeamPersonaRowView,
  type ListingTeamPersonaView,
  type ListingWorksAtDTO,
  type ListingWorksAtView,
} from "./listingTeam.types";

/**
 * A persona still named after its craft ("Poet") shows its owner's name when
 * it is linked: titled "Owner Name | Poet" where the name stands alone, and
 * the owner's name alone where the craft already sits beside it. An unlinked
 * persona has no `ownerName` and keeps its display name everywhere.
 */
export function toListingTeamPersonaView(
  dto: ListingTeamPersonaDTO,
): ListingTeamPersonaView {
  const ownerName = dto.ownerName ?? null;
  const nameParts = { displayName: dto.displayName, kind: dto.kind, ownerName };
  const nameBesideCraft = personaNameBesideCraft(nameParts);
  return {
    id: dto.id,
    handle: dto.handle,
    displayName: dto.displayName,
    kind: dto.kind,
    kindLabelKey: `subprofiles:kind.${dto.kind}`,
    avatarUrl: dto.avatarUrl,
    ...(dto.avatarCrop ? { avatarCrop: dto.avatarCrop } : {}),
    ownerName,
    titleName: personaTitleName(nameParts),
    nameBesideCraft,
    initials: initialsFromName(nameBesideCraft, "?"),
    href: personaPath(dto.handle),
  };
}

export function toListingTeamListingView(
  dto: ListingTeamListingDTO,
): ListingTeamListingView {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    href: businessPath(dto.slug),
    imageUrl: dto.coverPhoto?.image ?? null,
    ...(dto.coverPhoto?.crop ? { imageFocus: dto.coverPhoto.crop } : {}),
    tint: dto.tint,
    initials: dto.av,
  };
}

/** A member's profile for a team slot. Initials come from the full name. */
export function toListingTeamMemberProfileView(
  dto: ListingTeamMemberProfileDTO,
): ListingTeamMemberProfileView {
  return {
    slug: dto.slug,
    name: dto.name,
    avatarUrl: dto.avatarUrl,
    ...(dto.avatarCrop ? { avatarCrop: dto.avatarCrop } : {}),
    initials: initialsFromName(dto.name, "?"),
    href: `${routes.members}/${dto.slug}`,
  };
}

/**
 * The public team, either kind, in the order the server sent. A missing
 * `kind` is a persona. An entry with no subject to show (a persona without a
 * handle, a member without a slug) is dropped.
 */
export function toListingTeamMemberViews(
  dtos: ListingTeamMemberPublicDTO[] | undefined,
): ListingTeamMemberView[] {
  if (!dtos) return [];
  const views: ListingTeamMemberView[] = [];
  for (const dto of dtos) {
    if (views.length >= LISTING_TEAM_LIMITS.acceptedPerListing) break;
    if (dto.kind === "member") {
      if (dto.member.slug === "") continue;
      views.push({
        kind: "member",
        member: toListingTeamMemberProfileView(dto.member),
        roleLabel: dto.roleLabel,
      });
      continue;
    }
    if (dto.persona.handle === "") continue;
    views.push({
      kind: "persona",
      persona: toListingTeamPersonaView(dto.persona),
      roleLabel: dto.roleLabel,
    });
  }
  return views;
}

export function toListingWorksAtViews(
  dtos: ListingWorksAtDTO[] | undefined,
): ListingWorksAtView[] {
  if (!dtos) return [];
  return dtos.slice(0, LISTING_TEAM_LIMITS.acceptedPerPersona).map((dto) => ({
    slug: dto.slug,
    name: dto.name,
    href: businessPath(dto.slug),
    imageUrl: dto.coverPhoto?.image ?? null,
    ...(dto.coverPhoto?.crop ? { imageFocus: dto.coverPhoto.crop } : {}),
    tint: dto.tint,
    initials: dto.av,
    roleLabel: dto.roleLabel,
  }));
}

export function toListingTeamManagerRowView(
  dto: ListingTeamManagerRowDTO,
): ListingTeamManagerRowView {
  const base = {
    id: dto.id,
    status: dto.status,
    initiatedBy: dto.initiatedBy,
    roleLabel: dto.roleLabel,
    position: dto.position,
    createdAt: dto.createdAt,
    answeredAt: dto.answeredAt,
  };
  if (dto.kind === "member") {
    return {
      ...base,
      kind: "member",
      member: dto.member ? toListingTeamMemberProfileView(dto.member) : null,
    };
  }
  return {
    ...base,
    kind: "persona",
    persona: dto.persona ? toListingTeamPersonaView(dto.persona) : null,
  };
}

export function toListingTeamManagerListView(
  dto: ListingTeamManagerListDTO,
): ListingTeamManagerListView {
  return {
    awaitingYouCount: dto.awaitingYouCount,
    requestsReceived: dto.requestsReceived.map(toListingTeamManagerRowView),
    invitesSent: dto.invitesSent.map(toListingTeamManagerRowView),
    accepted: dto.accepted.map(toListingTeamManagerRowView),
  };
}

export function toListingTeamPersonaRowView(
  dto: ListingTeamPersonaRowDTO,
): ListingTeamPersonaRowView {
  return {
    id: dto.id,
    status: dto.status,
    initiatedBy: dto.initiatedBy,
    roleLabel: dto.roleLabel,
    listing: toListingTeamListingView(dto.listing),
    isListingLive: dto.isListingLive,
    createdAt: dto.createdAt,
    answeredAt: dto.answeredAt,
  };
}

export function toListingTeamPersonaListView(
  dto: ListingTeamPersonaListDTO,
): ListingTeamPersonaListView {
  return {
    awaitingYouCount: dto.awaitingYouCount,
    invitesReceived: dto.invitesReceived.map(toListingTeamPersonaRowView),
    requestsSent: dto.requestsSent.map(toListingTeamPersonaRowView),
    accepted: dto.accepted.map(toListingTeamPersonaRowView),
  };
}

/** Member side: the invites waiting and the teams the member is on. */
export function toListingTeamMemberLinkRowView(
  dto: ListingTeamMemberLinkRowDTO,
): ListingTeamMemberLinkRowView {
  return toListingTeamPersonaRowView(dto);
}

export function toListingTeamMemberLinkListView(
  dto: ListingTeamMemberLinkListDTO,
): ListingTeamMemberLinkListView {
  return {
    awaitingYouCount: dto.awaitingYouCount,
    invitesReceived: dto.invitesReceived.map(toListingTeamMemberLinkRowView),
    accepted: dto.accepted.map(toListingTeamMemberLinkRowView),
  };
}

export function toPersonaCandidateViews(
  dto: ListingTeamCandidatesDTO<ListingTeamPersonaCandidateDTO>,
): ListingTeamPersonaCandidateView[] {
  return dto.items.map((item) => ({
    persona: toListingTeamPersonaView(item.persona),
    teamStatus: item.teamStatus,
  }));
}

export function toListingCandidateViews(
  dto: ListingTeamCandidatesDTO<ListingTeamListingCandidateDTO>,
): ListingTeamListingCandidateView[] {
  return dto.items.map((item) => ({
    listing: toListingTeamListingView(item.listing),
    teamStatus: item.teamStatus,
  }));
}

/**
 * One line, trimmed, at most `roleLabelMax` characters; blank becomes null.
 * Every line break the backend refuses (CR, LF, U+2028, U+2029, U+0085)
 * folds into one space.
 */
export function normalizeRoleLabel(raw: string): string | null {
  const oneLine = raw.replace(/\s*[\r\n\u2028\u2029\u0085]+\s*/g, " ").trim();
  if (oneLine === "") return null;
  return oneLine.slice(0, LISTING_TEAM_LIMITS.roleLabelMax);
}

export function normalizeCandidateQuery(
  raw: string,
  { shouldDropAt }: { shouldDropAt: boolean },
): string {
  const trimmed = raw.trim();
  return shouldDropAt && trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
}

export function isCandidateQueryReady(query: string): boolean {
  return (
    query.length >= LISTING_TEAM_LIMITS.queryMin &&
    query.length <= LISTING_TEAM_LIMITS.queryMax
  );
}
