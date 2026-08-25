import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const GettingStartedPage = lazyNamed(
  () => import("./GettingStartedPage"),
  "GettingStartedPage",
);

/** The "Getting started" checklist — a member surface under `/account/*`, so
 *  it's already walled-garden gated (see authGate). Lazy-loaded behind the
 *  app-wide RouteFallback like the other account pages. */
export function onboardingRoutes() {
  return (
    <>
      <Route path={routes.gettingStarted} element={<GettingStartedPage />} />
    </>
  );
}
