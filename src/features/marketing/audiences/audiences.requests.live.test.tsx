import { QueryClient } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
import { server } from "../../../test/msw/server";
import { API, API_V1 } from "../../../test/msw/handlers";
import { queryClient as productionQueryClient } from "../../../shared/api/queryClient";
import { routes } from "../../../app/routeMap";
import { forBusinesses } from "../../../shared/i18n/catalogs/en/forBusinesses";
import { forCommunities } from "../../../shared/i18n/catalogs/en/forCommunities";
import { forPerformers } from "../../../shared/i18n/catalogs/en/forPerformers";
import { forPractitioners } from "../../../shared/i18n/catalogs/en/forPractitioners";
import { outsideInert } from "./shared/testing/audienceTestUtils";

/**
 * LIVE-mode guard for the four audience landing pages: each one renders
 * sample content from props and fires no request of its own. Every path a
 * landing requests must also be requested by a plain marketing page
 * (`routes.privacy`) under the same session, so the only traffic is the app
 * shell's.
 *
 * Modelled on `src/test/requestBudget.test.tsx` (read its header for the
 * full reasoning): `vi.resetModules()` + `vi.stubEnv("VITE_API_URL", API)`
 * before dynamically importing `TestProviders` and `AppRoutes`, so
 * `apiAvailable`/`demoConfigured` freeze against the live env and every
 * Context comes from one fresh module instantiation. In demo mode nothing
 * fetches, so this suite would pass vacuously without the live stub.
 *
 * `onUnhandledRequest: "error"` makes any request the session handlers below
 * do not cover fail loudly, which is exactly what a landing page that started
 * fetching would trip.
 */

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  server.events.removeAllListeners("request:start");
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

beforeEach(() => {
  // DemoModeProvider's live-mode default reads this key; a leftover value
  // would flip demo back on and make every assertion below vacuous.
  window.localStorage.clear();
});

/** The one signed-in member every mocked endpoint below agrees on. */
const SLUG = "demo-member";

const EMPTY_PAGE = { items: [], total: 0, page: 1, pageSize: 0 };

interface SessionOptions {
  isSignedIn: boolean;
}

/**
 * The session and chrome endpoints every live route mounts, copied from
 * `registerSessionHandlers()` in `src/test/requestBudget.test.tsx`. Signed
 * out, `/auth/me` answers 401 and the refresh answers 401 too, so the
 * session settles as a guest instead of retrying.
 */
function registerSessionHandlers({ isSignedIn }: SessionOptions) {
  server.use(
    http.get(`${API_V1}/auth/me`, () =>
      isSignedIn
        ? HttpResponse.json({
            id: "demo",
            email: "demo-member@queerpulse.test",
            status: "active",
            role: "member",
            ageAttestedAt: "2026-01-01T00:00:00.000Z",
            // Non-null marks the member onboarded, so the auth gate does not
            // bounce the render to /auth/onboarding.
            onboardedAt: "2026-01-01T00:00:00.000Z",
            profile: {
              slug: SLUG,
              firstName: "Demo",
              lastName: "Member",
              pronouns: "they/them",
              avatarUrl: null,
            },
          })
        : HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
    ),
    http.post(`${API}/auth/refresh`, () =>
      isSignedIn
        ? new HttpResponse(null, { status: 200 })
        : HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
    ),
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
    http.get(`${API_V1}/notifications/unread-count`, () =>
      HttpResponse.json({ count: 0 }),
    ),
    http.get(`${API_V1}/conversations/unread-count`, () =>
      HttpResponse.json({ count: 0 }),
    ),
    http.get(`${API_V1}/consent/me`, () =>
      HttpResponse.json({
        categories: { necessary: true, analytics: false, monitoring: false },
        policyVersion: "3.3",
      }),
    ),
    http.get(`${API_V1}/platform-status`, () =>
      HttpResponse.json({
        signInOpen: true,
        inviteRequestsOpen: true,
        registrationOpen: true,
        announcement: null,
      }),
    ),
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

/** Production query defaults (`staleTime` above all), with retries off. */
function makeProductionLikeQueryClient(): QueryClient {
  const productionDefaults = productionQueryClient.getDefaultOptions().queries;
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...productionDefaults,
        retry: false,
      },
    },
  });
}

/**
 * Renders `path` under the full live-mode app tree, waits for `isReady` and
 * then for the request stream to go quiet, and returns the sorted, deduped
 * pathnames requested. The listener is attached before `render`, so nothing
 * fired during the first synchronous mount is missed.
 */
async function renderRouteLive(path: string, isReady: () => Promise<unknown>) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { TestProviders } = await import("../../../test/TestProviders");
  const { AppRoutes } = await import("../../../app/routes");
  const requestedPaths: string[] = [];
  server.events.on("request:start", ({ request }) => {
    requestedPaths.push(new URL(request.url).pathname);
  });
  render(
    <TestProviders
      initialEntries={[path]}
      queryClient={makeProductionLikeQueryClient()}
    >
      <AppRoutes />
    </TestProviders>,
  );
  await isReady();
  // Settled = three consecutive quiet polls 100ms apart with no new request,
  // so a query that a consumer's effect enables after mount still lands in
  // the set. waitFor also reruns on DOM mutations, so a check under 90ms
  // after the last counted one is skipped and never counts as a poll.
  let previousCount = -1;
  let quietPollCount = 0;
  let lastPollAt = 0;
  await waitFor(
    () => {
      const now = Date.now();
      if (now - lastPollAt < 90) throw new Error("Poll came early");
      lastPollAt = now;
      const isQuiet = requestedPaths.length === previousCount;
      previousCount = requestedPaths.length;
      quietPollCount = isQuiet ? quietPollCount + 1 : 0;
      expect(quietPollCount).toBeGreaterThanOrEqual(3);
    },
    { interval: 100, timeout: 3000 },
  );
  server.events.removeAllListeners("request:start");
  return [...new Set(requestedPaths)].sort();
}

/** The catalog hero title with its `<em>` markup removed. */
function plainTitle(title: string | undefined): string {
  return (title ?? "").replace(/<\/?em>/g, "");
}

const LANDINGS = [
  {
    path: routes.forBusinesses,
    title: plainTitle(forBusinesses["hero.title"]),
  },
  {
    path: routes.forCommunities,
    title: plainTitle(forCommunities["hero.title"]),
  },
  {
    path: routes.forPerformers,
    title: plainTitle(forPerformers["hero.title"]),
  },
  {
    path: routes.forPractitioners,
    title: plainTitle(forPractitioners["hero.title"]),
  },
];

const SESSIONS = [
  { label: "signed in", isSignedIn: true },
  { label: "signed out", isSignedIn: false },
];

const CASES = SESSIONS.flatMap((session) =>
  LANDINGS.map((landing) => ({ ...landing, ...session })),
);

/** Resolves once the landing's own h1 (outside every inert frame) is up. */
async function findLandingHeading(title: string) {
  await waitFor(
    () => {
      const headings = outsideInert(
        screen.queryAllByRole("heading", { level: 1 }),
      );
      expect(headings.map((heading) => heading.textContent)).toContain(title);
    },
    { timeout: 10000 },
  );
}

describe("audience landings fire no request of their own (live mode)", () => {
  it.each(CASES)(
    "renders $path with no request beyond the shell ($label)",
    async ({ path, title, isSignedIn }) => {
      expect(title.length).toBeGreaterThan(0);
      registerSessionHandlers({ isSignedIn });

      const shellPaths = await renderRouteLive(routes.privacy, () =>
        screen.findByRole("main", undefined, { timeout: 10000 }),
      );
      cleanup();

      const landingPaths = await renderRouteLive(path, () =>
        findLandingHeading(title),
      );

      // Not vacuous: the live session really requested something.
      expect(shellPaths.length).toBeGreaterThan(0);
      const extraPaths = landingPaths.filter(
        (landingPath) => !shellPaths.includes(landingPath),
      );
      expect(extraPaths).toEqual([]);
    },
    30000,
  );
});
