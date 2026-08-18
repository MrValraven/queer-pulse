import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { AuthLoader } from "../shared/components/feedback/AuthLoader";

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
 * asked for no longer exists on the server: a dev-server restart/dep
 * re-optimization locally, or a hashed filename that changed after a prod
 * redeploy. Either way the fix is the same: reload once to pick up the current
 * build, rather than leaving the user stuck on the route's ErrorBoundary.
 * Guarded per-chunk via sessionStorage so a genuinely broken chunk still
 * surfaces an error instead of reload-looping forever.
 */
function loadChunkWithRetry<Module>(
  loader: () => Promise<Module>,
  chunkKey: string,
): Promise<Module> {
  const storageKey = `chunk-reload:${chunkKey}`;
  return loader()
    .then((module) => {
      sessionStorage.removeItem(storageKey);
      return module;
    })
    .catch((error: unknown) => {
      if (sessionStorage.getItem(storageKey)) {
        sessionStorage.removeItem(storageKey);
        throw error;
      }
      sessionStorage.setItem(storageKey, "1");
      window.location.reload();
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
    loadChunkWithRetry(loader, name).then((module) => ({
      default: module[name],
    })),
  );
}
