import { registeredChunkLoaders } from "../../../app/routeHelpers";
import { routes } from "../../../app/routeMap";
import { isSpeculationUnwelcome } from "../../../app/speculationPreference";

/**
 * PRD-375: warm the `/messages` route chunk into the browser's (and, once it
 * fetches, the service worker's runtime `qp-assets`) cache for a signed-in
 * member, so a device holding a saved offline inbox can still open it without
 * a network round trip for the chunk itself. `/messages` is deliberately left
 * out of the precache diet (see `vite.config.ts`/`sw.ts`), so without this it
 * is only ever fetched by actually visiting the route.
 *
 * Reuses `registeredChunkLoaders()`, the same chunk-loader registry
 * `RoutePrefetcher` (`src/app/routePrefetch.tsx`) warms on hover/focus/touch
 * and idle for the installed tab bar: the app's one prefetch mechanism.
 * `MessagesPage`'s `lazyNamed(..., routes.messages)` call
 * (`src/features/messages/routes.tsx`) is what registers the loader this
 * reads; the thread pane is not a separate chunk, so warming this one route
 * covers the whole messages surface.
 *
 * Deferred to idle time (`requestIdleCallback`, with a `setTimeout` fallback
 * where that API is missing, e.g. Safari <16.4) and skipped on Data Saver or
 * a 2g-class connection via `isSpeculationUnwelcome()` (`speculationPreference.ts`,
 * shared with `RoutePrefetcher`), so this never competes with the app's own
 * boot work or spends bytes a member's connection settings say not to.
 */
let hasWarmedMessagesRouteChunk = false;
/** True from the moment a warm is scheduled until its idle callback actually
 *  runs, so a call arriving before that callback fires joins the one already
 *  scheduled, without queuing a second one. */
let isWarmScheduled = false;

/** A few seconds: generous enough that idle time almost always arrives first,
 *  short enough that a busy tab still warms the chunk well before a member
 *  could plausibly go offline and open Messages. Mirrors the idle timeout
 *  `RoutePrefetcher` uses for the tab bar. */
const IDLE_FALLBACK_TIMEOUT_MS = 4_000;

function scheduleIdleWork(run: () => void): void {
  const hasIdleCallback = typeof window.requestIdleCallback === "function";
  if (hasIdleCallback) {
    window.requestIdleCallback(run, { timeout: IDLE_FALLBACK_TIMEOUT_MS });
    return;
  }
  window.setTimeout(run, IDLE_FALLBACK_TIMEOUT_MS);
}

export function prefetchMessagesRouteChunk(): void {
  if (hasWarmedMessagesRouteChunk || isWarmScheduled) return;
  isWarmScheduled = true;
  scheduleIdleWork(() => {
    isWarmScheduled = false;
    if (hasWarmedMessagesRouteChunk || isSpeculationUnwelcome()) return;
    for (const [pattern, load] of registeredChunkLoaders()) {
      if (pattern !== routes.messages) continue;
      // Only latched once a loader actually matched: if `routes.messages`
      // is ever missing from the registry (a registration bug), warming
      // stays retryable for the rest of the session.
      hasWarmedMessagesRouteChunk = true;
      // Speculative: a failed warm must stay silent and simply retry on the
      // next call this session, the same contract `RoutePrefetcher` honours.
      void load().catch(() => {
        hasWarmedMessagesRouteChunk = false;
      });
      return;
    }
  });
}
