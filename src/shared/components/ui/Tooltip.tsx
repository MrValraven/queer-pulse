import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import styles from "./Tooltip.module.css";

/**
 * A lightweight tooltip for icon-only controls. The bubble is decorative
 * (aria-hidden), so always give the wrapped trigger its own accessible name
 * (e.g. aria-label) — that's what screen-reader and switch users rely on.
 *
 * Reveal paths, so the label is never hover-only (touch has no hover):
 * - hover — pointer-fine devices only (gated in CSS)
 * - focus — keyboard / switch users (`:focus-within`)
 * - tap — touch/pen users get a touch-reachable equivalent: a tap on the
 *   trigger surfaces the bubble briefly, then it auto-dismisses. The tap still
 *   reaches the child's own handler; we only reveal, never preventDefault.
 */
export function Tooltip({
  label,
  placement = "bottom",
  children,
}: {
  label: string;
  placement?: "top" | "bottom";
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
