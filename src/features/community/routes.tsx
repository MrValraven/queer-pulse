import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const DatingPage = lazyNamed(() => import("./DatingPage"), "DatingPage");
const ReadingGroupsPage = lazyNamed(() => import("./ReadingGroupsPage"), "ReadingGroupsPage");
const FamilyPage = lazyNamed(() => import("./FamilyPage"), "FamilyPage");
const CaregiversPage = lazyNamed(() => import("./CaregiversPage"), "CaregiversPage");
const ChangemakersPage = lazyNamed(() => import("./ChangemakersPage"), "ChangemakersPage");
const ChangemakerStoryPage = lazyNamed(() => import("./ChangemakerStoryPage"), "ChangemakerStoryPage");
const ComingOutPage = lazyNamed(() => import("./ComingOutPage"), "ComingOutPage");

/** Community pathways: dating, reading groups, family/caregivers,
 *  changemaker stories, and the coming-out guide. The creatives showcase was
 *  retired — its old URL 404s; make a creative subprofile instead. */
export function communityRoutes() {
  return (
    <>
      <Route path={routes.dating} element={<DatingPage />} />
      <Route path={routes.readingGroups} element={<ReadingGroupsPage />} />
      <Route path={routes.family} element={<FamilyPage />} />
      <Route path={routes.caregivers} element={<CaregiversPage />} />
      <Route path={routes.changemakers} element={<ChangemakersPage />} />
      <Route path="/changemaker/:slug" element={<ChangemakerStoryPage />} />
      <Route path={routes.comingOut} element={<ComingOutPage />} />
      <Route
        path={routes.parents}
        element={<Navigate to={routes.family} replace />}
      />
    </>
  );
}
