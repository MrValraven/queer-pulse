import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { RouteFallback } from "../shared/components/feedback/RouteFallback";
import { AuthLoader } from "../shared/components/feedback/AuthLoader";
import { ErrorBoundary } from "../shared/components/feedback/ErrorBoundary";

/**
 * Wrap an auth/onboarding route element in its own Suspense boundary so its
 * lazy chunk loads behind the branded {@link AuthLoader} instead of the generic
 * app-wide {@link RouteFallback} spinner.
 */
const auth = (element: ReactNode) => (
  <Suspense fallback={<AuthLoader />}>{element}</Suspense>
);

/**
 * Collapse the repetitive
 * `lazy(() => import(...).then((module) => ({ default: module.X })))` boilerplate:
 * name the export once and get a code-split component back.
 */
function lazyNamed<
  Name extends string,
  Module extends Record<Name, ComponentType>,
>(loader: () => Promise<Module>, name: Name) {
  return lazy(() => loader().then((module) => ({ default: module[name] })));
}
const HomePage = lazyNamed(() => import("../features/homepage/HomePage"), "HomePage");
const ProfilePage = lazyNamed(() => import("../features/members/ProfilePage"), "ProfilePage");
const MemberDirectoryFilterPage = lazyNamed(() => import("../features/members/MemberDirectoryFilterPage"), "MemberDirectoryFilterPage");
const SubprofilePage = lazyNamed(() => import("../features/subprofiles/SubprofilePage"), "SubprofilePage");
const SubprofileDirectoryPage = lazyNamed(() => import("../features/subprofiles/SubprofileDirectoryPage"), "SubprofileDirectoryPage");
const MySubprofilesPage = lazyNamed(() => import("../features/subprofiles/MySubprofilesPage"), "MySubprofilesPage");
const SubprofileEditorPage = lazyNamed(() => import("../features/subprofiles/SubprofileEditorPage"), "SubprofileEditorPage");
const SearchPage = lazyNamed(() => import("../features/members/SearchPage"), "SearchPage");
const ConnectionsPage = lazyNamed(() => import("../features/connect/ConnectionsPage"), "ConnectionsPage");
const DatingPage = lazyNamed(() => import("../features/community/DatingPage"), "DatingPage");
const ReadingGroupsPage = lazyNamed(() => import("../features/community/ReadingGroupsPage"), "ReadingGroupsPage");
const FamilyPage = lazyNamed(() => import("../features/community/FamilyPage"), "FamilyPage");
const CaregiversPage = lazyNamed(() => import("../features/community/CaregiversPage"), "CaregiversPage");
const FeedPage = lazyNamed(() => import("../features/feed/FeedPage"), "FeedPage");
const NotificationsPage = lazyNamed(() => import("../features/notifications/NotificationsPage"), "NotificationsPage");
const MessagesPage = lazyNamed(() => import("../features/messages/MessagesPage"), "MessagesPage");
const CommunitiesPage = lazyNamed(() => import("../features/communities/CommunitiesPage"), "CommunitiesPage");
const CommunitiesHomePage = lazyNamed(() => import("../features/communities/CommunitiesHomePage"), "CommunitiesHomePage");
const StartCommunityPage = lazyNamed(() => import("../features/communities/startCommunity/StartCommunityPage"), "StartCommunityPage");
const CommunityDetailPage = lazyNamed(() => import("../features/communities/CommunityDetailPage"), "CommunityDetailPage");
const CalendarPage = lazyNamed(() => import("../features/gatherings/CalendarPage"), "CalendarPage");
const GatheringPage = lazyNamed(() => import("../features/gatherings/GatheringPage"), "GatheringPage");
const EventPage = lazyNamed(() => import("../features/gatherings/EventPage"), "EventPage");
const EventsPage = lazyNamed(() => import("../features/gatherings/EventsPage"), "EventsPage");
const MyEventsPage = lazyNamed(() => import("../features/myevents/MyEventsPage"), "MyEventsPage");
const RsvpPage = lazyNamed(() => import("../features/gatherings/RsvpPage"), "RsvpPage");
const GatheringRecapPage = lazyNamed(() => import("../features/gatherings/GatheringRecapPage"), "GatheringRecapPage");
const CheckoutPage = lazyNamed(() => import("../features/gatherings/checkout/CheckoutPage"), "CheckoutPage");
const HostPage = lazyNamed(() => import("../features/gatherings/HostPage"), "HostPage");
const CreateGatheringPage = lazyNamed(() => import("../features/gatherings/CreateGatheringPage"), "CreateGatheringPage");
const GatheringDashboardPage = lazyNamed(() => import("../features/gatherings/GatheringDashboardPage"), "GatheringDashboardPage");
const ManageGatheringPage = lazyNamed(() => import("../features/gatherings/ManageGatheringPage"), "ManageGatheringPage");
const CoHostInvitePage = lazyNamed(() => import("../features/gatherings/CoHostInvitePage"), "CoHostInvitePage");
const GatheringCancelledPage = lazyNamed(() => import("../features/gatherings/GatheringCancelledPage"), "GatheringCancelledPage");
const GatheringPhotosPage = lazyNamed(() => import("../features/gatherings/GatheringPhotosPage"), "GatheringPhotosPage");
const MagazinePage = lazyNamed(() => import("../features/magazine/MagazinePage"), "MagazinePage");
const ArticlePage = lazyNamed(() => import("../features/magazine/ArticlePage"), "ArticlePage");
const AuthorPage = lazyNamed(() => import("../features/magazine/AuthorPage"), "AuthorPage");
const IssuePage = lazyNamed(() => import("../features/magazine/IssuePage"), "IssuePage");
const IssuesPage = lazyNamed(() => import("../features/magazine/IssuesPage"), "IssuesPage");
const CoverGalleryPage = lazyNamed(() => import("../features/magazine/CoverGalleryPage"), "CoverGalleryPage");
const TagPage = lazyNamed(() => import("../features/magazine/TagPage"), "TagPage");
const TopicPage = lazyNamed(() => import("../features/topics/TopicPage"), "TopicPage");
const NewsletterArchivePage = lazyNamed(() => import("../features/magazine/NewsletterArchivePage"), "NewsletterArchivePage");
const NewsletterArchiveIssuePage = lazyNamed(() => import("../features/magazine/NewsletterArchiveIssuePage"), "NewsletterArchiveIssuePage");
const StoryPage = lazyNamed(() => import("../features/magazine/StoryPage"), "StoryPage");
const StoryTomasPage = lazyNamed(() => import("../features/magazine/StoryTomasPage"), "StoryTomasPage");
const StorySafetyPage = lazyNamed(() => import("../features/magazine/StorySafetyPage"), "StorySafetyPage");
const CreativesPage = lazyNamed(() => import("../features/community/CreativesPage"), "CreativesPage");
const CulturePage = lazyNamed(() => import("../features/culture/CulturePage"), "CulturePage");
const PrivacyPage = lazyNamed(() => import("../features/marketing/PrivacyPage"), "PrivacyPage");
const TermsPage = lazyNamed(() => import("../features/marketing/TermsPage"), "TermsPage");
const DsarPage = lazyNamed(() => import("../features/marketing/DsarPage"), "DsarPage");
const ConstitutionPage = lazyNamed(() => import("../features/marketing/ConstitutionPage"), "ConstitutionPage");
const CodeOfConductPage = lazyNamed(() => import("../features/marketing/CodeOfConductPage"), "CodeOfConductPage");
const ChangelogPage = lazyNamed(() => import("../features/marketing/ChangelogPage"), "ChangelogPage");
const RoadmapPage = lazyNamed(() => import("../features/marketing/RoadmapPage"), "RoadmapPage");
const PressArchivePage = lazyNamed(() => import("../features/marketing/PressArchivePage"), "PressArchivePage");
const ForOrganisationsPage = lazyNamed(() => import("../features/marketing/ForOrganisationsPage"), "ForOrganisationsPage");
const PressKitPage = lazyNamed(() => import("../features/marketing/PressKitPage"), "PressKitPage");
const TransparencyReportPage = lazyNamed(() => import("../features/marketing/TransparencyReportPage"), "TransparencyReportPage");
const AccessibilityPage = lazyNamed(() => import("../features/marketing/AccessibilityPage"), "AccessibilityPage");
const WellbeingPage = lazyNamed(() => import("../features/resources/WellbeingPage"), "WellbeingPage");
const MentalHealthPage = lazyNamed(() => import("../features/resources/MentalHealthPage"), "MentalHealthPage");
const TherapistProfilePage = lazyNamed(() => import("../features/resources/therapist/TherapistProfilePage"), "TherapistProfilePage");
const TransHealthcarePage = lazyNamed(() => import("../features/resources/TransHealthcarePage"), "TransHealthcarePage");
const HarmReductionPage = lazyNamed(() => import("../features/resources/HarmReductionPage"), "HarmReductionPage");
const SexualHealthPage = lazyNamed(() => import("../features/resources/SexualHealthPage"), "SexualHealthPage");
const SoberPage = lazyNamed(() => import("../features/resources/SoberPage"), "SoberPage");
const Queer101Page = lazyNamed(() => import("../features/resources/Queer101Page"), "Queer101Page");
const GlossaryPage = lazyNamed(() => import("../features/resources/GlossaryPage"), "GlossaryPage");
const MicroGrantsPage = lazyNamed(() => import("../features/resources/MicroGrantsPage"), "MicroGrantsPage");
const IntersectionalityPage = lazyNamed(() => import("../features/resources/IntersectionalityPage"), "IntersectionalityPage");
const TransHubPage = lazyNamed(() => import("../features/resources/TransHubPage"), "TransHubPage");
const LegalPage = lazyNamed(() => import("../features/resources/LegalPage"), "LegalPage");
const SafetyPage = lazyNamed(() => import("../features/resources/SafetyPage"), "SafetyPage");
const SignInPage = lazyNamed(() => import("../features/auth/SignInPage"), "SignInPage");
const CreateAccountPage = lazyNamed(() => import("../features/auth/CreateAccountPage"), "CreateAccountPage");
const InvitePage = lazyNamed(() => import("../features/auth/InvitePage"), "InvitePage");
const RequestInvitePage = lazyNamed(() => import("../features/auth/RequestInvitePage"), "RequestInvitePage");
const OnboardingPage = lazyNamed(() => import("../features/auth/OnboardingPage"), "OnboardingPage");
const WelcomeTourPage = lazyNamed(() => import("../features/auth/WelcomeTourPage"), "WelcomeTourPage");
const JobsPage = lazyNamed(() => import("../features/economy/JobsPage"), "JobsPage");
const JobDetailPage = lazyNamed(() => import("../features/economy/JobDetailPage"), "JobDetailPage");
const CompanyPage = lazyNamed(() => import("../features/economy/CompanyPage"), "CompanyPage");
const PostJobPage = lazyNamed(() => import("../features/economy/PostJobPage"), "PostJobPage");
const JobApplyPage = lazyNamed(() => import("../features/economy/JobApplyPage"), "JobApplyPage");
const HousingPage = lazyNamed(() => import("../features/economy/HousingPage"), "HousingPage");
const HousingCoopPage = lazyNamed(() => import("../features/economy/HousingCoopPage"), "HousingCoopPage");
const CoopTemplatePage = lazyNamed(() => import("../features/economy/CoopTemplatePage"), "CoopTemplatePage");
const HousingListingPage = lazyNamed(() => import("../features/economy/HousingListingPage"), "HousingListingPage");
const LandlordPage = lazyNamed(() => import("../features/economy/LandlordPage"), "LandlordPage");
const SkillsPage = lazyNamed(() => import("../features/economy/SkillsPage"), "SkillsPage");
const WorkshopPage = lazyNamed(() => import("../features/economy/WorkshopPage"), "WorkshopPage");
const GrantsPage = lazyNamed(() => import("../features/economy/GrantsPage"), "GrantsPage");
const BarterPage = lazyNamed(() => import("../features/economy/BarterPage"), "BarterPage");
const BarterDetailPage = lazyNamed(() => import("../features/economy/BarterDetailPage"), "BarterDetailPage");
const OfferPage = lazyNamed(() => import("../features/economy/OfferPage"), "OfferPage");
const EmployerReviewsPage = lazyNamed(() => import("../features/economy/EmployerReviewsPage"), "EmployerReviewsPage");
const ApplicationStatusPage = lazyNamed(() => import("../features/economy/ApplicationStatusPage"), "ApplicationStatusPage");
const MentorshipPage = lazyNamed(() => import("../features/economy/MentorshipPage"), "MentorshipPage");
const MentorDetailPage = lazyNamed(() => import("../features/economy/MentorDetailPage"), "MentorDetailPage");
const EconomyPage = lazyNamed(() => import("../features/economy/EconomyPage"), "EconomyPage");
const InvoiceGeneratorPage = lazyNamed(() => import("../features/economy/InvoiceGeneratorPage"), "InvoiceGeneratorPage");
const ContractGeneratorPage = lazyNamed(() => import("../features/economy/ContractGeneratorPage"), "ContractGeneratorPage");
const ScopeGeneratorPage = lazyNamed(() => import("../features/economy/ScopeGeneratorPage"), "ScopeGeneratorPage");
const ReciboVerdeGuidePage = lazyNamed(() => import("../features/economy/ReciboVerdeGuidePage"), "ReciboVerdeGuidePage");
const TakeHomeCalculatorPage = lazyNamed(() => import("../features/economy/TakeHomeCalculatorPage"), "TakeHomeCalculatorPage");
const IvaTrackerPage = lazyNamed(() => import("../features/economy/IvaTrackerPage"), "IvaTrackerPage");
const SetAsidePlannerPage = lazyNamed(() => import("../features/economy/SetAsidePlannerPage"), "SetAsidePlannerPage");
const DayRateCalculatorPage = lazyNamed(() => import("../features/economy/DayRateCalculatorPage"), "DayRateCalculatorPage");
const RateBoardPage = lazyNamed(() => import("../features/economy/RateBoardPage"), "RateBoardPage");
const SlidingScalePage = lazyNamed(() => import("../features/economy/SlidingScalePage"), "SlidingScalePage");
const ComparatorPage = lazyNamed(() => import("../features/economy/ComparatorPage"), "ComparatorPage");
const RunningGuidePage = lazyNamed(() => import("../features/resources/RunningGuidePage"), "RunningGuidePage");
const AccessibleLisbonPage = lazyNamed(() => import("../features/resources/AccessibleLisbonPage"), "AccessibleLisbonPage");
const PeerSupportPage = lazyNamed(() => import("../features/resources/PeerSupportPage"), "PeerSupportPage");
const ArtCritGuidePage = lazyNamed(() => import("../features/resources/ArtCritGuidePage"), "ArtCritGuidePage");
const SharedEquipmentPage = lazyNamed(() => import("../features/resources/SharedEquipmentPage"), "SharedEquipmentPage");
const GroupShowArchivePage = lazyNamed(() => import("../features/resources/GroupShowArchivePage"), "GroupShowArchivePage");
const FirstMeetupGuidePage = lazyNamed(() => import("../features/resources/FirstMeetupGuidePage"), "FirstMeetupGuidePage");
const QueerPaediatriciansPage = lazyNamed(() => import("../features/resources/QueerPaediatriciansPage"), "QueerPaediatriciansPage");
const SchoolFormsGuidePage = lazyNamed(() => import("../features/resources/SchoolFormsGuidePage"), "SchoolFormsGuidePage");
const CommunityPrivacyPage = lazyNamed(() => import("../features/resources/CommunityPrivacyPage"), "CommunityPrivacyPage");
const ComingOutAtWorkPage = lazyNamed(() => import("../features/resources/ComingOutAtWorkPage"), "ComingOutAtWorkPage");
const LgbtqAgingGuidePage = lazyNamed(() => import("../features/resources/LgbtqAgingGuidePage"), "LgbtqAgingGuidePage");
const OralHistoryProjectPage = lazyNamed(() => import("../features/resources/OralHistoryProjectPage"), "OralHistoryProjectPage");
const IngredientsMapPage = lazyNamed(() => import("../features/resources/IngredientsMapPage"), "IngredientsMapPage");
const QtipocOrganisationsPage = lazyNamed(() => import("../features/resources/QtipocOrganisationsPage"), "QtipocOrganisationsPage");
const QtipocArchivePage = lazyNamed(() => import("../features/resources/QtipocArchivePage"), "QtipocArchivePage");
const DisabilityHealthcarePage = lazyNamed(() => import("../features/resources/DisabilityHealthcarePage"), "DisabilityHealthcarePage");
const SpoonTheoryPage = lazyNamed(() => import("../features/resources/SpoonTheoryPage"), "SpoonTheoryPage");
const CinemaPage = lazyNamed(() => import("../features/cinema/CinemaPage"), "CinemaPage");
const CinemaBrowsePage = lazyNamed(() => import("../features/cinema/CinemaBrowsePage"), "CinemaBrowsePage");
const CinemaMembershipPage = lazyNamed(() => import("../features/cinema/CinemaMembershipPage"), "CinemaMembershipPage");
const FilmPage = lazyNamed(() => import("../features/cinema/FilmPage"), "FilmPage");
const CinemaFilmmakerPage = lazyNamed(() => import("../features/cinema/CinemaFilmmakerPage"), "CinemaFilmmakerPage");
const CinemaCuratorPage = lazyNamed(() => import("../features/cinema/CinemaCuratorPage"), "CinemaCuratorPage");
const CinemaCollectionsPage = lazyNamed(() => import("../features/cinema/CinemaCollectionsPage"), "CinemaCollectionsPage");
const CinemaCollectionPage = lazyNamed(() => import("../features/cinema/CinemaCollectionPage"), "CinemaCollectionPage");
const CinemaAboutPage = lazyNamed(() => import("../features/cinema/CinemaAboutPage"), "CinemaAboutPage");
const WatchPage = lazyNamed(() => import("../features/cinema/WatchPage"), "WatchPage");
const CinemaSubmitPage = lazyNamed(() => import("../features/cinema/CinemaSubmitPage"), "CinemaSubmitPage");
const CinemaShortsPage = lazyNamed(() => import("../features/cinema/CinemaShortsPage"), "CinemaShortsPage");
const CinemaOpenCallsPage = lazyNamed(() => import("../features/cinema/CinemaOpenCallsPage"), "CinemaOpenCallsPage");
const CinemaRightsPage = lazyNamed(() => import("../features/cinema/CinemaRightsPage"), "CinemaRightsPage");
const StudioPage = lazyNamed(() => import("../features/studio/StudioPage"), "StudioPage");
const StudioAlbumPage = lazyNamed(() => import("../features/studio/StudioAlbumPage"), "StudioAlbumPage");
const StudioArtistPage = lazyNamed(() => import("../features/studio/StudioArtistPage"), "StudioArtistPage");
const StudioDashboardPage = lazyNamed(() => import("../features/studio/StudioDashboardPage"), "StudioDashboardPage");
const StudioUploadPage = lazyNamed(() => import("../features/studio/StudioUploadPage"), "StudioUploadPage");
const StudioPayoutsPage = lazyNamed(() => import("../features/studio/StudioPayoutsPage"), "StudioPayoutsPage");
const StudioTrackPage = lazyNamed(() => import("../features/studio/StudioTrackPage"), "StudioTrackPage");
const StudioLivePage = lazyNamed(() => import("../features/studio/StudioLivePage"), "StudioLivePage");
const StudioSheetStorePage = lazyNamed(() => import("../features/studio/StudioSheetStorePage"), "StudioSheetStorePage");
const StudioSolidarityFundPage = lazyNamed(() => import("../features/studio/StudioSolidarityFundPage"), "StudioSolidarityFundPage");
const StudioOpenCallsPage = lazyNamed(() => import("../features/studio/StudioOpenCallsPage"), "StudioOpenCallsPage");
const StudioSetSubmissionPage = lazyNamed(() => import("../features/studio/StudioSetSubmissionPage"), "StudioSetSubmissionPage");
const StudioCouncilPage = lazyNamed(() => import("../features/studio/StudioCouncilPage"), "StudioCouncilPage");
const StudioTriagePage = lazyNamed(() => import("../features/studio/StudioTriagePage"), "StudioTriagePage");
const StudioFlagReviewPage = lazyNamed(() => import("../features/studio/StudioFlagReviewPage"), "StudioFlagReviewPage");
const StudioAboutPage = lazyNamed(() => import("../features/studio/StudioAboutPage"), "StudioAboutPage");
const StudioAccessibilityPage = lazyNamed(() => import("../features/studio/StudioAccessibilityPage"), "StudioAccessibilityPage");
const StudioTermsPage = lazyNamed(() => import("../features/studio/StudioTermsPage"), "StudioTermsPage");
const StudioHelpPage = lazyNamed(() => import("../features/studio/StudioHelpPage"), "StudioHelpPage");
const StudioPressPage = lazyNamed(() => import("../features/studio/StudioPressPage"), "StudioPressPage");
const StudioEndCardPage = lazyNamed(() => import("../features/studio/StudioEndCardPage"), "StudioEndCardPage");
const StudioNotificationsPage = lazyNamed(() => import("../features/studio/StudioNotificationsPage"), "StudioNotificationsPage");
const StudioReceiptPage = lazyNamed(() => import("../features/studio/StudioReceiptPage"), "StudioReceiptPage");
const StudioRightsPage = lazyNamed(() => import("../features/studio/StudioRightsPage"), "StudioRightsPage");
const StudioProgramPage = lazyNamed(() => import("../features/studio/StudioProgramPage"), "StudioProgramPage");
const StudioBroadcastPage = lazyNamed(() => import("../features/studio/StudioBroadcastPage"), "StudioBroadcastPage");
const StudioWelcomePage = lazyNamed(() => import("../features/studio/StudioWelcomePage"), "StudioWelcomePage");
const StudioWithdrawnPage = lazyNamed(() => import("../features/studio/StudioWithdrawnPage"), "StudioWithdrawnPage");
const ChangemakersPage = lazyNamed(() => import("../features/community/ChangemakersPage"), "ChangemakersPage");
const ChangemakerStoryPage = lazyNamed(() => import("../features/community/ChangemakerStoryPage"), "ChangemakerStoryPage");
const ForumPage = lazyNamed(() => import("../features/forum/ForumPage"), "ForumPage");
const ThreadPage = lazyNamed(() => import("../features/forum/ThreadPage"), "ThreadPage");
const SettingsPage = lazyNamed(() => import("../features/settings/SettingsPage"), "SettingsPage");
const GovernancePage = lazyNamed(() => import("../features/governance/GovernancePage"), "GovernancePage");
const AboutPage = lazyNamed(() => import("../features/marketing/AboutPage"), "AboutPage");
const ContactPage = lazyNamed(() => import("../features/marketing/ContactPage"), "ContactPage");
const HelpPage = lazyNamed(() => import("../features/marketing/HelpPage"), "HelpPage");
const VolunteerPage = lazyNamed(() => import("../features/marketing/VolunteerPage"), "VolunteerPage");
const VolunteerOpportunityPage = lazyNamed(() => import("../features/marketing/VolunteerOpportunityPage"), "VolunteerOpportunityPage");
const PostVolunteerOpportunityPage = lazyNamed(() => import("../features/marketing/PostVolunteerOpportunityPage"), "PostVolunteerOpportunityPage");
const GuidelinesPage = lazyNamed(() => import("../features/marketing/GuidelinesPage"), "GuidelinesPage");
const DirectoryPage = lazyNamed(() => import("../features/marketing/DirectoryPage"), "DirectoryPage");
const DirectorySpacePage = lazyNamed(() => import("../features/marketing/DirectorySpacePage"), "DirectorySpacePage");
const VenueDetailPage = lazyNamed(() => import("../features/marketing/VenueDetailPage"), "VenueDetailPage");
const ListBusinessPage = lazyNamed(() => import("../features/marketing/listBusiness/ListBusinessPage"), "ListBusinessPage");
const ResourceLibraryPage = lazyNamed(() => import("../features/marketing/ResourceLibraryPage"), "ResourceLibraryPage");
const PartnersPage = lazyNamed(() => import("../features/marketing/PartnersPage"), "PartnersPage");
const SubmitPartnerApplicationPage = lazyNamed(() => import("../features/marketing/SubmitPartnerApplicationPage"), "SubmitPartnerApplicationPage");
const PartnerDetailPage = lazyNamed(() => import("../features/marketing/PartnerDetailPage"), "PartnerDetailPage");
const ActivismPage = lazyNamed(() => import("../features/marketing/ActivismPage"), "ActivismPage");
const PlatformsPage = lazyNamed(() => import("../features/marketing/PlatformsPage"), "PlatformsPage");
const SafeSpacesPage = lazyNamed(() => import("../features/safety/SafeSpacesPage"), "SafeSpacesPage");
const SafeSpaceDetailPage = lazyNamed(() => import("../features/safety/SafeSpaceDetailPage"), "SafeSpaceDetailPage");
const SolidarityPage = lazyNamed(() => import("../features/economy/SolidarityPage"), "SolidarityPage");
const VisasPage = lazyNamed(() => import("../features/marketing/VisasPage"), "VisasPage");
const ArrivingPage = lazyNamed(() => import("../features/marketing/ArrivingPage"), "ArrivingPage");
const HateCrimePage = lazyNamed(() => import("../features/safety/HateCrimePage"), "HateCrimePage");
const ReportPage = lazyNamed(() => import("../features/safety/ReportPage"), "ReportPage");
const BlockMutePage = lazyNamed(() => import("../features/safety/BlockMutePage"), "BlockMutePage");
const AppealOutcomePage = lazyNamed(() => import("../features/safety/AppealOutcomePage"), "AppealOutcomePage");
const NotFoundPage = lazyNamed(() => import("../pages/NotFoundPage"), "NotFoundPage");
const ServerErrorPage = lazyNamed(() => import("../features/system/ServerErrorPage"), "ServerErrorPage");
const MaintenancePage = lazyNamed(() => import("../features/system/MaintenancePage"), "MaintenancePage");
const OfflinePage = lazyNamed(() => import("../features/system/OfflinePage"), "OfflinePage");
const GeoRestrictedPage = lazyNamed(() => import("../features/system/GeoRestrictedPage"), "GeoRestrictedPage");
const PwaPromptPage = lazyNamed(() => import("../features/system/PwaPromptPage"), "PwaPromptPage");
const AccountBannedPage = lazyNamed(() => import("../features/system/AccountBannedPage"), "AccountBannedPage");
const AccountLockedPage = lazyNamed(() => import("../features/system/AccountLockedPage"), "AccountLockedPage");
const AccountSuspendedPage = lazyNamed(() => import("../features/system/AccountSuspendedPage"), "AccountSuspendedPage");
const InviteExpiredPage = lazyNamed(() => import("../features/system/InviteExpiredPage"), "InviteExpiredPage");
const InviteLandingPage = lazyNamed(() => import("../features/system/InviteLandingPage"), "InviteLandingPage");
const PendingReviewPage = lazyNamed(() => import("../features/system/PendingReviewPage"), "PendingReviewPage");
const VerificationNeededPage = lazyNamed(() => import("../features/system/VerificationNeededPage"), "VerificationNeededPage");
const StatusPage = lazyNamed(() => import("../features/system/StatusPage"), "StatusPage");
const GenesisPage = lazyNamed(() => import("../features/system/GenesisPage"), "GenesisPage");
const Studio404Page = lazyNamed(() => import("../features/studio/Studio404Page"), "Studio404Page");
const Studio500Page = lazyNamed(() => import("../features/studio/Studio500Page"), "Studio500Page");
const StudioOffAirPage = lazyNamed(() => import("../features/studio/StudioOffAirPage"), "StudioOffAirPage");
const StudioSignInPage = lazyNamed(() => import("../features/studio/StudioSignInPage"), "StudioSignInPage");
const StudioSettingsPage = lazyNamed(() => import("../features/studio/StudioSettingsPage"), "StudioSettingsPage");
const DataExportPage = lazyNamed(() => import("../features/settings/DataExportPage"), "DataExportPage");
const DeleteAccountPage = lazyNamed(() => import("../features/settings/DeleteAccountPage"), "DeleteAccountPage");
const EditProfilePage = lazyNamed(() => import("../features/settings/EditProfilePage"), "EditProfilePage");
const SecurityPage = lazyNamed(() => import("../features/settings/SecurityPage"), "SecurityPage");
const SessionsPage = lazyNamed(() => import("../features/settings/SessionsPage"), "SessionsPage");
const PublicProfilePage = lazyNamed(() => import("../features/members/PublicProfilePage"), "PublicProfilePage");
const WorkHubPage = lazyNamed(() => import("../features/economy/WorkHubPage"), "WorkHubPage");
const WorkProfilePage = lazyNamed(() => import("../features/economy/WorkProfilePage"), "WorkProfilePage");
const CollectionsPage = lazyNamed(() => import("../features/members/CollectionsPage"), "CollectionsPage");
const BadgesPage = lazyNamed(() => import("../features/members/BadgesPage"), "BadgesPage");
const PerksPage = lazyNamed(() => import("../features/members/PerksPage"), "PerksPage");
const DraftsPage = lazyNamed(() => import("../features/members/DraftsPage"), "DraftsPage");
const CookiesPage = lazyNamed(() => import("../features/marketing/CookiesPage"), "CookiesPage");
const PronounsGuidePage = lazyNamed(() => import("../features/resources/PronounsGuidePage"), "PronounsGuidePage");
const LibraryPage = lazyNamed(() => import("../features/resources/LibraryPage"), "LibraryPage");
const ComingOutPage = lazyNamed(() => import("../features/community/ComingOutPage"), "ComingOutPage");
const GatheringsPage = lazyNamed(() => import("../features/gatherings/GatheringsPage"), "GatheringsPage");
const VouchPage = lazyNamed(() => import("../features/members/VouchPage"), "VouchPage");
const DonatePage = lazyNamed(() => import("../features/marketing/DonatePage"), "DonatePage");
const SubmitStoryPage = lazyNamed(() => import("../features/magazine/SubmitStoryPage"), "SubmitStoryPage");
const PitchTrackerPage = lazyNamed(() => import("../features/magazine/PitchTrackerPage"), "PitchTrackerPage");
const EditorDashboardPage = lazyNamed(() => import("../features/magazine/EditorDashboardPage"), "EditorDashboardPage");
const StudioCollectionPage = lazyNamed(() => import("../features/studio/StudioCollectionPage"), "StudioCollectionPage");
const StudioSetPage = lazyNamed(() => import("../features/studio/StudioSetPage"), "StudioSetPage");
const StudioSearchPage = lazyNamed(() => import("../features/studio/StudioSearchPage"), "StudioSearchPage");
const StudioLibraryPage = lazyNamed(() => import("../features/studio/StudioLibraryPage"), "StudioLibraryPage");
const StudioCheckoutPage = lazyNamed(() => import("../features/studio/StudioCheckoutPage"), "StudioCheckoutPage");
const AdminDashboardPage = lazyNamed(() => import("../features/admin/AdminDashboardPage"), "AdminDashboardPage");
const AdminModerationPage = lazyNamed(() => import("../features/admin/AdminModerationPage"), "AdminModerationPage");
const AdminMembersPage = lazyNamed(() => import("../features/admin/AdminMembersPage"), "AdminMembersPage");
const AdminBotsPage = lazyNamed(() => import("../features/admin/AdminBotsPage"), "AdminBotsPage");
const AdminSafeSpacesPage = lazyNamed(() => import("../features/admin/AdminSafeSpacesPage"), "AdminSafeSpacesPage");
const AdminListingsPage = lazyNamed(() => import("../features/admin/AdminListingsPage"), "AdminListingsPage");
const AdminChangemakersPage = lazyNamed(() => import("../features/admin/AdminChangemakersPage"), "AdminChangemakersPage");
const AdminCommunitiesPage = lazyNamed(() => import("../features/admin/AdminCommunitiesPage"), "AdminCommunitiesPage");
const AdminCommunityModPage = lazyNamed(() => import("../features/admin/AdminCommunityModPage"), "AdminCommunityModPage");
const AdminGovernancePage = lazyNamed(() => import("../features/admin/AdminGovernancePage"), "AdminGovernancePage");
const ModPanelPage = lazyNamed(() => import("../features/admin/ModPanelPage"), "ModPanelPage");
const AdminPartnerApplicationsPage = lazyNamed(() => import("../features/admin/AdminPartnerApplicationsPage"), "AdminPartnerApplicationsPage");
const AdminHousingCoopsPage = lazyNamed(() => import("../features/admin/AdminHousingCoopsPage"), "AdminHousingCoopsPage");
const AdminOrgTiersPage = lazyNamed(() => import("../features/admin/AdminOrgTiersPage"), "AdminOrgTiersPage");
const AdminSettingsPage = lazyNamed(() => import("../features/admin/AdminSettingsPage"), "AdminSettingsPage");
import { routes } from "./routeMap";
import { ParamRedirect, MemberProfileRedirect } from "./routes.redirects";
import { LEGACY_REDIRECTS } from "./routes.redirects.data";
import { useAuthGateRedirect, isGatedPath, isGuestOnlyPath } from "./authGate";
import { useAuth } from "./providers/authContext";

/**
 * The Member Platform surface is now built. Remaining known links resolve to a
 * styled placeholder, and unknown paths fall through to it too, so no link 404s.
 */
export function AppRoutes() {
  // Walled-garden gate: bounce logged-out visitors off member-only routes to
  // sign-in (with a ?next= back-link). Public/marketing pages fall through.
  const { checking } = useAuth();
  const gateRedirect = useAuthGateRedirect();
  const { pathname } = useLocation();
  // While the live session is still being determined, hold gated routes on the
  // branded loader — showing the page (or bouncing to sign-in) prematurely would
  // flash. Guest-only auth screens are held too, so a signed-in member reloading
  // one doesn't flash the sign-in form before the redirect. Public/marketing
  // pages render immediately.
  if (checking && (isGatedPath(pathname) || isGuestOnlyPath(pathname))) {
    return <AuthLoader />;
  }
  if (gateRedirect) return <Navigate to={gateRedirect} replace />;

  return (
    // Route-level boundary: a single broken page shows the branded fallback
    // without losing the app frame, and navigating away auto-resets it.
    <ErrorBoundary level="route" resetKey={pathname}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path={routes.homepage} element={<HomePage />} />

          {/* Member Platform */}
          <Route path="/feed" element={<FeedPage />} />
          <Route
            path={routes.members}
            element={<MemberDirectoryFilterPage />}
          />
          <Route path={routes.search} element={<SearchPage />} />
          <Route path={routes.accountProfile} element={<ProfilePage />} />
          <Route path={`${routes.members}/:slug`} element={<ProfilePage />} />
          {/* Linked persona nested under its owner's main profile. A two-segment
              path never shadows the one-segment `:slug` route above in react-router
              v7 (a `/members/x` URL only matches `:slug`; `/members/x/y` only this). */}
          <Route
            path={`${routes.members}/:slug/:subslug`}
            element={<SubprofilePage />}
          />
          {/* Standalone (unlinked) persona by its global handle. */}
          <Route path="/p/:handle" element={<SubprofilePage />} />
          {/* Public persona directory. */}
          <Route
            path={routes.subprofiles}
            element={<SubprofileDirectoryPage />}
          />
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
          <Route path={routes.connections} element={<ConnectionsPage />} />
          <Route path={routes.myEvents} element={<MyEventsPage />} />
          <Route path={routes.dating} element={<DatingPage />} />
          <Route path={routes.readingGroups} element={<ReadingGroupsPage />} />
          <Route path={routes.family} element={<FamilyPage />} />
          <Route path={routes.caregivers} element={<CaregiversPage />} />
          <Route path={routes.messages} element={<MessagesPage />} />
          <Route path={routes.notifications} element={<NotificationsPage />} />
          <Route path={routes.collections} element={<CollectionsPage />} />
          <Route path={routes.drafts} element={<DraftsPage />} />
          <Route path={routes.communities} element={<CommunitiesPage />} />
          <Route
            path={routes.communitiesHome}
            element={<CommunitiesHomePage />}
          />
          <Route
            path={routes.startCommunity}
            element={<StartCommunityPage />}
          />
          <Route path="/community/:slug" element={<CommunityDetailPage />} />

          {/* Gatherings */}
          <Route path={routes.calendar} element={<CalendarPage />} />
          <Route path={routes.events} element={<EventsPage />} />
          {/* `/gathering/:slug` (singular) and the flat `/gathering-*` routes were
              unified under `/gatherings/:slug/...`. Hard cutover — no redirect shims. */}
          <Route
            path={`${routes.gatherings}/:slug`}
            element={<GatheringPage />}
          />
          <Route
            path={`${routes.gatherings}/:slug/recap`}
            element={<GatheringRecapPage />}
          />
          <Route
            path={`${routes.gatherings}/:slug/cancelled`}
            element={<GatheringCancelledPage />}
          />
          <Route
            path={`${routes.gatherings}/:slug/dashboard`}
            element={<GatheringDashboardPage />}
          />
          <Route
            path={`${routes.gatherings}/:slug/manage`}
            element={<ManageGatheringPage />}
          />
          <Route
            path={`${routes.gatherings}/:slug/photos`}
            element={<GatheringPhotosPage />}
          />
          <Route
            path={`${routes.gatherings}/:slug/co-host-invite`}
            element={<CoHostInvitePage />}
          />
          <Route path={routes.event} element={<EventPage />} />
          <Route path={routes.rsvp} element={<RsvpPage />} />
          <Route path={routes.rsvpTicket} element={<RsvpPage />} />
          <Route path={routes.checkout} element={<CheckoutPage />} />
          <Route path={routes.host} element={<HostPage />} />
          <Route
            path={routes.createGathering}
            element={<CreateGatheringPage />}
          />

          {/* Magazine */}
          <Route path={routes.magazine} element={<MagazinePage />} />
          <Route path={routes.article} element={<ArticlePage />} />
          <Route path={routes.author} element={<AuthorPage />} />
          <Route path={`${routes.author}/:slug`} element={<AuthorPage />} />
          <Route path={routes.issue} element={<IssuePage />} />
          <Route path={routes.issues} element={<IssuesPage />} />
          <Route path={routes.coverGallery} element={<CoverGalleryPage />} />
          <Route path={routes.tag} element={<TagPage />} />
          <Route path={`${routes.topic}/:tag`} element={<TopicPage />} />
          <Route
            path={routes.newsletterArchive}
            element={<NewsletterArchivePage />}
          />
          <Route
            path={`${routes.newsletterArchive}/:slug`}
            element={<NewsletterArchiveIssuePage />}
          />
          <Route
            path="/newsletter-archive/:slug"
            element={
              <ParamRedirect
                build={(p) => `/magazine/newsletter-archive/${p.slug ?? ""}`}
              />
            }
          />
          <Route path={routes.story} element={<StoryPage />} />
          <Route path={routes.storyTomas} element={<StoryTomasPage />} />
          <Route path={routes.storySafety} element={<StorySafetyPage />} />
          <Route path={routes.submitStory} element={<SubmitStoryPage />} />
          <Route path={routes.pitchTracker} element={<PitchTrackerPage />} />
          <Route
            path={routes.magazineEditor}
            element={<EditorDashboardPage />}
          />
          <Route path={routes.creatives} element={<CreativesPage />} />
          <Route path={routes.culture} element={<CulturePage />} />
          <Route path={routes.changelog} element={<ChangelogPage />} />
          <Route path={routes.roadmap} element={<RoadmapPage />} />
          <Route path={routes.pressArchive} element={<PressArchivePage />} />
          <Route
            path={routes.forOrganisations}
            element={<ForOrganisationsPage />}
          />
          <Route path={routes.pressKit} element={<PressKitPage />} />
          <Route path={routes.governance} element={<GovernancePage />} />
          <Route path={routes.privacy} element={<PrivacyPage />} />
          <Route path={routes.terms} element={<TermsPage />} />
          <Route path={routes.dsar} element={<DsarPage />} />
          <Route path={routes.cookies} element={<CookiesPage />} />
          <Route path={routes.constitution} element={<ConstitutionPage />} />
          <Route path={routes.codeOfConduct} element={<CodeOfConductPage />} />
          <Route
            path={routes.transparencyReport}
            element={<TransparencyReportPage />}
          />
          <Route path={routes.accessibility} element={<AccessibilityPage />} />
          <Route path={routes.guidelines} element={<GuidelinesPage />} />

          {/* Resources & Wellbeing */}
          <Route path={routes.wellbeing} element={<WellbeingPage />} />
          <Route path={routes.mentalHealth} element={<MentalHealthPage />} />
          <Route
            path={`${routes.therapists}/:id`}
            element={<TherapistProfilePage />}
          />
          <Route
            path="/therapist"
            element={
              <Navigate to={`${routes.therapists}/ines-pereira`} replace />
            }
          />
          <Route
            path={routes.transHealthcare}
            element={<TransHealthcarePage />}
          />
          <Route path={routes.harmReduction} element={<HarmReductionPage />} />
          <Route path={routes.sexualHealth} element={<SexualHealthPage />} />
          <Route path={routes.sober} element={<SoberPage />} />
          <Route path={routes.hateCrime} element={<HateCrimePage />} />
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
          <Route
            path={routes.sharedEquipment}
            element={<SharedEquipmentPage />}
          />
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
          <Route
            path={routes.comingOutAtWork}
            element={<ComingOutAtWorkPage />}
          />
          <Route
            path={routes.lgbtqAgingGuide}
            element={<LgbtqAgingGuidePage />}
          />
          <Route
            path={routes.oralHistoryProject}
            element={<OralHistoryProjectPage />}
          />
          <Route
            path={routes.ingredientsMap}
            element={<IngredientsMapPage />}
          />
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
          <Route path={routes.report} element={<ReportPage />} />
          <Route path={routes.blockMute} element={<BlockMutePage />} />
          <Route path={routes.appealOutcome} element={<AppealOutcomePage />} />

          {/* Auth & onboarding — branded AuthLoader fallback per chunk */}
          <Route path={routes.signIn} element={auth(<SignInPage />)} />
          <Route
            path={routes.createAccount}
            element={auth(<CreateAccountPage />)}
          />
          <Route path={routes.invite} element={auth(<InvitePage />)} />
          <Route
            path={`${routes.invite}/:code`}
            element={auth(<InviteLandingPage />)}
          />
          <Route
            path={routes.requestInvite}
            element={auth(<RequestInvitePage />)}
          />
          <Route path="/auth/onboarding" element={auth(<OnboardingPage />)} />
          <Route path={routes.welcome} element={auth(<OnboardingPage />)} />
          <Route
            path={routes.welcomeTour}
            element={auth(<WelcomeTourPage />)}
          />
          <Route
            path="/invite/:code"
            element={
              <ParamRedirect build={(p) => `/auth/invite/${p.code ?? ""}`} />
            }
          />

          {/* Jobs & economy */}
          <Route path={routes.jobs} element={<JobsPage />} />
          <Route path={routes.postJob} element={<PostJobPage />} />
          <Route path={`${routes.jobs}/:slug`} element={<JobDetailPage />} />
          <Route
            path={`${routes.jobs}/:slug/apply`}
            element={<JobApplyPage />}
          />
          <Route path={`${routes.company}/:slug`} element={<CompanyPage />} />
          <Route path={routes.housing} element={<HousingPage />} />
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
          <Route
            path="/work/housing/:slug"
            element={
              <ParamRedirect build={(p) => `/local/housing/${p.slug ?? ""}`} />
            }
          />
          <Route path={routes.skills} element={<SkillsPage />} />
          <Route path={`${routes.skills}/:id`} element={<WorkshopPage />} />
          <Route path={routes.grants} element={<GrantsPage />} />
          <Route path={routes.barter} element={<BarterPage />} />
          <Route path={`${routes.barter}/:id`} element={<BarterDetailPage />} />
          <Route path={routes.offer} element={<OfferPage />} />
          <Route
            path={routes.employerReviews}
            element={<EmployerReviewsPage />}
          />
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
            element={
              <ParamRedirect build={(p) => `/work/jobs/${p.slug ?? ""}`} />
            }
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
            element={
              <ParamRedirect build={(p) => `/work/barter/${p.id ?? ""}`} />
            }
          />
          <Route
            path="/mentorship/:slug"
            element={
              <ParamRedirect
                build={(p) => `/work/mentorship/${p.slug ?? ""}`}
              />
            }
          />
          <Route path={routes.economy} element={<EconomyPage />} />
          <Route path={routes.invoiceTool} element={<InvoiceGeneratorPage />} />
          <Route
            path={routes.contractTool}
            element={<ContractGeneratorPage />}
          />
          <Route path={routes.scopeTool} element={<ScopeGeneratorPage />} />
          <Route
            path={routes.reciboVerdeGuide}
            element={<ReciboVerdeGuidePage />}
          />
          <Route
            path={routes.takeHomeTool}
            element={<TakeHomeCalculatorPage />}
          />
          <Route path={routes.ivaTracker} element={<IvaTrackerPage />} />
          <Route path={routes.setAsideTool} element={<SetAsidePlannerPage />} />
          <Route
            path={routes.dayRateTool}
            element={<DayRateCalculatorPage />}
          />
          <Route path={routes.rateBoard} element={<RateBoardPage />} />
          <Route
            path={routes.slidingScaleTool}
            element={<SlidingScalePage />}
          />
          <Route path={routes.comparatorTool} element={<ComparatorPage />} />

          {/* Cinema */}
          <Route path={routes.cinema} element={<CinemaPage />} />
          <Route path="/cinema/browse" element={<CinemaBrowsePage />} />
          <Route
            path={routes.cinemaCollections}
            element={<CinemaCollectionsPage />}
          />
          <Route
            path={`${routes.cinemaCollections}/:slug`}
            element={<CinemaCollectionPage />}
          />
          <Route
            path={routes.cinemaMembership}
            element={<CinemaMembershipPage />}
          />
          <Route path={routes.cinemaWatch} element={<WatchPage />} />
          <Route
            path={`${routes.cinemaFilmmaker}/:slug`}
            element={<CinemaFilmmakerPage />}
          />
          <Route
            path={`${routes.cinemaCurator}/:slug`}
            element={<CinemaCuratorPage />}
          />
          <Route path={routes.cinemaAbout} element={<CinemaAboutPage />} />
          <Route path={routes.cinemaSubmit} element={<CinemaSubmitPage />} />
          <Route path={routes.cinemaShorts} element={<CinemaShortsPage />} />
          <Route
            path={routes.cinemaOpenCalls}
            element={<CinemaOpenCallsPage />}
          />
          <Route path={routes.cinemaRights} element={<CinemaRightsPage />} />
          <Route path={routes.film} element={<FilmPage />} />

          {/* Studio */}
          <Route path={routes.studio} element={<StudioPage />} />
          <Route path={routes.studioAlbum} element={<StudioAlbumPage />} />
          <Route path="/studio/artist" element={<StudioArtistPage />} />
          <Route path="/studio/dashboard" element={<StudioDashboardPage />} />
          <Route path={routes.studioUpload} element={<StudioUploadPage />} />
          <Route path={routes.studioPayouts} element={<StudioPayoutsPage />} />
          <Route path={routes.studioTrack} element={<StudioTrackPage />} />
          <Route path={routes.studioLive} element={<StudioLivePage />} />
          <Route
            path={routes.studioCollection}
            element={<StudioCollectionPage />}
          />
          <Route path={routes.studioSet} element={<StudioSetPage />} />
          <Route path={routes.studioSearch} element={<StudioSearchPage />} />
          <Route path={routes.studioLibrary} element={<StudioLibraryPage />} />
          <Route
            path={routes.studioCheckout}
            element={<StudioCheckoutPage />}
          />
          <Route
            path="/studio/sheet-store"
            element={<StudioSheetStorePage />}
          />
          <Route
            path="/studio/solidarity-fund"
            element={<StudioSolidarityFundPage />}
          />
          <Route path={routes.studioCalls} element={<StudioOpenCallsPage />} />
          <Route
            path={routes.studioSetSubmission}
            element={<StudioSetSubmissionPage />}
          />
          <Route path={routes.studioCouncil} element={<StudioCouncilPage />} />
          <Route path={routes.studioTriage} element={<StudioTriagePage />} />
          <Route
            path={routes.studioFlagReview}
            element={<StudioFlagReviewPage />}
          />
          <Route path="/studio/off-air" element={<StudioOffAirPage />} />
          <Route path="/studio/404" element={<Studio404Page />} />
          <Route path="/studio/500" element={<Studio500Page />} />
          <Route path="/studio/sign-in" element={<StudioSignInPage />} />
          <Route path="/studio/settings" element={<StudioSettingsPage />} />
          <Route path={routes.studioAbout} element={<StudioAboutPage />} />
          <Route
            path={routes.studioAccessibility}
            element={<StudioAccessibilityPage />}
          />
          <Route path={routes.studioTerms} element={<StudioTermsPage />} />
          <Route path={routes.studioHelp} element={<StudioHelpPage />} />
          <Route path={routes.studioPress} element={<StudioPressPage />} />
          <Route path={routes.studioEndCard} element={<StudioEndCardPage />} />
          <Route
            path={routes.studioNotifications}
            element={<StudioNotificationsPage />}
          />
          <Route path={routes.studioReceipt} element={<StudioReceiptPage />} />
          <Route path={routes.studioRights} element={<StudioRightsPage />} />
          <Route path={routes.studioProgram} element={<StudioProgramPage />} />
          <Route
            path={routes.studioBroadcast}
            element={<StudioBroadcastPage />}
          />
          <Route path={routes.studioWelcome} element={<StudioWelcomePage />} />
          <Route
            path={routes.studioWithdrawn}
            element={<StudioWithdrawnPage />}
          />

          {/* Community */}
          <Route path={routes.changemakers} element={<ChangemakersPage />} />
          <Route path="/changemaker/:slug" element={<ChangemakerStoryPage />} />
          <Route path={routes.forum} element={<ForumPage />} />
          <Route path="/thread" element={<ThreadPage />} />
          <Route path="/thread/:id" element={<ThreadPage />} />
          <Route path={routes.settings} element={<SettingsPage />} />

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
            path="/about/volunteer/opportunity/:slug"
            element={<VolunteerOpportunityPage />}
          />
          <Route path={routes.platforms} element={<PlatformsPage />} />
          <Route path={routes.donate} element={<DonatePage />} />
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

          {/* Flatmates merged into the Housing board as a tab. */}
          <Route
            path={routes.flatmates}
            element={
              <Navigate to={`${routes.housing}?tab=flatmates`} replace />
            }
          />
          <Route path={routes.solidarity} element={<SolidarityPage />} />

          {/* Local */}
          <Route path={routes.safeSpaces} element={<SafeSpacesPage />} />
          <Route
            path={`${routes.safeSpaces}/:slug`}
            element={<SafeSpaceDetailPage />}
          />
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
          <Route
            path={routes.listBusinessEdit}
            element={<ListBusinessPage />}
          />
          <Route path={`${routes.venue}/:id`} element={<VenueDetailPage />} />
          <Route
            path={`${routes.directory}/:slug`}
            element={<DirectorySpacePage />}
          />
          <Route
            path="/safe-space/:slug"
            element={
              <ParamRedirect
                build={(p) => `/local/safe-spaces/${p.slug ?? ""}`}
              />
            }
          />
          <Route
            path="/space/:slug"
            element={
              <ParamRedirect
                build={(p) => `/local/directory/${p.slug ?? ""}`}
              />
            }
          />

          {/* Account hub & settings sub-flows (all under /account) */}
          <Route
            path={routes.account}
            element={<Navigate to={routes.accountProfile} replace />}
          />
          <Route path={routes.editProfile} element={<EditProfilePage />} />
          <Route
            path={routes.subprofilesDashboard}
            element={<MySubprofilesPage />}
          />
          <Route
            path={`${routes.subprofilesDashboard}/:id/edit`}
            element={<SubprofileEditorPage />}
          />
          <Route path={routes.work} element={<WorkHubPage />} />
          <Route path={routes.workProfile} element={<WorkProfilePage />} />
          <Route path={routes.security} element={<SecurityPage />} />
          <Route path={routes.sessions} element={<SessionsPage />} />
          <Route path={routes.dataExport} element={<DataExportPage />} />
          <Route path={routes.deleteAccount} element={<DeleteAccountPage />} />

          {/* Legacy paths → new homes (keeps old links & design hrefs working) */}
          {LEGACY_REDIRECTS.map(([from, to]) => (
            <Route
              key={from}
              path={from}
              element={<Navigate to={to} replace />}
            />
          ))}

          {/* System, error & account-state screens */}
          <Route path={routes.serverError} element={<ServerErrorPage />} />
          <Route path={routes.maintenance} element={<MaintenancePage />} />
          <Route path={routes.offline} element={<OfflinePage />} />
          <Route path={routes.geoRestricted} element={<GeoRestrictedPage />} />
          <Route path={routes.pwaPrompt} element={<PwaPromptPage />} />
          <Route path={routes.accountBanned} element={<AccountBannedPage />} />
          <Route path={routes.accountLocked} element={<AccountLockedPage />} />
          <Route
            path={routes.accountSuspended}
            element={<AccountSuspendedPage />}
          />
          <Route path={routes.inviteExpired} element={<InviteExpiredPage />} />
          <Route path={routes.pendingReview} element={<PendingReviewPage />} />
          <Route
            path={routes.verificationNeeded}
            element={<VerificationNeededPage />}
          />
          <Route path={routes.status} element={<StatusPage />} />
          <Route path={routes.genesis} element={<GenesisPage />} />

          {/* Newly built community / resource / support pages */}
          <Route path={routes.comingOut} element={<ComingOutPage />} />
          <Route
            path={routes.parents}
            element={<Navigate to={routes.family} replace />}
          />
          <Route path={routes.gatherings} element={<GatheringsPage />} />
          <Route path={routes.vouch} element={<VouchPage />} />

          {/* Admin & moderation panel */}
          <Route path={routes.admin} element={<AdminDashboardPage />} />
          <Route
            path={routes.adminModeration}
            element={<AdminModerationPage />}
          />
          <Route path={routes.adminMembers} element={<AdminMembersPage />} />
          <Route path={routes.adminBots} element={<AdminBotsPage />} />
          <Route
            path={routes.adminSafeSpaces}
            element={<AdminSafeSpacesPage />}
          />
          <Route path={routes.adminListings} element={<AdminListingsPage />} />
          <Route
            path={routes.adminChangemakers}
            element={<AdminChangemakersPage />}
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
          <Route
            path={routes.adminGovernance}
            element={<AdminGovernancePage />}
          />
          <Route path={routes.adminSettings} element={<AdminSettingsPage />} />
          <Route
            path={`${routes.adminCommunities}/:slug/mod`}
            element={<AdminCommunityModPage />}
          />
          <Route path="/mod/:slug" element={<ModPanelPage />} />

          {/* Legacy aliases → canonical pages */}
          <Route
            path={routes.businessDirectory}
            element={<Navigate to={routes.directory} replace />}
          />
          <Route
            path={routes.spacesMap}
            element={<Navigate to={routes.map} replace />}
          />

          {/* Genuinely unknown paths → 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
