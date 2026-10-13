import type { ImageSlotTint } from "../../../shared/components/ui";
import { personaPath } from "../../../app/routeMap";
import { initialsFromName } from "../../../shared/lib/initials";
import {
  studioArtistPath,
  studioReleasePath,
  studioTrackPath,
} from "../studioPaths";
import type {
  StudioArtistDTO,
  StudioArtistPersonaKind,
  StudioArtistRefDTO,
  StudioCreditDTO,
  StudioGenre,
  StudioMeDTO,
  StudioReleaseCardDTO,
  StudioReleaseDTO,
  StudioReleaseStatus,
  StudioReleaseType,
  StudioSearchResultDTO,
  StudioTrackDTO,
  StudioTrackSummaryDTO,
} from "./studio.types";
import { STUDIO_GENRES } from "./studio.types";

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
  genre: string | null;
  genreLabelKey: string | null;
  status: StudioReleaseStatus;
  statusLabelKey: string;
  publishedAt: string | null;
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
  /** Albums, EPs and mixes, newest first. */
  releases: StudioReleaseCardView[];
  singles: StudioReleaseCardView[];
  /** Drafts and taken-down releases; null unless the viewer owns the persona. */
  ownerReleases: StudioOwnerReleaseView[] | null;
}

export interface StudioSearchTrackView extends StudioTrackRowView {
  release: StudioReleaseCardView;
}

export interface StudioSearchView {
  releases: StudioReleaseCardView[];
  tracks: StudioSearchTrackView[];
  artists: StudioArtistRefView[];
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

const KNOWN_GENRES: ReadonlySet<string> = new Set(STUDIO_GENRES);
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
    genre: dto.genre,
    genreLabelKey:
      dto.genre && KNOWN_GENRES.has(dto.genre)
        ? STUDIO_GENRE_LABEL_KEY[dto.genre as StudioGenre]
        : null,
    status: dto.status,
    statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY[dto.status],
    publishedAt: dto.publishedAt,
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
    releases: cards.filter((card) => card.type !== "single"),
    singles: cards.filter((card) => card.type === "single"),
    ownerReleases:
      dto.ownerReleases?.map((release) => ({
        ...toReleaseCardView(release),
        status: release.status,
        statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY[release.status],
        takedownReason: release.takedownReason,
      })) ?? null,
  };
}

export function toSearchView(dto: StudioSearchResultDTO): StudioSearchView {
  const releases = dto.releases.map(toReleaseCardView);
  const tracks = dto.tracks.map((track) => ({
    ...toTrackRowView(track),
    release: toReleaseCardView(track.release),
  }));
  const artists = dto.artists.map(toArtistRefView);
  return {
    releases,
    tracks,
    artists,
    isEmpty: releases.length + tracks.length + artists.length === 0,
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
