import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const SafeSpacesPage = lazyNamed(
  () => import("./SafeSpacesPage"),
  "SafeSpacesPage",
);
const SafeSpaceDetailPage = lazyNamed(
  () => import("./SafeSpaceDetailPage"),
  "SafeSpaceDetailPage",
);
const HateCrimePage = lazyNamed(
  () => import("./HateCrimePage"),
  "HateCrimePage",
);
const ReportPage = lazyNamed(() => import("./ReportPage"), "ReportPage");
const ReportingGuidePage = lazyNamed(
  () => import("./ReportingGuidePage"),
  "ReportingGuidePage",
);
const BlockMutePage = lazyNamed(
  () => import("./BlockMutePage"),
  "BlockMutePage",
);
const AppealOutcomePage = lazyNamed(
  () => import("./AppealOutcomePage"),
  "AppealOutcomePage",
);
const AppealSubmitPage = lazyNamed(
  () => import("./AppealSubmitPage"),
  "AppealSubmitPage",
);

/** Safety & trust-and-safety surfaces: safe-spaces directory, hate-crime
 *  reporting, block/mute, and appeal outcomes. */
export function safetyRoutes() {
  return (
    <>
      <Route path={routes.hateCrime} element={<HateCrimePage />} />
      <Route path={routes.report} element={<ReportPage />} />
      <Route path={routes.reporting} element={<ReportingGuidePage />} />
      <Route path={routes.blockMute} element={<BlockMutePage />} />
      <Route path={routes.appealSubmit} element={<AppealSubmitPage />} />
      <Route path={routes.appealOutcome} element={<AppealOutcomePage />} />
      <Route path={routes.safeSpaces} element={<SafeSpacesPage />} />
      {/* Branching detail page: a REMOVED space keeps its accountability
          narrative here (it isn't a live directory listing); a verified/live
          space redirects to the merged directory detail, whose trust section
          now renders inline (see DirectorySpacePage, Task 7). */}
      <Route
        path={`${routes.safeSpaces}/:slug`}
        element={<SafeSpaceDetailPage />}
      />
      <Route path="/safe-space/:slug" element={<SafeSpaceDetailPage />} />
    </>
  );
}
