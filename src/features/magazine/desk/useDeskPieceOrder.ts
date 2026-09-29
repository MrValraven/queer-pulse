/**
 * The orders the desk walks its pieces in. The table groups the rows itself;
 * the page groups the same rows the same way, so j/k and the peek walk
 * exactly what the active layout draws: the grouped table's rows (folds
 * left out), the calendar's lanes and days, or the board and plan in the
 * table's sort.
 */

import { useMemo } from "react";
import type { Piece } from "../data/desk.data";
import type { DeskLayoutOption } from "./DeskWorkbar";
import { useCollapsedGroups } from "./useCollapsedGroups";
import {
  flattenDeskGroups,
  groupDeskPieces,
  type DeskGroupBy,
} from "./pipelineGroups";

export interface UseDeskPieceOrderParams {
  layout: DeskLayoutOption;
  /** The filtered pieces in the table's sort. */
  visiblePieces: Piece[];
  /** The same pieces as the calendar draws them (`useDeskCalendarProps`). */
  calendarOrderPieces: Piece[];
  me: string;
  groupBy: DeskGroupBy;
  /** The keyboard's current piece: its group opens if it was folded. */
  focusId: string | null;
  selectedPieceIds: string[];
}

export function useDeskPieceOrder({
  layout,
  visiblePieces,
  calendarOrderPieces,
  me,
  groupBy,
  focusId,
  selectedPieceIds,
}: UseDeskPieceOrderParams) {
  const groups = useMemo(
    () => groupDeskPieces(visiblePieces, me, groupBy),
    [visiblePieces, me, groupBy],
  );
  const collapsedGroups = useCollapsedGroups(groups, focusId);
  const { collapsedGroupIds } = collapsedGroups;
  const isPipeline = layout === "list";
  const keyboardPieces = useMemo(() => {
    if (isPipeline) return flattenDeskGroups(groups, collapsedGroupIds);
    return layout === "calendar" ? calendarOrderPieces : visiblePieces;
  }, [
    isPipeline,
    groups,
    collapsedGroupIds,
    layout,
    calendarOrderPieces,
    visiblePieces,
  ]);
  // The selection in table order (folded rows included), for the bulk bar's
  // chase queue and stage moves.
  const selectedPieces = (
    isPipeline ? groups.flatMap((group) => group.pieces) : visiblePieces
  ).filter((piece) => selectedPieceIds.includes(piece.id));

  return { groups, collapsedGroups, keyboardPieces, selectedPieces };
}
