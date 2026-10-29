import type { StudioArtistRefDTO } from "../../studio/api/studio.types";

// The Studio page staff surface's wire types, mirroring the backend's
// `AdminStudioLandingController`
// (QUEERPULSE-STUDIO-LANDING-V2-CONTRACT-2026-10-28.md, section 9).

/** Why a track cannot play on the page, in the server's check order. */
export type StudioLandingIneligibleReason =
  | "not_playable"
  | "persona_not_eligible"
  | "podcast"
  | "content_warnings"
  | "explicit"
  | "open_claim";

export type StudioLandingPhotoSlot = "hero" | "manifesto";

export interface AdminStudioStaffRefDTO {
  id: string;
  displayName: string;
}

export interface AdminStudioLandingTrackRefDTO {
  id: string;
  title: string;
  durationSeconds: number | null;
}

export interface AdminStudioLandingReleaseRefDTO {
  id: string;
  title: string;
  coverUrl: string | null;
}

export interface AdminStudioLandingPreviewDTO {
  id: string;
  status: "pending" | "approved" | "declined" | "withdrawn";
  position: number;
  track: AdminStudioLandingTrackRefDTO;
  release: AdminStudioLandingReleaseRefDTO;
  /** The release persona. */
  artist: StudioArtistRefDTO;
  ineligibleReason: StudioLandingIneligibleReason | null;
  /** Approved, eligible, and within the first 5 eligible approved rows. */
  isOnLanding: boolean;
  requestedBy: AdminStudioStaffRefDTO | null;
  requestedAt: string;
  /** Staff only: the persona member who took the latest owner action. */
  decidedBy: AdminStudioStaffRefDTO | null;
  decidedAt: string | null;
}

export interface AdminStudioLandingTrackOptionDTO {
  track: AdminStudioLandingTrackRefDTO;
  release: AdminStudioLandingReleaseRefDTO;
  artist: StudioArtistRefDTO;
  ineligibleReason: StudioLandingIneligibleReason | null;
  hasOpenPreview: boolean;
}

export interface AdminStudioLandingArtistCardDTO {
  id: string;
  artist: StudioArtistRefDTO;
  quote: string | null;
  position: number;
  consentedAt: string;
  createdBy: AdminStudioStaffRefDTO | null;
  /** The persona passes the landing's artist rule now. */
  isShown: boolean;
  isFoundingArtist: boolean;
}

export interface AdminStudioLandingPersonaOptionDTO {
  artist: StudioArtistRefDTO;
  isEligible: boolean;
  hasCard: boolean;
  isFoundingArtist: boolean;
}

export interface AdminStudioLandingPhotoDTO {
  slot: StudioLandingPhotoSlot;
  /** The stored landing-scoped key; a PUT that keeps the photo sends it back. */
  imageKey: string;
  url: string;
  altText: { en: string; pt: string };
  credit: string | null;
  consentedAt: string;
  updatedBy: AdminStudioStaffRefDTO | null;
}

export interface AdminStudioFoundingArtistDTO {
  id: string;
  artist: StudioArtistRefDTO;
  position: number;
  addedBy: AdminStudioStaffRefDTO | null;
  createdAt: string;
  /** The persona passes the landing's artist rule now. */
  isListed: boolean;
}

export interface AdminStudioLandingSettingsDTO {
  isFoundingShelfVisible: boolean;
}

export interface AdminStudioLandingDTO {
  /** Open rows (pending, approved) by position, then up to 30 decided rows,
   *  newest decision first. */
  previews: AdminStudioLandingPreviewDTO[];
  /** Position order. */
  artistCards: AdminStudioLandingArtistCardDTO[];
  photos: {
    hero: AdminStudioLandingPhotoDTO | null;
    manifesto: AdminStudioLandingPhotoDTO | null;
  };
  /** Position order. */
  foundingArtists: AdminStudioFoundingArtistDTO[];
  settings: AdminStudioLandingSettingsDTO;
}

export interface CreateAdminStudioLandingPreviewBody {
  trackId: string;
}
/** Every open preview exactly once. */
export interface ReorderAdminStudioLandingPreviewsBody {
  previewIds: string[];
}
export interface CreateAdminStudioLandingCardBody {
  subprofileId: string;
  /** Trimmed; empty or null stores no quote. */
  quote: string | null;
  hasConsent: boolean;
}
export interface UpdateAdminStudioLandingCardBody {
  /** A required key; null clears the quote. */
  quote: string | null;
  hasConsent: boolean;
}
/** Every card exactly once. */
export interface ReorderAdminStudioLandingCardsBody {
  cardIds: string[];
}
export interface PutAdminStudioLandingPhotoBody {
  /** A fresh `work-image` upload key, or the stored landing key to keep the
   *  photo. */
  imageKey: string;
  altTextEn: string;
  altTextPt: string;
  /** Blank sends null. */
  credit: string | null;
  hasConsent: boolean;
}
export interface AddAdminStudioFoundingArtistBody {
  subprofileId: string;
}
/** Every listed founding artist exactly once. */
export interface ReorderAdminStudioFoundingArtistsBody {
  foundingArtistIds: string[];
}
export type SetAdminStudioLandingSettingsBody = AdminStudioLandingSettingsDTO;
