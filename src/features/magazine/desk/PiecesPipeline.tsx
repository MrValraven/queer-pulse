import { useId, useMemo, useRef } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { EmptyState } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PieceGroupHeader } from "./PieceGroupHeader";
import { PieceRow } from "./PieceRow";
import { PiecesPipelineColumns } from "./PiecesPipelineColumns";
import {
  groupDeskPieces,
  type DeskGroupBy,
  type DeskPieceGroup,
} from "./pipelineGroups";
import type { DeskDensity } from "./deskDensity";
import type { PieceNextAction } from "./pieceNextAction";
import { useCollapsedGroups, type CollapsedGroups } from "./useCollapsedGroups";
import { useIsTableStacked } from "./useIsTableStacked";
import { useMagazineEditors } from "../api/useMagazineEditors";
import type { Viewer } from "../api/useDeskPresence";
import type { Editor, Piece } from "../data/desk.data";
import type { DeskTrack } from "./deskTrack";
import styles from "./PiecesPipeline.module.css";

export interface PiecesPipelineProps {
  pieces: Piece[];
  /** Id of the keyboard-navigated "current" row, or null when none. */
  focusId: string | null;
  /** Active track: drives each row's issue item label. */
  track: DeskTrack;
  /** Whether any issue exists to file work onto. */
  hasAnyIssue: boolean;
  selectedPieceIds: string[];
  areAllSelected: boolean;
  onToggleSelect: (piece: Piece) => void;
  onToggleSelectAll: () => void;
  onOpen: (piece: Piece) => void;
  onEdit: (piece: Piece) => void;
  onChase: (piece: Piece) => void;
  onHandoff: (piece: Piece) => void;
  onAssignIssue: (piece: Piece) => void;
  onDelete: (piece: Piece) => void;
  /** The viewing editor's id, for "Your turn" and each row's "Waiting on". */
  me?: string;
  /** Names a colleague a row waits on; omitted, the cached directory. */
  editors?: readonly Editor[];
  /** How rows are grouped. "none" (the default) draws one flat list. */
  groupBy?: DeskGroupBy;
  density?: DeskDensity;
  /** Runs a row's next action; rows fall back to the handlers above. */
  onNextAction?: (piece: Piece, action: PieceNextAction) => void;
  /** "Set date" on an undated piece; rows fall back to `onEdit`. */
  onSetDue?: (piece: Piece) => void;
  /** The row highlighted while its peek panel is open. */
  openPieceId?: string | null;
  /** A focus chip, filter or search is narrowing the list, so the table
   *  cannot tell that nothing waits on the editor; the all-clear note hides. */
  isFiltered?: boolean;
  /** Fold state owned by the page, so its keyboard walks the same visible
   *  rows (`flattenDeskGroups`). Without it the table keeps its own. */
  collapsedGroups?: CollapsedGroups;
  /** Who else has each piece open right now, keyed by piece id, for a
   *  row's presence stack. A piece with no entry shows nothing. */
  viewersByPiece?: Record<string, Viewer[]>;
}

function hasGroupHeader(group: DeskPieceGroup): boolean {
  return group.labelKey !== null || Boolean(group.label);
}

/**
 * The desk's pipeline table, and the page's main surface: every in-flight
 * piece in groups that answer "who is it waiting on?" (or stage, or
 * section), each under a sticky header that folds. One surface with hairline
 * rows, so the groups read as one table with breaks.
 */
export function PiecesPipeline({
  pieces,
  focusId,
  track,
  hasAnyIssue,
  selectedPieceIds,
  areAllSelected,
  onToggleSelect,
  onToggleSelectAll,
  me = "",
  groupBy = "none",
  density = "comfortable",
  openPieceId = null,
  isFiltered = false,
  collapsedGroups,
  viewersByPiece,
  editors,
  ...rowHandlers
}: PiecesPipelineProps) {
  const { t } = useTranslation();
  const { editors: directoryEditors } = useMagazineEditors();
  const rowEditors = editors ?? directoryEditors;
  const baseId = useId();
  const tableRef = useRef<HTMLDivElement>(null);
  const isStacked = useIsTableStacked(tableRef);
  const groups = useMemo(
    () => groupDeskPieces(pieces, me, groupBy),
    [pieces, me, groupBy],
  );
  const ownCollapsedGroups = useCollapsedGroups(groups, focusId);
  const { isCollapsed, toggleCollapsed } =
    collapsedGroups ?? ownCollapsedGroups;

  if (pieces.length === 0) {
    return (
      <div ref={tableRef} className={styles.pieces}>
        <EmptyState
          title={t("magazine:desk.pipeline.emptyTitle")}
          description={t("magazine:desk.pipeline.emptyDescription")}
          compact
        />
      </div>
    );
  }

  const selectedIdSet = new Set(selectedPieceIds);
  const today = new Date();
  const isAllClear =
    !isFiltered &&
    groupBy === "waiting" &&
    !groups.some((group) => group.id === "your-turn" || group.id === "late");

  return (
    <div
      ref={tableRef}
      className={styles.pieces}
      data-density={density}
      // The phone card leaves "Waiting on" to the group headers when they
      // already say it (`PieceRow.module.css`).
      data-group-by={groupBy}
    >
      {/* One grid for the whole table: the header and every row are subgrids
          of it, so each fact column is as wide as its widest cell. */}
      <div className={styles.table}>
        <PiecesPipelineColumns
          areAllSelected={areAllSelected}
          isIndeterminate={!areAllSelected && selectedPieceIds.length > 0}
          onToggleSelectAll={onToggleSelectAll}
        />
        {isAllClear && (
          <p className={styles.allClear}>
            <FiCheckCircle aria-hidden />
            {t("magazine:desk.pipeline.allClear")}
          </p>
        )}
        {groups.map((group, groupIndex) => {
          const bodyId = `${baseId}-group-${groupIndex}`;
          const hasHeader = hasGroupHeader(group);
          const isGroupCollapsed = hasHeader && isCollapsed(group);
          return (
            <div key={group.id} className={styles.group}>
              {hasHeader && (
                <PieceGroupHeader
                  group={group}
                  isCollapsed={isGroupCollapsed}
                  bodyId={bodyId}
                  onToggle={toggleCollapsed}
                />
              )}
              {/* Kept in the DOM when folded so `aria-controls` always resolves. */}
              <div id={bodyId} className={styles.groupBody}>
                {!isGroupCollapsed &&
                  group.pieces.map((piece) => (
                    <PieceRow
                      key={piece.id}
                      piece={piece}
                      focused={focusId === piece.id}
                      isOpen={openPieceId === piece.id}
                      track={track}
                      hasAnyIssue={hasAnyIssue}
                      selected={selectedIdSet.has(piece.id)}
                      today={today}
                      onToggleSelect={onToggleSelect}
                      viewers={viewersByPiece?.[piece.id]}
                      me={me}
                      editors={rowEditors}
                      isStacked={isStacked}
                      {...rowHandlers}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
