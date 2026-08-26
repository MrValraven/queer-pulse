import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { AttendeesPageDTO } from "./events.api";

/**
 * The single most load-bearing line of the nullable-`checkedInCount` change.
 *
 * `GET /events/:slug/attendees` now answers `null` for a gathering whose
 * check-in records the platform no longer keeps (they are cleared 30 days
 * after it ends), and `0` only when nobody arrived. This hook used to carry
 * `goingPage.checkedInCount ?? 0`, which folded the first case into the second
 * and gave an organiser "0 arrived of 40 going" for a gathering that was full.
 *
 * These run in LIVE mode, since the demo roster never reaches the API. The
 * module graph is reset per case so the demo/live switch is read fresh.
 */

function page(overrides: Partial<AttendeesPageDTO>): AttendeesPageDTO {
  return {
    items: [],
    total: 40,
    page: 1,
    pageSize: 20,
    goingCount: 40,
    seatsTaken: 40,
    waitlistCount: 3,
    ...overrides,
  };
}

/** Load `useAttendees` against a live-mode module graph with `getAttendees`
 *  stubbed to answer with the given "going" page. */
async function loadLiveAttendees(goingPage: AttendeesPageDTO) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://localhost:3000");
  vi.stubEnv("VITE_DEMO", "");

  const getAttendees = vi.fn((_slug: string, status: string) =>
    Promise.resolve(
      status === "going"
        ? goingPage
        : page({ total: 3, goingCount: 40, waitlistCount: 3 }),
    ),
  );
  vi.doMock("./events.api", async () => ({
    ...(await vi.importActual("./events.api")),
    getAttendees,
  }));

  const { useAttendees } = await import("./useAttendees");
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
  return { useAttendees, wrapper };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("useAttendees checkedInCount", () => {
  it("carries a real arrival count through untouched", async () => {
    const { useAttendees, wrapper } = await loadLiveAttendees(
      page({ checkedInCount: 18 }),
    );
    const { result } = renderHook(() => useAttendees("supper-club"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.checkedInCount).toBe(18);
  });

  it("keeps a literal zero as zero: nobody arrived", async () => {
    const { useAttendees, wrapper } = await loadLiveAttendees(
      page({ checkedInCount: 0 }),
    );
    const { result } = renderHook(() => useAttendees("supper-club"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.data).toBeDefined());
    // Zero, and emphatically not null: the gathering is inside its window and
    // the answer really is that nobody came through the door.
    expect(result.current.data?.checkedInCount).toBe(0);
  });

  it("keeps a no-longer-kept count null rather than coercing it to zero", async () => {
    const { useAttendees, wrapper } = await loadLiveAttendees(
      page({ checkedInCount: null }),
    );
    const { result } = renderHook(() => useAttendees("supper-club"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.checkedInCount).toBeNull();
    expect(result.current.data?.checkedInCount).not.toBe(0);
  });

  it("does not invent a count when the field is absent altogether", async () => {
    const { useAttendees, wrapper } = await loadLiveAttendees(page({}));
    const { result } = renderHook(() => useAttendees("supper-club"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.checkedInCount).toBeNull();
  });
});
