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

const HTML_SUFFIX = ".html";
const FILE_PREFIX = "QueerPulse ";

/** Slugify the human page name into a path segment. */
function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Map a prototype href to a clean router path (preserving any #anchor). */
export function linkToPath(href: string): string {
  if (!href) return "/";

  // Pure in-page anchor → home anchor
  if (href.startsWith("#")) return `/${href}`;

  const [file = "", anchor] = href.split("#");
  const hash = anchor ? `#${anchor}` : "";

  if (!file.endsWith(HTML_SUFFIX)) {
    // Already a path or external — pass through
    return href;
  }

  let name = file.slice(0, -HTML_SUFFIX.length);
  if (name.startsWith(FILE_PREFIX)) name = name.slice(FILE_PREFIX.length);

  // The homepage itself
  if (name === "Homepage" || name === "Homepage v2") return `/${hash}`;

  return `/${slugify(name)}${hash}`;
}

/**
 * Typed clean-path constants for every page. Prefer these over passing the
 * legacy "QueerPulse <Name>.html" design-filename strings through linkToPath().
 * Values are the exact slugs linkToPath() produces (kept in sync via slugify).
 */
export const routes = {
  admin: "/admin",
  adminCommunities: "/admin/communities",
  adminMembers: "/admin/members",
  adminModeration: "/admin/moderation",
  adminGovernance: "/admin/governance",
  adminPartnerApplications: "/admin/partner-applications",
  about: "/about",
  accessibility: "/about/help/accessibility",
  account: "/account",
  accountProfile: "/account/profile",
  accountLocked: "/system/account-locked",
  activism: "/activism",
  openLetter: "/activism/open-letter",
  appealOutcome: "/safety/appeal-outcome",
  annualAssembly: "/about/governance/annual-assembly",
  applicationStatus: "/work/application-status",
  arriving: "/local/arriving",
  badges: "/account/badges",
  article: "/magazine/article",
  audioPlayer: "/magazine/audio-player",
  author: "/magazine/author",
  barter: "/work/barter",
  businessDirectory: "/business-directory",
  calendar: "/calendar",
  cancelMembership: "/account/cancel-membership",
  changelog: "/about/roadmap/changelog",
  roadmap: "/about/roadmap",
  changemakers: "/changemakers",
  cinema: "/cinema",
  cities: "/about/cities",
  codeOfConduct: "/about/governance/code-of-conduct",
  collections: "/account/collections",
  comingOut: "/coming-out",
  communities: "/communities",
  communitiesHome: "/communities/home",
  startCommunity: "/communities/start",
  company: "/work/companies",
  connections: "/account/connections",
  constitution: "/about/governance/constitution",
  contact: "/about/contact",
  cookies: "/policies/cookies",
  coverGallery: "/magazine/cover-gallery",
  createAccount: "/auth/create-account",
  creatives: "/magazine/creatives",
  crisisChat: "/safety/crisis-chat",
  culture: "/magazine/culture",
  dataExport: "/account/data-export",
  dating: "/dating",
  deleteAccount: "/account/delete-account",
  directory: "/local/directory",
  donate: "/about/donate",
  drafts: "/account/drafts",
  dsar: "/policies/privacy/data-request",
  economy: "/economy",
  invoiceTool: "/economy/invoice",
  contractTool: "/economy/contract",
  scopeTool: "/economy/scope",
  reciboVerdeGuide: "/economy/recibo-verde-guide",
  takeHomeTool: "/economy/take-home",
  ivaTracker: "/economy/iva-tracker",
  setAsideTool: "/economy/set-aside",
  dayRateTool: "/economy/day-rate",
  rateBoard: "/economy/rate-board",
  slidingScaleTool: "/economy/sliding-scale",
  comparatorTool: "/economy/freelance-vs-salaried",
  runningGuide: "/resources/running-guide",
  accessibleLisbon: "/resources/accessible-lisbon",
  peerSupport: "/resources/peer-support",
  artCritGuide: "/resources/art-crit-guide",
  sharedEquipment: "/resources/shared-equipment",
  groupShowArchive: "/resources/group-show-archive",
  firstMeetupGuide: "/resources/first-meetup-guide",
  queerPaediatricians: "/resources/queer-paediatricians",
  schoolFormsGuide: "/resources/school-forms-guide",
  communityPrivacy: "/resources/community-privacy",
  comingOutAtWork: "/resources/coming-out-at-work",
  lgbtqAgingGuide: "/resources/lgbtq-aging-guide",
  oralHistoryProject: "/resources/oral-history-project",
  ingredientsMap: "/resources/ingredients-map",
  qtipocOrganisations: "/resources/qtipoc-organisations",
  qtipocArchive: "/resources/qtipoc-archive",
  disabilityHealthcare: "/resources/disability-healthcare",
  spoonTheory: "/resources/spoon-theory",
  editProfile: "/account/edit-profile",
  emergency: "/safety/emergency",
  employerReviews: "/work/employer-reviews",
  caregivers: "/caregivers",
  event: "/event",
  events: "/events",
  family: "/family",
  flatmates: "/local/housing/flatmates",
  forOrganisations: "/about/for-organisations",
  forum: "/forum",
  gathering: "/gathering",
  gatherings: "/gatherings",
  gatheringCancelled: "/gathering-cancelled",
  gatheringDashboard: "/gathering-dashboard",
  gatheringRecap: "/gathering-recap",
  getTheApp: "/about/get-the-app",
  giftMembership: "/account/gift-membership",
  glossary: "/resources/glossary",
  governance: "/about/governance",
  grants: "/work/grants",
  guidelines: "/policies/guidelines",
  harmReduction: "/resources/harm-reduction",
  hateCrime: "/safety/hate-crime",
  help: "/about/help",
  homepage: "/",
  host: "/host",
  housing: "/local/housing",
  housingCoop: "/local/housing/coop",
  intersectionality: "/resources/intersectionality",
  invite: "/auth/invite",
  inviteLanding: "/auth/invite/QP-7F3K-2026",
  issue: "/magazine/issue",
  issues: "/magazine/issues",
  jobs: "/work/jobs",
  postJob: "/work/jobs/post",
  legal: "/safety/legal",
  library: "/resources/library",
  listBusiness: "/local/directory/list",
  magazine: "/magazine",
  magazineEditor: "/magazine/editor",
  magicLink: "/auth/magic-link",
  manageGathering: "/manage-gathering",
  manifesto: "/about/manifesto",
  map: "/local/map",
  memberDirectoryFilter: "/member-directory-filter",
  members: "/members",
  membership: "/account/membership",
  mentions: "/mentions",
  mentalHealth: "/resources/mental-health",
  therapists: "/resources/therapists",
  mentorship: "/work/mentorship",
  messages: "/messages",
  myEvents: "/account/events",
  microGrants: "/work/grants/micro",
  newsletter: "/about/newsletter",
  newsletterArchive: "/magazine/newsletter-archive",
  notificationPreferences: "/account/notification-preferences",
  notifications: "/notifications",
  offer: "/work/offer",
  parents: "/parents",
  partner: "/about/partners",
  partners: "/about/partners",
  partnerApply: "/about/partners/apply",
  perks: "/account/perks",
  pitchTracker: "/magazine/pitches",
  platforms: "/about/platforms",
  podcastShow: "/magazine/podcast-show",
  pressArchive: "/about/press-kit/archive",
  pressKit: "/about/press-kit",
  privacy: "/policies/privacy",
  pronounsGuide: "/resources/pronouns-guide",
  publicProfile: "/public-profile",
  queer101: "/resources/101",
  readingGroups: "/reading-groups",
  report: "/safety/report",
  resources: "/resources",
  rsvpTicket: "/rsvp-ticket",
  safeSpaces: "/local/safe-spaces",
  safety: "/safety",
  search: "/search",
  security: "/account/security",
  sessions: "/account/sessions",
  settings: "/account/settings",
  sexualHealth: "/resources/sexual-health",
  signIn: "/auth/sign-in",
  skills: "/work/skills",
  sober: "/resources/sober",
  solidarity: "/work/solidarity",
  spacesMap: "/spaces-map",
  status: "/system/status",
  story: "/magazine/story",
  storySafety: "/magazine/story-safety",
  storyTomas: "/magazine/story-tomas",
  studio: "/studio",
  sustainer: "/sustainer",
  studioAlbum: "/studio/album",
  studioArtist: "/studio/artist",
  studioCheckout: "/studio/checkout",
  studioCollection: "/studio/collection",
  studioDashboard: "/studio/dashboard",
  studioE: "/studio",
  studioLanding: "/studio",
  studioLibrary: "/studio/library",
  studioLive: "/studio/live",
  studioSearch: "/studio/search",
  studioSet: "/studio/set",
  studioSheetStore: "/studio/sheet-store",
  studioTrack: "/studio/track",
  submitStory: "/magazine/submit-story",
  // Subprofiles: the public persona directory + the owner's dashboard. Param
  // routes (/p/:handle, /members/:slug/:subslug, the editor) are declared in
  // routes.tsx and linked via the helpers below.
  subprofiles: "/subprofiles",
  subprofilesDashboard: "/account/subprofiles",
  tag: "/magazine/tag",
  topic: "/topic",
  terms: "/policies/terms",
  transHealthcare: "/resources/trans-healthcare",
  transHub: "/resources/trans-hub",
  transparencyReport: "/about/governance/transparency-report",
  visas: "/local/visas",
  volunteer: "/about/volunteer",
  postVolunteer: "/about/volunteer/post",
  vouch: "/vouch",
  welcome: "/auth/welcome",
  welcomeTour: "/auth/welcome-tour",
  wellbeing: "/resources/wellbeing",
  work: "/account/work",
  workProfile: "/account/work-profile",

  // Additional typed entry points (auth, lifecycle, studio & system states),
  // used by the settings → Simulations panel to launch real member journeys.
  pendingReview: "/system/pending-review",
  requestInvite: "/auth/request-invite",
  inviteExpired: "/system/invite-expired",
  confirmEmail: "/auth/confirm-email",
  verificationNeeded: "/system/verification-needed",
  rsvp: "/rsvp",
  checkout: "/checkout",
  createGathering: "/create-gathering",
  coHostInvite: "/co-host-invite",
  blockMute: "/safety/block-mute",
  leave: "/safety/leave",
  film: "/film",
  cinemaMembership: "/cinema/membership",
  cinemaWatch: "/cinema/watch",
  studioUpload: "/studio/upload",
  studioPayouts: "/studio/payouts",
  studioCalls: "/studio/calls",
  studioSetSubmission: "/studio/set-submission",
  studioTriage: "/studio/triage",
  studioFlagReview: "/studio/flag-review",
  studioCouncil: "/studio/council",
  studioAbout: "/studio/about",
  studioAccessibility: "/studio/accessibility",
  studioTerms: "/studio/terms",
  studioHelp: "/studio/help",
  studioPress: "/studio/press",
  studioEndCard: "/studio/end-card",
  studioNotifications: "/studio/notifications",
  studioReceipt: "/studio/receipt",
  studioRights: "/studio/rights",
  studioProgram: "/studio/program",
  studioBroadcast: "/studio/broadcast",
  studioWelcome: "/studio/welcome",
  studioWithdrawn: "/studio/withdrawn",
  accountBanned: "/system/account-banned",
  accountSuspended: "/system/account-suspended",
  maintenance: "/system/maintenance",
  offline: "/system/offline",
  geoRestricted: "/system/geo-restricted",
  serverError: "/system/500",
  pwaPrompt: "/system/pwa-prompt",
  feed: "/feed",
  onboarding: "/auth/onboarding",
  cinemaBrowse: "/cinema/browse",
  cinemaCollections: "/cinema/collections",
  cinemaFilmmaker: "/cinema/filmmakers",
  cinemaCurator: "/cinema/curators",
  cinemaAbout: "/cinema/about",
  cinemaSubmit: "/cinema/submit",
  cinemaShorts: "/cinema/made-here",
  cinemaOpenCalls: "/cinema/open-calls",
  cinemaRights: "/cinema/rights",
} as const;

export type RouteKey = keyof typeof routes;

/** Staff drill-in to a community's mod panel. */
export const adminCommunityMod = (slug: string) =>
  `/admin/communities/${slug}/mod`;
/** Direct mod-panel access for a community moderator. */
export const modPanel = (slug: string) => `/mod/${slug}`;
/** A recipient's personal invite landing — resolves the inviter from the code. */
export const inviteLink = (code: string) => `/auth/invite/${code}`;
/** A forum thread's detail page. */
export const thread = (id: number | string) => `/thread/${id}`;
/** A community topic (hashtag) feed page. Accepts a bare tag or a "#tag". */
export const topicPath = (tag: string) =>
  `/topic/${tag.replace(/^#/, "").toLowerCase()}`;

/** The owner editor for one subprofile (`/account/subprofiles/:id/edit`). */
export const subprofileEditPath = (id: string) =>
  `/account/subprofiles/${id}/edit`;
/** A standalone (unlinked) persona's public page by its global handle. */
export const personaPath = (handle: string) => `/p/${handle}`;
/** A linked persona nested under its owner's main profile. */
export const nestedPersonaPath = (ownerSlug: string, slug: string) =>
  `/members/${ownerSlug}/${slug}`;

/** Known top-level routes that should render real (or placeholder) pages. */
export const KNOWN_ROUTE_SLUGS: string[] = [
  "members",
  "communities",
  "forum",
  "calendar",
  "events",
  "gatherings",
  "gathering",
  "profile",
  "messages",
  "search",
  "changemakers",
  "parents",
  "coming-out",
  "activism",
  "host",
  "safety",
  // Mega-nav targets (placeholder pages)
  "member-directory-filter",
  "connections",
  "dating",
  "reading-groups",
  "family",
  "economy",
];
