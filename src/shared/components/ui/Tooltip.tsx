import {
  useCallback,
  useEffect,
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
 * (e.g. aria-label) — that's what screen-reader and switch users rely on.
 *
 * Two placements, two mechanisms:
 * - `top` / `bottom` position the bubble absolutely inside the trigger's own
 *   box and reveal it in pure CSS. Cheapest, and right for anything sitting in
 *   normal page flow.
 * - `right` is the collapsed-icon-rail case, where the trigger lives inside a
 *   scrolling column whose `overflow-y: auto` would clip a bubble beside it —
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

/**
 * Reveal paths, so the label is never hover-only (touch has no hover):
 * - hover — pointer-fine devices only (gated in CSS)
 * - focus — keyboard / switch users (`:focus-within`)
 * - tap — touch/pen users get a touch-reachable equivalent: a tap on the
 *   trigger surfaces the bubble briefly, then it auto-dismisses. The tap still
 *   reaches the child's own handler; we only reveal, never preventDefault.
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

  useEffect(
    () => () => {
      if (dismissTimerRef.current !== null) {
        clearTimeout(dismissTimerRef.current);
      }
    },
    [],
  );

  const revealOnTouch = (pointerEvent: PointerEvent<HTMLSpanElement>) => {
    // Mouse already gets the hover reveal; only touch/pen need the tap path.
    if (pointerEvent.pointerType === "mouse") return;
    setTouchOpen(true);
    if (dismissTimerRef.current !== null) {
      clearTimeout(dismissTimerRef.current);
    }
    dismissTimerRef.current = setTimeout(() => setTouchOpen(false), 2200);
  };

  return (
    <span className={styles.wrap} onPointerDown={revealOnTouch}>
      {children}
      <span
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
