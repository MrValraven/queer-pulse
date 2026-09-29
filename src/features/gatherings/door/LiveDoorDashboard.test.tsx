import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

const { eventState, rosterState, checkInState, undoState } = vi.hoisted(() => ({
  eventState: { gathering: null as GatheringDetail | null },
  rosterState: { roster: undefined as AttendeesResult | undefined },
  // What the next check-in attempt does. `null` = resolve silently; an
  // Error is handed to the caller's own `onError`, which is where the door
  // decides between a retryable toast and a permanent refusal.
  checkInState: { rejectWith: null as Error | null },
  // The same shape, for the next undo attempt.
  undoState: { rejectWith: null as Error | null },
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
  useUndoCheckIn: () => ({
    mutate: (_memberSlug: string, options?: CheckInOptions) => {
      if (undoState.rejectWith) options?.onError?.(undoState.rejectWith);
      else options?.onSuccess?.(undefined);
      options?.onSettled?.();
    },
    isPending: false,
  }),
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
  undoState.rejectWith = null;
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

/** RollingNumber draws a count twice: per-digit glyphs under `aria-hidden`
 *  and one spoken copy of the whole value. Text queries match the spoken copy. */
const SPOKEN_TEXT = { ignore: '[aria-hidden="true"] *, script, style' };

/** The headline tile the "Checked in" caption sits in. The guest list's
 *  "Checked in (n)" chip carries the same count, so queries scope to here. */
function checkedInTile() {
  return screen.getByText("Checked in").parentElement as HTMLElement;
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
    expect(
      within(checkedInTile()).getByText("18", SPOKEN_TEXT),
    ).toBeInTheDocument();
    expect(screen.queryByText(NOT_KEPT_NOTE)).not.toBeInTheDocument();
  });

  it("shows a literal zero when nobody has arrived yet", async () => {
    renderDoor(0);

    expect(await screen.findByText("Checked in")).toBeInTheDocument();
    // Zero is a count, and the door must keep saying so.
    expect(
      within(checkedInTile()).getByText("0", SPOKEN_TEXT),
    ).toBeInTheDocument();
    expect(screen.queryByText("No longer kept")).not.toBeInTheDocument();
    expect(screen.queryByText(NOT_KEPT_NOTE)).not.toBeInTheDocument();
  });

  it("says the record is no longer kept once the gathering is past its window", async () => {
    renderDoor(null);

    expect(await screen.findByText("No longer kept")).toBeInTheDocument();
    // Not a zero, and not a blank where a number used to be.
    expect(screen.queryByText("0", SPOKEN_TEXT)).not.toBeInTheDocument();
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

/**
 * A Portuguese host reading English server prose is the bug this guards
 * against, and a host reading the WRONG translated sentence (round 1's
 * critical finding: a waitlisted or "maybe" member's card read as
 * "unreadable") is the sharper version of the same bug. Round 3 codes every
 * refusal `checkIn`/`undoCheckIn` can throw beyond the window-closed one
 * (`event-check-in-codes.ts` on the backend), and this door reads only the
 * code, the same way it already read `EVENT_ATTENDANCE_WINDOW_CLOSED`. Each
 * coded failure gets its own translated copy; an uncoded one falls back to
 * the ordinary retry toast.
 */

/** Builds the `{ statusCode, error, code, message }` body shape every coded
 *  refusal in this contract shares, mirroring `checkInError.test.ts`'s own
 *  helper of the same shape. */
const coded = (statusCode: number, code: string, message: string) => ({
  statusCode,
  error: statusCode === 400 ? "Bad Request" : "Not Found",
  code,
  message,
});

const MEMBER_NOT_FOUND_ERROR = new ApiError(
  404,
  "Member not found",
  coded(404, "CHECK_IN_MEMBER_NOT_FOUND", "Member not found"),
);
const NOT_ON_GUEST_LIST_ERROR = new ApiError(
  404,
  "That member is not on the guest list",
  coded(
    404,
    "CHECK_IN_NOT_ON_GUEST_LIST",
    "That member is not on the guest list",
  ),
);
const WAITLISTED_ERROR = new ApiError(
  400,
  "That member is on the waitlist. Promote them first, then check them in.",
  coded(
    400,
    "CHECK_IN_WAITLISTED",
    "That member is on the waitlist. Promote them first, then check them in.",
  ),
);
const MAYBE_ERROR = new ApiError(
  400,
  "That member answered maybe and has no seat yet",
  coded(
    400,
    "CHECK_IN_MAYBE",
    "That member answered maybe and has no seat yet",
  ),
);
const CARD_UNREADABLE_ERROR = new ApiError(
  400,
  "That card could not be read. Check them in by name instead.",
  coded(
    400,
    "CHECK_IN_CARD_UNREADABLE",
    "That card could not be read. Check them in by name instead.",
  ),
);

/** Opens the scan modal and submits a typed code, so a card-scan failure can
 *  be driven the same way a real scan or paste would trigger it. */
async function submitScannedCode() {
  fireEvent.click(await screen.findByRole("button", { name: "Read a card" }));
  fireEvent.change(screen.getByPlaceholderText("Paste or type the code"), {
    target: { value: "some-code" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Check in" }));
}

describe("LiveDoorDashboard door failures: check-in by name", () => {
  it("gives an unmatched or inactive name its own refusal toast, and keeps the row", async () => {
    renderDoor(4);
    checkInState.rejectWith = MEMBER_NOT_FOUND_ERROR;

    fireEvent.click(
      await screen.findByRole("button", { name: "Check in Bo Neves" }),
    );

    expect(
      await screen.findByText("We couldn't check this person in."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Member not found")).not.toBeInTheDocument();
    // A refusal is final only for this one name: no permanent notice, and
    // the row keeps its button for a different attendee to use.
    expect(screen.queryByText(CLOSED_NOTICE)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Check in Bo Neves" }),
    ).toBeInTheDocument();
  });

  it("names a member with no RSVP row as not on the guest list", async () => {
    renderDoor(4);
    checkInState.rejectWith = NOT_ON_GUEST_LIST_ERROR;

    fireEvent.click(
      await screen.findByRole("button", { name: "Check in Bo Neves" }),
    );

    expect(
      await screen.findByText("This person isn't on the guest list."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("That member is not on the guest list"),
    ).not.toBeInTheDocument();
  });

  it("names a waitlisted member as waitlisted, with the promote-first guidance", async () => {
    renderDoor(4);
    checkInState.rejectWith = WAITLISTED_ERROR;

    fireEvent.click(
      await screen.findByRole("button", { name: "Check in Bo Neves" }),
    );

    expect(
      await screen.findByText(
        "This person is on the waitlist. Promote them first, then check them in.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "That member is on the waitlist. Promote them first, then check them in.",
      ),
    ).not.toBeInTheDocument();
  });

  it("names a maybe-RSVP member as having no seat yet", async () => {
    renderDoor(4);
    checkInState.rejectWith = MAYBE_ERROR;

    fireEvent.click(
      await screen.findByRole("button", { name: "Check in Bo Neves" }),
    );

    expect(
      await screen.findByText(
        "This person answered maybe and has no seat yet.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("That member answered maybe and has no seat yet"),
    ).not.toBeInTheDocument();
  });

  it("falls back to the generic retry toast for an uncoded check-in failure", async () => {
    renderDoor(4);
    checkInState.rejectWith = new ApiError(500, "Internal server error");

    fireEvent.click(
      await screen.findByRole("button", { name: "Check in Bo Neves" }),
    );

    expect(
      await screen.findByText("That didn't go through. Try again in a moment."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Internal server error")).not.toBeInTheDocument();
  });
});

describe("LiveDoorDashboard door failures: undo", () => {
  it("gives an unmatched name its own undo refusal toast, with no retry invitation", async () => {
    renderDoor(4);
    undoState.rejectWith = MEMBER_NOT_FOUND_ERROR;

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Undo check-in for Ari Sousa",
      }),
    );

    expect(
      await screen.findByText("We couldn't undo this check-in."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Member not found")).not.toBeInTheDocument();
    expect(
      screen.queryByText("We couldn't check this person in."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("That didn't go through. Try again in a moment."),
    ).not.toBeInTheDocument();
  });

  it("names a member with no RSVP row as not on the guest list, with no retry invitation", async () => {
    renderDoor(4);
    undoState.rejectWith = NOT_ON_GUEST_LIST_ERROR;

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Undo check-in for Ari Sousa",
      }),
    );

    expect(
      await screen.findByText("This person isn't on the guest list."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("That didn't go through. Try again in a moment."),
    ).not.toBeInTheDocument();
  });

  it("falls back to the generic retry toast for an uncoded undo failure", async () => {
    renderDoor(4);
    undoState.rejectWith = new ApiError(500, "Internal server error");

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Undo check-in for Ari Sousa",
      }),
    );

    expect(
      await screen.findByText("That didn't go through. Try again in a moment."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Internal server error")).not.toBeInTheDocument();
  });
});

describe("LiveDoorDashboard door failures: card scan", () => {
  it("gives an unreadable card its own translated hint in the modal's field", async () => {
    renderDoor(4);
    checkInState.rejectWith = CARD_UNREADABLE_ERROR;

    await submitScannedCode();

    expect(
      await screen.findByText(
        "That card couldn't be read. Try finding them on the guest list.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "That card could not be read. Check them in by name instead.",
      ),
    ).not.toBeInTheDocument();
  });

  // Round 1's critical finding: a card that verified fine, for a member
  // who is waitlisted or answered maybe, must never be told "unreadable"
  // (the by-name workaround that copy pointed to cannot even reach this
  // member: `DoorGuestList` only renders `roster.going`).
  it("names a waitlisted member as waitlisted from a scanned card", async () => {
    renderDoor(4);
    checkInState.rejectWith = WAITLISTED_ERROR;

    await submitScannedCode();

    expect(
      await screen.findByText(
        "This person is on the waitlist. Promote them first, then check them in.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "That card couldn't be read. Try finding them on the guest list.",
      ),
    ).not.toBeInTheDocument();
  });

  it("names a maybe-RSVP member as having no seat yet from a scanned card", async () => {
    renderDoor(4);
    checkInState.rejectWith = MAYBE_ERROR;

    await submitScannedCode();

    expect(
      await screen.findByText(
        "This person answered maybe and has no seat yet.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "That card couldn't be read. Try finding them on the guest list.",
      ),
    ).not.toBeInTheDocument();
  });

  it("names a member with no RSVP row as not on the guest list from a scanned card", async () => {
    renderDoor(4);
    checkInState.rejectWith = NOT_ON_GUEST_LIST_ERROR;

    await submitScannedCode();

    expect(
      await screen.findByText("This person isn't on the guest list."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "That card couldn't be read. Try finding them on the guest list.",
      ),
    ).not.toBeInTheDocument();
  });

  it("falls back to the generic retry message for an uncoded card-scan failure, and does not claim the card was unreadable", async () => {
    renderDoor(4);
    checkInState.rejectWith = new ApiError(400, "Bad request");

    await submitScannedCode();

    expect(
      await screen.findByText("That didn't go through. Try again in a moment."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "That card couldn't be read. Try finding them on the guest list.",
      ),
    ).not.toBeInTheDocument();
  });
});
