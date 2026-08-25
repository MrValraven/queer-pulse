/**
 * Multi-select over the desk's piece rows, backing the bulk assign-to-issue
 * bar. Separate from `useDeskState.selected`, which is the PITCH inbox's
 * selection — the two lists are selected independently and a shared array
 * would let a pitch id leak into a piece mutation.
 *
 * Selection is pruned against the currently available pieces on every render:
 * assigning a selection moves those pieces onto another track, and a stale id
 * would keep the bulk bar showing a count for rows that are no longer there.
 */

import { useMemo, useState } from "react";
import type { Piece } from "../data/desk.data";

export interface UseDeskPieceSelectionResult {
  selectedPieceIds: string[];
  isPieceSelected: (pieceId: string) => boolean;
  togglePieceSelect: (pieceId: string) => void;
  /** Select every currently visible piece, or clear when all are selected. */
  toggleSelectAll: () => void;
  areAllSelected: boolean;
  clearPieceSelection: () => void;
}

export function useDeskPieceSelection(
  visiblePieces: Piece[],
): UseDeskPieceSelectionResult {
  const [rawSelectedPieceIds, setRawSelectedPieceIds] = useState<string[]>([]);

  const visibleIds = useMemo(
    () => new Set(visiblePieces.map((piece) => piece.id)),
    [visiblePieces],
  );
  const selectedPieceIds = useMemo(
    () => rawSelectedPieceIds.filter((pieceId) => visibleIds.has(pieceId)),
    [rawSelectedPieceIds, visibleIds],
  );

  function togglePieceSelect(pieceId: string): void {
    setRawSelectedPieceIds((current) =>
      current.includes(pieceId)
        ? current.filter((id) => id !== pieceId)
        : [...current, pieceId],
    );
  }

  const areAllSelected =
    visiblePieces.length > 0 &&
    selectedPieceIds.length === visiblePieces.length;

  function toggleSelectAll(): void {
    setRawSelectedPieceIds(
      areAllSelected ? [] : visiblePieces.map((piece) => piece.id),
    );
  }

  function clearPieceSelection(): void {
    setRawSelectedPieceIds([]);
  }

  return {
    selectedPieceIds,
    isPieceSelected: (pieceId: string) => selectedPieceIds.includes(pieceId),
    togglePieceSelect,
    toggleSelectAll,
    areAllSelected,
    clearPieceSelection,
  };
}
