import { QueryClient } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { server } from "./msw/server";
import { API, API_V1 } from "./msw/handlers";
import { queryClient as productionQueryClient } from "../shared/api/queryClient";

/**
 * LIVE-mode regression guard: a per-route request budget, covering `/feed`,
 * `/local/directory/list`, and `/account/profile`.
 *
 * Mirrors the mechanism in `src/features/economy/api/useJobs.live.test.tsx` —
 * `vi.resetModules()` + `vi.stubEnv("VITE_API_URL", ...)` before dynamically
 * re-importing every app module that (transitively) reads
 * `shared/api/config.ts`, so `apiAvailable`/`demoConfigured` re-freeze against
 * the stubbed env instead of the suite-wide demo default in `vitest.config.ts`
 * (`VITE_API_URL: ""`, which forces demo mode — where nothing fetches, and this
 * test would pass vacuously forever). `TestProviders` and `AppRoutes` are
 * dynamically imported (never statically, not even indirectly) so every
 * Context they create shares one fresh module instantiation — a static import
 * of either would hold a stale Context identity that the fresh tree's
 * `useContext` calls couldn't see.
 *
 * `onUnhandledRequest: "error"` (same as the reference live suite) is
 * deliberate here beyond convention: this test's entire premise is an EXACT
 * accounting of every request a route fires. An endpoint I failed to mock must
 * throw loudly, not silently pass through to the real network or get shrugged
 * off as a warning.
 *
 * **Why this test builds its own `QueryClient` instead of letting
 * `TestProviders` mint its default one:** the session-bootstrap seeding
 * (`src/shared/api/useSessionBootstrap.ts`) only suppresses `SocialProvider`'s
 * blocks/mutes queries and `ProfileProvider`'s own-profile read when
 * react-query still considers the seeded data FRESH — and freshness is
 * `staleTime`-gated (query-core's `shouldFetchOptionally`/`isStaleByTime`;
 * confirmed by reading
 * `node_modules/.pnpm/@tanstack+query-core@5.101.2/.../legacy/{queryObserver,query,utils}.js`
 * directly, not from memory). `TestProviders`' own default client sets no
 * `staleTime` (defaults to 0, deliberately — see its docblock), which makes
 * `isStaleByTime` return `true` for data no matter how recently it was
 * seeded, so on the default client this suppression is unobservable: the
 * queries would still fire. Production's `src/shared/api/queryClient.ts` sets
 * `staleTime: 30_000`, which is what actually makes it work. This test reads
 * `productionQueryClient.getDefaultOptions().queries` and mirrors it — rather
 * than hardcoding `30_000` — specifically so it can't silently drift from
 * production if that default ever changes, and passes the result to
 * `TestProviders`' optional `queryClient` prop. `retry` is forced to `false`
 * (production defaults to `1`) so an unexpected failure surfaces immediately
 * instead of retrying and stalling a test's async wait.
 */

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  server.events.removeAllListeners("request:start");
});
afterAll(() => server.close());

beforeEach(() => {
  // DemoModeProvider's live-mode default reads this key; a value left over
  // from another test would flip demo back on and make every assertion below
  // vacuous.
  window.localStorage.clear();
});

/** The one signed-in member every mocked endpoint below agrees on. */
const SLUG = "demo-member";

const EMPTY_PAGE = { items: [], total: 0, page: 1, pageSize: 0 };

/**
 * Handlers for the session/chrome endpoints every route mounts in live mode,
 * regardless of which page it renders — every route sits under
 * `RootProviders` (`AuthProvider` → `/csrf-token` + `/auth/me`) and
 * `DataProviders` (`SessionBootstrapProvider` → `/me/bootstrap`), and every
 * route's shell renders `Navbar` (`PageShell`) or `AppNav`/`Sidebar`
 * (`AppShell`), all three of which read the same `useUnreadCount()` query →
 * `/notifications/unread-count`. `/csrf-token` itself isn't registered here —
 * it's already in the shared `src/test/msw/handlers.ts` barrel.
 *
 * Renamed from `registerFeedRouteHandlers`: it used to also carry `/feed`'s
 * own two endpoints (`/me/communities`, `/feed`), now registered per-test
 * instead so this function is genuinely route-agnostic.
 *
 * No handlers for `/blocks`, `/mutes`, or `/profiles/${SLUG}` (the own-profile
 * read) — under the production-like client every test below renders with,
 * `SocialProvider`'s blocks/mutes queries and `ProfileProvider`'s own-profile
 * read never fire on ANY route (the session-bootstrap seed lands first and
 * reads as fresh; see the file header). Registering unused handlers for them
 * would risk masking a regression: if one of these ever fires again,
 * `onUnhandledRequest: "error"` below throws immediately instead of quietly
 * returning a mocked 200 that only shows up as an extra array entry.
 *
 * Task 5 audited the six providers phases 2-4 scoped off the app-wide path
 * (`WorkProfileProvider` → `/me/work-preferences`, `PostedJobsProvider` →
 * `/me/jobs` [deleted outright], `PublicProfileProvider` → `/me/public-profile`,
 * `EmployerAffiliationProvider` → `/me/affiliation`, `VouchProvider` →
 * `/me/vouches/given`, `DraftsProvider` → `/me/drafts`) and confirmed — by
 * grepping `src/app/providers/` — none of the six still calls `useQuery`.
 * Each now only fetches through a composition hook (`useWorkProfile()`,
 * `usePublicProfile()`, `useEmployerAffiliation()`, `useVouch()`,
 * `useDrafts()`) subscribed by specific consumers, so none belongs in this
 * shared, route-agnostic set. Where a route's own consumers pull one of these
 * back in (`/account/profile` does, below), the test registers it itself.
 */
function registerSessionHandlers() {
  server.use(
    http.get(`${API_V1}/auth/me`, () =>
      HttpResponse.json({
        id: "demo",
        email: "demo-member@queerpulse.test",
        status: "active",
        role: "member",
        ageAttestedAt: "2026-01-01T00:00:00.000Z",
        // Non-null: `validateAuthUser` requires the field (string|null), and a
        // non-null value marks the member already-onboarded so the auth gate
        // doesn't bounce this live render to /auth/onboarding.
        onboardedAt: "2026-01-01T00:00:00.000Z",
        profile: {
          slug: SLUG,
          firstName: "Demo",
          lastName: "Member",
          pronouns: "they/them",
          avatarUrl: null,
        },
      }),
    ),
    // SessionBootstrapProvider — the four session slices in one round trip.
    // This is what seeds ["blocks", false] / ["mutes", false] /
    // ["profile", false, SLUG] before SocialProvider/ProfileProvider's own
    // queries turn `enabled` on, so — under a client with a nonzero
    // `staleTime` — those three never fire their own request.
    http.get(`${API_V1}/me/bootstrap`, () =>
      HttpResponse.json({
        profile: {
          slug: SLUG,
          firstName: "Demo",
          lastName: "Member",
          vouchCount: 0,
          visibility: "open",
          limited: false,
        },
        saved: EMPTY_PAGE,
        blocks: EMPTY_PAGE,
        mutes: EMPTY_PAGE,
      }),
    ),
    // Navbar/AppNav/Sidebar all read the same query key via useUnreadCount(),
    // so this is one request no matter how many of them are mounted, and
    // fires on any route once the mocked member is signed in — including
    // PageShell marketing routes: Navbar renders the bell itself whenever
    // `loggedIn` is true, it isn't an AppShell-only affordance.
    http.get(`${API_V1}/notifications/unread-count`, () =>
      HttpResponse.json({ count: 0 }),
    ),
    // Sibling of the bell: the nav DM badge (`useUnreadMessages()`) now fetches
    // this cheap dedicated count on every route once the mocked member is signed
    // in (active), instead of pulling the whole `GET /conversations` inbox as it
    // once did. One request no matter how many nav surfaces mount it.
    http.get(`${API_V1}/conversations/unread-count`, () =>
      HttpResponse.json({ count: 0 }),
    ),
    // ConsentProvider (src/app/providers/ConsentProvider.tsx) sits app-wide in
    // RootProviders and fires `fetchMyConsent()` unconditionally on mount in
    // live mode — gated only on `apiAvailable && !demoMode`, no login check.
    // This is pre-existing, byte-identical-to-HEAD behaviour (see
    // .superpowers/sdd/investigate-requestBudget.md §4), not a regression:
    // consent state is meaningful for anonymous visitors too, so an app-wide
    // unconditional fetch is defensible product behaviour. It therefore
    // belongs in this shared, route-agnostic handler set, mirrored by
    // SESSION_REQUEST_BUDGET below.
    http.get(`${API_V1}/consent/me`, () =>
      HttpResponse.json({
        categories: { necessary: true, analytics: false, monitoring: false },
        policyVersion: "3.3",
      }),
    ),
    // AnnouncementBanner renders inside BOTH PageShell and AppShell, so
    // `usePlatformStatus()` fires on every route, signed in or not.
    http.get(`${API_V1}/platform-status`, () =>
      HttpResponse.json({
        signInOpen: true,
        inviteRequestsOpen: true,
        registrationOpen: true,
        announcement: null,
      }),
    ),
    // PublicProfileProvider sits app-wide in DataProviders and fetches the
    // eligibility signals for any signed-in live session, on every route —
    // not only where the badge/panel that reads them renders.
    http.get(`${API_V1}/me/public-eligibility`, () =>
      HttpResponse.json({
        verified: false,
        tenureDays: 0,
        publishedPieces: [],
        hostedOpenEvents: [],
        publishedSubprofiles: 0,
        vouchCount: 0,
        endorsementCount: 0,
        connectionCount: 0,
        eventsAttended: 0,
        communityPosts: 0,
        lastActiveDaysAgo: 0,
        standingOk: true,
      }),
    ),
  );
}

/**
 * The exact session/chrome paths mocked by `registerSessionHandlers()` above
 * — expected on every live-mode route regardless of which page renders. Kept
 * as a single source of truth so each route's expected array below spreads
 * this in rather than re-typing the same five strings per route: a route
 * that forgot to paste one in by hand would silently under-assert instead of
 * failing loudly. See `registerSessionHandlers()`'s doc comments above for
 * why each entry (in particular `/consent/me`) belongs here.
 */
const SESSION_REQUEST_BUDGET = [
  // Unversioned: `/csrf-token` is one of the two DIRECT `fetch()` calls in the
  // client (`@Version(VERSION_NEUTRAL)` on the backend), so it stays off the
  // `/v1` prefix — see `src/shared/api/client.ts` and the `handlers.ts` barrel.
  "/csrf-token",
  // Everything else routes through the client's generic `request()` builder,
  // which prefixes `/v1` (the backend runs `enableVersioning({ type: URI })`),
  // so the observed pathname carries it. Registered under `API_V1` above.
  "/v1/auth/me",
  "/v1/consent/me",
  "/v1/me/bootstrap",
  // AnnouncementBanner (in both PageShell and AppShell) → usePlatformStatus().
  "/v1/platform-status",
  // The nav's bell (`useUnreadCount`) and DM (`useUnreadMessages`) badges used
  // to render inside the page's own Navbar/AppShell and so fired here. They now
  // live in the persistent App-level `AppChrome` (the PWA-nav refactor), which
  // `App.tsx` mounts as a sibling of the routes — NOT inside the route content
  // this harness renders. So their `/v1/notifications/unread-count` and
  // `/v1/conversations/unread-count` reads no longer fire in these route-budget
  // renders (confirmed: no `<nav>` mounts here). Their handlers stay registered
  // in `registerSessionHandlers()` as a defensive net — if a route ever fires
  // one again it surfaces as an unexpected (received-not-expected) entry rather
  // than an unhandled-request error. They belong to the AppChrome layer's own
  // coverage, not this route-content budget.
];

/**
 * The nav's unread-messages badge (`useUnreadMessages()` in
 * `src/features/messages/api/useConversations.ts`) mounts on every route via
 * the desktop `Navbar` `MessagesLink` / `SidebarFooter`, and — because
 * `src/test/setup.ts` stubs `matchMedia` to `matches: false` (the DESKTOP
 * branch) — it renders in this harness. It used to fire `GET /conversations`
 * (the whole DM inbox) app-wide just to derive a count.
 *
 * That eager over-fetch has been FIXED by giving messaging its own cheap
 * server-side count: `useUnreadMessages()` now fetches `GET
 * /conversations/unread-count` (mirroring `/notifications/unread-count`) once
 * the member is signed in and active — a single small count, never the full
 * inbox. That request is a session/chrome path, so it lives in
 * `registerSessionHandlers()` + `SESSION_REQUEST_BUDGET` alongside the bell's
 * count, NOT here. So the full-list `GET /conversations` must NOT appear in any
 * route's budget below. The handler is still registered as a defensive net: if
 * the badge ever regresses to pulling the whole inbox, `onUnhandledRequest:
 * "error"` would fail loudly on an unregistered call rather than exposing the
 * regression only as an extra expected entry — but the assertions no longer
 * spread it in, so its RETURN, not just its absence, is what a regression trips.
 */
function registerAppWideHandlers() {
  server.use(
    http.get(`${API_V1}/conversations`, () => HttpResponse.json([])),
    // Public kill-switch projection read app-wide by `usePlatformStatus`
    // (lockdown / registration banners), fired on every live route. Benign
    // "fails-open" default = platform fully open, nothing locked.
    http.get(`${API_V1}/platform-status`, () =>
      HttpResponse.json({
        registrationOpen: true,
        joinRequestsOpen: true,
        locked: false,
        lockdownMessage: null,
        registrationClosedMessage: null,
      }),
    ),
  );
}

/**
 * Non-session reads fired by the ROUTE CONTENT on every live route — as opposed
 * to the App-level chrome this harness doesn't mount. Currently empty:
 * `/v1/platform-status` (`usePlatformStatus`, the lockdown/registration banner)
 * fires from the marketing Navbar / App-level chrome, not the routed page, so
 * it does not appear in these route-content budgets (its handler is still
 * registered defensively in `registerAppWideHandlers()`). The DM-badge fetch is
 * likewise chrome-level now (see `SESSION_REQUEST_BUDGET`). Kept as a named
 * constant so each route's expected array documents that it accounts for the
 * app-wide layer, and so a genuinely route-level app-wide read has one home.
 */
const APP_WIDE_REQUEST_BUDGET: string[] = [];

/**
 * Mirrors `src/shared/api/queryClient.ts`'s query defaults — importantly
 * `staleTime: 30_000` — by reading them off the production client rather than
 * hardcoding a number that could silently drift from it. `retry` is forced to
 * `false`: a real failure here should surface immediately, not retry and
 * stall the test's async wait. See the file header for why this test needs
 * production-like staleness instead of `TestProviders`' default client.
 */
function makeProductionLikeQueryClient(): QueryClient {
  const prodDefaults = productionQueryClient.getDefaultOptions().queries;
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...prodDefaults,
        retry: false,
      },
    },
  });
}

/**
 * Renders `path` under the full live-mode app tree and returns the sorted,
 * deduped set of pathnames it requested. The `request:start` listener is
 * registered before `render` so nothing fired during the initial synchronous
 * mount is missed; `afterEach` above already tears it down via
 * `server.events.removeAllListeners("request:start")`.
 */
async function renderRouteLive(path: string) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { TestProviders } = await import("./TestProviders");
  const { AppRoutes } = await import("../app/routes");
  const seen: string[] = [];
  server.events.on("request:start", ({ request }) => {
    seen.push(new URL(request.url).pathname);
  });
  render(
    <TestProviders
      initialEntries={[path]}
      queryClient={makeProductionLikeQueryClient()}
    >
      <AppRoutes />
    </TestProviders>,
  );
  await screen.findByRole("main", undefined, { timeout: 10000 });
  // Then wait for the request stream to go quiet. A DEMAND-GATED query (one a
  // consumer's effect enables, e.g. `usePublicProfileEligibility()`) starts a
  // render after mount, so snapshotting the moment `main` exists would miss it
  // and the budget would under-assert exactly the kind of fetch it exists to
  // catch. Settled = two consecutive checks with no new request.
  let previousCount = -1;
  await waitFor(() => {
    const settled = seen.length === previousCount;
    previousCount = seen.length;
    expect(settled).toBe(true);
  });
  return [...new Set(seen)].sort();
}

describe("request budget (live mode)", () => {
  it("/feed fires exactly its known request budget — no new eager provider slips in unnoticed", async () => {
    registerSessionHandlers();
    registerAppWideHandlers();
    // FeedPage's own data, all feed-specific (none fires on the other routes
    // below): the feed itself (`/feed`), the viewer's cross-community
    // membership map (`/me/communities` via `useMyCommunities()` in
    // `useFeedPage`), and the sidebar's upcoming-events rail (`/events` via
    // `useEvents({ filter: "upcoming" })`).
    server.use(
      http.get(`${API_V1}/feed`, () => HttpResponse.json([])),
      http.get(`${API_V1}/me/communities`, () => HttpResponse.json([])),
      http.get(`${API_V1}/events`, () => HttpResponse.json([])),
      // SOC-06: the sidebar's connections widget (`useConnectionsList("all")`
      // in useFeedPage) — the true total and the avatars it draws.
      http.get(`${API_V1}/connections`, () => HttpResponse.json(EMPTY_PAGE)),
      // SOC-05: SuggestedPeopleStrip. Empty on purpose — an empty answer means
      // the strip renders nothing and no SuggestedPeopleCard mounts, so the
      // per-card `useMemberContact` never pulls
      // `/connections/relationships` onto this route.
      http.get(`${API_V1}/members/suggested`, () =>
        HttpResponse.json({ items: [] }),
      ),
    );

    const seen = await renderRouteLive("/feed");

    // Exact equality is load-bearing (see file header): a `toContain` or
    // subset check would let a new eager provider add a request without this
    // test ever noticing — precisely the regression this guards against.
    //
    // `/blocks`, `/mutes` and `/profiles/${SLUG}` are CONFIRMED ABSENT:
    // `useSessionBootstrapSettled` holds `blocksQuery`/`mutesQuery`/the
    // own-profile query at `enabled: false` until the bootstrap `queryFn` —
    // which seeds those exact cache keys before it returns — has resolved,
    // so by the time `enabled` flips true the seeded data is ~0ms old, well
    // under this client's `staleTime: 30_000`; `shouldFetchOptionally`'s
    // `isStaleByTime` check is then false and no fetch is dispatched.
    //
    // `/listings/mine` is absent: DirectoryListingsProvider now holds only
    // the optimistic overlay, and `useDirectoryListings` (the composition
    // hook in features/marketing/listBusiness/api/) owns the query. Its sole
    // reader is PlacesSection on /account/profile — see that test below.
    expect(seen).toEqual(
      [
        ...SESSION_REQUEST_BUDGET,
        ...APP_WIDE_REQUEST_BUDGET,
        // SOC-06: FeedSidebar's connections widget, via
        // `useConnectionsList("all")` in useFeedPage. It replaced a hardcoded
        // "42" in demo and an empty state for every live member, so the widget
        // needs the real list; there is no cheaper source that also carries the
        // avatars it draws (`/connections/counts` is totals only).
        "/v1/connections",
        "/v1/events",
        "/v1/feed",
        "/v1/me/communities",
        // SOC-05: SuggestedPeopleStrip, the feed's "people you might know"
        // band. Its own data, fetched nowhere else on this route.
        "/v1/members/suggested",
      ].sort(),
    );
  }, 15000);

  it("/local/directory/list does not fire /listings/mine — ListBusinessPage is a write-only consumer", async () => {
    registerSessionHandlers();
    registerAppWideHandlers();
    // The wizard's SavedDraftsPanel now reads the caller's in-progress drafts
    // (`GET /listing-drafts`, cross-device drafts) on mount — a resume list,
    // not the `/listings/mine` published-listings read this test guards against.
    server.use(
      http.get(`${API_V1}/listing-drafts`, () => HttpResponse.json([])),
    );
    const seen = await renderRouteLive("/local/directory/list");

    // The load-bearing assertion is the ABSENCE of /listings/mine.
    // ListBusinessPage calls `useDirectoryListingsActions` (overlay +
    // mutators, no query subscription — confirmed by reading
    // ListBusinessPage.tsx and grepping every file under
    // features/marketing/listBusiness/ for a `useDirectoryListings` or
    // `useMyListings` call: only the actions hook is imported). If someone
    // "simplifies" it back to `useDirectoryListings`, nothing visibly
    // breaks — the page still works, the request just comes back. This is
    // the only test that catches it.
    expect(seen).not.toContain("/v1/listings/mine");

    // OBSERVED (see file header): ListBusinessPage is a PageShell marketing
    // wizard. Its one route-level read is the SavedDraftsPanel's
    // `/v1/listing-drafts` resume list; everything else comes from the shared
    // session layer alone — nothing else route-specific, and nothing app-wide
    // (those reads are App-chrome-level, not mounted by this harness — see the
    // budget constants). That keeps it a clean guard that no *listings* read
    // (esp. `/v1/listings/mine`) has crept into the wizard. In particular the
    // profile-page reads (`/v1/communities`, `/v1/connections/relationships`,
    // `/v1/directory/by-member/:slug`, `/v1/me/communities`) do NOT fire here:
    // they are subscribed by member-profile components, not by this page.
    expect(seen).toEqual(
      [
        ...SESSION_REQUEST_BUDGET,
        ...APP_WIDE_REQUEST_BUDGET,
        "/v1/listing-drafts",
      ].sort(),
    );
  }, 15000);

  it("/account/profile fires /listings/mine — PlacesSection is the reader that owns it", async () => {
    registerSessionHandlers();
    registerAppWideHandlers();
    server.use(
      // ProfilePage self-view reads subscribed by the profile's own sections
      // (each traced in the assertion comment below): the viewer's
      // communities + membership map (ProfileCommunitiesSection), the viewer's
      // connection relationships (member-contact affordance, PRD-03: connected,
      // incoming and sent in ONE call), and the owner's directory
      // listings.
      http.get(`${API_V1}/communities`, () => HttpResponse.json([])),
      http.get(`${API_V1}/me/communities`, () => HttpResponse.json([])),
      http.get(`${API_V1}/connections/relationships`, () =>
        HttpResponse.json({ connected: [], incoming: [], sent: [] }),
      ),
      // ProfileNetworkSection → useProfileNetwork → useConnectionsList("all").
      // Already in the budget below; it had no handler, so it was the one call
      // this suite let fail rather than answer.
      http.get(`${API_V1}/connections`, () => HttpResponse.json(EMPTY_PAGE)),
      http.get(`${API_V1}/directory/by-member/${SLUG}`, () =>
        HttpResponse.json([]),
      ),
      http.get(`${API_V1}/listings/mine`, () => HttpResponse.json(EMPTY_PAGE)),
      // PlacesSection also mounts CoManagerInvitesInbox, which asks whether
      // anybody has invited this member to help run their listing.
      http.get(`${API_V1}/listings/co-manager-invites`, () =>
        HttpResponse.json([]),
      ),
      // ProfileWritingSection (CON-11) asks whether this member has a
      // magazine byline. `null` is the honest answer for the overwhelming
      // majority of members, and it short-circuits the section: no byline
      // means no follow-up GET /magazine/articles?author=… either.
      http.get(`${API_V1}/magazine/authors/by-member/${SLUG}`, () =>
        HttpResponse.json(null),
      ),
      // The following four are route-scoped composition-hook reads
      // PlacesSection's siblings pull in on the self view of /account/profile
      // — see the comment on the assertion below for how each was found.
      http.get(`${API_V1}/me/public-profile`, () =>
        HttpResponse.json({ enabled: false }),
      ),
      http.get(`${API_V1}/me/vouches/given`, () => HttpResponse.json([])),
      http.get(`${API_V1}/profiles/${SLUG}/subprofiles`, () =>
        HttpResponse.json([]),
      ),
      http.get(`${API_V1}/me/recognition`, () =>
        HttpResponse.json({
          level: {
            level: 1,
            name: "Newcomer",
            xp: 0,
            xpMax: 100,
            percent: 0,
            xpToNext: 100,
            nextName: "Regular",
          },
          levelLadder: [],
          badges: { earnedCount: 0, discoverCount: 0, earned: [], locked: [] },
          perks: { availableCount: 0, groups: [], ladder: [] },
        }),
      ),
      http.get(`${API_V1}/members/${SLUG}/vouchers`, () =>
        HttpResponse.json({ vouchers: [] }),
      ),
      // ACQ-08: ProfileInviteCard, the invites-left strip at the foot of a
      // member's OWN profile. Self view only.
      http.get(`${API_V1}/invites/quota`, () =>
        HttpResponse.json({
          limit: 5,
          used: 0,
          remaining: 5,
          resetsAt: "2026-10-01T00:00:00.000Z",
          memberCount: 1,
        }),
      ),
      // ProfileHero (src/features/members/ProfileSections.tsx) renders
      // MemberStaffBadge, which reads useStaffRole()'s useStaffMap() →
      // GET /platform/staff (enabled when logged in). Response shape is
      // PlatformStaffRowDTO[]; an empty array means the mocked member
      // holds no staff role, which is all this test needs.
      http.get(`${API_V1}/platform/staff`, () => HttpResponse.json([])),
    );

    const seen = await renderRouteLive("/account/profile");

    // The positive half of the phase-5 guard. /listings/mine is EXPECTED
    // here: ProfilePage mounts PlacesSection, which calls the composition
    // hook, which subscribes useMyListings. A guard that only asserted the
    // request's absence on other routes would be satisfied by a hook that
    // never fetches at all.
    expect(seen).toContain("/v1/listings/mine");

    // OBSERVED (see file header). Beyond the shared session + app-wide +
    // PageShell chrome layers, ProfilePage's own self-view render tree pulls
    // in these route-specific reads, each traced to its component:
    //   - ProfileHero → PublicProfileBadge (isSelf) →
    //     usePublicProfileEligibility() → GET /me/public-eligibility. The
    //     badge reads eligibility only, so it no longer subscribes to
    //     GET /me/public-profile: the stored preference is fetched when the
    //     modal that shows it opens.
    //   - SubprofileShowcase → SubprofileAffiliations → useEndorsers() →
    //     GET /subprofiles/{id}/endorsements for the rendered persona.
    //   - ProfileHero/HeroVouchRow → useVouch() → useGivenVouches() →
    //     GET /me/vouches/given
    //   - ProfileSubprofilesSection → useProfileSubprofiles(selfSlug) →
    //     GET /profiles/{slug}/subprofiles  (+ the app-wide /subprofiles/mine
    //     served by the shared subprofiles barrel handler)
    //   - ProfileHero's HeroRecognition chips (isSelf only) →
    //     useRecognition() → GET /me/recognition (no slug passed, so the
    //     owner's own view correctly hits the owner-only route, which also
    //     triggers the backend's recompute-on-read).
    //   - HeroVouchRow → useVouchers(profile.slug) →
    //     GET /members/{slug}/vouchers (a THIRD, distinct vouch-related
    //     endpoint from /me/vouches/given and vouch mutations — do not
    //     conflate the three)
    //   - ProfileHero → MemberStaffBadge → useStaffRole()/useStaffMap() →
    //     GET /platform/staff (self-view staff badge, confirmed intended)
    //   - PlacesSection → useDirectoryListings() → GET /listings/mine
    //   - PlacesSection → CoManagerInvitesInbox → useCoManagerInvites() →
    //     GET /listings/co-manager-invites (self view only: the invitations
    //     waiting on this member to help run somebody else's listing,
    //     answered where an accepted one lands)
    expect(seen).toEqual(
      [
        ...SESSION_REQUEST_BUDGET,
        ...APP_WIDE_REQUEST_BUDGET,
        "/v1/communities",
        // ProfileNetworkSection → useProfileNetwork(slug) →
        // useConnectionsList("all") → GET /connections?tab=all&page=1.
        "/v1/connections",
        // ProfileHero → PublicProfileBadge (isSelf) →
        // usePublicProfileEligibility(), the ONLY thing that turns this
        // fetch on. Its absence from every other route's budget is the
        // assertion that the provider no longer fetches app-wide.
        "/v1/me/public-eligibility",
        "/v1/connections/relationships",
        `/v1/directory/by-member/${SLUG}`,
        // ACQ-08: ProfilePage (self view, not editing) → ProfileInviteCard →
        // useInviteQuota() → GET /invites/quota. Route-owned and self-view
        // only: a visitor, and an owner previewing as a visitor, never mount
        // the strip, so this fires on no other route.
        "/v1/invites/quota",
        "/v1/listings/co-manager-invites",
        "/v1/listings/mine",
        // ProfileBelowHeroSections → ProfileWritingSection →
        // useMemberWriting(slug) → GET /magazine/authors/by-member/{slug}
        // (CON-11's "Writing" credit). Nullable, so it goes through
        // apiGetNullable; a null byline renders nothing and fires no
        // article list.
        `/v1/magazine/authors/by-member/${SLUG}`,
        "/v1/me/communities",
        "/v1/me/recognition",
        "/v1/me/vouches/given",
        `/v1/members/${SLUG}/vouchers`,
        "/v1/platform/staff",
        `/v1/profiles/${SLUG}/subprofiles`,
        "/v1/subprofiles/mine",
        "/v1/subprofiles/sp-tiago-draft/endorsements",
      ].sort(),
    );
  }, 15000);
});
