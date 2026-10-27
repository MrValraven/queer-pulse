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
import {
  buildDemoFeatureUsage,
  buildDemoFeatureUsageDetail,
} from "../adminFeatureUsageDemo";
import { FEATURE_USAGE_PRESET_RANGE_DAYS } from "../featureUsageRange";
import type { AdminFeatureUsageDetailDTO } from "./adminFeatureUsage.api";
// Statically imported for the demo suite; see useAdminFeatureUsage.test.ts
// for why this binding stays in demo mode while `loadLive()` re-imports.
import { useAdminFeatureUsageDetail } from "./useAdminFeatureUsageDetail";

/**
 * LIVE-mode suite: the detail hook requests
 * `GET /admin/feature-usage/:featureKey/detail` with the range parameters and
 * only when enabled. Demo suite: the hook builds the fixture with no request,
 * and the demo builders keep their invariants (deterministic, one value per
 * day, created per day summing to the main fixture's depth).
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

const PRESET_30 = { kind: "preset", rangeDays: 30 } as const;
const FIXED_NOW = new Date("2026-10-26T15:00:00Z");

const FORUM_DETAIL_DTO: AdminFeatureUsageDetailDTO = {
  featureKey: "forum",
  rangeDays: 30,
  rangeStart: "2026-09-26",
  rangeEnd: "2026-10-25",
  createdDaily: Array.from({ length: 30 }, (_unused, index) => index % 3),
};

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useAdminFeatureUsageDetail: useDetailLive } =
    await import("./useAdminFeatureUsageDetail");
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
  return { useDetailLive, wrapper };
}

describe("useAdminFeatureUsageDetail (live mode via MSW)", () => {
  it("fetches the forum detail with the range and returns createdDaily", async () => {
    const requestedUrls: URL[] = [];
    server.use(
      http.get(`${API_V1}/admin/feature-usage/forum/detail`, ({ request }) => {
        requestedUrls.push(new URL(request.url));
        return HttpResponse.json(FORUM_DETAIL_DTO);
      }),
    );

    const { useDetailLive, wrapper } = await loadLive();
    const { result } = renderHook(
      () => useDetailLive("forum", PRESET_30, { isEnabled: true }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(requestedUrls[0]?.searchParams.get("rangeDays")).toBe("30");
    expect(result.current.createdDaily).toEqual(FORUM_DETAIL_DTO.createdDaily);
    expect(result.current.errorCode).toBeNull();
  });

  it("issues no request while disabled", async () => {
    // No handler is registered: any request fails the test.
    const { useDetailLive, wrapper } = await loadLive();
    const { result } = renderHook(
      () => useDetailLive("forum", PRESET_30, { isEnabled: false }),
      { wrapper },
    );
    expect(result.current.createdDaily).toBeNull();
    expect(result.current.isError).toBe(false);
  });

  it("names a feature that is never measured", async () => {
    server.use(
      http.get(`${API_V1}/admin/feature-usage/messages/detail`, () =>
        HttpResponse.json(
          {
            statusCode: 404,
            error: "Not Found",
            code: "feature_usage_feature_not_tracked",
            message: "messages is never measured",
          },
          { status: 404 },
        ),
      ),
    );

    const { useDetailLive, wrapper } = await loadLive();
    const { result } = renderHook(
      () => useDetailLive("messages", PRESET_30, { isEnabled: true }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorCode).toBe("featureNotTracked");
  });
});

describe("useAdminFeatureUsageDetail (demo mode)", () => {
  it("builds the forum fixture and issues no request", async () => {
    const { result } = renderHook(
      () => useAdminFeatureUsageDetail("forum", PRESET_30, { isEnabled: true }),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.createdDaily).toHaveLength(30);
  });

  it("returns createdDaily null for the reach-only feed", async () => {
    const { result } = renderHook(
      () => useAdminFeatureUsageDetail("feed", PRESET_30, { isEnabled: true }),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.createdDaily).toBeNull();
  });
});

describe("demo feature usage builders", () => {
  const sum = (values: number[]) =>
    values.reduce((total, value) => total + value, 0);

  it("builds the same DTO twice for the same now", () => {
    expect(buildDemoFeatureUsage(PRESET_30, FIXED_NOW)).toEqual(
      buildDemoFeatureUsage(PRESET_30, FIXED_NOW),
    );
  });

  it("matches the worked example window", () => {
    const dto = buildDemoFeatureUsage(PRESET_30, FIXED_NOW);
    expect(dto.rangeStart).toBe("2026-09-26");
    expect(dto.rangeEnd).toBe("2026-10-25");
    expect(dto.previousRangeStart).toBe("2026-08-27");
    expect(dto.previousRangeEnd).toBe("2026-09-25");
  });

  it.each(FEATURE_USAGE_PRESET_RANGE_DAYS)(
    "keeps one value per day and matching sums over %i days",
    (rangeDays) => {
      const selection = { kind: "preset", rangeDays } as const;
      const dto = buildDemoFeatureUsage(selection, FIXED_NOW);
      for (const feature of dto.features) {
        expect(feature.reachDaily).toHaveLength(rangeDays);
        expect(feature.reachPreviousDaily).toHaveLength(rangeDays);
        expect(feature.reach).toBe(sum(feature.reachDaily));
        expect(feature.reachPrevious).toBe(sum(feature.reachPreviousDaily));
        const detail = buildDemoFeatureUsageDetail(
          feature.featureKey,
          selection,
          FIXED_NOW,
        );
        if (feature.depth === null) {
          expect(detail.createdDaily).toBeNull();
        } else {
          expect(sum(detail.createdDaily ?? [])).toBe(feature.depth);
        }
      }
    },
  );

  it("agrees with itself on days two overlapping ranges share", () => {
    const week = buildDemoFeatureUsage(
      { kind: "preset", rangeDays: 7 },
      FIXED_NOW,
    );
    const month = buildDemoFeatureUsage(PRESET_30, FIXED_NOW);
    const weekFeed = week.features.find((row) => row.featureKey === "feed");
    const monthFeed = month.features.find((row) => row.featureKey === "feed");
    expect(weekFeed?.reachDaily).toEqual(monthFeed?.reachDaily.slice(-7));
  });

  it("gives landlords and magazine real zero days over 90 days", () => {
    const dto = buildDemoFeatureUsage(
      { kind: "preset", rangeDays: 90 },
      FIXED_NOW,
    );
    for (const featureKey of ["landlords", "magazine"]) {
      const row = dto.features.find(
        (feature) => feature.featureKey === featureKey,
      );
      expect(row?.reachDaily).toContain(0);
    }
  });
});
