import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { AttendeesResult } from "./useAttendees";
import { useAttendeePages } from "./useAttendeePages";

const roster = {
  going: [
    {
      id: "a",
      slug: "philippine",
      name: "Philippine Leclerc",
      initials: "PL",
      background: "",
      color: "",
      checkedInAt: null,
    },
    {
      id: "b",
      slug: "nuno",
      name: "Nuno Menezes",
      initials: "NM",
      background: "",
      color: "",
      checkedInAt: new Date("2026-10-10T21:00:00Z"),
    },
    {
      id: "c",
      slug: "ana",
      name: "Ána Sousa",
      initials: "AS",
      background: "",
      color: "",
      checkedInAt: null,
    },
  ],
  waitlist: [],
} as unknown as AttendeesResult;

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));
vi.mock("./useAttendees", () => ({
  useAttendees: () => ({ data: roster }),
}));

// The roster hook is mocked, so the pages hook needs only a query client.
// The full TestProviders tree would render the real DemoModeProvider, which
// the module mock above leaves out.
function QueryWrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useAttendeePages (demo)", () => {
  it("lists expected guests by name", () => {
    const { result } = renderHook(
      () =>
        useAttendeePages("supper-club", {
          status: "going",
          arrival: "expected",
        }),
      { wrapper: QueryWrapper },
    );
    expect(result.current.rows.map((attendee) => attendee.slug)).toEqual([
      "ana",
      "philippine",
    ]);
    expect(result.current.hasMore).toBe(false);
  });

  it("searches accent-insensitively", () => {
    const { result } = renderHook(
      () => useAttendeePages("supper-club", { status: "going", q: "ana" }),
      { wrapper: QueryWrapper },
    );
    expect(result.current.rows.map((attendee) => attendee.slug)).toEqual([
      "ana",
    ]);
  });

  it("lists arrived guests", () => {
    const { result } = renderHook(
      () =>
        useAttendeePages("supper-club", {
          status: "going",
          arrival: "arrived",
        }),
      { wrapper: QueryWrapper },
    );
    expect(result.current.rows.map((attendee) => attendee.slug)).toEqual([
      "nuno",
    ]);
  });
});
