import { useId } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import {
  pieceNextActionShortLabelKey,
  type PieceNextAction,
} from "./pieceNextAction";
import { PieceGoLiveStatus, PieceLiveSinceNote } from "./PieceGoLiveStatus";
import { pieceGoLiveState } from "./pieceGoLiveState";
import styles from "./PieceRow.module.css";

export interface PieceRowNextActionProps {
  /** The row's one verb, or null when the piece has none (Published, or
   *  scheduled to go live on its own). */
  action: PieceNextAction | null;
  /** The row's piece, read for its publish date: with no verb, a scheduled
   *  piece says when it goes live, so the cell never reads as stalled. */
  piece?: Pick<Piece, "publishedAt" | "stage">;
  /** The row title's id, so the verb is announced with its piece. */
  titleId: string;
  onRun: (action: PieceNextAction) => void;
}

/**
 * The next action cell of a pipeline row: one quiet text button. It shows
 * the verb's short form where one exists (PT "Insistir" for "Insistir com a
 * pessoa leitora"), so a long translation neither wraps nor widens the
 * table's action column; the full label stays its accessible name, and the
 * short form starts it, so what a speech user reads matches what they say.
 * With no verb, a piece with a publish date shows its quiet go-live line,
 * and the cell carries `data-status` so a phone card gives the line a row
 * of its own (`PieceRow.module.css`).
 *
 * A Ready piece whose scheduled instant has passed leads with Publish, and
 * PRD-437 puts a note above it: live since when, and that publishing it is
 * what tells the writer. The note is also the button's description. The
 * compact density shows the note's one-line short form ("Live since
 * {date}"), and the button's description stays the full sentence.
 */
export function PieceRowNextAction({
  action,
  piece,
  titleId,
  onRun,
}: PieceRowNextActionProps) {
  const { t } = useTranslation();
  const liveNoteId = useId();
  if (!action) {
    const hasStatus = piece !== undefined && pieceGoLiveState(piece) !== null;
    return (
      <div className={styles.actionCell} data-status={hasStatus || undefined}>
        {piece && <PieceGoLiveStatus piece={piece} align="end" />}
      </div>
    );
  }
  const label = t(action.labelKey);
  const shortLabel = t(pieceNextActionShortLabelKey(action));
  const liveSince =
    action.kind === "publish" &&
    piece?.publishedAt &&
    pieceGoLiveState(piece)?.kind === "live"
      ? piece.publishedAt
      : null;

  return (
    <div
      className={styles.actionCell}
      data-live-note={liveSince !== null || undefined}
    >
      {liveSince !== null && (
        <PieceLiveSinceNote
          publishedAt={liveSince}
          id={liveNoteId}
          align="end"
        />
      )}
      <Button
        variant="ghost"
        size="sm"
        className={styles.nextAction}
        aria-describedby={
          liveSince !== null ? `${titleId} ${liveNoteId}` : titleId
        }
        aria-label={shortLabel === label ? undefined : label}
        onClick={() => onRun(action)}
      >
        {shortLabel}
      </Button>
    </div>
  );
}
