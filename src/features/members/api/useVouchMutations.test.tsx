import { act, renderHook, waitFor } from "@testing-library/react";
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
import { useCallback, useState, type ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../../test/msw/server";
import { API, API_V1 } from "../../../test/msw/handlers";

/**
 * LIVE-mode suite for the withdraw-vouch mutation's error handling, mirroring
 * `useVouchMember.test.tsx`'s loader: `VITE_API_URL` is stubbed to a real
 * value so `apiAvailable` is true (demo OFF) and MSW serves DELETE
 * `/members/:slug/vouch`. Modules are reset + re-imported per test so
 * `config.ts` re-freezes `API_BASE_URL` from the stub.
 *
 * A small harness hook stands in for `VouchProvider`: real `useState` for
 * `vouched`, so the optimistic removal (and whether it gets rolled back) is
 * observable the same way it is for the real provider, a step up from a
 * `vi.fn()` that only records calls.
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

async function loadLive(initialVouched: string[]) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useVouchMutations } = await import("./useVouchMutations");
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

  function useHarness() {
    const [vouched, setVouched] = useState<string[]>(initialVouched);
    const refresh = useCallback(() => {}, []);
    const { removeVouch } = useVouchMutations({ setVouched, refresh });
    return { vouched, removeVouch };
  }

  return { useHarness, wrapper };
}

describe("useVouchMutations withdraw, 404 handling", () => {
  it("treats a 404 ('No vouch to withdraw') as success: keeps the removal, reports true", async () => {
    server.use(
      http.delete(`${API_V1}/members/marco-vieira/vouch`, () =>
        HttpResponse.json(
          { statusCode: 404, message: "No vouch to withdraw" },
          { status: 404 },
        ),
      ),
    );
    const { useHarness, wrapper } = await loadLive(["marco-vieira"]);
    const { result } = renderHook(() => useHarness(), { wrapper });
    const onSettled = vi.fn();

    act(() => result.current.removeVouch("marco-vieira", onSettled));

    await waitFor(() => expect(onSettled).toHaveBeenCalled());

    expect(onSettled).toHaveBeenCalledWith(true);
    // Not rolled back: the vouch was already gone server-side, so the
    // optimistic removal stands exactly as a real success would leave it.
    expect(result.current.vouched).toEqual([]);
  });

  it("still rolls back and reports failure for a non-404 error", async () => {
    server.use(
      http.delete(`${API_V1}/members/marco-vieira/vouch`, () =>
        HttpResponse.json(
          { statusCode: 500, message: "Server error" },
          {
            status: 500,
          },
        ),
      ),
    );
    const { useHarness, wrapper } = await loadLive(["marco-vieira"]);
    const { result } = renderHook(() => useHarness(), { wrapper });
    const onSettled = vi.fn();

    act(() => result.current.removeVouch("marco-vieira", onSettled));

    await waitFor(() => expect(onSettled).toHaveBeenCalled());

    expect(onSettled).toHaveBeenCalledWith(false);
    // Rolled back: a real failure must leave the vouch standing.
    expect(result.current.vouched).toEqual(["marco-vieira"]);
  });
});
