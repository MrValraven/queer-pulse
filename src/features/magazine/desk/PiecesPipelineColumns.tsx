import { PieceCheckbox } from "./PieceCheckbox";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./PiecesPipeline.module.css";

export interface PiecesPipelineColumnsProps {
  areAllSelected: boolean;
  /** Some rows are selected, so select-all shows its mixed state. */
  isIndeterminate: boolean;
  onToggleSelectAll: () => void;
}

/**
 * The pipeline table's column header: select-all, then a label over each
 * column. The labels are for the eye only, since each row cell names its own
 * column aloud. "Waiting on" carries a short form too ("Waiting"), which the
 * middle width step swaps in so the label stays on one line
 * (`PiecesPipeline.module.css`). Split out of `PiecesPipeline.tsx` to keep
 * the table under 200 lines.
 */
export function PiecesPipelineColumns({
  areAllSelected,
  isIndeterminate,
  onToggleSelectAll,
}: PiecesPipelineColumnsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.columns}>
      <PieceCheckbox
        className={styles.selectAll}
        checked={areAllSelected}
        isIndeterminate={isIndeterminate}
        label={t("magazine:desk.pipeline.selectAllAria")}
        onChange={onToggleSelectAll}
      />
      <span aria-hidden="true">{t("magazine:desk.pipeline.columnPiece")}</span>
      <span aria-hidden="true" className={styles.columnFact}>
        {t("magazine:desk.pipeline.columnStage")}
      </span>
      <span aria-hidden="true" className={styles.columnFact}>
        <span className={styles.columnLabelFull}>
          {t("magazine:desk.pipeline.columnWaitingOn")}
        </span>
        <span className={styles.columnLabelShort}>
          {t("magazine:desk.pipeline.columnWaitingOnShort")}
        </span>
      </span>
      <span aria-hidden="true" className={styles.columnFact}>
        {t("magazine:desk.pipeline.columnDue")}
      </span>
      <span className={styles.columnActions} />
    </div>
  );
}
