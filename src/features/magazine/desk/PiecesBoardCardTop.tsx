import { FormatIcon } from "./FormatBadge";
import { DeskToneDot } from "./DeskToneDot";
import {
  describeWaitingOn,
  pieceHolder,
  waitingOnLabel,
} from "./deskWaitingOn";
import { useMagazineEditors } from "../api/useMagazineEditors";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import styles from "./PiecesBoard.module.css";

export interface PiecesBoardCardTopProps {
  piece: Piece;
  /** The viewer's editor id, so their own piece reads "You". */
  viewerId: string;
}

/**
 * The card's top row: the format icon and, when somebody holds the piece,
 * who it is waiting on.
 */
export function PiecesBoardCardTop({
  piece,
  viewerId,
}: PiecesBoardCardTopProps) {
  const { t } = useTranslation();
  const { editors } = useMagazineEditors();
  // The table's "Waiting on" rule: "You" for the viewer's own piece, a
  // colleague by first name, nothing when nobody holds it.
  const waitingOn =
    pieceHolder(piece) === "nobody"
      ? null
      : describeWaitingOn(piece, viewerId, editors);

  return (
    <div className={styles.cardTop}>
      <FormatIcon format={piece.format} />
      {waitingOn && (
        <span className={styles.waiting}>
          <DeskToneDot tone={waitingOn.tone} />
          {waitingOnLabel(waitingOn, t)}
        </span>
      )}
    </div>
  );
}
