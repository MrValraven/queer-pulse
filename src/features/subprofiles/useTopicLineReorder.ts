import { useCallback, type KeyboardEvent } from "react";
import { topicGripFocusKeys } from "./topicGrip";
import type { TherapistTopicsEditor } from "./useTherapistTopics";
import { useRowDragReorder } from "./useRowDragReorder";

type LineKeyDownHandler = (
  lineIndex: number,
) => (event: KeyboardEvent<HTMLTextAreaElement>) => void;

/**
 * Reordering for one topic's lines: a drag by a line's grip, its grip's
 * move menu (focus stays on the grip), or Alt with ArrowUp or ArrowDown
 * from its field (which declares the shortcut). Every other key goes on to
 * `onLineKeyDown`. The drag hook's container is this
 * topic's own list of lines, so its swap math sees only these lines; a line
 * grip arms only this drag and a topic grip only the topic list's, so
 * neither drag can start the other.
 */
export function useTopicLineReorder(
  editor: TherapistTopicsEditor,
  topicIndex: number,
  onLineKeyDown: LineKeyDownHandler,
) {
  // A block is keyed by its topic's uid, so the uid is stable while the
  // index changes as topics move.
  const uid = editor.topics[topicIndex]?.uid ?? "";
  const { moveLine } = editor;
  const drag = useRowDragReorder((from, to) => moveLine(uid, from, to));
  const { containerRef } = drag;

  // The lines stay a `<ul>`. The drag hook reads only the container's
  // children and their rects, which a list element has like any other.
  const listRef = useCallback(
    (element: HTMLUListElement | null) => {
      containerRef.current =
        element as HTMLElement | null as HTMLDivElement | null;
    },
    [containerRef],
  );

  const onReorderableLineKeyDown: LineKeyDownHandler =
    (lineIndex) => (event) => {
      const isMoveKey = event.key === "ArrowUp" || event.key === "ArrowDown";
      const isAltOnly =
        event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
      if (!isMoveKey || !isAltOnly || event.nativeEvent.isComposing) {
        onLineKeyDown(lineIndex)(event);
        return;
      }
      event.preventDefault();
      moveLine(uid, lineIndex, lineIndex + (event.key === "ArrowUp" ? -1 : 1));
    };

  /** The grip menu's move for one line: any slot, focus riding along on
   *  the grip. */
  const moveLineTo = (lineIndex: number) => (toIndex: number) => {
    const keys = editor.lineKeysFor(uid);
    const lineKey = keys[lineIndex];
    if (lineIndex === toIndex || !lineKey || !keys[toIndex]) return;
    editor.focus.requestFocus([topicGripFocusKeys.line(lineKey.id)]);
    moveLine(uid, lineIndex, toIndex);
  };

  return {
    listRef,
    moveLineTo,
    draggingIndex: drag.draggingIndex,
    gripHandlers: drag.gripHandlers,
    onLineKeyDown: onReorderableLineKeyDown,
  };
}
