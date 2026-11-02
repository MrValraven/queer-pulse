import { QueryClient } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { TestProviders } from "../../../test/TestProviders";
import type {
  CreateEventBatchDto,
  CreatedEventBatchDTO,
} from "../api/eventBatch.api";
import { EVENT_BATCH_TEMPLATE_KEY_ROOT } from "../api/useEventBatchTemplate";
import {
  formatRowDateLong,
  monthOf,
  shiftMonth,
  wallClockNow,
} from "./addMonthDates";
import { addMonthDraftKey, writeAddMonthDraft } from "./addMonthDraftStorage";
import { EMPTY_ADD_MONTH_STATE, type AddMonthState } from "./addMonthState";
import { AddEventMonthPage } from "./AddEventMonthPage";
import { resetDemoEventBatch } from "./eventBatchDemo";
import { ADD_MONTH_TEMPLATE_HEADING_ID } from "./useAddMonthPublish";

const mocks = vi.hoisted(() => ({
  canAddEventMonth: true,
  isTemplateReadFailing: false,
  createDemoEventBatch: null as
    null | ((dto: CreateEventBatchDto) => CreatedEventBatchDTO),
}));

vi.mock("./useCanAddEventMonth", () => ({
  useCanAddEventMonth: () => mocks.canAddEventMonth,
}));

vi.mock("./eventBatchDemo", async (importOriginal) => {
  const original = await importOriginal<typeof import("./eventBatchDemo")>();
  return {
    ...original,
    demoEventBatchTemplate: (slug: string) => {
      if (mocks.isTemplateReadFailing) {
        throw new ApiError(404, "Not found", {
          code: "EVENT_BATCH_TEMPLATE_NOT_FOUND",
        });
      }
      return original.demoEventBatchTemplate(slug);
    },
    createDemoEventBatch: (dto: CreateEventBatchDto, now: Date) =>
      mocks.createDemoEventBatch
        ? mocks.createDemoEventBatch(dto)
        : original.createDemoEventBatch(dto, now),
  };
});

const TEMPLATE_SLUG = "newcomers-mixer-july";
const scrollIntoViewSpy = vi.fn();
const DEMO_DRAFT_KEY = addMonthDraftKey("demo");

/** A day of next month in the demo zone, always inside the pickable window. */
function nextMonthDate(day: number): string {
  const today = wallClockNow("Europe/Lisbon", new Date()).date;
  return `${shiftMonth(monthOf(today), 1)}-${String(day).padStart(2, "0")}`;
}

function renderPage(
  path = "/create-gathering/month",
  queryClient?: QueryClient,
) {
  return render(
    <TestProviders initialEntries={[path]} queryClient={queryClient}>
      <AddEventMonthPage />
    </TestProviders>,
  );
}

async function pickTemplateAndDates(user: UserEvent, days: number[]) {
  await user.click(
    await screen.findByRole("radio", { name: /Newcomers Mixer: July/ }),
  );
  await user.click(await screen.findByRole("button", { name: "Next month" }));
  for (const day of days) {
    await user.click(
      screen.getByRole("button", {
        name: formatRowDateLong(nextMonthDate(day), "en"),
      }),
    );
  }
}

async function fillCardsAndPledges(user: UserEvent) {
  const cards = screen.getAllByRole("article");
  for (const [index, card] of cards.entries()) {
    await user.type(within(card).getByLabelText(/^Title/), `Night ${index}`);
    await user.type(
      within(card).getByLabelText(/^Description/),
      "Music and talk",
    );
  }
  const publishRegion = screen.getByRole("region", { name: "Publish" });
  for (const pledge of within(publishRegion).getAllByRole("checkbox")) {
    await user.click(pledge);
  }
}

/** The coded refusal the server sends for one row. */
function rowRefusal(code: string, date: string, rowIndex: number): ApiError {
  return new ApiError(400, "Refused", {
    code,
    rowIndex,
    field: "startTime",
    date,
  });
}

function threeRowState(): AddMonthState {
  return {
    ...EMPTY_ADD_MONTH_STATE,
    templateSlug: TEMPLATE_SLUG,
    timesTemplateSlug: TEMPLATE_SLUG,
    times: { startTime: "18:30", endTime: "21:00" },
    rows: [3, 10, 17].map((day) => ({
      date: nextMonthDate(day),
      title: `Mixer ${day}`,
      description: "A low-key evening",
      photo: null,
      timeOverride: null,
    })),
  };
}

describe("AddEventMonthPage", () => {
  beforeEach(() => {
    mocks.canAddEventMonth = true;
    mocks.createDemoEventBatch = null;
    mocks.isTemplateReadFailing = false;
    scrollIntoViewSpy.mockClear();
    Element.prototype.scrollIntoView = scrollIntoViewSpy;
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    resetDemoEventBatch();
    localStorage.clear();
  });

  it("explains the per-member switch to a member without access and links back to hosting", () => {
    mocks.canAddEventMonth = false;
    renderPage();
    expect(
      screen.getByText(/switched on per member while we try it out/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to hosting" }),
    ).toHaveAttribute("href", "/host");
    expect(screen.queryByRole("radiogroup")).toBeNull();
  });

  it("starts from the event named in the from param", async () => {
    const user = userEvent.setup();
    renderPage(`/create-gathering/month?from=${TEMPLATE_SLUG}`);
    // The picker folds to the chosen event; reopening it shows the pick.
    await user.click(
      await screen.findByRole("button", { name: "Use a different event" }),
    );
    expect(
      await screen.findByRole("radio", {
        name: /Newcomers Mixer: July/,
        checked: true,
      }),
    ).toBeInTheDocument();
  });

  it("publishes two dates in demo and lists both events", async () => {
    const user = userEvent.setup();
    renderPage();
    await pickTemplateAndDates(user, [10, 12]);
    await fillCardsAndPledges(user);
    await user.click(screen.getByRole("button", { name: "Publish 2 events" }));
    expect(
      await screen.findByRole("heading", { name: "2 events published" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Night/ })).toHaveLength(2);
  });

  it("scrolls to the first card that needs a change when a blocked publish is pressed", async () => {
    const user = userEvent.setup();
    renderPage();
    await pickTemplateAndDates(user, [10]);
    await user.click(screen.getByRole("button", { name: "Publish 1 event" }));
    expect(
      await screen.findByText("Add a title for this date."),
    ).toBeInTheDocument();
    expect(scrollIntoViewSpy).toHaveBeenCalled();
    expect(
      within(screen.getByRole("article")).getByLabelText(/^Title/),
    ).toHaveFocus();
  });

  it("marks the card the server named and scrolls to it", async () => {
    mocks.createDemoEventBatch = (dto) => {
      throw rowRefusal("EVENT_BATCH_DATE_IN_PAST", dto.rows[1]!.date, 1);
    };
    const user = userEvent.setup();
    renderPage();
    await pickTemplateAndDates(user, [10, 12]);
    await fillCardsAndPledges(user);
    await user.click(screen.getByRole("button", { name: "Publish 2 events" }));
    expect(
      await screen.findByRole("heading", { name: "Nothing was published" }),
    ).toBeInTheDocument();
    const [firstCard, secondCard] = screen.getAllByRole("article");
    expect(
      within(secondCard!).getByText(/has already passed/),
    ).toBeInTheDocument();
    expect(within(firstCard!).queryByText(/has already passed/)).toBeNull();
    expect(scrollIntoViewSpy).toHaveBeenCalled();
  });

  it("offers the saved month after a reload and restores every card", async () => {
    writeAddMonthDraft(DEMO_DRAFT_KEY, threeRowState(), Date.now());
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Resume" }));
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(3));
    expect(screen.getByDisplayValue("Mixer 17")).toBeInTheDocument();
  });

  it("holds the form inert until the saved-month offer is answered", async () => {
    writeAddMonthDraft(DEMO_DRAFT_KEY, threeRowState(), Date.now());
    const user = userEvent.setup();
    renderPage();
    const startFresh = await screen.findByRole("button", {
      name: "Start fresh",
    });
    const templateHeading = () =>
      document.getElementById(ADD_MONTH_TEMPLATE_HEADING_ID);
    expect(templateHeading()?.closest("[inert]")).not.toBeNull();
    expect(startFresh.closest("[inert]")).toBeNull();
    await user.click(startFresh);
    await waitFor(() =>
      expect(templateHeading()?.closest("[inert]")).toBeNull(),
    );
    expect(localStorage.getItem(DEMO_DRAFT_KEY)).toBeNull();
  });

  it("forgets the draft after a successful publish", async () => {
    const user = userEvent.setup();
    renderPage();
    await pickTemplateAndDates(user, [10, 12]);
    await fillCardsAndPledges(user);
    await waitFor(() =>
      expect(localStorage.getItem(DEMO_DRAFT_KEY)).not.toBeNull(),
    );
    await user.click(screen.getByRole("button", { name: "Publish 2 events" }));
    await screen.findByRole("heading", { name: "2 events published" });
    expect(localStorage.getItem(DEMO_DRAFT_KEY)).toBeNull();
  });

  it("opens the place editor when the server refuses the venue", async () => {
    mocks.createDemoEventBatch = () => {
      throw new ApiError(400, "Refused", {
        code: "EVENT_BATCH_VENUE_NOT_FOUND",
      });
    };
    const user = userEvent.setup();
    renderPage();
    await pickTemplateAndDates(user, [10]);
    await fillCardsAndPledges(user);
    await user.click(screen.getByRole("button", { name: "Publish 1 event" }));
    expect(
      await screen.findByRole("button", { name: "Done editing" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no longer listed in the directory/),
    ).toBeInTheDocument();
  });
  it("keeps the sections shown when a refetch of the loaded event fails", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const user = userEvent.setup();
    renderPage("/create-gathering/month", queryClient);
    await pickTemplateAndDates(user, [10]);
    mocks.isTemplateReadFailing = true;
    await act(() =>
      queryClient.refetchQueries({ queryKey: EVENT_BATCH_TEMPLATE_KEY_ROOT }),
    );
    await waitFor(() =>
      expect(
        queryClient
          .getQueryCache()
          .findAll({ queryKey: EVENT_BATCH_TEMPLATE_KEY_ROOT })
          .some((query) => query.state.status === "error"),
      ).toBe(true),
    );
    // The query holds its loaded data and its error together.
    expect(
      screen.getByRole("heading", { name: "Pick the dates" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.queryByText(/can no longer be used/)).toBeNull();
  });
});
