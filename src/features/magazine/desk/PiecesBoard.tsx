import type { CSSProperties } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IconButton } from "../../../shared/components/ui";
import { PiecesBoardCard } from "./PiecesBoardCard";
import { canDropOnStage, useBoardDrag } from "./useBoardDrag";
import { useBoardEdgeScroll } from "./useBoardEdgeScroll";
import { stageColorVar } from "./deskTones";
import { viewStageLabelKey } from "./stageLabels";
import type { PieceNextAction } from "./pieceNextAction";
import type { DeskTrack } from "./deskTrack";
import { cx } from "../../../shared/lib/cx";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece, Stage } from "../data/desk.data";
import styles from "./PiecesBoard.module.css";

export interface PiecesBoardProps {
  pieces: Piece[];
  stages: Stage[];
  onOpen: (piece: Piece) => void;
  onMove: (piece: Piece, stage: Stage) => void;
  /** The viewer's editor id; cards waiting on them get the "your turn" edge. */
  me?: string;
  /** The scope the board is showing; feeds each card's next action. */
  track?: DeskTrack;
  /** Runs a card's next-action button; without it the button opens the piece. */
  onNextAction?: (piece: Piece, action: PieceNextAction) => void;
  /** Work-in-progress limit per column. A column holding more shows "Over
   *  {cap}" in the late tone. Left out, no column is ever flagged. */
  teamCap?: number;
}

/**
 * The desk's "board" layout: one column per pipeline stage, holding the
 * pieces currently at that stage. Cards drag between columns to move a piece
 * (native drag and drop, `useBoardDrag`), and each card keeps a stage picker
 * as the keyboard and screen-reader path for the same move. The columns
 * scroll sideways inside the board, snapping one column at a time on phones,
 * so the page itself never scrolls horizontally.
 *
 * With six or more stages the board rarely shows them all at once even on a
 * wide screen (worse once the rail sits beside it from 1224px up), and
 * nothing said so. An edge fade brightens on whichever side still
 * has a column past the visible ones (`useBoardEdgeScroll`), and the two
 * scroll buttons mount together as soon as either side does, so reaching one
 * end while using the keyboard turns that button `aria-disabled` rather than
 * unmounting it out from under the focus that was on it.
 *
 * The two buttons are flex siblings of the scroller (`.boardWrap`), each in
 * its own gutter beside the cards: the first version placed them absolutely
 * over the board itself, where the disabled one sat on the first card's own
 * corner and still swallowed a click meant for it.
 */
export function PiecesBoard({
  pieces,
  stages,
  onOpen,
  onMove,
  me,
  track = "issue",
  onNextAction,
  teamCap,
}: PiecesBoardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { draggedPiece, dropTargetStage, cardDragProps, columnDropProps } =
    useBoardDrag(pieces, onMove);
  const { scrollerRef, hasMoreStart, hasMoreEnd, scrollToward } =
    useBoardEdgeScroll();
  // Both buttons always mount and unmount as a pair:
  // if each vanished exactly when its own direction ran out, a keyboard user
  // pressing "Next stages" at the last column would have the focused button
  // unmount under them and focus would drop to the page body. Reaching an
  // end instead leaves both in the DOM and turns the one at that end
  // `aria-disabled`, dimmed but still there to land on.
  const showEdgeControls = hasMoreStart || hasMoreEnd;
  const today = new Date();

  return (
    <div className={styles.boardWrap}>
      {/* Visually hidden: names the layout for screen readers, so the
          column headings below (`h3`) step down one level from it rather
          than skipping straight from the page's own `h1`. */}
      <h2 className="visuallyHidden">
        {t("magazine:desk.header.layout.board")}
      </h2>
      {showEdgeControls && (
        <IconButton
          size="sm"
          className={styles.edgeButton}
          aria-label={t("magazine:desk.board.scrollPrevious")}
          aria-disabled={!hasMoreStart}
          onClick={hasMoreStart ? () => scrollToward("start") : undefined}
        >
          <FiChevronLeft aria-hidden />
        </IconButton>
      )}
      <div className={styles.boardInner}>
        <div
          className={cx(styles.edgeFade, styles.edgeFadeStart)}
          data-visible={hasMoreStart}
          aria-hidden
        />
        <div
          className={cx(styles.edgeFade, styles.edgeFadeEnd)}
          data-visible={hasMoreEnd}
          aria-hidden
        />
        <div ref={scrollerRef} className={styles.board}>
          {stages.map((stage) => {
            const columnPieces = pieces.filter(
              (piece) => piece.stage === stage,
            );
            // Published is where work ends, so it has no work-in-progress
            // limit.
            const isOverCap =
              teamCap !== undefined &&
              stage !== "Published" &&
              columnPieces.length > teamCap;
            const isDroppable =
              draggedPiece !== null && canDropOnStage(draggedPiece, stage);
            return (
              <div
                key={stage}
                className={cx(
                  styles.column,
                  isDroppable && styles.columnDroppable,
                  isDroppable &&
                    dropTargetStage === stage &&
                    styles.columnTarget,
                )}
                style={
                  { "--stage-tone": stageColorVar(stage) } as CSSProperties
                }
                {...columnDropProps(stage)}
              >
                <h3 className={styles.colHead}>
                  {/* A `Stage` IS its own English label, so the column heading and
                  the per-card picker both resolve it through the shared
                  stage-key lookup. */}
                  <span className={styles.colLabel}>
                    {t(viewStageLabelKey(stage))}
                  </span>
                  {isOverCap && (
                    <span className={styles.overCap}>
                      {t("magazine:desk.board.overCap", {
                        cap: format.number(teamCap),
                      })}
                    </span>
                  )}
                  <span
                    className={cx(
                      styles.colCount,
                      columnPieces.length === 0 && styles.colCountZero,
                    )}
                  >
                    {format.number(columnPieces.length)}
                  </span>
                </h3>
                {columnPieces.map((piece) => (
                  <PiecesBoardCard
                    key={piece.id}
                    piece={piece}
                    stages={stages}
                    track={track}
                    me={me}
                    today={today}
                    isDragging={draggedPiece?.id === piece.id}
                    dragProps={cardDragProps(piece)}
                    onOpen={onOpen}
                    onMove={onMove}
                    onNextAction={onNextAction}
                  />
                ))}
                {columnPieces.length === 0 && (
                  <span className={styles.emptyCol}>
                    {t("magazine:desk.board.columnEmpty")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {showEdgeControls && (
        <IconButton
          size="sm"
          className={styles.edgeButton}
          aria-label={t("magazine:desk.board.scrollNext")}
          aria-disabled={!hasMoreEnd}
          onClick={hasMoreEnd ? () => scrollToward("end") : undefined}
        >
          <FiChevronRight aria-hidden />
        </IconButton>
      )}
    </div>
  );
}
