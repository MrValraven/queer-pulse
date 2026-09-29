/**
 * The desk's piece-navigation + stage-move actions (Open / Edit / Move stage /
 * Produce issue), kept in their own hook like `useDeskState` /
 * `useDeskModals` / `useDeskTracks`.
 */

import { useNavigate } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { Issue, Piece, Stage } from "../data/desk.data";
import type { usePieceMutations } from "../api/usePieceMutations";
import { STAGE_VIEW_TO_DTO } from "../api/pieces.adapters";
import type { TFunction } from "../../../shared/i18n/types";
import type { ToastType } from "../../../shared/components/feedback/toastContext";
import { hasPublishDate, isPieceScheduled } from "./pieceSchedule";

export interface UseDeskPieceActionsParams {
  /** The current issue: its number backs the "Produce" link target. */
  issue: Issue;
  pieceMutations: ReturnType<typeof usePieceMutations>;
  /** Says why a scheduled or live piece did not move. Optional: without them the
   *  move is still refused, silently, behind the disabled picker and drag. */
  showToast?: (message: string, type?: ToastType) => void;
  translate?: TFunction;
}

export interface UseDeskPieceActionsResult {
  openPiece: (piece: Piece) => void;
  editPiece: (piece: Piece) => void;
  movePiece: (piece: Piece, stage: Stage) => void;
  produceIssue: () => void;
}

export function useDeskPieceActions({
  issue,
  pieceMutations,
  showToast,
  translate,
}: UseDeskPieceActionsParams): UseDeskPieceActionsResult {
  const navigate = useNavigate();
  const { demoMode } = useDemoMode();

  // The piece record now exists (Phase 2). Live mode routes by the real piece
  // id; demo mode's record page ignores the id and always shows DEMO_RECORD.
  // "Open" always lands on the record.
  const openPiece = (piece: Piece) =>
    void navigate(routes.magazinePiece.replace(":id", piece.id));

  // "Edit" is format-aware: article-format pieces jump straight to the
  // block-based article editor (Phase 3, `routes.magazineWrite`); deck-format
  // pieces jump to the deck editor (Phase 4, `routes.deckEditor`) on their
  // linked deck (`pieceDtoToView` projects `PieceListItemDto.deckId`).
  //
  // A live deck piece with no deck yet (one commissioned from a pitch) opens
  // its record instead of a blank deck editor: a blank editor saves a
  // standalone deck outside the desk, and "Build a deck"
  // (`useDeskBuildDeckAction`) would start a second piece. Demo pieces carry
  // no deck registry and demo saves nothing, so demo keeps the fresh editor.
  const editPiece = (piece: Piece) => {
    if (piece.format === "article") {
      void navigate(routes.magazineWrite.replace(":id", piece.id));
      return;
    }
    if (piece.deckId) {
      void navigate(`${routes.deckEditor}?id=${piece.deckId}`);
      return;
    }
    if (demoMode) {
      void navigate(routes.deckEditor);
      return;
    }
    openPiece(piece);
  };

  // The backend refuses a stage PATCH on a piece that is already
  // Published with a 409 (unpublishing is the only real way out). No local
  // onError here on purpose: `moveStage` carries no `meta.silentError`, so
  // the app-wide `MutationCache` handler (`shared/api/errorHandling.ts`)
  // already toasts the server's own message (`reasonFor` reads a 409's
  // `message` straight through) instead of a generic failure. A handler
  // added here would only double the toast.
  //
  // A piece with a publish date stays put: a scheduled one waits at Ready
  // for its date, and a live one would stay public at its new stage. The
  // picker and drag are already locked, so this guard only catches a caller
  // that skips them. The backend's 409 `magazine_piece_scheduled` stays the
  // final backstop for a scheduled piece.
  const movePiece = (piece: Piece, stage: Stage) => {
    if (hasPublishDate(piece)) {
      if (showToast && translate) {
        showToast(
          translate(
            isPieceScheduled(piece)
              ? "magazine:desk.board.unscheduleToMove"
              : "magazine:desk.board.unpublishToMove",
          ),
          "info",
        );
      }
      return;
    }
    pieceMutations.moveStage.mutate({
      id: piece.id,
      stage: STAGE_VIEW_TO_DTO[stage],
    });
  };

  const produceIssue = () =>
    void navigate(routes.magazineIssueProd.replace(":number", issue.number));

  return { openPiece, editPiece, movePiece, produceIssue };
}
