import type { ComponentType } from "react";
import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";
import { ManagedGuide } from "./ManagedGuide";

const GuideIndexPage = lazyNamed(
  () => import("./GuideIndexPage"),
  "GuideIndexPage",
);
const ResourceGuidePage = lazyNamed(
  () => import("./ResourceGuidePage"),
  "ResourceGuidePage",
);

const WellbeingPage = lazyNamed(
  () => import("./WellbeingPage"),
  "WellbeingPage",
);
const MentalHealthPage = lazyNamed(
  () => import("./MentalHealthPage"),
  "MentalHealthPage",
);
const TransHealthcarePage = lazyNamed(
  () => import("./TransHealthcarePage"),
  "TransHealthcarePage",
);
const HarmReductionPage = lazyNamed(
  () => import("./HarmReductionPage"),
  "HarmReductionPage",
);
const SexualHealthPage = lazyNamed(
  () => import("./SexualHealthPage"),
  "SexualHealthPage",
);
const SoberPage = lazyNamed(() => import("./SoberPage"), "SoberPage");
const Queer101Page = lazyNamed(() => import("./Queer101Page"), "Queer101Page");
const GlossaryPage = lazyNamed(() => import("./GlossaryPage"), "GlossaryPage");
const MicroGrantsPage = lazyNamed(
  () => import("./MicroGrantsPage"),
  "MicroGrantsPage",
);
const IntersectionalityPage = lazyNamed(
  () => import("./IntersectionalityPage"),
  "IntersectionalityPage",
);
const TransHubPage = lazyNamed(() => import("./TransHubPage"), "TransHubPage");
const LegalPage = lazyNamed(() => import("./LegalPage"), "LegalPage");
const SafetyPage = lazyNamed(() => import("./SafetyPage"), "SafetyPage");
const PronounsGuidePage = lazyNamed(
  () => import("./PronounsGuidePage"),
  "PronounsGuidePage",
);
const RunningGuidePage = lazyNamed(
  () => import("./RunningGuidePage"),
  "RunningGuidePage",
);
const AccessibleLisbonPage = lazyNamed(
  () => import("./AccessibleLisbonPage"),
  "AccessibleLisbonPage",
);
const PeerSupportPage = lazyNamed(
  () => import("./PeerSupportPage"),
  "PeerSupportPage",
);
const ArtCritGuidePage = lazyNamed(
  () => import("./ArtCritGuidePage"),
  "ArtCritGuidePage",
);
const SharedEquipmentPage = lazyNamed(
  () => import("./SharedEquipmentPage"),
  "SharedEquipmentPage",
);
const GroupShowArchivePage = lazyNamed(
  () => import("./GroupShowArchivePage"),
  "GroupShowArchivePage",
);
const FirstMeetupGuidePage = lazyNamed(
  () => import("./FirstMeetupGuidePage"),
  "FirstMeetupGuidePage",
);
const QueerPaediatriciansPage = lazyNamed(
  () => import("./QueerPaediatriciansPage"),
  "QueerPaediatriciansPage",
);
const SchoolFormsGuidePage = lazyNamed(
  () => import("./SchoolFormsGuidePage"),
  "SchoolFormsGuidePage",
);
const CommunityPrivacyPage = lazyNamed(
  () => import("./CommunityPrivacyPage"),
  "CommunityPrivacyPage",
);
const ComingOutAtWorkPage = lazyNamed(
  () => import("./ComingOutAtWorkPage"),
  "ComingOutAtWorkPage",
);
const LgbtqAgingGuidePage = lazyNamed(
  () => import("./LgbtqAgingGuidePage"),
  "LgbtqAgingGuidePage",
);
const OralHistoryProjectPage = lazyNamed(
  () => import("./OralHistoryProjectPage"),
  "OralHistoryProjectPage",
);
const IngredientsMapPage = lazyNamed(
  () => import("./IngredientsMapPage"),
  "IngredientsMapPage",
);
const QtipocOrganisationsPage = lazyNamed(
  () => import("./QtipocOrganisationsPage"),
  "QtipocOrganisationsPage",
);
const QtipocArchivePage = lazyNamed(
  () => import("./QtipocArchivePage"),
  "QtipocArchivePage",
);
const DisabilityHealthcarePage = lazyNamed(
  () => import("./DisabilityHealthcarePage"),
  "DisabilityHealthcarePage",
);
const SpoonTheoryPage = lazyNamed(
  () => import("./SpoonTheoryPage"),
  "SpoonTheoryPage",
);

/**
 * Every guide route, paired with the `resources.slug` its database row uses.
 *
 * Each one renders through `ManagedGuide`, which serves the guide from the
 * database once an editor has taken it over and otherwise falls through to
 * the hardcoded page below. Keeping the pairing in one table rather than 31
 * hand-written `<Route>` blocks is what lets the review footer and the
 * managed-body lookup reach every guide from a single place.
 */
const GUIDE_ROUTES: { path: string; slug: string; Page: ComponentType }[] = [
  { path: routes.wellbeing, slug: "wellbeing", Page: WellbeingPage },
  { path: routes.mentalHealth, slug: "mental-health", Page: MentalHealthPage },
  {
    path: routes.transHealthcare,
    slug: "trans-healthcare",
    Page: TransHealthcarePage,
  },
  {
    path: routes.harmReduction,
    slug: "harm-reduction",
    Page: HarmReductionPage,
  },
  { path: routes.sexualHealth, slug: "sexual-health", Page: SexualHealthPage },
  { path: routes.sober, slug: "sober", Page: SoberPage },
  { path: routes.queer101, slug: "queer-101", Page: Queer101Page },
  {
    path: routes.pronounsGuide,
    slug: "pronouns-guide",
    Page: PronounsGuidePage,
  },
  { path: routes.microGrants, slug: "micro-grants", Page: MicroGrantsPage },
  {
    path: routes.intersectionality,
    slug: "intersectionality",
    Page: IntersectionalityPage,
  },
  { path: routes.transHub, slug: "trans-hub", Page: TransHubPage },
  { path: routes.legal, slug: "legal", Page: LegalPage },
  { path: routes.runningGuide, slug: "running-guide", Page: RunningGuidePage },
  {
    path: routes.accessibleLisbon,
    slug: "accessible-lisbon",
    Page: AccessibleLisbonPage,
  },
  { path: routes.peerSupport, slug: "peer-support", Page: PeerSupportPage },
  { path: routes.artCritGuide, slug: "art-crit-guide", Page: ArtCritGuidePage },
  {
    path: routes.sharedEquipment,
    slug: "shared-equipment",
    Page: SharedEquipmentPage,
  },
  {
    path: routes.groupShowArchive,
    slug: "group-show-archive",
    Page: GroupShowArchivePage,
  },
  {
    path: routes.firstMeetupGuide,
    slug: "first-meetup-guide",
    Page: FirstMeetupGuidePage,
  },
  {
    path: routes.queerPaediatricians,
    slug: "queer-paediatricians",
    Page: QueerPaediatriciansPage,
  },
  {
    path: routes.schoolFormsGuide,
    slug: "school-forms-guide",
    Page: SchoolFormsGuidePage,
  },
  {
    path: routes.communityPrivacy,
    slug: "community-privacy",
    Page: CommunityPrivacyPage,
  },
  {
    path: routes.comingOutAtWork,
    slug: "coming-out-at-work",
    Page: ComingOutAtWorkPage,
  },
  {
    path: routes.lgbtqAgingGuide,
    slug: "lgbtq-aging-guide",
    Page: LgbtqAgingGuidePage,
  },
  {
    path: routes.oralHistoryProject,
    slug: "oral-history-project",
    Page: OralHistoryProjectPage,
  },
  {
    path: routes.ingredientsMap,
    slug: "ingredients-map",
    Page: IngredientsMapPage,
  },
  {
    path: routes.qtipocOrganisations,
    slug: "qtipoc-organisations",
    Page: QtipocOrganisationsPage,
  },
  {
    path: routes.qtipocArchive,
    slug: "qtipoc-archive",
    Page: QtipocArchivePage,
  },
  {
    path: routes.disabilityHealthcare,
    slug: "disability-healthcare",
    Page: DisabilityHealthcarePage,
  },
  { path: routes.spoonTheory, slug: "spoon-theory", Page: SpoonTheoryPage },
  { path: routes.safety, slug: "safety", Page: SafetyPage },
];

/** Resources & wellbeing: health guides, the therapist directory, glossary,
 *  identity/community guides, and the general safety overview. */
export function resourceRoutes() {
  return (
    <>
      {GUIDE_ROUTES.map(({ path, slug, Page }) => (
        <Route
          key={path}
          path={path}
          element={<ManagedGuide slug={slug} fallback={<Page />} />}
        />
      ))}
      <Route path={routes.glossary} element={<GlossaryPage />} />
      {/* CNT-11: retired in favor of the one real, backend-driven library at
          routes.resources ("/resources", features/marketing/ResourceLibraryPage) —
          old links/bookmarks land there instead of a second, static-mock
          "library" surface. */}
      <Route
        path={routes.library}
        element={<Navigate to={routes.resources} replace />}
      />
      {/* CON-10: the category-grouped index of EVERY guide route. */}
      <Route path={routes.guideIndex} element={<GuideIndexPage />} />
      {/* CON-08: the slug-addressable renderer for a database-managed guide,
          and the honest landing place for a guide whose curated route is
          missing. It shares no path prefix with the static guide routes
          above, so neither can shadow the other. */}
      <Route
        path={`${routes.resourceGuide}/:slug`}
        element={<ResourceGuidePage />}
      />
    </>
  );
}
