import type { ImageSlotTint } from "../../../shared/components/ui";
import { personaPath, routes } from "../../../app/routeMap";
import { initialsFromName } from "../../../shared/lib/initials";
import {
  socialDisplayLabel,
  socialHref,
  socialPlatform,
} from "../../../shared/social/socialPlatforms";
import type { FollowedPersonaDTO } from "../../subprofiles/api/subprofiles.api";
import {
  studioArtistPath,
  studioPlaylistPath,
  studioReleasePath,
  studioTrackPath,
} from "../studioPaths";
import { STUDIO_CREDIT_ROLE_LABEL_KEY } from "../studioDiscoveryLabels";
import type {
  StudioArtistDTO,
  StudioArtistPersonaKind,
  StudioArtistRefDTO,
  StudioArtistStatsDTO,
  StudioChapter,
  StudioCountDTO,
  StudioCreditDTO,
  StudioCreditRole,
  StudioDisputeStatus,
  StudioFormat,
  StudioFormatsDTO,
  StudioGenre,
  StudioGenresDTO,
  StudioLatestEpisodeDTO,
  StudioMeDTO,
  StudioMood,
  StudioPersonaCreditPublicDTO,
  StudioPersonaRefDTO,
  StudioPlaylistCardDTO,
  StudioPlaylistCreditDTO,
  StudioPlaylistDTO,
  StudioPlaylistEntryDTO,
  StudioPlaylistTrackDTO,
  StudioPlaylistVisibility,
  StudioPressKitDTO,
  StudioPreviewResultDTO,
  StudioReleaseCardDTO,
  StudioReleaseCreditSummaryDTO,
  StudioReleaseDTO,
  StudioReleaseDisputeDTO,
  StudioReleaseStatus,
  StudioReleaseType,
  StudioReleaseVersionDTO,
  StudioSceneRefDTO,
  StudioSearchResultDTO,
  StudioSource,
  StudioSupportLinkDTO,
  StudioSyncedLyricLine,
  StudioTrackDTO,
  StudioTrackSummaryDTO,
  StudioUnavailableReason,
  StudioUpcomingReleaseDTO,
} from "./studio.types";
import {
  STUDIO_ARTIST_PERSONA_KINDS,
  STUDIO_CREDIT_ROLES,
  STUDIO_FORMAT_BY_KIND,
  STUDIO_FORMATS,
  STUDIO_GENRES,
  STUDIO_MOODS,
  STUDIO_PRESS,
  STUDIO_SOURCED_RELEASE_TYPES,
  STUDIO_STATS_THRESHOLD,
  STUDIO_SUPPORT_PLATFORMS,
  isStudioArtistPersonaKind,
} from "./studio.types";

// View models every Studio page renders. Live and demo both reach the pages
// through these functions (demo builds wire-shaped DTOs from the mock files
// first), so a fix made here shows up in both modes at once.

export interface StudioArtistRefView {
  id: string;
  handle: string;
  name: string;
  kind: StudioArtistPersonaKind;
  kindLabelKey: string;
  /** Artist kinds: the persona's Studio format. */
  format: StudioFormat;
  avatarUrl: string | null;
  initials: string;
  tint: ImageSlotTint;
  /** The artist's Studio page. */
  href: string;
  /** The persona page, or null when the persona has no handle. */
  personaHref: string | null;
}

export interface StudioArtistDetailView extends StudioArtistRefView {
  bio: string | null;
  city: string | null;
}

export interface StudioReleaseCardView {
  id: string;
  title: string;
  type: StudioReleaseType;
  typeLabelKey: string;
  coverUrl: string | null;
  tint: ImageSlotTint;
  releasedOn: string | null;
  releaseYear: string | null;
  trackCount: number;
  totalDurationSeconds: number;
  artist: StudioArtistRefView;
  href: string;
  savedId: string;
  /** When the release went live; null for a draft. Lists arrive in the
   *  server's order (published_at desc, id desc) and are never re-sorted. */
  publishedAt: string | null;
  genre: string | null;
  genreLabelKey: string | null;
  /** Discovery: one mood per release; null when unset or unknown. */
  mood: StudioMood | null;
  /** Discovery: the release's scene; null when unset or archived. */
  scene: StudioSceneRefView | null;
  /** Artist kinds: the persona's format, the server's or read from its kind. */
  format: StudioFormat;
  /** A podcast show: its tracks are episodes. */
  isShow: boolean;
}

export interface StudioTrackRowView {
  id: string;
  position: number;
  title: string;
  durationSeconds: number | null;
  durationLabel: string | null;
  isExplicit: boolean;
  hasAudio: boolean;
  href: string;
  savedId: string;
  /** Artist kinds: when the episode went live; null for a draft and for
   *  every track outside a podcast release. The adapters always set these
   *  three; they stay optional for row literals built outside the adapters,
   *  where a missing value reads as null or false. */
  publishedAt?: string | null;
  /** Owner views only: an episode that is not live yet. */
  isDraft?: boolean;
  /** Artist kinds: the show notes on one line, cut at 200 characters. */
  notesExcerpt?: string | null;
}

export interface StudioSyncedLyricView {
  ms: number;
  text: string;
}

export interface StudioChapterView {
  startSeconds: number;
  title: string;
  artist: string | null;
  /** formatTrackTime(startSeconds). */
  timeLabel: string;
}

/** A release track row as its owner sees it in the release editor. */
export interface StudioOwnerTrackRowView extends StudioTrackRowView {
  /** Peaks, loudness and peak are all stored (the editor backfills the
   *  rest). */
  hasAnalysis: boolean;
  /** The stored measurements (contract F.3); null until measured. */
  loudnessLufs: number | null;
  peakDb: number | null;
  syncedLyrics: StudioSyncedLyricView[] | null;
  chapters: StudioChapterView[] | null;
}

export interface StudioReleaseDisputeView {
  id: string;
  status: StudioDisputeStatus;
  note: string;
  staffReply: string | null;
  createdAt: string;
  decidedAt: string | null;
}

/** An outbound link (support, social) as the cards render it. */
export interface StudioExternalLinkView {
  platform: string;
  /** The platform's name, e.g. "Bandcamp". */
  platformLabel: string;
  /** The handle or bare domain, e.g. "marianasol". */
  handleLabel: string;
  /** Null when the stored value cannot be a link. */
  href: string | null;
}

/** The release's own buy link and its label. */
export interface StudioBuyLinkView {
  href: string;
  labelKey: string;
}

export interface StudioReleaseVersionView {
  version: number;
  note: string;
  createdAt: string;
}

export interface StudioReleaseView extends StudioReleaseCardView {
  description: string | null;
  status: StudioReleaseStatus;
  statusLabelKey: string;
  isOwner: boolean;
  tracks: StudioTrackRowView[];
  /** The same rows with the owner-only listening fields; null unless the
   *  viewer owns the release. */
  ownerTracks: StudioOwnerTrackRowView[] | null;
  playableTrackCount: number;
  rightsConfirmedAt: string | null;
  takedownReason: string | null;
  /** Owner only: the latest dispute about a takedown, or null. */
  dispute: StudioReleaseDisputeView | null;
  /** Owner only: a dispute can be filed now (taken down, none open, under
   *  the cap). False for everyone else. */
  canDispute: boolean;
  /** Owner only: the scene the editor shows, kept while it is archived. */
  sceneId: string | null;
  /** Accepted credits to public personas, one row per persona. */
  personaCredits: StudioReleaseCreditSummaryView[];
  // Studio v3
  /** Set while scheduled; null otherwise. */
  publishAt: string | null;
  /** Scheduled: the page reads "Out {date} at {time}". */
  isUpcoming: boolean;
  /** The stored buy link as written (the owner's form reads it). */
  buyUrl: string | null;
  /** The buy link as it renders: https only, labelled by host. */
  buyLink: StudioBuyLinkView | null;
  supportLinks: StudioExternalLinkView[];
  /** 1 until the artist adds a version note. */
  version: number;
  /** Newest first; [] for version 1. */
  versions: StudioReleaseVersionView[];
  /** The note the release page shows under the hero; null for version 1. */
  latestVersion: StudioReleaseVersionView | null;
  /** The viewer asked to be told; false unless scheduled. */
  isReminderSet: boolean;
  /** Read through a private preview link. */
  isPreview: boolean;
  /** Owner only: tracks changed since the last version note. */
  hasUnnotedChanges: boolean;
  /** Owner only. */
  previewToken: string | null;
  /** Owner only. */
  previewLinkCreatedAt: string | null;
}

export interface StudioCreditView {
  name: string;
  role: string;
}

export interface StudioTrackView extends StudioTrackRowView {
  releaseId: string;
  credits: StudioCreditView[];
  /** Lyrics as written, split into stanzas of lines. Empty when none. */
  lyricStanzas: string[][];
  /** Artist kinds: show notes as written; null outside podcast tracks. */
  notes: string | null;
  /** Artist kinds: song credits on edit, lip-sync and mix tracks. */
  sources: StudioSource[];
  /** Timed lines in time order; null when the track has none. */
  syncedLyrics: StudioSyncedLyricView[] | null;
  /** Chapters in time order; null when the track has none. */
  chapters: StudioChapterView[] | null;
  release: StudioReleaseCardView;
  /** Accepted credits to public personas, shown before the free-text rows. */
  personaCredits: StudioPersonaCreditView[];
}

export interface StudioOwnerReleaseView extends StudioReleaseCardView {
  status: StudioReleaseStatus;
  statusLabelKey: string;
  takedownReason: string | null;
  /** Set while scheduled; null otherwise. */
  publishAt: string | null;
}

export interface StudioArtistView {
  artist: StudioArtistDetailView;
  /** Every published release in the server's order (published_at desc,
   *  id desc). Play all queues from this list as it stands. */
  allReleases: StudioReleaseCardView[];
  /** Albums, EPs and mixes, in the same order. */
  releases: StudioReleaseCardView[];
  singles: StudioReleaseCardView[];
  /** Drafts and taken-down releases; null unless the viewer owns the persona. */
  ownerReleases: StudioOwnerReleaseView[] | null;
  /** The viewer owns or co-owns the persona (the server sends ownerReleases). */
  isOwner: boolean;
  followerCount: number;
  isFollowing: boolean;
  /** Public playlists credited to this persona, newest updated first. */
  playlists: StudioPlaylistCardView[];
  /** The persona's Bandcamp, Ko-fi and Patreon links (Studio v3). */
  supportLinks: StudioExternalLinkView[];
  /** Scheduled releases, soonest first, at most 6. */
  upcoming: StudioUpcomingReleaseView[];
}

export interface StudioUpcomingReleaseView extends StudioReleaseCardView {
  publishAt: string;
  isReminderSet: boolean;
}

export interface StudioSearchTrackView extends StudioTrackRowView {
  release: StudioReleaseCardView;
}

export interface StudioSearchView {
  releases: StudioReleaseCardView[];
  tracks: StudioSearchTrackView[];
  artists: StudioArtistRefView[];
  playlists: StudioPlaylistCardView[];
  isEmpty: boolean;
}

export interface StudioMeView {
  hasAccess: boolean;
  uploadablePersonas: StudioArtistRefView[];
}

/** Musician and DJ keep Studio's own labels; the other kinds read the persona
 *  labels, exactly as the persona page shows them (spec 8). */
export const STUDIO_KIND_LABEL_KEY: Record<StudioArtistPersonaKind, string> = {
  musician: "studio:kind.musician",
  dj: "studio:kind.dj",
  podcaster: "subprofiles:kind.podcaster",
  podcast_producer: "subprofiles:kind.podcast_producer",
  poet: "subprofiles:kind.poet",
  spoken_word: "subprofiles:kind.spoken_word",
  drag: "subprofiles:kind.drag",
  performer: "subprofiles:kind.performer",
  dancer: "subprofiles:kind.dancer",
  voguer: "subprofiles:kind.voguer",
  burlesque: "subprofiles:kind.burlesque",
};

export const STUDIO_RELEASE_TYPE_LABEL_KEY: Record<StudioReleaseType, string> =
  {
    album: "studio:releaseType.album",
    ep: "studio:releaseType.ep",
    single: "studio:releaseType.single",
    mix: "studio:releaseType.mix",
    podcast: "studio:releaseType.podcast",
    edit: "studio:releaseType.edit",
    lip_sync: "studio:releaseType.lip_sync",
  };

export const STUDIO_FORMAT_LABEL_KEY: Record<StudioFormat, string> = {
  music: "studio:format.music",
  podcast: "studio:format.podcast",
  spoken_word: "studio:format.spoken_word",
  performance: "studio:format.performance",
};

export const STUDIO_RELEASE_STATUS_LABEL_KEY: Record<
  StudioReleaseStatus,
  string
> = {
  draft: "studio:releaseStatus.draft",
  scheduled: "studio:releaseStatus.scheduled",
  published: "studio:releaseStatus.published",
  taken_down: "studio:releaseStatus.taken_down",
};

/** The first four reuse the upload page's existing genre labels. */
export const STUDIO_GENRE_LABEL_KEY: Record<StudioGenre, string> = {
  fado: "studio:upload.metadata.genre.fado",
  electronic: "studio:upload.metadata.genre.electronic",
  folk: "studio:upload.metadata.genre.folk",
  experimental: "studio:upload.metadata.genre.experimental",
  pop: "studio:genre.pop",
  "hip-hop": "studio:genre.hipHop",
  "r-and-b": "studio:genre.rAndB",
  rock: "studio:genre.rock",
  jazz: "studio:genre.jazz",
  classical: "studio:genre.classical",
  ambient: "studio:genre.ambient",
  "spoken-word": "studio:genre.spokenWord",
  other: "studio:genre.other",
};

export const STUDIO_PLAYLIST_VISIBILITY_LABEL_KEY: Record<
  StudioPlaylistVisibility,
  string
> = {
  public: "studio:playlist.visibility.public",
  connections: "studio:playlist.visibility.connections",
  private: "studio:playlist.visibility.private",
};

export const STUDIO_PLAYLIST_VISIBILITY_HINT_KEY: Record<
  StudioPlaylistVisibility,
  string
> = {
  public: "studio:playlist.visibility.publicHint",
  connections: "studio:playlist.visibility.connectionsHint",
  private: "studio:playlist.visibility.privateHint",
};

const KNOWN_GENRES: ReadonlySet<string> = new Set(STUDIO_GENRES);
const ARTIST_KINDS: ReadonlySet<string> = new Set(STUDIO_ARTIST_PERSONA_KINDS);
const SUPPORT_PLATFORMS: ReadonlySet<string> = new Set(
  STUDIO_SUPPORT_PLATFORMS,
);
const UPCOMING_SHOWN = 6;

export function isStudioGenre(
  value: string | null | undefined,
): value is StudioGenre {
  return typeof value === "string" && KNOWN_GENRES.has(value);
}

export function genreLabelKeyOf(genre: string | null): string | null {
  return isStudioGenre(genre) ? STUDIO_GENRE_LABEL_KEY[genre] : null;
}

// ── Studio artist kinds ────────────────────────────────────────────────────

const KNOWN_FORMATS: ReadonlySet<string> = new Set(STUDIO_FORMATS);
const SOURCED_TYPES: ReadonlySet<string> = new Set(
  STUDIO_SOURCED_RELEASE_TYPES,
);

export function isStudioFormat(value: unknown): value is StudioFormat {
  return typeof value === "string" && KNOWN_FORMATS.has(value);
}

/** A persona kind's format; a kind this client does not know reads as music
 *  (the server only sends Studio artist kinds). */
export function formatOfKind(kind: string): StudioFormat {
  return isStudioArtistPersonaKind(kind)
    ? STUDIO_FORMAT_BY_KIND[kind]
    : "music";
}

/** Podcast and spoken word tracks carry a transcript where music carries
 *  lyrics (spec 5.4, 6.4). */
export function isTranscriptFormat(format: StudioFormat): boolean {
  return format === "podcast" || format === "spoken_word";
}

/** Edit, lip-sync and mix tracks credit the songs they use (spec 4.4). */
export function isSourcedReleaseType(type: StudioReleaseType): boolean {
  return SOURCED_TYPES.has(type);
}

/** Sources as written, trimmed; a row missing either field is left out. */
export function toSources(dtos: StudioSource[] | undefined): StudioSource[] {
  return (dtos ?? []).flatMap((source) => {
    const title = source.title.trim();
    const artist = source.artist.trim();
    return title && artist ? [{ title, artist }] : [];
  });
}

/** The server's formats in its order (map order); unknown values from a
 *  newer server are dropped so every chip has a label. */
export function toFormatList(dto: StudioFormatsDTO): StudioFormat[] {
  return dto.formats.filter(isStudioFormat);
}

// ── Studio discovery: moods, scene refs, persona credits ──────────────────

export interface StudioSceneRefView {
  slug: string;
  name: string;
}

export interface StudioPersonaRefView {
  id: string;
  handle: string;
  name: string;
  /** Any persona kind: a visual artist can take a cover art credit. */
  kind: string;
  avatarUrl: string | null;
  initials: string;
  tint: ImageSlotTint;
  /** A public musician or DJ persona with a Studio page. */
  isListenable: boolean;
  /** The Studio artist page for a listenable persona, the persona page for
   *  any other; null for a persona with no handle. */
  href: string | null;
}

export interface StudioPersonaCreditView {
  persona: StudioPersonaRefView;
  role: StudioCreditRole;
  roleLabelKey: string;
}

export interface StudioReleaseCreditSummaryView {
  persona: StudioPersonaRefView;
  /** Distinct, in STUDIO_CREDIT_ROLES order. */
  roles: StudioCreditRole[];
  roleLabelKeys: string[];
}

const KNOWN_MOODS: ReadonlySet<string> = new Set(STUDIO_MOODS);
const KNOWN_CREDIT_ROLES: ReadonlySet<string> = new Set(STUDIO_CREDIT_ROLES);

export function isStudioMood(
  value: string | null | undefined,
): value is StudioMood {
  return typeof value === "string" && KNOWN_MOODS.has(value);
}

export function isStudioCreditRole(
  value: string | null | undefined,
): value is StudioCreditRole {
  return typeof value === "string" && KNOWN_CREDIT_ROLES.has(value);
}

/** The roles of `roles` this client can name, in STUDIO_CREDIT_ROLES order. */
export function orderedCreditRoles(
  roles: readonly string[],
): StudioCreditRole[] {
  return STUDIO_CREDIT_ROLES.filter((role) => roles.includes(role));
}

export function toSceneRefView(
  dto: StudioSceneRefDTO | null,
): StudioSceneRefView | null {
  if (!dto || !dto.slug) return null;
  return { slug: dto.slug, name: dto.name };
}

export function toPersonaRefView(
  dto: StudioPersonaRefDTO,
): StudioPersonaRefView {
  let href: string | null = null;
  if (dto.isListenable) href = studioArtistPath(dto.id);
  else if (dto.handle) href = personaPath(dto.handle);
  return {
    id: dto.id,
    handle: dto.handle,
    name: dto.name,
    kind: dto.kind,
    avatarUrl: dto.avatarUrl,
    initials: initialsFromName(dto.name, "QP"),
    tint: tintForId(dto.id),
    isListenable: dto.isListenable,
    href,
  };
}

/** A credit whose role this client cannot name is left out, so every chip
 *  has a label. */
export function toPersonaCreditViews(
  dtos: StudioPersonaCreditPublicDTO[],
): StudioPersonaCreditView[] {
  return dtos.flatMap((dto) =>
    isStudioCreditRole(dto.role)
      ? [
          {
            persona: toPersonaRefView(dto.persona),
            role: dto.role,
            roleLabelKey: STUDIO_CREDIT_ROLE_LABEL_KEY[dto.role],
          },
        ]
      : [],
  );
}

export function toReleaseCreditSummaryViews(
  dtos: StudioReleaseCreditSummaryDTO[],
): StudioReleaseCreditSummaryView[] {
  return dtos.flatMap((dto) => {
    const roles = orderedCreditRoles(dto.roles);
    if (roles.length === 0) return [];
    return [
      {
        persona: toPersonaRefView(dto.persona),
        roles,
        roleLabelKeys: roles.map((role) => STUDIO_CREDIT_ROLE_LABEL_KEY[role]),
      },
    ];
  });
}

const PLACEHOLDER_TINTS: readonly ImageSlotTint[] = ["coral", "plum", "jade"];

/** Seconds to "4:18", or "1:04:12" from an hour up; null while the server
 *  has not read a duration. */
export function formatTrackTime(totalSeconds: number | null): string | null {
  if (
    totalSeconds === null ||
    !Number.isFinite(totalSeconds) ||
    totalSeconds < 0
  ) {
    return null;
  }
  const wholeSeconds = Math.floor(totalSeconds);
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const secondsLabel = String(wholeSeconds % 60).padStart(2, "0");
  if (hours === 0) return `${minutes}:${secondsLabel}`;
  return `${hours}:${String(minutes).padStart(2, "0")}:${secondsLabel}`;
}

/** A stable placeholder tint per id, so a cover-less card keeps its colour. */
export function tintForId(id: string): ImageSlotTint {
  let hash = 0;
  for (const character of id)
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return PLACEHOLDER_TINTS[hash % PLACEHOLDER_TINTS.length] ?? "coral";
}

/** Lyrics as the artist wrote them: stanzas split on blank lines. */
export function lyricStanzasOf(lyrics: string | null): string[][] {
  if (!lyrics) return [];
  return lyrics
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((stanza) => stanza.split("\n").map((line) => line.trimEnd()))
    .filter((lines) => lines.some((line) => line.trim().length > 0));
}

/** Synced lines in time order (the sort is stable, so lines that share a time
 *  keep their order); null when there are none. */
export function toSyncedLyricViews(
  lines: StudioSyncedLyricLine[] | null | undefined,
): StudioSyncedLyricView[] | null {
  if (!lines) return null;
  const views = lines
    .filter((line) => Number.isFinite(line.ms) && line.ms >= 0)
    .map((line) => ({ ms: Math.floor(line.ms), text: line.text }))
    .sort((left, right) => left.ms - right.ms);
  return views.length > 0 ? views : null;
}

/** Chapters in time order with a time label; an empty artist reads as none. */
export function toChapterViews(
  chapters: StudioChapter[] | null | undefined,
): StudioChapterView[] | null {
  if (!chapters) return null;
  const views = chapters
    .filter(
      (chapter) =>
        Number.isFinite(chapter.startSeconds) && chapter.startSeconds >= 0,
    )
    .map((chapter) => {
      const startSeconds = Math.floor(chapter.startSeconds);
      const artist = chapter.artist?.trim() ? chapter.artist : null;
      return {
        startSeconds,
        title: chapter.title,
        artist,
        timeLabel: formatTrackTime(startSeconds) ?? "0:00",
      };
    })
    .sort((left, right) => left.startSeconds - right.startSeconds);
  return views.length > 0 ? views : null;
}

/** Peaks from 0 to 255 as levels from 0 to 1 for the waveform scrubber;
 *  stray values are clamped. Null when there are none. */
export function toWaveform(
  peaks: number[] | null | undefined,
): number[] | null {
  if (!peaks || peaks.length === 0) return null;
  return peaks.map((peak) =>
    Number.isFinite(peak) ? Math.min(Math.max(peak, 0), 255) / 255 : 0,
  );
}

/** Saved ids follow the `${kind}:${id}` convention of `SavedItem.id`. */
export const studioSavedId = {
  release: (releaseId: string) => `studio_release:${releaseId}`,
  track: (trackId: string) => `studio_track:${trackId}`,
  playlist: (playlistId: string) => `studio_playlist:${playlistId}`,
};

export function toArtistRefView(dto: StudioArtistRefDTO): StudioArtistRefView {
  return {
    id: dto.id,
    handle: dto.handle,
    name: dto.name,
    kind: dto.kind,
    kindLabelKey: STUDIO_KIND_LABEL_KEY[dto.kind],
    format: isStudioFormat(dto.format) ? dto.format : formatOfKind(dto.kind),
    avatarUrl: dto.avatarUrl,
    initials: initialsFromName(dto.name, "QP"),
    tint: tintForId(dto.id),
    href: studioArtistPath(dto.id),
    personaHref: dto.handle ? personaPath(dto.handle) : null,
  };
}

/** "Artist · 2026" under a release; the year is dropped when unknown. */
export function releaseMetaLine(release: {
  artist: { name: string };
  releaseYear: string | null;
}): string {
  return [release.artist.name, release.releaseYear].filter(Boolean).join(" · ");
}

export function toReleaseCardView(
  dto: StudioReleaseCardDTO,
): StudioReleaseCardView {
  const artist = toArtistRefView(dto.artist);
  // Runtime guards: an older backend can omit the discovery fields.
  return {
    id: dto.id,
    title: dto.title,
    type: dto.type,
    typeLabelKey: STUDIO_RELEASE_TYPE_LABEL_KEY[dto.type],
    coverUrl: dto.coverUrl,
    tint: tintForId(dto.id),
    releasedOn: dto.releasedOn,
    releaseYear: dto.releasedOn ? dto.releasedOn.slice(0, 4) : null,
    trackCount: dto.trackCount,
    totalDurationSeconds: dto.totalDurationSeconds,
    artist,
    href: studioReleasePath(dto.id),
    savedId: studioSavedId.release(dto.id),
    publishedAt: dto.publishedAt,
    genre: dto.genre,
    genreLabelKey: genreLabelKeyOf(dto.genre),
    mood: isStudioMood(dto.mood) ? dto.mood : null,
    scene: toSceneRefView(dto.scene ?? null),
    format: isStudioFormat(dto.format) ? dto.format : artist.format,
    isShow: dto.type === "podcast",
  };
}

export function toTrackRowView(dto: StudioTrackSummaryDTO): StudioTrackRowView {
  return {
    id: dto.id,
    position: dto.position,
    title: dto.title,
    durationSeconds: dto.durationSeconds,
    durationLabel: formatTrackTime(dto.durationSeconds),
    isExplicit: dto.isExplicit,
    hasAudio: dto.hasAudio,
    href: studioTrackPath(dto.id),
    savedId: studioSavedId.track(dto.id),
    publishedAt: dto.publishedAt ?? null,
    isDraft: dto.isDraft === true,
    notesExcerpt: dto.notesExcerpt ?? null,
  };
}

/** An owner's release row; keys a server leaves out read as "not measured"
 *  and "none". */
export function toOwnerTrackRowView(
  dto: StudioTrackSummaryDTO,
): StudioOwnerTrackRowView {
  return {
    ...toTrackRowView(dto),
    hasAnalysis: dto.hasAnalysis ?? false,
    loudnessLufs: dto.loudnessLufs ?? null,
    peakDb: dto.peakDb ?? null,
    syncedLyrics: toSyncedLyricViews(dto.syncedLyrics),
    chapters: toChapterViews(dto.chapters),
  };
}

export function toReleaseDisputeView(
  dto: StudioReleaseDisputeDTO,
): StudioReleaseDisputeView {
  return {
    id: dto.id,
    status: dto.status,
    note: dto.note,
    staffReply: dto.staffReply,
    createdAt: dto.createdAt,
    decidedAt: dto.decidedAt,
  };
}

export function toReleaseVersionView(
  dto: StudioReleaseVersionDTO,
): StudioReleaseVersionView {
  return { version: dto.version, note: dto.note, createdAt: dto.createdAt };
}

export function toExternalLinkView(link: {
  platform: string;
  urlOrHandle: string;
}): StudioExternalLinkView {
  return {
    platform: link.platform,
    platformLabel: socialPlatform(link.platform).label,
    handleLabel: socialDisplayLabel(link.platform, link.urlOrHandle),
    href: socialHref(link.platform, link.urlOrHandle) ?? null,
  };
}

/** Support links in the persona's order: Bandcamp, Ko-fi and Patreon only,
 *  and only the ones that resolve to an https link. */
export function toSupportLinkViews(
  links: StudioSupportLinkDTO[] | undefined,
): StudioExternalLinkView[] {
  return (links ?? [])
    .filter(
      (link) => SUPPORT_PLATFORMS.has(link.platform) && link.urlOrHandle.trim(),
    )
    .map(toExternalLinkView)
    .filter((link) => link.href !== null && /^https:\/\//i.test(link.href));
}

export function isBandcampHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "bandcamp.com" || host.endsWith(".bandcamp.com");
  } catch {
    return false;
  }
}

/** The release's buy link: https only. "Buy on Bandcamp" for bandcamp.com
 *  and its subdomains, "Buy this release" for anything else. */
export function toBuyLinkView(
  buyUrl: string | null | undefined,
): StudioBuyLinkView | null {
  const href = buyUrl?.trim() ?? "";
  if (!/^https:\/\//i.test(href)) return null;
  return {
    href,
    labelKey: isBandcampHost(href)
      ? "studio:support.buyOnBandcamp"
      : "studio:support.buyRelease",
  };
}

export function toReleaseView(dto: StudioReleaseDTO): StudioReleaseView {
  const isUpcoming = dto.status === "scheduled";
  // Unreleased audio fails closed: a scheduled release shows its tracklist
  // to the owner and through a preview link only, whatever the DTO carries.
  const isTracklistHidden =
    isUpcoming && !dto.isOwner && !(dto.isPreview ?? false);
  // Artist kinds: a draft episode reaches its owner only. A listener's view
  // drops one even if a server sends it (fail closed).
  const sortedTracks = isTracklistHidden
    ? []
    : [...dto.tracks]
        .filter((track) => dto.isOwner || track.isDraft !== true)
        .sort((left, right) => left.position - right.position);
  const tracks = sortedTracks.map(toTrackRowView);
  const version = Math.max(1, dto.version ?? 1);
  const versions = (dto.versions ?? []).map(toReleaseVersionView);
  return {
    ...toReleaseCardView(dto),
    description: dto.description,
    status: dto.status,
    statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY[dto.status],
    isOwner: dto.isOwner,
    tracks,
    ownerTracks: dto.isOwner ? sortedTracks.map(toOwnerTrackRowView) : null,
    playableTrackCount: tracks.filter((track) => track.hasAudio).length,
    rightsConfirmedAt: dto.rightsConfirmedAt,
    takedownReason: dto.takedownReason,
    // Owner fields: a listener's view carries none, whatever arrives.
    dispute:
      dto.isOwner && dto.dispute ? toReleaseDisputeView(dto.dispute) : null,
    canDispute:
      dto.isOwner && dto.status === "taken_down" && dto.canDispute === true,
    sceneId: dto.isOwner ? (dto.sceneId ?? null) : null,
    personaCredits: toReleaseCreditSummaryViews(dto.personaCredits ?? []),
    // Studio v3: an older server leaves these out, so each one defaults.
    publishAt: isUpcoming ? (dto.publishAt ?? null) : null,
    isUpcoming,
    buyUrl: dto.buyUrl ?? null,
    buyLink: toBuyLinkView(dto.buyUrl),
    supportLinks: toSupportLinkViews(dto.supportLinks),
    version,
    versions,
    latestVersion: version > 1 ? (versions[0] ?? null) : null,
    isReminderSet: isUpcoming && (dto.isReminderSet ?? false),
    isPreview: dto.isPreview ?? false,
    hasUnnotedChanges: dto.isOwner && (dto.hasUnnotedChanges ?? false),
    previewToken: dto.isOwner ? (dto.previewToken ?? null) : null,
    previewLinkCreatedAt: dto.isOwner
      ? (dto.previewLinkCreatedAt ?? null)
      : null,
  };
}

export function toUpcomingReleaseView(
  dto: StudioUpcomingReleaseDTO,
): StudioUpcomingReleaseView {
  return {
    ...toReleaseCardView(dto),
    publishAt: dto.publishAt,
    isReminderSet: dto.isReminderSet,
  };
}

const toCreditView = (credit: StudioCreditDTO): StudioCreditView => ({
  name: credit.name,
  role: credit.role,
});

export function toTrackView(dto: StudioTrackDTO): StudioTrackView {
  return {
    ...toTrackRowView(dto),
    releaseId: dto.releaseId,
    credits: dto.credits.map(toCreditView),
    lyricStanzas: lyricStanzasOf(dto.lyrics),
    notes: dto.notes ?? null,
    sources: toSources(dto.sources),
    syncedLyrics: toSyncedLyricViews(dto.syncedLyrics),
    chapters: toChapterViews(dto.chapters),
    release: toReleaseCardView(dto.release),
    personaCredits: toPersonaCreditViews(dto.personaCredits ?? []),
  };
}

export function toArtistView(dto: StudioArtistDTO): StudioArtistView {
  const cards = dto.releases.map(toReleaseCardView);
  const upcoming = [...(dto.upcoming ?? [])]
    .sort((left, right) => left.publishAt.localeCompare(right.publishAt))
    .slice(0, UPCOMING_SHOWN)
    .map(toUpcomingReleaseView);
  return {
    artist: {
      ...toArtistRefView(dto.artist),
      bio: dto.artist.bio,
      city: dto.artist.city,
    },
    allReleases: cards,
    releases: cards.filter((card) => card.type !== "single"),
    singles: cards.filter((card) => card.type === "single"),
    ownerReleases:
      dto.ownerReleases?.map((release) => ({
        ...toReleaseCardView(release),
        status: release.status,
        statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY[release.status],
        takedownReason: release.takedownReason,
        publishAt:
          release.status === "scheduled" ? (release.publishAt ?? null) : null,
      })) ?? null,
    isOwner: dto.ownerReleases !== null,
    followerCount: dto.followerCount,
    isFollowing: dto.isFollowing,
    playlists: dto.playlists.map(toPlaylistCardView),
    supportLinks: toSupportLinkViews(dto.supportLinks),
    upcoming,
  };
}

export function toSearchTrackView(
  dto: StudioPlaylistTrackDTO,
): StudioSearchTrackView {
  return { ...toTrackRowView(dto), release: toReleaseCardView(dto.release) };
}

export function toSearchView(dto: StudioSearchResultDTO): StudioSearchView {
  const releases = dto.releases.map(toReleaseCardView);
  const tracks = dto.tracks.map(toSearchTrackView);
  const artists = dto.artists.map(toArtistRefView);
  const playlists = dto.playlists.map(toPlaylistCardView);
  return {
    releases,
    tracks,
    artists,
    playlists,
    isEmpty:
      releases.length + tracks.length + artists.length + playlists.length === 0,
  };
}

export function toMeView(dto: StudioMeDTO): StudioMeView {
  return {
    hasAccess: dto.hasAccess,
    uploadablePersonas: dto.hasAccess
      ? dto.uploadablePersonas.map(toArtistRefView)
      : [],
  };
}

// ── Studio v2: playlists ───────────────────────────────────────────────────

export interface StudioPlaylistCreditView {
  kind: "persona" | "member";
  id: string;
  name: string;
  avatarUrl: string | null;
  initials: string;
  tint: ImageSlotTint;
  /** The persona's Studio page, or the member's profile (/members/<slug>).
   *  Null only for a member credit that arrived without a slug. */
  href: string | null;
}

export interface StudioPlaylistCardView {
  id: string;
  name: string;
  credit: StudioPlaylistCreditView;
  /** Up to four distinct release covers, in playlist order. */
  coverUrls: string[];
  tint: ImageSlotTint;
  /** Tracks this viewer can play. */
  trackCount: number;
  totalDurationSeconds: number;
  updatedAt: string;
  isOwner: boolean;
  /** Owner only; null for everyone else. */
  visibility: StudioPlaylistVisibility | null;
  visibilityLabelKey: string | null;
  href: string;
  savedId: string;
}

export interface StudioPlaylistEntryView {
  entryId: string;
  position: number;
  addedAt: string;
  /** False only ever reaches the owner: the row reads "No longer
   *  available" and offers Remove only. */
  isAvailable: boolean;
  track: StudioSearchTrackView | null;
  /** Owner only, on an unavailable entry: "withdrawn" when our team took
   *  its release down (the row reads Withdrawn); null for any other cause. */
  unavailableReason: StudioUnavailableReason | null;
}

export interface StudioPlaylistView extends StudioPlaylistCardView {
  description: string | null;
  entries: StudioPlaylistEntryView[];
  /** The available entries' tracks that have audio, in playlist order: what
   *  Play playlist and Shuffle queue. */
  playableTracks: StudioSearchTrackView[];
  /** Owner only. */
  creditSubprofileId: string | null;
}

export function toPlaylistCreditView(
  dto: StudioPlaylistCreditDTO,
): StudioPlaylistCreditView {
  if (dto.persona) {
    const persona = toArtistRefView(dto.persona);
    return {
      kind: "persona",
      id: persona.id,
      name: persona.name,
      avatarUrl: persona.avatarUrl,
      initials: persona.initials,
      tint: persona.tint,
      href: persona.href,
    };
  }
  const member = dto.member ?? {
    id: "",
    slug: "",
    displayName: "",
    avatarUrl: null,
  };
  return {
    kind: "member",
    id: member.id,
    name: member.displayName,
    avatarUrl: member.avatarUrl,
    initials: initialsFromName(member.displayName, "QP"),
    tint: tintForId(member.id || member.displayName),
    // routeMap has no member-profile helper; the codebase builds this path
    // the same way everywhere.
    href: member.slug
      ? `${routes.members}/${encodeURIComponent(member.slug)}`
      : null,
  };
}

export function toPlaylistCardView(
  dto: StudioPlaylistCardDTO,
): StudioPlaylistCardView {
  const visibility = dto.isOwner ? dto.visibility : null;
  return {
    id: dto.id,
    name: dto.name,
    credit: toPlaylistCreditView(dto.credit),
    coverUrls: [...new Set(dto.coverUrls)].slice(0, 4),
    tint: tintForId(dto.id),
    trackCount: dto.trackCount,
    totalDurationSeconds: dto.totalDurationSeconds,
    updatedAt: dto.updatedAt,
    isOwner: dto.isOwner,
    visibility,
    visibilityLabelKey: visibility
      ? STUDIO_PLAYLIST_VISIBILITY_LABEL_KEY[visibility]
      : null,
    href: studioPlaylistPath(dto.id),
    savedId: studioSavedId.playlist(dto.id),
  };
}

export function toPlaylistEntryView(
  dto: StudioPlaylistEntryDTO,
): StudioPlaylistEntryView {
  const isAvailable = dto.isAvailable && dto.track !== null;
  return {
    entryId: dto.entryId,
    position: dto.position,
    addedAt: dto.addedAt,
    isAvailable,
    track: isAvailable && dto.track ? toSearchTrackView(dto.track) : null,
    unavailableReason: isAvailable ? null : (dto.unavailableReason ?? null),
  };
}

/** The available entries' tracks that have audio, in playlist order. */
export function playableTracksOf(
  entries: StudioPlaylistEntryView[],
): StudioSearchTrackView[] {
  return entries.flatMap((entry) =>
    entry.track && entry.track.hasAudio ? [entry.track] : [],
  );
}

export function toPlaylistView(dto: StudioPlaylistDTO): StudioPlaylistView {
  const entries = [...dto.entries]
    .sort((left, right) => left.position - right.position)
    .map(toPlaylistEntryView)
    .filter((entry) => dto.isOwner || entry.isAvailable);
  return {
    ...toPlaylistCardView(dto),
    description: dto.description,
    entries,
    playableTracks: playableTracksOf(entries),
    creditSubprofileId: dto.isOwner ? dto.creditSubprofileId : null,
  };
}

// ── Studio v2: Your numbers ────────────────────────────────────────────────

export interface StudioCountView {
  /** Null when the count is withheld (1 to 4). */
  value: number | null;
  isBelowThreshold: boolean;
}

export interface StudioStatsTrackView {
  track: StudioTrackRowView;
  saves: StudioCountView;
  playlistInclusions: StudioCountView;
}

export interface StudioStatsReleaseView {
  release: StudioReleaseCardView;
  status: StudioReleaseStatus;
  statusLabelKey: string;
  saves: StudioCountView;
  playlistInclusions: StudioCountView;
  tracks: StudioStatsTrackView[];
  /** Notify me holders; scheduled releases only. */
  reminders: StudioCountView | null;
}

export interface StudioArtistStatsView {
  subprofileId: string;
  followerCount: number;
  releases: StudioStatsReleaseView[];
}

const WITHHELD_COUNT: StudioCountView = Object.freeze({
  value: null,
  isBelowThreshold: true,
});

/** Fails closed: a count from 1 to 4, or a missing value, always reads as
 *  withheld, whatever the flag says. */
export function toCountView(dto: StudioCountDTO): StudioCountView {
  const { value } = dto;
  if (dto.isBelowThreshold || value === null) return WITHHELD_COUNT;
  if (value > 0 && value < STUDIO_STATS_THRESHOLD) return WITHHELD_COUNT;
  return { value, isBelowThreshold: false };
}

export function toArtistStatsView(
  dto: StudioArtistStatsDTO,
): StudioArtistStatsView {
  return {
    subprofileId: dto.subprofileId,
    followerCount: dto.followerCount,
    releases: dto.releases.map((row) => ({
      release: toReleaseCardView(row.release),
      status: row.release.status,
      statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY[row.release.status],
      saves: toCountView(row.saves),
      playlistInclusions: toCountView(row.playlistInclusions),
      // Artist kinds: a show gets release-level numbers only (spec 6.5).
      tracks: (row.release.type === "podcast" ? [] : row.tracks).map(
        (trackRow) => ({
          track: toTrackRowView(trackRow.track),
          saves: toCountView(trackRow.saves),
          playlistInclusions: toCountView(trackRow.playlistInclusions),
        }),
      ),
      reminders: row.reminders ? toCountView(row.reminders) : null,
    })),
  };
}

// ── Studio v2: genres and followed artists ─────────────────────────────────

/** The server's genres, in its order (STUDIO_GENRES order); an unknown slug
 *  from a newer server is dropped so every chip has a label. */
export function toGenreList(dto: StudioGenresDTO): StudioGenre[] {
  return dto.genres.filter(isStudioGenre);
}

/** A followed persona as a Studio artist, or null when its kind does not
 *  release in Studio (the library's Artists tab lists every Studio artist
 *  kind: music, podcast, spoken word and performance personas). */
export function toFollowedArtistView(
  dto: FollowedPersonaDTO,
): StudioArtistRefView | null {
  if (!ARTIST_KINDS.has(dto.kind)) return null;
  return toArtistRefView({
    id: dto.id,
    handle: dto.handle ?? "",
    name: dto.displayName,
    kind: dto.kind as StudioArtistPersonaKind,
    avatarUrl: dto.avatarUrl,
  });
}

// ── Studio v3: preview links and the press kit ──────────────────────────

export interface StudioPreviewView {
  /** Draft or scheduled, read through the link. */
  release: StudioReleaseView | null;
  /** Set once the release is live: the page opens the normal release page. */
  publishedReleaseId: string | null;
}

export function toPreviewView(dto: StudioPreviewResultDTO): StudioPreviewView {
  if (dto.release)
    return {
      release: toReleaseView({ ...dto.release, isPreview: true }),
      publishedReleaseId: null,
    };
  return { release: null, publishedReleaseId: dto.publishedReleaseId };
}

export interface StudioPressQuoteView {
  quote: string;
  source: string;
}

export interface StudioPressContactView {
  href: string;
  /** The address, or the bare domain and path. */
  label: string;
  isEmail: boolean;
}

/** The owner's stored fields, shaped for the editor's inputs ("" for none). */
export interface StudioPressKitOwnerView {
  pitch: string;
  pressBio: string;
  featuredTrackIds: string[];
  quotes: StudioPressQuoteView[];
  contact: string;
  updatedAt: string | null;
}

export interface StudioPressKitView {
  artist: StudioArtistDetailView;
  personaHandle: string;
  pitch: string | null;
  /** The press bio when set, else the persona bio. */
  bio: string | null;
  /** The bio cut to about 900 characters on a word, for the one-sheet. */
  oneSheetBio: string | null;
  featuredTracks: StudioSearchTrackView[];
  isFeaturedFallback: boolean;
  releases: StudioReleaseCardView[];
  quotes: StudioPressQuoteView[];
  contact: StudioPressContactView | null;
  /** Every persona link other than the support platforms. */
  socialLinks: StudioExternalLinkView[];
  supportLinks: StudioExternalLinkView[];
  isOwner: boolean;
  owner: StudioPressKitOwnerView | null;
}

export const ONE_SHEET_BIO_MAX = 900;

/** Text cut to `max` characters at the last word break, with an ellipsis. */
export function excerptOnWord(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const wordCut = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${wordCut.trimEnd()}…`;
}

/** A contact as `mailto:` or `https://`; anything else is dropped. */
export function toPressContactView(
  contact: string | null,
): StudioPressContactView | null {
  const value = contact?.trim() ?? "";
  if (/^mailto:/i.test(value)) {
    const address = value.replace(/^mailto:/i, "").split("?")[0] ?? "";
    return address ? { href: value, label: address, isEmail: true } : null;
  }
  if (!/^https:\/\//i.test(value)) return null;
  try {
    const url = new URL(value);
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "");
    return {
      href: value,
      label: `${url.hostname.replace(/^www\./i, "")}${path}`,
      isEmail: false,
    };
  } catch {
    return null;
  }
}

export function toStudioPressKitView(
  dto: StudioPressKitDTO,
): StudioPressKitView {
  const bio = dto.bio?.trim() ? dto.bio.trim() : null;
  // The owner block fails closed: only the owner's view carries it.
  const owner = dto.isOwner && dto.owner ? dto.owner : null;
  return {
    artist: {
      ...toArtistRefView(dto.artist),
      bio: dto.artist.bio,
      city: dto.artist.city,
    },
    personaHandle: dto.personaHandle,
    pitch: dto.pitch?.trim() ? dto.pitch.trim() : null,
    bio,
    oneSheetBio: bio ? excerptOnWord(bio, ONE_SHEET_BIO_MAX) : null,
    featuredTracks: dto.featuredTracks
      .filter((track) => track.hasAudio)
      .slice(0, STUDIO_PRESS.featuredMax)
      .map(toSearchTrackView),
    isFeaturedFallback: dto.isFeaturedFallback,
    releases: dto.releases
      .slice(0, STUDIO_PRESS.releasesShown)
      .map(toReleaseCardView),
    quotes: dto.quotes
      .slice(0, STUDIO_PRESS.quotesMax)
      .map((entry) => ({ quote: entry.quote, source: entry.source })),
    contact: toPressContactView(dto.contact),
    socialLinks: dto.socialLinks
      .filter(
        (link) =>
          link.urlOrHandle.trim() && !SUPPORT_PLATFORMS.has(link.platform),
      )
      .map(toExternalLinkView),
    supportLinks: toSupportLinkViews(dto.supportLinks),
    isOwner: dto.isOwner,
    owner: owner
      ? {
          pitch: owner.pitch ?? "",
          pressBio: owner.pressBio ?? "",
          featuredTrackIds: owner.featuredTrackIds,
          quotes: owner.quotes.map((entry) => ({
            quote: entry.quote,
            source: entry.source,
          })),
          contact: owner.contact ?? "",
          updatedAt: owner.updatedAt,
        }
      : null,
  };
}

// ── Studio artist kinds: the latest episodes shelf ───────────────────────

export interface StudioLatestEpisodeView {
  track: StudioTrackRowView;
  release: StudioReleaseCardView;
}

export function toLatestEpisodeView(
  dto: StudioLatestEpisodeDTO,
): StudioLatestEpisodeView {
  return {
    track: toTrackRowView(dto.track),
    release: toReleaseCardView(dto.release),
  };
}

/** A page of the shelf. Fails closed: an item whose episode is a draft is
 *  dropped even if a server sends one. */
export function toLatestEpisodeViews(
  dtos: StudioLatestEpisodeDTO[],
): StudioLatestEpisodeView[] {
  return dtos
    .filter((dto) => dto.track.isDraft !== true)
    .map(toLatestEpisodeView);
}
