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
 * Collapse the repetitive
 * `lazy(() => import(...).then((module) => ({ default: module.X })))` boilerplate:
 * name the export once and get a code-split component back.
 *
 * Shared by every per-feature route module so each feature can declare its own
 * lazily-loaded page components with the same terse call.
 */
export function lazyNamed<
  Name extends string,
  Module extends Record<Name, ComponentType>,
>(loader: () => Promise<Module>, name: Name) {
  return lazy(() => loader().then((module) => ({ default: module[name] })));
}
