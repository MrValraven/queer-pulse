import type { MouseEvent } from "react";
import { Button } from "../../../shared/components/ui";
import { pieceNextAction, type PieceNextAction } from "./pieceNextAction";
import { PiecesBoardStagePicker } from "./PiecesBoardStagePicker";
import type { DeskTrack } from "./deskTrack";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece, Stage } from "../data/desk.data";
import styles from "./PiecesBoard.module.css";

export interface PiecesBoardCardControlsProps {
  piece: Piece;
  stages: Stage[];
  track: DeskTrack;
  /** The card title's id, so each control is described by its piece. */
  titleId: string;
  onOpen: (piece: Piece) => void;
  onMove: (piece: Piece, stage: Stage) => void;
  /** Runs the next-action button; without it the button opens the piece. */
  onNextAction?: (piece: Piece, action: PieceNextAction) => void;
  /** Gives a Published card its Unpublish button (see the stage picker). */
  onUnpublish?: (piece: Piece) => void;
}

function stopControlsClick(event: MouseEvent<HTMLDivElement>) {
  event.stopPropagation();
}

/**
 * The card's foot: the next-action button and the stage picker. A press here
 * (`data-drag-block`) never starts a drag, and a click never reaches the
 * card's open handler.
 */
export function PiecesBoardCardControls({
  piece,
  stages,
  track,
  titleId,
  onOpen,
  onMove,
  onNextAction,
  onUnpublish,
}: PiecesBoardCardControlsProps) {
  const { t } = useTranslation();
  const nextAction = pieceNextAction(piece, track);

  const runNextAction = (action: PieceNextAction) =>
    onNextAction ? onNextAction(piece, action) : onOpen(piece);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- onClick only stops the controls' clicks from bubbling to the card's open handler; the controls own their own focus and keys.
    <div
      className={styles.cardControls}
      data-drag-block
      onClick={stopControlsClick}
    >
      {nextAction && (
        <Button
          variant="ghost"
          size="sm"
          aria-describedby={titleId}
          onClick={() => runNextAction(nextAction)}
        >
          {t(nextAction.labelKey)}
        </Button>
      )}
      <PiecesBoardStagePicker
        piece={piece}
        stages={stages}
        onMove={onMove}
        onUnpublish={onUnpublish}
        titleId={titleId}
      />
    </div>
  );
}
