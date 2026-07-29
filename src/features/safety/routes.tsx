import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { ParamRedirect } from "../../app/routes.redirects";
import { lazyNamed } from "../../app/routeHelpers";

const SafeSpacesPage = lazyNamed(() => import("./SafeSpacesPage"), "SafeSpacesPage");
const SafeSpaceDetailPage = lazyNamed(() => import("./SafeSpaceDetailPage"), "SafeSpaceDetailPage");
const HateCrimePage = lazyNamed(() => import("./HateCrimePage"), "HateCrimePage");
const ReportPage = lazyNamed(() => import("./ReportPage"), "ReportPage");
const BlockMutePage = lazyNamed(() => import("./BlockMutePage"), "BlockMutePage");
const AppealOutcomePage = lazyNamed(() => import("./AppealOutcomePage"), "AppealOutcomePage");

/** Safety & trust-and-safety surfaces: safe-spaces directory, hate-crime
 *  reporting, block/mute, and appeal outcomes. */
export function safetyRoutes() {
  return (
    <>
      <Route path={routes.hateCrime} element={<HateCrimePage />} />
      <Route path={routes.report} element={<ReportPage />} />
      <Route path={routes.blockMute} element={<BlockMutePage />} />
      <Route path={routes.appealOutcome} element={<AppealOutcomePage />} />
      <Route path={routes.safeSpaces} element={<SafeSpacesPage />} />
      <Route
        path={`${routes.safeSpaces}/:slug`}
        element={<SafeSpaceDetailPage />}
      />
      <Route
        path="/safe-space/:slug"
        element={
          <ParamRedirect build={(p) => `/local/safe-spaces/${p.slug ?? ""}`} />
        }
      />
    </>
  );
}
