import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
const HomePage = lazy(() => import('../features/homepage/HomePage').then((m) => ({ default: m.HomePage })))
const ProfilePage = lazy(() => import('../features/members/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const MemberDirectoryFilterPage = lazy(() => import('../features/members/MemberDirectoryFilterPage').then((m) => ({ default: m.MemberDirectoryFilterPage })))
const SearchPage = lazy(() => import('../features/members/SearchPage').then((m) => ({ default: m.SearchPage })))
const ConnectionsPage = lazy(() => import('../features/connect/ConnectionsPage').then((m) => ({ default: m.ConnectionsPage })))
const DatingPage = lazy(() => import('../features/community/DatingPage').then((m) => ({ default: m.DatingPage })))
const ReadingGroupsPage = lazy(() => import('../features/community/ReadingGroupsPage').then((m) => ({ default: m.ReadingGroupsPage })))
const FamilyPage = lazy(() => import('../features/community/FamilyPage').then((m) => ({ default: m.FamilyPage })))
const FeedPage = lazy(() => import('../features/feed/FeedPage').then((m) => ({ default: m.FeedPage })))
const NotificationsPage = lazy(() => import('../features/notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const MessagesPage = lazy(() => import('../features/messages/MessagesPage').then((m) => ({ default: m.MessagesPage })))
const CommunitiesPage = lazy(() => import('../features/communities/CommunitiesPage').then((m) => ({ default: m.CommunitiesPage })))
const CommunitiesHomePage = lazy(() => import('../features/communities/CommunitiesHomePage').then((m) => ({ default: m.CommunitiesHomePage })))
const CommunityDetailPage = lazy(() => import('../features/communities/CommunityDetailPage').then((m) => ({ default: m.CommunityDetailPage })))
const CalendarPage = lazy(() => import('../features/gatherings/CalendarPage').then((m) => ({ default: m.CalendarPage })))
const GatheringPage = lazy(() => import('../features/gatherings/GatheringPage').then((m) => ({ default: m.GatheringPage })))
const EventPage = lazy(() => import('../features/gatherings/EventPage').then((m) => ({ default: m.EventPage })))
const EventsPage = lazy(() => import('../features/gatherings/EventsPage').then((m) => ({ default: m.EventsPage })))
const MyEventsPage = lazy(() => import('../features/myevents/MyEventsPage').then((m) => ({ default: m.MyEventsPage })))
const RsvpPage = lazy(() => import('../features/gatherings/RsvpPage').then((m) => ({ default: m.RsvpPage })))
const GatheringRecapPage = lazy(() => import('../features/gatherings/GatheringRecapPage').then((m) => ({ default: m.GatheringRecapPage })))
const HostPage = lazy(() => import('../features/gatherings/HostPage').then((m) => ({ default: m.HostPage })))
const CreateGatheringPage = lazy(() => import('../features/gatherings/CreateGatheringPage').then((m) => ({ default: m.CreateGatheringPage })))
const GatheringDashboardPage = lazy(() => import('../features/gatherings/GatheringDashboardPage').then((m) => ({ default: m.GatheringDashboardPage })))
const ManageGatheringPage = lazy(() => import('../features/gatherings/ManageGatheringPage').then((m) => ({ default: m.ManageGatheringPage })))
const CoHostInvitePage = lazy(() => import('../features/gatherings/CoHostInvitePage').then((m) => ({ default: m.CoHostInvitePage })))
const GatheringCancelledPage = lazy(() => import('../features/gatherings/GatheringCancelledPage').then((m) => ({ default: m.GatheringCancelledPage })))
const GatheringPhotosPage = lazy(() => import('../features/gatherings/GatheringPhotosPage').then((m) => ({ default: m.GatheringPhotosPage })))
const MagazinePage = lazy(() => import('../features/magazine/MagazinePage').then((m) => ({ default: m.MagazinePage })))
const ArticlePage = lazy(() => import('../features/magazine/ArticlePage').then((m) => ({ default: m.ArticlePage })))
const AuthorPage = lazy(() => import('../features/magazine/AuthorPage').then((m) => ({ default: m.AuthorPage })))
const IssuePage = lazy(() => import('../features/magazine/IssuePage').then((m) => ({ default: m.IssuePage })))
const IssuesPage = lazy(() => import('../features/magazine/IssuesPage').then((m) => ({ default: m.IssuesPage })))
const CoverGalleryPage = lazy(() => import('../features/magazine/CoverGalleryPage').then((m) => ({ default: m.CoverGalleryPage })))
const TagPage = lazy(() => import('../features/magazine/TagPage').then((m) => ({ default: m.TagPage })))
const PodcastShowPage = lazy(() => import('../features/magazine/PodcastShowPage').then((m) => ({ default: m.PodcastShowPage })))
const AudioPlayerPage = lazy(() => import('../features/magazine/AudioPlayerPage').then((m) => ({ default: m.AudioPlayerPage })))
const NewsletterArchivePage = lazy(() => import('../features/magazine/NewsletterArchivePage').then((m) => ({ default: m.NewsletterArchivePage })))
const NewsletterArchiveIssuePage = lazy(() => import('../features/magazine/NewsletterArchiveIssuePage').then((m) => ({ default: m.NewsletterArchiveIssuePage })))
const StoryPage = lazy(() => import('../features/magazine/StoryPage').then((m) => ({ default: m.StoryPage })))
const StoryTomasPage = lazy(() => import('../features/magazine/StoryTomasPage').then((m) => ({ default: m.StoryTomasPage })))
const StorySafetyPage = lazy(() => import('../features/magazine/StorySafetyPage').then((m) => ({ default: m.StorySafetyPage })))
const CreativesPage = lazy(() => import('../features/community/CreativesPage').then((m) => ({ default: m.CreativesPage })))
const CulturePage = lazy(() => import('../features/culture/CulturePage').then((m) => ({ default: m.CulturePage })))
const ManifestoPage = lazy(() => import('../features/marketing/ManifestoPage').then((m) => ({ default: m.ManifestoPage })))
const PrivacyPage = lazy(() => import('../features/marketing/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('../features/marketing/TermsPage').then((m) => ({ default: m.TermsPage })))
const DsarPage = lazy(() => import('../features/marketing/DsarPage').then((m) => ({ default: m.DsarPage })))
const ConstitutionPage = lazy(() => import('../features/marketing/ConstitutionPage').then((m) => ({ default: m.ConstitutionPage })))
const CodeOfConductPage = lazy(() => import('../features/marketing/CodeOfConductPage').then((m) => ({ default: m.CodeOfConductPage })))
const ChangelogPage = lazy(() => import('../features/marketing/ChangelogPage').then((m) => ({ default: m.ChangelogPage })))
const PressArchivePage = lazy(() => import('../features/marketing/PressArchivePage').then((m) => ({ default: m.PressArchivePage })))
const NewsletterPage = lazy(() => import('../features/marketing/NewsletterPage').then((m) => ({ default: m.NewsletterPage })))
const AnnualAssemblyPage = lazy(() => import('../features/marketing/AnnualAssemblyPage').then((m) => ({ default: m.AnnualAssemblyPage })))
const AssemblyMinutesPage = lazy(() => import('../features/marketing/AssemblyMinutesPage').then((m) => ({ default: m.AssemblyMinutesPage })))
const GetTheAppPage = lazy(() => import('../features/marketing/GetTheAppPage').then((m) => ({ default: m.GetTheAppPage })))
const ComponentLibraryPage = lazy(() => import('../features/marketing/ComponentLibraryPage').then((m) => ({ default: m.ComponentLibraryPage })))
const CitiesPage = lazy(() => import('../features/marketing/CitiesPage').then((m) => ({ default: m.CitiesPage })))
const ForOrganisationsPage = lazy(() => import('../features/marketing/ForOrganisationsPage').then((m) => ({ default: m.ForOrganisationsPage })))
const PressKitPage = lazy(() => import('../features/marketing/PressKitPage').then((m) => ({ default: m.PressKitPage })))
const TransparencyReportPage = lazy(() => import('../features/marketing/TransparencyReportPage').then((m) => ({ default: m.TransparencyReportPage })))
const AccessibilityPage = lazy(() => import('../features/marketing/AccessibilityPage').then((m) => ({ default: m.AccessibilityPage })))
const WellbeingPage = lazy(() => import('../features/resources/WellbeingPage').then((m) => ({ default: m.WellbeingPage })))
const MentalHealthPage = lazy(() => import('../features/resources/MentalHealthPage').then((m) => ({ default: m.MentalHealthPage })))
const TransHealthcarePage = lazy(() => import('../features/resources/TransHealthcarePage').then((m) => ({ default: m.TransHealthcarePage })))
const HarmReductionPage = lazy(() => import('../features/resources/HarmReductionPage').then((m) => ({ default: m.HarmReductionPage })))
const SexualHealthPage = lazy(() => import('../features/resources/SexualHealthPage').then((m) => ({ default: m.SexualHealthPage })))
const SoberPage = lazy(() => import('../features/resources/SoberPage').then((m) => ({ default: m.SoberPage })))
const Queer101Page = lazy(() => import('../features/resources/Queer101Page').then((m) => ({ default: m.Queer101Page })))
const GlossaryPage = lazy(() => import('../features/resources/GlossaryPage').then((m) => ({ default: m.GlossaryPage })))
const TransDayOfVisibilityPage = lazy(() => import('../features/resources/TransDayOfVisibilityPage').then((m) => ({ default: m.TransDayOfVisibilityPage })))
const WorldAidsDayPage = lazy(() => import('../features/resources/WorldAidsDayPage').then((m) => ({ default: m.WorldAidsDayPage })))
const PrideMonthPage = lazy(() => import('../features/resources/PrideMonthPage').then((m) => ({ default: m.PrideMonthPage })))
const MicroGrantsPage = lazy(() => import('../features/resources/MicroGrantsPage').then((m) => ({ default: m.MicroGrantsPage })))
const IntersectionalityPage = lazy(() => import('../features/resources/IntersectionalityPage').then((m) => ({ default: m.IntersectionalityPage })))
const TransHubPage = lazy(() => import('../features/resources/TransHubPage').then((m) => ({ default: m.TransHubPage })))
const LegalPage = lazy(() => import('../features/resources/LegalPage').then((m) => ({ default: m.LegalPage })))
const SafetyPage = lazy(() => import('../features/resources/SafetyPage').then((m) => ({ default: m.SafetyPage })))
const SignInPage = lazy(() => import('../features/auth/SignInPage').then((m) => ({ default: m.SignInPage })))
const CreateAccountPage = lazy(() => import('../features/auth/CreateAccountPage').then((m) => ({ default: m.CreateAccountPage })))
const InvitePage = lazy(() => import('../features/auth/InvitePage').then((m) => ({ default: m.InvitePage })))
const RequestInvitePage = lazy(() => import('../features/auth/RequestInvitePage').then((m) => ({ default: m.RequestInvitePage })))
const OnboardingPage = lazy(() => import('../features/auth/OnboardingPage').then((m) => ({ default: m.OnboardingPage })))
const WelcomeTourPage = lazy(() => import('../features/auth/WelcomeTourPage').then((m) => ({ default: m.WelcomeTourPage })))
const JobsPage = lazy(() => import('../features/economy/JobsPage').then((m) => ({ default: m.JobsPage })))
const JobDetailPage = lazy(() => import('../features/economy/JobDetailPage').then((m) => ({ default: m.JobDetailPage })))
const HousingPage = lazy(() => import('../features/economy/HousingPage').then((m) => ({ default: m.HousingPage })))
const HousingListingPage = lazy(() => import('../features/economy/HousingListingPage').then((m) => ({ default: m.HousingListingPage })))
const LandlordPage = lazy(() => import('../features/economy/LandlordPage').then((m) => ({ default: m.LandlordPage })))
const SkillsPage = lazy(() => import('../features/economy/SkillsPage').then((m) => ({ default: m.SkillsPage })))
const GrantsPage = lazy(() => import('../features/economy/GrantsPage').then((m) => ({ default: m.GrantsPage })))
const BarterPage = lazy(() => import('../features/economy/BarterPage').then((m) => ({ default: m.BarterPage })))
const BarterDetailPage = lazy(() => import('../features/economy/BarterDetailPage').then((m) => ({ default: m.BarterDetailPage })))
const OfferPage = lazy(() => import('../features/economy/OfferPage').then((m) => ({ default: m.OfferPage })))
const EmployerReviewsPage = lazy(() => import('../features/economy/EmployerReviewsPage').then((m) => ({ default: m.EmployerReviewsPage })))
const ApplicationStatusPage = lazy(() => import('../features/economy/ApplicationStatusPage').then((m) => ({ default: m.ApplicationStatusPage })))
const MentorshipPage = lazy(() => import('../features/economy/MentorshipPage').then((m) => ({ default: m.MentorshipPage })))
const MentorDetailPage = lazy(() => import('../features/economy/MentorDetailPage').then((m) => ({ default: m.MentorDetailPage })))
const EconomyPage = lazy(() => import('../features/economy/EconomyPage').then((m) => ({ default: m.EconomyPage })))
const InvoiceGeneratorPage = lazy(() => import('../features/economy/InvoiceGeneratorPage').then((m) => ({ default: m.InvoiceGeneratorPage })))
const ContractGeneratorPage = lazy(() => import('../features/economy/ContractGeneratorPage').then((m) => ({ default: m.ContractGeneratorPage })))
const ScopeGeneratorPage = lazy(() => import('../features/economy/ScopeGeneratorPage').then((m) => ({ default: m.ScopeGeneratorPage })))
const ReciboVerdeGuidePage = lazy(() => import('../features/economy/ReciboVerdeGuidePage').then((m) => ({ default: m.ReciboVerdeGuidePage })))
const TakeHomeCalculatorPage = lazy(() => import('../features/economy/TakeHomeCalculatorPage').then((m) => ({ default: m.TakeHomeCalculatorPage })))
const IvaTrackerPage = lazy(() => import('../features/economy/IvaTrackerPage').then((m) => ({ default: m.IvaTrackerPage })))
const SetAsidePlannerPage = lazy(() => import('../features/economy/SetAsidePlannerPage').then((m) => ({ default: m.SetAsidePlannerPage })))
const DayRateCalculatorPage = lazy(() => import('../features/economy/DayRateCalculatorPage').then((m) => ({ default: m.DayRateCalculatorPage })))
const RateBoardPage = lazy(() => import('../features/economy/RateBoardPage').then((m) => ({ default: m.RateBoardPage })))
const SlidingScalePage = lazy(() => import('../features/economy/SlidingScalePage').then((m) => ({ default: m.SlidingScalePage })))
const ComparatorPage = lazy(() => import('../features/economy/ComparatorPage').then((m) => ({ default: m.ComparatorPage })))
const RunningGuidePage = lazy(() => import('../features/resources/RunningGuidePage').then((m) => ({ default: m.RunningGuidePage })))
const AccessibleLisbonPage = lazy(() => import('../features/resources/AccessibleLisbonPage').then((m) => ({ default: m.AccessibleLisbonPage })))
const PeerSupportPage = lazy(() => import('../features/resources/PeerSupportPage').then((m) => ({ default: m.PeerSupportPage })))
const ArtCritGuidePage = lazy(() => import('../features/resources/ArtCritGuidePage').then((m) => ({ default: m.ArtCritGuidePage })))
const SharedEquipmentPage = lazy(() => import('../features/resources/SharedEquipmentPage').then((m) => ({ default: m.SharedEquipmentPage })))
const GroupShowArchivePage = lazy(() => import('../features/resources/GroupShowArchivePage').then((m) => ({ default: m.GroupShowArchivePage })))
const FirstMeetupGuidePage = lazy(() => import('../features/resources/FirstMeetupGuidePage').then((m) => ({ default: m.FirstMeetupGuidePage })))
const QueerPaediatriciansPage = lazy(() => import('../features/resources/QueerPaediatriciansPage').then((m) => ({ default: m.QueerPaediatriciansPage })))
const SchoolFormsGuidePage = lazy(() => import('../features/resources/SchoolFormsGuidePage').then((m) => ({ default: m.SchoolFormsGuidePage })))
const CommunityPrivacyPage = lazy(() => import('../features/resources/CommunityPrivacyPage').then((m) => ({ default: m.CommunityPrivacyPage })))
const ComingOutAtWorkPage = lazy(() => import('../features/resources/ComingOutAtWorkPage').then((m) => ({ default: m.ComingOutAtWorkPage })))
const LgbtqAgingGuidePage = lazy(() => import('../features/resources/LgbtqAgingGuidePage').then((m) => ({ default: m.LgbtqAgingGuidePage })))
const OralHistoryProjectPage = lazy(() => import('../features/resources/OralHistoryProjectPage').then((m) => ({ default: m.OralHistoryProjectPage })))
const IngredientsMapPage = lazy(() => import('../features/resources/IngredientsMapPage').then((m) => ({ default: m.IngredientsMapPage })))
const QtipocOrganisationsPage = lazy(() => import('../features/resources/QtipocOrganisationsPage').then((m) => ({ default: m.QtipocOrganisationsPage })))
const QtipocArchivePage = lazy(() => import('../features/resources/QtipocArchivePage').then((m) => ({ default: m.QtipocArchivePage })))
const DisabilityHealthcarePage = lazy(() => import('../features/resources/DisabilityHealthcarePage').then((m) => ({ default: m.DisabilityHealthcarePage })))
const SpoonTheoryPage = lazy(() => import('../features/resources/SpoonTheoryPage').then((m) => ({ default: m.SpoonTheoryPage })))
const CinemaPage = lazy(() => import('../features/cinema/CinemaPage').then((m) => ({ default: m.CinemaPage })))
const CinemaBrowsePage = lazy(() => import('../features/cinema/CinemaBrowsePage').then((m) => ({ default: m.CinemaBrowsePage })))
const CinemaMembershipPage = lazy(() => import('../features/cinema/CinemaMembershipPage').then((m) => ({ default: m.CinemaMembershipPage })))
const FilmPage = lazy(() => import('../features/cinema/FilmPage').then((m) => ({ default: m.FilmPage })))
const WatchPage = lazy(() => import('../features/cinema/WatchPage').then((m) => ({ default: m.WatchPage })))
const StudioPage = lazy(() => import('../features/studio/StudioPage').then((m) => ({ default: m.StudioPage })))
const StudioAlbumPage = lazy(() => import('../features/studio/StudioAlbumPage').then((m) => ({ default: m.StudioAlbumPage })))
const StudioArtistPage = lazy(() => import('../features/studio/StudioArtistPage').then((m) => ({ default: m.StudioArtistPage })))
const StudioDashboardPage = lazy(() => import('../features/studio/StudioDashboardPage').then((m) => ({ default: m.StudioDashboardPage })))
const StudioUploadPage = lazy(() => import('../features/studio/StudioUploadPage').then((m) => ({ default: m.StudioUploadPage })))
const StudioPayoutsPage = lazy(() => import('../features/studio/StudioPayoutsPage').then((m) => ({ default: m.StudioPayoutsPage })))
const StudioTrackPage = lazy(() => import('../features/studio/StudioTrackPage').then((m) => ({ default: m.StudioTrackPage })))
const StudioLivePage = lazy(() => import('../features/studio/StudioLivePage').then((m) => ({ default: m.StudioLivePage })))
const StudioSheetStorePage = lazy(() => import('../features/studio/StudioSheetStorePage').then((m) => ({ default: m.StudioSheetStorePage })))
const StudioSolidarityFundPage = lazy(() => import('../features/studio/StudioSolidarityFundPage').then((m) => ({ default: m.StudioSolidarityFundPage })))
const StudioOpenCallsPage = lazy(() => import('../features/studio/StudioOpenCallsPage').then((m) => ({ default: m.StudioOpenCallsPage })))
const StudioSetSubmissionPage = lazy(() => import('../features/studio/StudioSetSubmissionPage').then((m) => ({ default: m.StudioSetSubmissionPage })))
const StudioCouncilPage = lazy(() => import('../features/studio/StudioCouncilPage').then((m) => ({ default: m.StudioCouncilPage })))
const StudioTriagePage = lazy(() => import('../features/studio/StudioTriagePage').then((m) => ({ default: m.StudioTriagePage })))
const StudioFlagReviewPage = lazy(() => import('../features/studio/StudioFlagReviewPage').then((m) => ({ default: m.StudioFlagReviewPage })))
const ChangemakersPage = lazy(() => import('../features/community/ChangemakersPage').then((m) => ({ default: m.ChangemakersPage })))
const ChangemakerStoryPage = lazy(() => import('../features/community/ChangemakerStoryPage').then((m) => ({ default: m.ChangemakerStoryPage })))
const ForumPage = lazy(() => import('../features/forum/ForumPage').then((m) => ({ default: m.ForumPage })))
const ThreadPage = lazy(() => import('../features/forum/ThreadPage').then((m) => ({ default: m.ThreadPage })))
const SettingsPage = lazy(() => import('../features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const GovernancePage = lazy(() => import('../features/governance/GovernancePage').then((m) => ({ default: m.GovernancePage })))
const AboutPage = lazy(() => import('../features/marketing/AboutPage').then((m) => ({ default: m.AboutPage })))
const ContactPage = lazy(() => import('../features/marketing/ContactPage').then((m) => ({ default: m.ContactPage })))
const HelpPage = lazy(() => import('../features/marketing/HelpPage').then((m) => ({ default: m.HelpPage })))
const VolunteerPage = lazy(() => import('../features/marketing/VolunteerPage').then((m) => ({ default: m.VolunteerPage })))
const VolunteerOpportunityPage = lazy(() => import('../features/marketing/VolunteerOpportunityPage').then((m) => ({ default: m.VolunteerOpportunityPage })))
const GuidelinesPage = lazy(() => import('../features/marketing/GuidelinesPage').then((m) => ({ default: m.GuidelinesPage })))
const DirectoryPage = lazy(() => import('../features/marketing/DirectoryPage').then((m) => ({ default: m.DirectoryPage })))
const DirectorySpacePage = lazy(() => import('../features/marketing/DirectorySpacePage').then((m) => ({ default: m.DirectorySpacePage })))
const ResourceLibraryPage = lazy(() => import('../features/marketing/ResourceLibraryPage').then((m) => ({ default: m.ResourceLibraryPage })))
const PartnersPage = lazy(() => import('../features/marketing/PartnersPage').then((m) => ({ default: m.PartnersPage })))
const PartnerDetailPage = lazy(() => import('../features/marketing/PartnerDetailPage').then((m) => ({ default: m.PartnerDetailPage })))
const ActivismPage = lazy(() => import('../features/marketing/ActivismPage').then((m) => ({ default: m.ActivismPage })))
const ArchivePage = lazy(() => import('../features/marketing/ArchivePage').then((m) => ({ default: m.ArchivePage })))
const PlatformsPage = lazy(() => import('../features/marketing/PlatformsPage').then((m) => ({ default: m.PlatformsPage })))
const MapPage = lazy(() => import('../features/marketing/MapPage').then((m) => ({ default: m.MapPage })))
const SafeSpacesPage = lazy(() => import('../features/safety/SafeSpacesPage').then((m) => ({ default: m.SafeSpacesPage })))
const SafeSpaceDetailPage = lazy(() => import('../features/safety/SafeSpaceDetailPage').then((m) => ({ default: m.SafeSpaceDetailPage })))
const FlatmatesPage = lazy(() => import('../features/economy/FlatmatesPage').then((m) => ({ default: m.FlatmatesPage })))
const SolidarityPage = lazy(() => import('../features/economy/SolidarityPage').then((m) => ({ default: m.SolidarityPage })))
const VisasPage = lazy(() => import('../features/marketing/VisasPage').then((m) => ({ default: m.VisasPage })))
const ArrivingPage = lazy(() => import('../features/marketing/ArrivingPage').then((m) => ({ default: m.ArrivingPage })))
const HateCrimePage = lazy(() => import('../features/safety/HateCrimePage').then((m) => ({ default: m.HateCrimePage })))
const EmergencyPage = lazy(() => import('../features/safety/EmergencyPage').then((m) => ({ default: m.EmergencyPage })))
const ReportPage = lazy(() => import('../features/safety/ReportPage').then((m) => ({ default: m.ReportPage })))
const LeavePage = lazy(() => import('../features/safety/LeavePage').then((m) => ({ default: m.LeavePage })))
const BlockMutePage = lazy(() => import('../features/safety/BlockMutePage').then((m) => ({ default: m.BlockMutePage })))
const AppealOutcomePage = lazy(() => import('../features/safety/AppealOutcomePage').then((m) => ({ default: m.AppealOutcomePage })))
const PlaceholderPage = lazy(() => import('../pages/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage })))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const ServerErrorPage = lazy(() => import('../features/system/ServerErrorPage').then((m) => ({ default: m.ServerErrorPage })))
const MaintenancePage = lazy(() => import('../features/system/MaintenancePage').then((m) => ({ default: m.MaintenancePage })))
const OfflinePage = lazy(() => import('../features/system/OfflinePage').then((m) => ({ default: m.OfflinePage })))
const GeoRestrictedPage = lazy(() => import('../features/system/GeoRestrictedPage').then((m) => ({ default: m.GeoRestrictedPage })))
const PwaPromptPage = lazy(() => import('../features/system/PwaPromptPage').then((m) => ({ default: m.PwaPromptPage })))
const AccountBannedPage = lazy(() => import('../features/system/AccountBannedPage').then((m) => ({ default: m.AccountBannedPage })))
const AccountLockedPage = lazy(() => import('../features/system/AccountLockedPage').then((m) => ({ default: m.AccountLockedPage })))
const AccountSuspendedPage = lazy(() => import('../features/system/AccountSuspendedPage').then((m) => ({ default: m.AccountSuspendedPage })))
const InviteExpiredPage = lazy(() => import('../features/system/InviteExpiredPage').then((m) => ({ default: m.InviteExpiredPage })))
const InviteLandingPage = lazy(() => import('../features/system/InviteLandingPage').then((m) => ({ default: m.InviteLandingPage })))
const PendingReviewPage = lazy(() => import('../features/system/PendingReviewPage').then((m) => ({ default: m.PendingReviewPage })))
const VerificationNeededPage = lazy(() => import('../features/system/VerificationNeededPage').then((m) => ({ default: m.VerificationNeededPage })))
const StatusPage = lazy(() => import('../features/system/StatusPage').then((m) => ({ default: m.StatusPage })))
const Studio404Page = lazy(() => import('../features/studio/Studio404Page').then((m) => ({ default: m.Studio404Page })))
const Studio500Page = lazy(() => import('../features/studio/Studio500Page').then((m) => ({ default: m.Studio500Page })))
const StudioOffAirPage = lazy(() => import('../features/studio/StudioOffAirPage').then((m) => ({ default: m.StudioOffAirPage })))
const TwoFactorSetupPage = lazy(() => import('../features/auth/TwoFactorSetupPage').then((m) => ({ default: m.TwoFactorSetupPage })))
const MagicLinkPage = lazy(() => import('../features/auth/MagicLinkPage').then((m) => ({ default: m.MagicLinkPage })))
const PasswordResetPage = lazy(() => import('../features/auth/PasswordResetPage').then((m) => ({ default: m.PasswordResetPage })))
const SetNewPasswordPage = lazy(() => import('../features/auth/SetNewPasswordPage').then((m) => ({ default: m.SetNewPasswordPage })))
const ConfirmEmailPage = lazy(() => import('../features/auth/ConfirmEmailPage').then((m) => ({ default: m.ConfirmEmailPage })))
const RecoveryCodesPage = lazy(() => import('../features/auth/RecoveryCodesPage').then((m) => ({ default: m.RecoveryCodesPage })))
const StudioSignInPage = lazy(() => import('../features/studio/StudioSignInPage').then((m) => ({ default: m.StudioSignInPage })))
const StudioSettingsPage = lazy(() => import('../features/studio/StudioSettingsPage').then((m) => ({ default: m.StudioSettingsPage })))
const AccessibilityPreferencesPage = lazy(() => import('../features/settings/AccessibilityPreferencesPage').then((m) => ({ default: m.AccessibilityPreferencesPage })))
const NotificationPreferencesPage = lazy(() => import('../features/settings/NotificationPreferencesPage').then((m) => ({ default: m.NotificationPreferencesPage })))
const DataExportPage = lazy(() => import('../features/settings/DataExportPage').then((m) => ({ default: m.DataExportPage })))
const DeleteAccountPage = lazy(() => import('../features/settings/DeleteAccountPage').then((m) => ({ default: m.DeleteAccountPage })))
const EditProfilePage = lazy(() => import('../features/settings/EditProfilePage').then((m) => ({ default: m.EditProfilePage })))
const LinkedAccountsPage = lazy(() => import('../features/settings/LinkedAccountsPage').then((m) => ({ default: m.LinkedAccountsPage })))
const SecurityPage = lazy(() => import('../features/settings/SecurityPage').then((m) => ({ default: m.SecurityPage })))
const SessionsPage = lazy(() => import('../features/settings/SessionsPage').then((m) => ({ default: m.SessionsPage })))
const ProfileThemePage = lazy(() => import('../features/settings/ProfileThemePage').then((m) => ({ default: m.ProfileThemePage })))
const SubscriptionsPage = lazy(() => import('../features/settings/SubscriptionsPage').then((m) => ({ default: m.SubscriptionsPage })))
const CancelMembershipPage = lazy(() => import('../features/settings/CancelMembershipPage').then((m) => ({ default: m.CancelMembershipPage })))
const MembershipPage = lazy(() => import('../features/settings/MembershipPage').then((m) => ({ default: m.MembershipPage })))
const GiftMembershipPage = lazy(() => import('../features/settings/GiftMembershipPage').then((m) => ({ default: m.GiftMembershipPage })))
const PublicProfilePage = lazy(() => import('../features/members/PublicProfilePage').then((m) => ({ default: m.PublicProfilePage })))
const MentorProfilePage = lazy(() => import('../features/economy/MentorProfilePage').then((m) => ({ default: m.MentorProfilePage })))
const WorkHubPage = lazy(() => import('../features/economy/WorkHubPage').then((m) => ({ default: m.WorkHubPage })))
const WorkProfilePage = lazy(() => import('../features/economy/WorkProfilePage').then((m) => ({ default: m.WorkProfilePage })))
const NotificationDeepLinkPage = lazy(() => import('../features/notifications/NotificationDeepLinkPage').then((m) => ({ default: m.NotificationDeepLinkPage })))
const MentionsPage = lazy(() => import('../features/notifications/MentionsPage').then((m) => ({ default: m.MentionsPage })))
const CollectionsPage = lazy(() => import('../features/members/CollectionsPage').then((m) => ({ default: m.CollectionsPage })))
const BadgesPage = lazy(() => import('../features/members/BadgesPage').then((m) => ({ default: m.BadgesPage })))
const PerksPage = lazy(() => import('../features/members/PerksPage').then((m) => ({ default: m.PerksPage })))
const DraftsPage = lazy(() => import('../features/members/DraftsPage').then((m) => ({ default: m.DraftsPage })))
const QrScannerPage = lazy(() => import('../features/members/QrScannerPage').then((m) => ({ default: m.QrScannerPage })))
const CookiesPage = lazy(() => import('../features/marketing/CookiesPage').then((m) => ({ default: m.CookiesPage })))
const PronounsGuidePage = lazy(() => import('../features/resources/PronounsGuidePage').then((m) => ({ default: m.PronounsGuidePage })))
const LibraryPage = lazy(() => import('../features/resources/LibraryPage').then((m) => ({ default: m.LibraryPage })))
const ComingOutPage = lazy(() => import('../features/community/ComingOutPage').then((m) => ({ default: m.ComingOutPage })))
const GatheringsPage = lazy(() => import('../features/gatherings/GatheringsPage').then((m) => ({ default: m.GatheringsPage })))
const CrisisChatPage = lazy(() => import('../features/safety/CrisisChatPage').then((m) => ({ default: m.CrisisChatPage })))
const VouchPage = lazy(() => import('../features/members/VouchPage').then((m) => ({ default: m.VouchPage })))
const DonatePage = lazy(() => import('../features/marketing/DonatePage').then((m) => ({ default: m.DonatePage })))
const SubmitStoryPage = lazy(() => import('../features/magazine/SubmitStoryPage').then((m) => ({ default: m.SubmitStoryPage })))
const StudioCollectionPage = lazy(() => import('../features/studio/StudioCollectionPage').then((m) => ({ default: m.StudioCollectionPage })))
const StudioSetPage = lazy(() => import('../features/studio/StudioSetPage').then((m) => ({ default: m.StudioSetPage })))
const StudioSearchPage = lazy(() => import('../features/studio/StudioSearchPage').then((m) => ({ default: m.StudioSearchPage })))
const StudioLibraryPage = lazy(() => import('../features/studio/StudioLibraryPage').then((m) => ({ default: m.StudioLibraryPage })))
const StudioCheckoutPage = lazy(() => import('../features/studio/StudioCheckoutPage').then((m) => ({ default: m.StudioCheckoutPage })))
const AdminDashboardPage = lazy(() => import('../features/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const AdminModerationPage = lazy(() => import('../features/admin/AdminModerationPage').then((m) => ({ default: m.AdminModerationPage })))
const AdminMembersPage = lazy(() => import('../features/admin/AdminMembersPage').then((m) => ({ default: m.AdminMembersPage })))
const AdminCommunitiesPage = lazy(() => import('../features/admin/AdminCommunitiesPage').then((m) => ({ default: m.AdminCommunitiesPage })))
const AdminCommunityModPage = lazy(() => import('../features/admin/AdminCommunityModPage').then((m) => ({ default: m.AdminCommunityModPage })))
const AdminGovernancePage = lazy(() => import('../features/admin/AdminGovernancePage').then((m) => ({ default: m.AdminGovernancePage })))
const ModPanelPage = lazy(() => import('../features/admin/ModPanelPage').then((m) => ({ default: m.ModPanelPage })))
import { KNOWN_ROUTE_SLUGS } from './routeMap'

/** Top-level slugs that now have real pages — excluded from the placeholder fallback. */
const BUILT_SLUGS = new Set([
  'feed',
  'members',
  'member-directory-filter',
  'search',
  'connections',
  'dating',
  'reading-groups',
  'family',
  'profile',
  'messages',
  'notifications',
  'communities',
  'calendar',
  'events',
  'gathering',
  'event',
  'rsvp',
  'rsvp-ticket',
  'gathering-recap',
  'host',
  'magazine',
  'safety',
  'film',
  'changemakers',
  'forum',
  'thread',
  'settings',
  'about',
  'archive',
  'resources',
  'activism',
  'economy',
  'coming-out',
  'parents',
  'gatherings',
])

/**
 * Legacy paths → their new home. Keeps old bookmarks, hardcoded links, and
 * design-prototype hrefs working after the route-grouping restructure.
 * Static paths only — param paths use <ParamRedirect> route entries.
 */
const LEGACY_REDIRECTS: [string, string][] = [
  // Account (pre-existing)
  ['/profile', '/account/profile'],
  ['/badges', '/account/badges'],
  ['/perks', '/account/perks'],
  ['/connections', '/account/connections'],
  ['/collections', '/account/collections'],
  ['/drafts', '/account/drafts'],
  ['/settings', '/account/settings'],
  ['/edit-profile', '/account/edit-profile'],
  ['/notification-preferences', '/account/notification-preferences'],
  ['/accessibility-preferences', '/account/accessibility-preferences'],
  ['/profile-theme', '/account/profile-theme'],
  ['/linked-accounts', '/account/linked-accounts'],
  ['/security', '/account/security'],
  ['/sessions', '/account/sessions'],
  ['/subscriptions', '/account/subscriptions'],
  ['/data-export', '/account/data-export'],
  ['/delete-account', '/account/delete-account'],
  ['/cancel-membership', '/account/cancel-membership'],
  ['/membership', '/account/membership'],
  ['/gift-membership', '/account/gift-membership'],
  ['/my-events', '/account/events'],
  // Section moves appended by Tasks 2–10 below.
  // Magazine
  ['/article', '/magazine/article'],
  ['/author', '/magazine/author'],
  ['/issue', '/magazine/issue'],
  ['/issues', '/magazine/issues'],
  ['/cover-gallery', '/magazine/cover-gallery'],
  ['/tag', '/magazine/tag'],
  ['/podcast-show', '/magazine/podcast-show'],
  ['/audio-player', '/magazine/audio-player'],
  ['/newsletter-archive', '/magazine/newsletter-archive'],
  ['/story', '/magazine/story'],
  ['/story-tomas', '/magazine/story-tomas'],
  ['/story-safety', '/magazine/story-safety'],
  ['/submit-story', '/magazine/submit-story'],
  ['/creatives', '/magazine/creatives'],
  ['/culture', '/magazine/culture'],
  // Resources
  ['/wellbeing', '/resources/wellbeing'],
  ['/mental-health', '/resources/mental-health'],
  ['/trans-healthcare', '/resources/trans-healthcare'],
  ['/harm-reduction', '/resources/harm-reduction'],
  ['/sexual-health', '/resources/sexual-health'],
  ['/sober', '/resources/sober'],
  ['/101', '/resources/101'],
  ['/glossary', '/resources/glossary'],
  ['/pronouns-guide', '/resources/pronouns-guide'],
  ['/trans-day-of-visibility', '/resources/trans-day-of-visibility'],
  ['/world-aids-day', '/resources/world-aids-day'],
  ['/pride-month', '/resources/pride-month'],
  ['/micro-grants', '/resources/micro-grants'],
  ['/intersectionality', '/resources/intersectionality'],
  ['/trans-hub', '/resources/trans-hub'],
  ['/library', '/resources/library'],
  ['/legal', '/resources/legal'],
  // Safety
  ['/hate-crime', '/safety/hate-crime'],
  ['/emergency', '/safety/emergency'],
  ['/report', '/safety/report'],
  ['/leave', '/safety/leave'],
  ['/block-mute', '/safety/block-mute'],
  ['/appeal-outcome', '/safety/appeal-outcome'],
  ['/crisis-chat', '/safety/crisis-chat'],
  // Work
  ['/jobs', '/work/jobs'],
  ['/housing', '/work/housing'],
  ['/skills', '/work/skills'],
  ['/grants', '/work/grants'],
  ['/barter', '/work/barter'],
  ['/offer', '/work/offer'],
  ['/employer-reviews', '/work/employer-reviews'],
  ['/application-status', '/work/application-status'],
  ['/mentorship', '/work/mentorship'],
  ['/mentor-profile', '/work/mentor-profile'],
  ['/flatmates', '/work/flatmates'],
  ['/solidarity', '/work/solidarity'],
  // Auth
  ['/sign-in', '/auth/sign-in'],
  ['/create-account', '/auth/create-account'],
  ['/invite', '/auth/invite'],
  ['/request-invite', '/auth/request-invite'],
  ['/onboarding', '/auth/onboarding'],
  ['/welcome', '/auth/welcome'],
  ['/welcome-tour', '/auth/welcome-tour'],
  ['/2fa-setup', '/auth/2fa-setup'],
  ['/magic-link', '/auth/magic-link'],
  ['/password-reset', '/auth/password-reset'],
  ['/set-new-password', '/auth/set-new-password'],
  ['/confirm-email', '/auth/confirm-email'],
  ['/recovery-codes', '/auth/recovery-codes'],
  // About
  ['/contact', '/about/contact'],
  ['/help', '/about/help'],
  ['/manifesto', '/about/manifesto'],
  ['/changelog', '/about/changelog'],
  ['/press-archive', '/about/press-archive'],
  ['/press-kit', '/about/press-kit'],
  ['/newsletter', '/about/newsletter'],
  ['/annual-assembly', '/about/annual-assembly'],
  ['/get-the-app', '/about/get-the-app'],
  ['/cities', '/about/cities'],
  ['/for-organisations', '/about/for-organisations'],
  ['/platforms', '/about/platforms'],
  ['/donate', '/about/donate'],
  ['/volunteer', '/about/volunteer'],
  ['/governance', '/about/governance'],
  ['/component-library', '/about/component-library'],
  ['/partners', '/about/partners'],
  // Policies
  ['/privacy', '/policies/privacy'],
  ['/terms', '/policies/terms'],
  ['/dsar', '/policies/dsar'],
  ['/cookies', '/policies/cookies'],
  ['/constitution', '/policies/constitution'],
  ['/code-of-conduct', '/policies/code-of-conduct'],
  ['/transparency-report', '/policies/transparency-report'],
  ['/accessibility', '/policies/accessibility'],
  ['/guidelines', '/policies/guidelines'],
  // System
  ['/500', '/system/500'],
  ['/maintenance', '/system/maintenance'],
  ['/offline', '/system/offline'],
  ['/geo-restricted', '/system/geo-restricted'],
  ['/pwa-prompt', '/system/pwa-prompt'],
  ['/account-banned', '/system/account-banned'],
  ['/account-locked', '/system/account-locked'],
  ['/account-suspended', '/system/account-suspended'],
  ['/invite-expired', '/system/invite-expired'],
  ['/pending-review', '/system/pending-review'],
  ['/verification-needed', '/system/verification-needed'],
  ['/status', '/system/status'],
  // Local / Lisbon
  ['/safe-spaces', '/local/safe-spaces'],
  ['/visas', '/local/visas'],
  ['/arriving', '/local/arriving'],
  ['/map', '/local/map'],
  ['/directory', '/local/directory'],
]

/** Generic redirect that forwards route params into a new target path. */
function ParamRedirect({ build }: { build: (p: Record<string, string | undefined>) => string }) {
  const params = useParams()
  return <Navigate to={build(params)} replace />
}

/** Legacy public-profile path `/profile/:slug` → its new home `/members/:slug`. */
function MemberProfileRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/members/${slug ?? ''}`} replace />
}

/**
 * The Member Platform surface is now built. Remaining known links resolve to a
 * styled placeholder, and unknown paths fall through to it too, so no link 404s.
 */
export function AppRoutes() {
  return (
    <Suspense fallback={<div />}>
      <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Member Platform */}
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/members" element={<MemberDirectoryFilterPage />} />
      <Route path="/member-directory-filter" element={<Navigate to="/members" replace />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/account/profile" element={<ProfilePage />} />
      <Route path="/members/:slug" element={<ProfilePage />} />
      <Route path="/profile/:slug" element={<MemberProfileRedirect />} />
      <Route path="/public-profile" element={<PublicProfilePage />} />
      <Route path="/account/badges" element={<BadgesPage />} />
      <Route path="/account/perks" element={<PerksPage />} />
      <Route path="/account/connections" element={<ConnectionsPage />} />
      <Route path="/account/events" element={<MyEventsPage />} />
      <Route path="/dating" element={<DatingPage />} />
      <Route path="/reading-groups" element={<ReadingGroupsPage />} />
      <Route path="/family" element={<FamilyPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/notification-deep-link" element={<NotificationDeepLinkPage />} />
      <Route path="/mentions" element={<MentionsPage />} />
      <Route path="/account/collections" element={<CollectionsPage />} />
      <Route path="/account/drafts" element={<DraftsPage />} />
      <Route path="/qr-scanner" element={<QrScannerPage />} />
      <Route path="/communities" element={<CommunitiesPage />} />
      <Route path="/communities/home" element={<CommunitiesHomePage />} />
      <Route path="/community/:slug" element={<CommunityDetailPage />} />

      {/* Gatherings */}
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/gathering" element={<GatheringPage />} />
      <Route path="/gathering/:slug" element={<GatheringPage />} />
      <Route path="/event" element={<EventPage />} />
      <Route path="/rsvp" element={<RsvpPage />} />
      <Route path="/rsvp-ticket" element={<RsvpPage />} />
      <Route path="/gathering-recap" element={<GatheringRecapPage />} />
      <Route path="/host" element={<HostPage />} />
      <Route path="/create-gathering" element={<CreateGatheringPage />} />
      <Route path="/gathering-dashboard" element={<GatheringDashboardPage />} />
      <Route path="/manage-gathering" element={<ManageGatheringPage />} />
      <Route path="/co-host-invite" element={<CoHostInvitePage />} />
      <Route path="/gathering-cancelled" element={<GatheringCancelledPage />} />
      <Route path="/gathering-photos" element={<GatheringPhotosPage />} />

      {/* Magazine */}
      <Route path="/magazine" element={<MagazinePage />} />
      <Route path="/magazine/article" element={<ArticlePage />} />
      <Route path="/magazine/author" element={<AuthorPage />} />
      <Route path="/magazine/issue" element={<IssuePage />} />
      <Route path="/magazine/issues" element={<IssuesPage />} />
      <Route path="/magazine/cover-gallery" element={<CoverGalleryPage />} />
      <Route path="/magazine/tag" element={<TagPage />} />
      <Route path="/magazine/podcast-show" element={<PodcastShowPage />} />
      <Route path="/magazine/audio-player" element={<AudioPlayerPage />} />
      <Route path="/magazine/newsletter-archive" element={<NewsletterArchivePage />} />
      <Route path="/magazine/newsletter-archive/:slug" element={<NewsletterArchiveIssuePage />} />
      <Route path="/newsletter-archive/:slug" element={<ParamRedirect build={(p) => `/magazine/newsletter-archive/${p.slug ?? ''}`} />} />
      <Route path="/magazine/story" element={<StoryPage />} />
      <Route path="/magazine/story-tomas" element={<StoryTomasPage />} />
      <Route path="/magazine/story-safety" element={<StorySafetyPage />} />
      <Route path="/magazine/submit-story" element={<SubmitStoryPage />} />
      <Route path="/magazine/creatives" element={<CreativesPage />} />
      <Route path="/magazine/culture" element={<CulturePage />} />
      <Route path="/about/manifesto" element={<ManifestoPage />} />
      <Route path="/about/changelog" element={<ChangelogPage />} />
      <Route path="/about/press-archive" element={<PressArchivePage />} />
      <Route path="/about/newsletter" element={<NewsletterPage />} />
      <Route path="/about/annual-assembly" element={<AnnualAssemblyPage />} />
      <Route path="/about/annual-assembly/minutes/:year" element={<AssemblyMinutesPage />} />
      <Route path="/about/get-the-app" element={<GetTheAppPage />} />
      <Route path="/about/component-library" element={<ComponentLibraryPage />} />
      <Route path="/about/cities" element={<CitiesPage />} />
      <Route path="/about/for-organisations" element={<ForOrganisationsPage />} />
      <Route path="/about/press-kit" element={<PressKitPage />} />
      <Route path="/about/governance" element={<GovernancePage />} />
      <Route path="/policies/privacy" element={<PrivacyPage />} />
      <Route path="/policies/terms" element={<TermsPage />} />
      <Route path="/policies/dsar" element={<DsarPage />} />
      <Route path="/policies/cookies" element={<CookiesPage />} />
      <Route path="/policies/constitution" element={<ConstitutionPage />} />
      <Route path="/policies/code-of-conduct" element={<CodeOfConductPage />} />
      <Route path="/policies/transparency-report" element={<TransparencyReportPage />} />
      <Route path="/policies/accessibility" element={<AccessibilityPage />} />
      <Route path="/policies/guidelines" element={<GuidelinesPage />} />

      {/* Resources & Wellbeing */}
      <Route path="/resources/wellbeing" element={<WellbeingPage />} />
      <Route path="/resources/mental-health" element={<MentalHealthPage />} />
      <Route path="/resources/trans-healthcare" element={<TransHealthcarePage />} />
      <Route path="/resources/harm-reduction" element={<HarmReductionPage />} />
      <Route path="/resources/sexual-health" element={<SexualHealthPage />} />
      <Route path="/resources/sober" element={<SoberPage />} />
      <Route path="/safety/hate-crime" element={<HateCrimePage />} />
      <Route path="/safety/emergency" element={<EmergencyPage />} />
      <Route path="/resources/101" element={<Queer101Page />} />
      <Route path="/resources/glossary" element={<GlossaryPage />} />
      <Route path="/resources/pronouns-guide" element={<PronounsGuidePage />} />
      <Route path="/resources/trans-day-of-visibility" element={<TransDayOfVisibilityPage />} />
      <Route path="/resources/world-aids-day" element={<WorldAidsDayPage />} />
      <Route path="/resources/pride-month" element={<PrideMonthPage />} />
      <Route path="/resources/micro-grants" element={<MicroGrantsPage />} />
      <Route path="/resources/intersectionality" element={<IntersectionalityPage />} />
      <Route path="/resources/trans-hub" element={<TransHubPage />} />
      <Route path="/resources/legal" element={<LegalPage />} />
      <Route path="/resources/library" element={<LibraryPage />} />
      <Route path="/resources/running-guide" element={<RunningGuidePage />} />
      <Route path="/resources/accessible-lisbon" element={<AccessibleLisbonPage />} />
      <Route path="/resources/peer-support" element={<PeerSupportPage />} />
      <Route path="/resources/art-crit-guide" element={<ArtCritGuidePage />} />
      <Route path="/resources/shared-equipment" element={<SharedEquipmentPage />} />
      <Route path="/resources/group-show-archive" element={<GroupShowArchivePage />} />
      <Route path="/resources/first-meetup-guide" element={<FirstMeetupGuidePage />} />
      <Route path="/resources/queer-paediatricians" element={<QueerPaediatriciansPage />} />
      <Route path="/resources/school-forms-guide" element={<SchoolFormsGuidePage />} />
      <Route path="/resources/community-privacy" element={<CommunityPrivacyPage />} />
      <Route path="/resources/coming-out-at-work" element={<ComingOutAtWorkPage />} />
      <Route path="/resources/lgbtq-aging-guide" element={<LgbtqAgingGuidePage />} />
      <Route path="/resources/oral-history-project" element={<OralHistoryProjectPage />} />
      <Route path="/resources/ingredients-map" element={<IngredientsMapPage />} />
      <Route path="/resources/qtipoc-organisations" element={<QtipocOrganisationsPage />} />
      <Route path="/resources/qtipoc-archive" element={<QtipocArchivePage />} />
      <Route path="/resources/disability-healthcare" element={<DisabilityHealthcarePage />} />
      <Route path="/resources/spoon-theory" element={<SpoonTheoryPage />} />
      <Route path="/safety" element={<SafetyPage />} />
      <Route path="/safety/report" element={<ReportPage />} />
      <Route path="/safety/leave" element={<LeavePage />} />
      <Route path="/safety/block-mute" element={<BlockMutePage />} />
      <Route path="/safety/appeal-outcome" element={<AppealOutcomePage />} />
      <Route path="/safety/crisis-chat" element={<CrisisChatPage />} />

      {/* Auth & onboarding */}
      <Route path="/auth/sign-in" element={<SignInPage />} />
      <Route path="/auth/create-account" element={<CreateAccountPage />} />
      <Route path="/auth/invite" element={<InvitePage />} />
      <Route path="/auth/invite/:code" element={<InviteLandingPage />} />
      <Route path="/auth/request-invite" element={<RequestInvitePage />} />
      <Route path="/auth/onboarding" element={<OnboardingPage />} />
      <Route path="/auth/welcome" element={<OnboardingPage />} />
      <Route path="/auth/welcome-tour" element={<WelcomeTourPage />} />
      <Route path="/auth/2fa-setup" element={<TwoFactorSetupPage />} />
      <Route path="/auth/magic-link" element={<MagicLinkPage />} />
      <Route path="/auth/password-reset" element={<PasswordResetPage />} />
      <Route path="/auth/set-new-password" element={<SetNewPasswordPage />} />
      <Route path="/auth/confirm-email" element={<ConfirmEmailPage />} />
      <Route path="/auth/recovery-codes" element={<RecoveryCodesPage />} />
      <Route path="/invite/:code" element={<ParamRedirect build={(p) => `/auth/invite/${p.code ?? ''}`} />} />

      {/* Jobs & economy */}
      <Route path="/work/jobs" element={<JobsPage />} />
      <Route path="/work/jobs/:slug" element={<JobDetailPage />} />
      <Route path="/work/housing" element={<HousingPage />} />
      <Route path="/work/housing/:slug" element={<HousingListingPage />} />
      <Route path="/work/landlord/:slug" element={<LandlordPage />} />
      <Route path="/work/skills" element={<SkillsPage />} />
      <Route path="/work/grants" element={<GrantsPage />} />
      <Route path="/work/barter" element={<BarterPage />} />
      <Route path="/work/barter/:id" element={<BarterDetailPage />} />
      <Route path="/work/offer" element={<OfferPage />} />
      <Route path="/work/employer-reviews" element={<EmployerReviewsPage />} />
      <Route path="/work/application-status" element={<ApplicationStatusPage />} />
      <Route path="/work/mentorship" element={<MentorshipPage />} />
      <Route path="/work/mentorship/:slug" element={<MentorDetailPage />} />
      <Route path="/work/mentor-profile" element={<MentorProfilePage />} />
      <Route path="/jobs/:slug" element={<ParamRedirect build={(p) => `/work/jobs/${p.slug ?? ''}`} />} />
      <Route path="/housing/:slug" element={<ParamRedirect build={(p) => `/work/housing/${p.slug ?? ''}`} />} />
      <Route path="/landlord/:slug" element={<ParamRedirect build={(p) => `/work/landlord/${p.slug ?? ''}`} />} />
      <Route path="/barter/:id" element={<ParamRedirect build={(p) => `/work/barter/${p.id ?? ''}`} />} />
      <Route path="/mentorship/:slug" element={<ParamRedirect build={(p) => `/work/mentorship/${p.slug ?? ''}`} />} />
      <Route path="/economy" element={<EconomyPage />} />
      <Route path="/economy/invoice" element={<InvoiceGeneratorPage />} />
      <Route path="/economy/contract" element={<ContractGeneratorPage />} />
      <Route path="/economy/scope" element={<ScopeGeneratorPage />} />
      <Route path="/economy/recibo-verde-guide" element={<ReciboVerdeGuidePage />} />
      <Route path="/economy/take-home" element={<TakeHomeCalculatorPage />} />
      <Route path="/economy/iva-tracker" element={<IvaTrackerPage />} />
      <Route path="/economy/set-aside" element={<SetAsidePlannerPage />} />
      <Route path="/economy/day-rate" element={<DayRateCalculatorPage />} />
      <Route path="/economy/rate-board" element={<RateBoardPage />} />
      <Route path="/economy/sliding-scale" element={<SlidingScalePage />} />
      <Route path="/economy/freelance-vs-salaried" element={<ComparatorPage />} />

      {/* Cinema */}
      <Route path="/cinema" element={<CinemaPage />} />
      <Route path="/cinema/browse" element={<CinemaBrowsePage />} />
      <Route path="/cinema/membership" element={<CinemaMembershipPage />} />
      <Route path="/cinema/watch" element={<WatchPage />} />
      <Route path="/film" element={<FilmPage />} />

      {/* Studio */}
      <Route path="/studio" element={<StudioPage />} />
      <Route path="/studio/album" element={<StudioAlbumPage />} />
      <Route path="/studio/artist" element={<StudioArtistPage />} />
      <Route path="/studio/dashboard" element={<StudioDashboardPage />} />
      <Route path="/studio/upload" element={<StudioUploadPage />} />
      <Route path="/studio/payouts" element={<StudioPayoutsPage />} />
      <Route path="/studio/track" element={<StudioTrackPage />} />
      <Route path="/studio/live" element={<StudioLivePage />} />
      <Route path="/studio/collection" element={<StudioCollectionPage />} />
      <Route path="/studio/set" element={<StudioSetPage />} />
      <Route path="/studio/search" element={<StudioSearchPage />} />
      <Route path="/studio/library" element={<StudioLibraryPage />} />
      <Route path="/studio/checkout" element={<StudioCheckoutPage />} />
      <Route path="/studio/sheet-store" element={<StudioSheetStorePage />} />
      <Route path="/studio/solidarity-fund" element={<StudioSolidarityFundPage />} />
      <Route path="/studio/calls" element={<StudioOpenCallsPage />} />
      <Route path="/studio/set-submission" element={<StudioSetSubmissionPage />} />
      <Route path="/studio/council" element={<StudioCouncilPage />} />
      <Route path="/studio/triage" element={<StudioTriagePage />} />
      <Route path="/studio/flag-review" element={<StudioFlagReviewPage />} />
      <Route path="/studio/off-air" element={<StudioOffAirPage />} />
      <Route path="/studio/404" element={<Studio404Page />} />
      <Route path="/studio/500" element={<Studio500Page />} />
      <Route path="/studio/sign-in" element={<StudioSignInPage />} />
      <Route path="/studio/settings" element={<StudioSettingsPage />} />

      {/* Community */}
      <Route path="/changemakers" element={<ChangemakersPage />} />
      <Route path="/changemaker/:slug" element={<ChangemakerStoryPage />} />
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/thread" element={<ThreadPage />} />
      <Route path="/thread/:id" element={<ThreadPage />} />
      <Route path="/account/settings" element={<SettingsPage />} />

      {/* Marketing / content */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/about/contact" element={<ContactPage />} />
      <Route path="/about/help" element={<HelpPage />} />
      <Route path="/about/volunteer" element={<VolunteerPage />} />
      <Route path="/about/volunteer/opportunity/:slug" element={<VolunteerOpportunityPage />} />
      <Route path="/about/platforms" element={<PlatformsPage />} />
      <Route path="/about/donate" element={<DonatePage />} />
      <Route path="/about/partners" element={<PartnersPage />} />
      <Route path="/about/partners/:slug" element={<PartnerDetailPage />} />
      <Route path="/resources" element={<ResourceLibraryPage />} />
      <Route path="/activism" element={<ActivismPage />} />
      <Route path="/archive" element={<ArchivePage />} />
      <Route path="/annual-assembly/minutes/:year" element={<ParamRedirect build={(p) => `/about/annual-assembly/minutes/${p.year ?? ''}`} />} />
      <Route path="/volunteer-opportunity/:slug" element={<ParamRedirect build={(p) => `/about/volunteer/opportunity/${p.slug ?? ''}`} />} />
      <Route path="/partner/:slug" element={<ParamRedirect build={(p) => `/about/partners/${p.slug ?? ''}`} />} />

      <Route path="/work/flatmates" element={<FlatmatesPage />} />
      <Route path="/work/solidarity" element={<SolidarityPage />} />

      {/* Local */}
      <Route path="/local/safe-spaces" element={<SafeSpacesPage />} />
      <Route path="/local/safe-spaces/:slug" element={<SafeSpaceDetailPage />} />
      <Route path="/local/visas" element={<VisasPage />} />
      <Route path="/local/arriving" element={<ArrivingPage />} />
      <Route path="/local/map" element={<MapPage />} />
      <Route path="/local/directory" element={<DirectoryPage />} />
      <Route path="/local/directory/:slug" element={<DirectorySpacePage />} />
      <Route path="/safe-space/:slug" element={<ParamRedirect build={(p) => `/local/safe-spaces/${p.slug ?? ''}`} />} />
      <Route path="/space/:slug" element={<ParamRedirect build={(p) => `/local/directory/${p.slug ?? ''}`} />} />

      {/* Account hub & settings sub-flows (all under /account) */}
      <Route path="/account" element={<Navigate to="/account/profile" replace />} />
      <Route path="/account/edit-profile" element={<EditProfilePage />} />
      <Route path="/account/work" element={<WorkHubPage />} />
      <Route path="/account/work-profile" element={<WorkProfilePage />} />
      <Route path="/account/notification-preferences" element={<NotificationPreferencesPage />} />
      <Route path="/account/accessibility-preferences" element={<AccessibilityPreferencesPage />} />
      <Route path="/account/profile-theme" element={<ProfileThemePage />} />
      <Route path="/account/linked-accounts" element={<LinkedAccountsPage />} />
      <Route path="/account/security" element={<SecurityPage />} />
      <Route path="/account/sessions" element={<SessionsPage />} />
      <Route path="/account/subscriptions" element={<SubscriptionsPage />} />
      <Route path="/account/data-export" element={<DataExportPage />} />
      <Route path="/account/delete-account" element={<DeleteAccountPage />} />
      <Route path="/account/cancel-membership" element={<CancelMembershipPage />} />
      <Route path="/account/membership" element={<MembershipPage />} />
      <Route path="/account/gift-membership" element={<GiftMembershipPage />} />

      {/* Legacy paths → new homes (keeps old links & design hrefs working) */}
      {LEGACY_REDIRECTS.map(([from, to]) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}

      {/* System, error & account-state screens */}
      <Route path="/system/500" element={<ServerErrorPage />} />
      <Route path="/system/maintenance" element={<MaintenancePage />} />
      <Route path="/system/offline" element={<OfflinePage />} />
      <Route path="/system/geo-restricted" element={<GeoRestrictedPage />} />
      <Route path="/system/pwa-prompt" element={<PwaPromptPage />} />
      <Route path="/system/account-banned" element={<AccountBannedPage />} />
      <Route path="/system/account-locked" element={<AccountLockedPage />} />
      <Route path="/system/account-suspended" element={<AccountSuspendedPage />} />
      <Route path="/system/invite-expired" element={<InviteExpiredPage />} />
      <Route path="/system/pending-review" element={<PendingReviewPage />} />
      <Route path="/system/verification-needed" element={<VerificationNeededPage />} />
      <Route path="/system/status" element={<StatusPage />} />

      {/* Newly built community / resource / support pages */}
      <Route path="/coming-out" element={<ComingOutPage />} />
      <Route path="/parents" element={<Navigate to="/family" replace />} />
      <Route path="/gatherings" element={<GatheringsPage />} />
      <Route path="/vouch" element={<VouchPage />} />

      {/* Admin & moderation panel */}
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/moderation" element={<AdminModerationPage />} />
      <Route path="/admin/members" element={<AdminMembersPage />} />
      <Route path="/admin/communities" element={<AdminCommunitiesPage />} />
      <Route path="/admin/governance" element={<AdminGovernancePage />} />
      <Route path="/admin/communities/:slug/mod" element={<AdminCommunityModPage />} />
      <Route path="/mod/:slug" element={<ModPanelPage />} />

      {/* Legacy aliases → canonical pages */}
      <Route path="/business-directory" element={<Navigate to="/local/directory" replace />} />
      <Route path="/spaces-map" element={<Navigate to="/local/map" replace />} />

      {/* Known-but-unbuilt features → styled "coming soon" placeholder */}
      {KNOWN_ROUTE_SLUGS.filter((slug) => !BUILT_SLUGS.has(slug)).map((slug) => (
        <Route key={slug} path={`/${slug}`} element={<PlaceholderPage />} />
      ))}
      {/* Genuinely unknown paths → 404 */}
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
