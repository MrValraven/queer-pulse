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
  "playlists",
] as const;
export type StudioSearchType = (typeof STUDIO_SEARCH_TYPES)[number];

// Studio v2 vocabularies (QUEERPULSE-STUDIO-V2-CONTRACT-2026-10-13.md).
export const STUDIO_PLAYLIST_VISIBILITIES = [
  "public",
  "connections",
  "private",
] as const;
export type StudioPlaylistVisibility =
  (typeof STUDIO_PLAYLIST_VISIBILITIES)[number];

/** Counts from 1 to 4 are withheld on "Your numbers". */
export const STUDIO_STATS_THRESHOLD = 5;

export const STUDIO_PLAYLIST_LIMITS = {
  nameMax: 80,
  descriptionMax: 500,
  playlistsPerMember: 100,
  tracksPerPlaylist: 500,
  tracksPerAdd: 50,
  playlistsPerPage: 24,
  trackPlaylistsMax: 6,
} as const;

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
  "studio_playlist_limit",
  "studio_playlist_track_limit",
  "studio_playlist_order_mismatch",
  "studio_playlist_credit_not_allowed",
  "studio_playlist_track_unavailable",
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
  /** v2: when the release went live; null for a draft. Lists arrive ordered
   *  by it (published_at desc, id desc). */
  publishedAt: string | null;
  /** v2: on every card (was release-only). */
  genre: string | null;
}

export interface StudioReleaseDTO extends StudioReleaseCardDTO {
  description: string | null;
  status: StudioReleaseStatus;
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
  /** v2: shown as is; already public on persona pages. */
  followerCount: number;
  /** v2: the viewer's own follow state. */
  isFollowing: boolean;
  /** v2: public playlists credited to this persona, newest updated first,
   *  at most 24. */
  playlists: StudioPlaylistCardDTO[];
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
  tracks: StudioPlaylistTrackDTO[];
  artists: StudioArtistRefDTO[];
  /** v2: public playlists only; [] unless the type is all or playlists. */
  playlists: StudioPlaylistCardDTO[];
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

// ── Studio v2: playlists, genres, stats ───────────────────────────────────

/** A member credit; `slug` addresses the member's profile (/members/<slug>). */
export interface StudioPlaylistMemberDTO {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl: string | null;
}

/** Who a playlist shows as. Exactly one of persona and member is set. */
export interface StudioPlaylistCreditDTO {
  persona: StudioArtistRefDTO | null;
  member: StudioPlaylistMemberDTO | null;
}

export interface StudioPlaylistCardDTO {
  id: string;
  name: string;
  credit: StudioPlaylistCreditDTO;
  /** Up to four distinct release covers, in playlist order. */
  coverUrls: string[];
  /** Tracks this viewer can play. */
  trackCount: number;
  totalDurationSeconds: number;
  updatedAt: string;
  isOwner: boolean;
  /** Owner only; null for everyone else. */
  visibility: StudioPlaylistVisibility | null;
}

export type StudioPlaylistTrackDTO = StudioTrackSummaryDTO & {
  release: StudioReleaseCardDTO;
};

export interface StudioPlaylistEntryDTO {
  entryId: string;
  /** 1-based and contiguous across every entry the response carries. */
  position: number;
  addedAt: string;
  /** False only ever reaches the owner. */
  isAvailable: boolean;
  /** Null when the entry is unavailable. */
  track: StudioPlaylistTrackDTO | null;
}

export interface StudioPlaylistDTO extends StudioPlaylistCardDTO {
  description: string | null;
  /** Viewers get available entries only, renumbered 1..n. */
  entries: StudioPlaylistEntryDTO[];
  /** Owner only. */
  creditSubprofileId: string | null;
}

/** Slugs from STUDIO_GENRES with at least one listenable published
 *  release, in list order. */
export interface StudioGenresDTO {
  genres: string[];
}

/** `value` is null when the count is 1 to 4. */
export interface StudioCountDTO {
  value: number | null;
  isBelowThreshold: boolean;
}

export interface StudioStatsTrackDTO {
  track: StudioTrackSummaryDTO;
  saves: StudioCountDTO;
  playlistInclusions: StudioCountDTO;
}

export interface StudioStatsReleaseDTO {
  release: StudioReleaseCardDTO & { status: StudioReleaseStatus };
  saves: StudioCountDTO;
  /** Distinct PUBLIC playlists containing any of its tracks. */
  playlistInclusions: StudioCountDTO;
  tracks: StudioStatsTrackDTO[];
}

export interface StudioArtistStatsDTO {
  subprofileId: string;
  followerCount: number;
  /** Published first (published_at desc), then the others. */
  releases: StudioStatsReleaseDTO[];
}

export interface CreateStudioPlaylistBody {
  name: string;
  description?: string;
  visibility: StudioPlaylistVisibility;
  creditSubprofileId?: string;
}

/** `creditSubprofileId: null` clears a persona credit (shown as the member). */
export interface UpdateStudioPlaylistBody {
  name?: string;
  description?: string;
  visibility?: StudioPlaylistVisibility;
  creditSubprofileId?: string | null;
}
