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
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../../test/msw/server";
import { API } from "../../../test/msw/handlers";
import { TestProviders } from "../../../test/TestProviders";
import {
  METRICS,
  TRIAGE_QUEUE,
  REPORT_WEEKS,
  REPORT_SERIES,
  MEMBER_GROWTH,
  RESPONSE_DIST,
  ACTIVITY_FEED,
} from "../adminDashboard.data";
import type { AdminOverviewDTO } from "./adminOverview.api";
// Statically imported (unlike the live-mode hook below, which is re-imported
// per test via `loadLive()`) so this shares its module graph — and therefore
// its `DemoModeContext`/`I18nContext` instances — with `TestProviders`, which
// is also a static import. Both were resolved once, at this file's initial
// load, against vitest.config.ts's default env (`VITE_API_URL: ""`,
// `VITE_DEMO: "1"`), which is exactly what forces demo mode on (see
// `TestProviders`'s docblock). A `vi.resetModules()` call inside a later
// live-mode test only affects *future* dynamic `import()`s, not this
// already-bound top-level binding.
import { useAdminOverview } from "./useAdminOverview";

/**
 * LIVE-mode suite: proves the demo→live branch of useAdminOverview actually
 * hits the network and runs the DTO through the 6 E2 adapters, PLUS a
 * demo-mode suite proving the inverse — that demo mode never touches the
 * network and returns the fixtures assembled into the same shape. Mirrors
 * useAdminCommunities.live.test.tsx.
 *
 * VITE_API_URL is stubbed to a real value in the live-mode tests so
 * `apiAvailable` is true (demo OFF) and MSW serves GET /admin/overview.
 * Modules are reset + re-imported per test so config.ts re-freezes
 * API_BASE_URL from the stub.
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

/** A minimal but fully-valid AdminOverviewDTO: nulls where the backend
 *  reports "not measured yet" (growthPercent, oldestOpenHours,
 *  medianResponseHours, sustainerMrr/Count, responseTime), 8 report weeks
 *  (matching the fixture's own week count), a couple of growth points, and 2
 *  feed rows — one `report_resolved` (to exercise the null-actor "anonymous"
 *  branch) and one `member_joined` with a real actor. */
const MINIMAL_OVERVIEW_DTO: AdminOverviewDTO = {
  stats: {
    activeMembers: { value: 9120, growthPercent: null, netNewThisWeek: 40 },
    openReports: { value: 5, oldestOpenHours: null, emergencies: 1 },
    medianResponseHours: null,
    sustainerMrr: null,
    sustainerCount: null,
    verifiedMembers: 3000,
  },
  triage: {
    emergencies: 1,
    openReports: 5,
    pendingVerifications: 2,
    openAppeals: 1,
  },
  reportsByType: {
    weeks: [
      { weekStart: "2026-05-25", values: [1, 2, 1, 0] },
      { weekStart: "2026-06-01", values: [0, 1, 2, 1] },
      { weekStart: "2026-06-08", values: [1, 1, 0, 1] },
      { weekStart: "2026-06-15", values: [2, 0, 1, 0] },
      { weekStart: "2026-06-22", values: [0, 2, 1, 1] },
      { weekStart: "2026-06-29", values: [1, 1, 1, 0] },
      { weekStart: "2026-07-06", values: [0, 1, 0, 2] },
      { weekStart: "2026-07-13", values: [1, 0, 2, 1] },
    ],
  },
  memberGrowth: {
    points: [
      { at: "2026-06-01T00:00:00.000Z", joined: 120, churned: null, spike: false },
      { at: "2026-07-01T00:00:00.000Z", joined: 150, churned: null, spike: false },
    ],
  },
  responseTime: null,
  feed: [
    {
      id: "e1",
      type: "report_resolved",
      actor: null,
      target: null,
      community: "Trans & Friends",
      count: null,
      at: "2026-07-21T09:00:00.000Z",
      route: "/admin/moderation",
    },
    {
      id: "e2",
      type: "member_joined",
      actor: "Sam R.",
      target: null,
      community: "Queer Creatives",
      count: null,
      at: "2026-07-21T08:00:00.000Z",
      route: "/admin/members",
    },
  ],
};

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useAdminOverview: useAdminOverviewLive } = await import(
    "./useAdminOverview"
  );
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  // Imported after resetModules like the others: a statically-imported provider
  // would hold a different I18nContext instance than the freshly-imported
  // useAdminOverview resolves, so useTranslation/useFormat wouldn't find it.
  const { I18nProvider } = await import("../../../app/providers/I18nProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <DemoModeProvider>{children}</DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { useAdminOverview: useAdminOverviewLive, wrapper };
}

describe("useAdminOverview (live mode via MSW)", () => {
  it("fetches GET /admin/overview and returns the adapted dashboard shape", async () => {
    server.use(
      http.get(`${API}/admin/overview`, () =>
        HttpResponse.json(MINIMAL_OVERVIEW_DTO),
      ),
    );

    const { useAdminOverview: useAdminOverviewLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useAdminOverviewLive(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const overview = result.current.data;
    expect(overview).toBeDefined();

    // 1 · hero stat tiles — 4 tiles, "not measured yet" flagged for the 2
    // null-backed metrics.
    expect(overview!.metrics).toHaveLength(4);
    expect(overview!.metrics[2]!.notMeasured).toBe(true); // medianResponse
    expect(overview!.metrics[3]!.notMeasured).toBe(true); // sustainerMrr

    // 2 · triage queue — 4 rows, live counts overriding the fixture rows.
    expect(overview!.triage).toHaveLength(4);
    expect(overview!.triage[0]!.count).toBe(1);

    // 3 · reports-by-type chart — 8 weeks, unchanged legend series.
    expect(overview!.reportWeeks).toHaveLength(8);
    expect(overview!.reportWeeks[7]!.week).toBe("this");
    expect(overview!.reportWeeks[6]!.week).toBe("last");
    expect(overview!.reportSeries).toBe(REPORT_SERIES);

    // 4 · member growth — passed through 1:1 with null churn preserved.
    expect(overview!.memberGrowth).toHaveLength(2);
    expect(overview!.memberGrowth[0]!.churned).toBeNull();

    // 5 · response-time distribution — null response time → null dist.
    expect(overview!.responseDist).toBeNull();

    // 6 · activity feed — 2 rows, report_resolved's anonymous-actor branch.
    expect(overview!.feed).toHaveLength(2);
    expect(overview!.feed[0]!.tone).toBe("jade");
    expect(overview!.feed[0]!.em).toBe("Trans & Friends");
    expect(overview!.feed[1]!.lead).toBe("Sam R.");
  });
});

describe("useAdminOverview (demo mode)", () => {
  it("returns the assembled fixtures and issues no request in demo mode", async () => {
    // No handler is registered for GET /admin/overview in this test —
    // `onUnhandledRequest: "error"` above means any request at all, mocked or
    // not, throws and fails the test, so a passing result here proves the
    // network was never touched.
    const { result } = renderHook(() => useAdminOverview(), {
      wrapper: TestProviders,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({
      metrics: METRICS,
      triage: TRIAGE_QUEUE,
      reportWeeks: REPORT_WEEKS,
      reportSeries: REPORT_SERIES,
      memberGrowth: MEMBER_GROWTH,
      responseDist: RESPONSE_DIST,
      feed: ACTIVITY_FEED,
    });
  });
});
