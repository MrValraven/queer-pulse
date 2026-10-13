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
  type StudioErrorCode,
  type StudioMeDTO,
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

export function getStudioReleases(cursor: string | null) {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiGet<StudioPageDTO<StudioReleaseCardDTO>>(
    `/studio/releases${query}`,
  );
}

export function searchStudio(
  query: string,
  type: StudioSearchType,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({ q: query });
  if (type !== "all") params.set("type", type);
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

/** A missing release or track, or a draft or taken-down one asked for by
 *  someone who does not own it: the contract answers all of them with 404. */
export function isStudioNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
