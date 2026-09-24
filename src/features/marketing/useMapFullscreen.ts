import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { usePrefersReducedMotion, useScrollLock } from "../../shared/hooks";

/** The attribute on <html> that names the map and its list for the length of
 *  one grow or shrink (localMap.module.css keys the view transition names and
 *  the corner animation off it). "enter" while growing, "exit" while
 *  shrinking back. */
const TRANSITION_ATTRIBUTE = "directoryMapTransition";

/** Full screen for the directory map stage (the map and its floating list
 *  together). The stage becomes a fixed overlay that fills the browser window,
 *  keyed off `data-fullscreen` on the stage, with the page behind it scroll
 *  locked. Entering and leaving run through a same-document view transition,
 *  so the map grows out of its place on the page and shrinks back into it; a
 *  browser without view transitions, or a member who prefers reduced motion,
 *  gets the same change with no animation. The button and Escape share that
 *  one path. */
export function useMapFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const shouldReduceMotion = usePrefersReducedMotion();
  // The grow or shrink on screen right now, if any. A second press while it
  // runs is dropped, so the state always ends where the animation ends.
  const runningTransitionRef = useRef<ViewTransition | null>(null);
  // Filled by the map (useLisbonMap) with a synchronous resize and redraw.
  const redrawHandleRef = useRef<(() => void) | null>(null);

  // The overlay covers the viewport, so the page underneath must not scroll
  // while it is up.
  useScrollLock(isFullscreen);

  const changeFullscreen = useCallback(
    (shouldBeFullscreen: boolean) => {
      if (runningTransitionRef.current !== null) return;
      if (shouldBeFullscreen === isFullscreen) return;
      if (
        shouldReduceMotion ||
        typeof document.startViewTransition !== "function"
      ) {
        setIsFullscreen(shouldBeFullscreen);
        return;
      }

      const rootDataset = document.documentElement.dataset;
      rootDataset[TRANSITION_ATTRIBUTE] = shouldBeFullscreen ? "enter" : "exit";
      const transition = document.startViewTransition(() => {
        // The browser captures the new state as soon as this returns, so the
        // DOM changes here synchronously and the map repaints at its new size
        // straight after. Before the map is ready there is nothing to redraw.
        flushSync(() => setIsFullscreen(shouldBeFullscreen));
        redrawHandleRef.current?.();
      });
      runningTransitionRef.current = transition;
      // `ready` rejects when the browser skips the animation, as it does in a
      // hidden tab. The state still changes, so there is nothing to handle
      // beyond keeping the rejection out of the console.
      void transition.ready.catch(() => undefined);
      void transition.finished
        .catch(() => undefined)
        .finally(() => {
          runningTransitionRef.current = null;
          delete rootDataset[TRANSITION_ATTRIBUTE];
        });
    },
    [isFullscreen, shouldReduceMotion],
  );

  // The overlay has no browser chrome of its own to leave through, so Escape
  // closes it, animated like the button.
  useEffect(() => {
    if (!isFullscreen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !event.defaultPrevented) {
        changeFullscreen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, changeFullscreen]);

  const exit = useCallback(() => changeFullscreen(false), [changeFullscreen]);

  const toggle = useCallback(
    () => changeFullscreen(!isFullscreen),
    [changeFullscreen, isFullscreen],
  );

  return { isFullscreen, toggle, exit, redrawHandleRef };
}
