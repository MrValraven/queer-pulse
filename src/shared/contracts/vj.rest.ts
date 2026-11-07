/**
 * VJ wire contract (C 3), frontend mirror of
 * `queerpulse-backend/src/vj/vj.contract.ts` and `vj-response.ts`. Names and
 * values match it; edit both together.
 * REST response shapes and bodies (C 6.1). Dates are ISO 8601 strings; no
 * response carries a storage key.
 */

import type {
  VjClipMimeType,
  VjFitMode,
  VjLoopMode,
  VjMediaKind,
  VjSpeed,
} from "./vj.lists";
import type { VjSceneLook } from "./vj.state";

export interface VjCreatorDTO {
  userId: string;
  displayName: string;
}

export interface VjPackEventSummaryDTO {
  id: string;
  title: string;
  /** ISO. */
  startAt: string;
  /** False once the event is cancelled, unpublished or no longer public or members. */
  isAvailable: boolean;
}

export interface VjPackDTO {
  id: string;
  name: string;
  position: number;
  clipCount: number;
  /** Sum of its clips' byte_size; 0 when empty. */
  totalByteSize: number;
  /** Thumbnail of the clip at position 0. */
  coverThumbnailUrl: string | null;
  createdBy: VjCreatorDTO | null;
  createdAt: string;
  updatedAt: string;
  /** Null when event_id is null. */
  event: VjPackEventSummaryDTO | null;
}

export interface VjClipDTO {
  id: string;
  title: string;
  mediaKind: VjMediaKind;
  mimeType: VjClipMimeType;
  byteSize: number;
  width: number;
  height: number;
  /** Null for a GIF. */
  durationMs: number | null;
  fitMode: VjFitMode;
  thumbnailUrl: string;
  /** Admin-only /files URL for library preview. */
  mediaUrl: string;
  /** Every pack holding it, in pack position order. */
  packIds: string[];
  /** packIds.length; the delete dialog's count. */
  packCount: number;
  createdBy: VjCreatorDTO | null;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  defaultSpeed: VjSpeed;
  loopInMs: number | null;
  loopOutMs: number | null;
  loopMode: VjLoopMode;
  /** toImageUrl(previewStorageKey), admin-only /files URL; null with no preview. */
  previewUrl: string | null;
}

/** Position order. */
export interface VjPackListDTO {
  items: VjPackDTO[];
}
/** created_at DESC, id DESC. */
export interface VjClipListDTO {
  items: VjClipDTO[];
}
/** Pack order. */
export interface VjPackClipsDTO {
  pack: VjPackDTO;
  items: VjClipDTO[];
}

export interface VjClipMediaDTO {
  clipId: string;
  /** Presigned GET, fetch with credentials: "omit". */
  url: string;
  /** ISO; the URL works for a fetch that starts before it. */
  expiresAt: string;
  mimeType: VjClipMimeType;
  byteSize: number;
}
export interface VjPackMediaDTO {
  packId: string;
  /** Pack order. */
  items: VjClipMediaDTO[];
}
/** In the order of the query's clipIds. */
export interface VjClipMediaListDTO {
  items: VjClipMediaDTO[];
}

export interface VjPackDeletedDTO {
  deletedPackId: string;
  clipsKeptCount: number;
}
export interface VjClipDeletedDTO {
  deletedClipId: string;
  removedFromPackCount: number;
}

/** Body of POST /admin/vj/clips. The server derives mimeType, mediaKind and byteSize. */
export interface CreateVjClipBody {
  /** The file name without extension, cut to 120 code points by the frontend. */
  title: string;
  /** From the vj_clip presign. */
  storageKey: string;
  /** From the vj_thumbnail presign. */
  thumbnailStorageKey: string;
  width: number;
  height: number;
  /** Integer ms for a video, null for a GIF. */
  durationMs: number | null;
  /** Default "fill". */
  fitMode?: VjFitMode;
  /** When set, the clip is appended to that pack in the same transaction. */
  packId?: string | null;
}

// Events (the pack's linked event and the event card)

export interface VjEventOptionDTO {
  id: string;
  title: string;
  startAt: string;
  endAt: string | null;
  /** The event's neighbourhood; null when unset. */
  area: string | null;
  isOnline: boolean;
}
/** start_at ASC, id ASC. */
export interface VjEventOptionListDTO {
  items: VjEventOptionDTO[];
}

export interface VjEventCardDTO {
  eventId: string;
  title: string;
  startAt: string;
  endAt: string | null;
  /** IANA zone the host set, for the date line. */
  timezone: string;
  area: string | null;
  isOnline: boolean;
  /** `${app.frontendUrl}${gatheringPath(slug)}` (src/events/event-paths.ts); null when FRONTEND_URL is unset. */
  publicUrl: string | null;
}

export const VJ_EVENT_CARD_UNAVAILABLE_REASONS = [
  "cancelled",
  "not_listed",
] as const;
export type VjEventCardUnavailableReason =
  (typeof VJ_EVENT_CARD_UNAVAILABLE_REASONS)[number];

export interface VjPackEventDTO {
  packId: string;
  /** Null when the pack links no event, or the linked event is unavailable. */
  card: VjEventCardDTO | null;
  /** Set only when the pack links an event the card may not show. */
  unavailableReason: VjEventCardUnavailableReason | null;
}

// Scenes and set lists

export interface VjSceneDTO {
  id: string;
  name: string;
  packId: string | null;
  position: number;
  look: VjSceneLook;
  /** How many set list items name this scene; the delete dialog's count. */
  setlistItemCount: number;
  createdBy: VjCreatorDTO | null;
  createdAt: string;
  updatedAt: string;
}
/** position ASC, id ASC. */
export interface VjSceneListDTO {
  items: VjSceneDTO[];
}
export interface VjSceneDeletedDTO {
  deletedSceneId: string;
  removedFromSetlistCount: number;
}

export interface VjSetlistItemDTO {
  id: string;
  sceneId: string;
  position: number;
}
export interface VjSetlistDTO {
  id: string;
  name: string;
  position: number;
  /** position ASC, id ASC. */
  items: VjSetlistItemDTO[];
  createdBy: VjCreatorDTO | null;
  createdAt: string;
  updatedAt: string;
}
/** position ASC, id ASC. */
export interface VjSetlistListDTO {
  items: VjSetlistDTO[];
}
export interface VjSetlistDeletedDTO {
  deletedSetlistId: string;
}

// Request bodies

export interface UpdateVjClipBody {
  title?: string;
  fitMode?: VjFitMode;
  isFavorite?: boolean;
  defaultSpeed?: VjSpeed;
  loopInMs?: number | null;
  loopOutMs?: number | null;
  loopMode?: VjLoopMode;
}
export interface CreateVjSceneBody {
  name: string;
  packId?: string | null;
  look: VjSceneLook;
}
export interface UpdateVjSceneBody {
  name?: string;
  packId?: string | null;
  look?: VjSceneLook;
}
export interface CreateVjSetlistBody {
  name: string;
  sceneIds?: string[];
}
