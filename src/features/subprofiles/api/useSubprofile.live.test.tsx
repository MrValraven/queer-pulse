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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../../test/msw/server";
import { API } from "../../../test/msw/handlers";
import { TestProviders } from "../../../test/TestProviders";
// Static imports share their module graph — and DemoModeContext instance — with
// the statically-imported TestProviders, both resolved under vitest.config's
// demo env. The demo suites below use these; the live suites re-import after
// `vi.resetModules()` so config.ts re-freezes the API base from the stub.
import { useSubprofile } from "./useSubprofile";
import { useSubprofileDirectory } from "./useSubprofileDirectory";

/**
 * LIVE-mode read suite for the subprofiles data hooks, driven through the
 * pre-registered subprofile MSW handlers (they already serve
 * GET /subprofiles/:id, /subprofiles/mine and /subprofiles/directory off the
 * demo mock registry). Each live test proves the demo→live branch actually hits
 * the network and runs the DTO through the adapters; each paired demo test
 * registers no extra handler, so with `onUnhandledRequest: "error"` any network
 * call would throw — a passing demo test proves demo touches no network.
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
  const { useSubprofile: useSubprofileLive } = await import("./useSubprofile");
  const { useSubprofiles: useSubprofilesLive } = await import("./useSubprofiles");
  const { useSubprofileDirectory: useSubprofileDirectoryLive } = await import(
    "./useSubprofileDirectory"
  );
  // Imported after the reset so its DemoModeContext instance matches the freshly
  // re-imported hooks (a static provider would hold a different context object).
  const { DemoModeProvider } = await import(
    "../../../app/providers/DemoModeProvider"
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  return {
    useSubprofile: useSubprofileLive,
    useSubprofiles: useSubprofilesLive,
    useSubprofileDirectory: useSubprofileDirectoryLive,
    wrapper,
  };
}

describe("useSubprofile (live mode via MSW)", () => {
  it("fetches GET /subprofiles/:id and returns the adapted owner view", async () => {
    const { useSubprofile: useSubprofileLive, wrapper } = await loadLive();
    const { result } = renderHook(
      () => useSubprofileLive("sp-diogo-nightform"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const view = result.current.data;
    expect(view).not.toBeNull();
    expect(view!.displayName).toBe("NIGHTFORM");
    expect(view!.kind).toBe("musician");
    // Adapter found the single featured item across sections.
    expect(view!.featured?.title).toBe("Threshold EP");
  });
});

describe("useSubprofile (demo mode)", () => {
  it("resolves the mock registry and issues no request", async () => {
    const { result } = renderHook(() => useSubprofile("sp-diogo-nightform"), {
      wrapper: TestProviders,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.displayName).toBe("NIGHTFORM");
  });

  it("returns null for an unknown id without touching the network", async () => {
    const { result } = renderHook(() => useSubprofile("sp-does-not-exist"), {
      wrapper: TestProviders,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
  });
});

describe("useSubprofiles (live mode via MSW)", () => {
  it("fetches GET /subprofiles/mine and adapts the owner's personas", async () => {
    const { useSubprofiles: useSubprofilesLive, wrapper } = await loadLive();
    const { result } = renderHook(() => useSubprofilesLive(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // The demo registry attaches exactly one persona to the current user.
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0]!.displayName).toBe("Tiago Costa");
    expect(result.current.data![0]!.status).toBe("draft");
  });

  it("skips the query entirely when disabled (visitor-safe)", async () => {
    const { useSubprofiles: useSubprofilesLive, wrapper } = await loadLive();
    const { result } = renderHook(
      () => useSubprofilesLive({ enabled: false }),
      { wrapper },
    );
    // Disabled query never fetches — no GET /subprofiles/mine, so the
    // onUnhandledRequest guard is never tripped and data stays undefined.
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });
});

describe("useSubprofileDirectory (live mode via MSW)", () => {
  it("fetches GET /subprofiles/directory with no kind/query network params — Personas Phase 4 filters family/tags/search client-side over the full set", async () => {
    const { useSubprofileDirectory: useDirectoryLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useDirectoryLive(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Previously "nightform" (musician) and "grain-studio" only turned up under
    // a narrowing kind/query param — now the fetch is unfiltered, so both are
    // present in the same response.
    const handles = result.current.data!.map((card) => card.handle);
    expect(handles).toContain("nightform");
    expect(handles).toContain("grain-studio");
  });
});

describe("useSubprofileDirectory (demo mode)", () => {
  it("resolves the full mock registry with no network call", async () => {
    const { result } = renderHook(() => useSubprofileDirectory(), {
      wrapper: TestProviders,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const handles = result.current.data!.map((card) => card.handle);
    expect(handles).toContain("nightform");
    expect(handles).toContain("grain-studio");
  });
});
