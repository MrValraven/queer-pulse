import { useLayoutEffect, useRef, type ReactNode } from "react";
import styles from "./GoingAttendeesPreview.module.css";

/** Longest the height transition runs (see `.frame` in the CSS module), plus
 *  slack; the clip is released by then even if `transitionend` never fires. */
const CLIP_RELEASE_FALLBACK_MS = 400;

/**
 * Animates the "Who's going" list between its collapsed and expanded heights.
 * The content lays out at its natural height straight away; a ResizeObserver
 * reads that height and hands it to the frame as an explicit pixel height,
 * which the CSS `height` transition carries over (instant under reduced
 * motion, through the global rule in base.css). Observer callbacks run after
 * layout and before paint, so the frame never paints a frame at the wrong
 * size. The frame clips only while it moves: at rest overflow is visible, so
 * focus rings and the `data-tap-target` hit areas are never cut.
 */
export function GoingHeightFrame({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;
    let shownHeight: number | null = null;
    let shownWidth: number | null = null;
    let releaseTimer: number | undefined;
    const releaseClip = () => {
      window.clearTimeout(releaseTimer);
      frame.style.overflow = "";
    };
    const observer = new ResizeObserver(() => {
      const { height: nextHeight, width: nextWidth } =
        content.getBoundingClientRect();
      const hasWidthChanged =
        shownWidth !== null && Math.abs(shownWidth - nextWidth) >= 0.5;
      shownWidth = nextWidth;
      if (shownHeight !== null && Math.abs(shownHeight - nextHeight) < 0.5) {
        return;
      }
      // A new width (a resized window, a rotated phone, a late font swap)
      // rewraps the chips. That is no expand or collapse, so the frame snaps
      // to the new height instead of easing over it with the content clipped.
      if (hasWidthChanged) {
        releaseClip();
        frame.style.transition = "none";
        frame.style.height = `${nextHeight}px`;
        void frame.offsetHeight;
        frame.style.transition = "";
        shownHeight = nextHeight;
        return;
      }
      // The first reading only pins the height; nothing moves yet.
      if (shownHeight !== null) {
        frame.style.overflow = "hidden";
        window.clearTimeout(releaseTimer);
        releaseTimer = window.setTimeout(releaseClip, CLIP_RELEASE_FALLBACK_MS);
      }
      frame.style.height = `${nextHeight}px`;
      shownHeight = nextHeight;
    });
    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target === frame && event.propertyName === "height") {
        releaseClip();
      }
    };
    frame.addEventListener("transitionend", handleTransitionEnd);
    observer.observe(content);
    return () => {
      observer.disconnect();
      frame.removeEventListener("transitionend", handleTransitionEnd);
      window.clearTimeout(releaseTimer);
    };
  }, []);

  return (
    <div ref={frameRef} id={id} className={styles.frame}>
      <div ref={contentRef} className={styles.frameContent}>
        {children}
      </div>
    </div>
  );
}
