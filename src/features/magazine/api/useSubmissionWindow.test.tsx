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
import { server } from "../../../test/msw/server";
import { API_V1 } from "../../../test/msw/handlers";
import { TestProviders } from "../../../test/TestProviders";
import { useOpenIssue } from "./useSubmissionWindow";

/**
 * PRD-106 — the submit-story form used to print a hardcoded
 * "Issue 26 · July 2026 · Submission deadline 15 August 2026". These prove
 * the live read replaces it: the issue comes off `GET /magazine/issues/open`,
 * a missing deadline stays missing, and no open issue is `null` rather than an
 * error the form would have to paper over with the old constant.
 *
 * Mirrors `usePieces.test.tsx`: demo mode must not touch the network at all,
 * and live mode is re-imported after `vi.resetModules()` so it resolves
 * against a freshly-imported `DemoModeContext`.
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
  vi.stubEnv("VITE_API_URL", "http://api.test");
  const { useOpenIssue: useOpenIssueLive } =
    await import("./useSubmissionWindow");
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
  return { useOpenIssue: useOpenIssueLive, wrapper };
}

describe("useOpenIssue (demo mode)", () => {
  it("answers from the demo fixture with no network request", async () => {
    // No handler is registered, and `onUnhandledRequest: "error"` fails the
    // test on any real request, so passing proves demo never went out.
    const { result } = renderHook(() => useOpenIssue(), {
      wrapper: TestProviders,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.openIssue).not.toBeNull();
    expect(result.current.openIssue?.submissionDeadline).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });

  it("never shows a deadline that has already passed", async () => {
    const { result } = renderHook(() => useOpenIssue(), {
      wrapper: TestProviders,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const deadline = result.current.openIssue?.submissionDeadline ?? "";
    expect(deadline > new Date().toISOString().slice(0, 10)).toBe(true);
  });
});

describe("useOpenIssue (live mode via MSW)", () => {
  it("reads the open issue off GET /magazine/issues/open", async () => {
    const { useOpenIssue: useOpenIssueLive, wrapper } = await loadLive();
    server.use(
      http.get(`${API_V1}/magazine/issues/open`, () =>
        HttpResponse.json({
          number: "27",
          title: "On work.",
          publishedOn: "2026-10-01",
          submissionDeadline: "2026-09-15",
        }),
      ),
    );

    const { result } = renderHook(() => useOpenIssueLive(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.openIssue).toEqual({
      number: "27",
      title: "On work.",
      publishedOn: "2026-10-01",
      submissionDeadline: "2026-09-15",
    });
  });

  it("carries a null deadline through rather than substituting one", async () => {
    const { useOpenIssue: useOpenIssueLive, wrapper } = await loadLive();
    server.use(
      http.get(`${API_V1}/magazine/issues/open`, () =>
        HttpResponse.json({
          number: "27",
          title: "On work.",
          publishedOn: "2026-10-01",
          submissionDeadline: null,
        }),
      ),
    );

    const { result } = renderHook(() => useOpenIssueLive(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.openIssue?.submissionDeadline).toBeNull();
  });

  it("answers null, not an error, when no issue is open", async () => {
    const { useOpenIssue: useOpenIssueLive, wrapper } = await loadLive();
    server.use(
      http.get(`${API_V1}/magazine/issues/open`, () => HttpResponse.json(null)),
    );

    const { result } = renderHook(() => useOpenIssueLive(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.openIssue).toBeNull();
    expect(result.current.isError).toBe(false);
  });
});
