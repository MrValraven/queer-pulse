/**
 * Pointer and keyboard handling for one effect pad, over the R1 press machine
 * (`rules/vjPadPress.ts`, contract 7.6). The hook decides what a press sends;
 * the dispatcher (R26) applies optimism, flash consent and haptics.
 *
 * - Mouse and pen send "on" on down. Touch waits VJ_PAD_TOUCH_SLOP_MS first,
 *   and a pointer that travels VJ_PAD_MOVE_CANCEL_PX inside that window
 *   cancels the press with nothing sent (the pads row scrolled).
 * - Pointer capture keeps the lift on the pad when the finger slides off.
 * - A latched pad held still for VJ_PAD_TUNE_HOLD_MS opens its tuner, and
 *   that release sends nothing. A pad with `isTunable: false` skips the
 *   hold, so any release of a latched pad sends "off".
 * - A click with `detail === 0` (Enter or Space on a focused pad) toggles.
 * - The context menu opens the tuner and keeps the browser menu shut.
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DOMAttributes,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  VJ_PAD_MOVE_CANCEL_PX,
  VJ_PAD_TOUCH_SLOP_MS,
  VJ_PAD_TUNE_HOLD_MS,
  vjPadPressCancel,
  vjPadPressDown,
  vjPadPressUp,
  vjShouldOpenTuner,
  type VjPadPress,
  type VjPadPressResult,
  type VjPadSend,
} from "../rules/vjPadPress";

export interface UseVjPadPressOptions {
  /** The value the pad shows (the optimistic one while a send waits). */
  isOn: boolean;
  isBlocked: boolean;
  onSend: (send: "on" | "off") => void;
  onOpenTuner: () => void;
  onResult?: (result: VjPadPressResult) => void;
  /**
   * Default true. False for a pad with no tuner (the strobe): a latched hold
   * then never turns into a tune, so its release sends "off".
   */
  isTunable?: boolean;
}

export type VjPadPressHandlers = Pick<
  DOMAttributes<HTMLButtonElement>,
  | "onPointerDown"
  | "onPointerUp"
  | "onPointerCancel"
  | "onPointerMove"
  | "onClick"
  | "onContextMenu"
>;

type VjTimerId = ReturnType<typeof setTimeout>;

interface VjActivePadPress {
  pointerId: number;
  isTouch: boolean;
  press: VjPadPress;
  startX: number;
  startY: number;
  hasSentOn: boolean;
  hasMoved: boolean;
  hasOpenedTuner: boolean;
  /** Touch only: set while the press is still inside its slop window. */
  slopTimerId: VjTimerId | null;
  /** Latched pads only: set until the tune hold fires or the press ends. */
  tuneTimerId: VjTimerId | null;
}

function clearVjPressTimers(active: VjActivePadPress): void {
  if (active.slopTimerId !== null) clearTimeout(active.slopTimerId);
  if (active.tuneTimerId !== null) clearTimeout(active.tuneTimerId);
  active.slopTimerId = null;
  active.tuneTimerId = null;
}

function hasVjPointerTravelled(
  active: VjActivePadPress,
  event: ReactPointerEvent<HTMLButtonElement>,
): boolean {
  const travelPx = Math.hypot(
    event.clientX - active.startX,
    event.clientY - active.startY,
  );
  return travelPx > VJ_PAD_MOVE_CANCEL_PX;
}

function captureVjPointer(event: ReactPointerEvent<HTMLButtonElement>): void {
  const pad = event.currentTarget;
  if (typeof pad.setPointerCapture !== "function") return;
  try {
    pad.setPointerCapture(event.pointerId);
  } catch {
    // The pointer is already gone; the release lands wherever it lands.
  }
}

function isVjPressPointer(
  active: VjActivePadPress | null,
  event: ReactPointerEvent<HTMLButtonElement>,
): active is VjActivePadPress {
  return active !== null && active.pointerId === event.pointerId;
}

export function useVjPadPress(options: UseVjPadPressOptions): {
  handlers: VjPadPressHandlers;
  isPressed: boolean;
} {
  const latestRef = useRef(options);
  useEffect(() => {
    latestRef.current = options;
  });
  const activeRef = useRef<VjActivePadPress | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(
    () => () => {
      const active = activeRef.current;
      if (active !== null) clearVjPressTimers(active);
      activeRef.current = null;
    },
    [],
  );

  const handlers = useMemo<VjPadPressHandlers>(() => {
    const emit = (send: VjPadSend) => {
      if (send !== null) latestRef.current.onSend(send);
    };
    const sendOn = (active: VjActivePadPress) => {
      active.hasSentOn = true;
      latestRef.current.onSend("on");
    };
    const finish = (active: VjActivePadPress, result: VjPadPressResult) => {
      clearVjPressTimers(active);
      activeRef.current = null;
      setIsPressed(false);
      latestRef.current.onResult?.(result);
    };
    const startTuneHold = (active: VjActivePadPress) => {
      active.tuneTimerId = setTimeout(() => {
        active.tuneTimerId = null;
        if (activeRef.current !== active) return;
        if (!vjShouldOpenTuner(active.press, Date.now(), active.hasMoved)) {
          return;
        }
        active.hasOpenedTuner = true;
        latestRef.current.onOpenTuner();
      }, VJ_PAD_TUNE_HOLD_MS);
    };
    const startSlopWindow = (active: VjActivePadPress) => {
      active.slopTimerId = setTimeout(() => {
        active.slopTimerId = null;
        if (activeRef.current !== active) return;
        if (vjPadPressDown(active.press.wasOn) === "on") sendOn(active);
      }, VJ_PAD_TOUCH_SLOP_MS);
    };

    return {
      onPointerDown: (event) => {
        const { isOn, isBlocked } = latestRef.current;
        if (isBlocked || activeRef.current !== null) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        captureVjPointer(event);
        const active: VjActivePadPress = {
          pointerId: event.pointerId,
          isTouch: event.pointerType === "touch",
          press: { wasOn: isOn, startedAt: Date.now() },
          startX: event.clientX,
          startY: event.clientY,
          hasSentOn: false,
          hasMoved: false,
          hasOpenedTuner: false,
          slopTimerId: null,
          tuneTimerId: null,
        };
        activeRef.current = active;
        setIsPressed(true);
        const isTunable = latestRef.current.isTunable ?? true;
        if (isOn && isTunable) startTuneHold(active);
        if (active.isTouch) startSlopWindow(active);
        else if (vjPadPressDown(isOn) === "on") sendOn(active);
      },
      onPointerMove: (event) => {
        const active = activeRef.current;
        if (!isVjPressPointer(active, event) || active.hasMoved) return;
        if (!hasVjPointerTravelled(active, event)) return;
        active.hasMoved = true;
        if (active.tuneTimerId !== null) clearTimeout(active.tuneTimerId);
        active.tuneTimerId = null;
        if (active.isTouch && active.slopTimerId !== null) {
          const { send, result } = vjPadPressCancel(
            active.press,
            active.hasSentOn,
          );
          emit(send);
          finish(active, result);
        }
      },
      onPointerUp: (event) => {
        const active = activeRef.current;
        if (!isVjPressPointer(active, event)) return;
        const releasedAt = Date.now();
        const isQuickTouchTap = active.slopTimerId !== null;
        clearVjPressTimers(active);
        // A touch tap shorter than the slop window still sends its "on".
        if (isQuickTouchTap && vjPadPressDown(active.press.wasOn) === "on") {
          sendOn(active);
        }
        const { send, result } = vjPadPressUp(
          active.press,
          releasedAt,
          active.hasOpenedTuner,
        );
        emit(send);
        finish(active, result);
      },
      onPointerCancel: (event) => {
        const active = activeRef.current;
        if (!isVjPressPointer(active, event)) return;
        const { send, result } = vjPadPressCancel(
          active.press,
          active.hasSentOn,
        );
        emit(send);
        finish(active, result);
      },
      onClick: (event: ReactMouseEvent<HTMLButtonElement>) => {
        // Pointer presses arrive through the pointer handlers above.
        if (event.detail !== 0) return;
        const { isOn, isBlocked, onSend, onResult } = latestRef.current;
        if (isBlocked) return;
        onSend(isOn ? "off" : "on");
        onResult?.(isOn ? "unlatched" : "latched");
      },
      onContextMenu: (event: ReactMouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        // A touch hold is the press machine's to read (momentary or tune).
        if (activeRef.current?.isTouch === true) return;
        if (latestRef.current.isBlocked) return;
        latestRef.current.onOpenTuner();
      },
    };
  }, []);

  return { handlers, isPressed };
}
