import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";
import { COMMUNITY_INVITATIONS_PATH } from "./communityInvitations.path";

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
const CommunityInvitationsPage = lazyNamed(
  () => import("./CommunityInvitationsPage"),
  "CommunityInvitationsPage",
  COMMUNITY_INVITATIONS_PATH,
);

/** The merged community discovery + joined-communities hub, the
 *  start-a-community wizard, a community's detail page, and the permalink for
 *  one post inside it (`communityPostPath`, SOC-02). The post route is nested
 *  under the community's own path on purpose: a post is only ever readable
 *  through the community that owns it, and the slug is what the permission
 *  check keys on.
 *
 *  The invitations shelf sits under `/communities/*` too, so it inherits the
 *  member-only gate `authGate.ts` already draws around that prefix: an
 *  invitation list is one of the most private things the app holds, since a
 *  `private` community's card reaches a non-member nowhere else. */
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
      <Route
        path={COMMUNITY_INVITATIONS_PATH}
        element={<CommunityInvitationsPage />}
      />
    </>
  );
}
