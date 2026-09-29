import { useContext } from "react";
import { PieceDueDatePopover } from "./PieceDueDatePopover";
import { describeDue } from "./deskDue";
import { PieceDueDateContext } from "./pieceDueDate";
import { viewStageLabelKey } from "./stageLabels";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import styles from "./PieceRow.module.css";

export interface PieceRowDueProps {
  piece: Piece;
  /** The day "due" is counted from; the table passes one for every row. */
  today?: Date;
  /** The row title's id, so "Set date" is announced with its piece. */
  titleId: string;
  /** "Set date" where no `PieceDueDateContext` is provided. */
  onSetDue: () => void;
}

/**
 * The due cell, counted from today ("in 3 days", "2 days late"). An undated
 * piece offers "Set date": a date popover that saves the day on the spot
 * under `PieceDueDateContext`, else a hand-off to `onSetDue`. Finished work
 * shows its stage name, muted ("Ready"), and reads out "No due date", so the
 * column always has an answer for the eye and the ear.
 */
export function PieceRowDue({
  piece,
  today,
  titleId,
  onSetDue,
}: PieceRowDueProps) {
  const { t } = useTranslation();
  const dueDateEditor = useContext(PieceDueDateContext);
  const due = describeDue(piece, today ?? new Date());

  if (due.kind === "none") {
    return (
      <div className={styles.dueCell}>
        {dueDateEditor ? (
          <PieceDueDatePopover
            titleId={titleId}
            onSave={(dueOn) => dueDateEditor.saveDueOn(piece.id, dueOn)}
          />
        ) : (
          <button
            type="button"
            className={styles.setDate}
            aria-describedby={titleId}
            onClick={onSetDue}
          >
            {t("magazine:desk.pieceRow.setDate")}
          </button>
        )}
      </div>
    );
  }
  if (due.kind === "ready") {
    return (
      <div className={cx(styles.dueCell, styles.dueText, styles.dueFinished)}>
        <span aria-hidden="true">{t(viewStageLabelKey(piece.stage))}</span>
        <span className="visuallyHidden">
          {t("magazine:desk.pieceRow.noDue")}
        </span>
      </div>
    );
  }
  const text =
    due.kind === "relative" && due.labelKey
      ? t(due.labelKey, due.values)
      : (due.text ?? "");
  return (
    <div
      className={cx(styles.dueCell, styles.dueText, due.isLate && styles.late)}
      data-late={due.isLate}
    >
      <span className="visuallyHidden">
        {t("magazine:desk.pipeline.columnDue")}{" "}
      </span>
      {text}
    </div>
  );
}
