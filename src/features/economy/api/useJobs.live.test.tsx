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

describe("useJobs (live mode via MSW)", () => {
  it("fetches GET /jobs and returns adapted Job[]", async () => {
    const { useJobs, wrapper } = await loadLive();
    const { result } = renderHook(() => useJobs(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const jobs = result.current.jobs;
    expect(jobs).toHaveLength(1);
    // A bare-array response is one terminal page — no "Load more".
    expect(result.current.hasNextPage).toBe(false);
    const job = jobs[0]!;
    // The DTO ran through jobCardToJob: derived cat slug, logo, salary string.
    expect(job.slug).toBe("brand-designer");
    expect(job.organization).toBe("Atelier Pulso");
    expect(job.category).toBe("arts");
    expect(job.logo).toBe("AP");
    expect(job.salary).toBe("€2,200/mo");
    // `deadline` is a real Date now, not a pre-formatted string — the i18n sweep
    // moved formatting to the render layer so it follows the active language.
    expect(job.deadline).toEqual(new Date("2026-06-30"));
  });
});
