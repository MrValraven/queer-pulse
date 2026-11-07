import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../shared/api/client";
import type {
  CreateVjClipBody,
  CreateVjSceneBody,
  CreateVjSetlistBody,
  UpdateVjClipBody,
  UpdateVjSceneBody,
  VjClipDTO,
  VjClipDeletedDTO,
  VjClipListDTO,
  VjClipMediaListDTO,
  VjEventOptionListDTO,
  VjPackClipsDTO,
  VjPackDTO,
  VjPackDeletedDTO,
  VjPackEventDTO,
  VjPackListDTO,
  VjPackMediaDTO,
  VjSceneDTO,
  VjSceneDeletedDTO,
  VjSceneListDTO,
  VjSetlistDTO,
  VjSetlistDeletedDTO,
  VjSetlistListDTO,
} from "../../../shared/contracts/vj";

const VJ_BASE = "/admin/vj";

function packPath(packId: string): string {
  return `${VJ_BASE}/packs/${encodeURIComponent(packId)}`;
}

function clipPath(clipId: string): string {
  return `${VJ_BASE}/clips/${encodeURIComponent(clipId)}`;
}

function scenePath(sceneId: string): string {
  return `${VJ_BASE}/scenes/${encodeURIComponent(sceneId)}`;
}

function setlistPath(setlistId: string): string {
  return `${VJ_BASE}/setlists/${encodeURIComponent(setlistId)}`;
}

export function getVjPacks(signal?: AbortSignal): Promise<VjPackListDTO> {
  return apiGet<VjPackListDTO>(
    `${VJ_BASE}/packs`,
    undefined,
    undefined,
    signal,
  );
}

export function createVjPack(body: { name: string }): Promise<VjPackDTO> {
  return apiPost<VjPackDTO>(`${VJ_BASE}/packs`, body);
}

export function renameVjPack(
  packId: string,
  body: { name: string },
): Promise<VjPackDTO> {
  return apiPatch<VjPackDTO>(packPath(packId), body);
}

export function reorderVjPacks(body: {
  packIds: string[];
}): Promise<VjPackListDTO> {
  return apiPatch<VjPackListDTO>(`${VJ_BASE}/packs/reorder`, body);
}

export function deleteVjPack(packId: string): Promise<VjPackDeletedDTO> {
  return apiDelete<VjPackDeletedDTO>(packPath(packId));
}

export function getVjPackClips(
  packId: string,
  signal?: AbortSignal,
): Promise<VjPackClipsDTO> {
  return apiGet<VjPackClipsDTO>(
    `${packPath(packId)}/clips`,
    undefined,
    undefined,
    signal,
  );
}

/** The screen's preload source. `clipIds` narrows the answer to those clips; a
 *  null or empty list asks for the whole pack. */
export function getVjPackMedia(
  packId: string,
  clipIds: string[] | null,
  signal?: AbortSignal,
): Promise<VjPackMediaDTO> {
  const query =
    clipIds !== null && clipIds.length > 0
      ? `?clipIds=${clipIds.map((clipId) => encodeURIComponent(clipId)).join(",")}`
      : "";
  return apiGet<VjPackMediaDTO>(
    `${packPath(packId)}/media${query}`,
    undefined,
    undefined,
    signal,
  );
}

export function addVjPackClip(
  packId: string,
  body: { clipId: string },
): Promise<VjPackClipsDTO> {
  return apiPost<VjPackClipsDTO>(`${packPath(packId)}/clips`, body);
}

export function reorderVjPackClips(
  packId: string,
  body: { clipIds: string[] },
): Promise<VjPackClipsDTO> {
  return apiPatch<VjPackClipsDTO>(`${packPath(packId)}/clips/reorder`, body);
}

export function removeVjPackClip(
  packId: string,
  clipId: string,
): Promise<VjPackClipsDTO> {
  return apiDelete<VjPackClipsDTO>(
    `${packPath(packId)}/clips/${encodeURIComponent(clipId)}`,
  );
}

export function getVjClips(signal?: AbortSignal): Promise<VjClipListDTO> {
  return apiGet<VjClipListDTO>(
    `${VJ_BASE}/clips`,
    undefined,
    undefined,
    signal,
  );
}

export function createVjClip(body: CreateVjClipBody): Promise<VjClipDTO> {
  return apiPost<VjClipDTO>(`${VJ_BASE}/clips`, body);
}

export function updateVjClip(
  clipId: string,
  body: UpdateVjClipBody,
): Promise<VjClipDTO> {
  return apiPatch<VjClipDTO>(clipPath(clipId), body);
}

export function deleteVjClip(clipId: string): Promise<VjClipDeletedDTO> {
  return apiDelete<VjClipDeletedDTO>(clipPath(clipId));
}

// Clips: preview and media outside a pack
export function setVjClipPreview(
  clipId: string,
  body: { previewStorageKey: string },
): Promise<VjClipDTO> {
  return apiPut<VjClipDTO>(`${clipPath(clipId)}/preview`, body);
}

/** Media of the listed clips, in the order asked; unknown ids are left out of
 *  the answer. Callers send 1 to 200 ids. */
export function getVjClipsMedia(
  clipIds: string[],
  signal?: AbortSignal,
): Promise<VjClipMediaListDTO> {
  const query = clipIds.map((clipId) => encodeURIComponent(clipId)).join(",");
  return apiGet<VjClipMediaListDTO>(
    `${VJ_BASE}/clips/media?clipIds=${query}`,
    undefined,
    undefined,
    signal,
  );
}

// Packs: event link
export function getVjPackEvent(
  packId: string,
  signal?: AbortSignal,
): Promise<VjPackEventDTO> {
  return apiGet<VjPackEventDTO>(
    `${packPath(packId)}/event`,
    undefined,
    undefined,
    signal,
  );
}

/** Links the pack to an event; `eventId: null` unlinks it. */
export function setVjPackEvent(
  packId: string,
  body: { eventId: string | null },
): Promise<VjPackDTO> {
  return apiPatch<VjPackDTO>(`${packPath(packId)}/event`, body);
}

// Events
export function getVjUpcomingEvents(
  signal?: AbortSignal,
): Promise<VjEventOptionListDTO> {
  return apiGet<VjEventOptionListDTO>(
    `${VJ_BASE}/events/upcoming`,
    undefined,
    undefined,
    signal,
  );
}

// Scenes
export function getVjScenes(signal?: AbortSignal): Promise<VjSceneListDTO> {
  return apiGet<VjSceneListDTO>(
    `${VJ_BASE}/scenes`,
    undefined,
    undefined,
    signal,
  );
}

export function createVjScene(body: CreateVjSceneBody): Promise<VjSceneDTO> {
  return apiPost<VjSceneDTO>(`${VJ_BASE}/scenes`, body);
}

export function updateVjScene(
  sceneId: string,
  body: UpdateVjSceneBody,
): Promise<VjSceneDTO> {
  return apiPatch<VjSceneDTO>(scenePath(sceneId), body);
}

export function reorderVjScenes(body: {
  sceneIds: string[];
}): Promise<VjSceneListDTO> {
  return apiPatch<VjSceneListDTO>(`${VJ_BASE}/scenes/reorder`, body);
}

export function deleteVjScene(sceneId: string): Promise<VjSceneDeletedDTO> {
  return apiDelete<VjSceneDeletedDTO>(scenePath(sceneId));
}

// Set lists
export function getVjSetlists(signal?: AbortSignal): Promise<VjSetlistListDTO> {
  return apiGet<VjSetlistListDTO>(
    `${VJ_BASE}/setlists`,
    undefined,
    undefined,
    signal,
  );
}

export function createVjSetlist(
  body: CreateVjSetlistBody,
): Promise<VjSetlistDTO> {
  return apiPost<VjSetlistDTO>(`${VJ_BASE}/setlists`, body);
}

export function renameVjSetlist(
  setlistId: string,
  body: { name: string },
): Promise<VjSetlistDTO> {
  return apiPatch<VjSetlistDTO>(setlistPath(setlistId), body);
}

export function reorderVjSetlists(body: {
  setlistIds: string[];
}): Promise<VjSetlistListDTO> {
  return apiPatch<VjSetlistListDTO>(`${VJ_BASE}/setlists/reorder`, body);
}

/** Replaces the whole item list. The server re-creates every item id, and a
 *  scene may appear more than once. */
export function setVjSetlistItems(
  setlistId: string,
  body: { sceneIds: string[] },
): Promise<VjSetlistDTO> {
  return apiPut<VjSetlistDTO>(`${setlistPath(setlistId)}/items`, body);
}

export function deleteVjSetlist(
  setlistId: string,
): Promise<VjSetlistDeletedDTO> {
  return apiDelete<VjSetlistDeletedDTO>(setlistPath(setlistId));
}
