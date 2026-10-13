import { useCallback, useEffect, useRef } from "react";

export const STUDIO_PLAYER_INSET_PROPERTY = "--studio-player-inset";

/**
 * Publishes the bar's real height as --studio-player-inset on the root so
 * every fixed-bottom or full-height layout can sit above it. Returns the ref
 * callback for the bar element; the property reads 0px while no bar is
 * mounted and is removed when the mount unmounts.
 */
export function useStudioPlayerInset() {
  const observerRef = useRef<ResizeObserver | null>(null);

  const barRef = useCallback((bar: HTMLElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    const style = document.documentElement.style;
    if (!bar) {
      style.setProperty(STUDIO_PLAYER_INSET_PROPERTY, "0px");
      return;
    }
    const publish = () =>
      style.setProperty(
        STUDIO_PLAYER_INSET_PROPERTY,
        `${bar.getBoundingClientRect().height}px`,
      );
    publish();
    if (typeof ResizeObserver === "undefined") return;
    observerRef.current = new ResizeObserver(publish);
    observerRef.current.observe(bar);
  }, []);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      document.documentElement.style.removeProperty(
        STUDIO_PLAYER_INSET_PROPERTY,
      );
    },
    [],
  );

  return barRef;
}
