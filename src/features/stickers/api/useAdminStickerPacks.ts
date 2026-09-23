import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type {
  AddStickerBody,
  CreateStickerPackBody,
  UpdateStickerBody,
  UpdateStickerPackBody,
} from "./adminStickers.api";
import {
  addSticker,
  createStickerPack,
  deleteStickerPack,
  getAdminStickerPacks,
  removeSticker,
  reorderStickers,
  updateSticker,
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

/** The member catalogue `useStickerPacks` reads (every demo-mode variant). */
const MEMBER_STICKER_CATALOGUE_KEY = ["sticker-packs"];

/**
 * Refreshes the admin pack list and marks the member catalogue stale, so an
 * admin checking a publish or a redrawn sticker in their own chat sees it
 * without a reload. Only the admin list's refetch is returned (and awaited
 * by `mutateAsync`): the builder waits for its own list, and has no reason
 * to wait for a composer's catalogue.
 */
function useInvalidateAdminStickerPacks() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: MEMBER_STICKER_CATALOGUE_KEY,
    });
    return queryClient.invalidateQueries({ queryKey: ADMIN_STICKER_PACKS_KEY });
  };
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

/** Relabels, rewords, or redraws one sticker in place; invalidates the pack
 *  list on success. */
export function useUpdateSticker() {
  const invalidate = useInvalidateAdminStickerPacks();

  return useMutation({
    mutationFn: ({
      packId,
      stickerId,
      body,
    }: {
      packId: string;
      stickerId: string;
      body: UpdateStickerBody;
    }) => updateSticker(packId, stickerId, body),
    onSuccess: invalidate,
  });
}

/** Deletes a draft pack; invalidates the pack list on success. */
export function useDeleteStickerPack() {
  const invalidate = useInvalidateAdminStickerPacks();

  return useMutation({
    mutationFn: (packId: string) => deleteStickerPack(packId),
    onSuccess: invalidate,
  });
}
