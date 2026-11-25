import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { adminQuizshowEventBadgesPath, routes } from "../../../app/routeMap";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { gatheringDetails } from "../../gatherings/data";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS_SLUG,
  QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG,
} from "../../quizshow/api/quizshowDemoStore.data";
import { resetQuizWinBadgesDemoStore } from "../../quizshow/winBadges/quizWinBadgesDemoStore";
import { AdminQuizEventsPage } from "./AdminQuizEventsPage";

// The admin chrome (theme toggle, nav-badge queries, role switcher) has
// nothing to do with this list.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const eventSearch = vi.hoisted(() => ({ isEmpty: false }));

// One test reads an empty demo search; every other test reads the demo events.
vi.mock(
  "../../quizshow/winBadges/quizWinBadgesDemoStore",
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import("../../quizshow/winBadges/quizWinBadgesDemoStore")
      >();
    return {
      ...original,
      demoSearchQuizEvents: (q: string, page: unknown) =>
        eventSearch.isEmpty
          ? { items: [], total: 0, page: 1, pageSize: 20 }
          : original.demoSearchQuizEvents(q, page),
    };
  },
);

const titleOf = (slug: string) => gatheringDetails[slug]?.title ?? slug;

function renderPage() {
  return render(
    <TestProviders initialEntries={[routes.adminQuizshowEvents]}>
      <MotionProvider>
        <Routes>
          <Route
            path={routes.adminQuizshowEvents}
            element={<AdminQuizEventsPage />}
          />
        </Routes>
      </MotionProvider>
    </TestProviders>,
  );
}

async function eventTitles(): Promise<string[]> {
  await screen.findByRole("heading", {
    level: 2,
    name: titleOf(QUIZSHOW_DEMO_LIVE_SLUG),
  });
  return screen
    .getAllByRole("heading", { level: 2 })
    .map((heading) => heading.textContent ?? "");
}

beforeEach(() => {
  eventSearch.isEmpty = false;
  resetQuizWinBadgesDemoStore();
});

describe("AdminQuizEventsPage", () => {
  it("lists the three demo quiz events newest first", async () => {
    renderPage();
    await awaitCatalog("quizshow", "admin", "shared");

    // Pride Brunch starts 21 June, the co-op night 17 June, the clinic 12 June.
    expect(await eventTitles()).toEqual([
      titleOf(QUIZSHOW_DEMO_LIVE_SLUG),
      titleOf(QUIZSHOW_DEMO_RESULTS_SLUG),
      titleOf(QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG),
    ]);
    const brunchRow = screen
      .getByRole("heading", {
        level: 2,
        name: titleOf(QUIZSHOW_DEMO_LIVE_SLUG),
      })
      .closest("article");
    expect(brunchRow).not.toBeNull();
    if (!brunchRow) return;
    expect(
      within(brunchRow).getByText("2 games with badges, 1 played"),
    ).toBeInTheDocument();
    expect(within(brunchRow).getByText("Published")).toBeInTheDocument();
    // One page of results needs no pager.
    expect(screen.queryByText("Page 1 of 1")).toBeNull();
    expect(screen.queryByRole("button", { name: "Previous page" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Next page" })).toBeNull();
  });

  it("says no event has a quiz yet when nothing is searched", async () => {
    eventSearch.isEmpty = true;
    renderPage();
    await awaitCatalog("quizshow", "admin", "shared");

    expect(
      await screen.findByText("No event has a Pulse Live quiz yet"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("No event with a Pulse Live quiz matches this search"),
    ).toBeNull();
  });

  it("says no event matches a search that finds nothing", async () => {
    const user = userEvent.setup();
    renderPage();
    await awaitCatalog("quizshow", "admin", "shared");
    await eventTitles();

    await user.type(
      screen.getByRole("searchbox", { name: "Search events by title" }),
      "zzzz",
    );

    expect(
      await screen.findByText(
        "No event with a Pulse Live quiz matches this search",
        undefined,
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("No event has a Pulse Live quiz yet")).toBeNull();
  });

  it("filters by title after typing", async () => {
    const user = userEvent.setup();
    renderPage();
    await awaitCatalog("quizshow", "admin", "shared");
    await eventTitles();

    await user.type(
      screen.getByRole("searchbox", { name: "Search events by title" }),
      "brunch",
    );

    // The search waits 300 ms after the last key, then the other rows fold away.
    await waitFor(
      () =>
        expect(
          screen
            .getAllByRole("heading", { level: 2 })
            .map((heading) => heading.textContent),
        ).toEqual([titleOf(QUIZSHOW_DEMO_LIVE_SLUG)]),
      { timeout: 3000 },
    );
  });

  it("links a row to its badge setup", async () => {
    renderPage();
    await awaitCatalog("quizshow", "admin", "shared");
    await eventTitles();

    const brunchRow = screen
      .getByRole("heading", {
        level: 2,
        name: titleOf(QUIZSHOW_DEMO_LIVE_SLUG),
      })
      .closest("article");
    expect(brunchRow).not.toBeNull();
    if (!brunchRow) return;
    expect(
      within(brunchRow).getByRole("link", { name: "Set up badges" }),
    ).toHaveAttribute(
      "href",
      adminQuizshowEventBadgesPath("demo-event-pride-brunch-jun"),
    );
  });
});
