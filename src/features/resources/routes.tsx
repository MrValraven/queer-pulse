import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const WellbeingPage = lazyNamed(() => import("./WellbeingPage"), "WellbeingPage");
const MentalHealthPage = lazyNamed(() => import("./MentalHealthPage"), "MentalHealthPage");
const TransHealthcarePage = lazyNamed(() => import("./TransHealthcarePage"), "TransHealthcarePage");
const HarmReductionPage = lazyNamed(() => import("./HarmReductionPage"), "HarmReductionPage");
const SexualHealthPage = lazyNamed(() => import("./SexualHealthPage"), "SexualHealthPage");
const SoberPage = lazyNamed(() => import("./SoberPage"), "SoberPage");
const Queer101Page = lazyNamed(() => import("./Queer101Page"), "Queer101Page");
const GlossaryPage = lazyNamed(() => import("./GlossaryPage"), "GlossaryPage");
const MicroGrantsPage = lazyNamed(() => import("./MicroGrantsPage"), "MicroGrantsPage");
const IntersectionalityPage = lazyNamed(() => import("./IntersectionalityPage"), "IntersectionalityPage");
const TransHubPage = lazyNamed(() => import("./TransHubPage"), "TransHubPage");
const LegalPage = lazyNamed(() => import("./LegalPage"), "LegalPage");
const SafetyPage = lazyNamed(() => import("./SafetyPage"), "SafetyPage");
const PronounsGuidePage = lazyNamed(() => import("./PronounsGuidePage"), "PronounsGuidePage");
const LibraryPage = lazyNamed(() => import("./LibraryPage"), "LibraryPage");
const RunningGuidePage = lazyNamed(() => import("./RunningGuidePage"), "RunningGuidePage");
const AccessibleLisbonPage = lazyNamed(() => import("./AccessibleLisbonPage"), "AccessibleLisbonPage");
const PeerSupportPage = lazyNamed(() => import("./PeerSupportPage"), "PeerSupportPage");
const ArtCritGuidePage = lazyNamed(() => import("./ArtCritGuidePage"), "ArtCritGuidePage");
const SharedEquipmentPage = lazyNamed(() => import("./SharedEquipmentPage"), "SharedEquipmentPage");
const GroupShowArchivePage = lazyNamed(() => import("./GroupShowArchivePage"), "GroupShowArchivePage");
const FirstMeetupGuidePage = lazyNamed(() => import("./FirstMeetupGuidePage"), "FirstMeetupGuidePage");
const QueerPaediatriciansPage = lazyNamed(() => import("./QueerPaediatriciansPage"), "QueerPaediatriciansPage");
const SchoolFormsGuidePage = lazyNamed(() => import("./SchoolFormsGuidePage"), "SchoolFormsGuidePage");
const CommunityPrivacyPage = lazyNamed(() => import("./CommunityPrivacyPage"), "CommunityPrivacyPage");
const ComingOutAtWorkPage = lazyNamed(() => import("./ComingOutAtWorkPage"), "ComingOutAtWorkPage");
const LgbtqAgingGuidePage = lazyNamed(() => import("./LgbtqAgingGuidePage"), "LgbtqAgingGuidePage");
const OralHistoryProjectPage = lazyNamed(() => import("./OralHistoryProjectPage"), "OralHistoryProjectPage");
const IngredientsMapPage = lazyNamed(() => import("./IngredientsMapPage"), "IngredientsMapPage");
const QtipocOrganisationsPage = lazyNamed(() => import("./QtipocOrganisationsPage"), "QtipocOrganisationsPage");
const QtipocArchivePage = lazyNamed(() => import("./QtipocArchivePage"), "QtipocArchivePage");
const DisabilityHealthcarePage = lazyNamed(() => import("./DisabilityHealthcarePage"), "DisabilityHealthcarePage");
const SpoonTheoryPage = lazyNamed(() => import("./SpoonTheoryPage"), "SpoonTheoryPage");

/** Resources & wellbeing: health guides, the therapist directory, glossary,
 *  identity/community guides, and the general safety overview. */
export function resourceRoutes() {
  return (
    <>
      <Route path={routes.wellbeing} element={<WellbeingPage />} />
      <Route path={routes.mentalHealth} element={<MentalHealthPage />} />
      <Route path={routes.transHealthcare} element={<TransHealthcarePage />} />
      <Route path={routes.harmReduction} element={<HarmReductionPage />} />
      <Route path={routes.sexualHealth} element={<SexualHealthPage />} />
      <Route path={routes.sober} element={<SoberPage />} />
      <Route path={routes.queer101} element={<Queer101Page />} />
      <Route path={routes.glossary} element={<GlossaryPage />} />
      <Route path={routes.pronounsGuide} element={<PronounsGuidePage />} />
      <Route path={routes.microGrants} element={<MicroGrantsPage />} />
      <Route
        path={routes.intersectionality}
        element={<IntersectionalityPage />}
      />
      <Route path={routes.transHub} element={<TransHubPage />} />
      <Route path={routes.legal} element={<LegalPage />} />
      <Route path={routes.library} element={<LibraryPage />} />
      <Route path={routes.runningGuide} element={<RunningGuidePage />} />
      <Route
        path={routes.accessibleLisbon}
        element={<AccessibleLisbonPage />}
      />
      <Route path={routes.peerSupport} element={<PeerSupportPage />} />
      <Route path={routes.artCritGuide} element={<ArtCritGuidePage />} />
      <Route path={routes.sharedEquipment} element={<SharedEquipmentPage />} />
      <Route
        path={routes.groupShowArchive}
        element={<GroupShowArchivePage />}
      />
      <Route
        path={routes.firstMeetupGuide}
        element={<FirstMeetupGuidePage />}
      />
      <Route
        path={routes.queerPaediatricians}
        element={<QueerPaediatriciansPage />}
      />
      <Route
        path={routes.schoolFormsGuide}
        element={<SchoolFormsGuidePage />}
      />
      <Route
        path={routes.communityPrivacy}
        element={<CommunityPrivacyPage />}
      />
      <Route path={routes.comingOutAtWork} element={<ComingOutAtWorkPage />} />
      <Route
        path={routes.lgbtqAgingGuide}
        element={<LgbtqAgingGuidePage />}
      />
      <Route
        path={routes.oralHistoryProject}
        element={<OralHistoryProjectPage />}
      />
      <Route path={routes.ingredientsMap} element={<IngredientsMapPage />} />
      <Route
        path={routes.qtipocOrganisations}
        element={<QtipocOrganisationsPage />}
      />
      <Route path={routes.qtipocArchive} element={<QtipocArchivePage />} />
      <Route
        path={routes.disabilityHealthcare}
        element={<DisabilityHealthcarePage />}
      />
      <Route path={routes.spoonTheory} element={<SpoonTheoryPage />} />
      <Route path={routes.safety} element={<SafetyPage />} />
    </>
  );
}
