import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  pieceNextActionShortLabelKey,
  type PieceNextAction,
} from "./pieceNextAction";
import styles from "./PieceRow.module.css";

export interface PieceRowNextActionProps {
  /** The row's one verb, or null when the piece has none (Published). */
  action: PieceNextAction | null;
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
 */
export function PieceRowNextAction({
  action,
  titleId,
  onRun,
}: PieceRowNextActionProps) {
  const { t } = useTranslation();
  if (!action) return <div className={styles.actionCell} />;
  const label = t(action.labelKey);
  const shortLabel = t(pieceNextActionShortLabelKey(action));

  return (
    <div className={styles.actionCell}>
      <Button
        variant="ghost"
        size="sm"
        className={styles.nextAction}
        aria-describedby={titleId}
        aria-label={shortLabel === label ? undefined : label}
        onClick={() => onRun(action)}
      >
        {shortLabel}
      </Button>
    </div>
  );
}
