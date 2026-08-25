/**
 * Desk local UI state: search/format/mine/sort/saved-view filters, row
 * selection and keyboard focus, plus the derived `visiblePieces` list.
 * Pure UI state — does not fetch; callers pass in the already-loaded
 * pieces and the current editor's id.
 */

import { useMemo, useState } from "react";
import type { Piece, SavedViewId } from "../data/desk.data";
import { DEMO_STAGES } from "../data/desk.data";
import { VIEW_TEST } from "../data/desk.copy";

export type PieceFormatFilter = "all" | "article" | "deck";
export type PieceSortOption = "due" | "stage" | "sec";

export interface UseDeskStateResult {
  q: string;
  setQ: (value: string) => void;
  fmt: PieceFormatFilter;
  setFmt: (value: PieceFormatFilter) => void;
  mine: boolean;
  setMine: (value: boolean) => void;
  sort: PieceSortOption;
  setSort: (value: PieceSortOption) => void;
  view: SavedViewId | null;
  setView: (value: SavedViewId | null) => void;
  selected: string[];
  toggleSelect: (id: string) => void;
  clearSelected: () => void;
  focusId: string | null;
  setFocusId: (id: string | null) => void;
  visiblePieces: Piece[];
}

export function useDeskState(pieces: Piece[], me: string): UseDeskStateResult {
  const [q, setQ] = useState("");
  const [fmt, setFmt] = useState<PieceFormatFilter>("all");
  const [mine, setMine] = useState(false);
  const [sort, setSort] = useState<PieceSortOption>("due");
  const [view, setView] = useState<SavedViewId | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);

  function toggleSelect(id: string): void {
    setSelected((currentSelected) =>
      currentSelected.includes(id)
        ? currentSelected.filter((selectedId) => selectedId !== id)
        : [...currentSelected, id],
    );
  }

  function clearSelected(): void {
    setSelected([]);
  }

  const visiblePieces = useMemo(() => {
    const lowerCaseQuery = q.toLowerCase();
    const filteredPieces = pieces.filter((piece) => {
      const matchesFormat = fmt === "all" || piece.format === fmt;
      const matchesMine = !mine || piece.editorId === me;
      const matchesView = !view || VIEW_TEST[view](piece);
      const matchesQuery =
        !q ||
        (piece.title + piece.byline + piece.section)
          .toLowerCase()
          .includes(lowerCaseQuery);
      return matchesFormat && matchesMine && matchesView && matchesQuery;
    });

    const sortedPieces = [...filteredPieces];
    if (sort === "stage") {
      sortedPieces.sort(
        (pieceA, pieceB) =>
          DEMO_STAGES.indexOf(pieceA.stage) - DEMO_STAGES.indexOf(pieceB.stage),
      );
    } else if (sort === "sec") {
      sortedPieces.sort((pieceA, pieceB) =>
        pieceA.section.localeCompare(pieceB.section),
      );
    } else {
      sortedPieces.sort((pieceA, pieceB) => {
        const sortKeyA = (pieceA.late ? "0" : "1") + pieceA.due;
        const sortKeyB = (pieceB.late ? "0" : "1") + pieceB.due;
        return sortKeyA.localeCompare(sortKeyB);
      });
    }
    return sortedPieces;
  }, [pieces, fmt, mine, me, view, q, sort]);

  return {
    q,
    setQ,
    fmt,
    setFmt,
    mine,
    setMine,
    sort,
    setSort,
    view,
    setView,
    selected,
    toggleSelect,
    clearSelected,
    focusId,
    setFocusId,
    visiblePieces,
  };
}
