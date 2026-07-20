import { renderHook, act, waitFor } from "@testing-library/react";
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/msw/server";
import { API } from "../../../test/msw/handlers";

const STORAGE_KEY = "qp-employer-affiliation";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

/** Demo mode: the suite default (empty VITE_API_URL). No network at all. */
async function loadDemo() {
  vi.resetModules();
  const { DemoModeProvider } = await import(
    "../../../app/providers/DemoModeProvider"
  );
  const { AuthProvider } = await import("../../../app/providers/AuthProvider");
  const { EmployerAffiliationProvider } = await import(
    "../../../app/providers/EmployerAffiliationProvider"
  );
  const mod = await import("./useEmployerAffiliation");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>
        <AuthProvider>
          <EmployerAffiliationProvider>{children}</EmployerAffiliationProvider>
        </AuthProvider>
      </DemoModeProvider>
    </QueryClientProvider>
  );
  return { ...mod, wrapper };
}

/** Live mode: VITE_API_URL stubbed, auth stubbed logged-in, MSW serving. */
async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  vi.doMock("../../../app/providers/authContext", () => ({
    useAuth: () => ({ loggedIn: true, user: null }),
  }));
  const { DemoModeProvider } = await import(
    "../../../app/providers/DemoModeProvider"
  );
  const { EmployerAffiliationProvider } = await import(
    "../../../app/providers/EmployerAffiliationProvider"
  );
  const mod = await import("./useEmployerAffiliation");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>
        <EmployerAffiliationProvider>{children}</EmployerAffiliationProvider>
      </DemoModeProvider>
    </QueryClientProvider>
  );
  return { ...mod, wrapper };
}

describe("useEmployerAffiliation (demo mode)", () => {
  it("seeds from localStorage and never fetches", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ companySlug: "atelier-pulso", role: "Founder" }),
    );
    const { useEmployerAffiliation, wrapper } = await loadDemo();
    const { result } = renderHook(() => useEmployerAffiliation(), { wrapper });

    expect(result.current.affiliation?.companySlug).toBe("atelier-pulso");
    // A disabled query is not "loading" — the gate must never trap the page.
    expect(result.current.isLoading).toBe(false);
  });

  it("grants instantly and persists, and clearing removes the key", async () => {
    const { useEmployerAffiliation, wrapper } = await loadDemo();
    const { result } = renderHook(() => useEmployerAffiliation(), { wrapper });

    act(() => result.current.affiliate("casa-viva", "Hiring lead"));
    expect(result.current.affiliation).toEqual({
      companySlug: "casa-viva",
      role: "Hiring lead",
      status: "active",
    });
    await waitFor(() =>
      expect(window.localStorage.getItem(STORAGE_KEY)).toContain("casa-viva"),
    );

    act(() => result.current.clearAffiliation());
    expect(result.current.affiliation).toBeNull();
    await waitFor(() =>
      expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull(),
    );
  });
});

describe("useEmployerAffiliation (live mode via MSW)", () => {
  it("returns server truth when no local decision has been made", async () => {
    server.use(
      http.get(`${API}/me/affiliation`, () =>
        HttpResponse.json({
          companySlug: "atelier-pulso",
          company: { nameText: "Atelier Pulso" },
          role: "Founder",
          status: "active",
        }),
      ),
    );
    const { useEmployerAffiliation, wrapper } = await loadLive();
    const { result } = renderHook(() => useEmployerAffiliation(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.affiliation).toEqual({
      companySlug: "atelier-pulso",
      role: "Founder",
      status: "active",
    });
  });

  it("ignores a stale localStorage entry — the server owns live truth", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ companySlug: "old-employer", role: "Founder" }),
    );
    server.use(
      http.get(`${API}/me/affiliation`, () => HttpResponse.json(null)),
    );
    const { useEmployerAffiliation, wrapper } = await loadLive();
    const { result } = renderHook(() => useEmployerAffiliation(), { wrapper });

    // Never shows "old-employer", not even for one render.
    expect(result.current.affiliation).toBeNull();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.affiliation).toBeNull();
  });

  it("keeps an optimistic clear even though the server still says otherwise", async () => {
    server.use(
      http.get(`${API}/me/affiliation`, () =>
        HttpResponse.json({
          companySlug: "atelier-pulso",
          company: { nameText: "Atelier Pulso" },
          role: "Founder",
          status: "active",
        }),
      ),
      http.delete(`${API}/me/affiliation`, () => new HttpResponse(null, { status: 204 })),
    );
    const { useEmployerAffiliation, wrapper } = await loadLive();
    const { result } = renderHook(() => useEmployerAffiliation(), { wrapper });

    await waitFor(() =>
      expect(result.current.affiliation?.companySlug).toBe("atelier-pulso"),
    );
    act(() => result.current.clearAffiliation());

    // The `null` arm of the overlay tri-state: a `??` merge would resurrect the
    // server value here, which is the bug this test exists to catch.
    await waitFor(() => expect(result.current.affiliation).toBeNull());
    expect(result.current.affiliation).toBeNull();
  });

  it("useEmployerAffiliationActions does not fetch", async () => {
    const seen: string[] = [];
    server.events.on("request:start", ({ request }) => {
      seen.push(new URL(request.url).pathname);
    });
    const { useEmployerAffiliationActions, wrapper } = await loadLive();
    renderHook(() => useEmployerAffiliationActions(), { wrapper });

    // No handler is registered for /me/affiliation here on purpose: with
    // `onUnhandledRequest: "error"` a leaked subscription throws loudly rather
    // than quietly returning a mocked 200.
    await waitFor(() => expect(seen).not.toContain("/me/affiliation"));
    server.events.removeAllListeners("request:start");
  });
});
