import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { TestProviders } from "../../../test/TestProviders";
import { eventKeys } from "./eventKeys";
import type { AttendeeRow } from "./events.adapters";
import type { AttendeesResult } from "./useAttendees";
import { useCheckIn, useUndoCheckIn } from "./useCheckIn";

/**
 * The door's optimistic patch, on the one branch that can invent data.
 *
 * `checkedInCount` is `number | null`; `null` means the platform no longer
 * keeps this gathering's check-ins. `null + 1` evaluates to `1` in JavaScript,
 * so an unguarded optimistic increment would resurrect an arrival total for a
 * gathering whose records were deliberately cleared. These assert both that the
 * null stays null and that the live door still counts, zero included.
 *
 * Runs in demo mode (the suite default), where the mutation never reaches the
 * network and the optimistic patch is therefore the final state of the cache.
 */

const SLUG = "supper-club";
const KEY = eventKeys.attendees(SLUG, true);

function attendee(slug: string, hasArrived: boolean): AttendeeRow {
  return {
    id: `att-${slug}`,
    slug,
    initials: "AB",
    background: "#eee",
    color: "#333",
    name: "Ari Sousa",
    checkedInAt: hasArrived ? new Date("2026-08-26T20:00:00Z") : null,
  };
}

function roster(
  checkedInCount: number | null,
  hasArrived: boolean,
): AttendeesResult {
  return {
    going: [attendee("ari", hasArrived)],
    waitlist: [],
    goingCount: 1,
    waitlistCount: 0,
    seatsTaken: 1,
    checkedInCount,
    goingPage: 1,
    hasMoreGoing: false,
    waitlistPage: 1,
    hasMoreWaitlist: false,
  };
}

function setup(seed: AttendeesResult) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData<AttendeesResult>(KEY, seed);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  return { queryClient, wrapper };
}

const cached = (queryClient: QueryClient) =>
  queryClient.getQueryData<AttendeesResult>(KEY);

describe("useCheckIn optimistic arrival count", () => {
  it("counts up from a real number when a name is tapped", async () => {
    const { queryClient, wrapper } = setup(roster(17, false));
    const { result } = renderHook(() => useCheckIn(SLUG), { wrapper });

    result.current.mutate({ memberSlug: "ari" });

    await waitFor(() => expect(cached(queryClient)?.checkedInCount).toBe(18));
  });

  it("counts the first arrival up from a literal zero", async () => {
    const { queryClient, wrapper } = setup(roster(0, false));
    const { result } = renderHook(() => useCheckIn(SLUG), { wrapper });

    result.current.mutate({ memberSlug: "ari" });

    await waitFor(() => expect(cached(queryClient)?.checkedInCount).toBe(1));
  });

  it("leaves a no-longer-kept count null instead of inventing a 1", async () => {
    const { queryClient, wrapper } = setup(roster(null, false));
    const { result } = renderHook(() => useCheckIn(SLUG), { wrapper });

    result.current.mutate({ memberSlug: "ari" });

    // The attendee's own row still moves; only the aggregate stays unstated.
    await waitFor(() =>
      expect(cached(queryClient)?.going[0]?.checkedInAt).not.toBeNull(),
    );
    expect(cached(queryClient)?.checkedInCount).toBeNull();
  });

  it("leaves a no-longer-kept count null when a check-in is undone", async () => {
    const { queryClient, wrapper } = setup(roster(null, true));
    const { result } = renderHook(() => useUndoCheckIn(SLUG), { wrapper });

    result.current.mutate("ari");

    await waitFor(() =>
      expect(cached(queryClient)?.going[0]?.checkedInAt).toBeNull(),
    );
    expect(cached(queryClient)?.checkedInCount).toBeNull();
  });
});
