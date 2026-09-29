/**
 * Multi-select over the desk's piece rows, backing the bulk assign-to-issue
 * bar. Separate from `useDeskState.selected`, which is the PITCH inbox's
 * selection: the two lists are selected independently and a shared array
 * would let a pitch id leak into a piece mutation.
 *
 * Selection is pruned against the currently visible pieces as soon as the
 * visible set changes: assigning a selection moves those pieces onto another
 * track, and a stale id would keep the bulk bar showing a count for rows that
 * are no longer there. The prune drops the id outright rather than only
 * hiding it from the count, so narrowing a filter and then clearing it never
 * brings a hidden selection back.
 */

import { useMemo, useState } from "react";
import type { Piece } from "../data/desk.data";

export interface UseDeskPieceSelectionResult {
  selectedPieceIds: string[];
  isPieceSelected: (pieceId: string) => boolean;
  togglePieceSelect: (pieceId: string) => void;
  /** Select every currently visible piece, or clear when all are selected. */
  toggleSelectAll: () => void;
  /** Select every currently visible piece, replacing whatever was selected.
   *  Backs the bulk bar's phone-only "Select all {count}" action: reaching
   *  that action already implies at least one piece is selected, so it is a
   *  plain select rather than `toggleSelectAll`'s on/off pair. */
  selectAll: () => void;
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

  // Adjusted during render (React's pattern for state derived from a prop
  // change): a selected id that falls out of the visible set is dropped from
  // the raw state right away, in the same pass, so it cannot resurface once
  // the filter that hid it clears.
  const selectedPieceIds = rawSelectedPieceIds.filter((pieceId) =>
    visibleIds.has(pieceId),
  );
  if (selectedPieceIds.length !== rawSelectedPieceIds.length) {
    setRawSelectedPieceIds(selectedPieceIds);
  }

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

  function selectAll(): void {
    setRawSelectedPieceIds(visiblePieces.map((piece) => piece.id));
  }

  function clearPieceSelection(): void {
    setRawSelectedPieceIds([]);
  }

  return {
    selectedPieceIds,
    isPieceSelected: (pieceId: string) => selectedPieceIds.includes(pieceId),
    togglePieceSelect,
    toggleSelectAll,
    selectAll,
    areAllSelected,
    clearPieceSelection,
  };
}
