/**
 * The single stale-deploy recovery policy.
 *
 * After a new build ships, a still-open tab's lazy-route `import()` asks for a
 * hashed filename that no longer exists. One full reload picks up the current
 * build; without it the member lands on the route's crash panel. The same thing
 * happens locally on a dev-server restart or a dependency re-optimization.
 *
 * There used to be two implementations of this — the `vite:preloadError`
 * listener in `main.tsx` and `loadChunkWithRetry` in `app/routeHelpers.tsx` —
 * each with its own sessionStorage key and its own cooldown policy. Both could
 * fire for the same failure and then disagree about whether a SECOND failure
 * should reload again. One guard, shared by both entry points, ends that.
 *
 * The guard is a timestamp, not a flag: a genuinely broken chunk keeps failing
 * inside the cooldown and is allowed through to the ErrorBoundary, while a
 * later, unrelated stale deploy in the same long session still recovers.
 */
const RELOAD_KEY = "qp.staleChunkReloadAt";
const RELOAD_COOLDOWN_MILLISECONDS = 10_000;

function readLastReloadAt(): number {
  try {
    return Number(window.sessionStorage.getItem(RELOAD_KEY) ?? 0);
  } catch {
    // Private-mode / blocked storage: treat it as "never reloaded". We accept
    // the small risk of a second attempt rather than showing the crash panel.
    return 0;
  }
}

/**
 * Reload once to pick up the current build.
 *
 * Returns `true` when the reload was started (the caller should stop handling
 * the failure), `false` when the cooldown blocked it (the caller should let the
 * error surface normally).
 */
export function reloadForStaleChunk(): boolean {
  const lastReloadAt = readLastReloadAt();
  if (Date.now() - lastReloadAt < RELOAD_COOLDOWN_MILLISECONDS) return false;
  try {
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* blocked storage — reload anyway, see readLastReloadAt */
  }
  window.location.reload();
  return true;
}
