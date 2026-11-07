import { useId } from "react";
import { describeDue } from "./deskDue";
import { isWaitingOnViewer } from "./deskWaitingOn";
import type { PieceNextAction } from "./pieceNextAction";
import { PiecesBoardCardTop } from "./PiecesBoardCardTop";
import { PiecesBoardCardMeta } from "./PiecesBoardCardMeta";
import { PiecesBoardCardStageAge } from "./PiecesBoardCardStageAge";
import { PiecesBoardCardControls } from "./PiecesBoardCardControls";
import type { BoardCardDragProps } from "./useBoardDrag";
import type { DeskTrack } from "./deskTrack";
import { cx } from "../../../shared/lib/cx";
import type { Piece, Stage } from "../data/desk.data";
import styles from "./PiecesBoard.module.css";

export interface PiecesBoardCardProps {
  piece: Piece;
  stages: Stage[];
  track: DeskTrack;
  /** The viewer's editor id; a piece waiting on them gets the "your turn" edge. */
  me?: string;
  /** The day "due" is counted from, read once per board render. */
  today: Date;
  isDragging: boolean;
  dragProps: BoardCardDragProps;
  onOpen: (piece: Piece) => void;
  onMove: (piece: Piece, stage: Stage) => void;
  /** Runs the card's next-action button; without it the button opens the piece. */
  onNextAction?: (piece: Piece, action: PieceNextAction) => void;
  /** Gives a Published card its Unpublish button (see the stage picker). */
  onUnpublish?: (piece: Piece) => void;
}

/**
 * One card on the board. Dragging moves the piece; the stage picker at its
 * foot does the same move from the keyboard or a screen reader. A Published
 * card stays put (see `canDropOnStage`). The title is the keyboard target
 * for opening; a click elsewhere on the card opens it too. A press on the
 * controls row (`data-drag-block`) never starts a drag.
 */
export function PiecesBoardCard({
  piece,
  stages,
  track,
  me,
  today,
  isDragging,
  dragProps,
  onOpen,
  onMove,
  onNextAction,
  onUnpublish,
}: PiecesBoardCardProps) {
  const titleId = useId();
  const due = describeDue(piece, today);
  const isYourTurn = isWaitingOnViewer(piece, me ?? "");

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- the title <button> is the card's keyboard path for opening; this onClick only widens the mouse target to the whole card.
    <div
      className={cx(
        styles.card,
        isYourTurn && styles.cardYourTurn,
        due.isLate && styles.cardLate,
        !dragProps.draggable && styles.cardFixed,
      )}
      data-dragging={isDragging}
      data-piece-surface=""
      {...dragProps}
      onClick={() => onOpen(piece)}
    >
      <PiecesBoardCardTop piece={piece} viewerId={me ?? ""} />
      <h4 className={styles.cardTitle}>
        <button
          type="button"
          id={titleId}
          className={styles.titleButton}
          // Lets the desk find this title again after a move (see
          // `deskPieceFocus.ts`), wherever the piece lands.
          data-piece-id={piece.id}
          data-piece-stage={piece.stage}
          onClick={(event) => {
            event.stopPropagation();
            onOpen(piece);
          }}
        >
          {piece.title}
        </button>
      </h4>
      <PiecesBoardCardMeta piece={piece} due={due} />
      <PiecesBoardCardStageAge piece={piece} today={today} />
      <PiecesBoardCardControls
        piece={piece}
        stages={stages}
        track={track}
        titleId={titleId}
        onOpen={onOpen}
        onMove={onMove}
        onNextAction={onNextAction}
        onUnpublish={onUnpublish}
      />
    </div>
  );
}
