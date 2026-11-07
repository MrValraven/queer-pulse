import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { DEMO_PIECES, type Piece } from "../data/desk.data";
import {
  UNDO_TOAST_LIFETIME_MS,
  unpublishFailureDetail,
  UNPUBLISH_LANDING,
} from "../desk/deskPieceUnpublish";
import { followUnpublishToast } from "../desk/deskPieceFocus";
import { useDeskRepublish } from "./useDeskRepublish";
import {
  unpublishPiece as sendUnpublishPiece,
  type UnpublishLandingStage,
} from "./piecePublish.api";

export interface DeskUnpublishRequest {
  piece: Piece;
  stage: UnpublishLandingStage;
}

/**
 * The desk row menu's one-click unpublish: a live piece goes back to Draft or
 * In review and leaves the public site. Kept apart from
 * `useRecordMutations().unpublish`, which is bound to one piece id and always
 * lands in Ready after a confirm.
 *
 * Dual-mode. Demo never touches the network: it moves the piece in
 * `DEMO_PIECES` (replacing the object, as `usePieceMutations.assignIssue`
 * does) so the row really leaves the Published group. Live posts the stage to
 * the unpublish endpoint. Both report through this hook's own toasts, so the
 * mutation is `silentError`: the app-wide handler would only add a second,
 * less specific one. The success toast carries an Undo button that
 * republishes at the piece's original instant (`useDeskRepublish`), and
 * takes keyboard focus as it shows: the control that raised the confirm
 * left with the piece (`followUnpublishToast`).
 */
export function useDeskUnpublish() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const republish = useDeskRepublish();
  const { reducedMotion } = useMotionPrefs();

  return useMutation<unknown, Error, DeskUnpublishRequest>({
    meta: { silentError: true },
    mutationFn: async ({ piece, stage }) => {
      if (demoMode) {
        const pieceIndex = DEMO_PIECES.findIndex(
          (candidate) => candidate.id === piece.id,
        );
        const demoPiece = DEMO_PIECES[pieceIndex];
        if (demoPiece) {
          // A new stage starts its own clock, as the live service's
          // `stage_changed` event does.
          DEMO_PIECES[pieceIndex] = {
            ...demoPiece,
            stage: UNPUBLISH_LANDING[stage].viewStage,
            publishedAt: null,
            stageEnteredAt: new Date().toISOString(),
          };
        }
        return null;
      }
      return sendUnpublishPiece(piece.id, stage);
    },
    onSuccess: (_result, { piece, stage }) => {
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
      let wasUndone = false;
      const toastId = showToast(
        {
          title: t(UNPUBLISH_LANDING[stage].successKey, { title: piece.title }),
          detail: t("magazine:desk.pieceToast.unpublishedDetail"),
        },
        "success",
        UNDO_TOAST_LIFETIME_MS,
        {
          label: t("magazine:desk.pieceToast.undo"),
          // `piece` is the snapshot taken when the request was made, so its
          // `publishedAt` is the instant the unpublish is about to clear.
          onClick: () => {
            wasUndone = true;
            republish.mutate({
              piece,
              originalPublishedAt: piece.publishedAt,
            });
          },
        },
      );
      followUnpublishToast({
        toastId,
        pieceId: piece.id,
        originalStage: piece.stage,
        landingStage: UNPUBLISH_LANDING[stage].viewStage,
        wasUndone: () => wasUndone,
        isReducedMotion: reducedMotion,
      });
    },
    onError: (error, { piece }) => {
      showToast(
        {
          title: t("magazine:desk.pieceToast.unpublishFailed", {
            title: piece.title,
          }),
          detail: unpublishFailureDetail(error, t),
        },
        "error",
      );
    },
  });
}
