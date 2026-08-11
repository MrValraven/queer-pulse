import { EmptyState } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PieceRow } from "./PieceRow";
import type { Piece } from "../data/desk.data";
import type { DeskTrack } from "./DeskTrackTabs";
import styles from "./PiecesPipeline.module.css";

export interface PiecesPipelineProps {
  pieces: Piece[];
  /** Id of the keyboard-navigated "current" row, or null when none. */
  focusId: string | null;
  /** Active track — drives each row's reassignment action direction/label. */
  track: DeskTrack;
  hasCurrentIssue: boolean;
  issueNumber: string;
  onOpen: (piece: Piece) => void;
  onEdit: (piece: Piece) => void;
  onChase: (piece: Piece) => void;
  onHandoff: (piece: Piece) => void;
  onReassign: (piece: Piece) => void;
}

/**
 * The desk's default "pipeline" layout: a flat table of every in-flight
 * piece — title/section/byline, stage, who it's waiting on, and its due
 * date — one row per piece. Ported from the design's `PiecesTable`/`.pieces`
 * (`mag-desk.jsx`).
 */
export function PiecesPipeline({
  pieces,
  focusId,
  track,
  hasCurrentIssue,
  issueNumber,
  onOpen,
  onEdit,
  onChase,
  onHandoff,
  onReassign,
}: PiecesPipelineProps) {
  const { t } = useTranslation();

  if (pieces.length === 0) {
    return (
      <div className={styles.pieces}>
        <EmptyState
          title={t("magazine:desk.pipeline.emptyTitle")}
          description={t("magazine:desk.pipeline.emptyDescription")}
          compact
        />
      </div>
    );
  }

  return (
    <div className={styles.pieces}>
      <div className={styles.phead}>
        <span>{t("magazine:desk.pipeline.columnPiece")}</span>
        <span>{t("magazine:desk.pipeline.columnStage")}</span>
        <span>{t("magazine:desk.pipeline.columnWaitingOn")}</span>
        <span>{t("magazine:desk.pipeline.columnDue")}</span>
        <span />
      </div>
      {pieces.map((piece) => (
        <PieceRow
          key={piece.id}
          piece={piece}
          focused={focusId === piece.id}
          track={track}
          hasCurrentIssue={hasCurrentIssue}
          issueNumber={issueNumber}
          onOpen={onOpen}
          onEdit={onEdit}
          onChase={onChase}
          onHandoff={onHandoff}
          onReassign={onReassign}
        />
      ))}
    </div>
  );
}
