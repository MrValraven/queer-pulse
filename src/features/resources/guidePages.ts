import type { ComponentType } from "react";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

// The hardcoded guide pages, lazy so none of them lands in the entry chunk.
// Shared by the public guide routes and the admin preview, which renders the
// same page for a guide that has no managed body yet.

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
export const GUIDE_ROUTES: {
  path: string;
  slug: string;
  Page: ComponentType;
}[] = [
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

const GUIDE_PAGE_BY_SLUG = new Map<string, ComponentType>(
  GUIDE_ROUTES.map(({ slug, Page }) => [slug, Page]),
);

/** The hardcoded page for a guide slug, or null when the guide has none. */
export function guidePageForSlug(slug: string): ComponentType | null {
  return GUIDE_PAGE_BY_SLUG.get(slug) ?? null;
}
