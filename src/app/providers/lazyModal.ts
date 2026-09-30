import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { reloadForStaleChunk } from "../../shared/lib/staleChunkReload";
import { isSpeculationUnwelcome } from "../speculationPreference";

/** Mirrors the idle timeout `RoutePrefetcher` and the messaging route warm use. */
const IDLE_WARM_TIMEOUT_MS = 4_000;

/**
 * A code-split modal for an always-mounted provider. Handle returned by
 * {@link lazyModal}.
 */
export interface LazyModal<Props extends object> {
  /** The lazy component to render, inside `ModalLoadBoundary`. A fresh one
   *  after {@link LazyModal.retryAfterFailure}. */
  readonly Component: LazyExoticComponent<ComponentType<Props>>;
  /** `React.lazy` caches a rejected load for good, so after a failure the
   *  next open needs a new lazy component to try the network again. */
  retryAfterFailure: () => void;
  /** Warm the chunk once the browser is idle (at most once per page load),
   *  so the first open paints without a network round trip. */
  warmWhenIdle: () => void;
}

/**
 * A code-split modal for an always-mounted provider: the chunk stays out of
 * first paint (with whatever demo data the modal reads) and loads at idle via
 * `warmWhenIdle`, or on first open at the latest.
 *
 * A failed load gets the same stale-deploy recovery as a lazy route (see
 * `loadChunkWithRetry` in `app/routeHelpers.tsx`): one reload through the
 * shared `reloadForStaleChunk` guard. Inside its cooldown the error reaches
 * `ModalLoadBoundary`, which closes the modal and calls `retryAfterFailure`.
 * `lazyNamed` there types its components as prop-less pages, so this helper
 * keeps the modal's own props.
 */
export function lazyModal<Props extends object>(
  loader: () => Promise<ComponentType<Props>>,
): LazyModal<Props> {
  const createComponent = () =>
    lazy(() =>
      loader().then(
        (component) => ({ default: component }),
        (error: unknown) => {
          if (!reloadForStaleChunk()) throw error;
          // A reload is underway: stay pending so nothing renders meanwhile.
          return new Promise<{ default: ComponentType<Props> }>(() => {});
        },
      ),
    );
  let component = createComponent();
  let isWarmRequested = false;

  const warm = () => {
    // Skipped on Data Saver or a 2g-class connection, like every other
    // speculative fetch. Silent on failure: the open pays for the fetch.
    if (isSpeculationUnwelcome()) return;
    void loader().catch(() => {});
  };

  return {
    get Component() {
      return component;
    },
    retryAfterFailure() {
      component = createComponent();
    },
    warmWhenIdle() {
      if (isWarmRequested) return;
      isWarmRequested = true;
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(warm, { timeout: IDLE_WARM_TIMEOUT_MS });
      } else {
        window.setTimeout(warm, IDLE_WARM_TIMEOUT_MS);
      }
    },
  };
}
