import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { lazyNamed } from "../../app/routeHelpers";
import { ErrorBoundary } from "../../shared/components/feedback/ErrorBoundary";
import { StudioErrorRetryProvider } from "./studioErrorRetry";
import { StudioGateSkeleton } from "./StudioGateSkeleton";

// The fallback loads on first crash only, so the Studio shell stays out of the
// route table's chunk. lazyNamed reloads once for a stale chunk; Retry reaches
// the page through context, so it needs no props.
const Studio500Page = lazyNamed(
  () => import("./Studio500Page"),
  "Studio500Page",
);

/**
 * The layout route around every Studio route. A render crash inside a Studio
 * page lands here and paints the Studio 500 inside the Studio frame (rail,
 * topbar, tab bar), so the member keeps their place in the app and a way
 * out. Without it the crash fell to the app's route boundary, which swapped
 * the Studio frame for the marketing PageShell.
 *
 * It resets on every change of path or query (an album to another album),
 * like the app boundary. After one Retry that crashed again, the page offers
 * a full reload instead. If the Studio frame itself throws while painting
 * the fallback, the error climbs to the app boundary above, which needs no
 * frame at all.
 */
export function StudioErrorBoundary() {
  const { pathname, search } = useLocation();
  const resetKey = `${pathname}${search}`;
  const [retryCount, setRetryCount] = useState(0);
  const [countedKey, setCountedKey] = useState(resetKey);
  // A new page starts with a fresh Retry (adjusted during render).
  if (countedKey !== resetKey) {
    setCountedKey(resetKey);
    setRetryCount(0);
  }
  return (
    <ErrorBoundary
      level="route"
      resetKey={resetKey}
      fallback={(_error, reset) => (
        <StudioErrorRetryProvider
          value={{
            onRetry: () => {
              setRetryCount((count) => count + 1);
              reset();
            },
            hasRetried: retryCount > 0,
          }}
        >
          <Suspense fallback={<StudioGateSkeleton />}>
            <Studio500Page />
          </Suspense>
        </StudioErrorRetryProvider>
      )}
    >
      <Outlet />
    </ErrorBoundary>
  );
}
