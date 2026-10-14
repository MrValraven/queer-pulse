import { useCallback, useEffect, useRef, useState } from "react";
import { animate, usePresence } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import type { StudioQueueItem } from "./player/studioPlayerContext";
import { STUDIO_PLAYER_INSET_PROPERTY } from "./useStudioPlayerInset";

/** The bar's exit, in step with `.bar[data-closing]` in StudioPlayer.module.css. */
const BAR_EXIT_SECONDS = 0.2;
/** --ease-out, so the inset and the bar slow down together. */
const BAR_EXIT_EASE = [0.16, 1, 0.3, 1] as const;
/** Longest the bar may linger if the inset's animation never reports back
 *  (a hidden tab pauses animation frames). */
const BAR_EXIT_FALLBACK_MS = 400;

export interface StudioBarExit {
  /** The item the bar shows: the current one, or the last one while it leaves. */
  item: StudioQueueItem | null;
  /** True while the bar slides down and fades on its way out. */
  isClosing: boolean;
  /** The bar element's ref callback; it also feeds the inset measure. */
  attachBar: (bar: HTMLElement | null) => void;
}

/**
 * The bar's way out, inside StudioPlayerMount's AnimatePresence. The audio
 * has already stopped; only the visuals linger. While closing, the bar keeps
 * the last item, and CSS slides it down and fades it, while the published
 * --studio-player-inset eases to 0 so the page spacer and every inset reader
 * close the gap with it. Reduced motion removes it at once. A Play during
 * the exit brings the bar back with the new track and measures it again.
 */
export function useStudioBarExit(
  currentItem: StudioQueueItem | null,
  measureBar?: (bar: HTMLElement | null) => void,
): StudioBarExit {
  const [isPresent, safeToRemove] = usePresence();
  const { reducedMotion } = useMotionPrefs();
  const [lastItem, setLastItem] = useState(currentItem);
  if (currentItem && currentItem !== lastItem) setLastItem(currentItem);
  const barElementRef = useRef<HTMLElement | null>(null);
  const wasClosingRef = useRef(false);
  // Read through a ref: motion may hand a new function on a later render,
  // and a re-run would restart the exit from the top.
  const safeToRemoveRef = useRef(safeToRemove);
  useEffect(() => {
    safeToRemoveRef.current = safeToRemove;
  });

  const attachBar = useCallback(
    (bar: HTMLElement | null) => {
      barElementRef.current = bar;
      measureBar?.(bar);
    },
    [measureBar],
  );

  useEffect(() => {
    const bar = barElementRef.current;
    if (isPresent) {
      // Back before the exit finished: the bar is measured live again.
      if (wasClosingRef.current && bar) measureBar?.(bar);
      wasClosingRef.current = false;
      return;
    }
    wasClosingRef.current = true;
    const finish = () => safeToRemoveRef.current?.();
    const startHeight = bar?.getBoundingClientRect().height ?? 0;
    // A bar with no box (not laid out) has nothing to show on its way out.
    if (!bar || reducedMotion || startHeight === 0) {
      finish();
      return;
    }
    const rootStyle = document.documentElement.style;
    const publishInset = (height: number) =>
      rootStyle.setProperty(STUDIO_PLAYER_INSET_PROPERTY, `${height}px`);
    // Stops the live measure (it would publish 0px), then holds the height
    // in the same task, so no frame paints without it.
    measureBar?.(null);
    publishInset(startHeight);
    const insetAnimation = animate(startHeight, 0, {
      duration: BAR_EXIT_SECONDS,
      ease: BAR_EXIT_EASE,
      onUpdate: publishInset,
      onComplete: finish,
    });
    const fallbackTimer = window.setTimeout(finish, BAR_EXIT_FALLBACK_MS);
    return () => {
      insetAnimation.stop();
      window.clearTimeout(fallbackTimer);
    };
  }, [isPresent, reducedMotion, measureBar]);

  const isClosing = !isPresent;
  return {
    item: isClosing ? (currentItem ?? lastItem) : currentItem,
    isClosing,
    attachBar,
  };
}
