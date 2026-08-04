import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const AdminDashboardPage = lazyNamed(() => import("./AdminDashboardPage"), "AdminDashboardPage");
const AdminModerationPage = lazyNamed(() => import("./AdminModerationPage"), "AdminModerationPage");
const AdminMembersPage = lazyNamed(() => import("./AdminMembersPage"), "AdminMembersPage");
const AdminBotsPage = lazyNamed(() => import("./AdminBotsPage"), "AdminBotsPage");
const AdminSafeSpacesPage = lazyNamed(() => import("./AdminSafeSpacesPage"), "AdminSafeSpacesPage");
const AdminListingsPage = lazyNamed(() => import("./AdminListingsPage"), "AdminListingsPage");
const AdminInvitesPage = lazyNamed(() => import("./AdminInvitesPage"), "AdminInvitesPage");
const AdminChangemakersPage = lazyNamed(() => import("./AdminChangemakersPage"), "AdminChangemakersPage");
const AdminChangemakerNominationsPage = lazyNamed(() => import("./AdminChangemakerNominationsPage"), "AdminChangemakerNominationsPage");
const AdminCommissionInterestsPage = lazyNamed(() => import("./AdminCommissionInterestsPage"), "AdminCommissionInterestsPage");
const AdminReadingGroupProposalsPage = lazyNamed(() => import("./AdminReadingGroupProposalsPage"), "AdminReadingGroupProposalsPage");
const AdminMagazineSubmissionsPage = lazyNamed(() => import("./AdminMagazineSubmissionsPage"), "AdminMagazineSubmissionsPage");
const AdminCommunitiesPage = lazyNamed(() => import("./AdminCommunitiesPage"), "AdminCommunitiesPage");
const AdminCommunityModPage = lazyNamed(() => import("./AdminCommunityModPage"), "AdminCommunityModPage");
const AdminGovernancePage = lazyNamed(() => import("./AdminGovernancePage"), "AdminGovernancePage");
const AdminRoadmapPage = lazyNamed(() => import("./AdminRoadmapPage"), "AdminRoadmapPage");
const ModPanelPage = lazyNamed(() => import("./ModPanelPage"), "ModPanelPage");
const AdminPartnerApplicationsPage = lazyNamed(() => import("./AdminPartnerApplicationsPage"), "AdminPartnerApplicationsPage");
const AdminHousingCoopsPage = lazyNamed(() => import("./AdminHousingCoopsPage"), "AdminHousingCoopsPage");
const AdminOrgTiersPage = lazyNamed(() => import("./AdminOrgTiersPage"), "AdminOrgTiersPage");
const AdminSettingsPage = lazyNamed(() => import("./AdminSettingsPage"), "AdminSettingsPage");

/** The admin & moderation panels (role-gated in authGate.ts). */
export function adminRoutes() {
  return (
    <>
      <Route path={routes.admin} element={<AdminDashboardPage />} />
      <Route path={routes.adminModeration} element={<AdminModerationPage />} />
      <Route path={routes.adminMembers} element={<AdminMembersPage />} />
      <Route path={routes.adminBots} element={<AdminBotsPage />} />
      <Route path={routes.adminSafeSpaces} element={<AdminSafeSpacesPage />} />
      <Route path={routes.adminListings} element={<AdminListingsPage />} />
      <Route path={routes.adminInvites} element={<AdminInvitesPage />} />
      <Route
        path={routes.adminChangemakers}
        element={<AdminChangemakersPage />}
      />
      <Route
        path={routes.adminChangemakerNominations}
        element={<AdminChangemakerNominationsPage />}
      />
      <Route
        path={routes.adminCommissionInterests}
        element={<AdminCommissionInterestsPage />}
      />
      <Route
        path={routes.adminReadingGroupProposals}
        element={<AdminReadingGroupProposalsPage />}
      />
      <Route
        path={routes.adminMagazineSubmissions}
        element={<AdminMagazineSubmissionsPage />}
      />
      <Route
        path={routes.adminCommunities}
        element={<AdminCommunitiesPage />}
      />
      <Route
        path={routes.adminPartnerApplications}
        element={<AdminPartnerApplicationsPage />}
      />
      <Route
        path={routes.adminHousingCoops}
        element={<AdminHousingCoopsPage />}
      />
      <Route path={routes.adminOrgTiers} element={<AdminOrgTiersPage />} />
      <Route path={routes.adminGovernance} element={<AdminGovernancePage />} />
      <Route path={routes.adminRoadmap} element={<AdminRoadmapPage />} />
      <Route path={routes.adminSettings} element={<AdminSettingsPage />} />
      <Route
        path={`${routes.adminCommunities}/:slug/mod`}
        element={<AdminCommunityModPage />}
      />
      <Route path="/mod/:slug" element={<ModPanelPage />} />
    </>
  );
}
