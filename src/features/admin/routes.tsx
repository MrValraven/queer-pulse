import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const TopicsAdminPage = lazyNamed(
  () => import("./TopicsAdminPage"),
  "TopicsAdminPage",
);
const AdminDashboardPage = lazyNamed(
  () => import("./AdminDashboardPage"),
  "AdminDashboardPage",
);
const AdminModerationPage = lazyNamed(
  () => import("./AdminModerationPage"),
  "AdminModerationPage",
);
const AdminResponseTemplatesPage = lazyNamed(
  () => import("./AdminResponseTemplatesPage"),
  "AdminResponseTemplatesPage",
);
const AdminConcernsPage = lazyNamed(
  () => import("./AdminConcernsPage"),
  "AdminConcernsPage",
);
const AdminIntakesPage = lazyNamed(
  () => import("./AdminIntakesPage"),
  "AdminIntakesPage",
);
const AdminDsarPage = lazyNamed(
  () => import("./AdminDsarPage"),
  "AdminDsarPage",
);
const AdminMembersPage = lazyNamed(
  () => import("./AdminMembersPage"),
  "AdminMembersPage",
);
const AdminJoinRequestsPage = lazyNamed(
  () => import("./AdminJoinRequestsPage"),
  "AdminJoinRequestsPage",
);
const AdminStaffPage = lazyNamed(
  () => import("./AdminStaffPage"),
  "AdminStaffPage",
);
const AdminBotsPage = lazyNamed(
  () => import("./AdminBotsPage"),
  "AdminBotsPage",
);
const AdminSafeSpacesPage = lazyNamed(
  () => import("./AdminSafeSpacesPage"),
  "AdminSafeSpacesPage",
);
const AdminListingsPage = lazyNamed(
  () => import("./AdminListingsPage"),
  "AdminListingsPage",
);
const AdminMediaPage = lazyNamed(
  () => import("./AdminMediaPage"),
  "AdminMediaPage",
);
const AdminInvitesPage = lazyNamed(
  () => import("./AdminInvitesPage"),
  "AdminInvitesPage",
);
const AdminChangemakersPage = lazyNamed(
  () => import("./AdminChangemakersPage"),
  "AdminChangemakersPage",
);
const AdminChangemakerNominationsPage = lazyNamed(
  () => import("./AdminChangemakerNominationsPage"),
  "AdminChangemakerNominationsPage",
);
const AdminCommissionInterestsPage = lazyNamed(
  () => import("./AdminCommissionInterestsPage"),
  "AdminCommissionInterestsPage",
);
const AdminReadingGroupProposalsPage = lazyNamed(
  () => import("./AdminReadingGroupProposalsPage"),
  "AdminReadingGroupProposalsPage",
);
const AdminVolunteerHoursPage = lazyNamed(
  () => import("./AdminVolunteerHoursPage"),
  "AdminVolunteerHoursPage",
);
const AdminGuideFeedbackPage = lazyNamed(
  () => import("./AdminGuideFeedbackPage"),
  "AdminGuideFeedbackPage",
);
const AdminMagazineSubmissionsPage = lazyNamed(
  () => import("./AdminMagazineSubmissionsPage"),
  "AdminMagazineSubmissionsPage",
);
const AdminWriterApplicationsPage = lazyNamed(
  () => import("./AdminWriterApplicationsPage"),
  "AdminWriterApplicationsPage",
);
const AdminCommunitiesPage = lazyNamed(
  () => import("./AdminCommunitiesPage"),
  "AdminCommunitiesPage",
);
const AdminCommunityTagRequestsPage = lazyNamed(
  () => import("./AdminCommunityTagRequestsPage"),
  "AdminCommunityTagRequestsPage",
);
const AdminLandingPage = lazyNamed(
  () => import("./AdminLandingPage"),
  "AdminLandingPage",
);
const AdminPressKitPage = lazyNamed(
  () => import("./AdminPressKitPage"),
  "AdminPressKitPage",
);
const AdminCommunityModPage = lazyNamed(
  () => import("./AdminCommunityModPage"),
  "AdminCommunityModPage",
);
const AdminGovernancePage = lazyNamed(
  () => import("./AdminGovernancePage"),
  "AdminGovernancePage",
);
const AdminRoadmapPage = lazyNamed(
  () => import("./AdminRoadmapPage"),
  "AdminRoadmapPage",
);
const ModPanelPage = lazyNamed(() => import("./ModPanelPage"), "ModPanelPage");
const AdminPartnerApplicationsPage = lazyNamed(
  () => import("./AdminPartnerApplicationsPage"),
  "AdminPartnerApplicationsPage",
);
const AdminHousingCoopsPage = lazyNamed(
  () => import("./AdminHousingCoopsPage"),
  "AdminHousingCoopsPage",
);
const AdminHousingGroupsPage = lazyNamed(
  () => import("./AdminHousingGroupsPage"),
  "AdminHousingGroupsPage",
);
const AdminHousingListingsPage = lazyNamed(
  () => import("./AdminHousingListingsPage"),
  "AdminHousingListingsPage",
);
const AdminHousingGroupListingsPage = lazyNamed(
  () => import("./AdminHousingGroupListingsPage"),
  "AdminHousingGroupListingsPage",
);
const AdminLandlordsPage = lazyNamed(
  () => import("./AdminLandlordsPage"),
  "AdminLandlordsPage",
);
const AdminVerificationsPage = lazyNamed(
  () => import("./AdminVerificationsPage"),
  "AdminVerificationsPage",
);
const AdminOrgTiersPage = lazyNamed(
  () => import("./AdminOrgTiersPage"),
  "AdminOrgTiersPage",
);
const AdminResourceListingsPage = lazyNamed(
  () => import("./AdminResourceListingsPage"),
  "AdminResourceListingsPage",
);
const AdminResourceGuidesPage = lazyNamed(
  () => import("./AdminResourceGuidesPage"),
  "AdminResourceGuidesPage",
);
const AdminResourceSuggestionsPage = lazyNamed(
  () => import("./AdminResourceSuggestionsPage"),
  "AdminResourceSuggestionsPage",
);
const AdminSettingsPage = lazyNamed(
  () => import("./AdminSettingsPage"),
  "AdminSettingsPage",
);
const AdminReportsPage = lazyNamed(
  () => import("./AdminReportsPage"),
  "AdminReportsPage",
);
const AdminStatusIncidentsPage = lazyNamed(
  () => import("./AdminStatusIncidentsPage"),
  "AdminStatusIncidentsPage",
);

/** The admin & moderation panels (role-gated in authGate.ts). */
export function adminRoutes() {
  return (
    <>
      <Route path={routes.admin} element={<AdminDashboardPage />} />
      <Route path={routes.adminModeration} element={<AdminModerationPage />} />
      <Route
        path={routes.adminModResponseTemplates}
        element={<AdminResponseTemplatesPage />}
      />
      <Route path={routes.adminConcerns} element={<AdminConcernsPage />} />
      <Route path={routes.adminIntakes} element={<AdminIntakesPage />} />
      <Route path={routes.adminDsar} element={<AdminDsarPage />} />
      <Route path={routes.adminMembers} element={<AdminMembersPage />} />
      <Route
        path={routes.adminJoinRequests}
        element={<AdminJoinRequestsPage />}
      />
      <Route path={routes.adminStaff} element={<AdminStaffPage />} />
      <Route path={routes.adminBots} element={<AdminBotsPage />} />
      <Route path={routes.adminSafeSpaces} element={<AdminSafeSpacesPage />} />
      <Route path={routes.adminListings} element={<AdminListingsPage />} />
      <Route path={routes.adminMedia} element={<AdminMediaPage />} />
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
        path={routes.adminGuideFeedback}
        element={<AdminGuideFeedbackPage />}
      />
      <Route
        path={routes.adminMagazineSubmissions}
        element={<AdminMagazineSubmissionsPage />}
      />
      <Route
        path={routes.adminWriterApplications}
        element={<AdminWriterApplicationsPage />}
      />
      <Route
        path={routes.adminCommunities}
        element={<AdminCommunitiesPage />}
      />
      {/* SOC-01: the topic directory has real rows now (seeded by migration),
          so staff need somewhere to curate them. */}
      <Route path={routes.adminTopics} element={<TopicsAdminPage />} />
      <Route
        path={routes.adminCommunityTagRequests}
        element={<AdminCommunityTagRequestsPage />}
      />
      <Route path={routes.adminLanding} element={<AdminLandingPage />} />
      <Route path={routes.adminPressKit} element={<AdminPressKitPage />} />
      <Route
        path={routes.adminPartnerApplications}
        element={<AdminPartnerApplicationsPage />}
      />
      <Route
        path={routes.adminHousingCoops}
        element={<AdminHousingCoopsPage />}
      />
      <Route
        path={routes.adminHousingGroups}
        element={<AdminHousingGroupsPage />}
      />
      <Route
        path={routes.adminHousingListings}
        element={<AdminHousingListingsPage />}
      />
      <Route
        path={routes.adminHousingGroupListings}
        element={<AdminHousingGroupListingsPage />}
      />
      <Route path={routes.adminLandlords} element={<AdminLandlordsPage />} />
      <Route
        path={routes.adminVerifications}
        element={<AdminVerificationsPage />}
      />
      <Route path={routes.adminOrgTiers} element={<AdminOrgTiersPage />} />
      <Route
        path={routes.adminResourceGuides}
        element={<AdminResourceGuidesPage />}
      />
      <Route
        path={routes.adminResourceListings}
        element={<AdminResourceListingsPage />}
      />
      <Route
        path={routes.adminResourceSuggestions}
        element={<AdminResourceSuggestionsPage />}
      />
      <Route path={routes.adminGovernance} element={<AdminGovernancePage />} />
      <Route path={routes.adminRoadmap} element={<AdminRoadmapPage />} />
      <Route path={routes.adminSettings} element={<AdminSettingsPage />} />
      <Route path={routes.adminReports} element={<AdminReportsPage />} />
      {/* SUS-05: the volunteer-hours report, filed beside Reports because it
          is the same kind of surface — figures the team can show a partner. */}
      <Route
        path={routes.adminVolunteerHours}
        element={<AdminVolunteerHoursPage />}
      />
      <Route
        path={routes.adminStatusIncidents}
        element={<AdminStatusIncidentsPage />}
      />
      <Route
        path={`${routes.adminCommunities}/:slug/mod`}
        element={<AdminCommunityModPage />}
      />
      <Route path="/mod/:slug" element={<ModPanelPage />} />
    </>
  );
}
