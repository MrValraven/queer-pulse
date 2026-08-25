import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const DTO = {
  id: "server-1",
  kind: "PITCH",
  kindVariant: "pitch" as const,
  title: "From the server",
  desc: "Synced",
  progress: 40,
};

async function loadLiveDrafts(getDrafts: ReturnType<typeof vi.fn>) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://localhost:3000");
  vi.stubEnv("VITE_DEMO", "");

  vi.doMock("../../features/members/api/drafts.api", async () => ({
    ...(await vi.importActual("../../features/members/api/drafts.api")),
    getDrafts,
  }));
  vi.doMock("./authContext", () => ({
    useAuth: () => ({ loggedIn: true, user: { profile: { slug: "me" } } }),
  }));

  const { DemoModeProvider } = await import("./DemoModeProvider");
  const { I18nProvider } = await import("./I18nProvider");
  const { ToastProvider } =
    await import("../../shared/components/feedback/ToastProvider");
  const mod = await import("./DraftsProvider");
  const hooks = await import("./useDrafts");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // DemoModeProvider is required, not optional: DraftsProvider calls
  // useDemoMode() unconditionally and throws without it. It resolves to LIVE
  // here because the loader stubbed VITE_API_URL/VITE_DEMO above. I18nProvider
  // and ToastProvider are likewise required: the rollback path surfaces a toast.
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <ToastProvider>
          <DemoModeProvider>
            <mod.DraftsProvider>{children}</mod.DraftsProvider>
          </DemoModeProvider>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { ...mod, ...hooks, wrapper };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.unstubAllEnvs();
});

describe("DraftsProvider (live mode)", () => {
  it("useDraftsActions does not fetch /me/drafts", async () => {
    const getDrafts = vi.fn();
    const { useDraftsActions, wrapper } = await loadLiveDrafts(getDrafts);

    const { result } = renderHook(() => useDraftsActions(), { wrapper });

    expect(typeof result.current.addDraft).toBe("function");
    // The whole point of the actions/read split: a write-only consumer must
    // not resurrect the eager request.
    expect(getDrafts).not.toHaveBeenCalled();
  });

  it("useDrafts fetches and hydrates the store", async () => {
    const getDrafts = vi.fn(() =>
      Promise.resolve({
        items: [DTO],
        total: 1,
        page: 1,
        pageSize: 20,
      }),
    );
    const { useDrafts, wrapper } = await loadLiveDrafts(getDrafts);

    const { result } = renderHook(() => useDrafts(), { wrapper });

    await waitFor(() => expect(result.current.drafts).toHaveLength(1));
    expect(result.current.drafts[0]!.id).toBe("server-1");
    // Lossy-by-design: ReactNode fields don't survive the wire.
    expect(result.current.drafts[0]!.meta).toEqual([]);
    expect(result.current.drafts[0]!.actions).toEqual([]);
  });
});
