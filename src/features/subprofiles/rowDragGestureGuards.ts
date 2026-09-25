/** Travel a press must exceed before it becomes a drag. Anything shorter is a
 *  tap, and the grip's own click goes through untouched. A fingertip or pen
 *  tip drifts a few pixels on an honest tap, so those get more room. */
const MOUSE_DRAG_THRESHOLD_PX = 4;
const TOUCH_DRAG_THRESHOLD_PX = 10;

export function dragThresholdFor(pointerType: string): number {
  return pointerType === "touch" || pointerType === "pen"
    ? TOUCH_DRAG_THRESHOLD_PX
    : MOUSE_DRAG_THRESHOLD_PX;
}

/** Fired on the grip, bubbling, the moment a press becomes a drag, so a grip
 *  can close a move menu the press may have opened. */
export const ROW_DRAG_START_EVENT = "rowdragstart";

export interface RowDragStartDetail {
  /** The held row's index when the drag began. */
  index: number;
}

export function announceRowDragStart(grip: Element, index: number): void {
  grip.dispatchEvent(
    new CustomEvent<RowDragStartDetail>(ROW_DRAG_START_EVENT, {
      bubbles: true,
      detail: { index },
    }),
  );
}

/** Longest wait for the click that follows a drag's release. A touch tap
 *  gesture can arrive a little after its pointerup, so a bare next-tick
 *  window is too short; the next press clears it sooner. */
const CLICK_SUPPRESSION_WINDOW_MS = 400;

/**
 * Swallows the single click that follows a drag's release, so a grip that is
 * also a button never takes the drop as a press. Capture on `window` sees the
 * click before any handler, wherever it lands.
 */
export function createClickSuppressor() {
  let timerId = 0;

  function stop() {
    window.clearTimeout(timerId);
    window.removeEventListener("click", swallowClick, true);
    window.removeEventListener("pointerdown", stop, true);
  }

  function swallowClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    stop();
  }

  function suppressNextClick() {
    stop();
    window.addEventListener("click", swallowClick, true);
    window.addEventListener("pointerdown", stop, true);
    timerId = window.setTimeout(stop, CLICK_SUPPRESSION_WINDOW_MS);
  }

  return { suppressNextClick, stop };
}

const GUARDED_EVENTS = ["selectstart", "contextmenu"] as const;

/**
 * While a press or drag is live, stops a long press from selecting text or
 * opening a context menu. Each guard owns its listener, so a sibling list's
 * cleanup never removes this one.
 */
export function createGestureGuard() {
  const preventDefault = (event: Event) => event.preventDefault();
  return {
    arm() {
      for (const type of GUARDED_EVENTS) {
        window.addEventListener(type, preventDefault, true);
      }
    },
    disarm() {
      for (const type of GUARDED_EVENTS) {
        window.removeEventListener(type, preventDefault, true);
      }
    },
  };
}
