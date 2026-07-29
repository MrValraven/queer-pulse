import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

async function loadLiveVouch(getGivenVouches: ReturnType<typeof vi.fn>) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://localhost:3000");
  vi.stubEnv("VITE_DEMO", "");

  vi.doMock("../../features/members/api/members.api", async () => ({
    ...(await vi.importActual("../../features/members/api/members.api")),
    getGivenVouches,
  }));
  vi.doMock("./authContext", () => ({
    useAuth: () => ({
      loggedIn: true,
      refresh: vi.fn(),
      user: { profile: { slug: "me" } },
    }),
  }));

  const { DemoModeProvider } = await import("./DemoModeProvider");
  const mod = await import("./VouchProvider");
  // `useVouch` / `useVouchActions` live in the colocated hook module, which
  // `VouchProvider` imports the shared context from. After `vi.resetModules()`
  // both are re-instantiated together, so they share one fresh context.
  const hooks = await import("./useVouch");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>
        <mod.VouchProvider>{children}</mod.VouchProvider>
      </DemoModeProvider>
    </QueryClientProvider>
  );
  return { ...mod, ...hooks, wrapper };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.unstubAllEnvs();
});

describe("VouchProvider (live mode)", () => {
  it("useVouchActions does not fetch /me/vouches/given", async () => {
    const getGivenVouches = vi.fn();
    const { useVouchActions, wrapper } = await loadLiveVouch(getGivenVouches);

    const { result } = renderHook(() => useVouchActions(), { wrapper });

    expect(typeof result.current.openVouch).toBe("function");
    expect(getGivenVouches).not.toHaveBeenCalled();
  });

  it("useVouch fetches and hydrates the persisted list", async () => {
    const getGivenVouches = vi.fn(() =>
      Promise.resolve([{ slug: "ana-lopes" }, { slug: "rui-mendes" }]),
    );
    const { useVouch, wrapper } = await loadLiveVouch(getGivenVouches);

    const { result } = renderHook(() => useVouch(), { wrapper });

    await waitFor(() => expect(result.current.vouched).toHaveLength(2));
    expect(result.current.hasVouched("ana-lopes")).toBe(true);
    expect(result.current.hasVouched("nobody")).toBe(false);
  });
});
