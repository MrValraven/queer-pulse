import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { AttendeeRow } from "../api/events.adapters";
import { DoorGuestList } from "./DoorGuestList";

/**
 * The door's guest list derives its two arrival chips from `checkedInCount`,
 * one of them by subtracting it from the roster length. That count is now
 * `number | null`, where `null` means the platform no longer keeps this
 * gathering's check-ins (they are cleared 30 days after it ends) and `0` still
 * means nobody arrived.
 *
 * These cover all four states the surface has to tell apart. The zero case is
 * here on purpose: it is the one a careless null fix breaks, by folding "no
 * longer kept" and "nobody came" back into a single rendering.
 */

function attendee(slug: string, hasArrived: boolean): AttendeeRow {
  return {
    id: `att-${slug}`,
    slug,
    initials: "AB",
    background: "#eee",
    color: "#333",
    name: slug === "ari" ? "Ari Sousa" : "Bo Neves",
    checkedInAt: hasArrived ? new Date("2026-08-26T20:00:00Z") : null,
  };
}

const ROSTER: AttendeeRow[] = [attendee("ari", true), attendee("bo", false)];

function renderList(
  checkedInCount: number | null,
  attendees = ROSTER,
  canCheckIn = checkedInCount !== null,
) {
  render(
    <TestProviders>
      <DoorGuestList
        attendees={attendees}
        checkedInCount={checkedInCount}
        canCheckIn={canCheckIn}
        pendingSlug={null}
        hasMore={false}
        isLoadingMore={false}
        onLoadMore={() => {}}
        onCheckIn={() => {}}
        onUndo={() => {}}
      />
    </TestProviders>,
  );
}

describe("DoorGuestList arrival chips", () => {
  it("counts arrived and still-expected while check-ins are kept", async () => {
    renderList(1);

    expect(await screen.findByText("All (2)")).toBeInTheDocument();
    expect(screen.getByText("Checked in (1)")).toBeInTheDocument();
    // Derived by subtraction: two on the roster, one through the door.
    expect(screen.getByText("Not yet (1)")).toBeInTheDocument();
    expect(
      screen.queryByText(/no longer kept for past gatherings/i),
    ).not.toBeInTheDocument();
  });

  it("keeps zero meaning zero: nobody has arrived yet", async () => {
    renderList(0, [attendee("ari", false), attendee("bo", false)]);

    expect(await screen.findByText("Checked in (0)")).toBeInTheDocument();
    expect(screen.getByText("Not yet (2)")).toBeInTheDocument();
    // A real zero is a count, so nothing here says the record is gone.
    expect(
      screen.queryByText(/no longer kept for past gatherings/i),
    ).not.toBeInTheDocument();
  });

  it("withdraws both arrival chips once the check-ins are no longer kept", async () => {
    renderList(null);

    // The roster total is still a fact, so it stays.
    expect(await screen.findByText("All (2)")).toBeInTheDocument();
    // Neither derived number is knowable, so neither is offered. In
    // particular nothing renders as "(0)", "(NaN)" or an empty chip.
    expect(screen.queryByText(/^Checked in \(/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Not yet \(/)).not.toBeInTheDocument();
  });

  it("explains in plain words why the arrival counts are absent", async () => {
    renderList(null);

    const note = await screen.findByText(
      "Check-ins are no longer kept for past gatherings. We clear them 30 days after a gathering ends.",
    );
    expect(note).toBeInTheDocument();
  });

  it("shows every guest when the arrival filters have been withdrawn", async () => {
    renderList(null);

    expect(await screen.findByText("Ari Sousa")).toBeInTheDocument();
    expect(screen.getByText("Bo Neves")).toBeInTheDocument();
  });
});

describe("DoorGuestList check-in affordance past the attendance window", () => {
  it("offers a check-in button per not-yet-arrived guest while the door is open", async () => {
    renderList(1);

    // Bo has not arrived, so Bo's row carries the button.
    expect(
      await screen.findByRole("button", { name: "Check in Bo Neves" }),
    ).toBeInTheDocument();
  });

  it("withdraws every check-in button once the window has closed", async () => {
    renderList(null);

    await screen.findByText("Bo Neves");
    // The server refuses this write, so the row does not pretend otherwise.
    expect(
      screen.queryByRole("button", { name: /^Check in / }),
    ).not.toBeInTheDocument();
  });

  it("keeps undo live on a cleared roster, since undo still works past the window", async () => {
    renderList(null);

    // Ari carries a stray arrival stamp the sweep has not reached. Removing it
    // deletes data rather than creating it, so the endpoint still honours it.
    expect(
      await screen.findByRole("button", {
        name: "Undo check-in for Ari Sousa",
      }),
    ).toBeInTheDocument();
  });
});
