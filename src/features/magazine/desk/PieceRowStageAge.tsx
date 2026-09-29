import { FiClock } from "react-icons/fi";
import { isFreshInStage, stageAge } from "./deskStageAge";
import { viewStageLabelKey } from "./stageLabels";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import styles from "./PieceRow.module.css";

/**
 * "5d in stage", muted, or the writer/amber "Stalled" treatment once
 * `stageAge` crosses that stage's own threshold. The row renders it twice,
 * under the stage dots and at the end of the meta line, and
 * `PieceRow.module.css` shows at most one of the two per width step and
 * density (compact rows drop it), so a screen reader never hears it twice.
 * `null` for a piece with no stage-entry timestamp, once it is Published, and
 * for its first day in a stage, where "0d in stage" would only add noise.
 */
export function PieceRowStageAge({
  piece,
  today,
  className,
}: {
  piece: Piece;
  today?: Date;
  className?: string;
}) {
  const { t } = useTranslation();
  const age = stageAge(piece, today ?? new Date());
  if (!age || isFreshInStage(age)) return null;
  const stageName = t(viewStageLabelKey(piece.stage));
  const accessibleText = age.isStalled
    ? t("magazine:desk.stageAge.stalled", { count: age.days, stage: stageName })
    : t("magazine:desk.stageAge.long", { count: age.days, stage: stageName });
  return (
    <div className={cx(className, age.isStalled && styles.stageAgeStalled)}>
      {age.isStalled && (
        <FiClock aria-hidden="true" className={styles.stageAgeIcon} />
      )}
      <span aria-hidden="true" className={styles.stageAgeText}>
        {t("magazine:desk.stageAge.short", { days: age.days })}
      </span>
      <span className="visuallyHidden">{accessibleText}</span>
    </div>
  );
}
