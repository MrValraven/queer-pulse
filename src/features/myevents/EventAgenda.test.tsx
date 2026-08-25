import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { EventAgenda } from "./EventAgenda";
import { MyEventsContext, type MyEventsValue } from "./MyEventsContext";

/**
 * The agenda column's failure branch (X-2 — myevents had zero tests).
 *
 * `EventAgenda` reads everything from `useMyEvents()`, so the cleanest seam is
 * the context itself: we mount a hand-built context value rather than the whole
 * `MyEventsProvider`. The behaviour under test is the deliberate guard in
 * `EventAgenda.tsx` — a failed live fetch (`hasError`) must surface a distinct
 * error + retry state and NOT masquerade as an empty calendar. That gate is
 * mode-independent, so no demo/live toggling or MSW is needed.
 *
 * i18n note: `myevents` is a lazy namespace, so translated copy resolves one
 * render after mount — `findBy*` is used for the first lookup of each string.
 * The error *title* is split across an `<em>` (…your <em>events</em>), so we
 * assert on the single-text-node description + the retry button instead.
 */

// Only the fields EventAgenda + buildAgenda actually read; the rest of the
// ~140-field context is irrelevant to this branch, so we cast a partial.
function contextValue(overrides: Partial<MyEventsValue>): MyEventsValue {
  return {
    events: [],
    pill: "upcoming",
    selectedDate: null,
    searchTerm: "",
    activeFilters: {
      inperson: false,
      online: false,
      free: false,
      paid: false,
      month: false,
    },
    sortBy: "date",
    viewM: 0,
    viewY: 2026,
    pastShown: 0,
    hasSecondary: false,
    loading: false,
    hasError: false,
    retry: () => {},
    loadMorePast: () => {},
    ...overrides,
  } as unknown as MyEventsValue;
}

function renderAgenda(value: MyEventsValue) {
  return render(
    <I18nProvider>
      <MyEventsContext.Provider value={value}>
        <EventAgenda />
      </MyEventsContext.Provider>
    </I18nProvider>,
  );
}

describe("EventAgenda", () => {
  it("shows a retry-able error state (not a false empty calendar) when the fetch failed", async () => {
    const retry = vi.fn();
    renderAgenda(contextValue({ hasError: true, retry }));

    // The error copy — the reassuring "your events are safe" description is a
    // single text node, so it resolves cleanly once the namespace loads.
    expect(
      await screen.findByText(/your events are safe/i),
    ).toBeInTheDocument();

    // The retry affordance is present and wired to the context's retry().
    const retryButton = screen.getByRole("button", { name: "Try again" });
    fireEvent.click(retryButton);
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("shows a loading skeleton — never the error state — while loading", () => {
    renderAgenda(contextValue({ loading: true, hasError: false }));

    // The skeleton is pure decorative markup: no retry button, no error copy.
    expect(
      screen.queryByRole("button", { name: "Try again" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/your events are safe/i)).not.toBeInTheDocument();
  });
});
