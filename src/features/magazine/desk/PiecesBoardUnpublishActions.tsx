import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { UnpublishLandingStage } from "../api/piecePublish.api";
import type { Piece } from "../data/desk.data";
import { BOARD_UNPUBLISH_OPTIONS } from "./piecesBoardUnpublish.data";
import styles from "./PiecesBoard.module.css";

export interface PiecesBoardUnpublishActionsProps {
  piece: Piece;
  onUnpublish: (piece: Piece, stage: UnpublishLandingStage) => void;
  /** The card title's id, so each button is described by the piece it acts
   *  on, the same pattern the card's next-action button uses. */
  titleId: string;
}

/**
 * The way out of a Published card's locked status line: one button per
 * landing stage, the same two actions (and labels) as the row's More menu.
 * They are plain buttons in the card's controls row, so they take Tab like
 * the stage picker's own trigger and are always mounted: a Published card
 * never gains or loses them in place.
 */
export function PiecesBoardUnpublishActions({
  piece,
  onUnpublish,
  titleId,
}: PiecesBoardUnpublishActionsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.unpublishActions}>
      {BOARD_UNPUBLISH_OPTIONS.map(({ stage, labelKey, icon: Icon }) => (
        <Button
          key={stage}
          variant="ghost"
          size="sm"
          aria-describedby={titleId}
          onClick={() => onUnpublish(piece, stage)}
        >
          <Icon aria-hidden="true" />
          {t(labelKey)}
        </Button>
      ))}
    </div>
  );
}
