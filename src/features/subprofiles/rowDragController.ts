import { createEdgeAutoScroller } from "./rowDragAutoScroll";
import {
  announceRowDragStart,
  createClickSuppressor,
  createGestureGuard,
} from "./rowDragGestureGuards";
import {
  clampHeldRowTop,
  clearRowOffset,
  layoutTopOf,
  nextRowNeighbourIndex,
  setRowOffset,
  settleRowOffset,
} from "./rowDragGeometry";
import { holdTranslateStill } from "./rowDragHeldStyle";
import {
  openRowDragSession,
  type GripPress,
  type RowDragSession,
} from "./rowDragSession";

export type { GripPress };

interface RowDragControllerOptions {
  readContainer: () => HTMLElement | null;
  reorder: (from: number, to: number) => void;
  setDraggingIndex: (index: number | null) => void;
}

/** The imperative half of `useRowDragReorder`: one press or drag at a time. */
export function createRowDragController({
  readContainer,
  reorder,
  setDraggingIndex,
}: RowDragControllerOptions) {
  let session: RowDragSession | null = null;
  const clickSuppressor = createClickSuppressor();
  const gestureGuard = createGestureGuard();
  const autoScroller = createEdgeAutoScroller(
    () => session?.pointerY ?? 0,
    refresh,
  );

  /** Follow the pointer, then take at most one neighbour step. */
  function refresh() {
    const container = readContainer();
    if (!session?.isDragging || !container) return;
    const { element, grabOffset, pointerY } = session;
    const rows = Array.from(container.children) as HTMLElement[];
    const heldTop = clampHeldRowTop(rows, element, pointerY - grabOffset);
    setRowOffset(element, heldTop - layoutTopOf(element));
    if (session.isAwaitingCommit) return;
    const heldCentre = heldTop + element.offsetHeight / 2;
    const from = session.index;
    const to = nextRowNeighbourIndex(rows, from, heldCentre);
    if (to === null) return;
    session.isAwaitingCommit = true;
    session.index = to;
    reorder(from, to);
    setDraggingIndex(to);
  }

  function startDrag(current: RowDragSession, container: HTMLElement) {
    current.isDragging = true;
    clearRowOffset(current.element);
    current.releaseHeldStyle = holdTranslateStill(current.element);
    try {
      current.grip.setPointerCapture(current.pointerId);
    } catch {
      // The window listeners own the lifecycle either way.
    }
    window.addEventListener("scroll", refresh, {
      capture: true,
      passive: true,
    });
    autoScroller.start(container);
    setDraggingIndex(current.index);
    announceRowDragStart(current.grip, current.index);
  }

  /** Drop a row's offset at once, then give it back its own transitions. */
  function releaseRow(element: HTMLElement, releaseHeldStyle: () => void) {
    clearRowOffset(element);
    releaseHeldStyle();
  }

  /** End the press or drag. A drag glides home (or snaps, on `isInstant`). */
  function finish({ isInstant = false, shouldSuppressClick = false } = {}) {
    const ended = session;
    session = null;
    if (!ended) return;
    gestureGuard.disarm();
    if (!ended.isDragging) return;
    autoScroller.stop();
    window.removeEventListener("scroll", refresh, true);
    if (isInstant) clearRowOffset(ended.element);
    else settleRowOffset(ended.element);
    ended.releaseHeldStyle();
    if (shouldSuppressClick) clickSuppressor.suppressNextClick();
    setDraggingIndex(null);
  }

  function press(index: number, event: GripPress) {
    // Primary button, touch contact or pen tip only, one gesture at a time.
    if (event.button !== 0 || session) return;
    const element = readContainer()?.children[index];
    if (!(element instanceof HTMLElement)) return;
    // Mouse only: keeps a focused field focused and stops text selection, and
    // the click still fires. Touch and pen keep their native tap and focus.
    if (event.pointerType === "mouse") event.preventDefault();
    gestureGuard.arm();
    session = openRowDragSession(index, event, element);
  }

  function handlePointerMove(event: PointerEvent) {
    const container = readContainer();
    if (!session || event.pointerId !== session.pointerId) return;
    // Button released but the up never reached us: end now, so the row can
    // never keep following the cursor.
    if (event.buttons === 0 || !container) return finish();
    session.pointerY = event.clientY;
    if (!session.isDragging) {
      const travel = Math.hypot(
        event.clientX - session.startX,
        event.clientY - session.startY,
      );
      if (travel <= session.dragThresholdPx) return;
      startDrag(session, container);
    }
    if (event.cancelable) event.preventDefault();
    refresh();
  }

  function handlePointerUp(event: PointerEvent) {
    if (event.pointerId !== session?.pointerId) return;
    finish({ shouldSuppressClick: true });
  }

  function handlePointerCancel(event: PointerEvent) {
    if (event.pointerId !== session?.pointerId) return;
    finish({ isInstant: true });
  }

  /** After the re-render a swap caused: re-find the held row (a list keyed
   *  by position hands its content to another node) and re-place it. The
   *  hold on its transitions is re-taken, since the render may have changed
   *  them (the dragging class lands on the first one). */
  function syncAfterCommit(draggingIndex: number) {
    if (!session?.isDragging) return;
    const element = readContainer()?.children[draggingIndex];
    if (!(element instanceof HTMLElement)) return finish({ isInstant: true });
    if (element === session.element) session.releaseHeldStyle();
    else releaseRow(session.element, session.releaseHeldStyle);
    session.element = element;
    session.releaseHeldStyle = holdTranslateStill(element);
    session.isAwaitingCommit = false;
    refresh();
  }

  function dispose() {
    const ended = session;
    session = null;
    autoScroller.stop();
    clickSuppressor.stop();
    window.removeEventListener("scroll", refresh, true);
    gestureGuard.disarm();
    if (ended) releaseRow(ended.element, ended.releaseHeldStyle);
  }

  return {
    press,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    syncAfterCommit,
    dispose,
  };
}

export type RowDragController = ReturnType<typeof createRowDragController>;
