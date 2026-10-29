import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type {
  StudioCurationShelf,
  StudioPageDTO,
  StudioReleaseCardDTO,
  StudioReleaseStatus,
  StudioSceneStatus,
} from "../../studio/api/studio.types";

/**
 * Studio discovery's staff surface, mirroring the backend's admin studio
 * curation and scenes controllers
 * (QUEERPULSE-STUDIO-DISCOVERY-CONTRACT-2026-10-13.md, "Admin"). Every route
 * admits Moderator and Admin; the curation and scenes routes also admit a
 * member holding the `music_manager_producer` staff grant.
 */

export type AdminStudioReleaseCardDTO = StudioReleaseCardDTO & {
  status: StudioReleaseStatus;
};

export interface AdminStudioPickDTO {
  id: string;
  shelf: StudioCurationShelf;
  /** 1-based, contiguous per shelf. */
  position: number;
  note: string | null;
  /** The console shows the age from it. */
  createdAt: string;
  /** Published with a listenable persona; staff see blocks ignored. */
  isListenable: boolean;
  release: AdminStudioReleaseCardDTO;
}

/** Every row, listenable or hidden. `featured` holds 0 or 1. */
export interface AdminStudioCurationDTO {
  featured: AdminStudioPickDTO[];
  staffPicks: AdminStudioPickDTO[];
  newThisWeek: AdminStudioPickDTO[];
}

export interface AdminStudioSceneDTO {
  id: string;
  slug: string;
  name: string;
  city: string;
  blurb: string | null;
  coverUrl: string | null;
  status: StudioSceneStatus;
  position: number;
  /** Releases with this scene, any status. */
  releaseCount: number;
  pinnedEventCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStudioSceneEventDTO {
  eventId: string;
  slug: string;
  title: string;
  startAt: string;
  venue: string | null;
  neighbourhood: string | null;
  /** Pins stay after the event passes; the member read skips them. */
  isUpcoming: boolean;
  pinnedAt: string;
}

export interface AdminStudioEventOptionDTO {
  id: string;
  slug: string;
  title: string;
  startAt: string;
  venue: string | null;
  neighbourhood: string | null;
}

export interface CreateAdminStudioPickBody {
  shelf: StudioCurationShelf;
  releaseId: string;
  note?: string | null;
}
export interface UpdateAdminStudioPickBody {
  note: string | null;
}
/** Every pick of the shelf exactly once. */
export interface ReorderAdminStudioPicksBody {
  pickIds: string[];
}
export interface CreateAdminStudioSceneBody {
  name: string;
  city: string;
  slug?: string;
  blurb?: string | null;
  coverKey?: string | null;
}
export interface UpdateAdminStudioSceneBody {
  name?: string;
  city?: string;
  slug?: string;
  blurb?: string | null;
  coverKey?: string | null;
}
/** Every active scene exactly once. */
export interface ReorderAdminStudioScenesBody {
  sceneIds: string[];
}
export interface PinAdminStudioSceneEventBody {
  eventId: string;
}

const CURATION_PATH = "/admin/studio/curation";
const SCENES_PATH = "/admin/studio/scenes";
const segment = (value: string) => encodeURIComponent(value);
const searchQuery = (query: string) => `q=${encodeURIComponent(query)}`;
const scenePath = (sceneId: string) => `${SCENES_PATH}/${segment(sceneId)}`;

export const getAdminStudioCuration = () =>
  apiGet<AdminStudioCurationDTO>(CURATION_PATH);

export const searchAdminStudioReleases = (query: string) =>
  apiGet<{ items: AdminStudioReleaseCardDTO[] }>(
    `${CURATION_PATH}/release-search?${searchQuery(query)}`,
  );

/** Posting to `featured` replaces the current featured pick. */
export const createAdminStudioPick = (body: CreateAdminStudioPickBody) =>
  apiPost<AdminStudioPickDTO>(`${CURATION_PATH}/picks`, body);

export const updateAdminStudioPick = (
  pickId: string,
  body: UpdateAdminStudioPickBody,
) =>
  apiPatch<AdminStudioPickDTO>(
    `${CURATION_PATH}/picks/${segment(pickId)}`,
    body,
  );

export const deleteAdminStudioPick = (pickId: string) =>
  apiDelete<void>(`${CURATION_PATH}/picks/${segment(pickId)}`);

export const reorderAdminStudioPicks = (
  shelf: StudioCurationShelf,
  body: ReorderAdminStudioPicksBody,
) =>
  apiPost<AdminStudioPickDTO[]>(
    `${CURATION_PATH}/shelves/${segment(shelf)}/reorder`,
    body,
  );

export const getAdminStudioScenes = () =>
  apiGet<AdminStudioSceneDTO[]>(SCENES_PATH);

export const createAdminStudioScene = (body: CreateAdminStudioSceneBody) =>
  apiPost<AdminStudioSceneDTO>(SCENES_PATH, body);

export const updateAdminStudioScene = (
  sceneId: string,
  body: UpdateAdminStudioSceneBody,
) => apiPatch<AdminStudioSceneDTO>(scenePath(sceneId), body);

export const archiveAdminStudioScene = (sceneId: string) =>
  apiPost<AdminStudioSceneDTO>(`${scenePath(sceneId)}/archive`);

export const restoreAdminStudioScene = (sceneId: string) =>
  apiPost<AdminStudioSceneDTO>(`${scenePath(sceneId)}/restore`);

export const reorderAdminStudioScenes = (body: ReorderAdminStudioScenesBody) =>
  apiPost<AdminStudioSceneDTO[]>(`${SCENES_PATH}/reorder`, body);

export const searchAdminStudioEvents = (query: string) =>
  apiGet<{ items: AdminStudioEventOptionDTO[] }>(
    `${SCENES_PATH}/event-search?${searchQuery(query)}`,
  );

export const getAdminStudioSceneEvents = (sceneId: string) =>
  apiGet<AdminStudioSceneEventDTO[]>(`${scenePath(sceneId)}/events`);

/** Idempotent: pinning twice answers the same list. */
export const pinAdminStudioSceneEvent = (
  sceneId: string,
  body: PinAdminStudioSceneEventBody,
) => apiPost<AdminStudioSceneEventDTO[]>(`${scenePath(sceneId)}/events`, body);

export const unpinAdminStudioSceneEvent = (sceneId: string, eventId: string) =>
  apiDelete<void>(`${scenePath(sceneId)}/events/${segment(eventId)}`);

export const getAdminStudioSceneReleases = (
  sceneId: string,
  cursor: string | null,
) =>
  apiGet<StudioPageDTO<AdminStudioReleaseCardDTO>>(
    `${scenePath(sceneId)}/releases${cursor ? `?cursor=${segment(cursor)}` : ""}`,
  );

/** Sets the release's scene to none. */
export const removeAdminStudioSceneRelease = (
  sceneId: string,
  releaseId: string,
) => apiDelete<void>(`${scenePath(sceneId)}/releases/${segment(releaseId)}`);
