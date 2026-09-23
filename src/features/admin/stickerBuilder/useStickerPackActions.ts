import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { describeError } from "../../../shared/api/errorMessage";
import type {
  AdminStickerPackResponse,
  AdminStickerResponse,
} from "../../../shared/contracts/contracts";
import type { UpdateStickerBody } from "../../stickers/api/adminStickers.api";
import {
  useCreateStickerPack,
  useDeleteStickerPack,
  useRemoveSticker,
  useReorderStickers,
  useUpdateSticker,
  useUpdateStickerPack,
} from "../../stickers/api/useAdminStickerPacks";
import type { PackStatus } from "./stickerBuilder.types";

/**
 * Every mutation the builder page issues against a pack: create, rename,
 * change status, delete, set the cover, reorder, edit or remove a sticker.
 * Each one toasts its own outcome (errors through `toastError`, so the API's
 * reason reaches the admin), which keeps the page a thin composition.
 *
 * The two handlers a dialog waits on (`handleCreatePack`,
 * `handleUpdateSticker`) always resolve to a boolean, so the dialog
 * closes on `true` and stays open, with the failure toast, on `false`.
 */
export function useStickerPackActions({
  selectedPack,
  onPackCreated,
  onPackDeleted,
}: {
  selectedPack: AdminStickerPackResponse | null;
  onPackCreated: (packId: string) => void;
  onPackDeleted: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createStickerPack = useCreateStickerPack();
  const updateStickerPack = useUpdateStickerPack();
  const deleteStickerPack = useDeleteStickerPack();
  const removeSticker = useRemoveSticker();
  const reorderStickers = useReorderStickers();
  const updateSticker = useUpdateSticker();

  function toastError(messageKey: string, cause: unknown) {
    showToast(
      describeError(t(messageKey), cause, t("shared:apiError.tryAgainTail")),
      "error",
    );
  }

  /** Resolves once the pack list has refetched (the mutation's own
   *  `onSuccess` awaits the invalidation), so the new pack is in the list
   *  by the time it is selected. */
  async function handleCreatePack(body: {
    slug: string;
    name: string;
  }): Promise<boolean> {
    try {
      const createdPack = await createStickerPack.mutateAsync(body);
      onPackCreated(createdPack.id);
      showToast(t("admin:stickerPacks.toast.packCreated"), "success");
      return true;
    } catch (cause) {
      toastError("admin:stickerPacks.errors.create", cause);
      return false;
    }
  }

  function handleRename(name: string) {
    if (!selectedPack) return;
    updateStickerPack.mutate(
      { packId: selectedPack.id, body: { name } },
      {
        onSuccess: () =>
          showToast(t("admin:stickerPacks.toast.renamed", { name }), "success"),
        onError: (cause) =>
          toastError("admin:stickerPacks.errors.rename", cause),
      },
    );
  }

  /** The toast names the pack and the state it is now in. */
  function handleSetStatus(status: PackStatus) {
    if (!selectedPack) return;
    const packName = selectedPack.name;
    updateStickerPack.mutate(
      { packId: selectedPack.id, body: { status } },
      {
        onSuccess: () =>
          showToast(
            t(`admin:stickerPacks.toast.status.${status}`, { name: packName }),
            "success",
          ),
        onError: (cause) =>
          toastError("admin:stickerPacks.errors.updateStatus", cause),
      },
    );
  }

  /** Drafts only (the API answers 409 otherwise). On success `?pack=` is
   *  cleared, so the first remaining pack takes over the workspace. */
  function handleDeletePack() {
    if (!selectedPack) return;
    const packName = selectedPack.name;
    deleteStickerPack.mutate(selectedPack.id, {
      onSuccess: () => {
        onPackDeleted();
        showToast(
          t("admin:stickerPacks.toast.packDeleted", { name: packName }),
          "success",
        );
      },
      onError: (cause) =>
        toastError("admin:stickerPacks.errors.deletePack", cause),
    });
  }

  function handleReorder(stickerIds: string[]) {
    if (!selectedPack) return;
    reorderStickers.mutate(
      { packId: selectedPack.id, stickerIds },
      {
        onError: (cause) =>
          toastError("admin:stickerPacks.errors.reorder", cause),
      },
    );
  }

  async function handleUpdateSticker(
    stickerId: string,
    body: UpdateStickerBody,
  ): Promise<boolean> {
    if (!selectedPack) return false;
    try {
      const updatedSticker = await updateSticker.mutateAsync({
        packId: selectedPack.id,
        stickerId,
        body,
      });
      showToast(
        t("admin:stickerPacks.toast.stickerUpdated", {
          label: updatedSticker.label,
        }),
        "success",
      );
      return true;
    } catch (cause) {
      toastError("admin:stickerPacks.errors.updateSticker", cause);
      return false;
    }
  }

  function handleSetCover(stickerId: string) {
    if (!selectedPack) return;
    updateStickerPack.mutate(
      { packId: selectedPack.id, body: { coverStickerId: stickerId } },
      {
        onError: (cause) =>
          toastError("admin:stickerPacks.errors.setCover", cause),
      },
    );
  }

  function handleDeleteSticker(sticker: AdminStickerResponse) {
    if (!selectedPack) return;
    removeSticker.mutate(
      { packId: selectedPack.id, stickerId: sticker.id },
      {
        onSuccess: () =>
          showToast(
            t("admin:stickerPacks.toast.stickerRemoved", {
              label: sticker.label,
            }),
            "success",
          ),
        onError: (cause) =>
          toastError("admin:stickerPacks.errors.deleteSticker", cause),
      },
    );
  }

  return {
    handleCreatePack,
    handleRename,
    handleSetStatus,
    handleDeletePack,
    handleSetCover,
    handleReorder,
    handleUpdateSticker,
    handleDeleteSticker,
    isCreatingPack: createStickerPack.isPending,
    /** A pack-level write (rename, status, cover, delete) is in flight. */
    isMutatingPack: updateStickerPack.isPending || deleteStickerPack.isPending,
    /** A write the contents tab must wait on is in flight: a reorder save, a
     *  sticker edit, a removal or a cover change. */
    isMutatingContents:
      reorderStickers.isPending ||
      updateSticker.isPending ||
      removeSticker.isPending ||
      updateStickerPack.isPending,
  };
}

export type StickerPackActions = ReturnType<typeof useStickerPackActions>;
