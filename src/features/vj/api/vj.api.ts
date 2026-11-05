import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type {
  CreateVjClipBody,
  VjClipDTO,
  VjClipDeletedDTO,
  VjClipListDTO,
  VjFitMode,
  VjPackClipsDTO,
  VjPackDTO,
  VjPackDeletedDTO,
  VjPackListDTO,
  VjPackMediaDTO,
} from "../../../shared/contracts/vj";

const VJ_BASE = "/admin/vj";

function packPath(packId: string): string {
  return `${VJ_BASE}/packs/${encodeURIComponent(packId)}`;
}

function clipPath(clipId: string): string {
  return `${VJ_BASE}/clips/${encodeURIComponent(clipId)}`;
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
  body: { title?: string; fitMode?: VjFitMode },
): Promise<VjClipDTO> {
  return apiPatch<VjClipDTO>(clipPath(clipId), body);
}

export function deleteVjClip(clipId: string): Promise<VjClipDeletedDTO> {
  return apiDelete<VjClipDeletedDTO>(clipPath(clipId));
}
