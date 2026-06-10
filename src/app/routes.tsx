import { Route, Routes } from 'react-router-dom'
import { HomePage } from '../features/homepage/HomePage'
import { MembersPage } from '../features/members/MembersPage'
import { ProfilePage } from '../features/members/ProfilePage'
import { FeedPage } from '../features/feed/FeedPage'
import { NotificationsPage } from '../features/notifications/NotificationsPage'
import { ConnectPage } from '../features/connect/ConnectPage'
import { MessagesPage } from '../features/messages/MessagesPage'
import { CommunitiesPage } from '../features/communities/CommunitiesPage'
import { CalendarPage } from '../features/gatherings/CalendarPage'
import { GatheringPage } from '../features/gatherings/GatheringPage'
import { EventPage } from '../features/gatherings/EventPage'
import { RsvpPage } from '../features/gatherings/RsvpPage'
import { GatheringRecapPage } from '../features/gatherings/GatheringRecapPage'
import { HostPage } from '../features/gatherings/HostPage'
import { MagazinePage } from '../features/magazine/MagazinePage'
import { ArticlePage } from '../features/magazine/ArticlePage'
import { AuthorPage } from '../features/magazine/AuthorPage'
import { IssuePage } from '../features/magazine/IssuePage'
import { WellbeingPage } from '../features/resources/WellbeingPage'
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
import { ForumPage } from '../features/forum/ForumPage'
import { ThreadPage } from '../features/forum/ThreadPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { GovernancePage } from '../features/governance/GovernancePage'
import { AboutPage } from '../features/marketing/AboutPage'
import { ContactPage } from '../features/marketing/ContactPage'
import { HelpPage } from '../features/marketing/HelpPage'
import { VolunteerPage } from '../features/marketing/VolunteerPage'
import { GuidelinesPage } from '../features/marketing/GuidelinesPage'
import { DirectoryPage } from '../features/marketing/DirectoryPage'
import { ResourceLibraryPage } from '../features/marketing/ResourceLibraryPage'
import { PartnersPage } from '../features/marketing/PartnersPage'
import { ActivismPage } from '../features/marketing/ActivismPage'
import { PlatformsPage } from '../features/marketing/PlatformsPage'
import { MapPage } from '../features/marketing/MapPage'
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
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:slug" element={<ProfilePage />} />
      <Route path="/connect" element={<ConnectPage />} />
      <Route path="/connect/:slug" element={<ConnectPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/communities" element={<CommunitiesPage />} />

      {/* Gatherings */}
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/gathering" element={<GatheringPage />} />
      <Route path="/event" element={<EventPage />} />
      <Route path="/rsvp" element={<RsvpPage />} />
      <Route path="/rsvp-ticket" element={<RsvpPage />} />
      <Route path="/gathering-recap" element={<GatheringRecapPage />} />
      <Route path="/host" element={<HostPage />} />

      {/* Magazine */}
      <Route path="/magazine" element={<MagazinePage />} />
      <Route path="/article" element={<ArticlePage />} />
      <Route path="/author" element={<AuthorPage />} />
      <Route path="/issue" element={<IssuePage />} />

      {/* Resources & Wellbeing */}
      <Route path="/wellbeing" element={<WellbeingPage />} />
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
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/thread" element={<ThreadPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/governance" element={<GovernancePage />} />

      {/* Marketing / content */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/volunteer" element={<VolunteerPage />} />
      <Route path="/guidelines" element={<GuidelinesPage />} />
      <Route path="/directory" element={<DirectoryPage />} />
      <Route path="/resources" element={<ResourceLibraryPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/activism" element={<ActivismPage />} />
      <Route path="/platforms" element={<PlatformsPage />} />
      <Route path="/map" element={<MapPage />} />

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
