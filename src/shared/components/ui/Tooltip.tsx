import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";

export interface TooltipProps {
  label: string;
  placement?: "top" | "bottom" | "right";
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
 */
export function Tooltip({
  label,
  placement = "bottom",
  children,
}: TooltipProps) {
  return placement === "right" ? (
    <FloatingTooltip label={label}>{children}</FloatingTooltip>
  ) : (
    <AnchoredTooltip label={label} placement={placement}>
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
 */
function measureViewportShift(wrap: HTMLElement, bubble: HTMLElement): number {
  const wrapRect = wrap.getBoundingClientRect();
  const scale = wrap.offsetWidth > 0 ? wrapRect.width / wrap.offsetWidth : 1;
  const bubbleWidth = bubble.offsetWidth * scale;
  const naturalLeft = wrapRect.left + wrapRect.width / 2 - bubbleWidth / 2;
  const naturalRight = naturalLeft + bubbleWidth;
  const maxRight = document.documentElement.clientWidth - VIEWPORT_EDGE_GAP;
  let shift = 0;
  if (naturalRight > maxRight) shift = maxRight - naturalRight;
  // The left edge wins when a bubble is wider than the room on both sides, so
  // the start of the label (where reading begins) is the part that stays.
  if (naturalLeft + shift < VIEWPORT_EDGE_GAP) {
    shift = VIEWPORT_EDGE_GAP - naturalLeft;
  }
  // `shift` is in viewport px; the transform runs in the bubble's own px.
  return scale > 0 ? shift / scale : 0;
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
  children,
}: {
  label: string;
  placement: "top" | "bottom";
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
    const shift = measureViewportShift(wrap, bubble);
    bubble.style.setProperty("--tooltip-shift", `${shift}px`);
  }, []);

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
      <span
        ref={bubbleRef}
        role="tooltip"
        aria-hidden
        className={[styles.bubble, styles[placement], touchOpen && styles.open]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </span>
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
}

/** Gap between the trigger and the bubble, in px. */
const FLOATING_GAP = 10;

/** The bubble's own cap, from Tooltip.module.css. Used to decide whether the
 * right side has room before the bubble has been measured. */
const BUBBLE_MAX_WIDTH = 240;

function FloatingTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [anchor, setAnchor] = useState<TooltipAnchor | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
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
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
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
  }, []);

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

  return (
    <>
      <span
        ref={wrapRef}
        className={styles.wrap}
        onPointerEnter={(pointerEvent) => {
          if (pointerEvent.pointerType === "mouse") show();
        }}
        onPointerLeave={hide}
        onPointerDown={revealOnTouch}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {anchor !== null &&
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
