import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
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
  type UpdatePaymentDto,
} from "./pieces.api";

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

  function invalidateRecord(): void {
    void queryClient.invalidateQueries({ queryKey: ["magazine-piece", id] });
  }

  /** PATCH /magazine/admin/pieces/:id/payment — save any payment field. */
  const savePayment = useMutation<PaymentDto | null, Error, UpdatePaymentDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast("Saved", "success");
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
        showToast("Marked paid", "success");
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
        showToast("Letter added", "success");
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
        showToast(runInLetters ? "Marked to run in letters" : "Removed from letters", "success");
        return null;
      }
      return sendUpdateLetter(id, letterId, runInLetters);
    },
    onSuccess: invalidateRecord,
  });

  /** POST /magazine/admin/pieces/:id/corrections — publish a dated correction. */
  const addCorrection = useMutation<CorrectionDto | null, Error, CreateCorrectionDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast("Correction published", "success");
        return null;
      }
      return sendAddCorrection(id, body);
    },
    onSuccess: invalidateRecord,
  });

  return { savePayment, markPaid, addLetter, toggleLetterRunInLetters, addCorrection };
}
