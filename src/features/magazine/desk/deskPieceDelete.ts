/**
 * The desk's delete-a-piece request and how it reports back. Split out of
 * `useDeskModals` so that hook stays a list of overlay openers.
 */

import { ApiError } from "../../../shared/api/client";
import type { ToastType } from "../../../shared/components/feedback/toastContext";
import type { TFunction } from "../../../shared/i18n/types";

export interface DeletePieceWithOutcomeParams {
  pieceId: string;
  /** `usePieceMutations().remove.mutateAsync`. */
  remove: (pieceId: string) => Promise<unknown>;
  /** Closes the confirm dialog, whichever way the request went. */
  closeDialog: () => void;
  showToast: (message: string, type?: ToastType) => void;
  translate: TFunction;
}

/**
 * Deleting is the one desk action that cannot be undone, so it reports its
 * own outcome instead of leaving the dialog to close on an unstated result.
 * The 409 (the piece owns PUBLISHED content, which a desk cleanup leaves in
 * place) gets its own toast: the backend's refusal is an untranslated
 * English sentence, and "unpublish it first" is the one error an editor can
 * act on.
 */
export async function deletePieceWithOutcome({
  pieceId,
  remove,
  closeDialog,
  showToast,
  translate,
}: DeletePieceWithOutcomeParams): Promise<void> {
  try {
    await remove(pieceId);
    closeDialog();
    showToast(translate("magazine:desk.pieceToast.deleted"), "success");
  } catch (error) {
    closeDialog();
    showToast(
      error instanceof ApiError && error.status === 409
        ? translate("magazine:desk.deletePiece.publishedError")
        : translate("magazine:desk.deletePiece.failed"),
      "error",
    );
  }
}
