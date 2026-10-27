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
import { buildDemoFeatureUsage } from "../adminFeatureUsageDemo";
import type {
  AdminFeatureUsageDTO,
  ClassifiedFeature,
} from "./adminFeatureUsage.api";
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
 * LIVE-mode suite: proves the demo to live branch of `useAdminFeatureUsage`
 * actually hits the network with the right range parameters and returns the
 * fetched DTO's `features`/`drillDowns`/window as-is, plus a demo-mode suite
 * proving the inverse: demo mode never touches the network and returns the
 * built fixture. Both prove a `feed`-shaped row (`depth: null`,
 * `depthTotal: null`, reach-only) keeps its `null` depth all the way through.
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
  vi.useRealTimers();
});
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

const PRESET_30 = { kind: "preset", rangeDays: 30 } as const;
const FIXED_NOW = new Date("2026-10-26T15:00:00Z");

function fixtureRow(
  featureKey: string,
  overrides: Partial<ClassifiedFeature>,
): ClassifiedFeature {
  return {
    featureKey,
    isLaunched: true,
    reach: 0,
    depth: 0,
    depthTotal: 0,
    reachPrevious: 0,
    reason: null,
    reachDaily: Array.from({ length: 30 }, () => 0),
    reachPreviousDaily: Array.from({ length: 30 }, () => 0),
    state: "quiet",
    ...overrides,
  };
}

/** A minimal but fully valid `AdminFeatureUsageDTO` covering the same four
 *  states as the demo fixture, with one reach-only `feed` row. */
const MINIMAL_FEATURE_USAGE_DTO: AdminFeatureUsageDTO = {
  rangeDays: 30,
  rangeStart: "2026-09-26",
  rangeEnd: "2026-10-25",
  previousRangeStart: "2026-08-27",
  previousRangeEnd: "2026-09-25",
  retentionStart: "2024-10-26",
  isPreviousRangePartial: false,
  reachMedian: 500,
  hasReachSignal: true,
  features: [
    fixtureRow("housingListings", {
      reach: 30,
      reachDaily: Array.from({ length: 30 }, () => 1),
      depthTotal: 120,
      reachPrevious: 0,
      state: "browsed-but-empty",
    }),
    fixtureRow("landlords", { depth: 1, depthTotal: 6 }),
    fixtureRow("feed", {
      depth: null,
      depthTotal: null,
      reason: "The feed is a read surface and creates nothing.",
      state: "busy",
    }),
    fixtureRow("cinema", {
      isLaunched: false,
      depth: null,
      depthTotal: null,
      state: "not-launched",
    }),
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

function expectFeedStaysNull(features: ClassifiedFeature[]) {
  const feedRow = features.find((feature) => feature.featureKey === "feed");
  expect(feedRow).toBeDefined();
  expect(feedRow!.depth).toBeNull();
  expect(feedRow!.depthTotal).toBeNull();
}

describe("useAdminFeatureUsage (live mode via MSW)", () => {
  it("requests rangeDays for a preset and returns the DTO as-is", async () => {
    const requestedUrls: URL[] = [];
    server.use(
      http.get(`${API_V1}/admin/feature-usage`, ({ request }) => {
        requestedUrls.push(new URL(request.url));
        return HttpResponse.json(MINIMAL_FEATURE_USAGE_DTO);
      }),
    );

    const { useAdminFeatureUsage: useAdminFeatureUsageLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useAdminFeatureUsageLive(PRESET_30), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(requestedUrls[0]?.searchParams.get("rangeDays")).toBe("30");
    expect(requestedUrls[0]?.searchParams.has("from")).toBe(false);
    expect(result.current.features).toEqual(MINIMAL_FEATURE_USAGE_DTO.features);
    expect(result.current.drillDowns).toEqual(
      MINIMAL_FEATURE_USAGE_DTO.drillDowns,
    );
    expect(result.current.reachMedian).toBe(500);
    expect(result.current.window?.previousRangeEnd).toBe("2026-09-25");
    expect(result.current.errorCode).toBeNull();
    expectFeedStaysNull(result.current.features);
  });

  it("requests from and to for a custom range and omits rangeDays", async () => {
    const requestedUrls: URL[] = [];
    server.use(
      http.get(`${API_V1}/admin/feature-usage`, ({ request }) => {
        requestedUrls.push(new URL(request.url));
        return HttpResponse.json(MINIMAL_FEATURE_USAGE_DTO);
      }),
    );

    const { useAdminFeatureUsage: useAdminFeatureUsageLive, wrapper } =
      await loadLive();
    const customSelection = {
      kind: "custom",
      from: "2026-03-01",
      to: "2026-03-10",
    } as const;
    const { result } = renderHook(
      () => useAdminFeatureUsageLive(customSelection),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(requestedUrls[0]?.searchParams.get("from")).toBe("2026-03-01");
    expect(requestedUrls[0]?.searchParams.get("to")).toBe("2026-03-10");
    expect(requestedUrls[0]?.searchParams.has("rangeDays")).toBe(false);
  });

  it("names the backend's range code when the request is refused", async () => {
    server.use(
      http.get(`${API_V1}/admin/feature-usage`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            error: "Bad Request",
            code: "feature_usage_range_too_long",
            message: "A custom range can cover at most 365 days",
          },
          { status: 400 },
        ),
      ),
    );

    const { useAdminFeatureUsage: useAdminFeatureUsageLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useAdminFeatureUsageLive(PRESET_30), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorCode).toBe("rangeTooLong");
  });
});

describe("useAdminFeatureUsage (demo mode)", () => {
  it("returns the built fixture and issues no request in demo mode", async () => {
    // No handler is registered for GET /admin/feature-usage in this test;
    // `onUnhandledRequest: "error"` above means any request at all fails the
    // test, so a passing result proves the network was never touched.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(FIXED_NOW);
    const expected = buildDemoFeatureUsage(PRESET_30, FIXED_NOW);

    const { result } = renderHook(() => useAdminFeatureUsage(PRESET_30), {
      wrapper: TestProviders,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.features).toEqual(expected.features);
    expect(result.current.drillDowns).toEqual(expected.drillDowns);
    expect(result.current.reachMedian).toBe(expected.reachMedian);
    expect(result.current.window?.rangeStart).toBe("2026-09-26");
    expect(result.current.window?.rangeEnd).toBe("2026-10-25");
    expectFeedStaysNull(result.current.features);
  });
});
