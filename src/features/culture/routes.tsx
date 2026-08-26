import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const CulturePage = lazyNamed(() => import("./CulturePage"), "CulturePage");
const CultureComingSoon = lazyNamed(
  () => import("./CultureComingSoon"),
  "CultureComingSoon",
);

/** The culture landing page (club picks, commission board, showcase, radio).
 *
 *  Culture is not launched: every tab's listing is curated editorial content
 *  that only exists in the demo mocks, and the `content` module behind it is
 *  read-only with no admin CRUD, so in live mode the page is four empty boxes
 *  with its contribute buttons hidden and nothing can ever be published into
 *  it. So when `demoMode` is off the route resolves to an honest not-launched
 *  page, the same treatment `studioRoutes` gives Studio, and the meganav entry
 *  is dropped (`DEMO_ONLY_NAV_PATTERNS` in `app/authGate.ts`). Demo mode keeps
 *  the full mock experience. CON-14. */
export function cultureRoutes(demoMode: boolean) {
  return (
    <>
      <Route
        path={routes.culture}
        element={demoMode ? <CulturePage /> : <CultureComingSoon />}
      />
    </>
  );
}
