import { useRef, useState, type DragEvent, type PointerEvent } from "react";
import type { Piece, Stage } from "../data/desk.data";

/**
 * Whether `piece` may be dropped on the `stage` column. A piece enters or
 * leaves Published only through a real publish or unpublish:
 * - Into Published: a piece goes live only through a real publish, which
 *   first clears the consent and sensitivity gate, and the backend refuses
 *   `stage: 'published'` on a plain update.
 * - Out of Published: a plain stage update leaves the article live (it never
 *   clears `publishedAt` the way Unpublish does), so a live piece moves back
 *   only through the piece record's Unpublish.
 * The stage picker in `PiecesBoardCard` follows the same rule. Dropping a
 * piece on its own column is a no-op, so that column does not light up
 * either.
 */
export function canDropOnStage(piece: Piece, stage: Stage): boolean {
  return (
    piece.stage !== "Published" &&
    stage !== "Published" &&
    piece.stage !== stage
  );
}

/** Whether a card can be picked up at all: a Published card stays put. */
export function isCardDraggable(piece: Piece): boolean {
  return piece.stage !== "Published";
}

/** Marks a region inside a card (its controls) where a press never starts a drag. */
export const DRAG_BLOCK_ATTRIBUTE = "data-drag-block";

export interface BoardCardDragProps {
  draggable: boolean;
  onPointerDown?: (event: PointerEvent<HTMLElement>) => void;
  onDragStart?: (event: DragEvent<HTMLElement>) => void;
  onDragEnd?: () => void;
}

export interface BoardColumnDropProps {
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}

export interface UseBoardDragResult {
  /** The piece being dragged, while a drag is in progress. */
  draggedPiece: Piece | null;
  /** The column the dragged card would land in if released now. */
  dropTargetStage: Stage | null;
  cardDragProps: (piece: Piece) => BoardCardDragProps;
  columnDropProps: (stage: Stage) => BoardColumnDropProps;
}

/**
 * Native HTML5 drag and drop for the board: drag a card, release it over
 * another stage column, and the board calls `onMove(piece, stage)`, the same
 * handler the card's stage picker uses. The picker stays the keyboard and
 * screen-reader path; this hook only adds the pointer shortcut.
 *
 * The dragged piece lives in state (the card dims, the target column lights
 * up). Its id also rides on `dataTransfer`, which Firefox needs before it
 * will start a drag at all.
 *
 * `dragstart` always names the card as its target, whichever child the press
 * began on, so the press origin is noted on `pointerdown`: a press that
 * starts inside a `data-drag-block` region (the picker, the next-action
 * button) cancels the drag and leaves that control to do its own job.
 */
export function useBoardDrag(
  pieces: Piece[],
  onMove: (piece: Piece, stage: Stage) => void,
): UseBoardDragResult {
  const [draggedPieceId, setDraggedPieceId] = useState<string | null>(null);
  const [dropTargetStage, setDropTargetStage] = useState<Stage | null>(null);
  const isPressOnControlRef = useRef(false);
  const draggedPiece =
    pieces.find((piece) => piece.id === draggedPieceId) ?? null;

  function endDrag() {
    setDraggedPieceId(null);
    setDropTargetStage(null);
  }

  function cardDragProps(piece: Piece): BoardCardDragProps {
    if (!isCardDraggable(piece)) return { draggable: false };
    return {
      draggable: true,
      onPointerDown: (event) => {
        isPressOnControlRef.current =
          event.target instanceof Element &&
          event.target.closest(`[${DRAG_BLOCK_ATTRIBUTE}]`) !== null;
      },
      onDragStart: (event) => {
        if (isPressOnControlRef.current) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", piece.id);
        setDraggedPieceId(piece.id);
      },
      onDragEnd: endDrag,
    };
  }

  function columnDropProps(stage: Stage): BoardColumnDropProps {
    const isValidTarget =
      draggedPiece !== null && canDropOnStage(draggedPiece, stage);
    return {
      onDragOver: (event) => {
        // Leaving the default in place is what tells the browser "no drop
        // here", so an invalid column shows the not-allowed cursor.
        if (!isValidTarget) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (dropTargetStage !== stage) setDropTargetStage(stage);
      },
      onDragLeave: (event) => {
        // dragleave also fires when the pointer crosses into a child card;
        // only clear once it has left the column itself.
        const nextTarget = event.relatedTarget;
        if (
          nextTarget instanceof Node &&
          event.currentTarget.contains(nextTarget)
        )
          return;
        if (dropTargetStage === stage) setDropTargetStage(null);
      },
      onDrop: (event) => {
        event.preventDefault();
        if (draggedPiece && canDropOnStage(draggedPiece, stage)) {
          onMove(draggedPiece, stage);
        }
        endDrag();
      },
    };
  }

  return { draggedPiece, dropTargetStage, cardDragProps, columnDropProps };
}
