import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { describeError } from "../../../shared/api/errorMessage";
import type {
  AdminStickerPackResponse,
  StickerResponse,
} from "../../../shared/contracts/contracts";
import {
  useCreateStickerPack,
  useRemoveSticker,
  useUpdateStickerPack,
} from "../../stickers/api/useAdminStickerPacks";

type PackStatus = AdminStickerPackResponse["status"];

/**
 * Every mutation the builder page issues against a pack: create a draft,
 * change its status, set its cover, delete one of its stickers. Centralised
 * here so `AdminStickerPacksPage` itself stays a thin composition of panes
 * rather than growing past the 200-line component cap.
 */
export function useStickerPackActions({
  selectedPack,
  onPackCreated,
}: {
  selectedPack: AdminStickerPackResponse | null;
  onPackCreated: (packId: string) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createStickerPack = useCreateStickerPack();
  const updateStickerPack = useUpdateStickerPack();
  const removeSticker = useRemoveSticker();

  function toastError(messageKey: string, cause: unknown) {
    showToast(
      describeError(t(messageKey), cause, t("shared:apiError.tryAgainTail")),
      "error",
    );
  }

  function handleCreatePack(body: { slug: string; name: string }) {
    createStickerPack.mutate(body, {
      onSuccess: (createdPack) => {
        onPackCreated(createdPack.id);
        showToast(t("admin:stickerPacks.toast.packCreated"), "info");
      },
      onError: (cause) => toastError("admin:stickerPacks.errors.create", cause),
    });
  }

  function handleSetStatus(status: PackStatus) {
    if (!selectedPack) return;
    updateStickerPack.mutate(
      { packId: selectedPack.id, body: { status } },
      {
        onSuccess: () =>
          showToast(t("admin:stickerPacks.toast.statusUpdated"), "info"),
        onError: (cause) =>
          toastError("admin:stickerPacks.errors.updateStatus", cause),
      },
    );
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

  function handleDeleteSticker(sticker: StickerResponse) {
    if (!selectedPack) return;
    removeSticker.mutate(
      { packId: selectedPack.id, stickerId: sticker.id },
      {
        onSuccess: () =>
          showToast(
            t("admin:stickerPacks.toast.stickerDeleted", {
              label: sticker.label,
            }),
            "info",
          ),
        onError: (cause) =>
          toastError("admin:stickerPacks.errors.deleteSticker", cause),
      },
    );
  }

  return {
    handleCreatePack,
    handleSetStatus,
    handleSetCover,
    handleDeleteSticker,
    isCreatingPack: createStickerPack.isPending,
    isMutatingPack: updateStickerPack.isPending,
  };
}
