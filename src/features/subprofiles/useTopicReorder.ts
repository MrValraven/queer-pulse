import { useLayoutEffect, useRef, useState } from "react";
import type { SubprofileEditorRow } from "./subprofileSectionEditorRows";
import {
  descriptionToLines,
  linesToDescription,
} from "./therapistTopics.helpers";
import { useFocusAcrossMove } from "./useFocusAcrossMove";
import { useRowDragReorder } from "./useRowDragReorder";

/** One entry moved to another slot (a neighbour swap when they are next to
 *  each other), or null when either index is out of range or they are the
 *  same. */
function moveEntry<Entry>(
  list: readonly Entry[],
  from: number,
  to: number,
): Entry[] | null {
  const isInRange = (index: number) => index >= 0 && index < list.length;
  if (from === to || !isInRange(from) || !isInRange(to)) return null;
  const next = list.filter((_, index) => index !== from);
  next.splice(to, 0, list[from]!);
  return next;
}

/**
 * Reordering for the topic control: a topic moves to a neighbour's slot
 * (Alt+arrow on a heading, a drag by the topic's grip) or to any slot (the
 * grip's move menu), and a topic's lines move the same way inside it. Moves build on the newest rows, advanced synchronously by each
 * write, so a second swap fired by a fast pointermove before the re-render
 * builds on the first (as `useSkinListRows` does). Focus and caret stay in
 * the field that had them.
 *
 * `moveCount` goes up with every move. Rows glide only when it changes (see
 * `useReorderGlide`), so an added or removed line never glides its
 * neighbours.
 *
 * Order is the array order: the topics are the section's rows as saved, and
 * a topic's lines are its description's line order.
 */
export function useTopicReorder({
  rows,
  writeRows,
  moveLineKeys,
  settleTopics,
}: {
  rows: SubprofileEditorRow[];
  writeRows: (next: SubprofileEditorRow[]) => void;
  moveLineKeys: (uid: string, from: number, to: number) => void;
  /** Topics a move re-inserts, so their arrival fade (and their lines')
   *  does not replay. */
  settleTopics: (uids: string[]) => void;
}) {
  const latestRowsRef = useRef(rows);
  const keepFocus = useFocusAcrossMove();
  const [moveCount, setMoveCount] = useState(0);

  const commitRows = (next: SubprofileEditorRow[]) => {
    latestRowsRef.current = next;
    writeRows(next);
  };

  const moveTopicTo = (from: number, to: number) => {
    const current = latestRowsRef.current;
    const next = moveEntry(current, from, to);
    if (!next) return;
    keepFocus.remember();
    // Every topic between the two slots is re-inserted.
    const reinserted = current.slice(
      Math.min(from, to),
      Math.max(from, to) + 1,
    );
    settleTopics(reinserted.map((row) => row._uid));
    setMoveCount((count) => count + 1);
    commitRows(next);
  };

  const moveLine = (topicUid: string, from: number, to: number) => {
    const current = latestRowsRef.current;
    const row = current.find((entry) => entry._uid === topicUid);
    if (!row) return;
    const lines = moveEntry(descriptionToLines(row.description), from, to);
    if (!lines) return;
    keepFocus.remember();
    moveLineKeys(topicUid, from, to);
    setMoveCount((count) => count + 1);
    const description = linesToDescription(lines);
    commitRows(
      current.map((entry) =>
        entry._uid === topicUid ? { ...entry, description } : entry,
      ),
    );
  };

  const drag = useRowDragReorder(moveTopicTo);

  // Refresh before paint, so nothing after this render reads older rows.
  useLayoutEffect(() => {
    latestRowsRef.current = rows;
  });

  return {
    commitRows,
    moveTopicTo,
    moveLine,
    moveCount,
    /** For the element that wraps only the topics. */
    topicListRef: drag.containerRef,
    topicDrag: {
      draggingIndex: drag.draggingIndex,
      gripHandlers: drag.gripHandlers,
    },
  };
}
