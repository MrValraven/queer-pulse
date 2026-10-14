import {
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../shared/api/client";
import {
  STUDIO_ERROR_CODES,
  type CreateStudioReleaseBody,
  type CreateStudioTrackBody,
  type StudioArtistDTO,
  type StudioArtistStatsDTO,
  type StudioErrorCode,
  type StudioFormat,
  type StudioFormatsDTO,
  type StudioGenre,
  type StudioGenresDTO,
  type StudioLatestEpisodesPageDTO,
  type StudioMeDTO,
  type StudioMood,
  type StudioPageDTO,
  type StudioReleaseCardDTO,
  type StudioReleaseDTO,
  type StudioSearchResultDTO,
  type StudioSearchType,
  type StudioStreamDTO,
  type StudioTrackDTO,
  type UpdateStudioReleaseBody,
  type UpdateStudioTrackBody,
} from "./studio.types";

// One raw call per endpoint of the Studio v1 wire contract
// (QUEERPULSE-STUDIO-V1-CONTRACT-2026-10-08.md). Nothing here records what a
// member plays: the stream call hands back a signed URL and that is all.

const segment = (id: string) => encodeURIComponent(id);

/** GET /studio/me. Answers without the access guard, so a member with no
 *  grant gets `{ hasAccess: false }` here and a 403 everywhere else. */
export const getStudioMe = () => apiGet<StudioMeDTO>("/studio/me");

export function getStudioReleases(
  cursor: string | null,
  genre: StudioGenre | null = null,
  mood: StudioMood | null = null,
  format: StudioFormat | null = null,
) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (genre) params.set("genre", genre);
  if (mood) params.set("mood", mood);
  if (format) params.set("format", format);
  const query = params.toString();
  return apiGet<StudioPageDTO<StudioReleaseCardDTO>>(
    `/studio/releases${query ? `?${query}` : ""}`,
  );
}

export function searchStudio(
  query: string,
  type: StudioSearchType,
  genre: StudioGenre | null,
  signal?: AbortSignal,
  mood: StudioMood | null = null,
  format: StudioFormat | null = null,
) {
  const params = new URLSearchParams({ q: query });
  if (type !== "all") params.set("type", type);
  if (genre) params.set("genre", genre);
  if (mood) params.set("mood", mood);
  if (format) params.set("format", format);
  return apiGet<StudioSearchResultDTO>(
    `/studio/search?${params.toString()}`,
    undefined,
    undefined,
    signal,
  );
}

export const getStudioRelease = (releaseId: string) =>
  apiGet<StudioReleaseDTO>(`/studio/releases/${segment(releaseId)}`);

export const getStudioArtist = (subprofileId: string) =>
  apiGet<StudioArtistDTO>(`/studio/artists/${segment(subprofileId)}`);

export const getStudioTrack = (trackId: string) =>
  apiGet<StudioTrackDTO>(`/studio/tracks/${segment(trackId)}`);

/** Genres with at least one listenable published release (no counts). */
export const getStudioGenres = () => apiGet<StudioGenresDTO>("/studio/genres");

/** Artist kinds: formats with published content, in map order. */
export const getStudioFormats = () =>
  apiGet<StudioFormatsDTO>("/studio/formats");

/** Artist kinds: the newest published episodes across listenable shows. The
 *  home shelf reads one page. */
export const getStudioLatestEpisodes = (limit: number) =>
  apiGet<StudioLatestEpisodesPageDTO>(
    `/studio/episodes/latest?limit=${encodeURIComponent(String(limit))}`,
  );

/** Owners and co-owners only; anyone else gets a 404. */
export const getStudioArtistStats = (subprofileId: string) =>
  apiGet<StudioArtistStatsDTO>(
    `/studio/artists/${segment(subprofileId)}/stats`,
  );

/** A presigned GET valid for 15 minutes. Never cached: callers hold it in
 *  memory for the one track that is loading. */
export const getStudioStream = (trackId: string) =>
  apiGet<StudioStreamDTO>(`/studio/tracks/${segment(trackId)}/stream`);

export const createStudioRelease = (body: CreateStudioReleaseBody) =>
  apiPost<StudioReleaseDTO>("/studio/releases", body);

export const updateStudioRelease = (
  releaseId: string,
  body: UpdateStudioReleaseBody,
) => apiPatch<StudioReleaseDTO>(`/studio/releases/${segment(releaseId)}`, body);

export const deleteStudioRelease = (releaseId: string) =>
  apiDelete<void>(`/studio/releases/${segment(releaseId)}`);

export const createStudioTrack = (
  releaseId: string,
  body: CreateStudioTrackBody,
) =>
  apiPost<StudioTrackDTO>(
    `/studio/releases/${segment(releaseId)}/tracks`,
    body,
  );

export const updateStudioTrack = (
  trackId: string,
  body: UpdateStudioTrackBody,
) => apiPatch<StudioTrackDTO>(`/studio/tracks/${segment(trackId)}`, body);

export const deleteStudioTrack = (trackId: string) =>
  apiDelete<void>(`/studio/tracks/${segment(trackId)}`);

export const putStudioTrackOrder = (releaseId: string, trackIds: string[]) =>
  apiPut<StudioReleaseDTO>(
    `/studio/releases/${segment(releaseId)}/track-order`,
    { trackIds },
  );

export const confirmStudioTrackAudio = (trackId: string, key: string) =>
  apiPost<StudioTrackDTO>(`/studio/tracks/${segment(trackId)}/audio`, { key });

/** Artist kinds: publishes one draft episode of a live show. */
export const publishStudioTrack = (trackId: string) =>
  apiPost<StudioTrackDTO>(`/studio/tracks/${segment(trackId)}/publish`);

export const publishStudioRelease = (releaseId: string) =>
  apiPost<StudioReleaseDTO>(`/studio/releases/${segment(releaseId)}/publish`);

export const unpublishStudioRelease = (releaseId: string) =>
  apiPost<StudioReleaseDTO>(`/studio/releases/${segment(releaseId)}/unpublish`);

const KNOWN_ERROR_CODES: ReadonlySet<string> = new Set(STUDIO_ERROR_CODES);

/** The contract's stable `code` from an error body, when it is one of ours. */
export function studioErrorCodeOf(error: unknown): StudioErrorCode | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.data;
  if (!body || typeof body !== "object" || !("code" in body)) return null;
  const code = (body as { code?: unknown }).code;
  return typeof code === "string" && KNOWN_ERROR_CODES.has(code)
    ? (code as StudioErrorCode)
    : null;
}

/** A missing release or track, a draft, or one whose persona is gone, asked
 *  for by someone who does not own it: the contract answers all of them with
 *  404. A release our team took down answers 410 (`isStudioWithdrawn`). */
export function isStudioNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

/** A taken-down release, or one of its tracks, asked for by a listener: the
 *  server answers 410 with `code: studio_release_withdrawn` and names
 *  nothing else. A 410 without that code is an ordinary failure. */
export function isStudioWithdrawn(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 410 &&
    studioErrorCodeOf(error) === "studio_release_withdrawn"
  );
}
