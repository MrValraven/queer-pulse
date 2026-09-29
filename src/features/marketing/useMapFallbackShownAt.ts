import { useCallback, useState } from "react";

/** When the map view's Suspense fallback appeared, so the real view can pick
 *  up its loader mid-animation (see DirectoryMapFallback). The first report
 *  wins, so a Strict Mode remount or a re-render never restarts the clock.
 *  Leaving the map clears it: a later visit either shows a fresh fallback or,
 *  with the chunk already cached, plays the view's own entrance from zero. */
export function useMapFallbackShownAt(isMapView: boolean) {
  const [fallbackShownAt, setFallbackShownAt] = useState<number | null>(null);
  const recordFallbackShown = useCallback((shownAt: number) => {
    setFallbackShownAt((current) => current ?? shownAt);
  }, []);
  if (!isMapView && fallbackShownAt !== null) {
    setFallbackShownAt(null);
  }
  return { fallbackShownAt, recordFallbackShown };
}
