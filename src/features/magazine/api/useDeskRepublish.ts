import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { DEMO_PIECES, type Piece } from "../data/desk.data";
import { republishFailureDetail } from "../desk/deskPieceUnpublish";
import { publishPiece } from "./piecePublish.api";

export interface DeskRepublishRequest {
  /** The piece as it stood BEFORE the unpublish, so demo can restore its
   *  stage. */
  piece: Piece;
  /** The `publishedAt` the piece had before the unpublish cleared it. With
   *  none, the republish omits the field and the server publishes now. */
  originalPublishedAt?: string | null;
}

/**
 * The Undo button on the desk's unpublish toast: puts the piece back on the
 * site at its ORIGINAL publish instant, so its date and place in the issue do
 * not shift. Dual-mode like `useDeskUnpublish`: demo restores the fixture's
 * stage and date with no network, live posts the publish. Both report through
 * this hook's own toasts (`silentError`), and a refusal names the care items
 * or readiness check that held the piece back.
 */
export function useDeskRepublish() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  return useMutation<unknown, Error, DeskRepublishRequest>({
    meta: { silentError: true },
    mutationFn: async ({ piece, originalPublishedAt }) => {
      if (demoMode) {
        const pieceIndex = DEMO_PIECES.findIndex(
          (candidate) => candidate.id === piece.id,
        );
        const demoPiece = DEMO_PIECES[pieceIndex];
        if (demoPiece) {
          DEMO_PIECES[pieceIndex] = {
            ...demoPiece,
            stage: piece.stage,
            publishedAt: originalPublishedAt,
          };
        }
        return null;
      }
      return publishPiece(
        piece.id,
        originalPublishedAt ? { publishedAt: originalPublishedAt } : {},
      );
    },
    onSuccess: (_result, { piece }) => {
      void queryClient.invalidateQueries({
        queryKey: ["magazine-piece", piece.id],
      });
      void queryClient.invalidateQueries({ queryKey: ["magazine-pieces"] });
      void queryClient.invalidateQueries({
        queryKey: ["magazine-issue-production"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["magazine-desk-summary"],
      });
      showToast(
        t("magazine:desk.pieceToast.republished", { title: piece.title }),
        "success",
      );
    },
    onError: (error, { piece }) => {
      showToast(
        {
          title: t("magazine:desk.pieceToast.republishFailed", {
            title: piece.title,
          }),
          detail: republishFailureDetail(error, t),
        },
        "error",
      );
    },
  });
}
