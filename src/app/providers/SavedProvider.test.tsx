import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * The signed-in member the auth mock below reports. The session-bootstrap cache
 * key carries it (see `sessionBootstrapQueryKey`), so the pre-seeded entry has
 * to be written under the same id the provider will read with.
 */
const MEMBER_ID = "member-tiago";

const savedPage = {
  items: [
    {
      id: "article:one",
      kind: "article",
      title: "One",
      savedAt: "2026-01-01T00:00:00Z",
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
};

async function loadLiveSaved(client: QueryClient) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://localhost:3000");
  vi.stubEnv("VITE_DEMO", "");

  const getSaved = vi.fn();
  vi.doMock("../../features/members/api/saved.api", async () => ({
    ...(await vi.importActual("../../features/members/api/saved.api")),
    getSaved,
  }));
  vi.doMock("./authContext", () => ({
    useAuth: () => ({
      loggedIn: true,
      user: { id: MEMBER_ID, profile: { slug: "tiago-costa" } },
    }),
  }));

  const { SavedProvider } = await import("./SavedProvider");
  const { useSaved } = await import("./useSaved");
  const { DemoModeProvider } = await import("./DemoModeProvider");
  const { I18nProvider } = await import("./I18nProvider");
  const { ToastProvider } =
    await import("../../shared/components/feedback/ToastProvider");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <ToastProvider>
          <DemoModeProvider>
            <SavedProvider>{children}</SavedProvider>
          </DemoModeProvider>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { useSaved, wrapper, getSaved };
}

/**
 * Variant of `loadLiveSaved` for the fallback path: no bootstrap data is
 * pre-seeded, and `getBootstrap` itself is mocked to reject, so
 * `useSessionBootstrap`'s query runs for real and settles with `isError: true`
 * and no data — simulating a 404 (frontend ahead of backend), a 500, or a
 * member with no profile row.
 */
async function loadLiveSavedBootstrapError(client: QueryClient) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://localhost:3000");
  vi.stubEnv("VITE_DEMO", "");

  const getSaved = vi.fn().mockResolvedValue(savedPage);
  vi.doMock("../../features/members/api/saved.api", async () => ({
    ...(await vi.importActual("../../features/members/api/saved.api")),
    getSaved,
  }));
  vi.doMock("../../shared/api/bootstrap.api", async () => ({
    ...(await vi.importActual("../../shared/api/bootstrap.api")),
    getBootstrap: vi.fn().mockRejectedValue(new Error("bootstrap unavailable")),
  }));
  vi.doMock("./authContext", () => ({
    useAuth: () => ({
      loggedIn: true,
      user: { id: MEMBER_ID, profile: { slug: "tiago-costa" } },
    }),
  }));

  const { SavedProvider } = await import("./SavedProvider");
  const { useSaved } = await import("./useSaved");
  const { DemoModeProvider } = await import("./DemoModeProvider");
  const { I18nProvider } = await import("./I18nProvider");
  const { ToastProvider } =
    await import("../../shared/components/feedback/ToastProvider");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <ToastProvider>
          <DemoModeProvider>
            <SavedProvider>{children}</SavedProvider>
          </DemoModeProvider>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { useSaved, wrapper, getSaved };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("SavedProvider (live mode)", () => {
  it("hydrates from the bootstrap payload without calling getSaved", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    client.setQueryData(["bootstrap", false, MEMBER_ID], {
      profile: { slug: "tiago-costa", limited: false },
      saved: savedPage,
      blocks: { items: [], total: 0, page: 1, pageSize: 20 },
      mutes: { items: [], total: 0, page: 1, pageSize: 20 },
    });

    const { useSaved, wrapper, getSaved } = await loadLiveSaved(client);
    const { result } = renderHook(() => useSaved(), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.isSaved("article:one")).toBe(true);
    expect(getSaved).not.toHaveBeenCalled();
  });

  it("falls back to getSaved when the bootstrap query settles in error", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    // No bootstrap data seeded: the real (mocked-to-reject) getBootstrap
    // runs, so the query settles with isError: true and no data — this is what
    // must trigger the fallback. Without it, `items` would stay empty forever
    // and this assertion would time out.

    const { useSaved, wrapper, getSaved } =
      await loadLiveSavedBootstrapError(client);
    const { result } = renderHook(() => useSaved(), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.isSaved("article:one")).toBe(true);
    expect(getSaved).toHaveBeenCalledTimes(1);
  });
});
