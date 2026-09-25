import { layoutTopOf } from "./rowDragGeometry";
import { dragThresholdFor } from "./rowDragGestureGuards";

/** The parts of a grip's pointerdown the controller reads. */
export interface GripPress {
  button: number;
  pointerId: number;
  pointerType: string;
  clientX: number;
  clientY: number;
  currentTarget: Element;
  preventDefault: () => void;
}

export interface RowDragSession {
  pointerId: number;
  index: number;
  grip: Element;
  startX: number;
  startY: number;
  /** Travel that turns this press into a drag, by pointer type. */
  dragThresholdPx: number;
  pointerY: number;
  /** Pointer Y minus the held row's laid-out top at the press. */
  grabOffset: number;
  element: HTMLElement;
  /** Restores the held row's own transitions; set while dragging. */
  releaseHeldStyle: () => void;
  isDragging: boolean;
  /** A swap was sent and the re-render that moves the rows has not landed. */
  isAwaitingCommit: boolean;
}

/** A fresh press on the row at `index`, not yet a drag. */
export function openRowDragSession(
  index: number,
  event: GripPress,
  element: HTMLElement,
): RowDragSession {
  return {
    pointerId: event.pointerId,
    index,
    grip: event.currentTarget,
    startX: event.clientX,
    startY: event.clientY,
    dragThresholdPx: dragThresholdFor(event.pointerType),
    pointerY: event.clientY,
    grabOffset: event.clientY - layoutTopOf(element),
    element,
    releaseHeldStyle: () => undefined,
    isDragging: false,
    isAwaitingCommit: false,
  };
}
