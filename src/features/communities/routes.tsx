import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const CommunitiesHubPage = lazyNamed(
  () => import("./CommunitiesHubPage"),
  "CommunitiesHubPage",
);
const StartCommunityPage = lazyNamed(
  () => import("./startCommunity/StartCommunityPage"),
  "StartCommunityPage",
);
const CommunityDetailPage = lazyNamed(
  () => import("./CommunityDetailPage"),
  "CommunityDetailPage",
);

/** The merged community discovery + joined-communities hub, the
 *  start-a-community wizard, and a community's detail page. */
export function communitiesRoutes() {
  return (
    <>
      <Route path={routes.communities} element={<CommunitiesHubPage />} />
      <Route path={routes.startCommunity} element={<StartCommunityPage />} />
      <Route path="/community/:slug" element={<CommunityDetailPage />} />
    </>
  );
}
