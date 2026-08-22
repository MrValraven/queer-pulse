import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { AuthLoader } from "../shared/components/feedback/AuthLoader";
import { reloadForStaleChunk } from "../shared/lib/staleChunkReload";

/**
 * Wrap an auth/onboarding route element in its own Suspense boundary so its
 * lazy chunk loads behind the branded {@link AuthLoader} instead of the generic
 * app-wide RouteFallback spinner.
 */
export const auth = (element: ReactNode) => (
  <Suspense fallback={<AuthLoader />}>{element}</Suspense>
);

/**
 * A stale tab's dynamic `import()` for a route chunk 404s whenever the chunk it
 * asked for no longer exists on the server: a dev-server restart or dependency
 * re-optimization locally, or a hashed filename that changed after a prod
 * redeploy. Either way the fix is the same: reload once to pick up the current
 * build, rather than leaving the member stuck on the route's ErrorBoundary.
 *
 * The decision itself is `reloadForStaleChunk`, shared with the
 * `vite:preloadError` listener in `main.tsx`. That listener only covers Vite's
 * production preload helper, so this path is what catches a failed import in
 * dev; sharing one cooldown guard means the two can never fire for the same
 * failure and then disagree on what a second failure should do.
 */
function loadChunkWithRetry<Module>(
  loader: () => Promise<Module>,
): Promise<Module> {
  return loader().catch((error: unknown) => {
    // Blocked: we already reloaded for this within the cooldown, so a genuinely
    // broken chunk surfaces its error instead of looping.
    if (!reloadForStaleChunk()) throw error;
    // A reload is underway — never resolve, so nothing renders in the meantime.
    return new Promise<Module>(() => {});
  });
}

/**
 * Collapse the repetitive
 * `lazy(() => import(...).then((module) => ({ default: module.X })))` boilerplate:
 * name the export once and get a code-split component back.
 *
 * Shared by every per-feature route module so each feature can declare its own
 * lazily-loaded page components with the same terse call. Wraps the import in
 * {@link loadChunkWithRetry} so a stale/missing chunk self-heals with a reload
 * instead of tripping the route ErrorBoundary.
 */
export function lazyNamed<
  Name extends string,
  Module extends Record<Name, ComponentType>,
>(loader: () => Promise<Module>, name: Name) {
  return lazy(() =>
    loadChunkWithRetry(loader).then((module) => ({
      default: module[name],
    })),
  );
}
