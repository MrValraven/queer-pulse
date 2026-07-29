import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const CommunitiesPage = lazyNamed(() => import("./CommunitiesPage"), "CommunitiesPage");
const CommunitiesHomePage = lazyNamed(() => import("./CommunitiesHomePage"), "CommunitiesHomePage");
const StartCommunityPage = lazyNamed(() => import("./startCommunity/StartCommunityPage"), "StartCommunityPage");
const CommunityDetailPage = lazyNamed(() => import("./CommunityDetailPage"), "CommunityDetailPage");

/** Community discovery, the joined-communities home, the start-a-community
 *  wizard, and a community's detail page. */
export function communitiesRoutes() {
  return (
    <>
      <Route path={routes.communities} element={<CommunitiesPage />} />
      <Route path={routes.communitiesHome} element={<CommunitiesHomePage />} />
      <Route path={routes.startCommunity} element={<StartCommunityPage />} />
      <Route path="/community/:slug" element={<CommunityDetailPage />} />
    </>
  );
}
