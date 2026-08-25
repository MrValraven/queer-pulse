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
import { DEMO_BOTS } from "../adminBots.data";
// Static import → shares DemoModeContext with TestProviders (demo ON by default).
import { useAdminBots } from "./useAdminBots";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());
beforeEach(() => window.localStorage.clear());

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useAdminBots: useAdminBotsLive } = await import("./useAdminBots");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  return { useAdminBotsLive, wrapper };
}

describe("useAdminBots", () => {
  it("returns the local fixture in demo mode without a request", async () => {
    const { result } = renderHook(() => useAdminBots(), {
      wrapper: TestProviders,
    });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toEqual(DEMO_BOTS);
  });

  it("fetches GET /admin/bots in live mode", async () => {
    const { useAdminBotsLive, wrapper } = await loadLive();
    const { result } = renderHook(() => useAdminBotsLive(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0]!.slug).toBe("queerpulse");
  });
});
