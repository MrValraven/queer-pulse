import { useEffect, useId, useRef, type MouseEvent } from "react";
import { PieceCheckbox } from "./PieceCheckbox";
import { PieceRowDue, PieceRowStage, PieceRowWait } from "./PieceRowCells";
import { PieceRowMenu } from "./PieceRowMenu";
import { PieceRowNextAction } from "./PieceRowNextAction";
import { PieceRowTitle } from "./PieceRowTitle";
import { matchesAllFocus } from "./deskFocus";
import { pieceNextAction, type PieceNextAction } from "./pieceNextAction";
import { issueItemLabelKey, runFallbackNextAction } from "./pieceRowActions";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Viewer } from "../api/useDeskPresence";
import type { Editor, Piece } from "../data/desk.data";
import type { DeskTrack } from "./deskTrack";
import styles from "./PieceRow.module.css";

export interface PieceRowProps {
  piece: Piece;
  /** Whether this is the keyboard-navigated "current" row (left accent). */
  focused: boolean;
  /** Whether this piece is showing in the peek panel (left accent). */
  isOpen?: boolean;
  /** The track this row is rendered under, so the issue item reads "Add to
   *  issue" for unfiled work and "Move issue" for filed work. Under
   *  "everything" the piece's own `issueId` decides. */
  track: DeskTrack;
  /** Whether any issue exists at all; with none, there is nothing to file to. */
  hasAnyIssue: boolean;
  /** Whether this row is part of the bulk selection. */
  selected: boolean;
  /** The day "due" is counted from. The table passes one for every row. */
  today?: Date;
  onToggleSelect: (piece: Piece) => void;
  onOpen: (piece: Piece) => void;
  onEdit: (piece: Piece) => void;
  onChase: (piece: Piece) => void;
  onHandoff: (piece: Piece) => void;
  /** Opens the issue picker for this one piece. */
  onAssignIssue: (piece: Piece) => void;
  /** Opens the delete confirmation for this piece, from the More menu. */
  onDelete: (piece: Piece) => void;
  /** Runs the row's next action. Without it, each kind falls back to the
   *  matching handler above (see `runFallbackNextAction`). */
  onNextAction?: (piece: Piece, action: PieceNextAction) => void;
  /** "Set date" on an undated piece. Falls back to `onEdit`. */
  onSetDue?: (piece: Piece) => void;
  /** Editors viewing this piece right now, shown as a face stack after the
   *  title. Empty or omitted renders nothing. */
  viewers?: Viewer[];
  /** The viewing editor's id: "Waiting on You" and the stronger next action
   *  belong only to their own turn. */
  me?: string;
  /** The editor directory, so a piece waiting on a colleague names them. */
  editors?: readonly Editor[];
  /** The table is stacking rows into phone cards, where the verb and More
   *  sit on the title's line: they render before the facts then, so Tab
   *  follows the card as it reads. */
  isStacked?: boolean;
}

const NO_EDITORS: readonly Editor[] = [];

/** Clicks on these belong to the control itself; the row leaves them alone. */
const ROW_CONTROL_SELECTOR = "button, a, input, label";

/**
 * One row of `PiecesPipeline`: select, the piece, how far it has come, who
 * holds it, when it is due, the one thing to do next, and a More menu for the
 * rest. The title is the row's primary control and its keyboard target; a
 * mouse click anywhere else on the row opens the piece the same way, so the
 * whole line stays a generous target without the row posing as a button.
 */
export function PieceRow({
  piece,
  focused,
  isOpen = false,
  track,
  hasAnyIssue,
  selected,
  today,
  onToggleSelect,
  onOpen,
  onEdit,
  onChase,
  onHandoff,
  onAssignIssue,
  onDelete,
  onNextAction,
  onSetDue,
  viewers,
  me = "",
  editors = NO_EDITORS,
  isStacked = false,
}: PieceRowProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const rowRef = useRef<HTMLDivElement>(null);
  const nextAction = pieceNextAction(piece, track);
  // The "Your turn" chip's own test, so the outlined action marks exactly
  // the rows that chip and group count.
  const isYourTurn = me !== "" && matchesAllFocus(piece, me, ["your-turn"]);

  // j/k move the current row without moving DOM focus, so bring it into view.
  useEffect(() => {
    if (focused) rowRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [focused]);

  function handleRowClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;
    // Portaled menu clicks bubble here through React but sit outside the row.
    if (!(target instanceof Element) || !event.currentTarget.contains(target)) {
      return;
    }
    const control = target.closest(ROW_CONTROL_SELECTOR);
    if (control && event.currentTarget.contains(control)) return;
    // Selecting a title to copy it should not open the piece.
    if (window.getSelection()?.toString()) return;
    onOpen(piece);
  }

  function runNextAction(action: PieceNextAction): void {
    if (onNextAction) onNextAction(piece, action);
    else {
      runFallbackNextAction(piece, action, {
        onOpen,
        onEdit,
        onChase,
        onAssignIssue,
      });
    }
  }

  const verb = (
    <PieceRowNextAction
      action={nextAction}
      piece={piece}
      titleId={titleId}
      onRun={runNextAction}
    />
  );
  const more = (
    <div className={styles.moreCell}>
      <PieceRowMenu
        pieceTitle={piece.title}
        hasAnyIssue={hasAnyIssue}
        assignLabelKey={issueItemLabelKey(piece, track)}
        onEdit={() => onEdit(piece)}
        onChase={() => onChase(piece)}
        onHandoff={() => onHandoff(piece)}
        onAssignIssue={() => onAssignIssue(piece)}
        onDelete={() => onDelete(piece)}
      />
    </div>
  );

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- a mouse convenience only: the title button is the row's keyboard and screen reader control and opens the same piece.
    <div
      ref={rowRef}
      className={styles.row}
      data-focus={focused}
      data-open={isOpen}
      data-selected={selected}
      data-your-turn={isYourTurn}
      onClick={handleRowClick}
    >
      <PieceCheckbox
        className={styles.select}
        checked={selected}
        label={t("magazine:desk.pieceRow.selectAria", { title: piece.title })}
        onChange={() => onToggleSelect(piece)}
      />
      <PieceRowTitle
        piece={piece}
        titleId={titleId}
        isOpen={isOpen}
        onOpen={onOpen}
        today={today}
        viewers={viewers}
      />
      {/* A phone card shows these on the title's line, so they come first
          in the DOM there; the table keeps them after the facts. */}
      {isStacked && verb}
      {isStacked && more}
      {/* One grid cell per fact in the table; the stage line and due date
          under the title once the table is narrow enough to stack. */}
      <div className={styles.facts}>
        <PieceRowStage piece={piece} today={today} />
        <PieceRowWait piece={piece} me={me} editors={editors} />
        <PieceRowDue
          piece={piece}
          today={today}
          titleId={titleId}
          onSetDue={() => (onSetDue ?? onEdit)(piece)}
        />
        {!isStacked && verb}
      </div>
      {!isStacked && more}
    </div>
  );
}
