import type { KeyboardEvent, MouseEvent } from "react";
import { Button } from "../../../shared/components/ui";
import { FormatBadge } from "./FormatBadge";
import { StagePill } from "./StagePill";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import type { DeskTrack } from "./DeskTrackTabs";
import styles from "./PiecesPipeline.module.css";

interface PieceRowProps {
  piece: Piece;
  /** Whether this is the keyboard-navigated "current" row (inset accent shadow). */
  focused: boolean;
  /** The track this row is rendered under, so the reassignment action points
   *  the other way (Issue → standalone, Highlights → into the issue). */
  track: DeskTrack;
  /** Whether a current issue exists — the "Add to issue" action is hidden without one. */
  hasCurrentIssue: boolean;
  /** The current issue's display number, for the "Add to issue N" label. */
  issueNumber: string;
  onOpen: (piece: Piece) => void;
  onEdit: (piece: Piece) => void;
  onChase: (piece: Piece) => void;
  onHandoff: (piece: Piece) => void;
  onReassign: (piece: Piece) => void;
}

/**
 * One row of `PiecesPipeline`: title/format/section/byline, stage pill, who
 * the piece is waiting on, its due date, and hover-revealed row actions.
 * Keyboard-focusable — Enter opens the piece, matching a click. Ported from
 * the design's `.prow` (`mag-desk.jsx`/`mag.css`).
 */
export function PieceRow({
  piece,
  focused,
  track,
  hasCurrentIssue,
  issueNumber,
  onOpen,
  onEdit,
  onChase,
  onHandoff,
  onReassign,
}: PieceRowProps) {
  const { t } = useTranslation();
  // Reassignment points the opposite way to the current track. On the Issue
  // track any piece can be lifted back out to stand alone; on the Highlights
  // track it can be pulled into the current issue — but only when one exists.
  const showReassign = track === "issue" || hasCurrentIssue;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter") onOpen(piece);
  }

  function stopRowActionsClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
  }

  return (
    <div
      className={styles.prow}
      data-focus={focused}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(piece)}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.titleCell}>
        <h4 className={styles.title}>{piece.title}</h4>
        <div className={styles.sub}>
          <FormatBadge format={piece.format} />
          <span>{piece.section}</span>
          <span>·</span>
          <span>{piece.byline}</span>
          {piece.fresh && (
            <span className={styles.tagJade}>
              {t("magazine:desk.pieceRow.newVoice")}
            </span>
          )}
        </div>
      </div>
      <div>
        <StagePill stage={piece.stage} />
      </div>
      <div className={styles.waitCell}>
        {piece.wait === "writer" ? (
          <>
            <span className={cx(styles.dot, styles.dotAmber)} />
            {t("magazine:desk.pieceRow.writer")}
          </>
        ) : piece.wait === "you" ? (
          <>
            <span className={cx(styles.dot, styles.dotLate)} />
            {t("magazine:desk.pieceRow.you")}
          </>
        ) : (
          <>
            <span className={styles.dot} />
            {t("magazine:desk.pieceRow.nobody")}
          </>
        )}
      </div>
      <div className={cx(styles.due, piece.late && styles.late)}>
        {piece.due === "ready" ? "—" : piece.due}
      </div>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- onClick only stops the inner action Buttons' clicks from bubbling to the row's open handler; this wrapper is not an interactive control and the Buttons own their own focus/keys. */}
      <div className={styles.rowActs} onClick={stopRowActionsClick}>
        <Button variant="ghost" size="sm" onClick={() => onEdit(piece)}>
          {t("magazine:desk.pieceRow.edit")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onChase(piece)}>
          {t("magazine:desk.pieceRow.chase")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onHandoff(piece)}>
          {t("magazine:desk.pieceRow.handOff")}
        </Button>
        {showReassign && (
          <Button variant="ghost" size="sm" onClick={() => onReassign(piece)}>
            {track === "issue"
              ? t("magazine:desk.reassign.makeStandalone")
              : t("magazine:desk.reassign.addToIssue", { number: issueNumber })}
          </Button>
        )}
      </div>
    </div>
  );
}
