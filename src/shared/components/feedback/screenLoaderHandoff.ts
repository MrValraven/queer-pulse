import { useEffect, useState } from "react";

/**
 * A continuing screen loader must mount within this long of the last one
 * leaving. Wide enough for a handoff inside one commit or across a couple of
 * frames; narrow enough that a new wait after the page has actually painted
 * starts fresh, with its own reveal hold.
 */
const HANDOFF_WINDOW_MS = 150;

/**
 * Module state shared by every screen-size PageLoader. A cold load of a gated
 * route mounts two of them back to back, the session check's in app/routes.tsx
 * and then the route Suspense fallback's, and this is what lets the second one
 * pick up the first one's timeline.
 *
 * `waitStartedAtMs` is when the current chain of screen loaders began, on the
 * `performance.now()` clock; it only moves when a loader mounts fresh.
 */
const screenLoaderChain = {
  mountedCount: 0,
  lastUnmountedAtMs: Number.NEGATIVE_INFINITY,
  waitStartedAtMs: 0,
};

/**
 * Join the running chain when a screen loader is mounted or left within
 * {@link HANDOFF_WINDOW_MS}; otherwise start a new chain here. Returns how long
 * the chain has been running, in milliseconds: 0 for a fresh wait.
 */
function joinScreenLoaderChain(): number {
  const nowMs = performance.now();
  const isContinuing =
    screenLoaderChain.mountedCount > 0 ||
    nowMs - screenLoaderChain.lastUnmountedAtMs <= HANDOFF_WINDOW_MS;
  if (!isContinuing) screenLoaderChain.waitStartedAtMs = nowMs;
  return nowMs - screenLoaderChain.waitStartedAtMs;
}

/**
 * How long the wait a screen-size PageLoader belongs to has already been on,
 * in milliseconds, which is where its timeline starts. Read once per mount (the
 * state initializer), so a re-render never shifts the animations. The mount
 * count is kept in an effect: during a handoff the incoming loader renders
 * while the outgoing one is still mounted, so the count alone catches the
 * common case, and the unmount timestamp catches a gap of a frame or two.
 *
 * Any other size passes `isScreen: false` and always gets a fresh wait, which
 * is exactly the timeline it had before this existed.
 */
export function useScreenLoaderHandoff(isScreen: boolean): number {
  const [elapsedMs] = useState(() => (isScreen ? joinScreenLoaderChain() : 0));

  useEffect(() => {
    if (!isScreen) return;
    screenLoaderChain.mountedCount += 1;
    return () => {
      screenLoaderChain.mountedCount -= 1;
      screenLoaderChain.lastUnmountedAtMs = performance.now();
    };
  }, [isScreen]);

  return elapsedMs;
}
