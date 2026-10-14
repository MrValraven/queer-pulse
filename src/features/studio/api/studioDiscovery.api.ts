import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";
import type {
  CreateStudioPersonaCreditBody,
  StudioAppearsOnCardDTO,
  StudioArtistRefDTO,
  StudioCreditCandidateDTO,
  StudioCreditInboxDTO,
  StudioCreditInboxRowDTO,
  StudioCreditPendingCountDTO,
  StudioCurationDTO,
  StudioMoodsDTO,
  StudioPageDTO,
  StudioPersonaCreditOwnerRowDTO,
  StudioRadioDTO,
  StudioRadioFilter,
  StudioReleaseCardDTO,
  StudioSceneCardDTO,
  StudioSceneDTO,
} from "./studio.types";

// One raw call per discovery endpoint
// (QUEERPULSE-STUDIO-DISCOVERY-CONTRACT-2026-10-13.md). The radio read is the
// only one that touches listening, and it carries the filter alone.

const segment = (value: string) => encodeURIComponent(value);

function withCursor(path: string, cursor: string | null): string {
  return cursor ? `${path}?cursor=${segment(cursor)}` : path;
}

export const getStudioMoods = () => apiGet<StudioMoodsDTO>("/studio/moods");

export const getStudioCuration = () =>
  apiGet<StudioCurationDTO>("/studio/curation");

export const getStudioScenes = () =>
  apiGet<{ items: StudioSceneCardDTO[] }>("/studio/scenes");

/** 404 `studio_scene_not_found` for an unknown or archived slug. */
export const getStudioScene = (slug: string) =>
  apiGet<StudioSceneDTO>(`/studio/scenes/${segment(slug)}`);

export const getStudioSceneReleases = (slug: string, cursor: string | null) =>
  apiGet<StudioPageDTO<StudioReleaseCardDTO>>(
    withCursor(`/studio/scenes/${segment(slug)}/releases`, cursor),
  );

/** The persona's public card for an exact handle, or 404. */
export const getStudioCreditCandidate = (handle: string) =>
  apiGet<StudioCreditCandidateDTO>(
    `/studio/credit-candidates/${segment(handle)}`,
  );

export const getStudioTrackPersonaCredits = (trackId: string) =>
  apiGet<{ items: StudioPersonaCreditOwnerRowDTO[] }>(
    `/studio/tracks/${segment(trackId)}/persona-credits`,
  );

export const createStudioTrackPersonaCredit = (
  trackId: string,
  body: CreateStudioPersonaCreditBody,
) =>
  apiPost<StudioPersonaCreditOwnerRowDTO>(
    `/studio/tracks/${segment(trackId)}/persona-credits`,
    body,
  );

export const deleteStudioTrackPersonaCredit = (
  trackId: string,
  creditId: string,
) =>
  apiDelete<void>(
    `/studio/tracks/${segment(trackId)}/persona-credits/${segment(creditId)}`,
  );

export const getStudioCreditInbox = () =>
  apiGet<StudioCreditInboxDTO>("/studio/credits/inbox");

export const getStudioCreditPendingCount = () =>
  apiGet<StudioCreditPendingCountDTO>("/studio/credits/pending-count");

export const acceptStudioCredit = (creditId: string) =>
  apiPost<StudioCreditInboxRowDTO>(
    `/studio/credits/${segment(creditId)}/accept`,
  );

export const declineStudioCredit = (creditId: string) =>
  apiPost<void>(`/studio/credits/${segment(creditId)}/decline`);

/** Either side: the credited persona removes an accepted credit here. */
export const deleteStudioCredit = (creditId: string) =>
  apiDelete<void>(`/studio/credits/${segment(creditId)}`);

export const getStudioAppearsOn = (
  subprofileId: string,
  cursor: string | null,
) =>
  apiGet<StudioPageDTO<StudioAppearsOnCardDTO>>(
    withCursor(`/studio/artists/${segment(subprofileId)}/appears-on`, cursor),
  );

export const getStudioRelatedArtists = (subprofileId: string) =>
  apiGet<{ items: StudioArtistRefDTO[] }>(
    `/studio/artists/${segment(subprofileId)}/related`,
  );

/** Exactly one filter. The server answers `Cache-Control: private,
 *  no-store`, and the caller keeps the answer out of the query cache. */
export function getStudioRadio(filter: StudioRadioFilter) {
  const params = new URLSearchParams();
  params.set(filter.kind, filter.value);
  return apiGet<StudioRadioDTO>(`/studio/radio?${params.toString()}`);
}
