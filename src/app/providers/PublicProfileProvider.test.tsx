import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { PublicEligibilitySignalsDto } from "../../features/members/api/publicProfile.api";

const SIGNALS_DTO: PublicEligibilitySignalsDto = {
  verified: true,
  tenureDays: 400,
  publishedPieces: ["2026-07-01T00:00:00.000Z"],
  hostedOpenEvents: ["2026-06-01T00:00:00.000Z"],
  workshopsTaught: 2,
  publishedSubprofiles: 2,
  vouchCount: 4,
  vouchesGivenCount: 1,
  endorsementCount: 6,
  connectionCount: 12,
  eventsAttended: 6,
  communityPosts: 6,
  lastActiveDaysAgo: 0,
  standingOk: true,
};

/**
 * Demo mode is forced on by vitest.config's default env (`VITE_DEMO=1`, no
 * `VITE_API_URL`), so this loader mirrors that default explicitly rather than
 * relying on ambient state — no network module needs mocking, since demo mode
 * never fetches.
 */
async function loadDemoPublicProfile() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "");
  vi.stubEnv("VITE_DEMO", "1");

  const { DemoModeProvider } = await import("./DemoModeProvider");
  const { AuthProvider } = await import("./AuthProvider");
  const mod = await import("./PublicProfileProvider");
  const hooks = await import("./usePublicProfile");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // PublicProfileProvider calls useDemoMode()/useAuth() unconditionally, so
  // both real providers are required (demo mode never touches the network).
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>
        <AuthProvider>
          <mod.PublicProfileProvider>{children}</mod.PublicProfileProvider>
        </AuthProvider>
      </DemoModeProvider>
    </QueryClientProvider>
  );
  return { ...mod, ...hooks, wrapper };
}

/**
 * Live mode: stub the env so `DemoModeProvider` resolves to live, and mock
 * `authContext` directly (a logged-in member) rather than exercising the real
 * OAuth/session-bootstrap path — same shortcut `VouchProvider.test.tsx` and
 * `DraftsProvider.test.tsx` use. The API module is mocked so the eligibility
 * fetch is fully under the test's control, and the sibling visibility fetch
 * (`usePublicProfile()` also subscribes to `GET /me/public-profile`) resolves
 * to a harmless stub so it never hits the network either.
 */
async function loadLivePublicProfile(
  getPublicEligibilitySignals: ReturnType<typeof vi.fn>,
) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://localhost:3000");
  vi.stubEnv("VITE_DEMO", "");

  vi.doMock("../../features/members/api/publicProfile.api", async () => ({
    ...(await vi.importActual(
      "../../features/members/api/publicProfile.api",
    )),
    getPublicEligibilitySignals,
    getPublicProfileVisibility: vi.fn(async () => ({ enabled: false })),
  }));
  vi.doMock("./authContext", () => ({
    useAuth: () => ({ loggedIn: true, user: { profile: { slug: "me" } } }),
  }));

  const { DemoModeProvider } = await import("./DemoModeProvider");
  const mod = await import("./PublicProfileProvider");
  const hooks = await import("./usePublicProfile");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>
        <mod.PublicProfileProvider>{children}</mod.PublicProfileProvider>
      </DemoModeProvider>
    </QueryClientProvider>
  );
  return { ...mod, ...hooks, wrapper };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.unstubAllEnvs();
});

describe("PublicProfileProvider", () => {
  it("demo mode: eligibilityStatus is ready synchronously, no fetch involved", async () => {
    const { usePublicProfile, wrapper } = await loadDemoPublicProfile();

    const { result } = renderHook(() => usePublicProfile(), { wrapper });

    expect(result.current.eligibilityStatus).toBe("ready");
    expect(result.current.eligibility.eligible).toBe(true);
  });

  it("live mode: eligibilityStatus is loading, then ready with eligible:true once the DTO resolves", async () => {
    const getPublicEligibilitySignals = vi.fn(() =>
      Promise.resolve(SIGNALS_DTO),
    );
    const { usePublicProfile, wrapper } = await loadLivePublicProfile(
      getPublicEligibilitySignals,
    );

    const { result } = renderHook(() => usePublicProfile(), { wrapper });

    expect(result.current.eligibilityStatus).toBe("loading");
    expect(result.current.eligibility.eligible).toBe(false);

    await waitFor(() =>
      expect(result.current.eligibilityStatus).toBe("ready"),
    );
    expect(result.current.eligibility.eligible).toBe(true);
    expect(getPublicEligibilitySignals).toHaveBeenCalled();
  });

  it("live mode: eligibilityStatus becomes error when the fetch rejects, eligibility stays locked", async () => {
    const getPublicEligibilitySignals = vi.fn(() =>
      Promise.reject(new Error("network down")),
    );
    const { usePublicProfile, wrapper } = await loadLivePublicProfile(
      getPublicEligibilitySignals,
    );

    const { result } = renderHook(() => usePublicProfile(), { wrapper });

    expect(result.current.eligibilityStatus).toBe("loading");

    await waitFor(() =>
      expect(result.current.eligibilityStatus).toBe("error"),
    );
    expect(result.current.eligibility.eligible).toBe(false);
  });
});
