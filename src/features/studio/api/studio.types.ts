// Studio v1 wire contract (QUEERPULSE-STUDIO-V1-CONTRACT-2026-10-08.md).
// The vocabularies are the same strings the backend uses; keep them in step.

// Studio artist kinds (QUEERPULSE-STUDIO-ARTIST-KINDS-DESIGN-2026-10-14.md).
export const STUDIO_FORMATS = [
  "music",
  "podcast",
  "spoken_word",
  "performance",
] as const;
export type StudioFormat = (typeof STUDIO_FORMATS)[number];

/** The one map from persona kind to Studio format. It mirrors
 *  STUDIO_FORMAT_BY_KIND in queerpulse-backend/src/studio/studio.constants.ts
 *  pair for pair and in the same order; scripts/check-work-taxonomy.mjs
 *  compares the two. Every list of Studio artist kinds derives from it. */
export const STUDIO_FORMAT_BY_KIND = {
  musician: "music",
  dj: "music",
  podcaster: "podcast",
  podcast_producer: "podcast",
  poet: "spoken_word",
  spoken_word: "spoken_word",
  drag: "performance",
  performer: "performance",
  dancer: "performance",
  voguer: "performance",
  burlesque: "performance",
} as const satisfies Record<string, StudioFormat>;

export type StudioArtistPersonaKind = keyof typeof STUDIO_FORMAT_BY_KIND;

/** Every persona kind that releases in Studio, in map order. */
export const STUDIO_ARTIST_PERSONA_KINDS = Object.keys(
  STUDIO_FORMAT_BY_KIND,
) as readonly StudioArtistPersonaKind[];

const STUDIO_ARTIST_KIND_SET: ReadonlySet<string> = new Set(
  STUDIO_ARTIST_PERSONA_KINDS,
);

export function isStudioArtistPersonaKind(
  kind: string,
): kind is StudioArtistPersonaKind {
  return STUDIO_ARTIST_KIND_SET.has(kind);
}

/** The Studio format of a persona kind, or null for a kind that does not
 *  release in Studio. */
export function studioFormatOfKind(kind: string): StudioFormat | null {
  return isStudioArtistPersonaKind(kind) ? STUDIO_FORMAT_BY_KIND[kind] : null;
}

export const STUDIO_RELEASE_TYPES = [
  "album",
  "ep",
  "single",
  "mix",
  "podcast",
  "edit",
  "lip_sync",
] as const;
export type StudioReleaseType = (typeof STUDIO_RELEASE_TYPES)[number];

export const STUDIO_RELEASE_STATUSES = [
  "draft",
  "scheduled",
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
  /** Liked songs: rows per page of `GET /studio/playlists/liked`. */
  likedTracksPerPage: 100,
} as const;

// Studio v3 artist tools vocabularies
// (QUEERPULSE-STUDIO-V3-ARTIST-TOOLS-CONTRACT-2026-10-13.md).
export const STUDIO_SUPPORT_PLATFORMS = [
  "bandcamp",
  "kofi",
  "patreon",
] as const;
export type StudioSupportPlatform = (typeof STUDIO_SUPPORT_PLATFORMS)[number];

export const STUDIO_SCHEDULE_MIN_LEAD_MINUTES = 15;
export const STUDIO_SCHEDULE_MAX_LEAD_DAYS = 365;
/** The server fills an empty releasedOn with the publish date in this zone.
 *  The member picks and reads times in their own zone. */
export const STUDIO_SCHEDULE_TIME_ZONE = "Europe/Lisbon";
export const STUDIO_VERSION_NOTE_MAX = 280;
export const STUDIO_BUY_URL_MAX = 1000;
export const STUDIO_PRESS = {
  pitchMax: 140,
  bioMax: 1500,
  featuredMax: 5,
  quotesMax: 3,
  quoteMax: 300,
  sourceMax: 80,
  contactMax: 1000,
  releasesShown: 6,
} as const;
/** A preview token as the server mints it. Anything else is a 404 without
 *  a request. */
export const STUDIO_PREVIEW_TOKEN_PATTERN = /^[0-9a-f]{64}$/;

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
  // Artist kinds: the default genre of poet and spoken word releases.
  "spoken-word",
  "other",
] as const;
export type StudioGenre = (typeof STUDIO_GENRES)[number];

// Studio discovery vocabularies (QUEERPULSE-STUDIO-DISCOVERY-CONTRACT-2026-10-13.md).
// Same strings and order as the backend's studio.constants.ts.
export const STUDIO_MOODS = [
  "late-night",
  "euphoric",
  "tender",
  "melancholy",
  "defiant",
  "dreamy",
  "slow-burn",
  "sweaty",
  "calm",
  "playful",
] as const;
export type StudioMood = (typeof STUDIO_MOODS)[number];

export const STUDIO_CREDIT_ROLES = [
  "featured",
  "producer",
  "co-writer",
  "mixing",
  "mastering",
  "remix",
  "cover-art",
  "other",
] as const;
export type StudioCreditRole = (typeof STUDIO_CREDIT_ROLES)[number];

export const STUDIO_CURATION_SHELVES = [
  "featured",
  "staff_picks",
  "new_this_week",
] as const;
export type StudioCurationShelf = (typeof STUDIO_CURATION_SHELVES)[number];

export const STUDIO_SCENE_STATUSES = ["active", "archived"] as const;
export type StudioSceneStatus = (typeof STUDIO_SCENE_STATUSES)[number];

export const STUDIO_PERSONA_CREDIT_STATUSES = [
  "pending",
  "accepted",
  "declined",
] as const;
export type StudioPersonaCreditStatus =
  (typeof STUDIO_PERSONA_CREDIT_STATUSES)[number];

/** Lowercase letters and digits in runs joined by single hyphens. */
export const STUDIO_SCENE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const STUDIO_DISCOVERY_LIMITS = {
  curationFeaturedMax: 1,
  /** staff_picks and new_this_week each. */
  curationShelfMax: 12,
  curationNoteMaxLength: 140,
  sceneNameMaxLength: 60,
  sceneCityMaxLength: 60,
  sceneBlurbMaxLength: 500,
  sceneSlugMinLength: 2,
  sceneSlugMaxLength: 60,
  sceneArtistsShown: 24,
  sceneUpcomingEvents: 6,
  sceneReleasesPerPage: 24,
  /** On top of the 20 free-text rows. */
  personaCreditsPerTrack: 20,
  creditHandleMaxLength: 60,
  creditInboxPerSection: 100,
  appearsOnPerPage: 24,
  relatedArtistsMax: 8,
  radioMaxItems: 300,
  adminSearchResults: 20,
  adminSearchQueryMaxLength: 80,
} as const;

/** The release types each persona kind can make, by format: music (album,
 *  EP and single for musicians, mix for DJs), podcast (the show only),
 *  spoken word (album, EP, single) and performance (edit, lip-sync mix).
 *  The first entry is the upload form's default. */
export const STUDIO_RELEASE_TYPES_BY_KIND: Record<
  StudioArtistPersonaKind,
  readonly StudioReleaseType[]
> = {
  musician: ["album", "ep", "single"],
  dj: ["mix"],
  podcaster: ["podcast"],
  podcast_producer: ["podcast"],
  poet: ["album", "ep", "single"],
  spoken_word: ["album", "ep", "single"],
  drag: ["edit", "lip_sync"],
  performer: ["edit", "lip_sync"],
  dancer: ["edit", "lip_sync"],
  voguer: ["edit", "lip_sync"],
  burlesque: ["edit", "lip_sync"],
};

/** Release types whose tracks credit their sources, and need at least one
 *  source on every track with audio to publish (spec 4.4). */
export const STUDIO_SOURCED_RELEASE_TYPES: readonly StudioReleaseType[] = [
  "edit",
  "lip_sync",
  "mix",
];

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
  /** Artist kinds: a podcast show holds more episodes than the track cap. */
  episodesPerShow: 500,
  searchQueryMax: 80,
  takedownReasonMax: 500,
  /** Artist kinds: a podcast-format persona's audio cap (250 MB). */
  audioMaxBytesPodcast: 262144000,
  /** Lyrics or transcript on podcast and spoken word tracks. */
  transcriptMax: 60000,
  notesMax: 4000,
  sourcesMax: 100,
  sourceFieldMax: 120,
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
  "studio_release_not_schedulable",
  "studio_release_needs_playable_track",
  "studio_release_no_changes",
  "studio_preview_not_available",
  "studio_preview_not_found",
  "studio_schedule_out_of_range",
  "studio_press_track_not_allowed",
  // Studio open pages: the withdrawn 410, the dispute refusals and the staff
  // decision refusals (PLAN-1 "Error codes added").
  "studio_release_withdrawn",
  "studio_release_not_taken_down",
  "studio_dispute_already_open",
  "studio_dispute_limit_reached",
  "studio_dispute_not_open",
  "studio_takedown_report_mismatch",
  "studio_takedown_report_not_open",
  // A staff restore of a release with an open dispute: it restores through
  // that dispute's uphold instead.
  "studio_release_has_open_dispute",
  "studio_radio_filter_required",
  "studio_scene_not_found",
  "studio_credit_candidate_not_found",
  "studio_credit_not_found",
  "studio_curation_shelf_full",
  "studio_curation_already_on_shelf",
  "studio_curation_order_mismatch",
  "studio_scene_slug_taken",
  "studio_scene_order_mismatch",
  "studio_credit_already_requested",
  "studio_credit_limit",
  "studio_credit_not_pending",
  "studio_credit_not_accepted",
  "studio_scene_not_available",
  "studio_curation_release_not_published",
  "studio_scene_event_not_pinnable",
  "studio_credit_persona_not_creditable",
  "studio_credit_self_persona",
  "studio_chapters_out_of_range",
  // Studio artist kinds (spec section 10).
  "studio_publish_missing_sources",
  "studio_episode_show_not_published",
  "studio_episode_already_published",
  "studio_episode_order_locked",
  "studio_not_a_podcast",
  "studio_episode_limit",
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
  /** Artist kinds. Optional so an older server and the v1 to v3 fixtures
   *  keep compiling; the adapter reads the persona kind when it is missing. */
  format?: StudioFormat;
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
  /** Artist kinds. When the episode went live; podcast episodes only. */
  publishedAt?: string | null;
  /** Artist kinds. True only on the owner's row of an unpublished episode. */
  isDraft?: boolean;
  /** Artist kinds. The show notes on one line, cut on a word at 200
   *  characters with "…"; null without notes. */
  notesExcerpt?: string | null;
  /** Listening: owner rows of GET /studio/releases/:id only (isOwner true).
   *  Listener and staff rows omit these keys entirely. */
  hasAnalysis?: boolean;
  /** Contract F.3: the stored measurements, for the editor's loudness note. */
  loudnessLufs?: number | null;
  peakDb?: number | null;
  syncedLyrics?: StudioSyncedLyricLine[] | null;
  chapters?: StudioChapter[] | null;
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
  /** Discovery: one of STUDIO_MOODS or null. Typed as a string so a value
   *  from a newer server reads as null in the adapter. */
  mood: string | null;
  /** Discovery: null when unset or when the scene is archived. */
  scene: StudioSceneRefDTO | null;
  /** Artist kinds: the persona's format, derived on the server at read time. */
  format?: StudioFormat;
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
  // Studio v3. Optional here so a frontend that ships before the backend,
  // and the v1/v2 fixtures, keep working; the adapters default every one.
  /** Set while scheduled. */
  publishAt?: string | null;
  buyUrl?: string | null;
  /** The persona's Bandcamp, Ko-fi and Patreon links, in persona order. */
  supportLinks?: StudioSupportLinkDTO[];
  /** 1 when no version rows exist. */
  version?: number;
  /** Newest first; [] for version 1. */
  versions?: StudioReleaseVersionDTO[];
  /** The viewer's Notify me state; false unless scheduled. */
  isReminderSet?: boolean;
  /** True only on GET /studio/previews/:token. */
  isPreview?: boolean;
  /** Owner only: tracks changed since the last version (or the publish). */
  hasUnnotedChanges?: boolean;
  /** Owner only. */
  previewToken?: string | null;
  /** Owner only. */
  previewLinkCreatedAt?: string | null;
  /** Open pages: the latest dispute, owners only (null for listeners and
   *  the staff view). The server sends it on every release response; it is
   *  optional here so fixtures written before it still compile, and the
   *  adapter reads a missing field as null. */
  dispute?: StudioReleaseDisputeDTO | null;
  /** True exactly when the caller owns the release, it is taken down, no
   *  dispute is open and fewer than 3 exist. Always sent; a missing field
   *  reads as false. */
  canDispute?: boolean;
  /** Discovery, owner only (null for everyone else). Kept while the scene is
   *  archived, so the editor can show the kept link. */
  sceneId: string | null;
  /** Discovery: the album page "Credits" summary, one row per persona. */
  personaCredits: StudioReleaseCreditSummaryDTO[];
}

export interface StudioTrackDTO extends StudioTrackSummaryDTO {
  releaseId: string;
  credits: StudioCreditDTO[];
  lyrics: string | null;
  /** Artist kinds. Show notes as written; null outside podcast tracks. */
  notes?: string | null;
  /** Artist kinds. Song credits on edit, lip-sync and mix tracks; [] else. */
  sources?: StudioSource[];
  /** Listening (contract A.3): the same for viewers and owners. */
  syncedLyrics: StudioSyncedLyricLine[] | null;
  chapters: StudioChapter[] | null;
  release: StudioReleaseCardDTO;
  /** Discovery: accepted credits to public personas only, in
   *  STUDIO_CREDIT_ROLES order then created_at. */
  personaCredits: StudioPersonaCreditPublicDTO[];
}

export interface StudioArtistDTO {
  artist: StudioArtistRefDTO & { bio: string | null; city: string | null };
  /** Published, newest first. */
  releases: StudioReleaseCardDTO[];
  /** Drafts, scheduled and taken-down releases; null unless the viewer owns
   *  the persona. */
  ownerReleases: StudioOwnerReleaseDTO[] | null;
  /** v2: shown as is; already public on persona pages. */
  followerCount: number;
  /** v2: the viewer's own follow state. */
  isFollowing: boolean;
  /** v2: public playlists credited to this persona, newest updated first,
   *  at most 24. */
  playlists: StudioPlaylistCardDTO[];
  /** v3: the persona's links on STUDIO_SUPPORT_PLATFORMS, persona order. */
  supportLinks?: StudioSupportLinkDTO[];
  /** v3: scheduled releases, soonest first, at most 6. */
  upcoming?: StudioUpcomingReleaseDTO[];
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

/** A presigned GET. Its lifetime is per track (contract A.2):
 *  min(max(900, durationSeconds + 600), 21600) seconds. */
export interface StudioStreamDTO {
  url: string;
  expiresAt: string;
  /** Exactly 200 integers from 0 to 255, or null before analysis. */
  waveformPeaks: number[] | null;
  /** One decimal. */
  loudnessLufs: number | null;
  /** One decimal. */
  peakDb: number | null;
}

/** What the player keeps of a stream: the analysis alone (the URL stays
 *  in memory with the player). */
export type StudioStreamAnalysis = Pick<
  StudioStreamDTO,
  "waveformPeaks" | "loudnessLufs" | "peakDb"
>;

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
  /** Discovery: null clears. */
  mood?: StudioMood | null;
  /** Discovery: null clears; a new value must be an active scene. */
  sceneId?: string | null;
  /** v3: https only, at most 1000 characters; null clears it. */
  buyUrl?: string | null;
}

export interface CreateStudioTrackBody {
  title: string;
}

export interface UpdateStudioTrackBody {
  title?: string;
  credits?: StudioCreditDTO[];
  lyrics?: string | null;
  isExplicit?: boolean;
  /** Artist kinds: podcast releases only; up to 4000 characters, null clears. */
  notes?: string | null;
  /** Artist kinds: up to 100 rows; [] clears (null is a 400). */
  sources?: StudioSource[];
  /** Listening (contract A.5): omitted means unchanged, null clears.
   *  loudnessLufs and peakDb travel together. */
  waveformPeaks?: number[] | null;
  loudnessLufs?: number | null;
  peakDb?: number | null;
  syncedLyrics?: StudioSyncedLyricLine[] | null;
  chapters?: StudioChapterInput[] | null;
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
  /** Owner only, with isAvailable false: set when the cause is a release
   *  takedown. Every other cause sends nothing. */
  unavailableReason?: StudioUnavailableReason;
}

/** One row of Liked songs (`GET /studio/playlists/liked`): the member's own
 *  `studio_track` save. `entryId` is the save's id, `addedAt` when it was
 *  made, and `position` runs 1-based and contiguous across pages. Every
 *  unavailable row reaches the member, since the list is only ever theirs. */
export interface StudioLikedTrackEntryDTO extends StudioPlaylistEntryDTO {
  /** The saved subject id, present on every row, available or not. */
  trackId: string;
  /** The title the member saved, shown when the track is unavailable. */
  savedTitle: string;
}

export interface StudioLikedTracksPageDTO extends StudioPageDTO<StudioLikedTrackEntryDTO> {
  /** Likes the member can play, across the whole list. */
  trackCount: number;
  /** Their total length. */
  totalDurationSeconds: number;
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
  /** v3: Notify me holders; scheduled releases only, null otherwise. */
  reminders?: StudioCountDTO | null;
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

// ── Studio open pages (QUEERPULSE-STUDIO-OPEN-DEMO-PAGES-DESIGN-2026-10-13.md) ──

/** Why a save or a playlist entry cannot be opened, when the server says. */
export type StudioUnavailableReason = "withdrawn";

/** The 410 a listener (staff included, on listener routes) gets for a
 *  taken-down release or any of its tracks. It names nothing: no title,
 *  cover, reason or id. */
export interface StudioWithdrawnErrorBody {
  statusCode: 410;
  code: "studio_release_withdrawn";
  /** "This release was withdrawn." */
  message: string;
  /** Added by the global exception filter. */
  error: "Gone";
}

export const STUDIO_DISPUTE_STATUSES = ["open", "upheld", "rejected"] as const;
export type StudioDisputeStatus = (typeof STUDIO_DISPUTE_STATUSES)[number];

export const STUDIO_DISPUTE_LIMITS = {
  noteMax: 1000,
  replyMax: 1000,
  perRelease: 3,
} as const;

/** An artist's dispute about a takedown. It names no member: the server
 *  checks ownership when it is filed and stores none. */
export interface StudioReleaseDisputeDTO {
  id: string;
  status: StudioDisputeStatus;
  note: string;
  staffReply: string | null;
  createdAt: string;
  decidedAt: string | null;
}

/** POST /studio/releases/:id/disputes */
export interface CreateStudioDisputeBody {
  note: string;
}

/** GET and PUT /me/studio-playback. GET answers the defaults without
 *  creating a row; PUT takes any subset, and null or out of range is a 400. */
export interface StudioPlaybackPreferencesDTO {
  autoplayNext: boolean;
  hideExplicit: boolean;
  /** Whole seconds, 0 (off) to STUDIO_CROSSFADE_MAX_SECONDS. */
  crossfadeSeconds: number;
}

export const STUDIO_CROSSFADE_MAX_SECONDS = 12;

/** What a member who never opened Studio settings gets, and what the player
 *  uses before the first read lands. */
export const DEFAULT_STUDIO_PLAYBACK: StudioPlaybackPreferencesDTO = {
  autoplayNext: true,
  hideExplicit: false,
  crossfadeSeconds: 0,
};

/** A release as the flag-review cards show it: the release card plus the
 *  takedown facts. */
export type StudioAdminReleaseSummaryDTO = StudioReleaseCardDTO & {
  status: StudioReleaseStatus;
  takedownReason: string | null;
  takenDownAt: string | null;
};

/** GET /admin/studio/disputes?status=open|upheld|rejected, newest first;
 *  also the 200 answer of uphold and reject. */
export interface StudioAdminDisputeDTO {
  id: string;
  status: StudioDisputeStatus;
  /** The artist's note. */
  note: string;
  staffReply: string | null;
  createdAt: string;
  decidedAt: string | null;
  release: StudioAdminReleaseSummaryDTO;
}

/** GET /admin/studio/releases?status=taken_down, newest takenDownAt first.
 *  `openDisputeId` names the open dispute, if any: restoring such a release
 *  goes through that dispute's uphold, which closes it too. */
export type StudioAdminWithdrawnReleaseDTO = StudioAdminReleaseSummaryDTO & {
  openDisputeId: string | null;
};

/** POST /admin/studio/releases/:id/takedown. Every takedown resolves every
 *  open studio_release report about the release; a named `reportId` must be
 *  one of them (422 studio_takedown_report_mismatch, 409
 *  studio_takedown_report_not_open). */
export interface StudioTakedownBody {
  reason: string;
  reportId?: string;
}

/** POST /admin/studio/disputes/:id/uphold and /reject */
export interface StudioDisputeDecisionBody {
  reply: string;
}

// ── Studio discovery: moods, curation, scenes, persona credits, radio ─────

export interface StudioSceneRefDTO {
  slug: string;
  name: string;
}

/** Moods with at least one listenable published release, in STUDIO_MOODS
 *  order. Counts stay off the wire. */
export interface StudioMoodsDTO {
  moods: string[];
}

/** One pick: the release card plus the staff note. */
export type StudioCuratedPickDTO = StudioReleaseCardDTO & {
  note: string | null;
};

export interface StudioCurationDTO {
  /** Null when empty or not listenable; the hero then uses the newest
   *  release. */
  featured: StudioCuratedPickDTO | null;
  staffPicks: StudioCuratedPickDTO[];
  newThisWeek: StudioCuratedPickDTO[];
}

export interface StudioSceneCardDTO {
  id: string;
  slug: string;
  name: string;
  city: string;
  coverUrl: string | null;
}

/** An upcoming event on a scene page. Field names follow EventSummary. */
export interface StudioSceneEventDTO {
  slug: string;
  title: string;
  startAt: string;
  endAt: string | null;
  timezone: string;
  venue: string | null;
  neighbourhood: string | null;
  isOnline: boolean;
  coverImageUrl: string | null;
}

export interface StudioSceneDTO extends StudioSceneCardDTO {
  blurb: string | null;
  /** Up to 24, newest release in the scene first. */
  artists: StudioArtistRefDTO[];
  /** Up to 6, soonest first. */
  upcomingEvents: StudioSceneEventDTO[];
}

/** Any persona kind; used by every credit shape. */
export interface StudioPersonaRefDTO {
  id: string;
  handle: string;
  name: string;
  /** Any subprofile kind value. */
  kind: string;
  avatarUrl: string | null;
  /** A musician or DJ persona that passes the listenable rule. */
  isListenable: boolean;
}

export interface StudioPersonaCreditPublicDTO {
  persona: StudioPersonaRefDTO;
  role: StudioCreditRole;
}

/** One row per persona, ordered by the first track that credits it. */
export interface StudioReleaseCreditSummaryDTO {
  persona: StudioPersonaRefDTO;
  /** Distinct, STUDIO_CREDIT_ROLES order. */
  roles: StudioCreditRole[];
}

/** The track editor's view of its own persona credits. */
export interface StudioPersonaCreditOwnerRowDTO {
  id: string;
  persona: StudioPersonaRefDTO;
  role: StudioCreditRole;
  status: StudioPersonaCreditStatus;
  /** False once the persona stops being public; the row stays removable. */
  isPersonaPublic: boolean;
  createdAt: string;
}

/** The preview card for an exact handle. */
export type StudioCreditCandidateDTO = StudioPersonaRefDTO;

export interface StudioCreditInboxRowDTO {
  id: string;
  role: StudioCreditRole;
  status: "pending" | "accepted";
  /** The release's persona. */
  requestingPersona: StudioPersonaRefDTO;
  /** The viewer's own persona. */
  creditedPersona: StudioPersonaRefDTO;
  track: { id: string; title: string };
  release: { id: string; title: string; coverUrl: string | null };
  createdAt: string;
  respondedAt: string | null;
}

export interface StudioCreditInboxDTO {
  /** Pending, newest first, at most 100. */
  requests: StudioCreditInboxRowDTO[];
  /** Accepted, newest responded_at first, at most 100. */
  accepted: StudioCreditInboxRowDTO[];
}

export interface StudioCreditPendingCountDTO {
  count: number;
}

export type StudioAppearsOnCardDTO = StudioReleaseCardDTO & {
  roles: StudioCreditRole[];
};

/** Everything the player needs for one queue item without a release read. */
export interface StudioRadioItemDTO {
  trackId: string;
  title: string;
  /** Always set: only tracks with confirmed audio are returned. */
  durationSeconds: number;
  isExplicit: boolean;
  releaseId: string;
  releaseTitle: string;
  coverUrl: string | null;
  artist: StudioArtistRefDTO;
}

/** Up to 300 items, in random server order. */
export interface StudioRadioDTO {
  items: StudioRadioItemDTO[];
}

export interface CreateStudioPersonaCreditBody {
  handle: string;
  role: StudioCreditRole;
}

/** Browser only: what a radio plays from. Exactly one filter, the way
 *  GET /studio/radio takes it. */
export type StudioRadioFilter =
  { kind: "genre"; value: StudioGenre } | { kind: "mood"; value: StudioMood };

// ── Studio v3: artist tools ───────────────────────────────────────────────

/** Same shape as the persona's SocialLinkDTO. */
export interface StudioSupportLinkDTO {
  platform: StudioSupportPlatform;
  urlOrHandle: string;
}

export interface StudioReleaseVersionDTO {
  version: number;
  note: string;
  createdAt: string;
}

export interface StudioUpcomingReleaseDTO extends StudioReleaseCardDTO {
  publishAt: string;
  isReminderSet: boolean;
}

export interface StudioOwnerReleaseDTO extends StudioReleaseCardDTO {
  status: StudioReleaseStatus;
  takedownReason: string | null;
  /** v3: set while scheduled. */
  publishAt?: string | null;
}

/** Draft or scheduled: the release (isPreview true). Published: the id of
 *  the normal release page. */
export type StudioPreviewResultDTO =
  | { release: StudioReleaseDTO; publishedReleaseId: null }
  | { release: null; publishedReleaseId: string };

export interface StudioPreviewLinkDTO {
  token: string;
  createdAt: string;
}

export interface StudioPressQuoteDTO {
  quote: string;
  source: string;
}

export interface StudioPressKitOwnerDTO {
  pitch: string | null;
  pressBio: string | null;
  /** Stored order, including ids no longer playable. */
  featuredTrackIds: string[];
  quotes: StudioPressQuoteDTO[];
  contact: string | null;
  /** Null when no press kit row exists yet. */
  updatedAt: string | null;
}

export interface StudioPressKitDTO {
  artist: StudioArtistRefDTO & { bio: string | null; city: string | null };
  /** For the QR code to /p/<handle>. */
  personaHandle: string;
  pitch: string | null;
  /** The press bio when set, else the persona bio. */
  bio: string | null;
  /** Chosen or fallback, playable only. */
  featuredTracks: StudioPlaylistTrackDTO[];
  isFeaturedFallback: boolean;
  /** The latest 6 published. */
  releases: StudioReleaseCardDTO[];
  quotes: StudioPressQuoteDTO[];
  contact: string | null;
  /** Every persona social link. */
  socialLinks: { platform: string; urlOrHandle: string }[];
  supportLinks: StudioSupportLinkDTO[];
  isOwner: boolean;
  owner: StudioPressKitOwnerDTO | null;
}

/** PUT /studio/artists/:id/press-kit: every key required, null or [] to
 *  clear. */
export interface UpdateStudioPressKitBody {
  pitch: string | null;
  pressBio: string | null;
  featuredTrackIds: string[];
  quotes: StudioPressQuoteDTO[];
  contact: string | null;
}

// ── Studio Listening (QUEERPULSE-STUDIO-LISTENING-CONTRACT-2026-10-13.md) ──

export const STUDIO_LISTENING_LIMITS = {
  waveformPeakCount: 200,
  waveformPeakMax: 255,
  loudnessLufsMin: -70,
  loudnessLufsMax: 0,
  peakDbMin: -60,
  peakDbMax: 3,
  syncedLyricsMax: 500,
  syncedLyricMsMax: 86_400_000,
  syncedLyricTextMax: 300,
  chaptersMax: 100,
  chapterTitleMax: 120,
  chapterArtistMax: 120,
} as const;

/** `ms`: integer from 0; an empty text is an instrumental gap. */
export interface StudioSyncedLyricLine {
  ms: number;
  text: string;
}

/** `startSeconds`: integer from 0; the first chapter starts at 0. */
export interface StudioChapter {
  startSeconds: number;
  title: string;
  artist: string | null;
}

/** A chapter as the PATCH body sends it: an empty or absent artist is
 *  stored as null. */
export interface StudioChapterInput {
  startSeconds: number;
  title: string;
  artist?: string | null;
}

/** The owner-only keys of a release's track rows. */
export type StudioOwnerTrackFields = Required<
  Pick<
    StudioTrackSummaryDTO,
    "hasAnalysis" | "loudnessLufs" | "peakDb" | "syncedLyrics" | "chapters"
  >
>;

// ── Studio artist kinds: podcasts, spoken word, performance audio ────────

/** One song an edit, lip-sync mix or mix uses. Free text, 1 to 120
 *  characters each. */
export interface StudioSource {
  title: string;
  artist: string;
}

/** GET /studio/formats: formats with published content, in map order. */
export interface StudioFormatsDTO {
  formats: string[];
}

/** One row of GET /studio/episodes/latest. The track is the full track
 *  read, with lyrics, synced lyrics and persona credits left empty. */
export interface StudioLatestEpisodeDTO {
  track: StudioTrackDTO;
  release: StudioReleaseCardDTO;
}

export interface StudioLatestEpisodesPageDTO {
  items: StudioLatestEpisodeDTO[];
  nextCursor: string | null;
}
