import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type {
  AdminStickerPackResponse,
  StickerResponse,
} from "../../../shared/contracts/contracts";

/** GET /admin/sticker-packs: every pack regardless of status, for the
 *  builder's pack list. */
export const getAdminStickerPacks = () =>
  apiGet<AdminStickerPackResponse[]>("/admin/sticker-packs");

export interface CreateStickerPackBody {
  slug: string;
  name: string;
  description?: string;
}

/** POST /admin/sticker-packs: creates a new draft pack. */
export const createStickerPack = (body: CreateStickerPackBody) =>
  apiPost<AdminStickerPackResponse>("/admin/sticker-packs", body);

export interface UpdateStickerPackBody {
  name?: string;
  description?: string;
  status?: "draft" | "published" | "archived";
  sortOrder?: number;
  coverStickerId?: string;
}

/** PATCH /admin/sticker-packs/:packId: renames, redescribes, publishes/
 *  archives, reorders, or sets the cover of an existing pack. */
export const updateStickerPack = (
  packId: string,
  body: UpdateStickerPackBody,
) => apiPatch<AdminStickerPackResponse>(`/admin/sticker-packs/${packId}`, body);

export interface AddStickerBody {
  slug: string;
  label: string;
  storageKey: string;
  width: number;
  height: number;
  svgSource: string;
  templateId: string;
  templateParams: Record<string, unknown>;
  keywords?: { en: string[]; pt: string[] };
}

/** POST /admin/sticker-packs/:packId/stickers: adds a rendered sticker to a
 *  pack. */
export const addSticker = (packId: string, body: AddStickerBody) =>
  apiPost<StickerResponse>(`/admin/sticker-packs/${packId}/stickers`, body);

/** DELETE /admin/sticker-packs/:packId/stickers/:stickerId: removes one
 *  sticker from a pack. */
export const removeSticker = (packId: string, stickerId: string) =>
  apiDelete<void>(`/admin/sticker-packs/${packId}/stickers/${stickerId}`);

/** POST /admin/sticker-packs/:packId/stickers/reorder: persists the
 *  builder's drag-reordered sticker order within a pack. */
export const reorderStickers = (packId: string, stickerIds: string[]) =>
  apiPost<AdminStickerPackResponse>(
    `/admin/sticker-packs/${packId}/stickers/reorder`,
    { stickerIds },
  );
