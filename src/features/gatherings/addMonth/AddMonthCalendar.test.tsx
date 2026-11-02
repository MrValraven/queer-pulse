import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { AddMonthCalendar } from "./AddMonthCalendar";

const TODAY = "2026-11-02";
const LAST_DATE = "2027-11-02";

/** Holds the picks and the visible month the way the page does. */
function CalendarHarness({
  initialDates = [],
  initialMonth = "2026-11",
  onToggle,
}: {
  initialDates?: string[];
  initialMonth?: string;
  onToggle?: (date: string) => void;
}) {
  const [selectedDates, setSelectedDates] = useState(initialDates);
  const [visibleMonth, setVisibleMonth] = useState(initialMonth);
  return (
    <>
      <h2 id="dates-heading">Pick the dates</h2>
      <AddMonthCalendar
        selectedDates={selectedDates}
        today={TODAY}
        lastDate={LAST_DATE}
        visibleMonth={visibleMonth}
        onVisibleMonthChange={setVisibleMonth}
        onToggle={(date) => {
          onToggle?.(date);
          setSelectedDates((current) =>
            current.includes(date)
              ? current.filter((picked) => picked !== date)
              : [...current, date],
          );
        }}
        labelledBy="dates-heading"
      />
    </>
  );
}

function renderCalendar(props: Parameters<typeof CalendarHarness>[0] = {}) {
  return render(
    <TestProviders>
      <CalendarHarness {...props} />
    </TestProviders>,
  );
}

/** Puts focus on one day button, the way a click or a Tab would. */
function focusDay(name: string) {
  act(() => {
    screen.getByRole("button", { name }).focus();
  });
}

/** Every date from `first` for `count` days, as `YYYY-MM-DD`. */
function consecutiveDates(first: string, count: number): string[] {
  const start = new Date(`${first}T12:00:00Z`).getTime();
  return Array.from({ length: count }, (_unused, index) =>
    new Date(start + index * 86_400_000).toISOString().slice(0, 10),
  );
}

describe("AddMonthCalendar", () => {
  it("marks picked dates as pressed and toggles them", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderCalendar({ onToggle });
    const saturday = screen.getByRole("button", {
      name: "Saturday 7 November 2026",
    });
    expect(saturday).toHaveAttribute("aria-pressed", "false");
    await user.click(saturday);
    expect(onToggle).toHaveBeenCalledWith("2026-11-07");
    expect(saturday).toHaveAttribute("aria-pressed", "true");
    await user.click(saturday);
    expect(saturday).toHaveAttribute("aria-pressed", "false");
  });

  it("disables days before today and after the last allowed date", () => {
    renderCalendar();
    expect(
      screen.getByRole("button", { name: "Sunday 1 November 2026" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("button", { name: "Monday 2 November 2026" }),
    ).not.toHaveAttribute("aria-disabled");
  });

  it("tells a screen reader why a day outside the window is disabled", () => {
    renderCalendar();
    expect(
      screen.getByRole("button", { name: "Sunday 1 November 2026" }),
    ).toHaveAccessibleDescription(
      "Dates from today up to Tuesday 2 November 2027 can be picked.",
    );
    expect(
      screen.getByRole("button", { name: "Monday 2 November 2026" }),
    ).not.toHaveAttribute("aria-describedby");
  });

  it("disables the days after the last allowed date in its month", () => {
    renderCalendar({ initialMonth: "2027-11" });
    expect(
      screen.getByRole("button", { name: "Tuesday 2 November 2027" }),
    ).not.toHaveAttribute("aria-disabled");
    expect(
      screen.getByRole("button", { name: "Wednesday 3 November 2027" }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("keeps November picks when moving to December and back", async () => {
    const user = userEvent.setup();
    renderCalendar();
    await user.click(
      screen.getByRole("button", { name: "Saturday 28 November 2026" }),
    );
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("December 2026")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Saturday 5 December 2026" }),
    );
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(
      screen.getByRole("button", { name: "Saturday 28 November 2026" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("2 dates picked")).toBeInTheDocument();
  });

  it("stops Previous month at today's month and Next month at the last date's month", async () => {
    const user = userEvent.setup();
    renderCalendar();
    expect(
      screen.getByRole("button", { name: "Previous month" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next month" })).toBeEnabled();
    for (let step = 0; step < 12; step += 1) {
      await user.click(screen.getByRole("button", { name: "Next month" }));
    }
    expect(screen.getByText("November 2027")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Previous month" }),
    ).toBeEnabled();
  });

  it("pads the grid to whole weeks", () => {
    renderCalendar();
    const grid = screen.getByRole("group", {
      name: "Pick the dates November 2026",
    });
    // Seven weekday labels, then the cells of November 2026.
    expect(grid.children.length % 7).toBe(0);
  });

  it("at 31 dates disables the unpicked days and names the cap", () => {
    renderCalendar({ initialDates: consecutiveDates("2026-11-02", 31) });
    expect(
      screen.getByText("You can add up to 31 dates at a time."),
    ).toBeInTheDocument();
    expect(screen.getByText("31 dates picked")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Monday 2 November 2026" }),
    ).not.toHaveAttribute("aria-disabled");
    expect(
      screen.getByRole("button", { name: "Monday 2 November 2026" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("at 31 dates keeps the picked days open so one can be removed", async () => {
    const user = userEvent.setup();
    renderCalendar({ initialDates: consecutiveDates("2026-11-02", 31) });
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(
      screen.getByRole("button", { name: "Thursday 3 December 2026" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("button", { name: "Thursday 3 December 2026" }),
    ).toHaveAccessibleDescription("You can add up to 31 dates at a time.");
    await user.click(
      screen.getByRole("button", { name: "Wednesday 2 December 2026" }),
    );
    expect(
      screen.getByRole("button", { name: "Thursday 3 December 2026" }),
    ).not.toHaveAttribute("aria-disabled");
  });

  it("says one date picked in the singular", async () => {
    const user = userEvent.setup();
    renderCalendar();
    await user.click(
      screen.getByRole("button", { name: "Saturday 7 November 2026" }),
    );
    expect(screen.getByText("1 date picked")).toBeInTheDocument();
  });
});

describe("AddMonthCalendar keyboard", () => {
  it("a disabled day stays focusable and a click leaves it unpicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderCalendar({ onToggle });
    const sunday = screen.getByRole("button", {
      name: "Sunday 1 November 2026",
    });
    await user.click(sunday);
    expect(onToggle).not.toHaveBeenCalled();
    expect(sunday).toHaveAttribute("aria-pressed", "false");
  });

  it("gives the grid one Tab stop on today when nothing is picked", async () => {
    const user = userEvent.setup();
    renderCalendar();
    await user.tab();
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Monday 2 November 2026" }),
    ).toHaveFocus();
    const grid = screen.getByRole("group", {
      name: "Pick the dates November 2026",
    });
    const tabStops = Array.from(grid.querySelectorAll("button")).filter(
      (button) => button.tabIndex === 0,
    );
    expect(tabStops).toHaveLength(1);
  });

  it("puts the Tab stop on a picked day in the month on screen", () => {
    renderCalendar({ initialDates: ["2026-11-20"] });
    expect(
      screen.getByRole("button", { name: "Friday 20 November 2026" }),
    ).toHaveAttribute("tabindex", "0");
    expect(
      screen.getByRole("button", { name: "Monday 2 November 2026" }),
    ).toHaveAttribute("tabindex", "-1");
  });

  it("moves by day and week with the arrows and toggles with Space and Enter", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderCalendar({ onToggle });
    focusDay("Monday 2 November 2026");
    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("button", { name: "Tuesday 3 November 2026" }),
    ).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    const tuesdayTenth = screen.getByRole("button", {
      name: "Tuesday 10 November 2026",
    });
    expect(tuesdayTenth).toHaveFocus();
    expect(tuesdayTenth).toHaveAttribute("tabindex", "0");
    await user.keyboard("{ArrowUp}{ArrowLeft}");
    expect(
      screen.getByRole("button", { name: "Monday 2 November 2026" }),
    ).toHaveFocus();
    await user.keyboard(" ");
    expect(onToggle).toHaveBeenLastCalledWith("2026-11-02");
    await user.keyboard("{Enter}");
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("reaches a disabled day with the arrows and keeps its reason", async () => {
    const user = userEvent.setup();
    renderCalendar();
    focusDay("Monday 2 November 2026");
    await user.keyboard("{ArrowLeft}");
    const sunday = screen.getByRole("button", {
      name: "Sunday 1 November 2026",
    });
    expect(sunday).toHaveFocus();
    expect(sunday).toHaveAccessibleDescription(
      "Dates from today up to Tuesday 2 November 2027 can be picked.",
    );
    await user.keyboard("{ArrowLeft}");
    expect(sunday).toHaveFocus();
    expect(screen.getByText("November 2026")).toBeInTheDocument();
  });

  it("jumps to the week's ends with Home and End", async () => {
    const user = userEvent.setup();
    renderCalendar();
    focusDay("Wednesday 11 November 2026");
    await user.keyboard("{Home}");
    expect(
      screen.getByRole("button", { name: "Sunday 8 November 2026" }),
    ).toHaveFocus();
    await user.keyboard("{End}");
    expect(
      screen.getByRole("button", { name: "Saturday 14 November 2026" }),
    ).toHaveFocus();
  });

  it("changes month with PageDown and PageUp and with an arrow past the month's end", async () => {
    const user = userEvent.setup();
    renderCalendar();
    focusDay("Monday 30 November 2026");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("December 2026")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tuesday 1 December 2026" }),
    ).toHaveFocus();
    await user.keyboard("{PageDown}");
    expect(screen.getByText("January 2027")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Friday 1 January 2027" }),
    ).toHaveFocus();
    await user.keyboard("{PageUp}{PageUp}");
    expect(screen.getByText("November 2026")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sunday 1 November 2026" }),
    ).toHaveFocus();
    await user.keyboard("{PageUp}");
    expect(screen.getByText("November 2026")).toBeInTheDocument();
  });
});
