import { ApiError } from "../../../shared/api/client";
import { foldForSearch } from "../../../shared/lib/foldForSearch";
import type {
  StudioArtistDTO,
  StudioPageDTO,
  StudioReleaseCardDTO,
  StudioReleaseDTO,
  StudioSearchResultDTO,
  StudioSearchType,
  StudioTrackDTO,
} from "./studio.types";
import {
  DEMO_ARTISTS,
  DEMO_ARTIST_DETAILS,
  DEMO_OWNER_RELEASES,
  DEMO_RELEASES,
  DEMO_TRACK_DETAILS,
} from "./studioDemo.data";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";

/** Small on purpose, so the demo exercises "Show more". */
export const DEMO_PAGE_SIZE = 8;
const SEARCH_LIMIT = 20;

const notFound = () => new ApiError(404, "Not found");

function toCard(dto: StudioReleaseDTO): StudioReleaseCardDTO {
  const {
    id,
    title,
    type,
    coverUrl,
    releasedOn,
    trackCount,
    totalDurationSeconds,
    artist,
  } = dto;
  return {
    id,
    title,
    type,
    coverUrl,
    releasedOn,
    trackCount,
    totalDurationSeconds,
    artist,
  };
}

const allReleases = () => [...DEMO_RELEASES, ...DEMO_OWNER_RELEASES];

export function demoStudioReleasesPage(
  cursor: string | null,
): StudioPageDTO<StudioReleaseCardDTO> {
  const offset = cursor ? Number(cursor) : 0;
  const items = DEMO_RELEASES.slice(offset, offset + DEMO_PAGE_SIZE).map(
    toCard,
  );
  const nextOffset = offset + DEMO_PAGE_SIZE;
  const hasMore = nextOffset < DEMO_RELEASES.length;
  return {
    items,
    pageInfo: { nextCursor: hasMore ? String(nextOffset) : null, hasMore },
  };
}

export function demoStudioRelease(releaseId: string): StudioReleaseDTO {
  const match = allReleases().find((candidate) => candidate.id === releaseId);
  if (!match) throw notFound();
  return match;
}

export function demoStudioTrack(trackId: string): StudioTrackDTO {
  for (const candidate of allReleases()) {
    const summary = candidate.tracks.find((track) => track.id === trackId);
    if (!summary) continue;
    const details = DEMO_TRACK_DETAILS[trackId];
    return {
      ...summary,
      releaseId: candidate.id,
      credits: details?.credits ?? [],
      lyrics: details?.lyrics ?? null,
      release: toCard(candidate),
    };
  }
  throw notFound();
}

export function demoStudioArtist(subprofileId: string): StudioArtistDTO {
  const artist = DEMO_ARTISTS.find(
    (candidate) => candidate.id === subprofileId,
  );
  if (!artist) throw notFound();
  const details = DEMO_ARTIST_DETAILS[artist.id] ?? { bio: null, city: null };
  const isOwner = artist.id === DEMO_ARTIST_MARIANA.id;
  return {
    artist: { ...artist, ...details },
    releases: DEMO_RELEASES.filter(
      (candidate) => candidate.artist.id === artist.id,
    ).map(toCard),
    ownerReleases: isOwner
      ? DEMO_OWNER_RELEASES.map((candidate) => ({
          ...toCard(candidate),
          status: candidate.status,
          takedownReason: candidate.takedownReason,
        }))
      : null,
  };
}

export function demoStudioSearch(
  query: string,
  type: StudioSearchType,
): StudioSearchResultDTO {
  const needle = foldForSearch(query.trim());
  const matches = (text: string) =>
    needle.length > 0 && foldForSearch(text).includes(needle);
  const wants = (kind: StudioSearchType) => type === "all" || type === kind;
  return {
    releases: wants("releases")
      ? DEMO_RELEASES.filter(
          (candidate) =>
            matches(candidate.title) || matches(candidate.artist.name),
        )
          .slice(0, SEARCH_LIMIT)
          .map(toCard)
      : [],
    tracks: wants("tracks")
      ? DEMO_RELEASES.flatMap((candidate) =>
          candidate.tracks
            .filter((track) => matches(track.title))
            .map((track) => ({ ...track, release: toCard(candidate) })),
        ).slice(0, SEARCH_LIMIT)
      : [],
    // As the server: artists with at least one published release, by name.
    artists: wants("artists")
      ? DEMO_ARTISTS.filter(
          (candidate) =>
            matches(candidate.name) &&
            DEMO_RELEASES.some((release) => release.artist.id === candidate.id),
        )
          .sort((left, right) => left.name.localeCompare(right.name))
          .slice(0, SEARCH_LIMIT)
      : [],
  };
}
