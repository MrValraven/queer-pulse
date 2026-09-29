import { useId, type MouseEvent } from "react";
import { FiClock } from "react-icons/fi";
import { Avatar, Button } from "../../../shared/components/ui";
import { FormatIcon } from "./FormatBadge";
import { DeskToneDot } from "./DeskToneDot";
import { describeDue } from "./deskDue";
import {
  describeWaitingOn,
  isWaitingOnViewer,
  pieceHolder,
  waitingOnLabel,
} from "./deskWaitingOn";
import { isFreshInStage, stageAge } from "./deskStageAge";
import { pieceNextAction, type PieceNextAction } from "./pieceNextAction";
import { PiecesBoardStagePicker } from "./PiecesBoardStagePicker";
import { viewStageLabelKey } from "./stageLabels";
import type { BoardCardDragProps } from "./useBoardDrag";
import type { DeskTrack } from "./deskTrack";
import { useMagazineEditors } from "../api/useMagazineEditors";
import { initialsFromName } from "../../../shared/lib/initials";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece, Stage } from "../data/desk.data";
import styles from "./PiecesBoard.module.css";

export interface PiecesBoardCardProps {
  piece: Piece;
  stages: Stage[];
  track: DeskTrack;
  /** The viewer's editor id: a piece waiting on them gets the "your turn" edge. */
  me?: string;
  /** The day "due" is counted from, read once per board render. */
  today: Date;
  isDragging: boolean;
  dragProps: BoardCardDragProps;
  onOpen: (piece: Piece) => void;
  onMove: (piece: Piece, stage: Stage) => void;
  /** Runs the card's next-action button; without it the button opens the piece. */
  onNextAction?: (piece: Piece, action: PieceNextAction) => void;
}

function stopControlsClick(event: MouseEvent<HTMLDivElement>) {
  event.stopPropagation();
}

/**
 * One card on the board. Dragging moves the piece; the stage picker at its
 * foot does the same move from the keyboard or a screen reader. A Published
 * card stays put (see `canDropOnStage`). The title is the card's keyboard
 * target for opening; a mouse click elsewhere on the card opens it too. A
 * press on the controls row (`data-drag-block`) never starts a drag.
 */
export function PiecesBoardCard({
  piece,
  stages,
  track,
  me,
  today,
  isDragging,
  dragProps,
  onOpen,
  onMove,
  onNextAction,
}: PiecesBoardCardProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const due = describeDue(piece, today);
  // `null` past Published, with no stage-entry timestamp, or on its first
  // day in a stage, where "0d in stage" said nothing.
  const rawAge = stageAge(piece, today);
  const age = rawAge && !isFreshInStage(rawAge) ? rawAge : null;
  const nextAction = pieceNextAction(piece, track);
  const { editors } = useMagazineEditors();
  // The table's "Waiting on" rule: "You" only for the viewer's own piece,
  // a colleague by first name, and nothing when nobody holds it.
  const wait =
    pieceHolder(piece) === "nobody"
      ? null
      : describeWaitingOn(piece, me ?? "", editors);
  // The one "your turn" rule (`deskFocus.ts`'s chip reads the same helper).
  const isYourTurn = isWaitingOnViewer(piece, me ?? "");
  const dueText =
    due.kind === "relative" && due.labelKey
      ? t(due.labelKey, due.values)
      : due.kind === "raw"
        ? due.text
        : null;
  const stageAgeAccessibleText = age
    ? t(
        age.isStalled
          ? "magazine:desk.stageAge.stalled"
          : "magazine:desk.stageAge.long",
        { count: age.days, stage: t(viewStageLabelKey(piece.stage)) },
      )
    : null;

  const runNextAction = (action: PieceNextAction) =>
    onNextAction ? onNextAction(piece, action) : onOpen(piece);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- the title <button> is the card's keyboard path for opening; this onClick only widens the mouse target to the whole card.
    <div
      className={cx(
        styles.card,
        isYourTurn && styles.cardYourTurn,
        due.isLate && styles.cardLate,
        !dragProps.draggable && styles.cardFixed,
      )}
      data-dragging={isDragging}
      {...dragProps}
      onClick={() => onOpen(piece)}
    >
      <div className={styles.cardTop}>
        <FormatIcon format={piece.format} />
        {wait && (
          <span className={styles.waiting}>
            <DeskToneDot tone={wait.tone} />
            {waitingOnLabel(wait, t)}
          </span>
        )}
      </div>
      <h4 className={styles.cardTitle}>
        <button
          type="button"
          id={titleId}
          className={styles.titleButton}
          onClick={(event) => {
            event.stopPropagation();
            onOpen(piece);
          }}
        >
          {piece.title}
        </button>
      </h4>
      <div className={styles.cardMeta}>
        {piece.byline ? (
          <>
            {/* Plum for both formats: coral stays the
                Write action's colour alone (the colour-jobs principle). */}
            <Avatar
              initials={initialsFromName(piece.byline)}
              tint="plum"
              size={20}
            />
            <span className={styles.byline}>{piece.byline}</span>
          </>
        ) : (
          <span className={styles.noWriter}>
            {t("magazine:desk.pieceRow.noWriter")}
          </span>
        )}
        {dueText && (
          <span className={cx(styles.due, due.isLate && styles.dueLate)}>
            {dueText}
          </span>
        )}
      </div>
      {age && (
        <div
          className={cx(
            styles.stageAge,
            age.isStalled && styles.stageAgeStalled,
          )}
        >
          {age.isStalled && (
            <FiClock aria-hidden="true" className={styles.stageAgeIcon} />
          )}
          <span aria-hidden="true">
            {t("magazine:desk.stageAge.short", { days: age.days })}
          </span>
          <span className="visuallyHidden">{stageAgeAccessibleText}</span>
        </div>
      )}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- onClick only stops the controls' clicks from bubbling to the card's open handler; the controls own their own focus and keys. */}
      <div
        className={styles.cardControls}
        data-drag-block
        onClick={stopControlsClick}
      >
        {nextAction && (
          <Button
            variant="ghost"
            size="sm"
            aria-describedby={titleId}
            onClick={() => runNextAction(nextAction)}
          >
            {t(nextAction.labelKey)}
          </Button>
        )}
        <PiecesBoardStagePicker
          piece={piece}
          stages={stages}
          onMove={onMove}
          titleId={titleId}
        />
      </div>
    </div>
  );
}
