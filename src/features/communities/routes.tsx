import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const CommunitiesHubPage = lazyNamed(
  () => import("./CommunitiesHubPage"),
  "CommunitiesHubPage",
  routes.communities,
);
const StartCommunityPage = lazyNamed(
  () => import("./startCommunity/StartCommunityPage"),
  "StartCommunityPage",
);
const CommunityDetailPage = lazyNamed(
  () => import("./CommunityDetailPage"),
  "CommunityDetailPage",
  "/community/:slug",
);
const CommunityPostPage = lazyNamed(
  () => import("./CommunityPostPage"),
  "CommunityPostPage",
);

/** The merged community discovery + joined-communities hub, the
 *  start-a-community wizard, a community's detail page, and the permalink for
 *  one post inside it (`communityPostPath`, SOC-02). The post route is nested
 *  under the community's own path on purpose: a post is only ever readable
 *  through the community that owns it, and the slug is what the permission
 *  check keys on. */
export function communitiesRoutes() {
  return (
    <>
      <Route path={routes.communities} element={<CommunitiesHubPage />} />
      <Route path={routes.startCommunity} element={<StartCommunityPage />} />
      <Route path="/community/:slug" element={<CommunityDetailPage />} />
      <Route
        path="/community/:slug/post/:postId"
        element={<CommunityPostPage />}
      />
    </>
  );
}
