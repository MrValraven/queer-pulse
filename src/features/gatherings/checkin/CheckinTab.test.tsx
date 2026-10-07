import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ApiError } from "../../../shared/api/client";
import type { AttendeeRow } from "../api/events.adapters";
import type { AttendeesResult } from "../api/useAttendees";
import type { ScanOutcome } from "./scanOutcome";
import { CheckinTab } from "./CheckinTab";

/**
 * `useAttendees`, `useAttendeePages` and the check-in mutations are mocked so
 * each state is driven directly; their own fetching and cache patching are
 * covered by their own suites. The scanner is a stub that reads one card and
 * prints the outcome kind, since its camera needs no exercising here.
 */

const { rosterState, checkInState, undoCalls, checkInCalls } = vi.hoisted(
  () => ({
    rosterState: { roster: undefined as AttendeesResult | undefined },
    // What the next check-in does. `null` = resolve; an Error = reject.
    checkInState: { rejectWith: null as Error | null },
    undoCalls: [] as string[],
    checkInCalls: [] as unknown[],
  }),
);

const guest = (slug: string, name: string, checkedInAt: Date | null = null) =>
  ({
    id: `att-${slug}`,
    slug,
    name,
    initials: "AA",
    background: "",
    color: "",
    checkedInAt,
  }) as AttendeeRow;

vi.mock("../api/useAttendees", () => ({
  useAttendees: () => ({ data: rosterState.roster, isLoading: false }),
}));

vi.mock("../api/useAttendeePages", () => ({
  useAttendeePages: (
    _slug: string,
    filter: { arrival?: string; q?: string },
  ) => {
    const going = rosterState.roster?.going ?? [];
    const searchTerm = (filter.q ?? "").toLowerCase();
    const rows = going.filter(
      (row) =>
        (filter.arrival === "arrived"
          ? row.checkedInAt != null
          : row.checkedInAt == null) &&
        row.name.toLowerCase().includes(searchTerm),
    );
    return {
      rows,
      total: rows.length,
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

vi.mock("../api/useCheckIn", () => ({
  useCheckIn: () => ({
    mutateAsync: (input: unknown) => {
      checkInCalls.push(input);
      return checkInState.rejectWith
        ? Promise.reject(checkInState.rejectWith)
        : Promise.resolve(undefined);
    },
    isPending: false,
  }),
  useUndoCheckIn: () => ({
    mutateAsync: (memberSlug: string) => {
      undoCalls.push(memberSlug);
      return Promise.resolve(undefined);
    },
    isPending: false,
  }),
}));

vi.mock("../../../shared/hooks/useDebouncedValue", () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

vi.mock("./CheckinScanner", () => ({
  CheckinScanner: ({
    onCardToken,
  }: {
    onCardToken: (cardToken: string) => Promise<ScanOutcome>;
  }) => {
    const [outcomeKind, setOutcomeKind] = useState("");
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            void onCardToken("card-token").then((outcome) =>
              setOutcomeKind(outcome.kind),
            );
          }}
        >
          Read test card
        </button>
        <p>Outcome: {outcomeKind}</p>
      </div>
    );
  },
}));

const WINDOW_CLOSED_ERROR = new ApiError(403, "closed", {
  statusCode: 403,
  error: "Forbidden",
  code: "EVENT_ATTENDANCE_WINDOW_CLOSED",
  message: "closed",
});

const startAt = new Date(Date.now() - 30 * 60_000);

const roster = (
  going: AttendeeRow[],
  checkedInCount: number | null,
): AttendeesResult => ({
  going,
  waitlist: [],
  goingCount: going.length,
  waitlistCount: 0,
  seatsTaken: going.length,
  checkedInCount,
  goingPage: 1,
  hasMoreGoing: false,
  waitlistPage: 1,
  hasMoreWaitlist: false,
});

const renderTab = () =>
  render(<CheckinTab slug="supper-club" startAt={startAt} endAt={null} />, {
    wrapper: ({ children }) => <TestProviders>{children}</TestProviders>,
  });

describe("CheckinTab", () => {
  afterEach(() => {
    checkInState.rejectWith = null;
    undoCalls.length = 0;
    checkInCalls.length = 0;
  });

  it("checks a guest in from the list, announces it and undoes it from the row", async () => {
    rosterState.roster = roster([guest("nuno", "Nuno Menezes")], 0);
    renderTab();
    fireEvent.click(
      await screen.findByRole("button", { name: "Check in Nuno Menezes" }),
    );
    expect(checkInCalls).toEqual([{ memberSlug: "nuno" }]);
    expect(
      await screen.findByText("Nuno Menezes checked in"),
    ).toBeInTheDocument();
    // The row confirms the arrival itself, so no toast offers an undo.
    expect(
      screen.queryByRole("button", { name: "Undo" }),
    ).not.toBeInTheDocument();
    // The lingering row carries its own undo while it shows the Arrived chip.
    const rowUndoButton = await screen.findByRole("button", {
      name: "Undo check-in for Nuno Menezes",
    });
    await waitFor(() => expect(rowUndoButton).toBeEnabled());
    fireEvent.click(rowUndoButton);
    expect(undoCalls).toEqual(["nuno"]);
    expect(await screen.findByText("Check-in undone")).toBeInTheDocument();
  });

  it("withdraws the scan dock while a search finds nobody, and Clear refocuses search", async () => {
    rosterState.roster = roster([guest("nuno", "Nuno Menezes")], 0);
    renderTab();
    // The toolbar's scan button and the phone dock (CSS decides which shows).
    expect(
      await screen.findAllByRole("button", { name: /Scan card/ }),
    ).toHaveLength(2);
    const searchbox = screen.getByRole("searchbox", { name: "Search guests" });
    fireEvent.change(searchbox, { target: { value: "Zeferino" } });
    expect(
      await screen.findByText('No one called "Zeferino" is going'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Scan card/ })).toHaveLength(
      1,
    );
    // The field's own clear button comes first; the not-on-list one is last.
    const clearButtons = screen.getAllByRole("button", {
      name: "Clear search",
    });
    fireEvent.click(clearButtons[clearButtons.length - 1]!);
    expect(searchbox).toHaveValue("");
    expect(searchbox).toHaveFocus();
  });

  it("shows zero arrivals as a number", async () => {
    rosterState.roster = roster([guest("nuno", "Nuno Menezes")], 0);
    renderTab();
    expect(await screen.findByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("withdraws scan and check-in once check-ins are no longer kept", async () => {
    rosterState.roster = roster(
      [guest("nuno", "Nuno Menezes", new Date(0))],
      null,
    );
    renderTab();
    expect(await screen.findByText("No longer kept")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Scan card/ }),
    ).not.toBeInTheDocument();
  });

  it("states the closed window in place after a refused check-in", async () => {
    rosterState.roster = roster([guest("nuno", "Nuno Menezes")], 0);
    checkInState.rejectWith = WINDOW_CLOSED_ERROR;
    renderTab();
    fireEvent.click(
      await screen.findByRole("button", { name: "Check in Nuno Menezes" }),
    );
    // The toast region is an always-mounted alert too, so find the notice
    // among every alert on the page.
    await waitFor(() =>
      expect(
        screen
          .getAllByRole("alert")
          .some((element) =>
            /Check-in is closed/.test(element.textContent ?? ""),
          ),
      ).toBe(true),
    );
    expect(
      screen.queryByRole("button", { name: "Check in Nuno Menezes" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Scan card/ }),
    ).not.toBeInTheDocument();
  });

  it("focuses search with the slash key", async () => {
    rosterState.roster = roster([], 0);
    renderTab();
    const searchbox = await screen.findByRole("searchbox", {
      name: "Search guests",
    });
    fireEvent.keyDown(window, { key: "/" });
    expect(searchbox).toHaveFocus();
  });

  it("refuses a scanned card in demo, which has no card registry", async () => {
    rosterState.roster = roster([guest("nuno", "Nuno Menezes")], 0);
    renderTab();
    const [scanButton] = await screen.findAllByRole("button", {
      name: /Scan card/,
    });
    fireEvent.click(scanButton!);
    fireEvent.click(
      await screen.findByRole("button", { name: "Read test card" }),
    );
    expect(await screen.findByText("Outcome: refused")).toBeInTheDocument();
    expect(checkInCalls).toEqual([{ cardToken: "card-token" }]);
  });
});
