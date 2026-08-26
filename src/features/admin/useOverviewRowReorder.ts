import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRowDragReorder } from "../subprofiles/useRowDragReorder";
import { reorder } from "./overviewEditorRow.utils";

/** Everything one `OverviewEditorRow` needs to be reorderable, both ways. */
export interface OverviewRowReorderProps {
  /** Human name of the item in this row, spoken by the move buttons. */
  label: string;
  gripHandlers: { onPointerDown: (event: ReactPointerEvent) => void };
  isDragging: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

/**
 * Reordering for one governance overview section editor, in both modes:
 *
 * - the pointer path — `useRowDragReorder`'s grip drag (unchanged), and
 * - the keyboard / assistive-tech path — the row's move up / move down buttons.
 *
 * Both write through the same `reorder()` into the same draft, so the two paths
 * can never disagree. A drag is self-evidently visual, but a button press is
 * not, so an arrow move also writes the row's new position into `announcement`
 * — render it in a polite live region next to the list.
 *
 * Shared by all five section editors (health, principles, decisions,
 * moderation, council) so the behaviour exists once rather than five times.
 */
export function useOverviewRowReorder<Row>(
  rows: Row[],
  setRows: Dispatch<SetStateAction<Row[]>>,
) {
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState("");
  const announceFrameRef = useRef(0);
  const rowCount = rows.length;

  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(
    (from, to) => setRows((previous) => reorder(previous, from, to)),
  );

  useEffect(
    () => () => window.cancelAnimationFrame(announceFrameRef.current),
    [],
  );

  const moveRow = (from: number, to: number, label: string): void => {
    if (to < 0 || to >= rowCount) return;
    setRows((previous) => reorder(previous, from, to));

    const text = t("admin:governance.overview.edit.rowMoved", {
      label,
      position: to + 1,
      total: rowCount,
    });
    // Clear first so the region's text is guaranteed to CHANGE. Moving a row up
    // and straight back down produces the identical sentence, and a live region
    // handed identical text is not re-read by any screen reader. The clear and
    // the write land in separate commits, so the text node really does change.
    window.cancelAnimationFrame(announceFrameRef.current);
    setAnnouncement("");
    announceFrameRef.current = window.requestAnimationFrame(() =>
      setAnnouncement(text),
    );
  };

  /** Spread onto each `OverviewEditorRow` — one call per row, per index. */
  const rowProps = (index: number, label: string): OverviewRowReorderProps => ({
    label,
    gripHandlers: gripHandlers(index),
    isDragging: draggingIndex === index,
    isFirst: index === 0,
    isLast: index === rowCount - 1,
    onMoveUp: () => moveRow(index, index - 1, label),
    onMoveDown: () => moveRow(index, index + 1, label),
  });

  return { containerRef, rowProps, announcement };
}
