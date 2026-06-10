import { Route, Routes } from 'react-router-dom'
import { HomePage } from '../features/homepage/HomePage'
import { MembersPage } from '../features/members/MembersPage'
import { ProfilePage } from '../features/members/ProfilePage'
import { MemberDirectoryFilterPage } from '../features/members/MemberDirectoryFilterPage'
import { SearchPage } from '../features/members/SearchPage'
import { ConnectionsPage } from '../features/connect/ConnectionsPage'
import { DatingPage } from '../features/community/DatingPage'
import { ReadingGroupsPage } from '../features/community/ReadingGroupsPage'
import { FamilyPage } from '../features/community/FamilyPage'
import { FeedPage } from '../features/feed/FeedPage'
import { NotificationsPage } from '../features/notifications/NotificationsPage'
import { ConnectPage } from '../features/connect/ConnectPage'
import { MessagesPage } from '../features/messages/MessagesPage'
import { CommunitiesPage } from '../features/communities/CommunitiesPage'
import { CommunityDetailPage } from '../features/communities/CommunityDetailPage'
import { CalendarPage } from '../features/gatherings/CalendarPage'
import { GatheringPage } from '../features/gatherings/GatheringPage'
import { EventPage } from '../features/gatherings/EventPage'
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
import { StoryPage } from '../features/magazine/StoryPage'
import { CreativesPage } from '../features/community/CreativesPage'
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
import { OnboardingPage } from '../features/auth/OnboardingPage'
import { JobsPage } from '../features/economy/JobsPage'
import { HousingPage } from '../features/economy/HousingPage'
import { SkillsPage } from '../features/economy/SkillsPage'
import { GrantsPage } from '../features/economy/GrantsPage'
import { BarterPage } from '../features/economy/BarterPage'
import { OfferPage } from '../features/economy/OfferPage'
import { EmployerReviewsPage } from '../features/economy/EmployerReviewsPage'
import { ApplicationStatusPage } from '../features/economy/ApplicationStatusPage'
import { MentorshipPage } from '../features/economy/MentorshipPage'
import { EconomyPage } from '../features/economy/EconomyPage'
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
import { ResourceLibraryPage } from '../features/marketing/ResourceLibraryPage'
import { PartnersPage } from '../features/marketing/PartnersPage'
import { ActivismPage } from '../features/marketing/ActivismPage'
import { PlatformsPage } from '../features/marketing/PlatformsPage'
import { MapPage } from '../features/marketing/MapPage'
import { SafeSpacesPage } from '../features/safety/SafeSpacesPage'
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
  'connect',
  'communities',
  'calendar',
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
])

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
      <Route path="/members" element={<MembersPage />} />
      <Route path="/member-directory-filter" element={<MemberDirectoryFilterPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:slug" element={<ProfilePage />} />
      <Route path="/connect" element={<ConnectPage />} />
      <Route path="/connect/:slug" element={<ConnectPage />} />
      <Route path="/connections" element={<ConnectionsPage />} />
      <Route path="/dating" element={<DatingPage />} />
      <Route path="/reading-groups" element={<ReadingGroupsPage />} />
      <Route path="/family" element={<FamilyPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/communities" element={<CommunitiesPage />} />
      <Route path="/community/:slug" element={<CommunityDetailPage />} />

      {/* Gatherings */}
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/gathering" element={<GatheringPage />} />
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
      <Route path="/story" element={<StoryPage />} />
      <Route path="/creatives" element={<CreativesPage />} />
      <Route path="/manifesto" element={<ManifestoPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/dsar" element={<DsarPage />} />
      <Route path="/constitution" element={<ConstitutionPage />} />
      <Route path="/code-of-conduct" element={<CodeOfConductPage />} />
      <Route path="/changelog" element={<ChangelogPage />} />
      <Route path="/press-archive" element={<PressArchivePage />} />
      <Route path="/newsletter" element={<NewsletterPage />} />
      <Route path="/annual-assembly" element={<AnnualAssemblyPage />} />
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
      <Route path="/trans-day-of-visibility" element={<TransDayOfVisibilityPage />} />
      <Route path="/world-aids-day" element={<WorldAidsDayPage />} />
      <Route path="/pride-month" element={<PrideMonthPage />} />
      <Route path="/micro-grants" element={<MicroGrantsPage />} />
      <Route path="/intersectionality" element={<IntersectionalityPage />} />
      <Route path="/trans-hub" element={<TransHubPage />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route path="/safety" element={<SafetyPage />} />

      {/* Auth & onboarding */}
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/create-account" element={<CreateAccountPage />} />
      <Route path="/invite" element={<InvitePage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/welcome" element={<OnboardingPage />} />

      {/* Jobs & economy */}
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/housing" element={<HousingPage />} />
      <Route path="/skills" element={<SkillsPage />} />
      <Route path="/grants" element={<GrantsPage />} />
      <Route path="/barter" element={<BarterPage />} />
      <Route path="/offer" element={<OfferPage />} />
      <Route path="/employer-reviews" element={<EmployerReviewsPage />} />
      <Route path="/application-status" element={<ApplicationStatusPage />} />
      <Route path="/mentorship" element={<MentorshipPage />} />
      <Route path="/economy" element={<EconomyPage />} />

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
      <Route path="/studio/sheet-store" element={<StudioSheetStorePage />} />
      <Route path="/studio/solidarity-fund" element={<StudioSolidarityFundPage />} />
      <Route path="/studio/calls" element={<StudioOpenCallsPage />} />
      <Route path="/studio/set-submission" element={<StudioSetSubmissionPage />} />
      <Route path="/studio/council" element={<StudioCouncilPage />} />
      <Route path="/studio/triage" element={<StudioTriagePage />} />
      <Route path="/studio/flag-review" element={<StudioFlagReviewPage />} />

      {/* Community */}
      <Route path="/changemakers" element={<ChangemakersPage />} />
      <Route path="/changemaker/:slug" element={<ChangemakerStoryPage />} />
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/thread" element={<ThreadPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/governance" element={<GovernancePage />} />

      {/* Marketing / content */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/volunteer" element={<VolunteerPage />} />
      <Route path="/volunteer-opportunity/:slug" element={<VolunteerOpportunityPage />} />
      <Route path="/guidelines" element={<GuidelinesPage />} />
      <Route path="/directory" element={<DirectoryPage />} />
      <Route path="/resources" element={<ResourceLibraryPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/activism" element={<ActivismPage />} />
      <Route path="/platforms" element={<PlatformsPage />} />
      <Route path="/map" element={<MapPage />} />

      {/* Lisbon */}
      <Route path="/safe-spaces" element={<SafeSpacesPage />} />
      <Route path="/flatmates" element={<FlatmatesPage />} />
      <Route path="/solidarity" element={<SolidarityPage />} />
      <Route path="/visas" element={<VisasPage />} />
      <Route path="/arriving" element={<ArrivingPage />} />

      {/* Safety & lifecycle flows */}
      <Route path="/report" element={<ReportPage />} />
      <Route path="/leave" element={<LeavePage />} />
      <Route path="/block-mute" element={<BlockMutePage />} />
      <Route path="/appeal-outcome" element={<AppealOutcomePage />} />

      {/* Known-but-unbuilt features → styled "coming soon" placeholder */}
      {KNOWN_ROUTE_SLUGS.filter((slug) => !BUILT_SLUGS.has(slug)).map((slug) => (
        <Route key={slug} path={`/${slug}`} element={<PlaceholderPage />} />
      ))}
      {/* Genuinely unknown paths → 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
