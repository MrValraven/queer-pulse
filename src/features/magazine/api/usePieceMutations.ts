import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  createPiece,
  deletePiece,
  updatePiece as sendUpdatePiece,
  type CreatePieceDto,
  type PieceStage,
  type UpdatePieceDto,
} from "./pieces.api";
import { STAGE_DTO_TO_VIEW } from "./pieces.adapters";
import { DEMO_PIECES } from "../data/desk.data";

/**
 * Editor desk piece mutations, dual-mode. Demo never touches the network —
 * each mutation resolves immediately with a toast describing what would have
 * happened. Live calls the matching `AdminMagazinePiecesController` endpoint,
 * then invalidates the desk's list/summary (and the single-piece query where
 * relevant) so the pipeline/board/issue-plan views and the desk summary
 * refetch. Mirrors `useDeckMutations.ts`.
 */
export function usePieceMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  function invalidateDesk(pieceId?: string): void {
    void queryClient.invalidateQueries({ queryKey: ["magazine-pieces"] });
    void queryClient.invalidateQueries({ queryKey: ["magazine-desk-summary"] });
    if (pieceId) {
      void queryClient.invalidateQueries({ queryKey: ["magazine-piece", pieceId] });
    }
  }

  /** POST /magazine/admin/pieces — commission a new piece (from scratch or a pitch). */
  const commission = useMutation<{ id: string }, Error, CreatePieceDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast("Commissioned", "success");
        return { id: "demo" };
      }
      const piece = await createPiece(body);
      return { id: piece.id };
    },
    onSuccess: () => {
      invalidateDesk();
      // Commissioning from a pitch flips that pitch's status server-side —
      // keep the inbox in sync even when `pitchId` wasn't passed by the caller
      // this time (cheap: pitches list is small and rarely stale otherwise).
      void queryClient.invalidateQueries({ queryKey: ["magazine-pitches"] });
    },
  });

  /** PATCH /magazine/admin/pieces/:id — update any piece field. */
  const updatePiece = useMutation<
    { id: string },
    Error,
    { id: string; body: UpdatePieceDto }
  >({
    mutationFn: async ({ id, body }) => {
      if (demoMode) {
        // Demo never hits the network. Patch the in-memory piece so a track
        // reassignment (an `issueId` change) hops tabs on the next refetch —
        // replace the object (don't mutate in place) so react-query's
        // structural sharing sees a fresh reference and re-renders. This
        // mutation stays quiet on its own; the caller owns the toast
        // (`onSuccess`), so a reassignment can show track-aware copy in both
        // demo and live without double-toasting.
        if (body.issueId !== undefined) {
          const targetPiece = DEMO_PIECES.find((piece) => piece.id === id);
          if (targetPiece) {
            DEMO_PIECES[DEMO_PIECES.indexOf(targetPiece)] = {
              ...targetPiece,
              issueId: body.issueId,
            };
          }
        }
        return { id };
      }
      const piece = await sendUpdatePiece(id, body);
      return { id: piece.id };
    },
    onSuccess: (result) => invalidateDesk(result.id),
  });

  /** PATCH /magazine/admin/pieces/:id — move a piece to a new pipeline stage. */
  const moveStage = useMutation<{ id: string }, Error, { id: string; stage: PieceStage }>({
    mutationFn: async ({ id, stage }) => {
      if (demoMode) {
        showToast(`Moved to ${STAGE_DTO_TO_VIEW[stage]}`, "success");
        return { id };
      }
      const piece = await sendUpdatePiece(id, { stage });
      return { id: piece.id };
    },
    onSuccess: (result) => invalidateDesk(result.id),
  });

  /** PATCH /magazine/admin/pieces/:id — hand a piece off to a different editor/writer. */
  const assign = useMutation<
    { id: string },
    Error,
    { id: string; editorId?: string; writerId?: string }
  >({
    mutationFn: async ({ id, editorId, writerId }) => {
      if (demoMode) {
        showToast("Handed off", "success");
        return { id };
      }
      const piece = await sendUpdatePiece(id, { editorId, writerId });
      return { id: piece.id };
    },
    onSuccess: (result) => invalidateDesk(result.id),
  });

  /** DELETE /magazine/admin/pieces/:id — remove a piece from the desk. */
  const remove = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (demoMode) {
        showToast("Deleted", "success");
        return;
      }
      await deletePiece(id);
    },
    onSuccess: (_result, pieceId) => invalidateDesk(pieceId),
  });

  return { commission, updatePiece, moveStage, assign, remove };
}
