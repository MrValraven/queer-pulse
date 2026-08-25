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
import { server } from "../../test/msw/server";

/**
 * LIVE-mode suite for the status hook itself.
 *
 * SignInPage.closed.test.tsx mocks usePlatformStatus wholesale, so it pins the
 * *component's* handling of `data: undefined` — it cannot catch a regression
 * inside the hook. Someone adding `initialData` (a "safe" default that would
 * silently assert "open" or, worse, "closed") or dropping `retry: false` would
 * break fail-open with every one of those tests still green. Everything about
 * the closed states rides on this hook, so it gets its own test.
 *
 * Modules are reset + re-imported per test so config.ts re-freezes
 * API_BASE_URL from the stubbed VITE_API_URL (same convention as
 * useJobs.live.test.tsx).
 */

// The backend ORIGIN — what the client reads as its base from VITE_API_URL.
const API = "http://api.test";
// That origin under the client's URI version prefix. The client prefixes every
// call through its generic `request()` builder with `/v1`, so the handler must
// be registered there to match the real GET it fires (see client.ts).
const API_V1 = `${API}/v1`;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { usePlatformStatus } = await import("./usePlatformStatus");
  const { DemoModeProvider } =
    await import("../../app/providers/DemoModeProvider");
  // Retries are left ON at the client level on purpose: the assertion that the
  // endpoint is hit exactly once is only meaningful if the *hook's* own
  // `retry: false` is what stops it. A retry-free client (as TestProviders
  // mints) would make this pass no matter what the hook said.
  const client = new QueryClient({
    defaultOptions: { queries: { retry: 3, retryDelay: 1 } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  return { usePlatformStatus, wrapper, client };
}

describe("usePlatformStatus (live mode via MSW)", () => {
  it("fails open on a broken endpoint: no retry, and `data` stays undefined", async () => {
    let calls = 0;
    server.use(
      http.get(`${API_V1}/platform-status`, () => {
        calls += 1;
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const { usePlatformStatus, wrapper } = await loadLive();
    const { result } = renderHook(() => usePlatformStatus(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // The contract every consumer leans on: an errored read is indistinguishable
    // from a still-loading one, and both mean "assume open". An `initialData`
    // default would put a concrete object here and break that.
    expect(result.current.data).toBeUndefined();
    // One attempt only. A status endpoint that is briefly unreachable must not
    // turn a single sign-in page view into a burst of failing requests.
    expect(calls).toBe(1);
  });

  it("returns the server's flags when the endpoint answers", async () => {
    server.use(
      http.get(`${API_V1}/platform-status`, () =>
        HttpResponse.json({
          registrationOpen: false,
          joinRequestsOpen: true,
          locked: false,
          lockdownMessage: null,
          registrationClosedMessage: "We paused signups for a bit.",
        }),
      ),
    );

    const { usePlatformStatus, wrapper } = await loadLive();
    const { result } = renderHook(() => usePlatformStatus(), { wrapper });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.registrationOpen).toBe(false);
    expect(result.current.data?.registrationClosedMessage).toBe(
      "We paused signups for a bit.",
    );
  });

  it("carries meta.silentError, so a flaky read never toasts at a visitor", async () => {
    let calls = 0;
    server.use(
      http.get(`${API_V1}/platform-status`, () => {
        calls += 1;
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const { usePlatformStatus, wrapper, client } = await loadLive();
    const { result } = renderHook(() => usePlatformStatus(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // The flag lives on the query, and handleQueryError (which runs outside
    // React, on the shared QueryCache) reads it off the query it is handed —
    // so this is where it can be asserted. errorHandling.test.ts covers the
    // other half: that the handler actually honours it.
    const cached = client
      .getQueryCache()
      .getAll()
      .find((q) => q.queryKey[0] === "platform-status");
    expect(cached?.meta).toEqual({ silentError: true });
    expect(calls).toBe(1);
  });
});
