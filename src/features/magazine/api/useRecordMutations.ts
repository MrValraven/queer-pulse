import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  addCorrection as sendAddCorrection,
  addLetter as sendAddLetter,
  updateLetter as sendUpdateLetter,
  updatePayment as sendUpdatePayment,
  type CorrectionDto,
  type CreateCorrectionDto,
  type CreateLetterDto,
  type LetterDto,
  type PaymentDto,
  type PieceRecordDto,
  type UpdatePaymentDto,
} from "./pieces.api";
import {
  publishPiece as sendPublishPiece,
  unpublishPiece as sendUnpublishPiece,
  type PieceRecordPublishFields,
  type PublishPieceDto,
} from "./piecePublish.api";

/** What the publish/unpublish endpoints answer with: the same record shape
 *  `usePieceRecord` reads, plus the publish state from CONTRACT §3. */
type PublishedRecordDto = PieceRecordDto & PieceRecordPublishFields;

/**
 * Piece-record mutations for `PieceRecordPage`'s Money/After tabs, dual-mode.
 * Demo never touches the network — each mutation resolves immediately with a
 * toast describing what would have happened (the page keeps rendering the
 * static `DEMO_RECORD`). Live calls the matching
 * `AdminMagazinePiecesController` endpoint, then invalidates this piece's
 * `usePieceRecord` cache so the tab reflects the change. Mirrors
 * `usePieceMutations.ts`.
 */
export function useRecordMutations(id: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  function invalidateRecord(): void {
    void queryClient.invalidateQueries({ queryKey: ["magazine-piece", id] });
  }

  /** Publishing also moves `stage` to `published`, so the desk list and every
   *  issue-production view holding this piece are stale too. The payment and
   *  letters mutations above only ever touch the record itself. */
  function invalidateRecordAndDesk(): void {
    invalidateRecord();
    void queryClient.invalidateQueries({ queryKey: ["magazine-pieces"] });
    void queryClient.invalidateQueries({
      queryKey: ["magazine-issue-production"],
    });
  }

  /** PATCH /magazine/admin/pieces/:id/payment — save any payment field. */
  const savePayment = useMutation<PaymentDto | null, Error, UpdatePaymentDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast(t("magazine:piece.recordToast.saved"), "success");
        return null;
      }
      return sendUpdatePayment(id, body);
    },
    onSuccess: invalidateRecord,
  });

  /** PATCH /magazine/admin/pieces/:id/payment with `{ status: 'paid' }`. */
  const markPaid = useMutation<PaymentDto | null, Error, void>({
    mutationFn: async () => {
      if (demoMode) {
        showToast(t("magazine:piece.recordToast.markedPaid"), "success");
        return null;
      }
      return sendUpdatePayment(id, { status: "paid" });
    },
    onSuccess: invalidateRecord,
  });

  /** POST /magazine/admin/pieces/:id/letters — record a reader letter. */
  const addLetter = useMutation<LetterDto | null, Error, CreateLetterDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast(t("magazine:piece.recordToast.letterAdded"), "success");
        return null;
      }
      return sendAddLetter(id, body);
    },
    onSuccess: invalidateRecord,
  });

  /** PATCH /magazine/admin/pieces/:id/letters/:letterId — toggle an existing
   *  letter's "run in letters" flag. Updates the same row every time — this
   *  is the fix for the bug where the After tab used to file a brand-new
   *  letter on every click instead of flagging the one already there. */
  const toggleLetterRunInLetters = useMutation<
    LetterDto | null,
    Error,
    { letterId: string; runInLetters: boolean }
  >({
    mutationFn: async ({ letterId, runInLetters }) => {
      if (demoMode) {
        showToast(
          runInLetters
            ? t("magazine:piece.recordToast.markedRunInLetters")
            : t("magazine:piece.recordToast.removedFromLetters"),
          "success",
        );
        return null;
      }
      return sendUpdateLetter(id, letterId, runInLetters);
    },
    onSuccess: invalidateRecord,
  });

  /** POST /magazine/admin/pieces/:id/corrections — publish a dated correction. */
  const addCorrection = useMutation<
    CorrectionDto | null,
    Error,
    CreateCorrectionDto
  >({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast(
          t("magazine:piece.recordToast.correctionPublished"),
          "success",
        );
        return null;
      }
      return sendAddCorrection(id, body);
    },
    onSuccess: invalidateRecord,
  });

  /** POST /magazine/admin/pieces/:id/publish. Publishes now when
   *  `publishedAt` is omitted, schedules when it is a future instant. Errors
   *  are deliberately NOT caught here: the caller has to tell a care-gate
   *  refusal (which it renders item by item) from a plain failure. */
  const publish = useMutation<
    PublishedRecordDto | null,
    Error,
    PublishPieceDto
  >({
    mutationFn: async (body) => {
      // Demo mode has no writable record, so this resolves without a toast:
      // the caller toasts on success in both modes and a second one would
      // double up.
      if (demoMode) return null;
      return sendPublishPiece(id, body);
    },
    onSuccess: invalidateRecordAndDesk,
  });

  /** POST /magazine/admin/pieces/:id/unpublish. Never gated, so an editor can
   *  always pull a live piece back down. */
  const unpublish = useMutation<PublishedRecordDto | null, Error, void>({
    mutationFn: async () => {
      if (demoMode) return null;
      return sendUnpublishPiece(id);
    },
    onSuccess: invalidateRecordAndDesk,
  });

  return {
    savePayment,
    markPaid,
    addLetter,
    toggleLetterRunInLetters,
    addCorrection,
    publish,
    unpublish,
  };
}
