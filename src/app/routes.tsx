import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { HomePage } from '../features/homepage/HomePage'
import { ProfilePage } from '../features/members/ProfilePage'
import { MemberDirectoryFilterPage } from '../features/members/MemberDirectoryFilterPage'
import { SearchPage } from '../features/members/SearchPage'
import { ConnectionsPage } from '../features/connect/ConnectionsPage'
import { DatingPage } from '../features/community/DatingPage'
import { ReadingGroupsPage } from '../features/community/ReadingGroupsPage'
import { FamilyPage } from '../features/community/FamilyPage'
import { FeedPage } from '../features/feed/FeedPage'
import { NotificationsPage } from '../features/notifications/NotificationsPage'
import { MessagesPage } from '../features/messages/MessagesPage'
import { CommunitiesPage } from '../features/communities/CommunitiesPage'
import { CommunitiesHomePage } from '../features/communities/CommunitiesHomePage'
import { CommunityDetailPage } from '../features/communities/CommunityDetailPage'
import { CalendarPage } from '../features/gatherings/CalendarPage'
import { GatheringPage } from '../features/gatherings/GatheringPage'
import { EventPage } from '../features/gatherings/EventPage'
import { EventsPage } from '../features/gatherings/EventsPage'
import { RsvpPage } from '../features/gatherings/RsvpPage'
import { GatheringRecapPage } from '../features/gatherings/GatheringRecapPage'
import { HostPage } from '../features/gatherings/HostPage'
import { CreateGatheringPage } from '../features/gatherings/CreateGatheringPage'
import { GatheringDashboardPage } from '../features/gatherings/GatheringDashboardPage'
import { ManageGatheringPage } from '../features/gatherings/ManageGatheringPage'
import { CoHostInvitePage } from '../features/gatherings/CoHostInvitePage'
import { GatheringCancelledPage } from '../features/gatherings/GatheringCancelledPage'
import { GatheringPhotosPage } from '../features/gatherings/GatheringPhotosPage'
import { MagazinePage } from '../features/magazine/MagazinePage'
import { ArticlePage } from '../features/magazine/ArticlePage'
import { AuthorPage } from '../features/magazine/AuthorPage'
import { IssuePage } from '../features/magazine/IssuePage'
import { IssuesPage } from '../features/magazine/IssuesPage'
import { CoverGalleryPage } from '../features/magazine/CoverGalleryPage'
import { TagPage } from '../features/magazine/TagPage'
import { PodcastShowPage } from '../features/magazine/PodcastShowPage'
import { AudioPlayerPage } from '../features/magazine/AudioPlayerPage'
import { NewsletterArchivePage } from '../features/magazine/NewsletterArchivePage'
import { NewsletterArchiveIssuePage } from '../features/magazine/NewsletterArchiveIssuePage'
import { StoryPage } from '../features/magazine/StoryPage'
import { StoryTomasPage } from '../features/magazine/StoryTomasPage'
import { StorySafetyPage } from '../features/magazine/StorySafetyPage'
import { CreativesPage } from '../features/community/CreativesPage'
import { CulturePage } from '../features/culture/CulturePage'
import { ManifestoPage } from '../features/marketing/ManifestoPage'
import { PrivacyPage } from '../features/marketing/PrivacyPage'
import { TermsPage } from '../features/marketing/TermsPage'
import { DsarPage } from '../features/marketing/DsarPage'
import { ConstitutionPage } from '../features/marketing/ConstitutionPage'
import { CodeOfConductPage } from '../features/marketing/CodeOfConductPage'
import { ChangelogPage } from '../features/marketing/ChangelogPage'
import { PressArchivePage } from '../features/marketing/PressArchivePage'
import { NewsletterPage } from '../features/marketing/NewsletterPage'
import { AnnualAssemblyPage } from '../features/marketing/AnnualAssemblyPage'
import { AssemblyMinutesPage } from '../features/marketing/AssemblyMinutesPage'
import { GetTheAppPage } from '../features/marketing/GetTheAppPage'
import { ComponentLibraryPage } from '../features/marketing/ComponentLibraryPage'
import { CitiesPage } from '../features/marketing/CitiesPage'
import { ForOrganisationsPage } from '../features/marketing/ForOrganisationsPage'
import { PressKitPage } from '../features/marketing/PressKitPage'
import { TransparencyReportPage } from '../features/marketing/TransparencyReportPage'
import { AccessibilityPage } from '../features/marketing/AccessibilityPage'
import { WellbeingPage } from '../features/resources/WellbeingPage'
import { MentalHealthPage } from '../features/resources/MentalHealthPage'
import { TransHealthcarePage } from '../features/resources/TransHealthcarePage'
import { HarmReductionPage } from '../features/resources/HarmReductionPage'
import { SexualHealthPage } from '../features/resources/SexualHealthPage'
import { SoberPage } from '../features/resources/SoberPage'
import { Queer101Page } from '../features/resources/Queer101Page'
import { GlossaryPage } from '../features/resources/GlossaryPage'
import { TransDayOfVisibilityPage } from '../features/resources/TransDayOfVisibilityPage'
import { WorldAidsDayPage } from '../features/resources/WorldAidsDayPage'
import { PrideMonthPage } from '../features/resources/PrideMonthPage'
import { MicroGrantsPage } from '../features/resources/MicroGrantsPage'
import { IntersectionalityPage } from '../features/resources/IntersectionalityPage'
import { TransHubPage } from '../features/resources/TransHubPage'
import { LegalPage } from '../features/resources/LegalPage'
import { SafetyPage } from '../features/resources/SafetyPage'
import { SignInPage } from '../features/auth/SignInPage'
import { CreateAccountPage } from '../features/auth/CreateAccountPage'
import { InvitePage } from '../features/auth/InvitePage'
import { RequestInvitePage } from '../features/auth/RequestInvitePage'
import { OnboardingPage } from '../features/auth/OnboardingPage'
import { WelcomeTourPage } from '../features/auth/WelcomeTourPage'
import { JobsPage } from '../features/economy/JobsPage'
import { JobDetailPage } from '../features/economy/JobDetailPage'
import { HousingPage } from '../features/economy/HousingPage'
import { HousingListingPage } from '../features/economy/HousingListingPage'
import { LandlordPage } from '../features/economy/LandlordPage'
import { SkillsPage } from '../features/economy/SkillsPage'
import { GrantsPage } from '../features/economy/GrantsPage'
import { BarterPage } from '../features/economy/BarterPage'
import { BarterDetailPage } from '../features/economy/BarterDetailPage'
import { OfferPage } from '../features/economy/OfferPage'
import { EmployerReviewsPage } from '../features/economy/EmployerReviewsPage'
import { ApplicationStatusPage } from '../features/economy/ApplicationStatusPage'
import { MentorshipPage } from '../features/economy/MentorshipPage'
import { MentorDetailPage } from '../features/economy/MentorDetailPage'
import { EconomyPage } from '../features/economy/EconomyPage'
import { InvoiceGeneratorPage } from '../features/economy/InvoiceGeneratorPage'
import { ContractGeneratorPage } from '../features/economy/ContractGeneratorPage'
import { ScopeGeneratorPage } from '../features/economy/ScopeGeneratorPage'
import { ReciboVerdeGuidePage } from '../features/economy/ReciboVerdeGuidePage'
import { TakeHomeCalculatorPage } from '../features/economy/TakeHomeCalculatorPage'
import { IvaTrackerPage } from '../features/economy/IvaTrackerPage'
import { SetAsidePlannerPage } from '../features/economy/SetAsidePlannerPage'
import { DayRateCalculatorPage } from '../features/economy/DayRateCalculatorPage'
import { RateBoardPage } from '../features/economy/RateBoardPage'
import { SlidingScalePage } from '../features/economy/SlidingScalePage'
import { ComparatorPage } from '../features/economy/ComparatorPage'
import { RunningGuidePage } from '../features/resources/RunningGuidePage'
import { AccessibleLisbonPage } from '../features/resources/AccessibleLisbonPage'
import { PeerSupportPage } from '../features/resources/PeerSupportPage'
import { ArtCritGuidePage } from '../features/resources/ArtCritGuidePage'
import { SharedEquipmentPage } from '../features/resources/SharedEquipmentPage'
import { GroupShowArchivePage } from '../features/resources/GroupShowArchivePage'
import { FirstMeetupGuidePage } from '../features/resources/FirstMeetupGuidePage'
import { QueerPaediatriciansPage } from '../features/resources/QueerPaediatriciansPage'
import { SchoolFormsGuidePage } from '../features/resources/SchoolFormsGuidePage'
import { CommunityPrivacyPage } from '../features/resources/CommunityPrivacyPage'
import { ComingOutAtWorkPage } from '../features/resources/ComingOutAtWorkPage'
import { LgbtqAgingGuidePage } from '../features/resources/LgbtqAgingGuidePage'
import { OralHistoryProjectPage } from '../features/resources/OralHistoryProjectPage'
import { IngredientsMapPage } from '../features/resources/IngredientsMapPage'
import { QtipocOrganisationsPage } from '../features/resources/QtipocOrganisationsPage'
import { QtipocArchivePage } from '../features/resources/QtipocArchivePage'
import { DisabilityHealthcarePage } from '../features/resources/DisabilityHealthcarePage'
import { SpoonTheoryPage } from '../features/resources/SpoonTheoryPage'
import { CinemaPage } from '../features/cinema/CinemaPage'
import { CinemaBrowsePage } from '../features/cinema/CinemaBrowsePage'
import { CinemaMembershipPage } from '../features/cinema/CinemaMembershipPage'
import { FilmPage } from '../features/cinema/FilmPage'
import { WatchPage } from '../features/cinema/WatchPage'
import { StudioPage } from '../features/studio/StudioPage'
import { StudioAlbumPage } from '../features/studio/StudioAlbumPage'
import { StudioArtistPage } from '../features/studio/StudioArtistPage'
import { StudioDashboardPage } from '../features/studio/StudioDashboardPage'
import { StudioUploadPage } from '../features/studio/StudioUploadPage'
import { StudioPayoutsPage } from '../features/studio/StudioPayoutsPage'
import { StudioTrackPage } from '../features/studio/StudioTrackPage'
import { StudioLivePage } from '../features/studio/StudioLivePage'
import { StudioSheetStorePage } from '../features/studio/StudioSheetStorePage'
import { StudioSolidarityFundPage } from '../features/studio/StudioSolidarityFundPage'
import { StudioOpenCallsPage } from '../features/studio/StudioOpenCallsPage'
import { StudioSetSubmissionPage } from '../features/studio/StudioSetSubmissionPage'
import { StudioCouncilPage } from '../features/studio/StudioCouncilPage'
import { StudioTriagePage } from '../features/studio/StudioTriagePage'
import { StudioFlagReviewPage } from '../features/studio/StudioFlagReviewPage'
import { ChangemakersPage } from '../features/community/ChangemakersPage'
import { ChangemakerStoryPage } from '../features/community/ChangemakerStoryPage'
import { ForumPage } from '../features/forum/ForumPage'
import { ThreadPage } from '../features/forum/ThreadPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { GovernancePage } from '../features/governance/GovernancePage'
import { AboutPage } from '../features/marketing/AboutPage'
import { ContactPage } from '../features/marketing/ContactPage'
import { HelpPage } from '../features/marketing/HelpPage'
import { VolunteerPage } from '../features/marketing/VolunteerPage'
import { VolunteerOpportunityPage } from '../features/marketing/VolunteerOpportunityPage'
import { GuidelinesPage } from '../features/marketing/GuidelinesPage'
import { DirectoryPage } from '../features/marketing/DirectoryPage'
import { DirectorySpacePage } from '../features/marketing/DirectorySpacePage'
import { ResourceLibraryPage } from '../features/marketing/ResourceLibraryPage'
import { PartnersPage } from '../features/marketing/PartnersPage'
import { PartnerDetailPage } from '../features/marketing/PartnerDetailPage'
import { ActivismPage } from '../features/marketing/ActivismPage'
import { ArchivePage } from '../features/marketing/ArchivePage'
import { PlatformsPage } from '../features/marketing/PlatformsPage'
import { MapPage } from '../features/marketing/MapPage'
import { SafeSpacesPage } from '../features/safety/SafeSpacesPage'
import { SafeSpaceDetailPage } from '../features/safety/SafeSpaceDetailPage'
import { FlatmatesPage } from '../features/economy/FlatmatesPage'
import { SolidarityPage } from '../features/economy/SolidarityPage'
import { VisasPage } from '../features/marketing/VisasPage'
import { ArrivingPage } from '../features/marketing/ArrivingPage'
import { HateCrimePage } from '../features/safety/HateCrimePage'
import { EmergencyPage } from '../features/safety/EmergencyPage'
import { ReportPage } from '../features/safety/ReportPage'
import { LeavePage } from '../features/safety/LeavePage'
import { BlockMutePage } from '../features/safety/BlockMutePage'
import { AppealOutcomePage } from '../features/safety/AppealOutcomePage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ServerErrorPage } from '../features/system/ServerErrorPage'
import { MaintenancePage } from '../features/system/MaintenancePage'
import { OfflinePage } from '../features/system/OfflinePage'
import { GeoRestrictedPage } from '../features/system/GeoRestrictedPage'
import { PwaPromptPage } from '../features/system/PwaPromptPage'
import { AccountBannedPage } from '../features/system/AccountBannedPage'
import { AccountLockedPage } from '../features/system/AccountLockedPage'
import { AccountSuspendedPage } from '../features/system/AccountSuspendedPage'
import { InviteExpiredPage } from '../features/system/InviteExpiredPage'
import { InviteLandingPage } from '../features/system/InviteLandingPage'
import { PendingReviewPage } from '../features/system/PendingReviewPage'
import { VerificationNeededPage } from '../features/system/VerificationNeededPage'
import { StatusPage } from '../features/system/StatusPage'
import { Studio404Page } from '../features/studio/Studio404Page'
import { Studio500Page } from '../features/studio/Studio500Page'
import { StudioOffAirPage } from '../features/studio/StudioOffAirPage'
import { TwoFactorSetupPage } from '../features/auth/TwoFactorSetupPage'
import { MagicLinkPage } from '../features/auth/MagicLinkPage'
import { PasswordResetPage } from '../features/auth/PasswordResetPage'
import { SetNewPasswordPage } from '../features/auth/SetNewPasswordPage'
import { ConfirmEmailPage } from '../features/auth/ConfirmEmailPage'
import { RecoveryCodesPage } from '../features/auth/RecoveryCodesPage'
import { StudioSignInPage } from '../features/studio/StudioSignInPage'
import { StudioSettingsPage } from '../features/studio/StudioSettingsPage'
import { AccessibilityPreferencesPage } from '../features/settings/AccessibilityPreferencesPage'
import { NotificationPreferencesPage } from '../features/settings/NotificationPreferencesPage'
import { DataExportPage } from '../features/settings/DataExportPage'
import { DeleteAccountPage } from '../features/settings/DeleteAccountPage'
import { EditProfilePage } from '../features/settings/EditProfilePage'
import { LinkedAccountsPage } from '../features/settings/LinkedAccountsPage'
import { SecurityPage } from '../features/settings/SecurityPage'
import { SessionsPage } from '../features/settings/SessionsPage'
import { ProfileThemePage } from '../features/settings/ProfileThemePage'
import { SubscriptionsPage } from '../features/settings/SubscriptionsPage'
import { CancelMembershipPage } from '../features/settings/CancelMembershipPage'
import { MembershipPage } from '../features/settings/MembershipPage'
import { GiftMembershipPage } from '../features/settings/GiftMembershipPage'
import { PublicProfilePage } from '../features/members/PublicProfilePage'
import { MentorProfilePage } from '../features/economy/MentorProfilePage'
import { WorkHubPage } from '../features/economy/WorkHubPage'
import { WorkProfilePage } from '../features/economy/WorkProfilePage'
import { NotificationDeepLinkPage } from '../features/notifications/NotificationDeepLinkPage'
import { MentionsPage } from '../features/notifications/MentionsPage'
import { CollectionsPage } from '../features/members/CollectionsPage'
import { BadgesPage } from '../features/members/BadgesPage'
import { PerksPage } from '../features/members/PerksPage'
import { DraftsPage } from '../features/members/DraftsPage'
import { QrScannerPage } from '../features/members/QrScannerPage'
import { CookiesPage } from '../features/marketing/CookiesPage'
import { PronounsGuidePage } from '../features/resources/PronounsGuidePage'
import { LibraryPage } from '../features/resources/LibraryPage'
import { ComingOutPage } from '../features/community/ComingOutPage'
import { GatheringsPage } from '../features/gatherings/GatheringsPage'
import { CrisisChatPage } from '../features/safety/CrisisChatPage'
import { VouchPage } from '../features/members/VouchPage'
import { DonatePage } from '../features/marketing/DonatePage'
import { SubmitStoryPage } from '../features/magazine/SubmitStoryPage'
import { StudioCollectionPage } from '../features/studio/StudioCollectionPage'
import { StudioSetPage } from '../features/studio/StudioSetPage'
import { StudioSearchPage } from '../features/studio/StudioSearchPage'
import { StudioLibraryPage } from '../features/studio/StudioLibraryPage'
import { StudioCheckoutPage } from '../features/studio/StudioCheckoutPage'
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage'
import { AdminModerationPage } from '../features/admin/AdminModerationPage'
import { AdminMembersPage } from '../features/admin/AdminMembersPage'
import { AdminCommunitiesPage } from '../features/admin/AdminCommunitiesPage'
import { AdminCommunityModPage } from '../features/admin/AdminCommunityModPage'
import { AdminGovernancePage } from '../features/admin/AdminGovernancePage'
import { ModPanelPage } from '../features/admin/ModPanelPage'
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
  'article',
  'author',
  'issue',
  'wellbeing',
  'trans-hub',
  'legal',
  'safety',
  'invite',
  'sign-in',
  'create-account',
  'welcome',
  'welcome-tour',
  'onboarding',
  'jobs',
  'housing',
  'skills',
  'grants',
  'barter',
  'film',
  'changemakers',
  'forum',
  'thread',
  'settings',
  'governance',
  'about',
  'archive',
  'contact',
  'help',
  'volunteer',
  'guidelines',
  'directory',
  'resources',
  'partners',
  'activism',
  'platforms',
  'map',
  'report',
  'leave',
  'block-mute',
  'appeal-outcome',
  'safe-spaces',
  'flatmates',
  'solidarity',
  'visas',
  'arriving',
  'mental-health',
  'trans-healthcare',
  'harm-reduction',
  'sexual-health',
  'sober',
  'hate-crime',
  'emergency',
  '101',
  'glossary',
  'trans-day-of-visibility',
  'world-aids-day',
  'pride-month',
  'micro-grants',
  'intersectionality',
  'issues',
  'cover-gallery',
  'tag',
  'podcast-show',
  'audio-player',
  'newsletter-archive',
  'story',
  'story-tomas',
  'story-safety',
  'creatives',
  'manifesto',
  'offer',
  'employer-reviews',
  'application-status',
  'mentorship',
  'economy',
  'privacy',
  'terms',
  'dsar',
  'constitution',
  'code-of-conduct',
  'changelog',
  'press-archive',
  'newsletter',
  'annual-assembly',
  'get-the-app',
  'component-library',
  'cities',
  'for-organisations',
  'press-kit',
  'transparency-report',
  'accessibility',
  'library',
  'coming-out',
  'parents',
  'gatherings',
  'business-directory',
])

/**
 * Legacy top-level account paths → their new `/account/*` home. Keeps old
 * bookmarks, hardcoded links, and design-prototype hrefs working after the
 * account routes were unified under `/account`.
 */
const ACCOUNT_REDIRECTS: [string, string][] = [
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
]

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
      <Route path="/article" element={<ArticlePage />} />
      <Route path="/author" element={<AuthorPage />} />
      <Route path="/issue" element={<IssuePage />} />
      <Route path="/issues" element={<IssuesPage />} />
      <Route path="/cover-gallery" element={<CoverGalleryPage />} />
      <Route path="/tag" element={<TagPage />} />
      <Route path="/podcast-show" element={<PodcastShowPage />} />
      <Route path="/audio-player" element={<AudioPlayerPage />} />
      <Route path="/newsletter-archive" element={<NewsletterArchivePage />} />
      <Route path="/newsletter-archive/:slug" element={<NewsletterArchiveIssuePage />} />
      <Route path="/story" element={<StoryPage />} />
      <Route path="/story-tomas" element={<StoryTomasPage />} />
      <Route path="/story-safety" element={<StorySafetyPage />} />
      <Route path="/creatives" element={<CreativesPage />} />
      <Route path="/culture" element={<CulturePage />} />
      <Route path="/manifesto" element={<ManifestoPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/dsar" element={<DsarPage />} />
      <Route path="/cookies" element={<CookiesPage />} />
      <Route path="/constitution" element={<ConstitutionPage />} />
      <Route path="/code-of-conduct" element={<CodeOfConductPage />} />
      <Route path="/changelog" element={<ChangelogPage />} />
      <Route path="/press-archive" element={<PressArchivePage />} />
      <Route path="/newsletter" element={<NewsletterPage />} />
      <Route path="/annual-assembly" element={<AnnualAssemblyPage />} />
      <Route path="/annual-assembly/minutes/:year" element={<AssemblyMinutesPage />} />
      <Route path="/get-the-app" element={<GetTheAppPage />} />
      <Route path="/component-library" element={<ComponentLibraryPage />} />
      <Route path="/cities" element={<CitiesPage />} />
      <Route path="/for-organisations" element={<ForOrganisationsPage />} />
      <Route path="/press-kit" element={<PressKitPage />} />
      <Route path="/transparency-report" element={<TransparencyReportPage />} />
      <Route path="/accessibility" element={<AccessibilityPage />} />

      {/* Resources & Wellbeing */}
      <Route path="/wellbeing" element={<WellbeingPage />} />
      <Route path="/mental-health" element={<MentalHealthPage />} />
      <Route path="/trans-healthcare" element={<TransHealthcarePage />} />
      <Route path="/harm-reduction" element={<HarmReductionPage />} />
      <Route path="/sexual-health" element={<SexualHealthPage />} />
      <Route path="/sober" element={<SoberPage />} />
      <Route path="/hate-crime" element={<HateCrimePage />} />
      <Route path="/emergency" element={<EmergencyPage />} />
      <Route path="/101" element={<Queer101Page />} />
      <Route path="/glossary" element={<GlossaryPage />} />
      <Route path="/pronouns-guide" element={<PronounsGuidePage />} />
      <Route path="/trans-day-of-visibility" element={<TransDayOfVisibilityPage />} />
      <Route path="/world-aids-day" element={<WorldAidsDayPage />} />
      <Route path="/pride-month" element={<PrideMonthPage />} />
      <Route path="/micro-grants" element={<MicroGrantsPage />} />
      <Route path="/intersectionality" element={<IntersectionalityPage />} />
      <Route path="/trans-hub" element={<TransHubPage />} />
      <Route path="/legal" element={<LegalPage />} />
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

      {/* Auth & onboarding */}
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/create-account" element={<CreateAccountPage />} />
      <Route path="/invite" element={<InvitePage />} />
      <Route path="/request-invite" element={<RequestInvitePage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/welcome" element={<OnboardingPage />} />
      <Route path="/welcome-tour" element={<WelcomeTourPage />} />
      <Route path="/2fa-setup" element={<TwoFactorSetupPage />} />
      <Route path="/magic-link" element={<MagicLinkPage />} />
      <Route path="/password-reset" element={<PasswordResetPage />} />
      <Route path="/set-new-password" element={<SetNewPasswordPage />} />
      <Route path="/confirm-email" element={<ConfirmEmailPage />} />
      <Route path="/recovery-codes" element={<RecoveryCodesPage />} />

      {/* Jobs & economy */}
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:slug" element={<JobDetailPage />} />
      <Route path="/housing" element={<HousingPage />} />
      <Route path="/housing/:slug" element={<HousingListingPage />} />
      <Route path="/landlord/:slug" element={<LandlordPage />} />
      <Route path="/skills" element={<SkillsPage />} />
      <Route path="/grants" element={<GrantsPage />} />
      <Route path="/barter" element={<BarterPage />} />
      <Route path="/barter/:id" element={<BarterDetailPage />} />
      <Route path="/offer" element={<OfferPage />} />
      <Route path="/employer-reviews" element={<EmployerReviewsPage />} />
      <Route path="/application-status" element={<ApplicationStatusPage />} />
      <Route path="/mentorship" element={<MentorshipPage />} />
      <Route path="/mentorship/:slug" element={<MentorDetailPage />} />
      <Route path="/mentor-profile" element={<MentorProfilePage />} />
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
      <Route path="/governance" element={<GovernancePage />} />

      {/* Marketing / content */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/volunteer" element={<VolunteerPage />} />
      <Route path="/volunteer-opportunity/:slug" element={<VolunteerOpportunityPage />} />
      <Route path="/guidelines" element={<GuidelinesPage />} />
      <Route path="/directory" element={<DirectoryPage />} />
      <Route path="/space/:slug" element={<DirectorySpacePage />} />
      <Route path="/resources" element={<ResourceLibraryPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/partner/:slug" element={<PartnerDetailPage />} />
      <Route path="/activism" element={<ActivismPage />} />
      <Route path="/archive" element={<ArchivePage />} />
      <Route path="/platforms" element={<PlatformsPage />} />
      <Route path="/map" element={<MapPage />} />

      {/* Lisbon */}
      <Route path="/safe-spaces" element={<SafeSpacesPage />} />
      <Route path="/safe-space/:slug" element={<SafeSpaceDetailPage />} />
      <Route path="/flatmates" element={<FlatmatesPage />} />
      <Route path="/solidarity" element={<SolidarityPage />} />
      <Route path="/visas" element={<VisasPage />} />
      <Route path="/arriving" element={<ArrivingPage />} />

      {/* Safety & lifecycle flows */}
      <Route path="/report" element={<ReportPage />} />
      <Route path="/leave" element={<LeavePage />} />
      <Route path="/block-mute" element={<BlockMutePage />} />
      <Route path="/appeal-outcome" element={<AppealOutcomePage />} />

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

      {/* Legacy account paths → /account/* (keeps old links & design hrefs working) */}
      {ACCOUNT_REDIRECTS.map(([from, to]) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}

      {/* System, error & account-state screens */}
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/offline" element={<OfflinePage />} />
      <Route path="/geo-restricted" element={<GeoRestrictedPage />} />
      <Route path="/pwa-prompt" element={<PwaPromptPage />} />
      <Route path="/account-banned" element={<AccountBannedPage />} />
      <Route path="/account-locked" element={<AccountLockedPage />} />
      <Route path="/account-suspended" element={<AccountSuspendedPage />} />
      <Route path="/invite-expired" element={<InviteExpiredPage />} />
      <Route path="/invite-landing" element={<InviteLandingPage />} />
      <Route path="/pending-review" element={<PendingReviewPage />} />
      <Route path="/verification-needed" element={<VerificationNeededPage />} />
      <Route path="/status" element={<StatusPage />} />

      {/* Newly built community / resource / support pages */}
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/coming-out" element={<ComingOutPage />} />
      <Route path="/parents" element={<Navigate to="/family" replace />} />
      <Route path="/gatherings" element={<GatheringsPage />} />
      <Route path="/crisis-chat" element={<CrisisChatPage />} />
      <Route path="/vouch" element={<VouchPage />} />
      <Route path="/donate" element={<DonatePage />} />
      <Route path="/submit-story" element={<SubmitStoryPage />} />

      {/* Admin & moderation panel */}
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/moderation" element={<AdminModerationPage />} />
      <Route path="/admin/members" element={<AdminMembersPage />} />
      <Route path="/admin/communities" element={<AdminCommunitiesPage />} />
      <Route path="/admin/governance" element={<AdminGovernancePage />} />
      <Route path="/admin/communities/:slug/mod" element={<AdminCommunityModPage />} />
      <Route path="/mod/:slug" element={<ModPanelPage />} />

      {/* Legacy aliases → canonical pages */}
      <Route path="/business-directory" element={<Navigate to="/directory" replace />} />
      <Route path="/spaces-map" element={<Navigate to="/map" replace />} />

      {/* Known-but-unbuilt features → styled "coming soon" placeholder */}
      {KNOWN_ROUTE_SLUGS.filter((slug) => !BUILT_SLUGS.has(slug)).map((slug) => (
        <Route key={slug} path={`/${slug}`} element={<PlaceholderPage />} />
      ))}
      {/* Genuinely unknown paths → 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
