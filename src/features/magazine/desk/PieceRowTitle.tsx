import { PieceRowMeta } from "./PieceRowCells";
import { PresenceStack } from "./PresenceStack";
import type { Viewer } from "../api/useDeskPresence";
import type { Piece } from "../data/desk.data";
import styles from "./PieceRow.module.css";

export interface PieceRowTitleProps {
  piece: Piece;
  /** The id the row's due and next-action cells describe themselves by. */
  titleId: string;
  /** Whether this piece is showing in the peek panel. */
  isOpen: boolean;
  onOpen: (piece: Piece) => void;
  /** The day "time in stage" is counted from, forwarded to the meta line's
   *  stage-age text so it agrees with the same figure under the stage dots
   *  (`PieceRowStage`, in `PieceRow.tsx`). */
  today?: Date;
  /** Editors viewing this piece right now, shown as a face stack after the
   *  title. Empty or omitted renders nothing. */
  viewers?: Viewer[];
}

/**
 * The piece cell: the title button, an optional presence stack and the meta
 * line, laid out as three named grid areas (`PieceRow.module.css`) that
 * redraw per density and width step. The stack always lands right after the
 * title's last word, rendering once so a screen reader only ever finds it
 * there. Split out of `PieceRow.tsx` so the row stays under 200 lines.
 */
export function PieceRowTitle({
  piece,
  titleId,
  isOpen,
  onOpen,
  today,
  viewers,
}: PieceRowTitleProps) {
  const viewerStack = viewers && viewers.length > 0 ? viewers : null;

  return (
    <div className={styles.pieceCell}>
      <button
        type="button"
        id={titleId}
        className={styles.title}
        aria-current={isOpen || undefined}
        onClick={() => onOpen(piece)}
      >
        {/* The span carries the ellipsis and the phone clamp, which a
            button's own box does not apply reliably. */}
        <span className={styles.titleText}>{piece.title}</span>
      </button>
      {viewerStack && (
        <PresenceStack
          viewers={viewerStack}
          size={20}
          className={styles.presence}
        />
      )}
      <PieceRowMeta piece={piece} today={today} />
    </div>
  );
}
