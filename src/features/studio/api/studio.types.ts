// Studio v1 wire contract (QUEERPULSE-STUDIO-V1-CONTRACT-2026-10-08.md).
// The vocabularies are the same strings the backend uses; keep them in step.

export const STUDIO_ARTIST_PERSONA_KINDS = ["musician", "dj"] as const;
export type StudioArtistPersonaKind =
  (typeof STUDIO_ARTIST_PERSONA_KINDS)[number];

export const STUDIO_RELEASE_TYPES = ["album", "ep", "single", "mix"] as const;
export type StudioReleaseType = (typeof STUDIO_RELEASE_TYPES)[number];

export const STUDIO_RELEASE_STATUSES = [
  "draft",
  "published",
  "taken_down",
] as const;
export type StudioReleaseStatus = (typeof STUDIO_RELEASE_STATUSES)[number];

export const STUDIO_AUDIO_CONTENT_TYPES = ["audio/mpeg", "audio/mp4"] as const;
export type StudioAudioContentType =
  (typeof STUDIO_AUDIO_CONTENT_TYPES)[number];

export const STUDIO_SEARCH_TYPES = [
  "all",
  "releases",
  "tracks",
  "artists",
] as const;
export type StudioSearchType = (typeof STUDIO_SEARCH_TYPES)[number];

export const STUDIO_GENRES = [
  "fado",
  "electronic",
  "folk",
  "experimental",
  "pop",
  "hip-hop",
  "r-and-b",
  "rock",
  "jazz",
  "classical",
  "ambient",
  "other",
] as const;
export type StudioGenre = (typeof STUDIO_GENRES)[number];

/** `mix` belongs to DJ personas; album, EP and single to musicians. The
 *  first entry is the upload form's default. */
export const STUDIO_RELEASE_TYPES_BY_KIND: Record<
  StudioArtistPersonaKind,
  readonly StudioReleaseType[]
> = {
  musician: ["album", "ep", "single"],
  dj: ["mix"],
};

export const STUDIO_LIMITS = {
  titleMax: 120,
  descriptionMax: 2000,
  lyricsMax: 10000,
  creditsMax: 20,
  creditFieldMax: 80,
  audioMaxBytes: 52428800,
  releasesPerPage: 24,
  searchPerType: 20,
  tracksPerReleaseMax: 50,
  searchQueryMax: 80,
  takedownReasonMax: 500,
} as const;

export const STUDIO_ERROR_CODES = [
  "studio_access_required",
  "studio_not_persona_owner",
  "studio_persona_kind_not_allowed",
  "studio_publish_missing_title",
  "studio_publish_missing_cover",
  "studio_publish_missing_rights",
  "studio_publish_missing_tracks",
  "studio_publish_tracks_pending",
  "studio_release_not_draft",
  "studio_release_type_mismatch",
  "studio_track_order_mismatch",
  "studio_track_limit",
  "studio_audio_unreadable",
  "studio_audio_wrong_owner",
] as const;
export type StudioErrorCode = (typeof STUDIO_ERROR_CODES)[number];

export interface StudioArtistRefDTO {
  /** The subprofile (persona) id. */
  id: string;
  /** For /p/<handle>; may be empty. */
  handle: string;
  name: string;
  kind: StudioArtistPersonaKind;
  avatarUrl: string | null;
}

export interface StudioCreditDTO {
  name: string;
  role: string;
}

export interface StudioTrackSummaryDTO {
  id: string;
  /** 1-based and contiguous. */
  position: number;
  title: string;
  /** Null until the audio upload is confirmed. */
  durationSeconds: number | null;
  isExplicit: boolean;
  hasAudio: boolean;
}

export interface StudioReleaseCardDTO {
  id: string;
  title: string;
  type: StudioReleaseType;
  coverUrl: string | null;
  /** YYYY-MM-DD. */
  releasedOn: string | null;
  trackCount: number;
  /** Sum of the tracks that have audio. */
  totalDurationSeconds: number;
  artist: StudioArtistRefDTO;
}

export interface StudioReleaseDTO extends StudioReleaseCardDTO {
  description: string | null;
  genre: string | null;
  status: StudioReleaseStatus;
  publishedAt: string | null;
  tracks: StudioTrackSummaryDTO[];
  isOwner: boolean;
  /** Owner-only; null for everyone else. */
  rightsConfirmedAt: string | null;
  /** Owner-only; null for everyone else. */
  takedownReason: string | null;
}

export interface StudioTrackDTO extends StudioTrackSummaryDTO {
  releaseId: string;
  credits: StudioCreditDTO[];
  lyrics: string | null;
  release: StudioReleaseCardDTO;
}

export interface StudioArtistDTO {
  artist: StudioArtistRefDTO & { bio: string | null; city: string | null };
  /** Published, newest first. */
  releases: StudioReleaseCardDTO[];
  /** Drafts and taken-down releases; null unless the viewer owns the persona. */
  ownerReleases:
    | (StudioReleaseCardDTO & {
        status: StudioReleaseStatus;
        takedownReason: string | null;
      })[]
    | null;
}

export interface StudioMeDTO {
  hasAccess: boolean;
  /** Empty when hasAccess is false. */
  uploadablePersonas: StudioArtistRefDTO[];
}

export interface StudioPageDTO<Item> {
  items: Item[];
  pageInfo: { nextCursor: string | null; hasMore: boolean };
}

export interface StudioSearchResultDTO {
  releases: StudioReleaseCardDTO[];
  tracks: (StudioTrackSummaryDTO & { release: StudioReleaseCardDTO })[];
  artists: StudioArtistRefDTO[];
}

/** A presigned GET, valid for 15 minutes. */
export interface StudioStreamDTO {
  url: string;
  expiresAt: string;
}

export interface StudioAccessGrantDTO {
  userId: string;
  grantedAt: string;
  grantedBy: { id: string; displayName: string } | null;
}

export interface CreateStudioReleaseBody {
  subprofileId: string;
  type: StudioReleaseType;
  title: string;
}

/** null clears description, genre and release date (contract delta, see
 *  "Decisions"); a cover can be replaced and never cleared in v1. */
export interface UpdateStudioReleaseBody {
  title?: string;
  type?: StudioReleaseType;
  description?: string | null;
  genre?: string | null;
  releasedOn?: string | null;
  coverKey?: string;
  rightsConfirmed?: true;
}

export interface CreateStudioTrackBody {
  title: string;
}

export interface UpdateStudioTrackBody {
  title?: string;
  credits?: StudioCreditDTO[];
  lyrics?: string | null;
  isExplicit?: boolean;
}
