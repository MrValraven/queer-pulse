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
import { COMMUNITIES } from "../adminCommunities.data";
// Statically imported (unlike the live-mode hook below, which is re-imported
// per test via `loadLive()`) so this shares its module graph — and therefore
// its `DemoModeContext`/`I18nContext` instances — with `TestProviders`, which
// is also a static import. Both were resolved once, at this file's initial
// load, against vitest.config.ts's default env (`VITE_API_URL: ""`,
// `VITE_DEMO: "1"`), which is exactly what forces demo mode on (see
// `TestProviders`'s docblock). A `vi.resetModules()` call inside a later
// live-mode test only affects *future* dynamic `import()`s, not this
// already-bound top-level binding.
import { useAdminCommunities } from "./useAdminCommunities";

/**
 * LIVE-mode suite: proves the demo→live branch of useAdminCommunities actually
 * hits the network and adapts the DTO, PLUS a demo-mode suite proving the
 * inverse — that demo mode never touches the network at all. That second half
 * is the entire point of this task: the admin communities tab used to render
 * a hardcoded fixture in every mode, so fabricated data could appear as
 * platform truth even when nobody turned "Populate platform" on.
 *
 * VITE_API_URL is stubbed to a real value in the live-mode tests so
 * `apiAvailable` is true (demo OFF) and MSW serves GET /admin/communities.
 * Modules are reset + re-imported per test so config.ts re-freezes
 * API_BASE_URL from the stub — see useJobs.live.test.tsx, which this mirrors.
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

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useAdminCommunities: useAdminCommunitiesLive } = await import(
    "./useAdminCommunities"
  );
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  // Imported after resetModules like the others: a statically-imported provider
  // would hold a different I18nContext instance than the freshly-imported
  // useAdminCommunities resolves, so useTranslation/useFormat wouldn't find it.
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
  return { useAdminCommunities: useAdminCommunitiesLive, wrapper };
}

describe("useAdminCommunities (live mode via MSW)", () => {
  it("fetches GET /admin/communities and returns adapted communities", async () => {
    const { useAdminCommunities: useAdminCommunitiesLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useAdminCommunitiesLive(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const communities = result.current.data ?? [];
    expect(communities).toHaveLength(1);
    const community = communities[0]!;
    // The DTO ran through cardDtoToCommunity: formatted count, translated
    // activity label, health/breakdown carried through positionally.
    expect(community.slug).toBe("trans-friends");
    expect(community.name).toBe("Trans & Friends");
    expect(community.members).toBe("1,204");
    expect(community.activity).toBe("High");
    expect(community.health).toBe(94);
    expect(community.breakdown).toEqual([91, 100, null, 90]);
    // The card endpoint carries no moderator roster or scoped queue.
    expect(community.moderators).toEqual([]);
    expect(community.queue).toEqual([]);
  });

  it("returns an empty array when the platform has no communities", async () => {
    server.use(
      http.get(`${API}/admin/communities`, () => HttpResponse.json([])),
    );

    const { useAdminCommunities: useAdminCommunitiesLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useAdminCommunitiesLive(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
  });
});

describe("useAdminCommunities (demo mode)", () => {
  it("returns the mock fixture and issues no request in demo mode", async () => {
    // The whole point of the change: fabricated communities must never appear
    // as platform truth unless the operator turned "Populate platform" on.
    // No handler is registered for GET /admin/communities in this test —
    // `onUnhandledRequest: "error"` above means any request at all, mocked or
    // not, throws and fails the test, so a passing result here proves the
    // network was never touched.
    const { result } = renderHook(() => useAdminCommunities(), {
      wrapper: TestProviders,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(COMMUNITIES);
  });
});
