/**
 * The desk's peek panel state: which piece is open beside the table, and
 * stepping to the piece above or below it. A row, a board card, a plan slot
 * and the "o" key all open the peek; the full record is one more click away
 * inside it ("Open full record").
 *
 * The open piece is kept by id and resolved against every fetched piece on
 * each render, so a refetch (a stage move, a new message) updates the panel
 * in place, and a piece that leaves the current filter stays open until the
 * editor closes it. Stepping walks `order`, the same list j/k walk.
 *
 * While a piece is open this tab watches it on the desk presence socket, so
 * colleagues can see who has it open.
 */

import { useEffect, useState } from "react";
import type { Piece } from "../data/desk.data";
import type { DeskPresence } from "../api/useDeskPresence";

export interface UseDeskPeekParams {
  /** The rows in the order j/k walk them (the visible table order). */
  order: Piece[];
  /** Every fetched piece, to resolve the open id against. */
  pieces: Piece[];
  /** Moves the table's current row, so j/k carry on from the peeked piece. */
  setFocusId: (pieceId: string) => void;
  watchPiece: DeskPresence["watchPiece"];
  unwatchPiece: DeskPresence["unwatchPiece"];
}

export interface DeskPeek {
  /** The piece in the panel, or null while it is closed. */
  peekPiece: Piece | null;
  openPiece: (piece: Piece) => void;
  close: () => void;
  showPrevious: () => void;
  showNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function useDeskPeek({
  order,
  pieces,
  setFocusId,
  watchPiece,
  unwatchPiece,
}: UseDeskPeekParams): DeskPeek {
  const [peekPieceId, setPeekPieceId] = useState<string | null>(null);
  const peekPiece = peekPieceId
    ? (pieces.find((piece) => piece.id === peekPieceId) ?? null)
    : null;
  const openPieceId = peekPiece?.id ?? null;
  const orderIndex = openPieceId
    ? order.findIndex((piece) => piece.id === openPieceId)
    : -1;

  useEffect(() => {
    if (!openPieceId) return undefined;
    watchPiece(openPieceId);
    return () => unwatchPiece(openPieceId);
  }, [openPieceId, watchPiece, unwatchPiece]);

  function openPiece(piece: Piece): void {
    setPeekPieceId(piece.id);
    setFocusId(piece.id);
  }

  function stepBy(offset: number): void {
    const target = order[orderIndex + offset];
    if (orderIndex >= 0 && target) openPiece(target);
  }

  return {
    peekPiece,
    openPiece,
    close: () => setPeekPieceId(null),
    showPrevious: () => stepBy(-1),
    showNext: () => stepBy(1),
    hasPrevious: orderIndex > 0,
    hasNext: orderIndex >= 0 && orderIndex < order.length - 1,
  };
}
