import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
import { describeError } from "../../shared/api/errorMessage";
import { type AdminMediaDeleteConflict } from "./api/adminMedia.api";
import { useDeleteAdminMedia } from "./api/useAdminMedia";
import type { AdminMediaDeleteRefusal } from "./AdminMediaDeleteConfirm";

/**
 * The delete flow for one stored object's inspection drawer: the confirm
 * modal's open state, the server's refusal (`409` still referenced, `503`
 * the check could not run), and the mutation itself.
 *
 * The route refuses by default: `409` when the key is still referenced (the
 * body lists where) and `503` when the check could not run. Neither is a
 * generic failure, so instead of a toast the modal switches to the server's
 * own answer and an explicit "delete anyway" second click.
 */
export function useAdminMediaDrawerDelete({
  objectKey,
  onDeleted,
}: {
  objectKey: string;
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteRefusal, setDeleteRefusal] =
    useState<AdminMediaDeleteRefusal | null>(null);
  const deleteMedia = useDeleteAdminMedia();

  function confirmDelete(isForced: boolean) {
    deleteMedia.mutate(
      { key: objectKey, isForced },
      {
        onSuccess: () => {
          showToast(t("admin:media.delete.success"));
          setDeleteRefusal(null);
          setIsConfirmingDelete(false);
          onDeleted();
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            const conflict = error.data as AdminMediaDeleteConflict | null;
            setDeleteRefusal({
              references: conflict?.references ?? [],
              isUnverified: false,
            });
            return;
          }
          if (error instanceof ApiError && error.status === 503) {
            setDeleteRefusal({ references: [], isUnverified: true });
            return;
          }
          showToast(
            describeError(
              t("admin:errors.deleteMediaObject"),
              error,
              t("shared:apiError.tryAgainTail"),
            ),
            "error",
          );
        },
      },
    );
  }

  return {
    isConfirmingDelete,
    openConfirm: () => setIsConfirmingDelete(true),
    deleteRefusal,
    cancelConfirm: () => {
      setDeleteRefusal(null);
      setIsConfirmingDelete(false);
    },
    isDeletePending: deleteMedia.isPending,
    confirmDelete,
  };
}
