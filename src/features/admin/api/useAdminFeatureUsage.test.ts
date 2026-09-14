import { createElement, type ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
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
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../../test/msw/server";
import { API, API_V1 } from "../../../test/msw/handlers";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_FEATURE_USAGE } from "../adminFeatureUsage.data";
import type { AdminFeatureUsageDTO } from "./adminFeatureUsage.api";
// Statically imported (unlike the live-mode hook below, which is re-imported
// per test via `loadLive()`); this shares its module graph and therefore
// its `DemoModeContext` instance with `TestProviders`, which is also a
// static import. Both were resolved once, at this file's initial load,
// against vitest.config.ts's default env (`VITE_API_URL: ""`,
// `VITE_DEMO: "1"`), which is exactly what forces demo mode on (see
// `TestProviders`'s docblock). A `vi.resetModules()` call inside a later
// live-mode test only affects *future* dynamic `import()`s; earlier
// bindings remain at their original module snapshot.
import { useAdminFeatureUsage } from "./useAdminFeatureUsage";

/**
 * LIVE-mode suite: proves the demo→live branch of `useAdminFeatureUsage`
 * actually hits the network and returns the fetched DTO's `features`/
 * `drillDowns` as-is, plus a demo-mode suite proving the inverse: demo
 * mode never touches the network and returns the fixture assembled into the
 * same `{ features, drillDowns, isLoading }` shape. Mirrors
 * `useAdminOverview.live.test.tsx`.
 *
 * A third suite is the whole reason this hook exists: it proves a `feed`-
 * shaped row (`depth: null`, `depthTotal: null`, reach-only) survives both
 * the demo fixture and the live fetch as `null`, never coerced to `0`.
 *
 * VITE_API_URL is stubbed to a real value in the live-mode tests so
 * `apiAvailable` is true (demo OFF) and MSW serves GET /admin/feature-usage.
 * Modules are reset and re-imported per test so `config.ts` re-freezes
 * `API_BASE_URL` from the stub.
 */

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

/** A minimal but fully-valid `AdminFeatureUsageDTO`: one `busy` reach-only
 *  row (`feed`, `depth`/`depthTotal: null`, the exact shape this hook exists
 *  to pass through untouched), one `browsed-but-empty` row, one `quiet` row,
 *  and one `not-launched` row covering the same four states as the demo
 *  fixture. */
const MINIMAL_FEATURE_USAGE_DTO: AdminFeatureUsageDTO = {
  rangeDays: 30,
  hasReachSignal: true,
  features: [
    {
      featureKey: "housingListings",
      isLaunched: true,
      reach: 500,
      depth: 0,
      depthTotal: 120,
      reachPrevious: 480,
      reason: null,
      state: "browsed-but-empty",
    },
    {
      featureKey: "landlords",
      isLaunched: true,
      reach: 90,
      depth: 1,
      depthTotal: 6,
      reachPrevious: 100,
      reason: null,
      state: "quiet",
    },
    {
      featureKey: "feed",
      isLaunched: true,
      reach: 1800,
      depth: null,
      depthTotal: null,
      reachPrevious: 1700,
      reason: "The feed is a read surface and creates nothing.",
      state: "busy",
    },
    {
      featureKey: "cinema",
      isLaunched: false,
      reach: 0,
      depth: null,
      depthTotal: null,
      reachPrevious: 0,
      reason:
        "Titles are published by editorial staff only; no member route creates a CinemaTitle, and WatchProgress is excluded on the same privacy grounds as messaging.",
      state: "not-launched",
    },
  ],
  drillDowns: {
    housingListings: { listings: 0, savedSearches: 9, viewings: 20 },
    forum: { threads: 5, replies: 11 },
    communities: { created: 14, stillPostingThisWeek: 22 },
  },
};

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useAdminFeatureUsage: useAdminFeatureUsageLive } =
    await import("./useAdminFeatureUsage");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client },
      createElement(DemoModeProvider, null, children),
    );
  return { useAdminFeatureUsage: useAdminFeatureUsageLive, wrapper };
}

describe("useAdminFeatureUsage (live mode via MSW)", () => {
  it("fetches GET /admin/feature-usage and returns the DTO's features/drillDowns as-is", async () => {
    server.use(
      http.get(`${API_V1}/admin/feature-usage`, () =>
        HttpResponse.json(MINIMAL_FEATURE_USAGE_DTO),
      ),
    );

    const { useAdminFeatureUsage: useAdminFeatureUsageLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useAdminFeatureUsageLive(30), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.features).toEqual(MINIMAL_FEATURE_USAGE_DTO.features);
    expect(result.current.drillDowns).toEqual(
      MINIMAL_FEATURE_USAGE_DTO.drillDowns,
    );

    // The whole point: a feed-shaped reach-only row survives the fetch with
    // its `depth`/`depthTotal` still `null`, never coerced to `0`.
    const feedRow = result.current.features.find(
      (feature) => feature.featureKey === "feed",
    );
    expect(feedRow).toBeDefined();
    expect(feedRow!.depth).toBeNull();
    expect(feedRow!.depthTotal).toBeNull();
    expect(feedRow!.state).toBe("busy");
  });
});

describe("useAdminFeatureUsage (demo mode)", () => {
  it("returns the assembled fixture and issues no request in demo mode", async () => {
    // No handler is registered for GET /admin/feature-usage in this test;
    // `onUnhandledRequest: "error"` above means any request at all, mocked or
    // not, throws and fails the test. A passing result here proves the
    // network was never touched.
    const { result } = renderHook(() => useAdminFeatureUsage(30), {
      wrapper: TestProviders,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.features).toEqual(DEMO_FEATURE_USAGE.features);
    expect(result.current.drillDowns).toEqual(DEMO_FEATURE_USAGE.drillDowns);

    // The demo fixture's own `feed` row carries the same invariant: `depth`
    // stays `null` rather than becoming `0`.
    const feedRow = result.current.features.find(
      (feature) => feature.featureKey === "feed",
    );
    expect(feedRow).toBeDefined();
    expect(feedRow!.depth).toBeNull();
    expect(feedRow!.depthTotal).toBeNull();
  });
});
