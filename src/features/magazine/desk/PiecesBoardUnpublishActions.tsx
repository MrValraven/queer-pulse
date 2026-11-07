import { FiEyeOff } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import styles from "./PiecesBoard.module.css";

export interface PiecesBoardUnpublishActionsProps {
  piece: Piece;
  /** Raises the desk's unpublish confirm, where the destination is picked. */
  onUnpublish: (piece: Piece) => void;
  /** The card title's id, so the button is described by the piece it acts
   *  on, the same pattern the card's next-action button uses. */
  titleId: string;
}

/**
 * The way out of a Published card's locked status line: one quiet
 * "Unpublish" button, the same action as the row's More menu item. Both open
 * the confirm, which asks whether the piece goes back to draft or to review.
 * It is a plain button in the card's controls row, so it takes Tab like the
 * stage picker's own trigger and is always mounted: a Published card never
 * gains or loses it in place.
 */
export function PiecesBoardUnpublishActions({
  piece,
  onUnpublish,
  titleId,
}: PiecesBoardUnpublishActionsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.unpublishActions}>
      <Button
        variant="quiet"
        size="sm"
        className={styles.unpublishButton}
        aria-describedby={titleId}
        onClick={() => onUnpublish(piece)}
      >
        <FiEyeOff aria-hidden="true" />
        {t("magazine:desk.board.unpublish")}
      </Button>
    </div>
  );
}
