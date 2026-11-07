import { FiClock } from "react-icons/fi";
import { isFreshInStage, stageAge } from "./deskStageAge";
import { viewStageLabelKey } from "./stageLabels";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import styles from "./PiecesBoard.module.css";

export interface PiecesBoardCardStageAgeProps {
  piece: Piece;
  /** The day the stage age is counted from, read once per board render. */
  today: Date;
}

/**
 * How long the piece has sat in its stage. A piece still fresh in its stage
 * shows nothing; a stalled one adds the clock icon. Sighted readers get the
 * short day count, screen readers the full sentence naming the stage.
 */
export function PiecesBoardCardStageAge({
  piece,
  today,
}: PiecesBoardCardStageAgeProps) {
  const { t } = useTranslation();
  const computedAge = stageAge(piece, today);
  if (!computedAge || isFreshInStage(computedAge)) return null;

  const stageAgeAccessibleText = t(
    computedAge.isStalled
      ? "magazine:desk.stageAge.stalled"
      : "magazine:desk.stageAge.long",
    { count: computedAge.days, stage: t(viewStageLabelKey(piece.stage)) },
  );

  return (
    <div
      className={cx(
        styles.stageAge,
        computedAge.isStalled && styles.stageAgeStalled,
      )}
    >
      {computedAge.isStalled && (
        <FiClock aria-hidden="true" className={styles.stageAgeIcon} />
      )}
      <span aria-hidden="true">
        {t("magazine:desk.stageAge.short", { days: computedAge.days })}
      </span>
      <span className="visuallyHidden">{stageAgeAccessibleText}</span>
    </div>
  );
}
