/**
 * The desk's piece-navigation + stage-move actions (Open / Edit / Move stage /
 * Produce issue). Kept out of `EditorDashboardPage` so the page stays thin —
 * mirrors `useDeskState` / `useDeskModals` / `useDeskTracks`.
 */

import { useNavigate } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import type { Issue, Piece, Stage } from "../data/desk.data";
import type { usePieceMutations } from "../api/usePieceMutations";
import { STAGE_VIEW_TO_DTO } from "../api/pieces.adapters";

export interface UseDeskPieceActionsParams {
  /** The current issue — its number backs the "Produce" link target. */
  issue: Issue;
  pieceMutations: ReturnType<typeof usePieceMutations>;
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
}: UseDeskPieceActionsParams): UseDeskPieceActionsResult {
  const navigate = useNavigate();

  // The piece record now exists (Phase 2). Live mode routes by the real piece
  // id; demo mode's record page ignores the id and always shows DEMO_RECORD.
  // "Open" always lands on the record.
  const openPiece = (piece: Piece) =>
    void navigate(routes.magazinePiece.replace(":id", piece.id));

  // "Edit" is format-aware: article-format pieces jump straight to the
  // block-based article editor (Phase 3, `routes.magazineWrite`); deck-format
  // pieces jump to the deck editor (Phase 4, `routes.deckEditor`) — the linked
  // deck when `piece.deckId` is set (live mode; `pieceDtoToView` projects
  // `PieceListItemDto.deckId`), otherwise a fresh deck, same as the "New deck"
  // entry point in `EditorDecksSection`. Mirrors `PieceRecordPage.handleOpenDraft`.
  const editPiece = (piece: Piece) => {
    if (piece.format === "article") {
      void navigate(routes.magazineWrite.replace(":id", piece.id));
      return;
    }
    void navigate(
      piece.deckId
        ? `${routes.deckEditor}?id=${piece.deckId}`
        : routes.deckEditor,
    );
  };

  const movePiece = (piece: Piece, stage: Stage) =>
    pieceMutations.moveStage.mutate({
      id: piece.id,
      stage: STAGE_VIEW_TO_DTO[stage],
    });

  const produceIssue = () =>
    void navigate(routes.magazineIssueProd.replace(":number", issue.number));

  return { openPiece, editPiece, movePiece, produceIssue };
}
