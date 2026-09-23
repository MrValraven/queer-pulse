import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type {
  AddStickerBody,
  CreateStickerPackBody,
  UpdateStickerPackBody,
} from "./adminStickers.api";
import {
  addSticker,
  createStickerPack,
  getAdminStickerPacks,
  removeSticker,
  reorderStickers,
  updateStickerPack,
} from "./adminStickers.api";

export const ADMIN_STICKER_PACKS_KEY = ["admin", "sticker-packs"];

/**
 * Every sticker pack regardless of status, for the admin builder's pack list.
 * LIVE ONLY: this is an admin-only endpoint (403s otherwise), so a demo
 * fixture would surface as platform truth for a role that cannot see the
 * real console. Disabled in demo mode; `isDemo` lets the builder render its
 * "available in live mode only" state.
 */
export function useAdminStickerPacks() {
  const { demoMode } = useDemoMode();

  const query = useQuery({
    queryKey: ADMIN_STICKER_PACKS_KEY,
    enabled: !demoMode,
    queryFn: getAdminStickerPacks,
  });

  return {
    ...query,
    packs: query.data ?? [],
    isDemo: demoMode,
  };
}

function useInvalidateAdminStickerPacks() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ADMIN_STICKER_PACKS_KEY });
}

/** Creates a new draft pack; invalidates the pack list on success. */
export function useCreateStickerPack() {
  const invalidate = useInvalidateAdminStickerPacks();

  return useMutation({
    mutationFn: (body: CreateStickerPackBody) => createStickerPack(body),
    onSuccess: invalidate,
  });
}

/** Renames, redescribes, publishes/archives, reorders, or sets the cover of
 *  an existing pack; invalidates the pack list on success. */
export function useUpdateStickerPack() {
  const invalidate = useInvalidateAdminStickerPacks();

  return useMutation({
    mutationFn: ({
      packId,
      body,
    }: {
      packId: string;
      body: UpdateStickerPackBody;
    }) => updateStickerPack(packId, body),
    onSuccess: invalidate,
  });
}

/** Adds a rendered sticker to a pack; invalidates the pack list on success. */
export function useAddSticker() {
  const invalidate = useInvalidateAdminStickerPacks();

  return useMutation({
    mutationFn: ({ packId, body }: { packId: string; body: AddStickerBody }) =>
      addSticker(packId, body),
    onSuccess: invalidate,
  });
}

/** Removes one sticker from a pack; invalidates the pack list on success. */
export function useRemoveSticker() {
  const invalidate = useInvalidateAdminStickerPacks();

  return useMutation({
    mutationFn: ({
      packId,
      stickerId,
    }: {
      packId: string;
      stickerId: string;
    }) => removeSticker(packId, stickerId),
    onSuccess: invalidate,
  });
}

/** Persists the builder's drag-reordered sticker order within a pack;
 *  invalidates the pack list on success. */
export function useReorderStickers() {
  const invalidate = useInvalidateAdminStickerPacks();

  return useMutation({
    mutationFn: ({
      packId,
      stickerIds,
    }: {
      packId: string;
      stickerIds: string[];
    }) => reorderStickers(packId, stickerIds),
    onSuccess: invalidate,
  });
}
