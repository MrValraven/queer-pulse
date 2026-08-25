import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
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
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../test/msw/server";
import { API_V1 } from "../../test/msw/handlers";

/**
 * LIVE-mode suite for the forum 404-vs-error split (audit P2-8). `useThread`
 * must distinguish a genuine 404 (the slug resolves to nothing → an honest
 * "not found", non-retryable) from any other failure (500 / network → a
 * retryable error). Conflating them showed a real outage as a deleted thread
 * with no way to retry — the regression this guards.
 *
 * MSW serves the thread META fetch (`GET /forum/threads/:slug`) with the status
 * under test; the client turns a non-2xx into an `ApiError` carrying that
 * status, which `useThread` inspects. The POSTS fetch is served alongside (the
 * hook fires both in parallel and `onUnhandledRequest: "error"` would fail an
 * unhandled one) but only the meta error drives the not-found/error split.
 */

const SLUG = "ghost-thread";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

/** Load `useThread` and its providers in a fresh module graph with live env, so
 *  `config.ts` reads a real `VITE_API_URL` (demo mode off, live path on). */
async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://api.test");
  const { useThread } = await import("./api/useForum");
  const { DemoModeProvider } =
    await import("../../app/providers/DemoModeProvider");
  const { I18nProvider } = await import("../../app/providers/I18nProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>
        <I18nProvider>{children}</I18nProvider>
      </DemoModeProvider>
    </QueryClientProvider>
  );
  return { useThread, wrapper };
}

function serveThreadStatus(status: number) {
  server.use(
    http.get(`${API_V1}/forum/threads/${SLUG}`, () =>
      HttpResponse.json({ message: "nope" }, { status }),
    ),
    http.get(`${API_V1}/forum/threads/${SLUG}/posts`, () =>
      HttpResponse.json({ message: "nope" }, { status }),
    ),
  );
}

describe("useThread 404-vs-error (live mode via MSW)", () => {
  it("flags a genuine 404 as not-found (never as a retryable error)", async () => {
    serveThreadStatus(404);
    const { useThread, wrapper } = await loadLive();

    const { result } = renderHook(() => useThread(SLUG), { wrapper });

    await waitFor(() => expect(result.current.isNotFound).toBe(true));
    expect(result.current.isError).toBe(false);
    expect(result.current.thread).toBeUndefined();
  });

  it("flags a 500 as a retryable error (never as not-found)", async () => {
    serveThreadStatus(500);
    const { useThread, wrapper } = await loadLive();

    const { result } = renderHook(() => useThread(SLUG), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(false);
    expect(result.current.thread).toBeUndefined();
  });
});
