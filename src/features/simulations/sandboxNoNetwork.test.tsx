import { afterEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const SANDBOX_MODULE_PATH = "../../shared/sandbox/sandbox";

/**
 * A fresh Response per call (not a shared instance): the boot chain reads a
 * body twice in sequence (fetchCsrf's res.json(), then fetchMe's res.json()
 * on the /auth/me call), and a Response body stream can only be consumed
 * once. A `mockResolvedValue` sharing one instance would throw "body stream
 * already read" on the second call, masking what this test actually checks.
 */
function respondOk(): Promise<Response> {
  return Promise.resolve(new Response("{}", { status: 200 }));
}

/**
 * Live-env harness, mirroring the repo's established live-mode idiom (see
 * `src/features/feed/api/useFeed.live.test.tsx`, `useJobs.live.test.tsx`):
 * stub `VITE_API_URL` to a real-looking origin BEFORE `vi.resetModules()`,
 * then dynamically import every module that (transitively) reads
 * `shared/api/config.ts`, so `apiAvailable`/`demoConfigured` re-freeze
 * against the stub instead of the suite-wide demo default in
 * `vitest.config.ts` (`VITE_API_URL: ""`, which would otherwise force
 * `apiAvailable=false` and make `DemoModeProvider` default to demo on its
 * own, independent of `isSandbox()`. That is the exact vacuousness this test
 * must not reproduce.
 */
async function loadLiveProviders() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "https://api.example.test");
  const { DemoModeProvider } = await import("../../app/providers/DemoModeProvider");
  const { AuthProvider } = await import("../../app/providers/AuthProvider");
  return { DemoModeProvider, AuthProvider };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.doUnmock(SANDBOX_MODULE_PATH);
  vi.resetModules();
});

describe("sandbox forces demo mode (zero network) even in an otherwise-live build", () => {
  it("never calls fetch: isSandbox() true forces demo despite a configured live API URL", async () => {
    vi.doMock(SANDBOX_MODULE_PATH, () => ({ isSandbox: () => true }));
    // Safety net only: the whole point of this test is that this never fires
    // under the sandbox guard. A resolved (not rejected) implementation means
    // that if the guard ever regresses, the test fails on the assertion below
    // rather than on an unhandled real network attempt from jsdom.
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(respondOk);

    const { DemoModeProvider, AuthProvider } = await loadLiveProviders();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <DemoModeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <div>ready</div>
          </AuthProvider>
        </QueryClientProvider>
      </DemoModeProvider>,
    );

    await waitFor(() => expect(document.body.textContent).toContain("ready"));
    // The demo branch settles synchronously (no live `checking` round trip),
    // so give any stray microtask from a wrongly-taken live branch a tick to
    // land before asserting silence.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("negative control: without the sandbox flag, the same live build DOES call fetch", async () => {
    // Same live env as above, but isSandbox() reports false this time. Proves
    // the no-fetch assertion in the previous test is contingent on the
    // sandbox guard and not just an artifact of ambient live-mode wiring or
    // this file's env stub.
    vi.doMock(SANDBOX_MODULE_PATH, () => ({ isSandbox: () => false }));
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(respondOk);

    const { DemoModeProvider, AuthProvider } = await loadLiveProviders();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <DemoModeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <div>ready</div>
          </AuthProvider>
        </QueryClientProvider>
      </DemoModeProvider>,
    );

    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  });
});
