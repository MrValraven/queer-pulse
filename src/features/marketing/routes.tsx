import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { ParamRedirect } from "../../app/routes.redirects";
import { lazyNamed } from "../../app/routeHelpers";

const PrivacyPage = lazyNamed(() => import("./PrivacyPage"), "PrivacyPage");
const TermsPage = lazyNamed(() => import("./TermsPage"), "TermsPage");
const DsarPage = lazyNamed(() => import("./DsarPage"), "DsarPage");
// ID-15: the responsible-disclosure policy, moved off `/account/security` so
// that path can be the member's own security hub.
const SecurityPolicyPage = lazyNamed(
  () => import("./SecurityPolicyPage"),
  "SecurityPolicyPage",
);
const ConstitutionPage = lazyNamed(
  () => import("./ConstitutionPage"),
  "ConstitutionPage",
);
const CodeOfConductPage = lazyNamed(
  () => import("./CodeOfConductPage"),
  "CodeOfConductPage",
);
const ChangelogPage = lazyNamed(
  () => import("./ChangelogPage"),
  "ChangelogPage",
);
const RoadmapPage = lazyNamed(() => import("./RoadmapPage"), "RoadmapPage");
const PressArchivePage = lazyNamed(
  () => import("./PressArchivePage"),
  "PressArchivePage",
);
const ForOrganisationsPage = lazyNamed(
  () => import("./ForOrganisationsPage"),
  "ForOrganisationsPage",
);
const PressKitPage = lazyNamed(() => import("./PressKitPage"), "PressKitPage");
const GuidelinesPage = lazyNamed(
  () => import("./GuidelinesPage"),
  "GuidelinesPage",
);
const AboutPage = lazyNamed(() => import("./AboutPage"), "AboutPage");
const ContactPage = lazyNamed(() => import("./ContactPage"), "ContactPage");
const HelpPage = lazyNamed(() => import("./HelpPage"), "HelpPage");
const VolunteerPage = lazyNamed(
  () => import("./VolunteerPage"),
  "VolunteerPage",
);
const VolunteerOpportunityPage = lazyNamed(
  () => import("./VolunteerOpportunityPage"),
  "VolunteerOpportunityPage",
);
const PostVolunteerOpportunityPage = lazyNamed(
  () => import("./PostVolunteerOpportunityPage"),
  "PostVolunteerOpportunityPage",
);
const VolunteerApplicantsDashboardPage = lazyNamed(
  () => import("./VolunteerApplicantsDashboardPage"),
  "VolunteerApplicantsDashboardPage",
);
const DirectoryPage = lazyNamed(
  () => import("./DirectoryPage"),
  "DirectoryPage",
);
const DirectorySpacePage = lazyNamed(
  () => import("./DirectorySpacePage"),
  "DirectorySpacePage",
);
const VenueDetailPage = lazyNamed(
  () => import("./VenueDetailPage"),
  "VenueDetailPage",
);
const ListBusinessPage = lazyNamed(
  () => import("./listBusiness/ListBusinessPage"),
  "ListBusinessPage",
);
const ResourceLibraryPage = lazyNamed(
  () => import("./ResourceLibraryPage"),
  "ResourceLibraryPage",
);
const PartnersPage = lazyNamed(() => import("./PartnersPage"), "PartnersPage");
const SubmitPartnerApplicationPage = lazyNamed(
  () => import("./SubmitPartnerApplicationPage"),
  "SubmitPartnerApplicationPage",
);
const PartnerDetailPage = lazyNamed(
  () => import("./PartnerDetailPage"),
  "PartnerDetailPage",
);
const ActivismPage = lazyNamed(() => import("./ActivismPage"), "ActivismPage");
const PlatformsPage = lazyNamed(
  () => import("./PlatformsPage"),
  "PlatformsPage",
);
const VisasPage = lazyNamed(() => import("./VisasPage"), "VisasPage");
const ArrivingPage = lazyNamed(() => import("./ArrivingPage"), "ArrivingPage");
const CookiesPage = lazyNamed(() => import("./CookiesPage"), "CookiesPage");
const ImprintPage = lazyNamed(() => import("./ImprintPage"), "ImprintPage");

/** Marketing, policy, roadmap/press, about/help/volunteer, partners, activism,
 *  and the public "local" surfaces (visas/arriving/directory/business listing). */
export function marketingRoutes() {
  return (
    <>
      {/* Roadmap, press & policies */}
      <Route path={routes.changelog} element={<ChangelogPage />} />
      <Route path={routes.roadmap} element={<RoadmapPage />} />
      <Route path={routes.pressArchive} element={<PressArchivePage />} />
      <Route
        path={routes.forOrganisations}
        element={<ForOrganisationsPage />}
      />
      <Route path={routes.pressKit} element={<PressKitPage />} />
      <Route path={routes.privacy} element={<PrivacyPage />} />
      <Route path={routes.terms} element={<TermsPage />} />
      <Route path={routes.dsar} element={<DsarPage />} />
      <Route path={routes.cookies} element={<CookiesPage />} />
      <Route path={routes.policiesSecurity} element={<SecurityPolicyPage />} />
      <Route path={routes.imprint} element={<ImprintPage />} />
      <Route path={routes.constitution} element={<ConstitutionPage />} />
      <Route path={routes.codeOfConduct} element={<CodeOfConductPage />} />
      <Route path={routes.guidelines} element={<GuidelinesPage />} />

      {/* Marketing / content */}
      <Route path={routes.about} element={<AboutPage />} />
      <Route path={routes.contact} element={<ContactPage />} />
      <Route path={routes.help} element={<HelpPage />} />
      <Route path={routes.volunteer} element={<VolunteerPage />} />
      <Route
        path={routes.postVolunteer}
        element={<PostVolunteerOpportunityPage />}
      />
      <Route
        path={routes.editVolunteer}
        element={<PostVolunteerOpportunityPage />}
      />
      <Route
        path={routes.manageVolunteerApplicants}
        element={<VolunteerApplicantsDashboardPage />}
      />
      <Route
        path="/about/volunteer/opportunity/:slug"
        element={<VolunteerOpportunityPage />}
      />
      <Route path={routes.platforms} element={<PlatformsPage />} />
      <Route path={routes.partners} element={<PartnersPage />} />
      <Route
        path={routes.partnerApply}
        element={<SubmitPartnerApplicationPage />}
      />
      <Route
        path={`${routes.partners}/:slug`}
        element={<PartnerDetailPage />}
      />
      <Route path={routes.resources} element={<ResourceLibraryPage />} />
      <Route path={routes.activism} element={<ActivismPage />} />
      <Route
        path="/volunteer-opportunity/:slug"
        element={
          <ParamRedirect
            build={(p) => `/about/volunteer/opportunity/${p.slug ?? ""}`}
          />
        }
      />
      <Route
        path="/partner/:slug"
        element={
          <ParamRedirect build={(p) => `/about/partners/${p.slug ?? ""}`} />
        }
      />

      {/* Local — visas/arriving/directory/business listing (safe-spaces live in
          the safety feature) */}
      <Route path={routes.visas} element={<VisasPage />} />
      <Route path={routes.arriving} element={<ArrivingPage />} />
      <Route
        path={routes.map}
        element={<Navigate to={routes.directory} replace />}
      />
      <Route path={routes.directory} element={<DirectoryPage />} />
      <Route path={routes.listBusiness} element={<ListBusinessPage />} />
      {/* Owner "edit listing" flow reuses ListBusinessPage as a create/edit
          gate that reads :ref. More static segments than `:slug` below, so
          react-router's route ranking resolves it correctly regardless of
          declaration order. */}
      <Route path={routes.listBusinessEdit} element={<ListBusinessPage />} />
      <Route path={`${routes.venue}/:id`} element={<VenueDetailPage />} />
      <Route
        path={`${routes.directory}/:slug`}
        element={<DirectorySpacePage />}
      />
      <Route
        path="/space/:slug"
        element={
          <ParamRedirect build={(p) => `/local/directory/${p.slug ?? ""}`} />
        }
      />
    </>
  );
}
