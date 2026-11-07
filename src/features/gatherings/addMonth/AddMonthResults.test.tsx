import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { routes } from "../../../app/routeMap";
import { TestProviders } from "../../../test/TestProviders";
import type { CreatedEventBatchEventDTO } from "../api/eventBatch.api";
import { gatheringPath } from "../gatheringPaths";
import {
  ADD_MONTH_FAILURE_HEADING_ID,
  AddMonthFailurePanel,
} from "./AddMonthFailurePanel";
import {
  ADD_MONTH_RESULTS_HEADING_ID,
  AddMonthResults,
} from "./AddMonthResults";
import type { EventBatchFailure } from "./eventBatchErrors";
import { awaitCatalog } from "../../../test/awaitCatalog";

const TIMEZONE = "Europe/Lisbon";

const DRAG_NIGHT: CreatedEventBatchEventDTO = {
  slug: "drag-night-2026-11-07",
  title: "Drag night",
  startAt: "2026-11-07T21:00:00.000Z",
};

const CREATED_EVENTS: CreatedEventBatchEventDTO[] = [
  DRAG_NIGHT,
  {
    slug: "drag-night-2026-11-14",
    title: "Drag night, ballroom edition",
    startAt: "2026-11-14T21:00:00.000Z",
  },
];

function failureOf(overrides: Partial<EventBatchFailure>): EventBatchFailure {
  return {
    reason: "server",
    status: 500,
    rowError: null,
    communityName: null,
    limit: null,
    lastDate: null,
    ...overrides,
  };
}

async function renderResults(
  events: readonly CreatedEventBatchEventDTO[] | null | undefined,
) {
  const onAddAnother = vi.fn();
  render(
    <TestProviders>
      <AddMonthResults
        events={events}
        timezone={TIMEZONE}
        onAddAnother={onAddAnother}
      />
    </TestProviders>,
  );
  await awaitCatalog("gatherings");
  return { onAddAnother };
}

async function renderFailure(failure: EventBatchFailure, hasMarkedRow = false) {
  render(
    <TestProviders>
      <AddMonthFailurePanel failure={failure} hasMarkedRow={hasMarkedRow} />
    </TestProviders>,
  );
  await awaitCatalog("gatherings");
}

/** The one alert this component renders. TestProviders also mounts the toast
 *  region, whose assertive live region carries the alert role while empty. */
function componentAlert(): HTMLElement {
  const alerts = screen
    .getAllByRole("alert")
    .filter((element) => element.closest("[data-toast-region]") === null);
  expect(alerts).toHaveLength(1);
  const [alert] = alerts;
  if (!alert) throw new Error("The component rendered no alert of its own");
  return alert;
}

describe("AddMonthResults", () => {
  it("names how many events went up", async () => {
    await renderResults(CREATED_EVENTS);
    expect(
      screen.getByRole("heading", { name: "2 events published" }),
    ).toBeInTheDocument();
  });

  it("gives its heading the id and tabindex focus lands on after a publish", async () => {
    await renderResults(CREATED_EVENTS);
    const heading = screen.getByRole("heading", { name: "2 events published" });
    expect(heading).toHaveAttribute("id", ADD_MONTH_RESULTS_HEADING_ID);
    expect(heading).toHaveAttribute("tabindex", "-1");
  });

  it("lists each new event with its date and a link to it", async () => {
    await renderResults(CREATED_EVENTS);
    expect(screen.getByRole("link", { name: "Drag night" })).toHaveAttribute(
      "href",
      gatheringPath("drag-night-2026-11-07"),
    );
    expect(screen.getByText("Sat 7 Nov, 21:00")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("links to the host's events", async () => {
    await renderResults(CREATED_EVENTS);
    expect(
      screen.getByRole("link", { name: "Go to your events" }),
    ).toHaveAttribute("href", routes.myEvents);
  });

  it("starts another month on Add another month", async () => {
    const { onAddAnother } = await renderResults(CREATED_EVENTS);
    await userEvent.click(
      screen.getByRole("button", { name: "Add another month" }),
    );
    expect(onAddAnother).toHaveBeenCalledTimes(1);
  });

  it("reads an empty answer as a published month and points to the host's events", async () => {
    await renderResults([]);
    expect(
      screen.getByRole("heading", { name: "Your month is published" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to your events" }),
    ).toHaveAttribute("href", routes.myEvents);
  });

  it("reads a missing events list the same way", async () => {
    await renderResults(undefined);
    expect(
      screen.getByRole("heading", { name: "Your month is published" }),
    ).toBeInTheDocument();
  });

  it("counts every answer row and lists only the rows it can link and date", async () => {
    const brokenRow = {
      title: "Lost row",
      startAt: "later",
    } as unknown as CreatedEventBatchEventDTO;
    await renderResults([DRAG_NIGHT, brokenRow]);
    expect(
      screen.getByRole("heading", { name: "2 events published" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.queryByText("Lost row")).not.toBeInTheDocument();
  });
});

describe("AddMonthFailurePanel", () => {
  it("failure panel says nothing was published and names the cause", async () => {
    await renderFailure(
      failureOf({
        reason: "dateInPast",
        status: 400,
        rowError: {
          code: "EVENT_BATCH_DATE_IN_PAST",
          rowIndex: 3,
          field: "date",
          date: "2026-11-21",
        },
      }),
      true,
    );
    expect(
      screen.getByRole("heading", { name: "Nothing was published" }),
    ).toBeInTheDocument();
    expect(componentAlert()).toHaveTextContent("Sat 21 Nov");
    expect(
      screen.getByText("We marked the date that needs a change."),
    ).toBeInTheDocument();
  });

  it("failure panel names a 413 with the same copy", async () => {
    await renderFailure(failureOf({ reason: "tooLarge", status: 413 }));
    expect(componentAlert()).toHaveTextContent(
      "This month has too much text to publish in one go.",
    );
  });

  it("leaves out the marked-date line when no card was marked", async () => {
    await renderFailure(failureOf({ reason: "server", status: 503 }));
    expect(
      screen.queryByText("We marked the date that needs a change."),
    ).not.toBeInTheDocument();
  });

  it("a timed-out publish sends the host to their events before any retry", async () => {
    await renderFailure(failureOf({ reason: "timedOut", status: 408 }));
    expect(
      screen.getByRole("heading", { name: "We couldn't confirm your month" }),
    ).toBeInTheDocument();
    expect(componentAlert()).toHaveTextContent(
      "Check your events before publishing again.",
    );
    expect(
      screen.getByRole("link", { name: "Go to your events" }),
    ).toHaveAttribute("href", routes.myEvents);
    expect(
      screen.queryByRole("button", { name: /try again|retry|publish/i }),
    ).not.toBeInTheDocument();
  });

  it("an unreachable server reads as an unconfirmed month with a way to the host's events", async () => {
    await renderFailure(failureOf({ reason: "unreachable", status: null }));
    expect(
      screen.getByRole("heading", { name: "We couldn't confirm your month" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Nothing was published" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to your events" }),
    ).toHaveAttribute("href", routes.myEvents);
  });

  it("an unreadable publish answer reads as an unconfirmed month", async () => {
    await renderFailure(failureOf({ reason: "unreadableAnswer", status: 422 }));
    expect(
      screen.getByRole("heading", { name: "We couldn't confirm your month" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to your events" }),
    ).toHaveAttribute("href", routes.myEvents);
  });

  it("gives its heading the id and tabindex focus lands on after a failure", async () => {
    await renderFailure(failureOf({ reason: "rateLimited", status: 429 }));
    const heading = screen.getByRole("heading", {
      name: "Nothing was published",
    });
    expect(heading).toHaveAttribute("id", ADD_MONTH_FAILURE_HEADING_ID);
    expect(heading).toHaveAttribute("tabindex", "-1");
  });

  it("a refused publish keeps Nothing was published and shows no events link", async () => {
    await renderFailure(failureOf({ reason: "rateLimited", status: 429 }));
    expect(
      screen.getByRole("heading", { name: "Nothing was published" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Go to your events" }),
    ).not.toBeInTheDocument();
  });
});
