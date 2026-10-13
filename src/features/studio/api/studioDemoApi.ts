import { ApiError } from "../../../shared/api/client";
import { foldForSearch } from "../../../shared/lib/foldForSearch";
import {
  STUDIO_GENRES,
  type StudioArtistDTO,
  type StudioGenre,
  type StudioGenresDTO,
  type StudioPageDTO,
  type StudioReleaseCardDTO,
  type StudioReleaseDTO,
  type StudioSearchResultDTO,
  type StudioSearchType,
  type StudioTrackDTO,
} from "./studio.types";
import {
  DEMO_ARTISTS,
  DEMO_ARTIST_DETAILS,
  DEMO_OWNER_RELEASES,
  DEMO_RELEASES,
  DEMO_TRACK_DETAILS,
} from "./studioDemo.data";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import {
  demoArtistFollowerCount,
  demoIsFollowingArtist,
  demoReleaseCard,
} from "./studioDemoCards";
import {
  demoArtistPlaylistCards,
  demoSearchPlaylistCards,
} from "./studioDemoPlaylists";

/** Small on purpose, so the demo exercises "Show more". */
export const DEMO_PAGE_SIZE = 8;
const SEARCH_LIMIT = 20;

const notFound = () => new ApiError(404, "Not found");

const allReleases = () => [...DEMO_RELEASES, ...DEMO_OWNER_RELEASES];

export function demoStudioReleasesPage(
  cursor: string | null,
  genre: StudioGenre | null = null,
): StudioPageDTO<StudioReleaseCardDTO> {
  const source = genre
    ? DEMO_RELEASES.filter((release) => release.genre === genre)
    : DEMO_RELEASES;
  const offset = cursor ? Number(cursor) : 0;
  const items = source
    .slice(offset, offset + DEMO_PAGE_SIZE)
    .map(demoReleaseCard);
  const nextOffset = offset + DEMO_PAGE_SIZE;
  const hasMore = nextOffset < source.length;
  return {
    items,
    pageInfo: { nextCursor: hasMore ? String(nextOffset) : null, hasMore },
  };
}

/** GET /studio/genres: genres with a published release, in list order. */
export function demoStudioGenres(): StudioGenresDTO {
  return {
    genres: STUDIO_GENRES.filter((genre) =>
      DEMO_RELEASES.some((release) => release.genre === genre),
    ),
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
      release: demoReleaseCard(candidate),
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
    ).map(demoReleaseCard),
    ownerReleases: isOwner
      ? DEMO_OWNER_RELEASES.map((candidate) => ({
          ...demoReleaseCard(candidate),
          status: candidate.status,
          takedownReason: candidate.takedownReason,
        }))
      : null,
    followerCount: demoArtistFollowerCount(artist.id),
    isFollowing: demoIsFollowingArtist(artist.id),
    playlists: demoArtistPlaylistCards(artist.id),
  };
}

export function demoStudioSearch(
  query: string,
  type: StudioSearchType,
  genre: StudioGenre | null = null,
): StudioSearchResultDTO {
  const needle = foldForSearch(query.trim());
  const matches = (text: string) =>
    needle.length > 0 && foldForSearch(text).includes(needle);
  const isInGenre = (release: { genre: string | null }) =>
    genre === null || release.genre === genre;
  const wants = (kind: StudioSearchType) => type === "all" || type === kind;
  return {
    releases: wants("releases")
      ? DEMO_RELEASES.filter(
          (candidate) =>
            (matches(candidate.title) || matches(candidate.artist.name)) &&
            isInGenre(candidate),
        )
          .slice(0, SEARCH_LIMIT)
          .map(demoReleaseCard)
      : [],
    tracks: wants("tracks")
      ? DEMO_RELEASES.filter(isInGenre)
          .flatMap((candidate) =>
            candidate.tracks
              .filter((track) => matches(track.title))
              .map((track) => ({
                ...track,
                release: demoReleaseCard(candidate),
              })),
          )
          .slice(0, SEARCH_LIMIT)
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
    playlists: wants("playlists") ? demoSearchPlaylistCards(query) : [],
  };
}
