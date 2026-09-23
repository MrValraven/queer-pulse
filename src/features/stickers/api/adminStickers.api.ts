import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type {
  AdminStickerPackResponse,
  AdminStickerResponse,
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
 *  pack. The backend answers with the member-facing sticker shape (no
 *  template or order fields); read the refetched pack list for those. */
export const addSticker = (packId: string, body: AddStickerBody) =>
  apiPost<StickerResponse>(`/admin/sticker-packs/${packId}/stickers`, body);

export interface UpdateStickerBody {
  label?: string;
  keywords?: { en: string[]; pt: string[] };
  /** A redrawn artwork replaces the file, size, source and template params
   *  together, so the sticker keeps its id, order and cover status. */
  artwork?: {
    storageKey: string;
    width: number;
    height: number;
    svgSource: string;
    templateId: string;
    templateParams: Record<string, unknown>;
  };
}

/** PATCH /admin/sticker-packs/:packId/stickers/:stickerId: relabels,
 *  rewords, or redraws one sticker in place. */
export const updateSticker = (
  packId: string,
  stickerId: string,
  body: UpdateStickerBody,
) =>
  apiPatch<AdminStickerResponse>(
    `/admin/sticker-packs/${packId}/stickers/${stickerId}`,
    body,
  );

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

/** DELETE /admin/sticker-packs/:packId: deletes a draft pack. The backend
 *  checks the pack's current status and answers 409 for any pack that is
 *  published or archived right now; archiving withdraws those. A pack moved
 *  back to draft can be deleted, even if members used it while it was live. */
export const deleteStickerPack = (packId: string) =>
  apiDelete<void>(`/admin/sticker-packs/${packId}`);
