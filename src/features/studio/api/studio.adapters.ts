import type { ImageSlotTint } from "../../../shared/components/ui";
import { personaPath, routes } from "../../../app/routeMap";
import { initialsFromName } from "../../../shared/lib/initials";
import type { FollowedPersonaDTO } from "../../subprofiles/api/subprofiles.api";
import {
  studioArtistPath,
  studioPlaylistPath,
  studioReleasePath,
  studioTrackPath,
} from "../studioPaths";
import type {
  StudioArtistDTO,
  StudioArtistPersonaKind,
  StudioArtistRefDTO,
  StudioArtistStatsDTO,
  StudioCountDTO,
  StudioCreditDTO,
  StudioGenre,
  StudioGenresDTO,
  StudioMeDTO,
  StudioPlaylistCardDTO,
  StudioPlaylistCreditDTO,
  StudioPlaylistDTO,
  StudioPlaylistEntryDTO,
  StudioPlaylistTrackDTO,
  StudioPlaylistVisibility,
  StudioReleaseCardDTO,
  StudioReleaseDTO,
  StudioReleaseStatus,
  StudioReleaseType,
  StudioSearchResultDTO,
  StudioTrackDTO,
  StudioTrackSummaryDTO,
} from "./studio.types";
import {
  STUDIO_ARTIST_PERSONA_KINDS,
  STUDIO_GENRES,
  STUDIO_STATS_THRESHOLD,
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
}

export interface StudioReleaseView extends StudioReleaseCardView {
  description: string | null;
  status: StudioReleaseStatus;
  statusLabelKey: string;
  isOwner: boolean;
  tracks: StudioTrackRowView[];
  playableTrackCount: number;
  rightsConfirmedAt: string | null;
  takedownReason: string | null;
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
  release: StudioReleaseCardView;
}

export interface StudioOwnerReleaseView extends StudioReleaseCardView {
  status: StudioReleaseStatus;
  statusLabelKey: string;
  takedownReason: string | null;
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

export const STUDIO_KIND_LABEL_KEY: Record<StudioArtistPersonaKind, string> = {
  musician: "studio:kind.musician",
  dj: "studio:kind.dj",
};

export const STUDIO_RELEASE_TYPE_LABEL_KEY: Record<StudioReleaseType, string> =
  {
    album: "studio:releaseType.album",
    ep: "studio:releaseType.ep",
    single: "studio:releaseType.single",
    mix: "studio:releaseType.mix",
  };

export const STUDIO_RELEASE_STATUS_LABEL_KEY: Record<
  StudioReleaseStatus,
  string
> = {
  draft: "studio:releaseStatus.draft",
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

export function isStudioGenre(
  value: string | null | undefined,
): value is StudioGenre {
  return typeof value === "string" && KNOWN_GENRES.has(value);
}

export function genreLabelKeyOf(genre: string | null): string | null {
  return isStudioGenre(genre) ? STUDIO_GENRE_LABEL_KEY[genre] : null;
}

const PLACEHOLDER_TINTS: readonly ImageSlotTint[] = ["coral", "plum", "jade"];

/** Seconds to "4:18"; null while the server has not read a duration. */
export function formatTrackTime(totalSeconds: number | null): string | null {
  if (
    totalSeconds === null ||
    !Number.isFinite(totalSeconds) ||
    totalSeconds < 0
  ) {
    return null;
  }
  const wholeSeconds = Math.floor(totalSeconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const seconds = wholeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
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
    avatarUrl: dto.avatarUrl,
    initials: initialsFromName(dto.name, "QP"),
    tint: tintForId(dto.id),
    href: studioArtistPath(dto.id),
    personaHref: dto.handle ? personaPath(dto.handle) : null,
  };
}

export function toReleaseCardView(
  dto: StudioReleaseCardDTO,
): StudioReleaseCardView {
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
    artist: toArtistRefView(dto.artist),
    href: studioReleasePath(dto.id),
    savedId: studioSavedId.release(dto.id),
    publishedAt: dto.publishedAt,
    genre: dto.genre,
    genreLabelKey: genreLabelKeyOf(dto.genre),
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
  };
}

export function toReleaseView(dto: StudioReleaseDTO): StudioReleaseView {
  const tracks = [...dto.tracks]
    .sort((left, right) => left.position - right.position)
    .map(toTrackRowView);
  return {
    ...toReleaseCardView(dto),
    description: dto.description,
    status: dto.status,
    statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY[dto.status],
    isOwner: dto.isOwner,
    tracks,
    playableTrackCount: tracks.filter((track) => track.hasAudio).length,
    rightsConfirmedAt: dto.rightsConfirmedAt,
    takedownReason: dto.takedownReason,
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
    release: toReleaseCardView(dto.release),
  };
}

export function toArtistView(dto: StudioArtistDTO): StudioArtistView {
  const cards = dto.releases.map(toReleaseCardView);
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
      })) ?? null,
    isOwner: dto.ownerReleases !== null,
    followerCount: dto.followerCount,
    isFollowing: dto.isFollowing,
    playlists: dto.playlists.map(toPlaylistCardView),
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
      tracks: row.tracks.map((trackRow) => ({
        track: toTrackRowView(trackRow.track),
        saves: toCountView(trackRow.saves),
        playlistInclusions: toCountView(trackRow.playlistInclusions),
      })),
    })),
  };
}

// ── Studio v2: genres and followed artists ─────────────────────────────────

/** The server's genres, in its order (STUDIO_GENRES order); an unknown slug
 *  from a newer server is dropped so every chip has a label. */
export function toGenreList(dto: StudioGenresDTO): StudioGenre[] {
  return dto.genres.filter(isStudioGenre);
}

/** A followed persona as a Studio artist, or null when it does not make
 *  music (the library's Artists tab lists musicians and DJs only). */
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
