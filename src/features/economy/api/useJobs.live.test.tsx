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
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/msw/server";
import { API_V1, jobCard } from "../../../test/msw/handlers";

/**
 * LIVE-mode suite: proves the demo→live branch of useJobs actually hits the
 * network and adapts the DTO. VITE_API_URL is stubbed to a real value so
 * `apiAvailable` is true (demo OFF) and MSW serves GET /jobs. Modules are reset
 * + re-imported per test so config.ts re-freezes API_BASE_URL from the stub.
 */

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://api.test");
  const { useJobs } = await import("./useJobs");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  // Imported after resetModules like the others: a statically-imported provider
  // would hold a different I18nContext instance than the freshly-imported
  // useJobs resolves, so useTranslation wouldn't find it.
  const { I18nProvider } = await import("../../../app/providers/I18nProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <DemoModeProvider>{children}</DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { useJobs, wrapper };
}

beforeEach(() => {
  window.localStorage.clear();
});

/** Answers GET /jobs with an empty page and records each requested URL. */
function recordJobRequests(): string[] {
  const requestedUrls: string[] = [];
  const emptyPage = { items: [], total: 0, page: 1, pageSize: 20 };
  server.use(
    http.get(`${API_V1}/jobs`, ({ request }) => {
      requestedUrls.push(request.url);
      return HttpResponse.json(emptyPage);
    }),
  );
  return requestedUrls;
}

describe("useJobs (live mode via MSW)", () => {
  it("fetches GET /jobs and returns adapted Job[]", async () => {
    const { useJobs, wrapper } = await loadLive();
    const { result } = renderHook(() => useJobs(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const jobs = result.current.jobs;
    expect(jobs).toHaveLength(1);
    // A single full page is terminal: no "Load more".
    expect(result.current.hasNextPage).toBe(false);
    const job = jobs[0]!;
    // The DTO ran through jobCardToJob: field id kept, logo, salary string.
    expect(job.slug).toBe("brand-designer");
    expect(job.organization).toBe("Atelier Pulso");
    expect(job.category).toBe("design");
    expect(job.commitment).toBe("freelanceGig");
    expect(job.logo).toBe("AP");
    expect(job.salary).toBe("€2,200/mo");
    // `deadline` is a real Date: the i18n sweep moved formatting to the render
    // layer so it follows the active language.
    expect(job.deadline).toEqual(new Date("2026-06-30"));
  });

  it("sends the field filter to the server as one comma-separated cat", async () => {
    const requestedUrls = recordJobRequests();
    const { useJobs, wrapper } = await loadLive();
    const { result } = renderHook(() => useJobs({ cat: "design,fashion" }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(requestedUrls).toHaveLength(1);
    expect(requestedUrls[0]).toBe(`${API_V1}/jobs?cat=design%2Cfashion&page=1`);
  });

  it("starts again from page 1 when the field filter changes", async () => {
    const requestedUrls = recordJobRequests();
    const { useJobs, wrapper } = await loadLive();
    const { result, rerender } = renderHook(
      ({ cat }: { cat: string }) => useJobs({ cat }),
      { wrapper, initialProps: { cat: "design,fashion" } },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ cat: "care" });
    await waitFor(() => expect(requestedUrls).toHaveLength(2));

    expect(requestedUrls[1]).toBe(`${API_V1}/jobs?cat=care&page=1`);
  });

  it("keeps page 1 loaded when the next page fails", async () => {
    server.use(
      http.get(`${API_V1}/jobs`, ({ request }) => {
        const page = new URL(request.url).searchParams.get("page");
        if (page === "2") {
          return HttpResponse.json({ message: "boom" }, { status: 500 });
        }
        return HttpResponse.json({
          items: [jobCard],
          total: 2,
          page: 1,
          pageSize: 1,
        });
      }),
    );
    const { useJobs, wrapper } = await loadLive();
    const { result } = renderHook(() => useJobs(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasNextPage).toBe(true);

    act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.isFetchNextPageError).toBe(true));

    // The board reads `isError` as "the first page failed", so it keeps the
    // loaded list on screen and the footer offers the retry.
    expect(result.current.isError).toBe(false);
    expect(result.current.jobs.map((job) => job.slug)).toEqual([
      "brand-designer",
    ]);
    expect(result.current.hasNextPage).toBe(true);
  });
});
