// Meet the team on business pages (QUEERPULSE-BUSINESS-TEAM-CONTRACT-2026-10-19.md).
// No shape here carries a user id or a member slug. The owner's name travels
// only for a linked persona (`ownerName`); an unlinked persona carries none.
import type { CropRect } from "../../../../shared/components/ui/cropGeometry";
import type { SubprofileKind } from "../../../subprofiles/api/subprofiles.api";
import type { CoverPhotoView } from "../../api/directory.api";
import type { Tint } from "../../directoryPlaces";

export const LISTING_TEAM_LIMITS = {
  acceptedPerListing: 40,
  pendingPerListing: 40,
  acceptedPerPersona: 10,
  pendingRequestsPerPersona: 10,
  cooldownDays: 14,
  roleLabelMax: 40,
  candidatesMax: 20,
  queryMin: 2,
  queryMax: 60,
  /** Public section: members shown before "Show all". */
  visibleBeforeFold: 8,
} as const;

export type ListingTeamStatus = "pending" | "accepted";
export type ListingTeamInitiatedBy = "listing" | "persona";
/** Which side a surface acts for, for the error copy. */
export type ListingTeamSide = "listing" | "persona";

export interface ListingTeamPersonaDTO {
  id: string;
  handle: string;
  displayName: string;
  kind: SubprofileKind;
  avatarUrl: string | null;
  avatarCrop?: CropRect;
  /** The owner member's name for a linked persona; null for an unlinked one. */
  ownerName: string | null;
}

export interface ListingTeamListingDTO {
  id: string;
  slug: string;
  name: string;
  cat: string;
  coverPhoto: CoverPhotoView | null;
  tint: Tint;
  av: string;
}

export interface ListingTeamManagerRowDTO {
  id: string;
  status: ListingTeamStatus;
  initiatedBy: ListingTeamInitiatedBy;
  roleLabel: string | null;
  position: number | null;
  persona: ListingTeamPersonaDTO | null;
  createdAt: string;
  answeredAt: string | null;
}

export interface ListingTeamManagerListDTO {
  awaitingYouCount: number;
  requestsReceived: ListingTeamManagerRowDTO[];
  invitesSent: ListingTeamManagerRowDTO[];
  accepted: ListingTeamManagerRowDTO[];
}

export interface ListingTeamPersonaRowDTO {
  id: string;
  status: ListingTeamStatus;
  initiatedBy: ListingTeamInitiatedBy;
  roleLabel: string | null;
  listing: ListingTeamListingDTO;
  isListingLive: boolean;
  createdAt: string;
  answeredAt: string | null;
}

export interface ListingTeamPersonaListDTO {
  awaitingYouCount: number;
  invitesReceived: ListingTeamPersonaRowDTO[];
  requestsSent: ListingTeamPersonaRowDTO[];
  accepted: ListingTeamPersonaRowDTO[];
}

export interface ListingTeamPersonaCandidateDTO {
  persona: ListingTeamPersonaDTO;
  teamStatus: ListingTeamStatus | null;
}
export interface ListingTeamListingCandidateDTO {
  listing: ListingTeamListingDTO;
  teamStatus: ListingTeamStatus | null;
}
export interface ListingTeamCandidatesDTO<Candidate> {
  items: Candidate[];
}

export interface ListingTeamMemberPublicDTO {
  persona: ListingTeamPersonaDTO;
  roleLabel: string | null;
}
export interface ListingWorksAtDTO {
  slug: string;
  name: string;
  cat: string;
  coverPhoto: CoverPhotoView | null;
  tint: Tint;
  av: string;
  roleLabel: string | null;
}

export interface InviteToListingTeamBody {
  subprofileId: string;
  roleLabel?: string | null;
}
export interface ApproveListingTeamRequestBody {
  roleLabel?: string | null;
}
export interface UpdateListingTeamRoleLabelBody {
  roleLabel: string | null;
}
export interface ReorderListingTeamBody {
  memberIds: string[];
}
export interface RequestToJoinListingTeamBody {
  listingId: string;
}

export const LISTING_TEAM_ERROR_CODES = [
  "listing_team_persona_not_found",
  "listing_team_listing_not_found",
  "listing_team_link_not_found",
  "listing_team_persona_ineligible",
  "listing_team_listing_not_live",
  "listing_team_already_pending",
  "listing_team_already_accepted",
  "listing_team_cooldown",
  "listing_team_full",
  "listing_team_pending_full",
  "listing_team_persona_full",
  "listing_team_persona_requests_full",
  "listing_team_not_pending",
  "listing_team_not_accepted",
  "listing_team_order_mismatch",
] as const;
export type ListingTeamErrorCode = (typeof LISTING_TEAM_ERROR_CODES)[number];

/** `ApiError.data` for every refusal above. */
export interface ListingTeamErrorBody {
  statusCode: number;
  code: ListingTeamErrorCode;
  message: string;
  /** `listing_team_already_pending` only. */
  initiatedBy?: ListingTeamInitiatedBy;
  /** `listing_team_cooldown` only, ISO. */
  retryAt?: string;
}

// ── View models (what every surface reads) ──────────────────────────────────

export interface ListingTeamPersonaView {
  id: string;
  handle: string;
  displayName: string;
  kind: SubprofileKind;
  /** `subprofiles:kind.<kind>`. */
  kindLabelKey: string;
  avatarUrl: string | null;
  avatarCrop?: CropRect;
  /** The owner member's name for a linked persona; null for an unlinked one. */
  ownerName: string | null;
  /**
   * For a slot that shows the name alone: "Owner Name | Poet" when the persona
   * is still named after its craft and linked (`personaTitleName`), else the
   * display name. Every aria-label and status line uses this one.
   */
  titleName: string;
  /**
   * For a slot that already shows the craft beside the name: the owner's name
   * alone for a craft-named linked persona (`personaNameBesideCraft`), else
   * the display name.
   */
  nameBesideCraft: string;
  /** Taken from `nameBesideCraft`: a Poet owned by Tiago Costa gives "TC". */
  initials: string;
  /** `personaPath(handle)`. */
  href: string;
}

export interface ListingTeamListingView {
  id: string;
  slug: string;
  name: string;
  /** `businessPath(slug)`. */
  href: string;
  imageUrl: string | null;
  imageFocus?: CropRect;
  tint: Tint;
  initials: string;
}

export interface ListingTeamMemberView {
  persona: ListingTeamPersonaView;
  roleLabel: string | null;
}

export interface ListingWorksAtView {
  slug: string;
  name: string;
  href: string;
  imageUrl: string | null;
  imageFocus?: CropRect;
  tint: Tint;
  initials: string;
  roleLabel: string | null;
}

export interface ListingTeamManagerRowView {
  id: string;
  status: ListingTeamStatus;
  initiatedBy: ListingTeamInitiatedBy;
  roleLabel: string | null;
  position: number | null;
  persona: ListingTeamPersonaView | null;
  createdAt: string;
  answeredAt: string | null;
}

export interface ListingTeamManagerListView {
  awaitingYouCount: number;
  requestsReceived: ListingTeamManagerRowView[];
  invitesSent: ListingTeamManagerRowView[];
  accepted: ListingTeamManagerRowView[];
}

export interface ListingTeamPersonaRowView {
  id: string;
  status: ListingTeamStatus;
  initiatedBy: ListingTeamInitiatedBy;
  roleLabel: string | null;
  listing: ListingTeamListingView;
  isListingLive: boolean;
  createdAt: string;
  answeredAt: string | null;
}

export interface ListingTeamPersonaListView {
  awaitingYouCount: number;
  invitesReceived: ListingTeamPersonaRowView[];
  requestsSent: ListingTeamPersonaRowView[];
  accepted: ListingTeamPersonaRowView[];
}

export interface ListingTeamPersonaCandidateView {
  persona: ListingTeamPersonaView;
  teamStatus: ListingTeamStatus | null;
}
export interface ListingTeamListingCandidateView {
  listing: ListingTeamListingView;
  teamStatus: ListingTeamStatus | null;
}
