import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, render, screen, fireEvent } from "@testing-library/react";
import { useCalendarState } from "./useCalendarState";
import { compareDate } from "./plainDate";
import { Calendar } from "./Calendar";
import { DatePicker } from "./DatePicker";
import { RangeCalendar } from "./RangeCalendar";
import { TestProviders } from "../../../test/TestProviders";

const base = { value: { year: 2026, month: 3, day: 5 }, onSelect: () => {}, weekStart: 0 };

describe("useCalendarState", () => {
  it("builds a 6x7 grid for the visible month", () => {
    const { result } = renderHook(() => useCalendarState(base));
    expect(result.current.weeks).toHaveLength(6);
    expect(result.current.weeks[0]).toHaveLength(7);
  });
  it("moveFocus('day', 1) advances focus and pages month at boundary", () => {
    const { result } = renderHook(() =>
      useCalendarState({ ...base, value: { year: 2026, month: 3, day: 31 } }));
    act(() => result.current.moveFocus("day", 1));
    expect(result.current.focusedDate).toEqual({ year: 2026, month: 4, day: 1 });
    expect(result.current.visibleMonth.month).toBe(4);
  });
  it("isDisabled respects min/max", () => {
    const { result } = renderHook(() =>
      useCalendarState({ ...base, minDate: { year: 2026, month: 3, day: 10 } }));
    expect(result.current.isDisabled({ year: 2026, month: 3, day: 9 })).toBe(true);
    expect(result.current.isDisabled({ year: 2026, month: 3, day: 10 })).toBe(false);
  });
  it("select ignores disabled dates", () => {
    let picked: unknown = null;
    const { result } = renderHook(() =>
      useCalendarState({ ...base, onSelect: (date) => { picked = date; },
        isDateUnavailable: () => true }));
    act(() => result.current.select({ year: 2026, month: 3, day: 6 }));
    expect(picked).toBeNull();
  });
  // Fix C: a far jump (e.g. a month/year dropdown, simulated here via
  // `focusDate` straight to day 1) that lands below `minDate` must not strand
  // focus on a disabled cell, or the grid becomes keyboard-unreachable.
  it("clamps a focus jump below minDate onto an enabled cell, not a disabled one", () => {
    const { result } = renderHook(() =>
      useCalendarState({ ...base, minDate: { year: 2026, month: 3, day: 10 } }));
    act(() => result.current.focusDate({ year: 2026, month: 3, day: 1 }));
    expect(result.current.isDisabled(result.current.focusedDate)).toBe(false);
    expect(compareDate(result.current.focusedDate, { year: 2026, month: 3, day: 10 })).toBeGreaterThanOrEqual(0);
  });
  it("moveFocus redirects past a disabled target to the nearest enabled day", () => {
    const { result } = renderHook(() =>
      useCalendarState({
        ...base,
        value: { year: 2026, month: 3, day: 10 },
        minDate: { year: 2026, month: 3, day: 10 },
      }));
    // One day back from the 10th would land on the 9th, which is below
    // minDate: the hook should redirect focus to an enabled day instead.
    act(() => result.current.moveFocus("day", -1));
    expect(result.current.isDisabled(result.current.focusedDate)).toBe(false);
  });
  // Direction-aware search regression: an ArrowLeft off a disabled day must
  // keep moving backward to the previous enabled day, never bounce forward
  // back onto the cell focus already had (which would silently swallow the
  // keypress). Day 10 alone is unavailable; focus starts just after it.
  it("moveFocus('day', -1) off a disabled mid-range day lands on the day before it, not back where it started", () => {
    const { result } = renderHook(() =>
      useCalendarState({
        ...base,
        value: { year: 2026, month: 3, day: 11 },
        isDateUnavailable: (date) => date.day === 10,
      }));
    act(() => result.current.moveFocus("day", -1));
    expect(result.current.focusedDate).toEqual({ year: 2026, month: 3, day: 9 });
  });
});

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: TestProviders });
}

describe("Calendar", () => {
  it("renders a grid labelled by the month caption", () => {
    renderWithProviders(<Calendar value="2026-03-05" onChange={() => {}} locale="en-US" />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("ArrowRight moves focus to the next day", () => {
    renderWithProviders(
      <Calendar value="2026-03-05" onChange={() => {}} locale="en-US" autoFocusDate />,
    );
    fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowRight" });
    // day 6 button now has tabindex 0
    expect(screen.getByRole("button", { name: /March 6, 2026/ })).toHaveAttribute(
      "tabindex",
      "0",
    );
  });

  it("Enter selects the focused date and calls onChange with ISO", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <Calendar value="2026-03-05" onChange={onChange} locale="en-US" autoFocusDate />,
    );
    fireEvent.keyDown(screen.getByRole("grid"), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("2026-03-05");
  });

  it("disables dates before min", () => {
    renderWithProviders(
      <Calendar value="2026-03-05" min="2026-03-10" onChange={() => {}} locale="en-US" />,
    );
    expect(screen.getByRole("button", { name: /March 9, 2026/ })).toBeDisabled();
  });

  it("month dropdown jumps the visible month", () => {
    renderWithProviders(<Calendar value="2026-03-05" onChange={() => {}} locale="en-US" />);
    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    fireEvent.click(screen.getByRole("option", { name: "June" }));
    expect(screen.getByText("June 2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /June 1, 2026/ })).toBeInTheDocument();
  });

  it("year dropdown jumps the visible year", () => {
    renderWithProviders(<Calendar value="2026-03-05" onChange={() => {}} locale="en-US" />);
    fireEvent.click(screen.getByRole("button", { name: "Year" }));
    fireEvent.click(screen.getByRole("option", { name: "1990" }));
    expect(screen.getByText("March 1990")).toBeInTheDocument();
  });

  it("selecting a month leaves focus on the Select trigger, not the grid", () => {
    renderWithProviders(<Calendar value="2026-03-05" onChange={() => {}} locale="en-US" />);
    const monthTrigger = screen.getByRole("button", { name: "Month" });
    fireEvent.click(monthTrigger);
    fireEvent.click(screen.getByRole("option", { name: "June" }));
    expect(monthTrigger).toHaveFocus();
  });
});

describe("DatePicker", () => {
  it("opens the calendar popover on trigger click and selects a date", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DatePicker mode="date" value="2026-03-05" onChange={onChange} label="Event date" locale="en-US" />,
    );
    fireEvent.click(screen.getByRole("button", { name: /choose date/i }));
    fireEvent.click(screen.getByRole("button", { name: /March 12, 2026/ }));
    expect(onChange).toHaveBeenCalledWith("2026-03-12");
  });

  it("clearable resets to null", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DatePicker mode="date" value="2026-03-05" clearable onChange={onChange} label="d" locale="en-US" />,
    );
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("exposes formFieldControl for FormField wiring", () => {
    expect((DatePicker as unknown as { formFieldControl?: boolean }).formFieldControl).toBe(true);
  });

  it("mode=time renders a time field without a date grid", () => {
    renderWithProviders(<DatePicker mode="time" value="09:30" onChange={() => {}} label="Start" locale="en-US" />);
    fireEvent.click(screen.getByRole("button", { name: /choose time/i }));
    expect(screen.queryByRole("grid")).toBeNull();
  });

  it("mode=range opens a RangeCalendar popover and picks a range", () => {
    vi.setSystemTime(new Date(2026, 2, 15)); // Sun 15 Mar 2026: RangeCalendar's `value={null}` default anchors on "today"
    const onChange = vi.fn();
    renderWithProviders(
      <DatePicker mode="range" value={null} onChange={onChange} label="Stay" locale="en-US" />,
    );
    fireEvent.click(screen.getByRole("button", { name: /choose date range/i }));
    fireEvent.click(screen.getByRole("button", { name: /March 5, 2026/ }));
    fireEvent.click(screen.getByRole("button", { name: /March 9, 2026/ }));
    expect(onChange).toHaveBeenLastCalledWith({ start: "2026-03-05", end: "2026-03-09" });
    vi.useRealTimers();
  });

  // Task 8: presets + "Today" affordance.
  it("renders presets and emits the chosen value", () => {
    // Frozen to match the preset's own value below: Today is suppressed only
    // on an actual value collision with today (see DatePickerPopoverContent.tsx),
    // so this test needs "today" to genuinely BE 2026-03-13 for there to be a
    // single "Today"-named button to query.
    vi.setSystemTime(new Date(2026, 2, 13)); // Fri 13 Mar 2026
    const onChange = vi.fn();
    render(
      <DatePicker
        mode="date"
        value={null}
        label="d"
        locale="en-US"
        presets={[{ labelKey: "calendar.preset.today", value: "2026-03-13" }]}
        onChange={onChange}
      />,
      { wrapper: TestProviders },
    );
    fireEvent.click(screen.getByRole("button", { name: /choose date/i }));
    fireEvent.click(screen.getByRole("button", { name: /today/i }));
    expect(onChange).toHaveBeenCalledWith("2026-03-13");
    vi.useRealTimers();
  });

  it("keeps the Today button when presets don't include today's value", () => {
    vi.setSystemTime(new Date(2026, 2, 13)); // Fri 13 Mar 2026
    const onChange = vi.fn();
    renderWithProviders(
      <DatePicker
        mode="date"
        value={null}
        label="d"
        locale="en-US"
        presets={[
          { labelKey: "calendar.preset.tomorrow", value: "2026-03-14" },
          { labelKey: "calendar.preset.nextWeek", value: "2026-03-20" },
        ]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /choose date/i }));
    expect(screen.getByRole("button", { name: "Tomorrow" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next week" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^today$/i }));
    expect(onChange).toHaveBeenCalledWith("2026-03-13");
    vi.useRealTimers();
  });

  it("the Today button (shown when no preset matches today) selects today and closes", () => {
    vi.setSystemTime(new Date(2026, 2, 13)); // Fri 13 Mar 2026
    const onChange = vi.fn();
    renderWithProviders(
      <DatePicker mode="date" value="2026-03-05" onChange={onChange} label="d" locale="en-US" />,
    );
    fireEvent.click(screen.getByRole("button", { name: /choose date/i }));
    fireEvent.click(screen.getByRole("button", { name: /^today$/i }));
    expect(onChange).toHaveBeenCalledWith("2026-03-13");
    expect(screen.queryByRole("dialog")).toBeNull();
    vi.useRealTimers();
  });

  // Below the `--mobile` breakpoint the same popover content renders inside
  // `ModalSheet` instead of the desktop absolute `DatePickerPopover` — stub
  // `matchMedia` the same way `BottomTabBar.test.tsx` does, then unstub so
  // the desktop-defaulting stub from `src/test/setup.ts` isn't leaked into
  // sibling tests in this file.
  it("mobile: renders the same content inside a ModalSheet dialog and isn't self-closed by outside-dismiss", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("max-width: 860px"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    try {
      renderWithProviders(
        <DatePicker mode="date" value="2026-03-05" onChange={() => {}} label="Event date" locale="en-US" />,
      );
      fireEvent.click(screen.getByRole("button", { name: /choose date/i }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      const dayButton = screen.getByRole("button", { name: /March 12, 2026/ });
      expect(dayButton).toBeInTheDocument();
      // A pointerdown landing inside the sheet's portaled content (outside
      // `containerRef`, since `ModalSheet` portals to `document.body`) must
      // NOT trigger `useOutsideDismiss` — that hook is disabled on mobile
      // specifically to avoid this (see `DatePicker.tsx`).
      fireEvent.pointerDown(dayButton);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      // Still dismisses cleanly via the sheet's own Escape handling.
      fireEvent.keyDown(document.body, { key: "Escape" });
      expect(screen.queryByRole("dialog")).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("RangeCalendar", () => {
  // `value={null}` anchors the visible pair on today's month (see
  // `RangeCalendar`'s `anchorSeed`), so these tests freeze the system clock
  // to March 2026 to keep the March 5/9 button queries deterministic.
  afterEach(() => {
    vi.useRealTimers();
  });

  it("selects a range across two clicks (start then end)", () => {
    vi.setSystemTime(new Date(2026, 2, 15)); // Sun 15 Mar 2026
    const onChange = vi.fn();
    renderWithProviders(<RangeCalendar value={null} onChange={onChange} locale="en-US" />);
    fireEvent.click(screen.getByRole("button", { name: /March 5, 2026/ }));
    fireEvent.click(screen.getByRole("button", { name: /March 9, 2026/ }));
    expect(onChange).toHaveBeenLastCalledWith({ start: "2026-03-05", end: "2026-03-09" });
  });

  it("normalizes a reversed selection", () => {
    vi.setSystemTime(new Date(2026, 2, 15)); // Sun 15 Mar 2026
    const onChange = vi.fn();
    renderWithProviders(<RangeCalendar value={null} onChange={onChange} locale="en-US" />);
    fireEvent.click(screen.getByRole("button", { name: /March 9, 2026/ }));
    fireEvent.click(screen.getByRole("button", { name: /March 5, 2026/ }));
    expect(onChange).toHaveBeenLastCalledWith({ start: "2026-03-05", end: "2026-03-09" });
  });

  it("renders two month grids", () => {
    renderWithProviders(<RangeCalendar value={null} onChange={() => {}} locale="en-US" />);
    expect(screen.getAllByRole("grid")).toHaveLength(2);
  });

  it("ArrowRight moves real DOM focus (not just tabindex) to the next day", () => {
    vi.setSystemTime(new Date(2026, 2, 15)); // Sun 15 Mar 2026
    renderWithProviders(<RangeCalendar value={null} onChange={() => {}} locale="en-US" />);
    // The left grid's initially-tabbable day (today, per the frozen clock).
    const startButton = screen.getByRole("button", { name: /March 15, 2026/ });
    startButton.focus();
    fireEvent.keyDown(screen.getAllByRole("grid")[0]!, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: /March 16, 2026/ })).toHaveFocus();
  });
});
