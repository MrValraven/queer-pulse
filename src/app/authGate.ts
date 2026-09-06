import { matchPath, useLocation } from "react-router-dom";
import { useAuth } from "./providers/authContext";
import { useDemoMode } from "./providers/DemoModeProvider";
import { isStandaloneLaunch } from "./providers/standaloneLaunch";
import { linkToPath, routes } from "./routeMap";
import { safeInternalPath } from "../shared/lib/safeInternalPath";
import type { StaffRoleId } from "../features/admin/staffRoles.registry";
import type { AuthUser } from "../features/auth/api/auth.api";

/**
 * Auth gating policy for the walled-garden model.
 *
 * QueerPulse is invite-only, so the member surface (feed, messages, communities,
 * gatherings, economy, studio, the account area, admin/mod, …) is closed to
 * logged-out visitors. Marketing, the magazine, cinema browsing, resources,
 * safety/crisis pages, policies, and the auth flow stay public so the platform
 * can still attract members and support people in crisis who aren't signed in.
 *
 * "Public" is not the same as "launched": cinema, culture and studio are all
 * ungated here yet resolve to an honest not-launched page in live mode, decided
 * in each feature's `routes.tsx` (see `DEMO_ONLY_NAV_PATTERNS` below for the
 * matching nav rule).
 *
 * This is a denylist: anything not matched here is public by default, which keeps
 * legal/marketing pages from ever being locked by accident. To gate a new page,
 * add its path (or a `/prefix/*` pattern) to GATED_PATTERNS.
 */
const GATED_PATTERNS: string[] = [
  // Account hub + all settings sub-flows
  "/account",
  "/account/*",
  // Work / economy (jobs, housing, mentorship, freelance tools, …)
  "/work",
  "/work/*",
  "/economy",
  "/economy/*",
  // Music studio (creator platform)
  "/studio",
  "/studio/*",
  // Admin & moderation panels
  "/admin",
  "/admin/*",
  "/mod/*",
  // Magazine editorial tools (dashboard + deck authoring) — staff-only
  "/magazine/editor",
  "/magazine/editor/*",
  // Magazine writer workspace (assignments/pitches/payments) — staff-only
  "/magazine/writer",
  "/magazine/writer/*",
  // Personal member surfaces
  "/feed",
  "/search",
  "/members",
  "/members/*",
  "/member-directory-filter",
  // The persona directory. `GET /subprofiles/directory` sits under the
  // controller's class-level `ActiveMemberGuard` with no `@Public()`, so
  // without this a signed-out visitor rendered the page and parked on
  // "We couldn't load the directory" behind a Retry that can never succeed.
  // Only the directory itself: the standalone persona page `/p/:handle` reads
  // the `@Public()` `by-handle/:handle` route and stays public, and a linked
  // persona at `/members/:slug/:subslug` is already covered by `/members/*`.
  // ENG-156.
  "/subprofiles",
  "/dating",
  "/reading-groups",
  "/family",
  "/messages",
  "/notifications",
  // Communities
  "/communities",
  "/communities/*",
  "/community/*",
  // Gatherings, events & the social calendar
  "/calendar",
  "/events",
  "/gatherings",
  "/gatherings/*",
  "/rsvp",
  "/host",
  "/create-gathering",
  // Forum
  "/forum",
  "/thread",
  "/thread/*",
  // Community stories & pathways. The coming-out guide (/coming-out) is a public
  // support page — it renders in the marketing PageShell and, like the resources
  // and safety/crisis pages, must reach a questioning visitor who isn't signed
  // in, so it is intentionally NOT gated here. `/parents` only redirects to the
  // gated `/family`, so gating it keeps the bounce consistent.
  "/changemakers",
  "/changemaker/*",
  "/parents",
  "/caregivers",
  // Member-only actions
  "/vouch",
  "/magazine/submit-story",
  "/magazine/apply-to-write",
  // Posting, editing and triaging volunteer opportunities. The volunteer
  // LISTING (`/about/volunteer`) and each opportunity's detail page stay public
  // so anyone can see what the platform needs help with; these three are the
  // organiser-side surfaces, whose forms 401 for a logged-out visitor and whose
  // URLs have no business being indexed.
  routes.postVolunteer,
  routes.editVolunteer,
  routes.manageVolunteerApplicants,
  // The member's own pitch tracker ("where every pitch actually is"). Gated as
  // a member surface and nothing more: the page reads
  // `GET /magazine/submissions/mine`, which `MagazineController` guards with
  // `ActiveMemberGuard` alone, so every active member is admitted. It carries
  // NO entry in CAPABILITY_PATTERNS below — see the note there for why the
  // `magazine_writer` gate it used to sit behind was wrong. PRD-125.
  routes.pitchTracker,
  // Block & mute is an account-settings surface that lives under /safety, where
  // the crisis pages around it are deliberately public.
  routes.blockMute,
  // The one-time onboarding wizard (and its legacy `/auth/welcome` alias). The
  // one-time gate further down only fires for members who are already logged
  // in, so without this a logged-out visitor rendered the whole wizard.
  routes.onboarding,
  routes.welcome,
  // Local discovery — directory & map (safe-spaces / visas / arriving stay public)
  "/local/directory",
  "/local/directory/*",
  "/local/map",
  "/local/venue",
  "/local/venue/*",
  // Housing board + listing detail + flatmates tab are member-only (backend
  // browse is ActiveMemberGuard); the co-ops surface stays public — see
  // PUBLIC_EXCEPTIONS below.
  "/local/housing",
  "/local/housing/*",
  "/business-directory",
  "/spaces-map",
  // Cinema: browsing films is public; watching + membership are gated.
  // Inert while cinema is unlaunched: in live mode every `/cinema/*` route
  // resolves to the not-launched page (see `cinemaRoutes`), so these two only
  // start doing work again on the day cinema launches. Kept so that day does
  // not ship an ungated player and membership page. CON-03.
  "/cinema/watch",
  "/cinema/membership",
  // Culture's commission-interest form (PRD-46). The Culture landing page is
  // public and unlaunched, but this one child route is a live member action:
  // `POST /commissions/interest` is `ActiveMemberGuard`ed, so a logged-out
  // visitor could only ever fill the form in and be 401'd on submit. Written as
  // a literal because `scripts/publicPaths.mjs` mirrors this list by text and
  // the constant lives in `features/culture/commissionInterest.paths.ts`; the
  // two must be changed together.
  "/magazine/culture/commission-interest",
];

/**
 * Public escape hatches that fall *inside* a gated prefix. The studio ships its
 * own sign-in and error screens, which must stay reachable without a session.
 */
const PUBLIC_EXCEPTIONS: string[] = [
  "/studio/sign-in",
  "/studio/404",
  "/studio/500",
  "/studio/off-air",
  // The studio's public shopfront: the logged-out landing renders at /studio
  // itself, and the outward-facing info/press pages stay readable without a
  // session so prospective members and press can reach them.
  "/studio",
  "/studio/about",
  "/studio/accessibility",
  "/studio/terms",
  "/studio/help",
  "/studio/press",
  "/studio/end-card",
  // Housing co-ops stay public (their backend browse is @Public), even though
  // the rest of /local/housing/* is gated above.
  "/local/housing/coop",
  "/local/housing/coop/*",
];

function matchesAny(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => matchPath(pattern, pathname) !== null);
}

/**
 * The "Work & Economy" surface (Career + Economy columns of the Work meganav,
 * plus the freelance calculators that hang off `/economy`) is still being
 * finished, so for now it's hidden from members: its nav entry is dropped and
 * its routes bounce to the roadmap, where a "Coming soon" card lists what's
 * landing. Matched explicitly rather than by a `/work/*` prefix because Housing
 * lives under `/work/landlord` and `/work/housing` and is a separate, live
 * surface that must stay reachable.
 *
 * Active only in shipped builds. `import.meta.env.DEV` is `true` under
 * `pnpm dev`, so the whole area stays reachable for local development, and is
 * inlined to `false` by `vite build`, so every deployed artifact hides it — see
 * `isComingSoonPath`.
 */
const COMING_SOON_PATTERNS: string[] = [
  // Career column
  "/account/work",
  "/account/work-profile",
  "/work/jobs",
  "/work/jobs/*",
  "/work/companies",
  "/work/companies/*",
  "/work/mentorship",
  "/work/mentorship/*",
  "/work/employer-reviews",
  "/work/application-status",
  // Economy column + the freelance calculators reached from it
  "/work/barter",
  "/work/barter/*",
  "/work/solidarity",
  "/work/grants",
  "/work/offer",
  "/economy",
  "/economy/*",
];

/**
 * True when a path belongs to the not-yet-launched Work & Economy surface and
 * should be hidden. Always false in local development so the area stays
 * reachable while it's being built.
 */
export function isComingSoonPath(pathname: string): boolean {
  if (import.meta.env.DEV) return false;
  return matchesAny(pathname, COMING_SOON_PATTERNS);
}

/** The link-href form of `isComingSoonPath` (see `isGatedLink`). */
export function isComingSoonLink(href: string): boolean {
  const path = linkToPath(href).split(/[?#]/)[0] || "/";
  if (!path.startsWith("/")) return false; // external / mailto / tel
  return isComingSoonPath(path);
}

/**
 * Demo-only surfaces whose nav/footer entries must disappear in live mode.
 *
 * Culture (`/magazine/culture`) renders four empty tabs live: the club picks,
 * commission board, showcase and radio listings are curated editorial content
 * that only exists in the demo mocks, and there is no pipeline by which
 * anything ever appears there. Its routes resolve to an honest not-launched
 * page in live mode (see `cultureRoutes`), so the meganav must stop
 * advertising it as a destination too. CON-14.
 *
 * Cinema and Studio deliberately stay OUT of this list: both also resolve to a
 * not-launched page in live mode, but they keep their nav entries as an honest
 * "this is being built" signal, which is the pattern Studio has shipped since
 * its live-mode gate landed.
 *
 * Unlike COMING_SOON_PATTERNS this is keyed on demo mode rather than on
 * `import.meta.env.DEV`, so a deployed demo build keeps the full mock
 * experience. Every call site passes `demoMode` in.
 */
const DEMO_ONLY_NAV_PATTERNS: string[] = [
  routes.culture,
  `${routes.culture}/*`,
  // The legacy `/culture` alias, which redirects to `routes.culture`.
  "/culture",
];

/**
 * Culture paths the `${routes.culture}/*` pattern above would otherwise swallow,
 * and must not.
 *
 * The commission-interest form is live in both modes (PRD-46): it posts to
 * `POST /commissions/interest` and lands in the staffed
 * `/admin/commission-interests` queue, so a link to it is an honest link in live
 * mode and hiding it would put back the dead end this route exists to remove.
 * Nothing in the nav points here today, and this keeps that true by choice
 * rather than by luck.
 */
const DEMO_ONLY_NAV_EXCEPTIONS: string[] = [
  "/magazine/culture/commission-interest",
];

/** True when a path is a demo-only surface hidden from the live-mode nav. */
export function isDemoOnlyNavPath(pathname: string): boolean {
  if (matchesAny(pathname, DEMO_ONLY_NAV_EXCEPTIONS)) return false;
  return matchesAny(pathname, DEMO_ONLY_NAV_PATTERNS);
}

/** The link-href form of `isDemoOnlyNavPath` (see `isGatedLink`). */
export function isDemoOnlyNavLink(href: string): boolean {
  const path = linkToPath(href).split(/[?#]/)[0] || "/";
  if (!path.startsWith("/")) return false; // external / mailto / tel
  return isDemoOnlyNavPath(path);
}

/**
 * Role-gated surfaces. Being logged in is not enough for these — the admin panel
 * requires an admin, the community/`/mod` moderation surfaces require a moderator
 * (or admin). Enforced client-side in live mode; the backend remains the source
 * of truth and must 403 each call regardless.
 */
const ADMIN_PATTERNS: string[] = ["/admin", "/admin/*"];
const MOD_PATTERNS: string[] = ["/mod/*"];

/**
 * Admin-prefixed surfaces whose backend controller authorizes Moderators as
 * well as Admins (e.g. `@Roles(Moderator, Admin)` on `moderation.controller.ts`
 * for the report queue). Checked before the blanket `/admin/*` admin-only match
 * in `requiredRole` so these specific routes downgrade to the same "mod" tier
 * as `/mod/*`, while the rest of the admin console stays admin-only.
 */
const MOD_ACCESSIBLE_ADMIN_PATTERNS: string[] = [
  routes.adminModeration,
  `${routes.adminModeration}/*`,
  // PRD-282. The triage console over every staff queue.
  // `AdminQueuesController` is `@Roles(Moderator, Admin)` plus a spread of
  // `@StaffRoles(...)` under `RolesOrStaffGuard`, and it filters the response
  // body per queue, so a moderator who opens it sees their own eleven queues
  // and learns nothing about the other twenty. Bouncing them here would leave
  // the deadline-bearing queues they work daily with no standing signal at all,
  // which is the defect this screen exists to close.
  //
  // No `/*` sibling: the console has no child routes.
  routes.adminQueues,
  // `admin-verification.controller.ts` is `@Roles(Moderator, Admin)` on the
  // whole controller (the level console, the review queue, bulk decisions and
  // per-member history alike), so moderators are meant to work this queue.
  routes.adminVerifications,
  `${routes.adminVerifications}/*`,
  // Same for the platform join-request queue: every route on
  // `join-requests.controller.ts` that a reviewer touches (list, bulk, sample,
  // PATCH :id) carries `@Roles(Moderator, Admin)`. The queue also renders as a
  // tab of the admin-only `/admin/members`; this dedicated path is how a
  // moderator gets to it.
  routes.adminJoinRequests,
  // The DSAR review queue (ID-04). Its controller authorizes
  // `@Roles(Moderator, Admin)`, and the queue runs on a statutory 30-day clock
  // per request — a surface with a legal deadline cannot depend on an admin
  // being the one who happens to be online.
  routes.adminDsar,
  `${routes.adminDsar}/*`,
  // The ban-evasion escalation queue (PRD-31). `BanEvasionController` is
  // `@Roles(Moderator, Admin)` at class level, and every row is a community
  // moderator waiting on an answer about an applicant they can only see one bit
  // about. `routes.adminLegalRequests` is deliberately absent from this list:
  // its controller is `@Roles(Admin)` alone, so it stays on the blanket
  // admin-only match below.
  routes.adminBanEvasion,
  `${routes.adminBanEvasion}/*`,
  // The status-incident console (ID-16), likewise `@Roles(Moderator, Admin)`.
  // Publishing "we know, we are on it" during an outage is the one job that is
  // useless if it waits: whoever notices first has to be able to post it.
  routes.adminStatusIncidents,
  `${routes.adminStatusIncidents}/*`,
  // The housing review queue (LOC-01). `AdminHousingListingsController` is
  // guarded by `HousingModerationGuard`, which passes Moderator or Admin OR a
  // member holding `housing_moderator`. The role half is expressed here; the
  // additive half is CAPABILITY_ELEVATED_PATTERNS below. Every member listing
  // sits invisible until somebody works this queue, so it cannot wait for an
  // admin to be the one online.
  routes.adminHousingListings,
  `${routes.adminHousingListings}/*`,
  // LOC-19. The group-listing review queue is the same `HousingModerationGuard`
  // union as the housing queue above (so it appears in
  // CAPABILITY_ELEVATED_PATTERNS too); the landlord console is a plain
  // `@Roles(Moderator, Admin)`. Both are queues a moderator works daily, and
  // both answer a submission a member is waiting on.
  routes.adminHousingGroupListings,
  `${routes.adminHousingGroupListings}/*`,
  routes.adminLandlords,
  `${routes.adminLandlords}/*`,
  // SUS-05. The volunteer-hours report is `@Roles(Moderator, Admin)` on the
  // backend, so it belongs here rather than behind the blanket admin-only
  // match: a moderator already sees the whole rail, and the link would
  // otherwise bounce them off a page their own session is authorized for.
  // It carries no capability grant (see `adminNav.data.ts`), so it appears in
  // this list only, never in CAPABILITY_ELEVATED_PATTERNS.
  routes.adminVolunteerHours,
];

/**
 * Capability-gated surfaces: closed to the ordinary member tier regardless of
 * `role`, and opened by holding the matching additive staff-role grant (or by
 * being an admin, a superset — see the `role !== "admin"` short-circuit in
 * `useAuthGateRedirect`). Magazine editorial tools moved here from
 * MOD_PATTERNS: a moderator no longer gets them for free, only members holding
 * `magazine_editor` (plus admins).
 */
const CAPABILITY_PATTERNS: { patterns: string[]; capability: StaffRoleId }[] = [
  {
    patterns: ["/magazine/editor", "/magazine/editor/*"],
    capability: "magazine_editor",
  },
  {
    // The writer workspace, and only the writer workspace. `routes.pitchTracker`
    // (`/magazine/pitches`) used to be listed here as "the workspace's third
    // tab", but the two are different surfaces reading different backends:
    // the workspace's pitches tab reads `GET /magazine/writer/pitches` behind
    // `@StaffRoles('magazine_writer')`, while the tracker reads
    // `GET /magazine/submissions/mine` behind `ActiveMemberGuard` alone. Gating
    // the tracker on this grant bounced every plain member — and every
    // non-admin editor — off a page their own account menu links them to, onto
    // the visitor homepage with no explanation, even though the endpoint the
    // page calls would have answered them. PRD-125.
    patterns: ["/magazine/writer", "/magazine/writer/*"],
    capability: "magazine_writer",
  },
];

/**
 * Surfaces an additive staff-role grant OPENS.
 *
 * The mirror image of CAPABILITY_PATTERNS. There, a grant NARROWS a surface: the
 * path is closed to the ordinary member tier and the capability is the only way
 * in besides being an admin. Here a grant WIDENS one: the path already carries a
 * role requirement, and holding the capability satisfies it on its own.
 *
 * This exists because `requiredRole` and `requiredCapability` are checked in
 * series, so the role test rejects a plain member before their grant is ever
 * consulted. Without this list a member holding `housing_moderator` and nothing
 * else would be bounced from a queue their own backend guard admits them to.
 *
 * Keep each entry pinned to a backend guard that genuinely accepts the union.
 */
const CAPABILITY_ELEVATED_PATTERNS: {
  patterns: string[];
  /**
   * ANY ONE of these grants opens the path on its own. A list rather than a
   * single grant because `elevatingCapabilities` returns the FIRST matching
   * entry and stops, so a path reachable by several grants cannot be expressed
   * as sibling entries: only the earliest would ever be consulted, and every
   * other holder would be bounced from a screen their own backend guard admits
   * them to. Every entry that predates PRD-282 carries exactly one id, which is
   * byte-for-byte the behaviour it had as a scalar field.
   */
  capabilities: StaffRoleId[];
}[] = [
  {
    // `HousingModerationGuard`: Moderator or Admin, OR `housing_moderator`.
    // Both housing queues are guarded by it, so both elevate the same way.
    patterns: [
      routes.adminHousingListings,
      `${routes.adminHousingListings}/*`,
      routes.adminHousingGroupListings,
      `${routes.adminHousingGroupListings}/*`,
    ],
    capabilities: ["housing_moderator"],
  },
  // OPS-03. Each entry below matches one `@StaffRoles(...)` on the backend,
  // where `RolesOrStaffGuard` passes the account tier OR the grant. Keep this
  // list and `adminNav.data.ts`'s `capabilities` in step: the rail decides what
  // a holder is offered, this decides what they can open.
  {
    // `AdminListingsController`, `AdminSafeSpaceNominationsController` and
    // `AdminSafeSpaceBadgesController`. The flag queue is NOT included (it is
    // the only place a flagger's identity and free text are served), so the
    // safe-spaces page hides that tab for a holder without the mod tier.
    patterns: [
      routes.adminListings,
      `${routes.adminListings}/*`,
      routes.adminSafeSpaces,
      `${routes.adminSafeSpaces}/*`,
    ],
    capabilities: ["directory_moderator"],
  },
  {
    // The resource library: guides, service listings, member suggestions and
    // the feedback ratings. Publishing or deleting a guide stays admin-only,
    // enforced per method on the backend.
    patterns: [
      routes.adminResourceGuides,
      `${routes.adminResourceGuides}/*`,
      routes.adminResourceListings,
      `${routes.adminResourceListings}/*`,
      routes.adminResourceSuggestions,
      `${routes.adminResourceSuggestions}/*`,
      routes.adminGuideFeedback,
      `${routes.adminGuideFeedback}/*`,
    ],
    capabilities: ["resource_curator"],
  },
  {
    // Story submissions, writer applications, commission interest, and the two
    // public-face content surfaces (press kit, landing slots).
    patterns: [
      routes.adminMagazineSubmissions,
      `${routes.adminMagazineSubmissions}/*`,
      routes.adminWriterApplications,
      `${routes.adminWriterApplications}/*`,
      routes.adminCommissionInterests,
      `${routes.adminCommissionInterests}/*`,
      routes.adminPressKit,
      `${routes.adminPressKit}/*`,
      routes.adminLanding,
      `${routes.adminLanding}/*`,
    ],
    capabilities: ["editorial"],
  },
  {
    // Community care work. The last-resort overrides (freeze, archive,
    // reassign owner, remove a member) stay admin-only per method.
    patterns: [
      routes.adminCommunities,
      `${routes.adminCommunities}/*`,
      routes.adminCommunityTagRequests,
      `${routes.adminCommunityTagRequests}/*`,
      routes.adminTopics,
      `${routes.adminTopics}/*`,
      routes.adminReadingGroupProposals,
      `${routes.adminReadingGroupProposals}/*`,
    ],
    capabilities: ["communities"],
  },
  {
    patterns: [
      routes.adminPartnerApplications,
      `${routes.adminPartnerApplications}/*`,
      routes.adminOrgTiers,
      `${routes.adminOrgTiers}/*`,
      routes.adminChangemakers,
      `${routes.adminChangemakers}/*`,
      routes.adminChangemakerNominations,
      `${routes.adminChangemakerNominations}/*`,
    ],
    capabilities: ["partnerships"],
  },
  {
    // PRD-282, the triage console over every staff queue. `AdminQueuesController`
    // spreads `@StaffRoles(...)` from every grant that owns at least one queue
    // and then filters the RESPONSE BODY per queue, so any one of these six
    // reaches the screen and sees only the queues it can work. This is the entry
    // that needed a list rather than a single grant: as six sibling entries only
    // the first would ever be consulted, and the other five holders would be
    // bounced from the one screen that tells them their queue is late.
    //
    // `magazine_editor` and `magazine_writer` are deliberately absent. Neither
    // owns a queue in `ADMIN_QUEUE_REGISTRY`, so neither reaches the endpoint.
    patterns: [routes.adminQueues],
    capabilities: [
      "housing_moderator",
      "directory_moderator",
      "resource_curator",
      "editorial",
      "communities",
      "partnerships",
    ],
  },
];

/**
 * The staff roles that each, on their own, satisfy `pathname`'s role
 * requirement. Empty when no grant elevates into it.
 */
export function elevatingCapabilities(pathname: string): StaffRoleId[] {
  for (const entry of CAPABILITY_ELEVATED_PATTERNS) {
    if (matchesAny(pathname, entry.patterns)) return entry.capabilities;
  }
  return [];
}

/**
 * Guest-only surfaces: the sign-in / sign-up entry pages that only make sense to
 * a logged-out visitor. A signed-in member has nothing to do here, so the gate
 * bounces them to their feed (or the `?next=` they were headed for). This is the
 * mirror image of GATED_PATTERNS. Post-signup pages (onboarding,
 * member-sends-an-invite) are intentionally NOT here — being logged in is the
 * whole point of those.
 */
const GUEST_ONLY_PATTERNS: string[] = [
  routes.signIn,
  routes.requestInvite,
  "/studio/sign-in",
];

/** True when a path is only meaningful to logged-out visitors. */
export function isGuestOnlyPath(pathname: string): boolean {
  return matchesAny(pathname, GUEST_ONLY_PATTERNS);
}

/**
 * Paths the policy re-acceptance sheet must never cover (ID-14).
 *
 * Being asked to agree again is a hard stop on the member surface, and a hard
 * stop has to leave three doors open or it stops being a request and becomes a
 * hostage situation:
 *   - the DOCUMENTS themselves. Nobody can be asked to agree to something they
 *     are not allowed to go and read, so Terms, Privacy and the Community
 *     Guidelines stay open. (The sheet's own links point here, and it re-opens
 *     the moment they navigate anywhere else, so reading is a detour rather
 *     than an escape.)
 *   - LEAVING. `routes.deleteAccount` is carved out for the same reason the
 *     onboarding and deactivation gates already carve it out: a member who has
 *     decided to go should never have to agree to a new rule on the way out.
 *   - SIGNING OUT, which needs no path — the sheet has its own sign-out button.
 *
 * Only the member surface is covered in the first place (see
 * `usePolicyReacceptanceRequired`), so public marketing, the magazine, support
 * and the crisis pages are untouched whether or not they are listed here.
 */
const POLICY_REACCEPTANCE_EXEMPT_PATHS: string[] = [
  routes.terms,
  routes.privacy,
  routes.guidelines,
  routes.deleteAccount,
];

/**
 * True when the member's agreement is behind the revisions now in effect.
 *
 * `null`/absent `accepted*` counts as behind on purpose. Those columns were
 * never backfilled (agreeing is a specific act, so a manufactured version would
 * be a lie), which means a null is not "they are fine", it is "we have no
 * evidence they ever saw this" — and the whole point of the item is to stop
 * moderating people under rules nobody can show they were shown.
 *
 * Absent `policyVersions` entirely (an older backend, or a payload the
 * validator dropped) is NOT behind: with no signal at all, silently blocking
 * every member out of the app would be a far worse failure than asking nobody.
 */
export function needsPolicyReacceptance(
  policyVersions: AuthUser["policyVersions"],
): boolean {
  if (!policyVersions) return false;
  return (
    policyVersions.acceptedTerms !== policyVersions.currentTerms ||
    policyVersions.acceptedGuidelines !== policyVersions.currentGuidelines
  );
}

/**
 * Whether the re-acceptance sheet should be showing right now (ID-14).
 *
 * Deliberately a separate hook from `useAuthGateRedirect` rather than another
 * branch inside it: this gate has no destination to redirect TO. There is no
 * "re-accept" page — the member stays exactly where they are and a blocking
 * sheet covers the surface, so agreeing returns them to what they were doing
 * instead of dumping them on the feed. `App.tsx` mounts the sheet next to the
 * consent banner and reads this.
 *
 * Live mode only, and only for a settled, ordinary session:
 *   - demo mode records no acceptance and has no real member row;
 *   - `checking` means `/auth/me` is still in flight, so the answer is not yet
 *     knowable and flashing the sheet on every reload would be worse than
 *     waiting;
 *   - a member still mid-onboarding agrees to the guidelines at the end of the
 *     wizard, so asking them in a sheet on top of it would ask twice;
 *   - a suspended or deactivated member is already redirected to a page that
 *     explains their status, and a sheet over it would bury that explanation
 *     behind a request they cannot act on usefully anyway.
 */
export function usePolicyReacceptanceRequired(): boolean {
  const { loggedIn, checking, status, user } = useAuth();
  const { demoMode } = useDemoMode();
  const { pathname } = useLocation();

  if (demoMode || checking || !loggedIn) return false;
  if (status !== "active") return false;
  if (!user?.onboardedAt) return false;
  if (POLICY_REACCEPTANCE_EXEMPT_PATHS.includes(pathname)) return false;
  if (!isGatedPath(pathname)) return false;
  return needsPolicyReacceptance(user.policyVersions);
}

/** The role a path demands, or null when logged-in access is sufficient. */
export function requiredRole(pathname: string): "admin" | "mod" | null {
  if (matchesAny(pathname, MOD_ACCESSIBLE_ADMIN_PATTERNS)) return "mod";
  if (matchesAny(pathname, ADMIN_PATTERNS)) return "admin";
  if (matchesAny(pathname, MOD_PATTERNS)) return "mod";
  return null;
}

/** The staff role a path demands, or null when the account tier is sufficient. */
export function requiredCapability(pathname: string): StaffRoleId | null {
  for (const entry of CAPABILITY_PATTERNS) {
    if (matchesAny(pathname, entry.patterns)) return entry.capability;
  }
  return null;
}

/**
 * True when `pathname` is closed to logged-out visitors — i.e. it matches a
 * gated pattern and isn't a public escape hatch. This is the single source of
 * truth shared by the route guard and the nav/footer link filtering.
 */
export function isGatedPath(pathname: string): boolean {
  if (matchesAny(pathname, PUBLIC_EXCEPTIONS)) return false;
  return matchesAny(pathname, GATED_PATTERNS);
}

/**
 * True when a link destination is gated. Accepts the same href strings the
 * nav/footer feed to `linkToPath()` (clean paths, legacy design filenames, or
 * in-page anchors); the trailing #anchor is dropped before matching, and
 * external/non-path hrefs are treated as public.
 */
export function isGatedLink(href: string): boolean {
  const path = linkToPath(href).split(/[?#]/)[0] || "/";
  if (!path.startsWith("/")) return false; // external / mailto / tel
  return isGatedPath(path);
}

/**
 * Returns a predicate that decides whether a nav/footer link should be shown to
 * the current visitor: everything is visible to logged-in members, while
 * logged-out visitors don't see links into the gated member surface.
 */
export function useIsLinkVisible(): (href: string) => boolean {
  const { loggedIn } = useAuth();
  const { demoMode } = useDemoMode();
  return (href: string) =>
    !isComingSoonLink(href) &&
    (demoMode || !isDemoOnlyNavLink(href)) &&
    (loggedIn || !isGatedLink(href));
}

/**
 * When a logged-out visitor lands on a gated route, returns the sign-in path
 * with a `?next=` back-link so they return here after authenticating. Returns
 * null when the visitor is allowed through (logged in, or on a public route).
 */
export function useAuthGateRedirect(): string | null {
  const { loggedIn, checking, role, status, user, staffRoles } = useAuth();
  const { demoMode } = useDemoMode();
  const { pathname, search } = useLocation();

  // Live-mode session probe still in flight: don't decide the gate yet, or we'd
  // bounce a signed-in member reloading a gated page to sign-in before /auth/me
  // confirms. AppRoutes holds gated paths on a loader meanwhile.
  if (checking) return null;

  if (loggedIn) {
    // A deactivated member — paused, or inside the 30-day erasure grace window —
    // is hidden everywhere and 403s on every ActiveMemberGuard route. Letting
    // them through to /feed would render an app where nothing loads and no
    // screen explains why. Send them to the delete-account page instead: it
    // hosts both the pending-erasure banner (with the cancel button that is the
    // only way back out of grace) and the reactivation copy. Demo mode has no
    // real status, so this never fires there.
    //
    // Note the backend auto-reactivates a *deactivated* member on Google
    // sign-in, so in practice this catches the erasure-grace case.
    if (!demoMode && status === "deactivated") {
      // Three carve-outs, all for the same reason — a blanket redirect would
      // hide the one page that explains what is happening.
      //   - `routes.deleteAccount` is the destination itself, and hosts the
      //     cancel button that is the only way back out of erasure grace.
      //   - `routes.status` is the public platform-status page (ID-16). It is
      //     the single surface that tells someone whether the PLATFORM is down
      //     rather than their account being broken. Bouncing a deactivated
      //     member off it during an outage leaves them looking at a
      //     delete-account screen with no way to learn that nothing is wrong
      //     with them. It is public, so this grants nothing they could not
      //     already read signed out.
      //   - `routes.dataExport` is the LAST window in which the export is worth
      //     anything: this branch mostly catches the erasure grace, so the data
      //     is about to be deleted permanently. See the note on the suspended
      //     branch below for why the export and deletion pages are exempt from
      //     every account-state bounce, and please do not tidy this away.
      const reachableWhileDeactivated: string[] = [
        routes.deleteAccount,
        routes.dataExport,
        routes.status,
      ];
      return reachableWhileDeactivated.includes(pathname)
        ? null
        : routes.deleteAccount;
    }
    // Opening the INSTALLED app. The manifest's start_url is "/?mode=standalone"
    // (see providers/standaloneLaunch.ts), and "/" is the marketing homepage
    // for everyone, so without this a signed-in member tapping the home-screen
    // icon landed on the landing page every time. The launch marker is the
    // only thing that distinguishes this from a member choosing to open "/"
    // from inside the app, which stays reachable. Signed-out launches fall
    // through and keep the homepage. Placed BEFORE the suspended check so a
    // suspended member's launch still reaches /feed, whose own gate then
    // shows them the page that explains the suspension.
    if (pathname === routes.homepage && isStandaloneLaunch(search)) {
      return routes.feed;
    }
    // A suspended member: their sessions are revoked and every ActiveMemberGuard
    // route 403s, so a gated page would render a blank screen with no
    // explanation. Send them to the account-suspended page (or account-banned
    // when the suspension is permanent — status "suspended" with no
    // `suspendedUntil`), which now shows the real reason + expiry from /auth/me.
    // Unlike a deactivation, a suspension still lets them read PUBLIC content
    // (magazine, policies, crisis pages), so only a *gated* path bounces — and
    // the status + appeal pages are always allowed so the reason and the appeal
    // stay reachable. Demo mode has no real status, so this never fires there.
    if (!demoMode && status === "suspended") {
      const target = user?.suspendedUntil
        ? routes.accountSuspended
        : routes.accountBanned;
      // `routes.dataExport` and `routes.deleteAccount` are exempt DELIBERATELY,
      // and the exemption must survive the next tidy-up of this list.
      //
      // Leaving and taking your data with you are the two things moderation
      // state may never take away. They are also the two things the banned page
      // itself sends people to do: its "Request full data erasure" button
      // targets `routes.dataExport`, and its copy tells a removed member to
      // request deletion. Without these two entries that button was a loop
      // (bounce to /system/account-banned, press, bounce again) with no way
      // through for the one class of member who most needs it, since a
      // permanent ban is `status === "suspended"` with no `suspendedUntil` and
      // therefore lands on exactly that page.
      //
      // The server already agrees and always has: `AccountController` carries
      // no `ActiveMemberGuard` precisely so that "account lifecycle actions
      // (deactivate, deletion, export, DSAR, sessions) must remain reachable"
      // (queerpulse-backend/src/account/account.controller.ts). So this closes a
      // gap where the CLIENT gate forbade what the API allowed. Both paths stay
      // gated for everyone signed out; this exempts them from the account-state
      // bounce only.
      const alwaysAllowed: string[] = [
        routes.accountSuspended,
        routes.accountBanned,
        routes.appealSubmit,
        routes.appealOutcome,
        routes.dataExport,
        routes.deleteAccount,
      ];
      if (alwaysAllowed.includes(pathname)) return null;
      return isGatedPath(pathname) ? target : null;
    }
    // Role-gate admin/mod surfaces. Demo mode is intentionally an explorable
    // sandbox where the admin panel is reachable (its team role is simulated via
    // the demo-only role store in features/admin/adminRole.ts), so role isn't enforced
    // there — but that sandbox exists for local development only. Requiring DEV
    // as well as demo means no shipped build can ever reach the bypass, even one
    // deliberately built with VITE_DEMO=1: `import.meta.env.DEV` is inlined false
    // by `vite build`, so the guard below is unconditional in every artifact.
    if (!demoMode || !import.meta.env.DEV) {
      const need = requiredRole(pathname);
      // An additive grant can satisfy a role requirement on its own, wherever
      // the backend guard accepts the same union (CAPABILITY_ELEVATED_PATTERNS).
      const elevatingGrants = elevatingCapabilities(pathname);
      const hasElevatingGrant = elevatingGrants.some((capability) =>
        (staffRoles ?? []).includes(capability),
      );
      if (need === "admin" && role !== "admin" && !hasElevatingGrant) {
        return routes.homepage;
      }
      if (
        need === "mod" &&
        role !== "moderator" &&
        role !== "admin" &&
        !hasElevatingGrant
      ) {
        return routes.homepage;
      }
      // Capability-gated surfaces (e.g. /magazine/editor): the account tier
      // alone isn't enough — admins are a superset, everyone else needs the
      // matching additive staff-role grant.
      const capability = requiredCapability(pathname);
      if (
        capability &&
        role !== "admin" &&
        !(staffRoles ?? []).includes(capability)
      ) {
        return routes.homepage;
      }
    }
    // Nothing to sign into when you're already in — send members on to their
    // feed (or the `?next=` they were headed for) instead of the auth screens.
    if (isGuestOnlyPath(pathname)) {
      return safeInternalPath(new URLSearchParams(search).get("next"));
    }
    // The post-signup onboarding wizard is one-time. A member who already
    // finished it (onboardedAt set — backfilled for pre-existing members) has no
    // reason to be back here; browser autofill of the saved /auth/onboarding URL
    // is the usual way they land on it, and replaying it can silently re-submit
    // profile fields (the intents step overwrites `lookingFor`). Bounce them to
    // their feed. A member still mid-onboarding (onboardedAt null) falls through
    // and keeps the wizard. Demo mode is left explorable so the flow can be
    // previewed — it only ever fires in live mode.
    if (
      !demoMode &&
      user?.onboardedAt &&
      matchPath(routes.onboarding, pathname)
    ) {
      return routes.feed;
    }
    // The forward direction of the same one-time gate: a member still
    // mid-onboarding (onboardedAt null) who navigates straight to the member
    // surface (e.g. a bookmarked /feed, or the address bar) is nudged back into
    // the wizard instead of being left to wander it unfinished. Scoped to
    // `isGatedPath` — the same member-only surface GATED_PATTERNS already
    // fences off from logged-out visitors — rather than every logged-in-reachable
    // page, so it reads as one denylist: public marketing, magazine/cinema
    // browsing, legal (terms/privacy), support/contact, and the auth flow
    // (sign-in/request-invite) are never gated, so none of them are touched
    // here either — reading Terms or reaching contact support never gets
    // trapped. `routes.deleteAccount` is carved out explicitly even though
    // it lives under the gated `/account/*` prefix: a member who wants to leave
    // the platform shouldn't have to finish onboarding first, mirroring the
    // deactivated-member carve-out for the same page above. This is a
    // client-side nudge only — it does not change what the backend allows.
    if (
      !demoMode &&
      !user?.onboardedAt &&
      pathname !== routes.deleteAccount &&
      !matchPath(routes.onboarding, pathname) &&
      isGatedPath(pathname)
    ) {
      return routes.onboarding;
    }
    return null;
  }
  if (!isGatedPath(pathname)) return null;

  return `${routes.signIn}?next=${encodeURIComponent(pathname)}`;
}
