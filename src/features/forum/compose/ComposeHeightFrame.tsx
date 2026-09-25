import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { COMPOSE_EASE } from "./composeMotion";

// ── A box that eases to its content's new height ────────────────────────────
// Some composer rows change height in one frame with nothing to interpolate:
// the "Sounds like ..." chip joining the heading row, a title placeholder that
// needs a second line. Wrapped in this frame, the row still lands at once, but
// the frame plays a short height animation from the old height to the new one
// (clipping while it moves), so whatever sits below glides to its new place.
//
// At rest the frame is plain `height: auto` and follows its content with no
// lag. The animation starts inside the ResizeObserver callback, which runs
// after layout and before paint, so the first painted frame is already the
// old height.

/** `--ease`, as the Web Animations API spells it. */
const HEIGHT_EASING = `cubic-bezier(${COMPOSE_EASE.join(", ")})`;

/** `--dur-base`, in ms. */
const HEIGHT_DURATION_MS = 250;

export interface ComposeHeightFrameProps {
  children: ReactNode;
  /** False lets a height change land at once (while the member types, say).
   *  Read at the moment the height changes. */
  isAnimated?: boolean;
  className?: string;
}

export function ComposeHeightFrame({
  children,
  isAnimated = true,
  className,
}: ComposeHeightFrameProps) {
  const { reducedMotion } = useMotionPrefs();
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shouldAnimateRef = useRef(false);

  // Kept current in the commit, so the observer below reads the value that
  // belongs to the render which changed the height.
  useLayoutEffect(() => {
    shouldAnimateRef.current = isAnimated && !reducedMotion;
  });

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content || typeof ResizeObserver === "undefined") return;
    let settledHeight = content.getBoundingClientRect().height;
    let running: Animation | null = null;

    const observer = new ResizeObserver(() => {
      const nextHeight = content.getBoundingClientRect().height;
      // Mid-animation the frame is showing an in-between height, and the next
      // animation starts from exactly there.
      const fromHeight = running
        ? frame.getBoundingClientRect().height
        : settledHeight;
      settledHeight = nextHeight;
      running?.cancel();
      running = null;
      if (
        fromHeight === nextHeight ||
        !shouldAnimateRef.current ||
        typeof frame.animate !== "function"
      ) {
        return;
      }
      const animation = frame.animate(
        [
          { height: `${fromHeight}px`, overflow: "hidden" },
          { height: `${nextHeight}px`, overflow: "hidden" },
        ],
        { duration: HEIGHT_DURATION_MS, easing: HEIGHT_EASING },
      );
      animation.onfinish = () => {
        if (running === animation) running = null;
      };
      running = animation;
    });
    observer.observe(content);
    return () => {
      observer.disconnect();
      running?.cancel();
    };
  }, []);

  return (
    <div ref={frameRef} className={className}>
      {/* `flow-root` keeps a child's margins inside, so the measured height
          is the height the frame takes at rest. */}
      <div ref={contentRef} style={{ display: "flow-root" }}>
        {children}
      </div>
    </div>
  );
}
