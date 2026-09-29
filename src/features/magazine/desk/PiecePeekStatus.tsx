import { FiClock } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../shared/i18n/types";
import { cx } from "../../../shared/lib/cx";
import { useMagazineEditors } from "../api/useMagazineEditors";
import type { Piece } from "../data/desk.data";
import type { DeskTrack } from "./deskTrack";
import { describeDue, type DeskDueDescription } from "./deskDue";
import { stageAge } from "./deskStageAge";
import { describeWaitingOn, waitingOnLabel } from "./deskWaitingOn";
import { DeskToneDot } from "./DeskToneDot";
import { pieceNextAction, type PieceNextAction } from "./pieceNextAction";
import { StageProgress } from "./StageProgress";
import { viewStageLabelKey } from "./stageLabels";
import { useDeskViewerId } from "./useDeskViewerId";
import styles from "./PiecePeekPanel.module.css";

export interface PiecePeekStatusProps {
  piece: Piece;
  track: DeskTrack;
  onNextAction: (piece: Piece, action: PieceNextAction) => void;
  /** The viewing editor's id (the page's `activeMe`). Omitted, the panel
   *  reads the signed-in editor itself (`useDeskViewerId`). */
  me?: string;
}

/** The due text, or null when there is nothing left to chase (Ready and
 *  Published: the stage bar above already says so). */
function dueText(due: DeskDueDescription, translate: TFunction): string | null {
  switch (due.kind) {
    case "relative":
      return due.labelKey ? translate(due.labelKey, due.values) : null;
    case "raw":
      return due.text ?? null;
    case "none":
      return translate("magazine:piece.brief.noDateSet");
    case "ready":
      return null;
  }
}

/**
 * Where the piece stands and what moves it: the stage bar with its name, the
 * one next action from `pieceNextAction`, then when it is due and who holds
 * it, each marked with the desk's tone dot. Reads only the desk's `Piece`, so
 * it paints before the record has loaded. Calm unless late: only a late due
 * date takes the late tone.
 */
export function PiecePeekStatus({
  piece,
  track,
  onNextAction,
  me,
}: PiecePeekStatusProps) {
  const { t } = useTranslation();
  const viewerId = useDeskViewerId(me);
  const { editors } = useMagazineEditors();
  // The table's "Waiting on" rule, so the row and the panel name one person.
  const wait = describeWaitingOn(piece, viewerId, editors);
  const nextAction = pieceNextAction(piece, track);
  const due = describeDue(piece, new Date());
  const dueLabel = dueText(due, t);
  const age = stageAge(piece, new Date());
  const stageAgeSentence = age
    ? t(
        age.isStalled
          ? "magazine:desk.stageAge.stalled"
          : "magazine:desk.stageAge.long",
        { count: age.days, stage: t(viewStageLabelKey(piece.stage)) },
      )
    : null;

  return (
    <div className={styles.status}>
      <div className={styles.progressRow}>
        <StageProgress stage={piece.stage} variant="bar" showLabel />
        {nextAction && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNextAction(piece, nextAction)}
          >
            {t(nextAction.labelKey)}
          </Button>
        )}
      </div>
      <dl className={styles.facts}>
        {dueLabel !== null && (
          <div className={styles.fact}>
            <dt>{t("magazine:desk.pipeline.columnDue")}</dt>
            <dd className={cx(due.isLate && styles.late)}>
              <DeskToneDot tone={due.isLate ? "late" : "neutral"} />
              {dueLabel}
            </dd>
          </div>
        )}
        <div className={styles.fact}>
          <dt>{t("magazine:desk.pipeline.columnWaitingOn")}</dt>
          <dd>
            <DeskToneDot tone={wait.tone} />
            {waitingOnLabel(wait, t)}
          </dd>
        </div>
        {stageAgeSentence !== null && (
          <div className={styles.fact}>
            <dt>{t("magazine:desk.stageAge.columnLabel")}</dt>
            <dd className={cx(age?.isStalled && styles.stalled)}>
              {age?.isStalled ? (
                <FiClock aria-hidden="true" className={styles.stalledIcon} />
              ) : (
                <DeskToneDot tone="neutral" />
              )}
              {stageAgeSentence}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
