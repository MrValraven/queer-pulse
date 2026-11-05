import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * A callback whose identity never changes and that always runs the latest
 * `callback`. The rail hands these to its memoised thumbnails, so a keystroke
 * on the slide re-renders only the thumbnail it changed.
 */
export function useStudioStableCallback<Args extends unknown[], Result>(
  callback: (...args: Args) => Result,
): (...args: Args) => Result {
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });
  return useCallback((...args: Args) => callbackRef.current(...args), []);
}
