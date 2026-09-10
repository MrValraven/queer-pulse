import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { CalendarEvent } from "../data";
import { CalendarView } from "./CalendarView";

/**
 * The Calendar tab of the Events Hub.
 *
 * It used to ask two questions that a multi-day gathering cannot answer. "All
 * upcoming" kept only gatherings whose START was still ahead, throwing away
 * exactly the running ones `filter=upcoming` goes out of its way to send; and
 * each day cell asked which day a gathering STARTS on, so a three-day festival
 * showed a single dot and clicking day two claimed the day was empty.
 */

function gathering(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    date: new Date(2026, 9, 17, 23, 0),
    org: "Community",
    orgColor: "var(--violet)",
    title: "A gathering",
    hood: "Anjos",
    to: "/gatherings/a-gathering",
    kind: "gathering",
    ...overrides,
  };
}

/** 01:00 on Sunday 18 October, an hour into the overnight party. */
const DURING_THE_PARTY = new Date(2026, 9, 18, 1, 0);

const OVERNIGHT_PARTY = gathering({
  title: "Overnight party",
  date: new Date(2026, 9, 17, 23, 0),
  endAt: new Date(2026, 9, 18, 4, 0),
});

const FESTIVAL = gathering({
  title: "Three-day festival",
  date: new Date(2026, 9, 17, 12, 0),
  endAt: new Date(2026, 9, 19, 22, 0),
  to: "/gatherings/three-day-festival",
});

const LAST_NIGHT = gathering({
  title: "Last night's supper",
  date: new Date(2026, 9, 16, 19, 0),
  to: "/gatherings/last-nights-supper",
});

function renderCalendar(events: CalendarEvent[], now: Date) {
  return render(<CalendarView events={events} now={now} />, {
    wrapper: TestProviders,
  });
}

describe("CalendarView", () => {
  it("keeps a gathering that is running under all upcoming", () => {
    renderCalendar([OVERNIGHT_PARTY], DURING_THE_PARTY);
    expect(screen.getByText("Overnight party")).toBeInTheDocument();
  });

  it("still drops a gathering that has ended", () => {
    renderCalendar([LAST_NIGHT], DURING_THE_PARTY);
    expect(screen.queryByText("Last night's supper")).not.toBeInTheDocument();
  });

  it("dots every day a three-day festival runs on", () => {
    const { container } = renderCalendar([FESTIVAL], DURING_THE_PARTY);
    expect(
      container.querySelectorAll('[title="Three-day festival"]'),
    ).toHaveLength(3);
  });

  it("dots only the start day when a gathering has no stated end", () => {
    const { container } = renderCalendar(
      [gathering({ title: "Supper club", date: new Date(2026, 9, 20, 19, 0) })],
      DURING_THE_PARTY,
    );
    expect(container.querySelectorAll('[title="Supper club"]')).toHaveLength(1);
  });

  it("lists a festival under the second day of its run", () => {
    renderCalendar([FESTIVAL], DURING_THE_PARTY);
    // Only the "all upcoming" list carries it before a day is picked.
    expect(screen.getAllByText("Three-day festival")).toHaveLength(1);
    fireEvent.click(screen.getByText("18"));
    // Now the selected-day sidebar carries it too.
    expect(screen.getAllByText("Three-day festival")).toHaveLength(2);
  });
});
