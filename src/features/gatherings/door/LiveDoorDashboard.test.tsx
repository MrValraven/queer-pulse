import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ApiError } from "../../../shared/api/client";
import type { AttendeeRow } from "../api/events.adapters";
import type { AttendeesResult } from "../api/useAttendees";
import type { GatheringDetail } from "../data";
import { LiveDoorDashboard } from "./LiveDoorDashboard";

/**
 * The door's headline "Checked in" tile reads `checkedInCount`, which the
 * server now returns as `number | null`: `null` means the platform no longer
 * keeps this gathering's check-ins (cleared 30 days after it ends) and `0`
 * still means nobody arrived.
 *
 * The four states below are the whole contract. The zero case is the one a
 * careless null fix collapses into the null case, so it is asserted on its own.
 *
 * `useEvent`/`useAttendees`/`useCheckIn` are mocked so each state is driven
 * directly; their own fetching and cache patching are covered elsewhere.
 */

/** Mirrors the option bag `LiveDoorDashboard` hands `checkIn.mutate`. */
type CheckInOptions = {
  onSuccess?: (result: undefined) => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
};

const { eventState, rosterState, checkInState } = vi.hoisted(() => ({
  eventState: { gathering: null as GatheringDetail | null },
  rosterState: { roster: undefined as AttendeesResult | undefined },
  // What the next check-in attempt does. `null` = resolve silently; an Error
  // is handed to the caller's own `onError`, which is where the door decides
  // between a retryable toast and a permanent refusal.
  checkInState: { rejectWith: null as Error | null },
}));

vi.mock("../api/useEvent", () => ({
  useEvent: () => ({
    data: eventState.gathering
      ? { gathering: eventState.gathering }
      : undefined,
    isLoading: false,
  }),
}));

vi.mock("../api/useAttendees", () => ({
  useAttendees: () => ({
    data: rosterState.roster,
    loadMoreGoing: () => Promise.resolve(),
    isLoading: false,
  }),
}));

vi.mock("../api/useCheckIn", () => ({
  useCheckIn: () => ({
    mutate: (_input: unknown, options?: CheckInOptions) => {
      if (checkInState.rejectWith) options?.onError?.(checkInState.rejectWith);
      else options?.onSuccess?.(undefined);
      options?.onSettled?.();
    },
    isPending: false,
  }),
  useUndoCheckIn: () => ({ mutate: vi.fn(), isPending: false }),
}));

/** The backend's typed refusal once a gathering is past its attendance window
 *  (`EVENT_ATTENDANCE_WINDOW_CLOSED` on a 403). The door reads the code and
 *  renders its own copy, so the prose here is deliberately not what shows. */
const WINDOW_CLOSED_ERROR = new ApiError(
  403,
  "Arrivals are only recorded for 30 days after a gathering.",
  {
    statusCode: 403,
    error: "Forbidden",
    code: "EVENT_ATTENDANCE_WINDOW_CLOSED",
    message: "Arrivals are only recorded for 30 days after a gathering.",
  },
);

const GATHERING = {
  slug: "supper-club",
  type: "Supper Club",
  date: new Date("2026-08-26T19:00:00Z"),
  title: "Supper club",
  hood: "Príncipe Real",
  host: "Ari Sousa",
  hostSlug: "ari-sousa",
  spots: { label: "spots" },
  ctaKey: "gatherings:detail.rsvpCta",
  body: "A long table and a short menu.",
  viewerIsOrganizer: true,
} as unknown as GatheringDetail;

function attendee(
  slug: string,
  name: string,
  hasArrived: boolean,
): AttendeeRow {
  return {
    id: `att-${slug}`,
    slug,
    initials: "AB",
    background: "#eee",
    color: "#333",
    name,
    checkedInAt: hasArrived ? new Date("2026-08-26T20:00:00Z") : null,
  };
}

const GOING: AttendeeRow[] = [
  attendee("ari", "Ari Sousa", true),
  attendee("bo", "Bo Neves", false),
];

function roster(checkedInCount: number | null): AttendeesResult {
  return {
    going: GOING,
    waitlist: [],
    goingCount: 40,
    waitlistCount: 3,
    seatsTaken: 40,
    checkedInCount,
    goingPage: 1,
    hasMoreGoing: false,
    waitlistPage: 1,
    hasMoreWaitlist: false,
  };
}

const NOT_KEPT_NOTE =
  "Check-ins are no longer kept for past gatherings. We clear them 30 days after a gathering ends.";

const CLOSED_NOTICE =
  "Check-in is closed for this gathering. We cleared its arrival records once the check-in window passed, so no new ones can be added.";

afterEach(() => {
  eventState.gathering = null;
  rosterState.roster = undefined;
  checkInState.rejectWith = null;
});

/**
 * The door's own in-place refusal.
 *
 * Queried out of every announced region rather than by `findByRole("alert")`
 * alone, because the app shell keeps an assertive toast live region mounted
 * from first paint (see `ToastProvider`), and an empty live region is an alert
 * too. The role still has to be on the notice itself: this is copy the host
 * must hear, so a plain `findByText` would not be asserting enough.
 */
async function findClosedNotice() {
  const announced = await screen.findAllByRole("alert");
  const notice = announced.find((element) =>
    element.textContent?.includes(CLOSED_NOTICE),
  );
  expect(notice).toBeDefined();
  return notice as HTMLElement;
}

function renderDoor(checkedInCount: number | null) {
  eventState.gathering = GATHERING;
  rosterState.roster = roster(checkedInCount);
  render(
    <TestProviders>
      <LiveDoorDashboard param="supper-club" />
    </TestProviders>,
  );
}

describe("LiveDoorDashboard checked-in tile", () => {
  it("shows the real number while the gathering is inside its window", async () => {
    renderDoor(18);

    expect(await screen.findByText("Checked in")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.queryByText(NOT_KEPT_NOTE)).not.toBeInTheDocument();
  });

  it("shows a literal zero when nobody has arrived yet", async () => {
    renderDoor(0);

    expect(await screen.findByText("Checked in")).toBeInTheDocument();
    // Zero is a count, and the door must keep saying so.
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryByText("No longer kept")).not.toBeInTheDocument();
    expect(screen.queryByText(NOT_KEPT_NOTE)).not.toBeInTheDocument();
  });

  it("says the record is no longer kept once the gathering is past its window", async () => {
    renderDoor(null);

    expect(await screen.findByText("No longer kept")).toBeInTheDocument();
    // Not a zero, and not a blank where a number used to be.
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("explains the retention choice in plain words next to the tile", async () => {
    renderDoor(null);

    expect(await screen.findByText(NOT_KEPT_NOTE)).toBeInTheDocument();
  });
});

describe("LiveDoorDashboard past the attendance window", () => {
  it("withdraws the card reader and every check-in button when the count is gone", async () => {
    renderDoor(null);

    await screen.findByText("No longer kept");
    // `POST /events/:slug/check-ins` answers 403 on this gathering, so no
    // affordance claims otherwise. Both entry points come down together.
    expect(
      screen.queryByRole("button", { name: "Read a card" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Check in / }),
    ).not.toBeInTheDocument();
  });

  it("keeps undo reachable on a row the sweep has not cleared yet", async () => {
    renderDoor(null);

    // `DELETE /events/:slug/check-ins/:memberSlug` is unguarded on purpose:
    // it removes an arrival stamp rather than writing one.
    expect(
      await screen.findByRole("button", {
        name: "Undo check-in for Ari Sousa",
      }),
    ).toBeInTheDocument();
  });
});

describe("LiveDoorDashboard when the window closes under an open tab", () => {
  it("states the reason in place when the server refuses a tapped check-in", async () => {
    // The roster still reads as live, which is exactly the stale-tab case.
    renderDoor(4);
    checkInState.rejectWith = WINDOW_CLOSED_ERROR;

    fireEvent.click(
      await screen.findByRole("button", { name: "Check in Bo Neves" }),
    );

    expect(await findClosedNotice()).toHaveTextContent(CLOSED_NOTICE);
  });

  it("shows its own copy rather than the server's message", async () => {
    renderDoor(4);
    checkInState.rejectWith = WINDOW_CLOSED_ERROR;

    fireEvent.click(
      await screen.findByRole("button", { name: "Check in Bo Neves" }),
    );

    await findClosedNotice();
    // The server's prose carries a number from a configurable window, so the
    // code is the contract and the message never reaches the host.
    expect(
      screen.queryByText(/Arrivals are only recorded for 30 days/),
    ).not.toBeInTheDocument();
  });

  it("offers no retry: the refused affordances come down with the notice", async () => {
    renderDoor(4);
    checkInState.rejectWith = WINDOW_CLOSED_ERROR;

    fireEvent.click(
      await screen.findByRole("button", { name: "Check in Bo Neves" }),
    );

    await findClosedNotice();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /^Check in / }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: "Read a card" }),
    ).not.toBeInTheDocument();
    // Undo is the one action that still works, and it survives.
    expect(
      screen.getByRole("button", { name: "Undo check-in for Ari Sousa" }),
    ).toBeInTheDocument();
  });

  it("leaves an ordinary failure retryable", async () => {
    renderDoor(4);
    checkInState.rejectWith = new ApiError(500, "boom");

    fireEvent.click(
      await screen.findByRole("button", { name: "Check in Bo Neves" }),
    );

    // No permanent notice, and the button is still there for a second tap.
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Check in Bo Neves" }),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByText(CLOSED_NOTICE)).not.toBeInTheDocument();
  });
});
