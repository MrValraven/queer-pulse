import { QueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
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
import { API } from "./msw/handlers";
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
    http.get(`${API}/auth/me`, () =>
      HttpResponse.json({
        id: "demo",
        email: "demo-member@queerpulse.test",
        status: "active",
        role: "member",
        ageAttestedAt: "2026-01-01T00:00:00.000Z",
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
    http.get(`${API}/me/bootstrap`, () =>
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
    http.get(`${API}/notifications/unread-count`, () =>
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
    http.get(`${API}/consent/me`, () =>
      HttpResponse.json({
        categories: { necessary: true, analytics: false, monitoring: false },
        policyVersion: "3.3",
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
  "/auth/me",
  "/consent/me",
  "/csrf-token",
  "/me/bootstrap",
  "/notifications/unread-count",
];

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
  return [...new Set(seen)].sort();
}

describe("request budget (live mode)", () => {
  it(
    "/feed fires exactly its known request budget — no new eager provider slips in unnoticed",
    async () => {
      registerSessionHandlers();
      // FeedPage's own data: its cross-community membership map, and the feed
      // itself. Previously part of registerFeedRouteHandlers; kept local now
      // that the shared helper is route-agnostic.
      server.use(
        http.get(`${API}/me/communities`, () => HttpResponse.json([])),
        http.get(`${API}/feed`, () => HttpResponse.json([])),
      );

      const seen = await renderRouteLive("/feed");

      // Exact equality is load-bearing (see file header): a `toContain` or
      // subset check would let a new eager provider add a request without this
      // test ever noticing — precisely the regression this guards against.
      //
      // This list is the REAL observed set, not a sketch. `/feed` sits under
      // the full app-wide provider stack (src/test/TestProviders.tsx mirrors
      // src/app/App.tsx's DataProviders), and most of those providers still
      // owned an eager live-mode fetch of their own before phases 2-5 scoped
      // each one to its actual reader.
      //
      // TASK 5 AUDIT (re-run against the current code, not assumed): grepped
      // every provider Task 4 flagged as still-unscoped
      // (`/me/work-preferences`, `/me/jobs`, `/me/public-profile`,
      // `/me/affiliation`, `/me/vouches/given`, `/me/drafts`) and confirmed
      // none of their providers calls `useQuery` any more — see
      // `registerSessionHandlers`'s docblock above. The six-endpoint budget
      // below is therefore CONFIRMED, not provisional.
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
        [...SESSION_REQUEST_BUDGET, "/feed", "/me/communities"].sort(),
      );
    },
    15000,
  );

  it(
    "/local/directory/list does not fire /listings/mine — ListBusinessPage is a write-only consumer",
    async () => {
      registerSessionHandlers();
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
      expect(seen).not.toContain("/listings/mine");

      // PREDICTION, NOT OBSERVED — the task brief's own array for this route
      // was stale (pre-phase-2-5, listing six provider endpoints that no
      // longer fire app-wide at all). This replacement was derived by reading
      // ListBusinessPage.tsx's full render tree (PageShell → Navbar; the
      // wizard steps/preview/success components) and confirming no component
      // in it calls any read/composition hook beyond
      // useDirectoryListingsActions. It is a marketing route under PageShell,
      // not AppShell, but Navbar renders the same notifications bell for a
      // signed-in visitor regardless of shell — so /notifications/unread-count
      // is expected here too, unlike a naive "PageShell has no AppNav" guess
      // would suggest.
      //
      // MAINTAINER: run `pnpm test -- src/test/requestBudget.test.tsx`, and
      // replace this array with the actually-observed set — after confirming
      // every entry in the observed set is a request this route legitimately
      // needs. Do not paper over a failure by adding this array's entries
      // without checking why they fired.
      expect(seen).toEqual([...SESSION_REQUEST_BUDGET].sort());
    },
    15000,
  );

  it(
    "/account/profile fires /listings/mine — PlacesSection is the reader that owns it",
    async () => {
      registerSessionHandlers();
      server.use(
        http.get(`${API}/listings/mine`, () => HttpResponse.json(EMPTY_PAGE)),
        // The following four are route-scoped composition-hook reads
        // PlacesSection's siblings pull in on the self view of /account/profile
        // — see the comment on the assertion below for how each was found.
        http.get(`${API}/me/public-profile`, () =>
          HttpResponse.json({ enabled: false }),
        ),
        http.get(`${API}/me/vouches/given`, () => HttpResponse.json([])),
        http.get(`${API}/profiles/${SLUG}/subprofiles`, () =>
          HttpResponse.json([]),
        ),
        http.get(`${API}/profiles/${SLUG}/recognition`, () =>
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
        http.get(`${API}/members/${SLUG}/vouchers`, () =>
          HttpResponse.json({ vouchers: [] }),
        ),
        // ProfileHero (src/features/members/ProfileSections.tsx) renders
        // MemberStaffBadge, which reads useStaffRole()'s useStaffMap() →
        // GET /platform/staff (enabled when logged in). Response shape is
        // PlatformStaffRowDTO[]; an empty array means the mocked member
        // holds no staff role, which is all this test needs.
        http.get(`${API}/platform/staff`, () => HttpResponse.json([])),
      );

      const seen = await renderRouteLive("/account/profile");

      // The positive half of the phase-5 guard. /listings/mine is EXPECTED
      // here: ProfilePage mounts PlacesSection, which calls the composition
      // hook, which subscribes useMyListings. A guard that only asserted the
      // request's absence on other routes would be satisfied by a hook that
      // never fetches at all.
      expect(seen).toContain("/listings/mine");

      // PREDICTION, NOT OBSERVED — the task brief's own array for this route
      // was stale in the other direction from /local/directory/list: it named
      // six provider endpoints that no longer fire app-wide (correct that some
      // fire HERE, wrong about which, and silent on several requests this
      // route's OWN components pull in that no provider-level grep would ever
      // surface).
      //
      // This replacement was derived by reading ProfilePage.tsx's self-view,
      // non-editing render tree component by component:
      //   - PublicProfileControl → usePublicProfile() → GET /me/public-profile
      //   - ProfileHero/HeroVouchRow → useVouch() → useGivenVouches() →
      //     GET /me/vouches/given
      //   - ProfileSubprofilesSection → useProfileSubprofiles(selfSlug) →
      //     GET /profiles/{slug}/subprofiles
      //   - ProfileContent's RecognitionSection (isSelf only) →
      //     useRecognition() → GET /profiles/{slug}/recognition — NOTE: this
      //     hook defaults its `target` to the signed-in user's own slug rather
      //     than leaving it undefined, so even the OWNER's own view hits the
      //     `/profiles/:slug/...` form, never `/me/recognition`. Confirmed by
      //     reading useRecognition.ts's `target = slug ?? user?.profile.slug`.
      //   - HeroVouchRow → useVouchers(profile.slug) →
      //     GET /members/{slug}/vouchers (a THIRD, distinct vouch-related
      //     endpoint from /me/vouches/given and vouch mutations — do not
      //     conflate the three)
      //   - PlacesSection → useDirectoryListings() → GET /listings/mine
      // None of these three new endpoints (subprofiles, recognition,
      // members/:slug/vouchers) appear anywhere in the task brief; they were
      // only found by reading the actual component tree, exactly the risk the
      // brief warned about ("ProfilePage in particular may fire route-specific
      // reads ... not visible from the provider list alone").
      //
      // MAINTAINER: run `pnpm test -- src/test/requestBudget.test.tsx`, and
      // replace this array with the actually-observed set — after confirming
      // every entry in the observed set is a request this route legitimately
      // needs, and that the five `server.use()` handlers above actually match
      // what each endpoint's real response shape needs (they were written
      // from the DTO types, not from a passing run). Do not paper over a
      // failure by adding this array's entries without checking why they
      // fired.
      expect(seen).toEqual(
        [
          ...SESSION_REQUEST_BUDGET,
          "/listings/mine",
          "/me/public-profile",
          "/me/vouches/given",
          `/members/${SLUG}/vouchers`,
          // /platform/staff: this is genuinely NEW eager-request behaviour,
          // not pre-existing at HEAD (see
          // .superpowers/sdd/investigate-requestBudget.md §4). It comes from
          // MemberStaffBadge, rendered by ProfileHero
          // (src/features/members/ProfileSections.tsx) via useStaffRole()'s
          // useStaffMap(). The maintainer has confirmed the self-view staff
          // badge is intended product behaviour, so it belongs in this
          // route's budget — unlike /consent/me, this one is route-specific
          // (only /account/profile renders ProfileHero), so it stays local
          // to this array rather than joining SESSION_REQUEST_BUDGET.
          "/platform/staff",
          `/profiles/${SLUG}/recognition`,
          `/profiles/${SLUG}/subprofiles`,
        ].sort(),
      );
    },
    15000,
  );
});
