import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { MemberProfileRedirect } from "../../app/routes.redirects";
import { lazyNamed } from "../../app/routeHelpers";

const ProfilePage = lazyNamed(() => import("./ProfilePage"), "ProfilePage");
const MemberDirectoryFilterPage = lazyNamed(() => import("./MemberDirectoryFilterPage"), "MemberDirectoryFilterPage");
const SearchPage = lazyNamed(() => import("./SearchPage"), "SearchPage");
const PublicProfilePage = lazyNamed(() => import("./PublicProfilePage"), "PublicProfilePage");
const CollectionsPage = lazyNamed(() => import("./CollectionsPage"), "CollectionsPage");
const BadgesPage = lazyNamed(() => import("./BadgesPage"), "BadgesPage");
const PerksPage = lazyNamed(() => import("./PerksPage"), "PerksPage");
const DraftsPage = lazyNamed(() => import("./DraftsPage"), "DraftsPage");
const VouchPage = lazyNamed(() => import("./VouchPage"), "VouchPage");

/** Member directory, profiles, and the personal member surfaces (badges, perks,
 *  collections, drafts, vouch). */
export function memberRoutes() {
  return (
    <>
      <Route path={routes.members} element={<MemberDirectoryFilterPage />} />
      <Route path={routes.search} element={<SearchPage />} />
      <Route path={routes.accountProfile} element={<ProfilePage />} />
      <Route path={`${routes.members}/:slug`} element={<ProfilePage />} />
      <Route path="/profile/:slug" element={<MemberProfileRedirect />} />
      <Route path={routes.publicProfile} element={<PublicProfilePage />} />
      {/* The addressable public profile. Public by design — unlike
          /members/:slug, this one is reachable and indexable logged-out. */}
      <Route
        path={`${routes.publicProfile}/:slug`}
        element={<PublicProfilePage />}
      />
      <Route path={routes.badges} element={<BadgesPage />} />
      <Route path={routes.perks} element={<PerksPage />} />
      <Route path={routes.collections} element={<CollectionsPage />} />
      <Route path={routes.drafts} element={<DraftsPage />} />
      <Route path={routes.vouch} element={<VouchPage />} />
    </>
  );
}
