import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import styles from "./StudioGettingPaid.module.css";

const SWAP_DURATION_MS = 280;
const SWAP_EASING = "cubic-bezier(0.22, 0.68, 0.16, 1)";

/**
 * Holds one persona's editor and morphs between two editors of different
 * heights. When `swapKey` changes the frame grows or shrinks from the old
 * height to the new one while the new editor fades in, in one motion, instead
 * of the content stepping to its new height in a single frame. While `isPending`
 * the old editor stays in place, dimmed and inert, until the next one arrives.
 * It clips only while it moves, so focus rings stay whole at rest.
 */
export function StudioPersonaSwapFrame({
  swapKey,
  isPending,
  children,
}: {
  swapKey: string;
  isPending: boolean;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const settledHeight = useRef<number | null>(null);
  const settledKey = useRef(swapKey);

  // The observer fires after layout effects, so on a swap `settledHeight` is
  // still the old editor's height when the effect below reads it.
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(() => {
      settledHeight.current = content.getBoundingClientRect().height;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (settledKey.current === swapKey) return;
    settledKey.current = swapKey;
    const frame = frameRef.current;
    const content = contentRef.current;
    const fromHeight = settledHeight.current;
    if (!frame || !content || fromHeight === null || reducedMotion) return;
    const toHeight = content.getBoundingClientRect().height;
    const timing = { duration: SWAP_DURATION_MS, easing: SWAP_EASING };
    content.animate([{ opacity: 0 }, { opacity: 1 }], timing);
    if (Math.abs(fromHeight - toHeight) < 1) return;
    frame.style.overflow = "hidden";
    const morph = frame.animate(
      [{ height: `${fromHeight}px` }, { height: `${toHeight}px` }],
      timing,
    );
    const clearClip = () => {
      frame.style.overflow = "";
    };
    morph.addEventListener("finish", clearClip);
    morph.addEventListener("cancel", clearClip);
  }, [swapKey, reducedMotion]);

  return (
    <div ref={frameRef} className={styles.swapFrame}>
      <div
        ref={contentRef}
        className={isPending ? styles.swapPending : undefined}
        inert={isPending}
      >
        {children}
      </div>
    </div>
  );
}
