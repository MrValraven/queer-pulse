import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { ParamRedirect } from "../../app/routes.redirects";
import { lazyNamed } from "../../app/routeHelpers";
import { MY_HOUSING_LISTINGS_PATH } from "./housing.data";
import { MY_BARTER_PROPOSALS_PATH } from "./barterProposals.paths";

const JobsPage = lazyNamed(() => import("./JobsPage"), "JobsPage");
const JobDetailPage = lazyNamed(
  () => import("./JobDetailPage"),
  "JobDetailPage",
);
const CompanyPage = lazyNamed(() => import("./CompanyPage"), "CompanyPage");
const PostJobPage = lazyNamed(() => import("./PostJobPage"), "PostJobPage");
const JobApplyPage = lazyNamed(() => import("./JobApplyPage"), "JobApplyPage");
const JobApplicationsPage = lazyNamed(
  () => import("./JobApplicationsPage"),
  "JobApplicationsPage",
);
const HousingPage = lazyNamed(() => import("./HousingPage"), "HousingPage");
const HousingCoopPage = lazyNamed(
  () => import("./HousingCoopPage"),
  "HousingCoopPage",
);
const CoopTemplatePage = lazyNamed(
  () => import("./CoopTemplatePage"),
  "CoopTemplatePage",
);
const HousingTenantRightsPage = lazyNamed(
  () => import("./HousingTenantRightsPage"),
  "HousingTenantRightsPage",
);
const HousingGroupsPage = lazyNamed(
  () => import("./HousingGroupsPage"),
  "HousingGroupsPage",
);
const HousingGroupDetailPage = lazyNamed(
  () => import("./HousingGroupDetailPage"),
  "HousingGroupDetailPage",
);
const HousingListingPage = lazyNamed(
  () => import("./HousingListingPage"),
  "HousingListingPage",
);
const MyHousingListingsPage = lazyNamed(
  () => import("./MyHousingListingsPage"),
  "MyHousingListingsPage",
);
const HousingViewingsPage = lazyNamed(
  () => import("./HousingViewingsPage"),
  "HousingViewingsPage",
);
const LandlordPage = lazyNamed(() => import("./LandlordPage"), "LandlordPage");
const GrantsPage = lazyNamed(() => import("./GrantsPage"), "GrantsPage");
const BarterPage = lazyNamed(() => import("./BarterPage"), "BarterPage");
const BarterDetailPage = lazyNamed(
  () => import("./BarterDetailPage"),
  "BarterDetailPage",
);
const BarterProposalsPage = lazyNamed(
  () => import("./BarterProposalsPage"),
  "BarterProposalsPage",
);
const OfferPage = lazyNamed(() => import("./OfferPage"), "OfferPage");
const EmployerReviewsPage = lazyNamed(
  () => import("./EmployerReviewsPage"),
  "EmployerReviewsPage",
);
const ApplicationStatusPage = lazyNamed(
  () => import("./ApplicationStatusPage"),
  "ApplicationStatusPage",
);
const MentorshipPage = lazyNamed(
  () => import("./MentorshipPage"),
  "MentorshipPage",
);
const MentorDetailPage = lazyNamed(
  () => import("./MentorDetailPage"),
  "MentorDetailPage",
);
const EconomyPage = lazyNamed(() => import("./EconomyPage"), "EconomyPage");
const InvoiceGeneratorPage = lazyNamed(
  () => import("./InvoiceGeneratorPage"),
  "InvoiceGeneratorPage",
);
const ContractGeneratorPage = lazyNamed(
  () => import("./ContractGeneratorPage"),
  "ContractGeneratorPage",
);
const ScopeGeneratorPage = lazyNamed(
  () => import("./ScopeGeneratorPage"),
  "ScopeGeneratorPage",
);
const ReciboVerdeGuidePage = lazyNamed(
  () => import("./ReciboVerdeGuidePage"),
  "ReciboVerdeGuidePage",
);
const TakeHomeCalculatorPage = lazyNamed(
  () => import("./TakeHomeCalculatorPage"),
  "TakeHomeCalculatorPage",
);
const IvaTrackerPage = lazyNamed(
  () => import("./IvaTrackerPage"),
  "IvaTrackerPage",
);
const SetAsidePlannerPage = lazyNamed(
  () => import("./SetAsidePlannerPage"),
  "SetAsidePlannerPage",
);
const DayRateCalculatorPage = lazyNamed(
  () => import("./DayRateCalculatorPage"),
  "DayRateCalculatorPage",
);
const RateBoardPage = lazyNamed(
  () => import("./RateBoardPage"),
  "RateBoardPage",
);
const SlidingScalePage = lazyNamed(
  () => import("./SlidingScalePage"),
  "SlidingScalePage",
);
const ComparatorPage = lazyNamed(
  () => import("./ComparatorPage"),
  "ComparatorPage",
);
const SolidarityPage = lazyNamed(
  () => import("./SolidarityPage"),
  "SolidarityPage",
);
const WorkHubPage = lazyNamed(() => import("./WorkHubPage"), "WorkHubPage");
const WorkProfilePage = lazyNamed(
  () => import("./WorkProfilePage"),
  "WorkProfilePage",
);

/** Jobs, housing, mentorship, grants/barter, the freelance calculators, the
 *  solidarity fund, and the member's work hub + work profile. */
export function economyRoutes() {
  return (
    <>
      <Route path={routes.jobs} element={<JobsPage />} />
      <Route path={routes.postJob} element={<PostJobPage />} />
      <Route path={`${routes.jobs}/:slug`} element={<JobDetailPage />} />
      <Route path={`${routes.jobs}/:slug/apply`} element={<JobApplyPage />} />
      {/* Poster-side applications console (BE-HSG-16). Static `applications`
          segment under the job slug, matching the backend's own route shape. */}
      <Route
        path={`${routes.jobs}/:slug/applications`}
        element={<JobApplicationsPage />}
      />
      <Route path={`${routes.company}/:slug`} element={<CompanyPage />} />
      <Route path={routes.housing} element={<HousingPage />} />
      {/* Static segments registered before the `:slug` catch so they always win. */}
      <Route path={routes.housingViewings} element={<HousingViewingsPage />} />
      <Route
        path={MY_HOUSING_LISTINGS_PATH}
        element={<MyHousingListingsPage />}
      />
      <Route
        path={`${routes.housing}/:slug`}
        element={<HousingListingPage />}
      />
      <Route path="/work/landlord/:slug" element={<LandlordPage />} />
      <Route path={routes.housingCoop} element={<HousingCoopPage />} />
      <Route
        path={`${routes.housingCoop}/templates/:slug`}
        element={<CoopTemplatePage />}
      />
      <Route path={routes.tenantRights} element={<HousingTenantRightsPage />} />
      <Route path={routes.housingGroups} element={<HousingGroupsPage />} />
      <Route
        path={`${routes.housingGroups}/:slug`}
        element={<HousingGroupDetailPage />}
      />
      <Route
        path="/work/housing/:slug"
        element={
          <ParamRedirect build={(p) => `/local/housing/${p.slug ?? ""}`} />
        }
      />
      <Route path={routes.grants} element={<GrantsPage />} />
      <Route path={routes.barter} element={<BarterPage />} />
      {/* Owner-side proposal inbox. Static segment declared before the `:id`
          catch so a listing id can never swallow it. */}
      <Route
        path={MY_BARTER_PROPOSALS_PATH}
        element={<BarterProposalsPage />}
      />
      <Route path={`${routes.barter}/:id`} element={<BarterDetailPage />} />
      <Route path={routes.offer} element={<OfferPage />} />
      <Route path={routes.employerReviews} element={<EmployerReviewsPage />} />
      <Route
        path={routes.applicationStatus}
        element={<ApplicationStatusPage />}
      />
      <Route path={routes.mentorship} element={<MentorshipPage />} />
      <Route
        path={`${routes.mentorship}/:slug`}
        element={<MentorDetailPage />}
      />
      <Route
        path="/jobs/:slug"
        element={<ParamRedirect build={(p) => `/work/jobs/${p.slug ?? ""}`} />}
      />
      <Route
        path="/housing/:slug"
        element={
          <ParamRedirect build={(p) => `/local/housing/${p.slug ?? ""}`} />
        }
      />
      <Route
        path="/landlord/:slug"
        element={
          <ParamRedirect build={(p) => `/work/landlord/${p.slug ?? ""}`} />
        }
      />
      <Route
        path="/barter/:id"
        element={<ParamRedirect build={(p) => `/work/barter/${p.id ?? ""}`} />}
      />
      <Route
        path="/mentorship/:slug"
        element={
          <ParamRedirect build={(p) => `/work/mentorship/${p.slug ?? ""}`} />
        }
      />
      <Route path={routes.economy} element={<EconomyPage />} />
      <Route path={routes.invoiceTool} element={<InvoiceGeneratorPage />} />
      <Route path={routes.contractTool} element={<ContractGeneratorPage />} />
      <Route path={routes.scopeTool} element={<ScopeGeneratorPage />} />
      <Route
        path={routes.reciboVerdeGuide}
        element={<ReciboVerdeGuidePage />}
      />
      <Route path={routes.takeHomeTool} element={<TakeHomeCalculatorPage />} />
      <Route path={routes.ivaTracker} element={<IvaTrackerPage />} />
      <Route path={routes.setAsideTool} element={<SetAsidePlannerPage />} />
      <Route path={routes.dayRateTool} element={<DayRateCalculatorPage />} />
      <Route path={routes.rateBoard} element={<RateBoardPage />} />
      <Route path={routes.slidingScaleTool} element={<SlidingScalePage />} />
      <Route path={routes.comparatorTool} element={<ComparatorPage />} />

      {/* Flatmates merged into the Housing board as a tab. */}
      <Route
        path={routes.flatmates}
        element={<Navigate to={`${routes.housing}?tab=flatmates`} replace />}
      />
      <Route path={routes.solidarity} element={<SolidarityPage />} />

      {/* Member work surfaces under /account. */}
      <Route path={routes.work} element={<WorkHubPage />} />
      <Route path={routes.workProfile} element={<WorkProfilePage />} />
    </>
  );
}
