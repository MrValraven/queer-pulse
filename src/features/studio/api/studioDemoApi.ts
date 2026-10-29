import { ApiError } from "../../../shared/api/client";
import { foldForSearch } from "../../../shared/lib/foldForSearch";
import {
  STUDIO_FORMATS,
  STUDIO_FORMAT_BY_KIND,
  STUDIO_GENRES,
  STUDIO_MOODS,
  STUDIO_PREVIEW_TOKEN_PATTERN,
  type StudioArtistDTO,
  type StudioArtistRefDTO,
  type StudioFormat,
  type StudioFormatsDTO,
  type StudioGenre,
  type StudioGenresDTO,
  type StudioLatestEpisodesPageDTO,
  type StudioMood,
  type StudioMoodsDTO,
  type StudioPageDTO,
  type StudioPreviewResultDTO,
  type StudioReleaseCardDTO,
  type StudioReleaseDTO,
  type StudioSearchResultDTO,
  type StudioSearchType,
  type StudioTrackDTO,
  type StudioTrackSummaryDTO,
  type StudioUpcomingReleaseDTO,
  type StudioWithdrawnErrorBody,
} from "./studio.types";
import {
  DEMO_OTHER_UPCOMING_RELEASES,
  DEMO_OWNER_RELEASES,
  DEMO_RELEASES,
  DEMO_TRACK_DETAILS,
  DEMO_WITHDRAWN_RELEASE_ID,
  DEMO_WITHDRAWN_TRACK_IDS,
} from "./studioDemo.data";
import {
  demoAllArtists,
  DEMO_FORMAT_RELEASES,
  DEMO_FORMAT_TRACK_CONTENT,
  DEMO_FORMAT_TRACK_DETAILS,
  demoArtistDetailsOf,
  isDemoOwnedPersona,
} from "./studioDemoFormats.data";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import {
  demoArtistFollowerCount,
  demoIsFollowingArtist,
  demoReleaseCard,
  demoSupportLinksFor,
} from "./studioDemoCards";
import {
  demoIsReminderSet,
  demoPreviewLinkFor,
  demoReleaseIdForToken,
} from "./studioDemoArtistTools";
import {
  demoHasAnalysis,
  demoStoredListening,
  demoStreamAnalysis,
} from "./studioDemoListening";
import { studioRefusal } from "./studioDemoMutations";
import {
  demoReleasePriceOf,
  demoTrackPriceOf,
} from "./studioDemoPurchaseStore";
import {
  demoOwnerClaimsOfRelease,
  demoOwnerClaimsOfTrack,
  demoTrackWithSafety,
  demoWithheldTrackIds,
} from "./studioDemoSafety";
import type { StudioWithheldErrorBody } from "./studioSafety.types";
import {
  demoCreditSummariesOfRelease,
  demoPublicCreditsOfTrack,
} from "./studioDemoCredits.data";
import {
  demoArtistPlaylistCards,
  demoSearchPlaylistCards,
} from "./studioDemoPlaylists";

/** Small on purpose, so the demo exercises "Show more". */
export const DEMO_PAGE_SIZE = 8;

/** One page of a demo list, offset cursors as strings, the way every demo
 *  pager answers. */
export function demoPageOf<Item>(
  items: Item[],
  cursor: string | null,
): StudioPageDTO<Item> {
  const offset = cursor ? Number(cursor) : 0;
  const nextOffset = offset + DEMO_PAGE_SIZE;
  const hasMore = nextOffset < items.length;
  return {
    items: items.slice(offset, nextOffset),
    pageInfo: { nextCursor: hasMore ? String(nextOffset) : null, hasMore },
  };
}
const SEARCH_LIMIT = 20;

const notFound = () => new ApiError(404, "Not found");
const WITHDRAWN_BODY: StudioWithdrawnErrorBody = {
  statusCode: 410,
  code: "studio_release_withdrawn",
  message: "This release was withdrawn.",
  error: "Gone",
};
const withdrawn = () => new ApiError(410, "Gone", WITHDRAWN_BODY);
/** Studio safety: a listener reading a withheld track (it names nothing). */
const WITHHELD_BODY: StudioWithheldErrorBody = {
  statusCode: 410,
  code: "studio_track_withheld",
  message: "This track is unavailable.",
  error: "Gone",
};
const trackWithheld = () => new ApiError(410, "Gone", WITHHELD_BODY);

const allReleases = () => [
  ...DEMO_RELEASES,
  ...DEMO_OWNER_RELEASES,
  ...DEMO_OTHER_UPCOMING_RELEASES,
  ...DEMO_FORMAT_RELEASES,
];

const byReleaseDateNewestFirst = (
  left: StudioReleaseDTO,
  right: StudioReleaseDTO,
) => (right.releasedOn ?? "").localeCompare(left.releasedOn ?? "");

/** Every published demo release, music and the artist kinds catalogue,
 *  newest first: what the grids, the home feed, search, genres and radio
 *  read, as the server lists them (drafts and scheduled releases stay out). */
export const DEMO_LISTED_RELEASES: StudioReleaseDTO[] = allReleases()
  .filter((release) => release.status === "published")
  .sort(byReleaseDateNewestFirst);

const formatOfArtist = (artist: StudioArtistRefDTO): StudioFormat =>
  STUDIO_FORMAT_BY_KIND[artist.kind];

const isInFormat = (
  release: { artist: StudioArtistRefDTO },
  format: StudioFormat | null,
) => format === null || formatOfArtist(release.artist) === format;

const UPCOMING_LIMIT = 6;

/** The tracks with confirmed audio, renumbered from 1. A draft episode
 *  reaches its owner only. */
function playableTracksOf(release: StudioReleaseDTO) {
  return release.tracks
    .filter((track) => track.hasAudio && track.isDraft !== true)
    .map((track, index) => ({ ...track, position: index + 1 }));
}

/** The synced lyrics and chapters of a track: what a PATCH stored, else the
 *  fixture's. */
function listeningDetailsOf(trackId: string) {
  const details = DEMO_TRACK_DETAILS[trackId];
  const formatDetails = DEMO_FORMAT_TRACK_DETAILS[trackId];
  const stored = demoStoredListening(trackId);
  return {
    syncedLyrics:
      stored.syncedLyrics === undefined
        ? (details?.syncedLyrics ?? null)
        : stored.syncedLyrics,
    // Artist kinds: the episodes' chapters sit in the formats catalogue.
    chapters:
      stored.chapters === undefined
        ? (details?.chapters ?? formatDetails?.chapters ?? null)
        : stored.chapters,
  };
}

/** An owner row carries the owner-only listening fields; listener and
 *  staff rows omit the keys, as the server does. */
function withOwnerTrackFields(
  track: StudioTrackSummaryDTO,
): StudioTrackSummaryDTO {
  const { loudnessLufs, peakDb } = demoStreamAnalysis(track.id);
  return {
    ...track,
    hasAnalysis: demoHasAnalysis(track.id),
    loudnessLufs,
    peakDb,
    ...listeningDetailsOf(track.id),
    // Studio purchases: an owner row carries the track's own price.
    price: demoTrackPriceOf(track.id),
  };
}

/** The owner reads every track; anyone else reads the tracks with audio,
 *  and none of a scheduled release (its counts stay filled). */
function tracksForViewer(release: StudioReleaseDTO) {
  if (release.isOwner) return release.tracks.map(withOwnerTrackFields);
  if (release.status === "scheduled") return [];
  return playableTracksOf(release);
}

/** The viewer's own state on a release, as the server would read it: the
 *  tracks they may read, the Notify me flag and the owner's preview link. */
function forViewer(release: StudioReleaseDTO): StudioReleaseDTO {
  const link = release.isOwner ? demoPreviewLinkFor(release.id) : null;
  return {
    ...release,
    tracks: tracksForViewer(release).map((track) =>
      demoTrackWithSafety(track, release.isOwner),
    ),
    // Studio safety: claims reach the owner only.
    claims: release.isOwner ? demoOwnerClaimsOfRelease(release) : [],
    isReminderSet:
      release.status === "scheduled" && demoIsReminderSet(release.id),
    hasUnnotedChanges: release.isOwner && (release.hasUnnotedChanges ?? false),
    previewToken: link?.token ?? null,
    previewLinkCreatedAt: link?.createdAt ?? null,
  };
}

export function demoStudioReleasesPage(
  cursor: string | null,
  genre: StudioGenre | null = null,
  mood: StudioMood | null = null,
  format: StudioFormat | null = null,
): StudioPageDTO<StudioReleaseCardDTO> {
  const source = DEMO_LISTED_RELEASES.filter(
    (release) =>
      (genre === null || release.genres.includes(genre)) &&
      (mood === null || release.mood === mood) &&
      isInFormat(release, format),
  );
  return demoPageOf(source.map(demoReleaseCard), cursor);
}

/** The cover of the newest listed release matching each value, for the
 *  values that have one. DEMO_LISTED_RELEASES is newest first, so the
 *  first covered match wins. */
function demoFacetCovers<FacetValue extends string>(
  values: readonly FacetValue[],
  hasValue: (release: StudioReleaseDTO, value: FacetValue) => boolean,
): Record<string, string> {
  const covers: Record<string, string> = {};
  for (const value of values) {
    const newestCovered = DEMO_LISTED_RELEASES.find(
      (release) => hasValue(release, value) && Boolean(release.coverUrl),
    );
    if (newestCovered?.coverUrl) covers[value] = newestCovered.coverUrl;
  }
  return covers;
}

/** GET /studio/genres: genres with a published release, in list order, and
 *  the newest cover in each. */
export function demoStudioGenres(): StudioGenresDTO {
  const genres = STUDIO_GENRES.filter((genre) =>
    DEMO_LISTED_RELEASES.some((release) => release.genres.includes(genre)),
  );
  return {
    genres,
    covers: demoFacetCovers(genres, (release, genre) =>
      release.genres.includes(genre),
    ),
  };
}

/** GET /studio/moods: moods with a published release, in list order, and
 *  the newest cover in each. */
export function demoStudioMoods(): StudioMoodsDTO {
  const moods = STUDIO_MOODS.filter((mood) =>
    DEMO_LISTED_RELEASES.some((release) => release.mood === mood),
  );
  return {
    moods,
    covers: demoFacetCovers(moods, (release, mood) => release.mood === mood),
  };
}

/** GET /studio/formats: formats with a published release, in map order. */
export function demoStudioFormats(): StudioFormatsDTO {
  return {
    formats: STUDIO_FORMATS.filter((format) =>
      DEMO_LISTED_RELEASES.some((release) => isInFormat(release, format)),
    ),
  };
}

/** GET /studio/episodes/latest: published episodes of listed shows, newest
 *  first. One page, as the home shelf reads it. */
export function demoStudioLatestEpisodes(
  limit: number,
): StudioLatestEpisodesPageDTO {
  const items = DEMO_LISTED_RELEASES.filter(
    (release) => release.type === "podcast",
  )
    .flatMap((show) =>
      show.tracks
        .filter(
          (track) =>
            track.isDraft !== true &&
            Boolean(track.publishedAt) &&
            track.hasAudio,
        )
        // Feed items are full tracks with the words and credits left out,
        // as the backend sends them.
        .map((track) => ({
          track: {
            ...demoStudioTrack(track.id),
            lyrics: null,
            syncedLyrics: null,
            personaCredits: [],
          },
          release: demoReleaseCard(show),
        })),
    )
    .sort(
      (left, right) =>
        (right.track.publishedAt ?? "").localeCompare(
          left.track.publishedAt ?? "",
        ) || right.track.id.localeCompare(left.track.id),
    )
    .slice(0, limit);
  return { items, nextCursor: null };
}

export function demoStudioRelease(releaseId: string): StudioReleaseDTO {
  if (releaseId === DEMO_WITHDRAWN_RELEASE_ID) throw withdrawn();
  const match = allReleases().find((candidate) => candidate.id === releaseId);
  if (!match) throw notFound();
  // The fixture carries no credit summary; the ledger answers it on every
  // read, so every accept and removal shows.
  return {
    ...forViewer(match),
    price: demoReleasePriceOf(match.id),
    personaCredits: demoCreditSummariesOfRelease(match.id),
  };
}

export function demoStudioTrack(trackId: string): StudioTrackDTO {
  if (DEMO_WITHDRAWN_TRACK_IDS.has(trackId)) throw withdrawn();
  for (const candidate of allReleases()) {
    // As the server: a track the viewer may not read (a scheduled release's
    // track for a non-owner, or one without audio) is a 404.
    const summary = forViewer(candidate).tracks.find(
      (track) => track.id === trackId,
    );
    if (!summary) continue;
    // Studio safety: a listener's withheld track page is a 410 that names
    // nothing; the owner reads it with its claims.
    if (summary.isWithheld === true && !candidate.isOwner)
      throw trackWithheld();
    const details = DEMO_TRACK_DETAILS[trackId];
    const formatDetails = DEMO_FORMAT_TRACK_DETAILS[trackId];
    const content = DEMO_FORMAT_TRACK_CONTENT[trackId];
    return {
      ...summary,
      notes: content?.notes ?? null,
      sources: content?.sources ?? [],
      releaseId: candidate.id,
      credits: details?.credits ?? formatDetails?.credits ?? [],
      lyrics: details?.lyrics ?? formatDetails?.lyrics ?? null,
      ...listeningDetailsOf(trackId),
      release: { ...demoReleaseCard(candidate), status: candidate.status },
      personaCredits: demoPublicCreditsOfTrack(trackId),
      claims: candidate.isOwner ? demoOwnerClaimsOfTrack(trackId) : [],
    };
  }
  throw notFound();
}

export function demoStudioArtist(subprofileId: string): StudioArtistDTO {
  const artist = demoAllArtists().find(
    (candidate) => candidate.id === subprofileId,
  );
  if (!artist) throw notFound();
  const details = demoArtistDetailsOf(artist.id);
  const isOwner = isDemoOwnedPersona(artist.id);
  const unpublishedOfArtist =
    artist.id === DEMO_ARTIST_MARIANA.id
      ? DEMO_OWNER_RELEASES
      : DEMO_FORMAT_RELEASES.filter(
          (candidate) =>
            candidate.artist.id === artist.id &&
            candidate.status !== "published",
        );
  return {
    artist: { ...artist, ...details },
    releases: DEMO_LISTED_RELEASES.filter(
      (candidate) => candidate.artist.id === artist.id,
    ).map(demoReleaseCard),
    ownerReleases: isOwner
      ? unpublishedOfArtist.map((candidate) => ({
          ...demoReleaseCard(candidate),
          status: candidate.status,
          takedownReason: candidate.takedownReason,
          publishAt: candidate.publishAt ?? null,
        }))
      : null,
    followerCount: demoArtistFollowerCount(artist.id),
    isFollowing: demoIsFollowingArtist(artist.id),
    playlists: demoArtistPlaylistCards(artist.id),
    supportLinks: demoSupportLinksFor(artist.id),
    upcoming: demoUpcomingOf(artist.id),
  };
}

/** The artist's scheduled releases, soonest first, at most 6, shown to
 *  owners and visitors alike. */
function demoUpcomingOf(artistId: string): StudioUpcomingReleaseDTO[] {
  return allReleases()
    .filter(
      (candidate) =>
        candidate.artist.id === artistId &&
        candidate.status === "scheduled" &&
        Boolean(candidate.publishAt),
    )
    .sort((left, right) =>
      (left.publishAt ?? "").localeCompare(right.publishAt ?? ""),
    )
    .slice(0, UPCOMING_LIMIT)
    .map((candidate) => ({
      ...demoReleaseCard(candidate),
      publishAt: candidate.publishAt ?? "",
      isReminderSet: demoIsReminderSet(candidate.id),
    }));
}

export function demoStudioSearch(
  query: string,
  type: StudioSearchType,
  genre: StudioGenre | null = null,
  mood: StudioMood | null = null,
  format: StudioFormat | null = null,
): StudioSearchResultDTO {
  const needle = foldForSearch(query.trim());
  const matches = (text: string) =>
    needle.length > 0 && foldForSearch(text).includes(needle);
  const isInFilters = (release: {
    genres: string[];
    mood: string | null;
    artist: StudioArtistRefDTO;
  }) =>
    (genre === null || release.genres.includes(genre)) &&
    (mood === null || release.mood === mood) &&
    isInFormat(release, format);
  const wants = (kind: StudioSearchType) => type === "all" || type === kind;
  return {
    releases: wants("releases")
      ? DEMO_LISTED_RELEASES.filter(
          (candidate) =>
            (matches(candidate.title) || matches(candidate.artist.name)) &&
            isInFilters(candidate),
        )
          .slice(0, SEARCH_LIMIT)
          .map(demoReleaseCard)
      : [],
    tracks: wants("tracks")
      ? DEMO_LISTED_RELEASES.filter(isInFilters)
          .flatMap((candidate) =>
            candidate.tracks
              // A draft episode reaches its owner's show page only.
              .filter(
                (track) =>
                  track.isDraft !== true &&
                  matches(track.title) &&
                  // Studio safety: search leaves a withheld track out.
                  !demoWithheldTrackIds().has(track.id),
              )
              .map((track) => ({
                ...demoTrackWithSafety(track, false),
                release: demoReleaseCard(candidate),
              })),
          )
          .slice(0, SEARCH_LIMIT)
      : [],
    // As the server: artists with at least one published release, by name.
    artists: wants("artists")
      ? demoAllArtists()
          .filter(
            (candidate) =>
              matches(candidate.name) &&
              DEMO_LISTED_RELEASES.some(
                (release) => release.artist.id === candidate.id,
              ) &&
              (format === null || formatOfArtist(candidate) === format),
          )
          .sort((left, right) => left.name.localeCompare(right.name))
          .slice(0, SEARCH_LIMIT)
      : [],
    playlists: wants("playlists") ? demoSearchPlaylistCards(query) : [],
  };
}

/** GET /studio/previews/:token in the demo. A draft or scheduled release
 *  reads as the full release with every track that has audio; a published
 *  one answers its id; anything else is the one 404. */
export function demoStudioPreview(token: string): StudioPreviewResultDTO {
  const previewNotFound = () => studioRefusal(404, "studio_preview_not_found");
  if (!STUDIO_PREVIEW_TOKEN_PATTERN.test(token)) throw previewNotFound();
  const releaseId = demoReleaseIdForToken(token);
  const match = allReleases().find((candidate) => candidate.id === releaseId);
  if (!match || match.status === "taken_down") throw previewNotFound();
  if (match.status === "published")
    return { release: null, publishedReleaseId: match.id };
  const personaCredits = demoCreditSummariesOfRelease(match.id);
  // The owner opening their own link reads the owner view (every track,
  // the owner fields), still marked as a preview.
  if (match.isOwner)
    return {
      release: { ...forViewer(match), personaCredits, isPreview: true },
      publishedReleaseId: null,
    };
  return {
    release: {
      ...match,
      tracks: playableTracksOf(match),
      personaCredits,
      isOwner: false,
      isPreview: true,
      isReminderSet:
        match.status === "scheduled" && demoIsReminderSet(match.id),
      hasUnnotedChanges: false,
      previewToken: null,
      previewLinkCreatedAt: null,
      rightsConfirmedAt: null,
      takedownReason: null,
      sceneId: null,
      dispute: null,
      canDispute: false,
    },
    publishedReleaseId: null,
  };
}
