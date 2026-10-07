import {
  useCallback,
  useEffect,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { m, useDragControls, useMotionValue, type PanInfo } from "motion/react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { mediaMax } from "../../theme/breakpoints";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { canGoBack, currentHistoryIdx } from "./canGoBack";
import styles from "./SwipeBackShell.module.css";

/** How close to the left edge a touch must start to arm the gesture. Narrow,
 * like iOS's own edge-swipe-back strip — wider would swallow ordinary taps
 * and horizontal content (carousels, tabs) that happen to sit near the edge. */
const EDGE_ZONE_PX = 24;
/** Fraction of the viewport a released drag must cross to commit, absent a
 * fast flick — mirrors iOS's roughly-a-third commit point. */
const COMMIT_FRACTION = 0.35;
/** A fast rightward flick commits even short of the distance threshold.
 * motion's PanInfo.velocity is px/s (the type declaration's px/ms comment is
 * stale — the runtime computes distance/seconds); 500px/s is a brisk flick,
 * secondary to the COMMIT_FRACTION distance check above. */
const FLICK_VELOCITY = 500;

/** Desktop's transform template: an empty string, so motion never writes an
 * inline `transform` there (see `SwipeBackShell`). Module-level so the prop
 * keeps one identity across renders. */
const withoutTransform = () => "";

/**
 * iOS-style edge-swipe-to-go-back for the routed content plane. Desktop has
 * no touch surface to swipe, so there the wrapper carries no gesture, no
 * class and no transform. The wrapper itself is rendered at every width,
 * because swapping it for a bare fragment at the breakpoint changed the
 * element type above the routed page, and React remounted the whole page and
 * dropped its state (the selected tab, a half-filled form).
 *
 * On mobile, `children` sit inside a draggable surface that only *arms* when
 * a pointer goes down within `EDGE_ZONE_PX` of the left edge: `dragListener`
 * is off, so motion never attaches its own generic pointerdown handler to the
 * whole surface, and a manually-started `dragControls` fires only from that
 * edge check. Everywhere else — scrolling a list, tapping a card three pixels
 * inside the edge — is completely untouched by the gesture. A committed drag
 * calls `navigate(-1)`, which plays the same `pop` transition as the Back
 * button; an under-threshold release (or no history to pop) springs back to
 * x:0 via motion's own drag-constraint animation — the gesture can never
 * strand the user on a blank screen.
 *
 * Reduced motion keeps the gesture itself: it is a 1:1, thumb-driven
 * navigation affordance (the surface only ever travels as far as the finger
 * does), not decoration, so removing it would remove function, not flourish.
 * What changes is the *release* animation — a fast, critically-damped snap
 * instead of the springy rebound — so nothing overshoots or oscillates once
 * the finger lifts. The back button and the OS/browser back gesture remain
 * the non-gesture equivalent regardless of any of this.
 */
export function SwipeBackShell({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery(mediaMax("mobile"));
  const { reducedMotion } = useMotionPrefs();
  const navigate = useNavigate();
  const dragControls = useDragControls();
  // The drag writes to this value (motion's drag reads `x` from the element's
  // bound values). Bound at every width so a reset below always re-renders.
  const swipeOffsetX = useMotionValue(0);

  // Crossing to desktop mid-drag (a rotated tablet) would otherwise strand
  // the surface at the finger's offset: with `drag` now off, motion ignores
  // the rest of the gesture and never springs it back. `jump` also stops a
  // spring-back already in flight.
  useEffect(() => {
    if (!isMobile) swipeOffsetX.jump(0);
  }, [isMobile, swipeOffsetX]);

  const armIfEdgeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.clientX > EDGE_ZONE_PX) return;
      dragControls.start(event);
    },
    [dragControls],
  );

  const onDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const pastThreshold =
        info.offset.x > window.innerWidth * COMMIT_FRACTION ||
        info.velocity.x > FLICK_VELOCITY;
      if (pastThreshold && canGoBack(currentHistoryIdx())) {
        void navigate(-1);
      }
      // Otherwise: no navigate call, so motion's dragConstraints spring the
      // surface back to x:0 on its own — the "never dead-end" path.
    },
    [navigate],
  );

  // Desktop passes `drag={false}` and no `dragControls`, which keeps motion's
  // drag feature from ever starting there; the transform template keeps even
  // a `transform: none` off the element, so a fixed-position descendant is
  // never re-anchored to this wrapper (see MoreMenu).
  const gestureProps = isMobile
    ? {
        className: styles.surface,
        onPointerDown: armIfEdgeStart,
        drag: "x" as const,
        dragListener: false,
        dragControls,
        dragConstraints: { left: 0, right: 0 },
        dragElastic: { left: 0, right: 0.9 },
        dragMomentum: false,
        dragTransition: reducedMotion
          ? { bounceStiffness: 700, bounceDamping: 60 }
          : undefined,
        onDragEnd,
      }
    : { drag: false, transformTemplate: withoutTransform };

  return (
    <m.div style={{ x: swipeOffsetX }} {...gestureProps}>
      {children}
    </m.div>
  );
}
