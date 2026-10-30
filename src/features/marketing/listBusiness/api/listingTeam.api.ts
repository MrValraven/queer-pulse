import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../../shared/api/client";
import type {
  ApproveListingTeamRequestBody,
  InviteMemberToListingTeamBody,
  InviteToListingTeamBody,
  ListingTeamCandidatesDTO,
  ListingTeamListingCandidateDTO,
  ListingTeamManagerListDTO,
  ListingTeamManagerRowDTO,
  ListingTeamMemberLinkListDTO,
  ListingTeamMemberLinkRowDTO,
  ListingTeamMemberManagerRowDTO,
  ListingTeamPersonaCandidateDTO,
  ListingTeamPersonaListDTO,
  ListingTeamPersonaRowDTO,
  ReorderListingTeamBody,
  RequestToJoinListingTeamBody,
  UpdateListingTeamRoleLabelBody,
} from "./listingTeam.types";

/** Raw calls for "Meet the team". Every path segment is URL-encoded. */

const listingTeamPath = (listingRef: string) =>
  `/listings/${encodeURIComponent(listingRef)}/team`;
const personaTeamPath = (subprofileId: string) =>
  `/subprofiles/${encodeURIComponent(subprofileId)}`;
const MEMBER_TEAM_LINKS_PATH = "/me/team-links";

// Listing side

export const getListingTeam = (
  listingRef: string,
): Promise<ListingTeamManagerListDTO> =>
  apiGet<ListingTeamManagerListDTO>(listingTeamPath(listingRef));

export const searchListingTeamCandidates = (
  listingRef: string,
  query: string,
  signal?: AbortSignal,
): Promise<ListingTeamCandidatesDTO<ListingTeamPersonaCandidateDTO>> =>
  apiGet<ListingTeamCandidatesDTO<ListingTeamPersonaCandidateDTO>>(
    `${listingTeamPath(listingRef)}/candidates?q=${encodeURIComponent(query)}`,
    undefined,
    undefined,
    signal,
  );

export const inviteToListingTeam = (
  listingRef: string,
  body: InviteToListingTeamBody,
): Promise<ListingTeamManagerRowDTO> =>
  apiPost<ListingTeamManagerRowDTO>(
    `${listingTeamPath(listingRef)}/invites`,
    body,
  );

/** The invitee is a member picked from the caller's accepted connections. */
export const inviteMemberToListingTeam = (
  listingRef: string,
  body: InviteMemberToListingTeamBody,
): Promise<ListingTeamMemberManagerRowDTO> =>
  apiPost<ListingTeamMemberManagerRowDTO>(
    `${listingTeamPath(listingRef)}/member-invites`,
    body,
  );

export const approveListingTeamRequest = (
  listingRef: string,
  memberId: string,
  body: ApproveListingTeamRequestBody,
): Promise<ListingTeamManagerRowDTO> =>
  apiPost<ListingTeamManagerRowDTO>(
    `${listingTeamPath(listingRef)}/${encodeURIComponent(memberId)}/approve`,
    body,
  );

export const declineListingTeamRequest = (
  listingRef: string,
  memberId: string,
): Promise<void> =>
  apiPost<void>(
    `${listingTeamPath(listingRef)}/${encodeURIComponent(memberId)}/decline`,
  );

export const cancelListingTeamInvite = (
  listingRef: string,
  memberId: string,
): Promise<void> =>
  apiPost<void>(
    `${listingTeamPath(listingRef)}/${encodeURIComponent(memberId)}/cancel`,
  );

export const updateListingTeamRoleLabel = (
  listingRef: string,
  memberId: string,
  body: UpdateListingTeamRoleLabelBody,
): Promise<ListingTeamManagerRowDTO> =>
  apiPatch<ListingTeamManagerRowDTO>(
    `${listingTeamPath(listingRef)}/${encodeURIComponent(memberId)}`,
    body,
  );

export const reorderListingTeam = (
  listingRef: string,
  body: ReorderListingTeamBody,
): Promise<{ accepted: ListingTeamManagerRowDTO[] }> =>
  apiPut<{ accepted: ListingTeamManagerRowDTO[] }>(
    `${listingTeamPath(listingRef)}/order`,
    body,
  );

export const removeFromListingTeam = (
  listingRef: string,
  memberId: string,
): Promise<void> =>
  apiDelete<void>(
    `${listingTeamPath(listingRef)}/${encodeURIComponent(memberId)}`,
  );

// Persona side

export const getPersonaTeamLinks = (
  subprofileId: string,
): Promise<ListingTeamPersonaListDTO> =>
  apiGet<ListingTeamPersonaListDTO>(
    `${personaTeamPath(subprofileId)}/team-links`,
  );

export const searchPersonaTeamListingCandidates = (
  subprofileId: string,
  query: string,
  signal?: AbortSignal,
): Promise<ListingTeamCandidatesDTO<ListingTeamListingCandidateDTO>> =>
  apiGet<ListingTeamCandidatesDTO<ListingTeamListingCandidateDTO>>(
    `${personaTeamPath(subprofileId)}/team-links/candidates?q=${encodeURIComponent(query)}`,
    undefined,
    undefined,
    signal,
  );

export const requestToJoinListingTeam = (
  subprofileId: string,
  body: RequestToJoinListingTeamBody,
): Promise<ListingTeamPersonaRowDTO> =>
  apiPost<ListingTeamPersonaRowDTO>(
    `${personaTeamPath(subprofileId)}/team-links/requests`,
    body,
  );

export const acceptListingTeamInvite = (
  subprofileId: string,
  linkId: string,
): Promise<ListingTeamPersonaRowDTO> =>
  apiPost<ListingTeamPersonaRowDTO>(
    `${personaTeamPath(subprofileId)}/team-links/${encodeURIComponent(linkId)}/accept`,
  );

export const declineListingTeamInvite = (
  subprofileId: string,
  linkId: string,
): Promise<void> =>
  apiPost<void>(
    `${personaTeamPath(subprofileId)}/team-links/${encodeURIComponent(linkId)}/decline`,
  );

export const cancelListingTeamRequest = (
  subprofileId: string,
  linkId: string,
): Promise<void> =>
  apiPost<void>(
    `${personaTeamPath(subprofileId)}/team-links/${encodeURIComponent(linkId)}/cancel`,
  );

export const leaveListingTeam = (
  subprofileId: string,
  linkId: string,
): Promise<void> =>
  apiDelete<void>(
    `${personaTeamPath(subprofileId)}/team-links/${encodeURIComponent(linkId)}`,
  );

// Member side (`/me/team-links`)

export const getMemberTeamLinks = (): Promise<ListingTeamMemberLinkListDTO> =>
  apiGet<ListingTeamMemberLinkListDTO>(MEMBER_TEAM_LINKS_PATH);

export const acceptMemberTeamLink = (
  linkId: string,
): Promise<ListingTeamMemberLinkRowDTO> =>
  apiPost<ListingTeamMemberLinkRowDTO>(
    `${MEMBER_TEAM_LINKS_PATH}/${encodeURIComponent(linkId)}/accept`,
  );

export const declineMemberTeamLink = (linkId: string): Promise<void> =>
  apiPost<void>(
    `${MEMBER_TEAM_LINKS_PATH}/${encodeURIComponent(linkId)}/decline`,
  );

export const leaveMemberTeamLink = (linkId: string): Promise<void> =>
  apiDelete<void>(`${MEMBER_TEAM_LINKS_PATH}/${encodeURIComponent(linkId)}`);
