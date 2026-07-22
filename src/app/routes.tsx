import { lazy, Suspense, type ReactNode } from "react";
import {
  Navigate,
  Route,
  Routes,
  useParams,
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
const HomePage = lazy(() =>
  import("../features/homepage/HomePage").then((m) => ({
    default: m.HomePage,
  })),
);
const ProfilePage = lazy(() =>
  import("../features/members/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  })),
);
const MemberDirectoryFilterPage = lazy(() =>
  import("../features/members/MemberDirectoryFilterPage").then((m) => ({
    default: m.MemberDirectoryFilterPage,
  })),
);
const SubprofilePage = lazy(() =>
  import("../features/subprofiles/SubprofilePage").then((m) => ({
    default: m.SubprofilePage,
  })),
);
const SubprofileDirectoryPage = lazy(() =>
  import("../features/subprofiles/SubprofileDirectoryPage").then((m) => ({
    default: m.SubprofileDirectoryPage,
  })),
);
const MySubprofilesPage = lazy(() =>
  import("../features/subprofiles/MySubprofilesPage").then((m) => ({
    default: m.MySubprofilesPage,
  })),
);
const SubprofileEditorPage = lazy(() =>
  import("../features/subprofiles/SubprofileEditorPage").then((m) => ({
    default: m.SubprofileEditorPage,
  })),
);
const SearchPage = lazy(() =>
  import("../features/members/SearchPage").then((m) => ({
    default: m.SearchPage,
  })),
);
const ConnectionsPage = lazy(() =>
  import("../features/connect/ConnectionsPage").then((m) => ({
    default: m.ConnectionsPage,
  })),
);
const DatingPage = lazy(() =>
  import("../features/community/DatingPage").then((m) => ({
    default: m.DatingPage,
  })),
);
const ReadingGroupsPage = lazy(() =>
  import("../features/community/ReadingGroupsPage").then((m) => ({
    default: m.ReadingGroupsPage,
  })),
);
const FamilyPage = lazy(() =>
  import("../features/community/FamilyPage").then((m) => ({
    default: m.FamilyPage,
  })),
);
const CaregiversPage = lazy(() =>
  import("../features/community/CaregiversPage").then((m) => ({
    default: m.CaregiversPage,
  })),
);
const FeedPage = lazy(() =>
  import("../features/feed/FeedPage").then((m) => ({ default: m.FeedPage })),
);
const NotificationsPage = lazy(() =>
  import("../features/notifications/NotificationsPage").then((m) => ({
    default: m.NotificationsPage,
  })),
);
const MessagesPage = lazy(() =>
  import("../features/messages/MessagesPage").then((m) => ({
    default: m.MessagesPage,
  })),
);
const CommunitiesPage = lazy(() =>
  import("../features/communities/CommunitiesPage").then((m) => ({
    default: m.CommunitiesPage,
  })),
);
const CommunitiesHomePage = lazy(() =>
  import("../features/communities/CommunitiesHomePage").then((m) => ({
    default: m.CommunitiesHomePage,
  })),
);
const StartCommunityPage = lazy(() =>
  import("../features/communities/startCommunity/StartCommunityPage").then(
    (m) => ({
      default: m.StartCommunityPage,
    }),
  ),
);
const CommunityDetailPage = lazy(() =>
  import("../features/communities/CommunityDetailPage").then((m) => ({
    default: m.CommunityDetailPage,
  })),
);
const CalendarPage = lazy(() =>
  import("../features/gatherings/CalendarPage").then((m) => ({
    default: m.CalendarPage,
  })),
);
const GatheringPage = lazy(() =>
  import("../features/gatherings/GatheringPage").then((m) => ({
    default: m.GatheringPage,
  })),
);
const EventPage = lazy(() =>
  import("../features/gatherings/EventPage").then((m) => ({
    default: m.EventPage,
  })),
);
const EventsPage = lazy(() =>
  import("../features/gatherings/EventsPage").then((m) => ({
    default: m.EventsPage,
  })),
);
const MyEventsPage = lazy(() =>
  import("../features/myevents/MyEventsPage").then((m) => ({
    default: m.MyEventsPage,
  })),
);
const RsvpPage = lazy(() =>
  import("../features/gatherings/RsvpPage").then((m) => ({
    default: m.RsvpPage,
  })),
);
const GatheringRecapPage = lazy(() =>
  import("../features/gatherings/GatheringRecapPage").then((m) => ({
    default: m.GatheringRecapPage,
  })),
);
const CheckoutPage = lazy(() =>
  import("../features/gatherings/checkout/CheckoutPage").then((m) => ({
    default: m.CheckoutPage,
  })),
);
const HostPage = lazy(() =>
  import("../features/gatherings/HostPage").then((m) => ({
    default: m.HostPage,
  })),
);
const CreateGatheringPage = lazy(() =>
  import("../features/gatherings/CreateGatheringPage").then((m) => ({
    default: m.CreateGatheringPage,
  })),
);
const GatheringDashboardPage = lazy(() =>
  import("../features/gatherings/GatheringDashboardPage").then((m) => ({
    default: m.GatheringDashboardPage,
  })),
);
const ManageGatheringPage = lazy(() =>
  import("../features/gatherings/ManageGatheringPage").then((m) => ({
    default: m.ManageGatheringPage,
  })),
);
const CoHostInvitePage = lazy(() =>
  import("../features/gatherings/CoHostInvitePage").then((m) => ({
    default: m.CoHostInvitePage,
  })),
);
const GatheringCancelledPage = lazy(() =>
  import("../features/gatherings/GatheringCancelledPage").then((m) => ({
    default: m.GatheringCancelledPage,
  })),
);
const GatheringPhotosPage = lazy(() =>
  import("../features/gatherings/GatheringPhotosPage").then((m) => ({
    default: m.GatheringPhotosPage,
  })),
);
const MagazinePage = lazy(() =>
  import("../features/magazine/MagazinePage").then((m) => ({
    default: m.MagazinePage,
  })),
);
const ArticlePage = lazy(() =>
  import("../features/magazine/ArticlePage").then((m) => ({
    default: m.ArticlePage,
  })),
);
const AuthorPage = lazy(() =>
  import("../features/magazine/AuthorPage").then((m) => ({
    default: m.AuthorPage,
  })),
);
const IssuePage = lazy(() =>
  import("../features/magazine/IssuePage").then((m) => ({
    default: m.IssuePage,
  })),
);
const IssuesPage = lazy(() =>
  import("../features/magazine/IssuesPage").then((m) => ({
    default: m.IssuesPage,
  })),
);
const CoverGalleryPage = lazy(() =>
  import("../features/magazine/CoverGalleryPage").then((m) => ({
    default: m.CoverGalleryPage,
  })),
);
const TagPage = lazy(() =>
  import("../features/magazine/TagPage").then((m) => ({ default: m.TagPage })),
);
const TopicPage = lazy(() =>
  import("../features/topics/TopicPage").then((m) => ({
    default: m.TopicPage,
  })),
);
const PodcastShowPage = lazy(() =>
  import("../features/magazine/PodcastShowPage").then((m) => ({
    default: m.PodcastShowPage,
  })),
);
const AudioPlayerPage = lazy(() =>
  import("../features/magazine/AudioPlayerPage").then((m) => ({
    default: m.AudioPlayerPage,
  })),
);
const NewsletterArchivePage = lazy(() =>
  import("../features/magazine/NewsletterArchivePage").then((m) => ({
    default: m.NewsletterArchivePage,
  })),
);
const NewsletterArchiveIssuePage = lazy(() =>
  import("../features/magazine/NewsletterArchiveIssuePage").then((m) => ({
    default: m.NewsletterArchiveIssuePage,
  })),
);
const StoryPage = lazy(() =>
  import("../features/magazine/StoryPage").then((m) => ({
    default: m.StoryPage,
  })),
);
const StoryTomasPage = lazy(() =>
  import("../features/magazine/StoryTomasPage").then((m) => ({
    default: m.StoryTomasPage,
  })),
);
const StorySafetyPage = lazy(() =>
  import("../features/magazine/StorySafetyPage").then((m) => ({
    default: m.StorySafetyPage,
  })),
);
const CreativesPage = lazy(() =>
  import("../features/community/CreativesPage").then((m) => ({
    default: m.CreativesPage,
  })),
);
const CulturePage = lazy(() =>
  import("../features/culture/CulturePage").then((m) => ({
    default: m.CulturePage,
  })),
);
const ManifestoPage = lazy(() =>
  import("../features/marketing/ManifestoPage").then((m) => ({
    default: m.ManifestoPage,
  })),
);
const PrivacyPage = lazy(() =>
  import("../features/marketing/PrivacyPage").then((m) => ({
    default: m.PrivacyPage,
  })),
);
const TermsPage = lazy(() =>
  import("../features/marketing/TermsPage").then((m) => ({
    default: m.TermsPage,
  })),
);
const DsarPage = lazy(() =>
  import("../features/marketing/DsarPage").then((m) => ({
    default: m.DsarPage,
  })),
);
const ConstitutionPage = lazy(() =>
  import("../features/marketing/ConstitutionPage").then((m) => ({
    default: m.ConstitutionPage,
  })),
);
const CodeOfConductPage = lazy(() =>
  import("../features/marketing/CodeOfConductPage").then((m) => ({
    default: m.CodeOfConductPage,
  })),
);
const ChangelogPage = lazy(() =>
  import("../features/marketing/ChangelogPage").then((m) => ({
    default: m.ChangelogPage,
  })),
);
const RoadmapPage = lazy(() =>
  import("../features/marketing/RoadmapPage").then((m) => ({
    default: m.RoadmapPage,
  })),
);
const PressArchivePage = lazy(() =>
  import("../features/marketing/PressArchivePage").then((m) => ({
    default: m.PressArchivePage,
  })),
);
const AnnualAssemblyPage = lazy(() =>
  import("../features/marketing/AnnualAssemblyPage").then((m) => ({
    default: m.AnnualAssemblyPage,
  })),
);
const AssemblyMinutesPage = lazy(() =>
  import("../features/marketing/AssemblyMinutesPage").then((m) => ({
    default: m.AssemblyMinutesPage,
  })),
);
const GetTheAppPage = lazy(() =>
  import("../features/marketing/GetTheAppPage").then((m) => ({
    default: m.GetTheAppPage,
  })),
);
const CitiesPage = lazy(() =>
  import("../features/marketing/CitiesPage").then((m) => ({
    default: m.CitiesPage,
  })),
);
const ForOrganisationsPage = lazy(() =>
  import("../features/marketing/ForOrganisationsPage").then((m) => ({
    default: m.ForOrganisationsPage,
  })),
);
const PressKitPage = lazy(() =>
  import("../features/marketing/PressKitPage").then((m) => ({
    default: m.PressKitPage,
  })),
);
const TransparencyReportPage = lazy(() =>
  import("../features/marketing/TransparencyReportPage").then((m) => ({
    default: m.TransparencyReportPage,
  })),
);
const AccessibilityPage = lazy(() =>
  import("../features/marketing/AccessibilityPage").then((m) => ({
    default: m.AccessibilityPage,
  })),
);
const WellbeingPage = lazy(() =>
  import("../features/resources/WellbeingPage").then((m) => ({
    default: m.WellbeingPage,
  })),
);
const MentalHealthPage = lazy(() =>
  import("../features/resources/MentalHealthPage").then((m) => ({
    default: m.MentalHealthPage,
  })),
);
const TherapistProfilePage = lazy(() =>
  import("../features/resources/therapist/TherapistProfilePage").then((m) => ({
    default: m.TherapistProfilePage,
  })),
);
const TransHealthcarePage = lazy(() =>
  import("../features/resources/TransHealthcarePage").then((m) => ({
    default: m.TransHealthcarePage,
  })),
);
const HarmReductionPage = lazy(() =>
  import("../features/resources/HarmReductionPage").then((m) => ({
    default: m.HarmReductionPage,
  })),
);
const SexualHealthPage = lazy(() =>
  import("../features/resources/SexualHealthPage").then((m) => ({
    default: m.SexualHealthPage,
  })),
);
const SoberPage = lazy(() =>
  import("../features/resources/SoberPage").then((m) => ({
    default: m.SoberPage,
  })),
);
const Queer101Page = lazy(() =>
  import("../features/resources/Queer101Page").then((m) => ({
    default: m.Queer101Page,
  })),
);
const GlossaryPage = lazy(() =>
  import("../features/resources/GlossaryPage").then((m) => ({
    default: m.GlossaryPage,
  })),
);
const MicroGrantsPage = lazy(() =>
  import("../features/resources/MicroGrantsPage").then((m) => ({
    default: m.MicroGrantsPage,
  })),
);
const IntersectionalityPage = lazy(() =>
  import("../features/resources/IntersectionalityPage").then((m) => ({
    default: m.IntersectionalityPage,
  })),
);
const TransHubPage = lazy(() =>
  import("../features/resources/TransHubPage").then((m) => ({
    default: m.TransHubPage,
  })),
);
const LegalPage = lazy(() =>
  import("../features/resources/LegalPage").then((m) => ({
    default: m.LegalPage,
  })),
);
const SafetyPage = lazy(() =>
  import("../features/resources/SafetyPage").then((m) => ({
    default: m.SafetyPage,
  })),
);
const SignInPage = lazy(() =>
  import("../features/auth/SignInPage").then((m) => ({
    default: m.SignInPage,
  })),
);
const CreateAccountPage = lazy(() =>
  import("../features/auth/CreateAccountPage").then((m) => ({
    default: m.CreateAccountPage,
  })),
);
const InvitePage = lazy(() =>
  import("../features/auth/InvitePage").then((m) => ({
    default: m.InvitePage,
  })),
);
const RequestInvitePage = lazy(() =>
  import("../features/auth/RequestInvitePage").then((m) => ({
    default: m.RequestInvitePage,
  })),
);
const OnboardingPage = lazy(() =>
  import("../features/auth/OnboardingPage").then((m) => ({
    default: m.OnboardingPage,
  })),
);
const WelcomeTourPage = lazy(() =>
  import("../features/auth/WelcomeTourPage").then((m) => ({
    default: m.WelcomeTourPage,
  })),
);
const JobsPage = lazy(() =>
  import("../features/economy/JobsPage").then((m) => ({ default: m.JobsPage })),
);
const JobDetailPage = lazy(() =>
  import("../features/economy/JobDetailPage").then((m) => ({
    default: m.JobDetailPage,
  })),
);
const CompanyPage = lazy(() =>
  import("../features/economy/CompanyPage").then((m) => ({
    default: m.CompanyPage,
  })),
);
const PostJobPage = lazy(() =>
  import("../features/economy/PostJobPage").then((m) => ({
    default: m.PostJobPage,
  })),
);
const JobApplyPage = lazy(() =>
  import("../features/economy/JobApplyPage").then((m) => ({
    default: m.JobApplyPage,
  })),
);
const HousingPage = lazy(() =>
  import("../features/economy/HousingPage").then((m) => ({
    default: m.HousingPage,
  })),
);
const HousingCoopPage = lazy(() =>
  import("../features/economy/HousingCoopPage").then((m) => ({
    default: m.HousingCoopPage,
  })),
);
const CoopTemplatePage = lazy(() =>
  import("../features/economy/CoopTemplatePage").then((m) => ({
    default: m.CoopTemplatePage,
  })),
);
const HousingListingPage = lazy(() =>
  import("../features/economy/HousingListingPage").then((m) => ({
    default: m.HousingListingPage,
  })),
);
const LandlordPage = lazy(() =>
  import("../features/economy/LandlordPage").then((m) => ({
    default: m.LandlordPage,
  })),
);
const SkillsPage = lazy(() =>
  import("../features/economy/SkillsPage").then((m) => ({
    default: m.SkillsPage,
  })),
);
const WorkshopPage = lazy(() =>
  import("../features/economy/WorkshopPage").then((m) => ({
    default: m.WorkshopPage,
  })),
);
const GrantsPage = lazy(() =>
  import("../features/economy/GrantsPage").then((m) => ({
    default: m.GrantsPage,
  })),
);
const BarterPage = lazy(() =>
  import("../features/economy/BarterPage").then((m) => ({
    default: m.BarterPage,
  })),
);
const BarterDetailPage = lazy(() =>
  import("../features/economy/BarterDetailPage").then((m) => ({
    default: m.BarterDetailPage,
  })),
);
const OfferPage = lazy(() =>
  import("../features/economy/OfferPage").then((m) => ({
    default: m.OfferPage,
  })),
);
const EmployerReviewsPage = lazy(() =>
  import("../features/economy/EmployerReviewsPage").then((m) => ({
    default: m.EmployerReviewsPage,
  })),
);
const ApplicationStatusPage = lazy(() =>
  import("../features/economy/ApplicationStatusPage").then((m) => ({
    default: m.ApplicationStatusPage,
  })),
);
const MentorshipPage = lazy(() =>
  import("../features/economy/MentorshipPage").then((m) => ({
    default: m.MentorshipPage,
  })),
);
const MentorDetailPage = lazy(() =>
  import("../features/economy/MentorDetailPage").then((m) => ({
    default: m.MentorDetailPage,
  })),
);
const EconomyPage = lazy(() =>
  import("../features/economy/EconomyPage").then((m) => ({
    default: m.EconomyPage,
  })),
);
const InvoiceGeneratorPage = lazy(() =>
  import("../features/economy/InvoiceGeneratorPage").then((m) => ({
    default: m.InvoiceGeneratorPage,
  })),
);
const ContractGeneratorPage = lazy(() =>
  import("../features/economy/ContractGeneratorPage").then((m) => ({
    default: m.ContractGeneratorPage,
  })),
);
const ScopeGeneratorPage = lazy(() =>
  import("../features/economy/ScopeGeneratorPage").then((m) => ({
    default: m.ScopeGeneratorPage,
  })),
);
const ReciboVerdeGuidePage = lazy(() =>
  import("../features/economy/ReciboVerdeGuidePage").then((m) => ({
    default: m.ReciboVerdeGuidePage,
  })),
);
const TakeHomeCalculatorPage = lazy(() =>
  import("../features/economy/TakeHomeCalculatorPage").then((m) => ({
    default: m.TakeHomeCalculatorPage,
  })),
);
const IvaTrackerPage = lazy(() =>
  import("../features/economy/IvaTrackerPage").then((m) => ({
    default: m.IvaTrackerPage,
  })),
);
const SetAsidePlannerPage = lazy(() =>
  import("../features/economy/SetAsidePlannerPage").then((m) => ({
    default: m.SetAsidePlannerPage,
  })),
);
const DayRateCalculatorPage = lazy(() =>
  import("../features/economy/DayRateCalculatorPage").then((m) => ({
    default: m.DayRateCalculatorPage,
  })),
);
const RateBoardPage = lazy(() =>
  import("../features/economy/RateBoardPage").then((m) => ({
    default: m.RateBoardPage,
  })),
);
const SlidingScalePage = lazy(() =>
  import("../features/economy/SlidingScalePage").then((m) => ({
    default: m.SlidingScalePage,
  })),
);
const ComparatorPage = lazy(() =>
  import("../features/economy/ComparatorPage").then((m) => ({
    default: m.ComparatorPage,
  })),
);
const RunningGuidePage = lazy(() =>
  import("../features/resources/RunningGuidePage").then((m) => ({
    default: m.RunningGuidePage,
  })),
);
const AccessibleLisbonPage = lazy(() =>
  import("../features/resources/AccessibleLisbonPage").then((m) => ({
    default: m.AccessibleLisbonPage,
  })),
);
const PeerSupportPage = lazy(() =>
  import("../features/resources/PeerSupportPage").then((m) => ({
    default: m.PeerSupportPage,
  })),
);
const ArtCritGuidePage = lazy(() =>
  import("../features/resources/ArtCritGuidePage").then((m) => ({
    default: m.ArtCritGuidePage,
  })),
);
const SharedEquipmentPage = lazy(() =>
  import("../features/resources/SharedEquipmentPage").then((m) => ({
    default: m.SharedEquipmentPage,
  })),
);
const GroupShowArchivePage = lazy(() =>
  import("../features/resources/GroupShowArchivePage").then((m) => ({
    default: m.GroupShowArchivePage,
  })),
);
const FirstMeetupGuidePage = lazy(() =>
  import("../features/resources/FirstMeetupGuidePage").then((m) => ({
    default: m.FirstMeetupGuidePage,
  })),
);
const QueerPaediatriciansPage = lazy(() =>
  import("../features/resources/QueerPaediatriciansPage").then((m) => ({
    default: m.QueerPaediatriciansPage,
  })),
);
const SchoolFormsGuidePage = lazy(() =>
  import("../features/resources/SchoolFormsGuidePage").then((m) => ({
    default: m.SchoolFormsGuidePage,
  })),
);
const CommunityPrivacyPage = lazy(() =>
  import("../features/resources/CommunityPrivacyPage").then((m) => ({
    default: m.CommunityPrivacyPage,
  })),
);
const ComingOutAtWorkPage = lazy(() =>
  import("../features/resources/ComingOutAtWorkPage").then((m) => ({
    default: m.ComingOutAtWorkPage,
  })),
);
const LgbtqAgingGuidePage = lazy(() =>
  import("../features/resources/LgbtqAgingGuidePage").then((m) => ({
    default: m.LgbtqAgingGuidePage,
  })),
);
const OralHistoryProjectPage = lazy(() =>
  import("../features/resources/OralHistoryProjectPage").then((m) => ({
    default: m.OralHistoryProjectPage,
  })),
);
const IngredientsMapPage = lazy(() =>
  import("../features/resources/IngredientsMapPage").then((m) => ({
    default: m.IngredientsMapPage,
  })),
);
const QtipocOrganisationsPage = lazy(() =>
  import("../features/resources/QtipocOrganisationsPage").then((m) => ({
    default: m.QtipocOrganisationsPage,
  })),
);
const QtipocArchivePage = lazy(() =>
  import("../features/resources/QtipocArchivePage").then((m) => ({
    default: m.QtipocArchivePage,
  })),
);
const DisabilityHealthcarePage = lazy(() =>
  import("../features/resources/DisabilityHealthcarePage").then((m) => ({
    default: m.DisabilityHealthcarePage,
  })),
);
const SpoonTheoryPage = lazy(() =>
  import("../features/resources/SpoonTheoryPage").then((m) => ({
    default: m.SpoonTheoryPage,
  })),
);
const CinemaPage = lazy(() =>
  import("../features/cinema/CinemaPage").then((m) => ({
    default: m.CinemaPage,
  })),
);
const CinemaBrowsePage = lazy(() =>
  import("../features/cinema/CinemaBrowsePage").then((m) => ({
    default: m.CinemaBrowsePage,
  })),
);
const CinemaMembershipPage = lazy(() =>
  import("../features/cinema/CinemaMembershipPage").then((m) => ({
    default: m.CinemaMembershipPage,
  })),
);
const FilmPage = lazy(() =>
  import("../features/cinema/FilmPage").then((m) => ({ default: m.FilmPage })),
);
const CinemaFilmmakerPage = lazy(() =>
  import("../features/cinema/CinemaFilmmakerPage").then((m) => ({
    default: m.CinemaFilmmakerPage,
  })),
);
const CinemaCuratorPage = lazy(() =>
  import("../features/cinema/CinemaCuratorPage").then((m) => ({
    default: m.CinemaCuratorPage,
  })),
);
const CinemaCollectionsPage = lazy(() =>
  import("../features/cinema/CinemaCollectionsPage").then((m) => ({
    default: m.CinemaCollectionsPage,
  })),
);
const CinemaCollectionPage = lazy(() =>
  import("../features/cinema/CinemaCollectionPage").then((m) => ({
    default: m.CinemaCollectionPage,
  })),
);
const CinemaAboutPage = lazy(() =>
  import("../features/cinema/CinemaAboutPage").then((m) => ({
    default: m.CinemaAboutPage,
  })),
);
const WatchPage = lazy(() =>
  import("../features/cinema/WatchPage").then((m) => ({
    default: m.WatchPage,
  })),
);
const CinemaSubmitPage = lazy(() =>
  import("../features/cinema/CinemaSubmitPage").then((m) => ({
    default: m.CinemaSubmitPage,
  })),
);
const CinemaShortsPage = lazy(() =>
  import("../features/cinema/CinemaShortsPage").then((m) => ({
    default: m.CinemaShortsPage,
  })),
);
const CinemaOpenCallsPage = lazy(() =>
  import("../features/cinema/CinemaOpenCallsPage").then((m) => ({
    default: m.CinemaOpenCallsPage,
  })),
);
const CinemaRightsPage = lazy(() =>
  import("../features/cinema/CinemaRightsPage").then((m) => ({
    default: m.CinemaRightsPage,
  })),
);
const StudioPage = lazy(() =>
  import("../features/studio/StudioPage").then((m) => ({
    default: m.StudioPage,
  })),
);
const StudioAlbumPage = lazy(() =>
  import("../features/studio/StudioAlbumPage").then((m) => ({
    default: m.StudioAlbumPage,
  })),
);
const StudioArtistPage = lazy(() =>
  import("../features/studio/StudioArtistPage").then((m) => ({
    default: m.StudioArtistPage,
  })),
);
const StudioDashboardPage = lazy(() =>
  import("../features/studio/StudioDashboardPage").then((m) => ({
    default: m.StudioDashboardPage,
  })),
);
const StudioUploadPage = lazy(() =>
  import("../features/studio/StudioUploadPage").then((m) => ({
    default: m.StudioUploadPage,
  })),
);
const StudioPayoutsPage = lazy(() =>
  import("../features/studio/StudioPayoutsPage").then((m) => ({
    default: m.StudioPayoutsPage,
  })),
);
const StudioTrackPage = lazy(() =>
  import("../features/studio/StudioTrackPage").then((m) => ({
    default: m.StudioTrackPage,
  })),
);
const StudioLivePage = lazy(() =>
  import("../features/studio/StudioLivePage").then((m) => ({
    default: m.StudioLivePage,
  })),
);
const StudioSheetStorePage = lazy(() =>
  import("../features/studio/StudioSheetStorePage").then((m) => ({
    default: m.StudioSheetStorePage,
  })),
);
const StudioSolidarityFundPage = lazy(() =>
  import("../features/studio/StudioSolidarityFundPage").then((m) => ({
    default: m.StudioSolidarityFundPage,
  })),
);
const StudioOpenCallsPage = lazy(() =>
  import("../features/studio/StudioOpenCallsPage").then((m) => ({
    default: m.StudioOpenCallsPage,
  })),
);
const StudioSetSubmissionPage = lazy(() =>
  import("../features/studio/StudioSetSubmissionPage").then((m) => ({
    default: m.StudioSetSubmissionPage,
  })),
);
const StudioCouncilPage = lazy(() =>
  import("../features/studio/StudioCouncilPage").then((m) => ({
    default: m.StudioCouncilPage,
  })),
);
const StudioTriagePage = lazy(() =>
  import("../features/studio/StudioTriagePage").then((m) => ({
    default: m.StudioTriagePage,
  })),
);
const StudioFlagReviewPage = lazy(() =>
  import("../features/studio/StudioFlagReviewPage").then((m) => ({
    default: m.StudioFlagReviewPage,
  })),
);
const StudioAboutPage = lazy(() =>
  import("../features/studio/StudioAboutPage").then((m) => ({
    default: m.StudioAboutPage,
  })),
);
const StudioAccessibilityPage = lazy(() =>
  import("../features/studio/StudioAccessibilityPage").then((m) => ({
    default: m.StudioAccessibilityPage,
  })),
);
const StudioTermsPage = lazy(() =>
  import("../features/studio/StudioTermsPage").then((m) => ({
    default: m.StudioTermsPage,
  })),
);
const StudioHelpPage = lazy(() =>
  import("../features/studio/StudioHelpPage").then((m) => ({
    default: m.StudioHelpPage,
  })),
);
const StudioPressPage = lazy(() =>
  import("../features/studio/StudioPressPage").then((m) => ({
    default: m.StudioPressPage,
  })),
);
const StudioEndCardPage = lazy(() =>
  import("../features/studio/StudioEndCardPage").then((m) => ({
    default: m.StudioEndCardPage,
  })),
);
const StudioNotificationsPage = lazy(() =>
  import("../features/studio/StudioNotificationsPage").then((m) => ({
    default: m.StudioNotificationsPage,
  })),
);
const StudioReceiptPage = lazy(() =>
  import("../features/studio/StudioReceiptPage").then((m) => ({
    default: m.StudioReceiptPage,
  })),
);
const StudioRightsPage = lazy(() =>
  import("../features/studio/StudioRightsPage").then((m) => ({
    default: m.StudioRightsPage,
  })),
);
const StudioProgramPage = lazy(() =>
  import("../features/studio/StudioProgramPage").then((m) => ({
    default: m.StudioProgramPage,
  })),
);
const StudioBroadcastPage = lazy(() =>
  import("../features/studio/StudioBroadcastPage").then((m) => ({
    default: m.StudioBroadcastPage,
  })),
);
const StudioWelcomePage = lazy(() =>
  import("../features/studio/StudioWelcomePage").then((m) => ({
    default: m.StudioWelcomePage,
  })),
);
const StudioWithdrawnPage = lazy(() =>
  import("../features/studio/StudioWithdrawnPage").then((m) => ({
    default: m.StudioWithdrawnPage,
  })),
);
const ChangemakersPage = lazy(() =>
  import("../features/community/ChangemakersPage").then((m) => ({
    default: m.ChangemakersPage,
  })),
);
const ChangemakerStoryPage = lazy(() =>
  import("../features/community/ChangemakerStoryPage").then((m) => ({
    default: m.ChangemakerStoryPage,
  })),
);
const ForumPage = lazy(() =>
  import("../features/forum/ForumPage").then((m) => ({ default: m.ForumPage })),
);
const ThreadPage = lazy(() =>
  import("../features/forum/ThreadPage").then((m) => ({
    default: m.ThreadPage,
  })),
);
const SettingsPage = lazy(() =>
  import("../features/settings/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);
const GovernancePage = lazy(() =>
  import("../features/governance/GovernancePage").then((m) => ({
    default: m.GovernancePage,
  })),
);
const AboutPage = lazy(() =>
  import("../features/marketing/AboutPage").then((m) => ({
    default: m.AboutPage,
  })),
);
const ContactPage = lazy(() =>
  import("../features/marketing/ContactPage").then((m) => ({
    default: m.ContactPage,
  })),
);
const HelpPage = lazy(() =>
  import("../features/marketing/HelpPage").then((m) => ({
    default: m.HelpPage,
  })),
);
const VolunteerPage = lazy(() =>
  import("../features/marketing/VolunteerPage").then((m) => ({
    default: m.VolunteerPage,
  })),
);
const VolunteerOpportunityPage = lazy(() =>
  import("../features/marketing/VolunteerOpportunityPage").then((m) => ({
    default: m.VolunteerOpportunityPage,
  })),
);
const PostVolunteerOpportunityPage = lazy(() =>
  import("../features/marketing/PostVolunteerOpportunityPage").then((m) => ({
    default: m.PostVolunteerOpportunityPage,
  })),
);
const GuidelinesPage = lazy(() =>
  import("../features/marketing/GuidelinesPage").then((m) => ({
    default: m.GuidelinesPage,
  })),
);
const DirectoryPage = lazy(() =>
  import("../features/marketing/DirectoryPage").then((m) => ({
    default: m.DirectoryPage,
  })),
);
const DirectorySpacePage = lazy(() =>
  import("../features/marketing/DirectorySpacePage").then((m) => ({
    default: m.DirectorySpacePage,
  })),
);
const ListBusinessPage = lazy(() =>
  import("../features/marketing/listBusiness/ListBusinessPage").then((m) => ({
    default: m.ListBusinessPage,
  })),
);
const ResourceLibraryPage = lazy(() =>
  import("../features/marketing/ResourceLibraryPage").then((m) => ({
    default: m.ResourceLibraryPage,
  })),
);
const PartnersPage = lazy(() =>
  import("../features/marketing/PartnersPage").then((m) => ({
    default: m.PartnersPage,
  })),
);
const SubmitPartnerApplicationPage = lazy(() =>
  import("../features/marketing/SubmitPartnerApplicationPage").then((m) => ({
    default: m.SubmitPartnerApplicationPage,
  })),
);
const PartnerDetailPage = lazy(() =>
  import("../features/marketing/PartnerDetailPage").then((m) => ({
    default: m.PartnerDetailPage,
  })),
);
const ActivismPage = lazy(() =>
  import("../features/marketing/ActivismPage").then((m) => ({
    default: m.ActivismPage,
  })),
);
const OpenLetterPage = lazy(() =>
  import("../features/marketing/OpenLetterPage").then((m) => ({
    default: m.OpenLetterPage,
  })),
);
const PlatformsPage = lazy(() =>
  import("../features/marketing/PlatformsPage").then((m) => ({
    default: m.PlatformsPage,
  })),
);
const MapPage = lazy(() =>
  import("../features/marketing/MapPage").then((m) => ({ default: m.MapPage })),
);
const SafeSpacesPage = lazy(() =>
  import("../features/safety/SafeSpacesPage").then((m) => ({
    default: m.SafeSpacesPage,
  })),
);
const SafeSpaceDetailPage = lazy(() =>
  import("../features/safety/SafeSpaceDetailPage").then((m) => ({
    default: m.SafeSpaceDetailPage,
  })),
);
const SolidarityPage = lazy(() =>
  import("../features/economy/SolidarityPage").then((m) => ({
    default: m.SolidarityPage,
  })),
);
const VisasPage = lazy(() =>
  import("../features/marketing/VisasPage").then((m) => ({
    default: m.VisasPage,
  })),
);
const ArrivingPage = lazy(() =>
  import("../features/marketing/ArrivingPage").then((m) => ({
    default: m.ArrivingPage,
  })),
);
const HateCrimePage = lazy(() =>
  import("../features/safety/HateCrimePage").then((m) => ({
    default: m.HateCrimePage,
  })),
);
const EmergencyPage = lazy(() =>
  import("../features/safety/EmergencyPage").then((m) => ({
    default: m.EmergencyPage,
  })),
);
const ReportPage = lazy(() =>
  import("../features/safety/ReportPage").then((m) => ({
    default: m.ReportPage,
  })),
);
const BlockMutePage = lazy(() =>
  import("../features/safety/BlockMutePage").then((m) => ({
    default: m.BlockMutePage,
  })),
);
const AppealOutcomePage = lazy(() =>
  import("../features/safety/AppealOutcomePage").then((m) => ({
    default: m.AppealOutcomePage,
  })),
);
const PlaceholderPage = lazy(() =>
  import("../pages/PlaceholderPage").then((m) => ({
    default: m.PlaceholderPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("../pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
const ServerErrorPage = lazy(() =>
  import("../features/system/ServerErrorPage").then((m) => ({
    default: m.ServerErrorPage,
  })),
);
const MaintenancePage = lazy(() =>
  import("../features/system/MaintenancePage").then((m) => ({
    default: m.MaintenancePage,
  })),
);
const OfflinePage = lazy(() =>
  import("../features/system/OfflinePage").then((m) => ({
    default: m.OfflinePage,
  })),
);
const GeoRestrictedPage = lazy(() =>
  import("../features/system/GeoRestrictedPage").then((m) => ({
    default: m.GeoRestrictedPage,
  })),
);
const PwaPromptPage = lazy(() =>
  import("../features/system/PwaPromptPage").then((m) => ({
    default: m.PwaPromptPage,
  })),
);
const AccountBannedPage = lazy(() =>
  import("../features/system/AccountBannedPage").then((m) => ({
    default: m.AccountBannedPage,
  })),
);
const AccountLockedPage = lazy(() =>
  import("../features/system/AccountLockedPage").then((m) => ({
    default: m.AccountLockedPage,
  })),
);
const AccountSuspendedPage = lazy(() =>
  import("../features/system/AccountSuspendedPage").then((m) => ({
    default: m.AccountSuspendedPage,
  })),
);
const InviteExpiredPage = lazy(() =>
  import("../features/system/InviteExpiredPage").then((m) => ({
    default: m.InviteExpiredPage,
  })),
);
const InviteLandingPage = lazy(() =>
  import("../features/system/InviteLandingPage").then((m) => ({
    default: m.InviteLandingPage,
  })),
);
const PendingReviewPage = lazy(() =>
  import("../features/system/PendingReviewPage").then((m) => ({
    default: m.PendingReviewPage,
  })),
);
const VerificationNeededPage = lazy(() =>
  import("../features/system/VerificationNeededPage").then((m) => ({
    default: m.VerificationNeededPage,
  })),
);
const StatusPage = lazy(() =>
  import("../features/system/StatusPage").then((m) => ({
    default: m.StatusPage,
  })),
);
const GenesisPage = lazy(() =>
  import("../features/system/GenesisPage").then((m) => ({
    default: m.GenesisPage,
  })),
);
const Studio404Page = lazy(() =>
  import("../features/studio/Studio404Page").then((m) => ({
    default: m.Studio404Page,
  })),
);
const Studio500Page = lazy(() =>
  import("../features/studio/Studio500Page").then((m) => ({
    default: m.Studio500Page,
  })),
);
const StudioOffAirPage = lazy(() =>
  import("../features/studio/StudioOffAirPage").then((m) => ({
    default: m.StudioOffAirPage,
  })),
);
const StudioSignInPage = lazy(() =>
  import("../features/studio/StudioSignInPage").then((m) => ({
    default: m.StudioSignInPage,
  })),
);
const StudioSettingsPage = lazy(() =>
  import("../features/studio/StudioSettingsPage").then((m) => ({
    default: m.StudioSettingsPage,
  })),
);
const DataExportPage = lazy(() =>
  import("../features/settings/DataExportPage").then((m) => ({
    default: m.DataExportPage,
  })),
);
const DeleteAccountPage = lazy(() =>
  import("../features/settings/DeleteAccountPage").then((m) => ({
    default: m.DeleteAccountPage,
  })),
);
const EditProfilePage = lazy(() =>
  import("../features/settings/EditProfilePage").then((m) => ({
    default: m.EditProfilePage,
  })),
);
const SecurityPage = lazy(() =>
  import("../features/settings/SecurityPage").then((m) => ({
    default: m.SecurityPage,
  })),
);
const SessionsPage = lazy(() =>
  import("../features/settings/SessionsPage").then((m) => ({
    default: m.SessionsPage,
  })),
);
const SustainerPage = lazy(() =>
  import("../features/support/SustainerPage").then((m) => ({
    default: m.SustainerPage,
  })),
);
const PublicProfilePage = lazy(() =>
  import("../features/members/PublicProfilePage").then((m) => ({
    default: m.PublicProfilePage,
  })),
);
const WorkHubPage = lazy(() =>
  import("../features/economy/WorkHubPage").then((m) => ({
    default: m.WorkHubPage,
  })),
);
const WorkProfilePage = lazy(() =>
  import("../features/economy/WorkProfilePage").then((m) => ({
    default: m.WorkProfilePage,
  })),
);
const MentionsPage = lazy(() =>
  import("../features/notifications/MentionsPage").then((m) => ({
    default: m.MentionsPage,
  })),
);
const CollectionsPage = lazy(() =>
  import("../features/members/CollectionsPage").then((m) => ({
    default: m.CollectionsPage,
  })),
);
const BadgesPage = lazy(() =>
  import("../features/members/BadgesPage").then((m) => ({
    default: m.BadgesPage,
  })),
);
const PerksPage = lazy(() =>
  import("../features/members/PerksPage").then((m) => ({
    default: m.PerksPage,
  })),
);
const DraftsPage = lazy(() =>
  import("../features/members/DraftsPage").then((m) => ({
    default: m.DraftsPage,
  })),
);
const CookiesPage = lazy(() =>
  import("../features/marketing/CookiesPage").then((m) => ({
    default: m.CookiesPage,
  })),
);
const PronounsGuidePage = lazy(() =>
  import("../features/resources/PronounsGuidePage").then((m) => ({
    default: m.PronounsGuidePage,
  })),
);
const LibraryPage = lazy(() =>
  import("../features/resources/LibraryPage").then((m) => ({
    default: m.LibraryPage,
  })),
);
const ComingOutPage = lazy(() =>
  import("../features/community/ComingOutPage").then((m) => ({
    default: m.ComingOutPage,
  })),
);
const GatheringsPage = lazy(() =>
  import("../features/gatherings/GatheringsPage").then((m) => ({
    default: m.GatheringsPage,
  })),
);
const VouchPage = lazy(() =>
  import("../features/members/VouchPage").then((m) => ({
    default: m.VouchPage,
  })),
);
const DonatePage = lazy(() =>
  import("../features/marketing/DonatePage").then((m) => ({
    default: m.DonatePage,
  })),
);
const SubmitStoryPage = lazy(() =>
  import("../features/magazine/SubmitStoryPage").then((m) => ({
    default: m.SubmitStoryPage,
  })),
);
const PitchTrackerPage = lazy(() =>
  import("../features/magazine/PitchTrackerPage").then((m) => ({
    default: m.PitchTrackerPage,
  })),
);
const EditorDashboardPage = lazy(() =>
  import("../features/magazine/EditorDashboardPage").then((m) => ({
    default: m.EditorDashboardPage,
  })),
);
const StudioCollectionPage = lazy(() =>
  import("../features/studio/StudioCollectionPage").then((m) => ({
    default: m.StudioCollectionPage,
  })),
);
const StudioSetPage = lazy(() =>
  import("../features/studio/StudioSetPage").then((m) => ({
    default: m.StudioSetPage,
  })),
);
const StudioSearchPage = lazy(() =>
  import("../features/studio/StudioSearchPage").then((m) => ({
    default: m.StudioSearchPage,
  })),
);
const StudioLibraryPage = lazy(() =>
  import("../features/studio/StudioLibraryPage").then((m) => ({
    default: m.StudioLibraryPage,
  })),
);
const StudioCheckoutPage = lazy(() =>
  import("../features/studio/StudioCheckoutPage").then((m) => ({
    default: m.StudioCheckoutPage,
  })),
);
const AdminDashboardPage = lazy(() =>
  import("../features/admin/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const AdminModerationPage = lazy(() =>
  import("../features/admin/AdminModerationPage").then((m) => ({
    default: m.AdminModerationPage,
  })),
);
const AdminMembersPage = lazy(() =>
  import("../features/admin/AdminMembersPage").then((m) => ({
    default: m.AdminMembersPage,
  })),
);
const AdminSafeSpacesPage = lazy(() =>
  import("../features/admin/AdminSafeSpacesPage").then((m) => ({
    default: m.AdminSafeSpacesPage,
  })),
);
const AdminChangemakersPage = lazy(() =>
  import("../features/admin/AdminChangemakersPage").then((m) => ({
    default: m.AdminChangemakersPage,
  })),
);
const AdminCommunitiesPage = lazy(() =>
  import("../features/admin/AdminCommunitiesPage").then((m) => ({
    default: m.AdminCommunitiesPage,
  })),
);
const AdminCommunityModPage = lazy(() =>
  import("../features/admin/AdminCommunityModPage").then((m) => ({
    default: m.AdminCommunityModPage,
  })),
);
const AdminGovernancePage = lazy(() =>
  import("../features/admin/AdminGovernancePage").then((m) => ({
    default: m.AdminGovernancePage,
  })),
);
const ModPanelPage = lazy(() =>
  import("../features/admin/ModPanelPage").then((m) => ({
    default: m.ModPanelPage,
  })),
);
const AdminPartnerApplicationsPage = lazy(() =>
  import("../features/admin/AdminPartnerApplicationsPage").then((m) => ({
    default: m.AdminPartnerApplicationsPage,
  })),
);
const AdminHousingCoopsPage = lazy(() =>
  import("../features/admin/AdminHousingCoopsPage").then((m) => ({
    default: m.AdminHousingCoopsPage,
  })),
);
const AdminSettingsPage = lazy(() =>
  import("../features/admin/AdminSettingsPage").then((m) => ({
    default: m.AdminSettingsPage,
  })),
);
import { KNOWN_ROUTE_SLUGS, routes } from "./routeMap";
import { useAuthGateRedirect, isGatedPath, isGuestOnlyPath } from "./authGate";
import { useAuth } from "./providers/authContext";

/** Top-level slugs that now have real pages — excluded from the placeholder fallback. */
const BUILT_SLUGS = new Set([
  "feed",
  "members",
  "member-directory-filter",
  "search",
  "connections",
  "dating",
  "reading-groups",
  "family",
  "profile",
  "messages",
  "notifications",
  "communities",
  "calendar",
  "events",
  "gathering",
  "event",
  "rsvp",
  "rsvp-ticket",
  "gathering-recap",
  "host",
  "magazine",
  "safety",
  "film",
  "changemakers",
  "forum",
  "thread",
  "settings",
  "about",
  "archive",
  "resources",
  "activism",
  "economy",
  "coming-out",
  "parents",
  "caregivers",
  "gatherings",
]);

/**
 * Legacy paths → their new home. Keeps old bookmarks, hardcoded links, and
 * design-prototype hrefs working after the route-grouping restructure.
 * Static paths only — param paths use <ParamRedirect> route entries.
 */
const LEGACY_REDIRECTS: [string, string][] = [
  // Account (pre-existing)
  ["/profile", routes.accountProfile],
  ["/badges", routes.badges],
  ["/perks", routes.perks],
  ["/connections", routes.connections],
  ["/collections", routes.collections],
  ["/drafts", routes.drafts],
  ["/settings", routes.settings],
  ["/edit-profile", routes.editProfile],
  ["/security", routes.security],
  ["/sessions", routes.sessions],
  ["/data-export", routes.dataExport],
  ["/delete-account", routes.deleteAccount],
  ["/my-events", routes.myEvents],
  // Section moves appended by Tasks 2–10 below.
  // Magazine
  ["/article", routes.article],
  ["/author", routes.author],
  ["/issue", routes.issue],
  ["/issues", routes.issues],
  ["/cover-gallery", routes.coverGallery],
  ["/tag", routes.tag],
  ["/podcast-show", routes.podcastShow],
  ["/audio-player", routes.audioPlayer],
  ["/newsletter-archive", routes.newsletterArchive],
  ["/story", routes.story],
  ["/story-tomas", routes.storyTomas],
  ["/story-safety", routes.storySafety],
  ["/submit-story", routes.submitStory],
  ["/pitches", routes.pitchTracker],
  ["/creatives", routes.creatives],
  ["/culture", routes.culture],
  // Resources
  ["/wellbeing", routes.wellbeing],
  ["/mental-health", routes.mentalHealth],
  ["/trans-healthcare", routes.transHealthcare],
  ["/harm-reduction", routes.harmReduction],
  ["/sexual-health", routes.sexualHealth],
  ["/sober", routes.sober],
  ["/101", routes.queer101],
  ["/glossary", routes.glossary],
  ["/pronouns-guide", routes.pronounsGuide],
  ["/micro-grants", routes.microGrants],
  ["/intersectionality", routes.intersectionality],
  ["/trans-hub", routes.transHub],
  ["/library", routes.library],
  ["/legal", routes.legal],
  // Safety
  ["/hate-crime", routes.hateCrime],
  ["/emergency", routes.emergency],
  ["/report", routes.report],
  ["/block-mute", routes.blockMute],
  ["/appeal-outcome", routes.appealOutcome],
  // Work
  ["/jobs", routes.jobs],
  ["/housing", routes.housing],
  ["/housing-coop", routes.housingCoop],
  ["/skills", routes.skills],
  ["/workshop", `${routes.skills}/risograph-zine`],
  ["/grants", routes.grants],
  ["/barter", routes.barter],
  ["/offer", routes.offer],
  ["/employer-reviews", routes.employerReviews],
  ["/application-status", routes.applicationStatus],
  ["/mentorship", routes.mentorship],
  ["/flatmates", `${routes.housing}?tab=flatmates`],
  // Hub re-parenting (2026-07-06): old full paths → new homes
  ["/work/housing", routes.housing],
  ["/work/housing-coop", routes.housingCoop],
  ["/work/flatmates", `${routes.housing}?tab=flatmates`],
  ["/resources/legal", routes.legal],
  ["/resources/micro-grants", routes.microGrants],
  ["/solidarity", routes.solidarity],
  // Auth
  ["/sign-in", routes.signIn],
  ["/create-account", routes.createAccount],
  ["/invite", routes.invite],
  ["/request-invite", routes.requestInvite],
  ["/onboarding", "/auth/onboarding"],
  ["/welcome", routes.welcome],
  ["/welcome-tour", routes.welcomeTour],
  // About
  ["/contact", routes.contact],
  ["/help", routes.help],
  ["/manifesto", routes.manifesto],
  ["/changelog", routes.changelog],
  ["/roadmap", routes.roadmap],
  ["/press-archive", routes.pressArchive],
  ["/press-kit", routes.pressKit],
  ["/annual-assembly", routes.annualAssembly],
  ["/get-the-app", routes.getTheApp],
  ["/cities", routes.cities],
  ["/for-organisations", routes.forOrganisations],
  ["/platforms", routes.platforms],
  ["/donate", routes.donate],
  ["/volunteer", routes.volunteer],
  ["/governance", routes.governance],
  ["/partners", routes.partners],
  // Policies
  ["/privacy", routes.privacy],
  ["/terms", routes.terms],
  ["/dsar", routes.dsar],
  ["/cookies", routes.cookies],
  ["/constitution", routes.constitution],
  ["/code-of-conduct", routes.codeOfConduct],
  ["/transparency-report", routes.transparencyReport],
  ["/accessibility", routes.accessibility],
  ["/guidelines", routes.guidelines],
  // Hub re-parenting (2026-07-05): old paths → new hub-nested homes
  ["/policies/constitution", routes.constitution],
  ["/policies/code-of-conduct", routes.codeOfConduct],
  ["/policies/transparency-report", routes.transparencyReport],
  ["/about/annual-assembly", routes.annualAssembly],
  ["/about/changelog", routes.changelog],
  ["/policies/accessibility", routes.accessibility],
  ["/about/press-archive", routes.pressArchive],
  ["/policies/dsar", routes.dsar],
  // System
  ["/500", routes.serverError],
  ["/maintenance", routes.maintenance],
  ["/offline", routes.offline],
  ["/geo-restricted", routes.geoRestricted],
  ["/pwa-prompt", routes.pwaPrompt],
  ["/account-banned", routes.accountBanned],
  ["/account-locked", routes.accountLocked],
  ["/account-suspended", routes.accountSuspended],
  ["/invite-expired", routes.inviteExpired],
  ["/pending-review", routes.pendingReview],
  ["/verification-needed", routes.verificationNeeded],
  ["/status", routes.status],
  // Local / Lisbon
  ["/safe-spaces", routes.safeSpaces],
  ["/visas", routes.visas],
  ["/arriving", routes.arriving],
  ["/map", routes.map],
  ["/directory", routes.directory],
];

/** Generic redirect that forwards route params into a new target path. */
function ParamRedirect({
  build,
}: {
  build: (p: Record<string, string | undefined>) => string;
}) {
  const params = useParams();
  return <Navigate to={build(params)} replace />;
}

/** Legacy public-profile path `/profile/:slug` → its new home `/members/:slug`. */
function MemberProfileRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/members/${slug ?? ""}`} replace />;
}

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
          <Route
            path={routes.memberDirectoryFilter}
            element={<Navigate to={routes.members} replace />}
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
          <Route path={routes.mentions} element={<MentionsPage />} />
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
          {/* `/gathering` alone identifies no gathering — the detail page needs
              a slug. Existing bare links mean "browse gatherings", so send them
              to the index rather than rendering a detail page with no subject. */}
          <Route
            path={routes.gathering}
            element={<Navigate to={routes.gatherings} replace />}
          />
          <Route
            path={`${routes.gathering}/:slug`}
            element={<GatheringPage />}
          />
          <Route path={routes.event} element={<EventPage />} />
          <Route path={routes.rsvp} element={<RsvpPage />} />
          <Route path={routes.rsvpTicket} element={<RsvpPage />} />
          <Route path={routes.checkout} element={<CheckoutPage />} />
          <Route
            path={routes.gatheringRecap}
            element={<GatheringRecapPage />}
          />
          <Route path={routes.host} element={<HostPage />} />
          <Route
            path={routes.createGathering}
            element={<CreateGatheringPage />}
          />
          <Route
            path={routes.gatheringDashboard}
            element={<GatheringDashboardPage />}
          />
          <Route
            path={routes.manageGathering}
            element={<ManageGatheringPage />}
          />
          <Route path={routes.coHostInvite} element={<CoHostInvitePage />} />
          <Route
            path={routes.gatheringCancelled}
            element={<GatheringCancelledPage />}
          />
          <Route path="/gathering-photos" element={<GatheringPhotosPage />} />

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
          <Route path={routes.podcastShow} element={<PodcastShowPage />} />
          <Route path={routes.audioPlayer} element={<AudioPlayerPage />} />
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
          <Route path={routes.manifesto} element={<ManifestoPage />} />
          <Route path={routes.changelog} element={<ChangelogPage />} />
          <Route path={routes.roadmap} element={<RoadmapPage />} />
          <Route path={routes.pressArchive} element={<PressArchivePage />} />
          <Route
            path={routes.annualAssembly}
            element={<AnnualAssemblyPage />}
          />
          <Route
            path="/about/governance/annual-assembly/minutes/:year"
            element={<AssemblyMinutesPage />}
          />
          <Route path={routes.getTheApp} element={<GetTheAppPage />} />
          <Route path={routes.cities} element={<CitiesPage />} />
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
          <Route path={routes.emergency} element={<EmergencyPage />} />
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
          <Route path={routes.openLetter} element={<OpenLetterPage />} />
          <Route
            path="/annual-assembly/minutes/:year"
            element={
              <ParamRedirect
                build={(p) =>
                  `/about/governance/annual-assembly/minutes/${p.year ?? ""}`
                }
              />
            }
          />
          <Route
            path="/about/annual-assembly/minutes/:year"
            element={
              <ParamRedirect
                build={(p) =>
                  `/about/governance/annual-assembly/minutes/${p.year ?? ""}`
                }
              />
            }
          />
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
          <Route path={routes.map} element={<MapPage />} />
          <Route path={routes.directory} element={<DirectoryPage />} />
          <Route path={routes.listBusiness} element={<ListBusinessPage />} />
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
          <Route path={routes.sustainer} element={<SustainerPage />} />

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
          <Route
            path={routes.adminSafeSpaces}
            element={<AdminSafeSpacesPage />}
          />
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

          {/* Known-but-unbuilt features → styled "coming soon" placeholder */}
          {KNOWN_ROUTE_SLUGS.filter((slug) => !BUILT_SLUGS.has(slug)).map(
            (slug) => (
              <Route
                key={slug}
                path={`/${slug}`}
                element={<PlaceholderPage />}
              />
            ),
          )}
          {/* Genuinely unknown paths → 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
