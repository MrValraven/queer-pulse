import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { AnimatePresence } from "motion/react";
import { useRowDragReorder } from "../../../subprofiles/useRowDragReorder";
import type { StudioQueueItem } from "../studioPlayerContext";
import { queueOrderKey, resolveQueueMove } from "./studioQueueMoves";
import { StudioQueueRow, type QueueRowControl } from "./StudioQueueRow";
import styles from "./StudioQueue.module.css";

export type QueueFocusTarget =
  { entryId: string; control: QueueRowControl } | "heading";

/** Made at click time: where focus goes, the order the click saw and the
 *  element that held focus then. */
export interface QueueFocusRequest {
  target: QueueFocusTarget;
  orderKey: string;
  fromElement: Element | null;
}

/**
 * Keeps focus on the pressed button while its row moves, and sends it to a
 * neighbour's Remove or the heading once a row goes. The rule, per commit:
 * - The order changed since the click: the action landed. Focus goes to the
 *   target while it is still ours (on the pressed button, on the target, or
 *   on the page body, where a moved or leaving row drops it), and the
 *   request ends.
 * - The order is the same: focus stays where it is. The request waits while
 *   focus is on the pressed button or the target (a Move button is both, so
 *   a move the player commits a render later still gets focus back), and
 *   ends once focus is elsewhere or the queue updates without the order
 *   changing (the player declined the action).
 */
function useQueueFocus(
  entries: readonly StudioQueueItem[],
  focusRequest: QueueFocusRequest | null,
  onFocusHandled: () => void,
) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const controlsRef = useRef(new Map<string, HTMLButtonElement>());
  const pendingRef = useRef<QueueFocusRequest | null>(null);
  const seenEntriesRef = useRef(entries);
  useLayoutEffect(() => {
    const hasQueueUpdated = seenEntriesRef.current !== entries;
    seenEntriesRef.current = entries;
    if (focusRequest) {
      pendingRef.current = focusRequest;
      onFocusHandled();
    }
    const request = pendingRef.current;
    if (!request) return;
    const target =
      request.target === "heading"
        ? headingRef.current
        : controlsRef.current.get(
            `${request.target.entryId}:${request.target.control}`,
          );
    const activeElement = document.activeElement;
    if (request.orderKey !== queueOrderKey(entries)) {
      const isFocusOnBody =
        activeElement === null || activeElement === document.body;
      const isFocusStillOurs =
        activeElement === request.fromElement ||
        activeElement === target ||
        isFocusOnBody;
      if (isFocusStillOurs && target && activeElement !== target)
        target.focus();
      pendingRef.current = null;
      return;
    }
    const isFocusStillOurs =
      activeElement === request.fromElement || activeElement === target;
    if (!isFocusStillOurs || (hasQueueUpdated && !focusRequest))
      pendingRef.current = null;
  });
  return {
    headingRef,
    registerControl: (
      entryId: string,
      control: QueueRowControl,
      element: HTMLButtonElement | null,
    ) => {
      const key = `${entryId}:${control}`;
      if (element) controlsRef.current.set(key, element);
      else controlsRef.current.delete(key);
    },
  };
}

/**
 * The house drag, checked against the latest entries. The entry is picked
 * up at press time, so a fast drag whose first swap lands before any effect
 * still names the right row; a swap whose source entry moved is dropped.
 * Only the first primary press of a gesture picks (the engine takes one
 * gesture at a time and turns away a second finger or another button), and
 * the pick is forgotten when that pointer lifts or the drag ends.
 */
function useQueueDrag(
  entries: readonly StudioQueueItem[],
  onDragMove: (
    fromIndex: number,
    toIndex: number,
    entry: StudioQueueItem,
  ) => void,
  onDragChange: (isDragging: boolean) => void,
) {
  const entriesRef = useRef(entries);
  useLayoutEffect(() => {
    entriesRef.current = entries;
  });
  const draggedIdRef = useRef<string | null>(null);
  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(
    (fromIndex, toIndex) => {
      const latest = entriesRef.current;
      const move = resolveQueueMove(
        latest.map((entry) => entry.queueEntryId),
        draggedIdRef.current,
        fromIndex,
        toIndex,
      );
      const entry = latest[fromIndex];
      if (move && entry) onDragMove(move.fromIndex, move.toIndex, entry);
    },
  );
  useEffect(() => {
    if (draggingIndex === null) draggedIdRef.current = null;
    onDragChange(draggingIndex !== null);
  }, [draggingIndex, onDragChange]);
  useEffect(() => {
    const forgetPick = (event: PointerEvent) => {
      if (event.isPrimary) draggedIdRef.current = null;
    };
    window.addEventListener("pointerup", forgetPick);
    window.addEventListener("pointercancel", forgetPick);
    return () => {
      window.removeEventListener("pointerup", forgetPick);
      window.removeEventListener("pointercancel", forgetPick);
    };
  }, []);
  return {
    containerRef,
    draggingIndex,
    gripHandlersFor: (index: number, entryId: string) => ({
      onPointerDown: (event: ReactPointerEvent) => {
        const isFirstPrimaryPress =
          draggedIdRef.current === null &&
          event.isPrimary &&
          event.button === 0;
        if (isFirstPrimaryPress) draggedIdRef.current = entryId;
        gripHandlers(index).onPointerDown(event);
      },
    }),
  };
}

/** One reorderable group ("Your queue" or "Next from ..."). */
export function StudioQueueGroup({
  heading,
  headingLevel,
  headingAction,
  entries,
  emptyHint,
  focusRequest,
  onFocusHandled,
  onDragChange,
  onPlay,
  onMove,
  onRemove,
}: {
  heading: string;
  headingLevel: 2 | 3;
  headingAction?: ReactNode;
  entries: readonly StudioQueueItem[];
  emptyHint: ReactNode;
  focusRequest: QueueFocusRequest | null;
  onFocusHandled: () => void;
  onDragChange: (isDragging: boolean) => void;
  onPlay: (entry: StudioQueueItem) => void;
  /** `isFromButton` is true for Move up and Move down; a drag moves no focus. */
  onMove: (
    fromIndex: number,
    toIndex: number,
    entry: StudioQueueItem,
    isFromButton: boolean,
  ) => void;
  onRemove: (index: number) => void;
}) {
  const headingId = useId();
  const { headingRef, registerControl } = useQueueFocus(
    entries,
    focusRequest,
    onFocusHandled,
  );
  const { containerRef, draggingIndex, gripHandlersFor } = useQueueDrag(
    entries,
    (fromIndex, toIndex, entry) => onMove(fromIndex, toIndex, entry, false),
    onDragChange,
  );

  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section className={styles.group} aria-labelledby={headingId}>
      <div className={styles.groupHead}>
        <Heading
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={styles.groupHeading}
        >
          {heading}
        </Heading>
        {headingAction}
      </div>
      {emptyHint}
      <div
        ref={containerRef}
        role="list"
        aria-labelledby={headingId}
        className={styles.rows}
      >
        <AnimatePresence initial={false}>
          {entries.map((entry, index) => (
            <StudioQueueRow
              key={entry.queueEntryId}
              item={entry}
              index={index}
              rowCount={entries.length}
              isDragging={draggingIndex === index}
              gripHandlers={gripHandlersFor(index, entry.queueEntryId)}
              registerControl={(control, element) =>
                registerControl(entry.queueEntryId, control, element)
              }
              onPlay={() => onPlay(entry)}
              onMove={(offset) => onMove(index, index + offset, entry, true)}
              onRemove={() => onRemove(index)}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
