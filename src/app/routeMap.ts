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
  /** SOC-01: the topic directory console (`TopicsAdminPage`). Create, edit,
   *  archive and delete the topics behind `/topics` and `/topic/:tag`. */
  adminTopics: "/admin/topics",
  adminLanding: "/admin/landing",
  adminPressKit: "/admin/press-kit",
  adminMembers: "/admin/members",
  // The join-request queue as a route of its own. It also renders as the
  // "pending" tab of /admin/members, but that page is admin-only while the
  // backend authorizes moderators for the whole queue — so moderators reach it
  // here (see MOD_ACCESSIBLE_ADMIN_PATTERNS in authGate.ts).
  adminJoinRequests: "/admin/join-requests",
  adminStaff: "/admin/staff",
  adminBots: "/admin/bots",
  adminChangemakers: "/admin/changemakers",
  adminChangemakerNominations: "/admin/changemaker-nominations",
  adminCommissionInterests: "/admin/commission-interests",
  adminReadingGroupProposals: "/admin/reading-group-proposals",
  adminGuideFeedback: "/admin/guide-feedback",
  adminMagazineSubmissions: "/admin/magazine-submissions",
  adminWriterApplications: "/admin/writer-applications",
  adminModeration: "/admin/moderation",
  adminModResponseTemplates: "/admin/mod-response-templates",
  adminConcerns: "/admin/concerns",
  /** ACQ-03: the generalised intake console — every `intakes` kind plus the
   *  public contact/partnership inquiries, filtered by kind and triage state.
   *  `adminConcerns` above is the governance-concern view of the same console. */
  adminIntakes: "/admin/intakes",
  /** ID-04: the data-subject request (DSAR) review queue. Statutory 30-day
   *  clock per request, so the queue is sorted by deadline, never by arrival. */
  adminDsar: "/admin/dsar",
  /** PRD-31: ban-evasion escalations raised by community moderators, each
   *  carrying the full cross-community assessment their own console withholds.
   *  `@Roles(Moderator, Admin)`, so it is listed in
   *  MOD_ACCESSIBLE_ADMIN_PATTERNS. */
  adminBanEvasion: "/admin/ban-evasion",
  /** PRD-32: the register of legal, government and law-enforcement demands for
   *  member data, which the public Transparency Report counts. Admin-only:
   *  `AdminLegalRequestsController` is `@Roles(Admin)` alone, so this path is
   *  deliberately absent from MOD_ACCESSIBLE_ADMIN_PATTERNS. */
  adminLegalRequests: "/admin/legal-requests",
  adminSafeSpaces: "/admin/safe-spaces",
  adminListings: "/admin/listings",
  adminMedia: "/admin/media",
  adminInvites: "/admin/invites",
  adminGovernance: "/admin/governance",
  adminRoadmap: "/admin/roadmap",
  adminHousingCoops: "/admin/housing",
  adminHousingGroups: "/admin/housing-groups",
  /** LOC-19: pre-publication review of rooms posted into a vetted housing
   *  group. Distinct from the post-publication hide on /admin/housing-groups. */
  adminHousingGroupListings: "/admin/housing-group-listings",
  adminHousingListings: "/admin/housing-listings",
  /** LOC-19: landlord directory console (suggestions + introduction requests). */
  adminLandlords: "/admin/landlords",
  adminVerifications: "/admin/verifications",
  adminOrgTiers: "/admin/org-tiers",
  adminResourceListings: "/admin/resource-listings",
  /** CON-08/CON-09: the resource guide console — edit a guide's prose
   *  and stamp its editorial review, stalest first. */
  adminResourceGuides: "/admin/resource-guides",
  adminResourceSuggestions: "/admin/resource-suggestions",
  adminCommunityTagRequests: "/admin/community-tag-requests",
  adminPartnerApplications: "/admin/partner-applications",
  adminSettings: "/admin/settings",
  adminReports: "/admin/reports",
  /** SUS-05: confirmed volunteer sessions and hours over a period, with
   *  per-opportunity and per-community breakdowns. The answer to "how many
   *  volunteer hours did QueerPulse contribute". Aggregates only. */
  adminVolunteerHours: "/admin/volunteer-hours",
  adminStatusIncidents: "/admin/status-incidents",
  about: "/about",
  account: "/account",
  accountProfile: "/account/profile",
  accountLocked: "/system/account-locked",
  activism: "/about/volunteer/guide",
  appealOutcome: "/safety/appeal-outcome",
  appealSubmit: "/safety/appeal",
  applicationStatus: "/work/application-status",
  arriving: "/local/arriving",
  badges: "/account/badges",
  article: "/magazine/article",
  deck: "/magazine/deck",
  author: "/magazine/author",
  /** CNT-9 — the authors directory (`AuthorsDirectoryPage`), distinct from
   *  `author` above (a single writer's page, `/magazine/author/:slug`). */
  magazineAuthors: "/magazine/authors",
  /** CNT-20 — the section/topic browse page (`MagazineSectionsPage`); a
   *  section's filtered article list lives at `${magazineSections}/:section`. */
  magazineSections: "/magazine/sections",
  /** CON-12 — the magazine's own search (`MagazineSearchPage`). Reads `?q=`
   *  (free text over the published archive) and `?tag=` (every article
   *  carrying one tag); the two combine. Tag pills link here. */
  magazineSearch: "/magazine/search",
  barter: "/work/barter",
  businessDirectory: "/business-directory",
  calendar: "/calendar",
  /** Public per-token page a scanned card resolves to (`/cards/verify/:token`,
   *  declared in `cards/routes.tsx`); never gated, never in the sitemap. */
  cardVerify: "/cards/verify",
  changelog: "/about/roadmap/changelog",
  roadmap: "/about/roadmap",
  changemakers: "/changemakers",
  cinema: "/cinema",
  codeOfConduct: "/about/governance/code-of-conduct",
  collections: "/account/collections",
  /** Public per-token page a shared saved list resolves to (`/lists/:token`,
   *  declared in `members/routes.tsx`). Deliberately NOT under `/account`: the
   *  backend's shared read is `@Public()`, so someone without an account has to
   *  be able to open the link. Never in the sitemap. */
  sharedSavedList: "/lists",
  comingOut: "/coming-out",
  communities: "/communities",
  startCommunity: "/communities/start",
  company: "/work/companies",
  connections: "/account/connections",
  constitution: "/about/governance/constitution",
  contact: "/about/contact",
  cookies: "/policies/cookies",
  imprint: "/policies/imprint",
  culture: "/magazine/culture",
  dataExport: "/account/data-export",
  dating: "/dating",
  deleteAccount: "/account/delete-account",
  directory: "/local/directory",
  venue: "/local/venue",
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
  /** CON-10: the category-grouped index of EVERY guide route. Seventeen
   *  guides had no `routes.*` reference anywhere and were reachable only by
   *  typing the URL; this is what links them. */
  guideIndex: "/resources/guides",
  /** CON-08: the slug-addressable renderer for a database-managed guide.
   *  Also the honest landing place for a guide whose curated route is
   *  missing, instead of silently bouncing the reader to the library. */
  resourceGuide: "/resources/guide",
  editProfile: "/account/edit-profile",
  employerReviews: "/work/employer-reviews",
  caregivers: "/caregivers",
  events: "/events",
  family: "/family",
  flatmates: "/local/housing/flatmates",
  forOrganisations: "/about/for-organisations",
  forum: "/forum",
  /** One-time founder bootstrap. Public, and 404s from the API once used. */
  genesis: "/genesis",
  gatherings: "/gatherings",
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
  housingViewings: "/local/housing/viewings",
  housingCoop: "/local/housing/coop",
  housingGroups: "/local/housing/groups",
  tenantRights: "/local/housing/rights",
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
  listBusinessEdit: "/local/directory/list/:ref/edit",
  /** BF-05: where a member tracks an ownership claim they filed on a listing
   *  somebody else added (`GET /listings/claims/mine`). Under the directory
   *  because a pending claim is not yet a place they run; once approved, the
   *  listing itself shows up in "Places you run" on their profile. */
  listingClaims: "/local/directory/claims",
  magazine: "/magazine",
  magazineEditor: "/magazine/editor",
  magazineWriter: "/magazine/writer",
  deckEditor: "/magazine/editor/deck",
  magazinePiece: "/magazine/editor/piece/:id",
  magazineIssueProd: "/magazine/editor/issue/:number",
  /** CON-16 — the content lifecycle desk: what the published archive is still
   *  telling readers, and which pieces are due a promised re-review. */
  magazineLifecycle: "/magazine/editor/lifecycle",
  magazineWrite: "/magazine/editor/write/:id",
  map: "/local/map",
  members: "/members",
  mentalHealth: "/resources/mental-health",
  mentorship: "/work/mentorship",
  messages: "/messages",
  myEvents: "/account/events",
  /** The member's own wallet of membership cards. Sits under the already
   *  gated `/account/*` pattern in authGate.ts, so no new gate is needed. */
  myCards: "/account/cards",
  microGrants: "/work/grants/micro",
  newsletterUnsubscribe: "/newsletter/unsubscribe",
  notifications: "/notifications",
  offer: "/work/offer",
  parents: "/parents",
  partner: "/about/partners",
  partners: "/about/partners",
  partnerApply: "/about/partners/apply",
  perks: "/account/perks",
  pitchTracker: "/magazine/pitches",
  platforms: "/about/platforms",
  pressArchive: "/about/press-kit/archive",
  pressKit: "/about/press-kit",
  privacy: "/policies/privacy",
  pronounsGuide: "/resources/pronouns-guide",
  publicProfile: "/public-profile",
  pushDevices: "/account/push-devices",
  queer101: "/resources/101",
  readingGroups: "/reading-groups",
  report: "/safety/report",
  reporting: "/safety/reporting",
  resources: "/resources",
  safeSpaces: "/local/safe-spaces",
  safety: "/safety",
  search: "/search",
  security: "/account/security",
  /** LG-01: the published accessibility statement. Public by design: someone
   *  who cannot get past the sign-in is exactly who needs to read it. No law
   *  currently requires the document; see the `legal` section of
   *  `src/features/marketing/accessibilityStatement.data.tsx`. */
  policiesAccessibility: "/policies/accessibility",
  /** ID-15: the responsible-disclosure policy for security researchers. It
   *  used to live at `security` above, which a member reasonably expects to
   *  be their own account-security hub; the policy is a public document, so
   *  it sits with the other policies. */
  policiesSecurity: "/policies/security",
  sessions: "/account/sessions",
  settings: "/account/settings",
  sexualHealth: "/resources/sexual-health",
  signIn: "/auth/sign-in",
  simulations: "/simulations",
  sober: "/resources/sober",
  solidarity: "/work/solidarity",
  spacesMap: "/spaces-map",
  status: "/system/status",
  story: "/magazine/story",
  storySafety: "/magazine/story-safety",
  storyTomas: "/magazine/story-tomas",
  studio: "/studio",
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
  magazineApplyToWrite: "/magazine/apply-to-write",
  // Subprofiles: the public persona directory + the owner's dashboard. Param
  // routes (/p/:handle, /members/:slug/:subslug, the editor) are declared in
  // routes.tsx and linked via the helpers below.
  subprofiles: "/subprofiles",
  subprofilesDashboard: "/account/subprofiles",
  topic: "/topic",
  /** DISC-4 — the topics directory (`TopicsDirectoryPage`), distinct from
   *  `topic` above (the singular per-tag feed, `/topic/:tag`). */
  topics: "/topics",
  terms: "/policies/terms",
  transHealthcare: "/resources/trans-healthcare",
  transHub: "/resources/trans-hub",
  /** The public Transparency Report, the document Article VI clause 3 of the
   *  Constitution names. Sits under `/about/governance` alongside the
   *  Constitution and the Code of Conduct because it is a governing document,
   *  and it is public for the same reason they are. */
  transparencyReport: "/about/governance/transparency",
  visas: "/local/visas",
  volunteer: "/about/volunteer",
  postVolunteer: "/about/volunteer/post",
  editVolunteer: "/about/volunteer/opportunity/:slug/edit",
  manageVolunteerApplicants: "/about/volunteer/manage",
  vouch: "/vouch",
  welcome: "/auth/welcome",
  wellbeing: "/resources/wellbeing",
  work: "/account/work",
  workProfile: "/account/work-profile",

  // Additional typed entry points (auth, lifecycle, studio & system states),
  // used by the settings → Simulations panel to launch real member journeys.
  requestInvite: "/auth/request-invite",
  /** ACQ-01: an applicant checks what happened to their request, keyed on
   *  the opaque token shown once at submission (`?token=`). Public: there is
   *  no account behind an applicant. */
  joinRequestStatus: "/auth/request-invite/status",
  inviteExpired: "/system/invite-expired",
  verificationNeeded: "/system/verification-needed",
  rsvp: "/rsvp",
  createGathering: "/create-gathering",
  blockMute: "/safety/block-mute",
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
  studioSettings: "/studio/settings",
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
  serverError: "/system/500",
  pwaPrompt: "/system/pwa-prompt",
  feed: "/feed",
  onboarding: "/auth/onboarding",
  gettingStarted: "/account/getting-started",
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
/** A community's printable sheet of membership cards. Owner and mod only. */
export const modCardPrint = (slug: string) => `/mod/${slug}/cards/print`;
/** A recipient's personal invite landing — resolves the inviter from the code. */
export const inviteLink = (code: string) => `/auth/invite/${code}`;
/** A forum thread's detail page. */
export const thread = (id: number | string) => `/thread/${id}`;
/** A community topic (hashtag) feed page. Accepts a bare tag or a "#tag". */
export const topicPath = (tag: string) =>
  `/topic/${tag.replace(/^#/, "").toLowerCase()}`;
/** A community's detail page (`/community/:slug`). */
export const communityPath = (slug: string) => `/community/${slug}`;
/** A business's detail page in the local directory (`/local/directory/:slug`). */
export const businessPath = (slug: string) => `${routes.directory}/${slug}`;

/** The owner editor for one subprofile (`/account/subprofiles/:id/edit`). */
export const subprofileEditPath = (id: string) =>
  `/account/subprofiles/${id}/edit`;
/** A standalone (unlinked) persona's public page by its global handle. */
export const personaPath = (handle: string) => `/p/${handle}`;
/** A linked persona nested under its owner's main profile. */
export const nestedPersonaPath = (ownerSlug: string, slug: string) =>
  `/members/${ownerSlug}/${slug}`;
