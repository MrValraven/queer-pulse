/**
 * Clean router paths for the app.
 *
 * For static links, prefer the typed `routes` constants below
 * (e.g. `to={routes.signIn}`) — these are plain React paths with no legacy
 * design-filename strings.
 *
 * `linkToPath()` remains a runtime normalizer for dynamic hrefs that still
 * flow through data (it passes clean paths straight through and turns a bare
 * in-page anchor like `"#discovery"` into the home anchor `"/#discovery"`).
 */

const HTML_SUFFIX = '.html'
const FILE_PREFIX = 'QueerPulse '

/** Slugify the human page name into a path segment. */
function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Map a prototype href to a clean router path (preserving any #anchor). */
export function linkToPath(href: string): string {
  if (!href) return '/'

  // Pure in-page anchor → home anchor
  if (href.startsWith('#')) return `/${href}`

  const [file, anchor] = href.split('#')
  const hash = anchor ? `#${anchor}` : ''

  if (!file.endsWith(HTML_SUFFIX)) {
    // Already a path or external — pass through
    return href
  }

  let name = file.slice(0, -HTML_SUFFIX.length)
  if (name.startsWith(FILE_PREFIX)) name = name.slice(FILE_PREFIX.length)

  // The homepage itself
  if (name === 'Homepage' || name === 'Homepage v2') return `/${hash}`

  return `/${slugify(name)}${hash}`
}

/**
 * Typed clean-path constants for every page. Prefer these over passing the
 * legacy "QueerPulse <Name>.html" design-filename strings through linkToPath().
 * Values are the exact slugs linkToPath() produces (kept in sync via slugify).
 */
export const routes = {
  about: '/about',
  accessibility: '/accessibility',
  accountLocked: '/account-locked',
  activism: '/activism',
  appealOutcome: '/appeal-outcome',
  annualAssembly: '/annual-assembly',
  applicationStatus: '/application-status',
  archive: '/archive',
  arriving: '/arriving',
  article: '/article',
  audioPlayer: '/audio-player',
  author: '/author',
  barter: '/barter',
  businessDirectory: '/business-directory',
  calendar: '/calendar',
  cancelMembership: '/cancel-membership',
  changelog: '/changelog',
  changemakers: '/changemakers',
  cinema: '/cinema',
  cities: '/cities',
  codeOfConduct: '/code-of-conduct',
  collections: '/collections',
  comingOut: '/coming-out',
  communities: '/communities',
  componentLibrary: '/component-library',
  connect: '/connect',
  connections: '/connections',
  constitution: '/constitution',
  contact: '/contact',
  cookies: '/cookies',
  coverGallery: '/cover-gallery',
  createAccount: '/create-account',
  creatives: '/creatives',
  crisisChat: '/crisis-chat',
  dataExport: '/data-export',
  dating: '/dating',
  deleteAccount: '/delete-account',
  directory: '/directory',
  donate: '/donate',
  drafts: '/drafts',
  dsar: '/dsar',
  economy: '/economy',
  editProfile: '/edit-profile',
  emergency: '/emergency',
  employerReviews: '/employer-reviews',
  event: '/event',
  events: '/events',
  family: '/family',
  flatmates: '/flatmates',
  forOrganisations: '/for-organisations',
  forum: '/forum',
  gathering: '/gathering',
  gatheringCancelled: '/gathering-cancelled',
  gatheringDashboard: '/gathering-dashboard',
  gatheringRecap: '/gathering-recap',
  getTheApp: '/get-the-app',
  giftMembership: '/gift-membership',
  glossary: '/glossary',
  governance: '/governance',
  grants: '/grants',
  guidelines: '/guidelines',
  harmReduction: '/harm-reduction',
  hateCrime: '/hate-crime',
  help: '/help',
  homepage: '/',
  host: '/host',
  housing: '/housing',
  intersectionality: '/intersectionality',
  invite: '/invite',
  issue: '/issue',
  issues: '/issues',
  jobs: '/jobs',
  legal: '/legal',
  library: '/library',
  magazine: '/magazine',
  magicLink: '/magic-link',
  manageGathering: '/manage-gathering',
  manifesto: '/manifesto',
  map: '/map',
  memberDirectoryFilter: '/member-directory-filter',
  membership: '/membership',
  mentions: '/mentions',
  mentorProfile: '/mentor-profile',
  mentalHealth: '/mental-health',
  mentorship: '/mentorship',
  messages: '/messages',
  microGrants: '/micro-grants',
  newsletter: '/newsletter',
  newsletterArchive: '/newsletter-archive',
  notificationPreferences: '/notification-preferences',
  notificationDeepLink: '/notification-deep-link',
  notifications: '/notifications',
  offer: '/offer',
  parents: '/parents',
  partner: '/partner',
  partners: '/partners',
  passwordReset: '/password-reset',
  platforms: '/platforms',
  podcastShow: '/podcast-show',
  pressArchive: '/press-archive',
  pressKit: '/press-kit',
  prideMonth: '/pride-month',
  privacy: '/privacy',
  profile: '/profile',
  pronounsGuide: '/pronouns-guide',
  publicProfile: '/public-profile',
  qrScanner: '/qr-scanner',
  queer101: '/101',
  readingGroups: '/reading-groups',
  report: '/report',
  resources: '/resources',
  rsvpTicket: '/rsvp-ticket',
  safeSpaces: '/safe-spaces',
  safety: '/safety',
  search: '/search',
  security: '/security',
  settings: '/settings',
  sexualHealth: '/sexual-health',
  signIn: '/sign-in',
  skills: '/skills',
  sober: '/sober',
  solidarity: '/solidarity',
  spacesMap: '/spaces-map',
  status: '/status',
  story: '/story',
  storySafety: '/story-safety',
  storyTomas: '/story-tomas',
  studio: '/studio',
  studioAlbum: '/studio/album',
  studioCheckout: '/studio/checkout',
  studioCollection: '/studio/collection',
  studioE: '/studio',
  studioLanding: '/studio',
  studioLibrary: '/studio/library',
  studioLive: '/studio/live',
  studioSearch: '/studio/search',
  studioSet: '/studio/set',
  studioTrack: '/studio/track',
  submitStory: '/submit-story',
  tag: '/tag',
  terms: '/terms',
  transDayOfVisibility: '/trans-day-of-visibility',
  transHealthcare: '/trans-healthcare',
  transHub: '/trans-hub',
  transparencyReport: '/transparency-report',
  twoFactorSetup: '/2fa-setup',
  visas: '/visas',
  volunteer: '/volunteer',
  vouch: '/vouch',
  welcome: '/welcome',
  welcomeTour: '/welcome-tour',
  wellbeing: '/wellbeing',
  worldAidsDay: '/world-aids-day',
} as const

export type RouteKey = keyof typeof routes

/** Known top-level routes that should render real (or placeholder) pages. */
export const KNOWN_ROUTE_SLUGS: string[] = [
  'invite',
  'members',
  'communities',
  'forum',
  'calendar',
  'events',
  'arriving',
  'skills',
  'gatherings',
  'gathering',
  'profile',
  'messages',
  'search',
  'welcome',
  'welcome-tour',
  'changemakers',
  'parents',
  'coming-out',
  'grants',
  'library',
  'volunteer',
  'mentorship',
  'activism',
  'archive',
  'map',
  'business-directory',
  'barter',
  'housing',
  'jobs',
  'directory',
  'platforms',
  'accessibility',
  'contact',
  'wellbeing',
  'legal',
  'employer-reviews',
  'trans-hub',
  'report',
  'partners',
  'host',
  'offer',
  'connect',
  'story',
  'story-tomas',
  'story-safety',
  'emergency',
  'governance',
  'guidelines',
  'safety',
  // Mega-nav targets (placeholder pages)
  'member-directory-filter',
  'connections',
  'dating',
  'reading-groups',
  'family',
  'safe-spaces',
  'flatmates',
  'solidarity',
  'visas',
  'mental-health',
  'sexual-health',
  'trans-healthcare',
  'harm-reduction',
  'sober',
  'hate-crime',
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
  'creatives',
  'manifesto',
  'application-status',
  'economy',
  'annual-assembly',
  'constitution',
  'code-of-conduct',
  'transparency-report',
  'for-organisations',
  'cities',
  'get-the-app',
  'changelog',
  'newsletter',
  'privacy',
  'dsar',
  'terms',
  'press-kit',
  'press-archive',
  'component-library',
]
