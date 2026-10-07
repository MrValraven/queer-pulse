import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AttendeesTab } from "./ManageAttendeesTab";

const pagesCalls: { status: string; q?: string; isEnabled?: boolean }[] = [];

vi.mock("./api/useAttendees", () => ({
  useAttendees: () => ({
    data: {
      going: [],
      waitlist: [],
      goingCount: 0,
      waitlistCount: 0,
      seatsTaken: 0,
      checkedInCount: 0,
      hasMoreGoing: false,
      hasMoreWaitlist: false,
    },
    loadMoreGoing: () => Promise.resolve(),
    loadMoreWaitlist: () => Promise.resolve(),
  }),
}));

vi.mock("./api/useAttendeePages", () => ({
  useAttendeePages: (
    _slug: string,
    filter: { status: string; q?: string },
    options?: { isEnabled?: boolean },
  ) => {
    pagesCalls.push({ ...filter, isEnabled: options?.isEnabled });
    const isGoing = filter.status === "going";
    return {
      rows:
        isGoing && filter.q
          ? [
              {
                id: "att-p",
                slug: "philippine",
                name: "Philippine Leclerc",
                initials: "PL",
                background: "",
                color: "",
              },
            ]
          : [],
      total: isGoing && filter.q ? 1 : 0,
      hasMore: false,
      isLoading: false,
      isFetchingMore: false,
      isLoadError: false,
      isLoadMoreError: false,
      loadMore: () => undefined,
      retry: () => undefined,
    };
  },
}));

vi.mock("../../shared/hooks/useDebouncedValue", () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

describe("AttendeesTab search", () => {
  it("asks the server for matching guests and shows them", () => {
    render(<AttendeesTab slug="supper-club" />, { wrapper: TestProviders });
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "leclerc" },
    });
    expect(
      pagesCalls.some(
        (call) =>
          call.status === "going" && call.q === "leclerc" && call.isEnabled,
      ),
    ).toBe(true);
    expect(screen.getByText("Philippine Leclerc")).toBeInTheDocument();
  });
});
