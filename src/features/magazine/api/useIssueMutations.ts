import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  shipIssue as sendShipIssue,
  updateCover as sendUpdateCover,
  updateDigest as sendUpdateDigest,
  updateRunOrder as sendUpdateRunOrder,
  type IssueProductionDto,
  type UpdateCoverDto,
  type UpdateDigestDto,
  type UpdateRunOrderDto,
} from "./issueProduction.api";
import { updatePiece as sendUpdatePieceContentsBlurb } from "./pieces.api";

/**
 * Issue-production mutations, dual-mode. Demo never touches the network —
 * each mutation resolves immediately with a toast describing what would
 * have happened. Live calls the matching admin issue-production endpoint,
 * then invalidates `["magazine-issue-production", number]` so the
 * production page (running order/cover/digest/ship checklist) refetches.
 * Mirrors `usePieceMutations.ts`.
 */
export function useIssueMutations(number: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  function invalidateIssue(): void {
    void queryClient.invalidateQueries({ queryKey: ["magazine-issue-production", number] });
  }

  /** PATCH /magazine/admin/issues/:number/run-order — reorder the running order. */
  const saveRunOrder = useMutation<void, Error, UpdateRunOrderDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast("Running order saved", "success");
        return;
      }
      await sendUpdateRunOrder(number, body);
    },
    onSuccess: invalidateIssue,
  });

  /** PATCH /magazine/admin/issues/:number/digest — update the members' digest. */
  const saveDigest = useMutation<void, Error, UpdateDigestDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast("Digest saved", "success");
        return;
      }
      await sendUpdateDigest(number, body);
    },
    onSuccess: invalidateIssue,
  });

  /** PATCH /magazine/admin/issues/:number/cover — update the cover image + coverlines. */
  const saveCover = useMutation<void, Error, UpdateCoverDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast("Cover saved", "success");
        return;
      }
      await sendUpdateCover(number, body);
    },
    onSuccess: invalidateIssue,
  });

  /** POST /magazine/admin/issues/:number/ship — ship the issue (publish every piece past the gate). */
  const ship = useMutation<IssueProductionDto | void, Error, void>({
    mutationFn: async () => {
      if (demoMode) {
        showToast("Issue shipped", "success");
        return;
      }
      return sendShipIssue(number);
    },
    onSuccess: invalidateIssue,
  });

  /** PATCH /magazine/admin/pieces/:id — save one piece's contents blurb (the
   *  existing piece-update endpoint; there's no dedicated blurb endpoint).
   *  Demo mode is local-only (a toast) since there's no piece cache to write
   *  the blurb back onto here. */
  const saveContentsBlurb = useMutation<void, Error, { pieceId: string; blurb: string }>({
    mutationFn: async ({ pieceId, blurb }) => {
      if (demoMode) {
        showToast("Contents blurb saved", "success");
        return;
      }
      await sendUpdatePieceContentsBlurb(pieceId, { contentsBlurb: blurb });
    },
    onSuccess: invalidateIssue,
  });

  return { saveRunOrder, saveDigest, saveCover, saveContentsBlurb, ship };
}
