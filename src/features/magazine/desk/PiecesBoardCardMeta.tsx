import { Avatar } from "../../../shared/components/ui";
import type { DeskDueDescription } from "./deskDue";
import { initialsFromName } from "../../../shared/lib/initials";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import styles from "./PiecesBoard.module.css";

export interface PiecesBoardCardMetaProps {
  piece: Piece;
  /** The card's due description, shared with the card's late edge. */
  due: DeskDueDescription;
}

/** The card's meta row: the writer (or a "no writer" note) and the due date. */
export function PiecesBoardCardMeta({ piece, due }: PiecesBoardCardMetaProps) {
  const { t } = useTranslation();
  const dueText =
    due.kind === "relative" && due.labelKey
      ? t(due.labelKey, due.values)
      : due.kind === "raw"
        ? due.text
        : null;

  return (
    <div className={styles.cardMeta}>
      {piece.byline ? (
        <>
          {/* Plum for both formats: coral stays the Write action's. */}
          <Avatar
            initials={initialsFromName(piece.byline)}
            tint="plum"
            size={20}
          />
          <span className={styles.byline}>{piece.byline}</span>
        </>
      ) : (
        <span className={styles.noWriter}>
          {t("magazine:desk.pieceRow.noWriter")}
        </span>
      )}
      {dueText && (
        <span className={cx(styles.due, due.isLate && styles.dueLate)}>
          {dueText}
        </span>
      )}
    </div>
  );
}
