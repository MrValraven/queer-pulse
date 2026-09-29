import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { AttendeeRow } from "./api/events.adapters";
import { AttendeeNeeds } from "./AttendeeNeeds";

/**
 * The attendee's own answers on the host's lists (LOC-07, PRD-415). An
 * attendee who chose "Only the hosts" is named first, since that is the line
 * the host acts on at the door.
 */
const baseAttendee: AttendeeRow = {
  id: "att-ana",
  slug: "ana",
  initials: "A",
  background: "var(--paper)",
  color: "var(--ink)",
  name: "Ana",
  guestCount: 1,
  accessNeeds: "Step-free entry",
  dietaryNeeds: null,
  customAnswer: null,
  detailsVisibility: "justMe",
};

function renderNeeds(attendee: AttendeeRow) {
  render(
    <TestProviders>
      <AttendeeNeeds attendee={attendee} />
    </TestProviders>,
  );
}

describe("AttendeeNeeds", () => {
  it("leads with the hosts-only line when the attendee chose it", () => {
    renderNeeds(baseAttendee);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Only the hosts can see they're going");
    expect(items).toHaveLength(3);
  });

  it("leaves the hosts-only line out for any other choice", () => {
    renderNeeds({ ...baseAttendee, detailsVisibility: "everyone" });
    expect(
      screen.queryByText("Only the hosts can see they're going"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows the hosts-only line alone when there is nothing else", () => {
    renderNeeds({
      ...baseAttendee,
      guestCount: 0,
      accessNeeds: null,
    });
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("renders nothing for a viewer who is not an organiser", () => {
    renderNeeds({ ...baseAttendee, guestCount: undefined });
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
