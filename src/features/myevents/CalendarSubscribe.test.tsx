import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { CalendarSubscribe } from "./CalendarSubscribe";
import { MyEventsContext, type MyEventsValue } from "./MyEventsContext";
import type { MyEvent } from "./myEvents.types";

/**
 * "Export this month" has to hand the calendar app the SAME set of gatherings
 * the on-screen grid and agenda show for that month.
 *
 * The month filter used to be a hand-rolled year/month equality on the opening
 * day, so a festival running 29 September to 2 October appeared on the October
 * grid and was missing from the October file. The member's calendar app then
 * had a hole on days the screen said they were booked. `isInMonth` is the one
 * reading of "does this gathering run in this month", and this pins the export
 * to it.
 */

// The export writes a file, so the exporter is the seam: mocking it captures
// exactly which events the filter let through without touching the DOM's
// download machinery. `vi.hoisted` because `vi.mock` is itself hoisted above
// the imports, so a plain `const` would still be in its temporal dead zone
// when the factory runs.
const { downloadICS } = vi.hoisted(() => ({ downloadICS: vi.fn() }));
vi.mock("./myEvents.ics", () => ({ downloadICS }));

// Demo mode keeps the feed button toast-only and never reaches the network.
// `exportMonth` does not branch on it at all.
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({
    demoMode: true,
    available: false,
    setDemoMode: () => {},
    toggle: () => {},
  }),
}));

function event(overrides: Partial<MyEvent> & { id: string }): MyEvent {
  return {
    category: "going",
    title: overrides.id,
    date: "2026-10-10",
    start: "18:00",
    venue: "Somewhere",
    going: 0,
    ...overrides,
  };
}

/** A three-day festival opening in September and closing in October. */
const festival = event({
  id: "festival",
  date: "2026-09-29",
  start: "16:00",
  end: "14:00",
  endDate: "2026-10-02",
});
/** An ordinary single-day gathering inside October. */
const inOctober = event({ id: "in-october", date: "2026-10-10" });
/** October of ANOTHER year, which a month-only match used to sweep in. */
const octoberLastYear = event({ id: "october-last-year", date: "2025-10-10" });
/** Well clear of the month in view on both sides. */
const inNovember = event({ id: "in-november", date: "2026-11-04" });

// Only the fields `CalendarSubscribe` reads; the rest of the context is
// irrelevant here, so a partial is cast.
function contextValue(events: MyEvent[]): MyEventsValue {
  return {
    events,
    viewY: 2026,
    viewM: 9, // October
    toast: () => {},
  } as unknown as MyEventsValue;
}

function renderSubscribe(events: MyEvent[]) {
  return render(
    <I18nProvider>
      <MyEventsContext.Provider value={contextValue(events)}>
        <CalendarSubscribe />
      </MyEventsContext.Provider>
    </I18nProvider>,
  );
}

/** The ids the exporter was handed on the last call. */
function exportedIds(): string[] {
  const events = downloadICS.mock.calls.at(-1)?.[1] as MyEvent[];
  return events.map((exported) => exported.id);
}

describe("CalendarSubscribe export", () => {
  it("exports every gathering that RUNS in the month in view", async () => {
    downloadICS.mockClear();
    renderSubscribe([festival, inOctober, octoberLastYear, inNovember]);

    // `myevents` is a lazy namespace, so the copy resolves a render after
    // mount.
    const exportButton = await screen.findByRole("button", {
      name: /Export this month/i,
    });
    fireEvent.click(exportButton);

    expect(downloadICS).toHaveBeenCalledTimes(1);
    // The festival is in because it runs through 2 October, even though it
    // opened in September.
    expect(exportedIds()).toEqual(["festival", "in-october"]);
  });

  it("names the file for the month in view", async () => {
    downloadICS.mockClear();
    renderSubscribe([inOctober]);

    const exportButton = await screen.findByRole("button", {
      name: /Export this month/i,
    });
    fireEvent.click(exportButton);

    expect(downloadICS.mock.calls[0]?.[0]).toBe("queerpulse-october-2026.ics");
  });
});
