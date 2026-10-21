import {
  useEffect,
  useMemo,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

/** How the menu was asked for. A touch or pen menu opens above and beside
 *  the finger so the finger never covers it. */
export type StudioContextMenuSource = "mouse" | "touch" | "keyboard";

export interface StudioContextMenuPoint {
  x: number;
  y: number;
  source?: StudioContextMenuSource;
}

export interface StudioContextMenuHandlers {
  onContextMenu: (event: ReactMouseEvent<HTMLElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
}

/** How long a finger or pen rests before the menu opens, in ms. Close to
 *  the platform long-press on iOS and Android, a touch quicker so ours wins
 *  over the browser's own callout. */
const LONG_PRESS_MS = 450;

/** How far the finger may drift, in px, before the press reads as a scroll. */
const MOVE_TOLERANCE_PX = 8;

/** How long after a long press the click it leaves behind is swallowed, so
 *  lifting the finger never follows the row's link. */
const CLICK_SWALLOW_MS = 700;

/** Android sends its own contextmenu just after a long press; within this
 *  window (ms) it is the same gesture and opens nothing more. */
const FOLLOW_UP_CONTEXTMENU_MS = 1000;

/** A light tick, the same weight as a native context menu's. */
const HAPTIC_MS = 8;

/** How long after a long press lifts (ms) a focus move into the pressed
 *  row still belongs to the lift. The browser's compatibility mousedown
 *  lands on the row and pulls focus out of the menu that just opened. */
const LIFT_FOCUS_MS = 300;

/** The last long press that opened a menu and lifted: which row, and when. */
let lastLongPressLift: { row: HTMLElement; liftedAt: number } | null = null;

/** True when focus moving to `next` is only the finger lifting off the row
 *  a long press just opened a menu from, so the menu stays open. The lift
 *  focuses the row's control, or, on a row that takes no focus itself, its
 *  nearest focusable ancestor (a tab panel, `<main>`). Read by the menu's
 *  focus-leave guard (useStudioMenuKeys). */
export function isLongPressLiftFocus(next: Node): boolean {
  if (!lastLongPressLift) return false;
  const { row, liftedAt } = lastLongPressLift;
  const isRecent = performance.now() - liftedAt < LIFT_FOCUS_MS;
  return isRecent && (row.contains(next) || next.contains(row));
}

interface PressState {
  pointerId: number;
  startX: number;
  startY: number;
  timer: number;
}

/** A field the member types in keeps the browser's own menu (paste, spell
 *  check), and so does a text selection they made, so Copy stays one press
 *  away. */
function shouldKeepNativeMenu(event: ReactMouseEvent<HTMLElement>): boolean {
  const target = event.target;
  if (
    target instanceof HTMLElement &&
    target.closest("input, textarea, select, [contenteditable='true']")
  )
    return true;
  const selection = window.getSelection();
  return Boolean(
    selection &&
    !selection.isCollapsed &&
    event.currentTarget.contains(selection.anchorNode),
  );
}

/** A keyboard context menu (the Menu key, Shift+F10) arrives at 0,0: the
 *  menu then hangs from the element's own lower start corner. */
function pointOfMouseEvent(
  event: ReactMouseEvent<HTMLElement>,
): StudioContextMenuPoint {
  if (event.clientX !== 0 || event.clientY !== 0)
    return { x: event.clientX, y: event.clientY, source: "mouse" };
  const rect = event.currentTarget.getBoundingClientRect();
  const isRtl = getComputedStyle(event.currentTarget).direction === "rtl";
  return {
    x: isRtl ? rect.right - 16 : rect.left + 16,
    y: rect.bottom,
    source: "keyboard",
  };
}

/** Swallows the one click a long press leaves behind, if it lands inside
 *  the row. Returns the disarm, which the next press calls. */
function swallowNextClickInside(row: HTMLElement): () => void {
  const swallow = (event: MouseEvent) => {
    if (!(event.target instanceof Node) || !row.contains(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    disarm();
  };
  const timer = window.setTimeout(() => disarm(), CLICK_SWALLOW_MS);
  function disarm() {
    window.clearTimeout(timer);
    window.removeEventListener("click", swallow, { capture: true });
  }
  window.addEventListener("click", swallow, { capture: true });
  return disarm;
}

/** Right-click and long-press for a row or a card. A right-click opens at
 *  the cursor. A finger or pen held still for 450ms (8px of drift allowed)
 *  opens beside the finger with a light haptic tick; a scroll, a lift or a
 *  drift cancels it, and the click the lift leaves behind never reaches the
 *  row. The browser's own menu stays away, except in text fields and over a
 *  selection the member made. Spread the handlers on the row:
 *
 *  ```tsx
 *  const contextMenu = useStudioContextMenu(setMenuPoint);
 *  <li {...contextMenu}>...</li>
 *  ```
 *
 *  The row itself needs `-webkit-touch-callout: none` and
 *  `user-select: none` (on touch, `@media (hover: none)` is enough):
 *  without them iOS raises its own link callout and the text magnifier
 *  over the long press, and Android selects a word under the finger. */
export function useStudioContextMenu(
  onOpenAt: (point: StudioContextMenuPoint) => void,
): StudioContextMenuHandlers {
  const onOpenAtRef = useRef(onOpenAt);
  const pressRef = useRef<PressState | null>(null);
  /** When the last long press opened the menu, for Android's follow-up. */
  const longPressAtRef = useRef<number | null>(null);
  const disarmSwallowRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    onOpenAtRef.current = onOpenAt;
  });
  useEffect(
    () => () => {
      if (pressRef.current) window.clearTimeout(pressRef.current.timer);
      disarmSwallowRef.current?.();
    },
    [],
  );

  return useMemo<StudioContextMenuHandlers>(() => {
    const cancelPress = () => {
      if (pressRef.current) window.clearTimeout(pressRef.current.timer);
      pressRef.current = null;
    };
    const fireLongPress = (x: number, y: number) => {
      cancelPress();
      longPressAtRef.current = performance.now();
      if ("vibrate" in navigator) navigator.vibrate(HAPTIC_MS);
      onOpenAtRef.current({ x, y, source: "touch" });
    };
    return {
      onContextMenu: (event) => {
        if (shouldKeepNativeMenu(event)) return;
        event.preventDefault();
        const press = pressRef.current;
        if (press) {
          fireLongPress(press.startX, press.startY);
          return;
        }
        const point = pointOfMouseEvent(event);
        // The Menu key or Shift+F10 is always a fresh ask, whatever a long
        // press did before it.
        const longPressAt = longPressAtRef.current;
        const isLongPressFollowUp =
          point.source !== "keyboard" &&
          longPressAt !== null &&
          performance.now() - longPressAt < FOLLOW_UP_CONTEXTMENU_MS;
        if (isLongPressFollowUp) return;
        onOpenAtRef.current(point);
      },
      onPointerDown: (event) => {
        disarmSwallowRef.current?.();
        disarmSwallowRef.current = null;
        longPressAtRef.current = null;
        if (event.pointerType === "mouse" || !event.isPrimary) return;
        cancelPress();
        const startX = event.clientX;
        const startY = event.clientY;
        pressRef.current = {
          pointerId: event.pointerId,
          startX,
          startY,
          timer: window.setTimeout(
            () => fireLongPress(startX, startY),
            LONG_PRESS_MS,
          ),
        };
      },
      onPointerMove: (event) => {
        const press = pressRef.current;
        if (!press || press.pointerId !== event.pointerId) return;
        const drift = Math.hypot(
          event.clientX - press.startX,
          event.clientY - press.startY,
        );
        if (drift > MOVE_TOLERANCE_PX) cancelPress();
      },
      onPointerUp: (event) => {
        cancelPress();
        if (event.pointerType === "mouse" || longPressAtRef.current === null)
          return;
        lastLongPressLift = {
          row: event.currentTarget,
          liftedAt: performance.now(),
        };
        disarmSwallowRef.current?.();
        disarmSwallowRef.current = swallowNextClickInside(event.currentTarget);
      },
      onPointerCancel: () => {
        cancelPress();
      },
    };
  }, []);
}
