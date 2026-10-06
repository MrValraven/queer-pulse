import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";

export interface TooltipProps {
  label: string;
  /** `floating-top` is `top` drawn through the same portal as `right`, for a
   * trigger whose ancestors clip (see below). */
  placement?: "top" | "bottom" | "right" | "floating-top";
  /** Keeps the wrapper mounted but never reveals the bubble. For a trigger
   * that needs its label only in some states (a rail's icon strip): toggling
   * this, rather than dropping the wrapper, keeps the trigger from remounting,
   * so its CSS transitions run and it keeps focus. */
  isDisabled?: boolean;
  /** Horizontal alignment for `top` / `bottom` (ignored by `right`). `"end"`
   * lines the bubble's right edge up with the trigger's, for the last control
   * against a clipping column edge, where a centred bubble would be cut off. */
  align?: "center" | "end";
  children: ReactNode;
}

/**
 * A lightweight tooltip for icon-only controls. The bubble is decorative
 * (aria-hidden), so always give the wrapped trigger its own accessible name
 * (e.g. aria-label); that's what screen-reader and switch users rely on.
 *
 * Two placements, two mechanisms:
 * - `top` / `bottom` position the bubble absolutely inside the trigger's own
 *   box and reveal it in pure CSS. Cheapest, and right for anything sitting in
 *   normal page flow.
 * - `right` is the collapsed-icon-rail case, where the trigger lives inside a
 *   scrolling column whose `overflow-y: auto` would clip a bubble beside it,
 *   and where `position: fixed` alone is not enough either, because an ancestor
 *   with a transform or `will-change: transform` (FadeIn, the preview's scale
 *   wrapper) becomes its containing block. That placement portals the bubble to
 *   `<body>` and anchors it to the trigger's measured rect instead.
 * - `floating-top` uses that same portal to sit above the trigger, for a
 *   trigger inside a clipping column on any side (the listing editor's live
 *   preview card). It keeps clear of both viewport edges and drops below the
 *   trigger when there is no room above.
 */
export function Tooltip({
  label,
  placement = "bottom",
  isDisabled = false,
  align = "center",
  children,
}: TooltipProps) {
  return placement === "right" || placement === "floating-top" ? (
    <FloatingTooltip
      label={label}
      isDisabled={isDisabled}
      side={placement === "floating-top" ? "top" : "right"}
    >
      {children}
    </FloatingTooltip>
  ) : (
    <AnchoredTooltip
      label={label}
      placement={placement}
      isDisabled={isDisabled}
      isEndAligned={align === "end"}
    >
      {children}
    </AnchoredTooltip>
  );
}

/** Least room kept between a centred bubble and either viewport edge, in px. */
const VIEWPORT_EDGE_GAP = 8;

/**
 * How far (in CSS px) a centred bubble has to slide sideways to stay
 * VIEWPORT_EDGE_GAP inside the viewport; 0 when it already fits. Works from the
 * unshifted geometry (the trigger's rect plus the bubble's layout width) so the
 * answer never depends on a shift or transition already in flight, and divides
 * out any ancestor scale so the offset lands right inside a scaled preview.
 * An end-aligned bubble starts from the trigger's right edge instead.
 */
function measureViewportShift(
  wrap: HTMLElement,
  bubble: HTMLElement,
  isEndAligned: boolean,
): number {
  const wrapRect = wrap.getBoundingClientRect();
  const scale = wrap.offsetWidth > 0 ? wrapRect.width / wrap.offsetWidth : 1;
  const bubbleWidth = bubble.offsetWidth * scale;
  const naturalLeft = isEndAligned
    ? wrapRect.right - bubbleWidth
    : wrapRect.left + wrapRect.width / 2 - bubbleWidth / 2;
  const shift = clampShiftToViewport(naturalLeft, bubbleWidth);
  // `shift` is in viewport px; the transform runs in the bubble's own px.
  return scale > 0 ? shift / scale : 0;
}

/**
 * The sideways slide, in viewport px, that keeps a bubble starting at
 * `naturalLeft` VIEWPORT_EDGE_GAP inside both viewport edges; 0 when it fits.
 */
function clampShiftToViewport(naturalLeft: number, bubbleWidth: number) {
  const naturalRight = naturalLeft + bubbleWidth;
  const maxRight = document.documentElement.clientWidth - VIEWPORT_EDGE_GAP;
  let shift = 0;
  if (naturalRight > maxRight) shift = maxRight - naturalRight;
  // The left edge wins when a bubble is wider than the room on both sides, so
  // the start of the label (where reading begins) is the part that stays.
  if (naturalLeft + shift < VIEWPORT_EDGE_GAP) {
    shift = VIEWPORT_EDGE_GAP - naturalLeft;
  }
  return shift;
}

/**
 * Reveal paths, so the label is never hover-only (touch has no hover):
 * - hover: pointer-fine devices only (gated in CSS)
 * - focus: keyboard / switch users (`:has(:focus-visible)`, so the focus a
 *   mouse click leaves behind never holds a bubble open)
 * - tap: touch/pen users get a touch-reachable equivalent: a tap on the
 *   trigger surfaces the bubble briefly, then it auto-dismisses. The tap still
 *   reaches the child's own handler; we only reveal and leave preventDefault
 *   alone.
 *
 * Visibility stays in CSS. Each reveal path also measures the bubble (always
 * rendered, only transparent) and writes `--tooltip-shift`, which the CSS
 * transforms add to the centring, so a trigger near a screen edge (the last
 * icon in a row on a phone) keeps its whole label on screen. The shift is left
 * in place on hide: the bubble is invisible then, every reveal measures afresh,
 * and clearing it on pointer-leave would snap back a bubble that focus or a tap
 * is still holding open.
 */
function AnchoredTooltip({
  label,
  placement,
  isDisabled,
  isEndAligned,
  children,
}: {
  label: string;
  placement: "top" | "bottom";
  isDisabled: boolean;
  isEndAligned: boolean;
  children: ReactNode;
}) {
  const [touchOpen, setTouchOpen] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);

  useEffect(
    () => () => {
      if (dismissTimerRef.current !== null) {
        clearTimeout(dismissTimerRef.current);
      }
    },
    [],
  );

  // Measured in the reveal handler itself, before the revealed styles paint,
  // so the bubble fades in already in place.
  const keepInViewport = useCallback(() => {
    const wrap = wrapRef.current;
    const bubble = bubbleRef.current;
    if (!wrap || !bubble) return;
    const shift = measureViewportShift(wrap, bubble, isEndAligned);
    bubble.style.setProperty("--tooltip-shift", `${shift}px`);
  }, [isEndAligned]);

  // A label that changes while showing (Mute becoming Unmute under the cursor)
  // changes the bubble's width, so an open bubble is measured again.
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (wrap?.matches(":hover, :has(:focus-visible)") || touchOpen) {
      keepInViewport();
    }
  }, [label, touchOpen, keepInViewport]);

  const revealOnTouch = (pointerEvent: PointerEvent<HTMLSpanElement>) => {
    // Mouse already gets the hover reveal; only touch/pen need the tap path.
    if (pointerEvent.pointerType === "mouse") return;
    keepInViewport();
    setTouchOpen(true);
    if (dismissTimerRef.current !== null) {
      clearTimeout(dismissTimerRef.current);
    }
    dismissTimerRef.current = setTimeout(() => setTouchOpen(false), 2200);
  };

  return (
    <span
      ref={wrapRef}
      className={styles.wrap}
      onPointerDown={revealOnTouch}
      onPointerEnter={keepInViewport}
      onFocus={keepInViewport}
    >
      {children}
      {!isDisabled && (
        <span
          ref={bubbleRef}
          role="tooltip"
          aria-hidden
          className={[
            styles.bubble,
            styles[placement],
            isEndAligned && styles.end,
            touchOpen && styles.open,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
        </span>
      )}
    </span>
  );
}

/** Where the bubble is drawn, in viewport coordinates. */
interface TooltipAnchor {
  top: number;
  left: number | "auto";
  right: number | "auto";
  /** True when there was no room on the right and it flipped to the left. */
  isFlipped: boolean;
  /** `floating-top` only: the trigger's bottom edge, for the drop below. */
  triggerBottom?: number;
}

/** Gap between the trigger and the bubble, in px. */
const FLOATING_GAP = 10;

/** Gap between the trigger and a `floating-top` bubble, in px; the same as
 * the anchored `top` / `bottom` placements in Tooltip.module.css. */
const FLOATING_TOP_GAP = 6;

/**
 * Places a portaled `floating-top` bubble once it has rendered and has a
 * width: centred over the trigger, slid sideways to stay inside the viewport,
 * and dropped below the trigger when the top of the viewport leaves no room.
 * Written straight to the bubble in a layout effect, so it paints in place.
 */
function placeFloatingTopBubble(bubble: HTMLElement, anchor: TooltipAnchor) {
  const centerX = typeof anchor.left === "number" ? anchor.left : 0;
  const bubbleWidth = bubble.offsetWidth;
  const shift = clampShiftToViewport(centerX - bubbleWidth / 2, bubbleWidth);
  const isBelow =
    anchor.top - FLOATING_TOP_GAP - bubble.offsetHeight < VIEWPORT_EDGE_GAP;
  const top = isBelow
    ? (anchor.triggerBottom ?? anchor.top) + FLOATING_TOP_GAP
    : anchor.top - FLOATING_TOP_GAP;
  bubble.style.left = `${centerX}px`;
  bubble.style.top = `${top}px`;
  bubble.style.setProperty("--tooltip-shift", `${shift}px`);
  bubble.toggleAttribute("data-below", isBelow);
}

/** The bubble's own cap, from Tooltip.module.css. Used to decide whether the
 * right side has room before the bubble has been measured. */
const BUBBLE_MAX_WIDTH = 240;

/**
 * True when the focused element came by its focus from the keyboard (or a
 * switch), judged by the browser's own `:focus-visible` heuristic. A browser
 * that cannot parse the selector throws, and then every focus counts, so the
 * keyboard path still reveals the label there.
 */
function isKeyboardFocus(focusedElement: EventTarget): boolean {
  if (!(focusedElement instanceof Element)) return true;
  try {
    return focusedElement.matches(":focus-visible");
  } catch {
    return true;
  }
}

/**
 * The same reveal paths as AnchoredTooltip, driven from state here because the
 * bubble lives in a portal and CSS on the trigger cannot reach it:
 * - hover: mouse only, shown on pointer enter and hidden on pointer leave
 * - focus: keyboard / switch users only. The trigger's `:focus-visible` is
 *   checked on focus, so the focus a mouse click leaves behind never holds a
 *   bubble open once the pointer has gone.
 * - tap: touch/pen users get the same brief, auto-dismissing reveal
 *
 * The rect is measured once per reveal, so anything that may move or relabel
 * the trigger hides the bubble until the next reveal: a mouse press (a rail
 * collapse toggle jumps as the rail animates, and the pointer sitting still
 * would otherwise leave the bubble at the old spot with the new label),
 * Enter or Space on the focused trigger, a scroll and a resize.
 */
function FloatingTooltip({
  label,
  isDisabled,
  side = "right",
  children,
}: {
  label: string;
  isDisabled: boolean;
  /** `top` is the `floating-top` placement; `right` the rail's. */
  side?: "right" | "top";
  children: ReactNode;
}) {
  const [anchor, setAnchor] = useState<TooltipAnchor | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const topBubbleRef = useRef<HTMLSpanElement>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = () => {
    if (dismissTimerRef.current !== null) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  };

  const hide = useCallback(() => {
    clearDismissTimer();
    setAnchor(null);
  }, []);

  const show = useCallback(() => {
    if (isDisabled) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (side === "top") {
      setAnchor({
        top: rect.top,
        left: rect.left + rect.width / 2,
        right: "auto",
        isFlipped: false,
        triggerBottom: rect.bottom,
      });
      return;
    }
    // A rail pinned to the right edge of the page has no room beside it, so the
    // bubble flips rather than running off screen and clipping its own label.
    const isFlipped =
      window.innerWidth - rect.right < BUBBLE_MAX_WIDTH + FLOATING_GAP;
    setAnchor({
      top: rect.top + rect.height / 2,
      left: isFlipped ? "auto" : rect.right + FLOATING_GAP,
      right: isFlipped ? window.innerWidth - rect.left + FLOATING_GAP : "auto",
      isFlipped,
    });
  }, [isDisabled, side]);

  useLayoutEffect(() => {
    if (anchor && topBubbleRef.current) {
      placeFloatingTopBubble(topBubbleRef.current, anchor);
    }
  }, [anchor]);

  // The rect is measured once, at reveal. Scrolling the rail (or the window)
  // would leave the bubble pointing at nothing, so any scroll dismisses it
  // rather than chasing the trigger frame by frame.
  useEffect(() => {
    if (!anchor) return;
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [anchor, hide]);

  useEffect(() => clearDismissTimer, []);

  const revealOnTouch = (pointerEvent: PointerEvent<HTMLSpanElement>) => {
    // Mouse is already covered by pointer enter/leave; only touch/pen need the
    // tap path, and it auto-dismisses because there is no pointer-leave coming.
    if (pointerEvent.pointerType === "mouse") return;
    show();
    clearDismissTimer();
    dismissTimerRef.current = setTimeout(() => setAnchor(null), 2200);
  };

  // A mouse press may move or relabel the trigger under a still pointer, so it
  // hides the bubble; the next pointer enter or keyboard focus measures afresh.
  const handlePointerDown = (pointerEvent: PointerEvent<HTMLSpanElement>) => {
    if (pointerEvent.pointerType === "mouse") hide();
    revealOnTouch(pointerEvent);
  };

  const showOnKeyboardFocus = (focusEvent: FocusEvent<HTMLSpanElement>) => {
    if (isKeyboardFocus(focusEvent.target)) show();
  };

  // Enter and Space activate the trigger, which may move or relabel it just
  // like a mouse press, so the bubble hides until the next focus or hover.
  const hideOnActivationKey = (
    keyboardEvent: KeyboardEvent<HTMLSpanElement>,
  ) => {
    if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") hide();
  };

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- onKeyDown only listens to keys bubbling up from the wrapped trigger so the bubble can hide on activation; this wrapper is not an interactive control and the trigger owns its own focus, role and keys. */}
      <span
        ref={wrapRef}
        className={styles.wrap}
        onPointerEnter={(pointerEvent) => {
          if (pointerEvent.pointerType === "mouse") show();
        }}
        onPointerLeave={hide}
        onPointerDown={handlePointerDown}
        onFocus={showOnKeyboardFocus}
        onBlur={hide}
        onKeyDown={hideOnActivationKey}
      >
        {children}
      </span>
      {anchor !== null &&
        !isDisabled &&
        side === "top" &&
        createPortal(
          <span
            ref={topBubbleRef}
            role="tooltip"
            aria-hidden
            className={`${styles.bubble} ${styles.floatingTop}`}
          >
            {label}
          </span>,
          document.body,
        )}
      {anchor !== null &&
        !isDisabled &&
        side === "right" &&
        createPortal(
          <span
            role="tooltip"
            aria-hidden
            className={[
              styles.bubble,
              styles.right,
              anchor.isFlipped && styles.rightFlipped,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              top: anchor.top,
              left: anchor.left,
              right: anchor.right,
            }}
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  );
}
