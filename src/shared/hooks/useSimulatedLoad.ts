import { useEffect, useState } from "react";
import { isPrerendering } from "../prerender";

/**
 * Simulates a short data fetch for the mock prototype: returns `loading` as
 * `true`, then flips it to `false` after `delay` ms so a page can show a
 * skeleton placeholder and then animate the real content in.
 *
 * This is the one place the prototype's fake "fetch" delay is defined — page
 * components should use it instead of hand-rolling a `useState` + `setTimeout`.
 *
 * @param delay milliseconds before content is "loaded" (default 600)
 */
export function useSimulatedLoad(delay = 600) {
  // During the build-time prerender there is no user to show a skeleton to —
  // only a serialiser about to snapshot the DOM. Starting in the loaded state
  // means the snapshot captures real content instead of a placeholder. Without
  // this, 13 indexed pages (including /resources, the entry point of the whole
  // indexed surface) race the prerenderer and can ship as skeletons while the
  // build still reports success. See src/shared/prerender.ts.
  const [loading, setLoading] = useState(() => !isPrerendering());

  useEffect(() => {
    if (isPrerendering()) return;
    const timeoutId = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(timeoutId);
  }, [delay]);

  return loading;
}
