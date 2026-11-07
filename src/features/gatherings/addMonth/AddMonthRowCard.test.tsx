import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { AddMonthRow, AddMonthRowIssue } from "./addMonthState";
import { AddMonthRowCard, type AddMonthRowContext } from "./AddMonthRowCard";
import { awaitCatalog } from "../../../test/awaitCatalog";

vi.mock("../fields/CoverUpload", () => ({
  CoverUpload: () => <div data-testid="cover-upload" />,
}));

const DATE = "2026-11-07";
const TEMPLATE_DESCRIPTION = "Films, popcorn and a chat after the credits";
const dispatch = vi.fn();

const ROW: AddMonthRow = {
  date: DATE,
  title: "",
  description: "",
  photo: null,
  timeOverride: null,
};

function contextWith(
  overrides: Partial<AddMonthRowContext> = {},
): AddMonthRowContext {
  return {
    sharedTimes: { startTime: "19:00", endTime: "23:00" },
    sharedCoverUrl: "https://cdn.example/cover.jpg",
    templateDescription: TEMPLATE_DESCRIPTION,
    shouldShowIssues: false,
    dispatch,
    ...overrides,
  };
}

async function renderCard({
  row = {},
  issues = [],
  serverMessage = null,
  context = {},
}: {
  row?: Partial<AddMonthRow>;
  issues?: AddMonthRowIssue[];
  serverMessage?: string | null;
  context?: Partial<AddMonthRowContext>;
} = {}) {
  const view = render(
    <TestProviders>
      <AddMonthRowCard
        row={{ ...ROW, ...row }}
        issues={issues}
        serverMessage={serverMessage}
        context={contextWith(context)}
      />
    </TestProviders>,
  );
  await awaitCatalog("gatherings");
  return view;
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

describe("AddMonthRowCard", () => {
  beforeEach(() => {
    dispatch.mockClear();
  });

  it("heads the card with the plain date", async () => {
    await renderCard();
    expect(
      screen.getByRole("heading", { name: "Sat 7 Nov" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveAttribute(
      "id",
      "add-month-row-2026-11-07",
    );
  });

  it("edits the title and description of its own date", async () => {
    await renderCard();
    await userEvent.type(screen.getByLabelText(/^Title/), "D");
    expect(dispatch).toHaveBeenCalledWith({
      type: "editRow",
      date: DATE,
      patch: { title: "D" },
    });
    await userEvent.type(screen.getByLabelText(/^Description/), "F");
    expect(dispatch).toHaveBeenCalledWith({
      type: "editRow",
      date: DATE,
      patch: { description: "F" },
    });
  });

  it("gives the title and description the field ids the page focuses", async () => {
    await renderCard();
    expect(screen.getByLabelText(/^Title/)).toHaveAttribute(
      "id",
      "add-month-row-2026-11-07-title",
    );
    expect(screen.getByLabelText(/^Description/)).toHaveAttribute(
      "id",
      "add-month-row-2026-11-07-description",
    );
  });

  it("fills an empty description with the template's", async () => {
    await renderCard();
    await userEvent.click(
      screen.getByRole("button", { name: "Same as the starting event" }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "editRow",
      date: DATE,
      patch: { description: TEMPLATE_DESCRIPTION },
    });
  });

  it("hides Same as the starting event once the description has text", async () => {
    await renderCard({ row: { description: "Our own words for this night" } });
    expect(
      screen.queryByRole("button", { name: "Same as the starting event" }),
    ).not.toBeInTheDocument();
  });

  it("marks the missing title only after the host tried to publish", async () => {
    const issues: AddMonthRowIssue[] = [
      { field: "title", problem: "titleMissing" },
    ];
    const { unmount } = await renderCard({ issues });
    expect(
      screen.queryByText("Add a title for this date."),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Title/)).not.toHaveAttribute("aria-invalid");
    unmount();

    await renderCard({ issues, context: { shouldShowIssues: true } });
    expect(screen.getByText("Add a title for this date.")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Title/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("names a start time that has already passed", async () => {
    await renderCard({
      issues: [{ field: "startTime", problem: "startPassed" }],
      context: { shouldShowIssues: true },
    });
    expect(
      screen.getByText(
        "This start time has already passed. Pick a later time.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the server's message on the card it named", async () => {
    await renderCard({
      serverMessage: "Sat 7 Nov has already passed.",
      issues: [{ field: "startTime", problem: "server" }],
    });
    expect(componentAlert()).toHaveTextContent("Sat 7 Nov has already passed.");
    const timeToggle = screen.getByRole("button", {
      name: "Change time for this date",
    });
    expect(timeToggle).toHaveAttribute("aria-invalid", "true");
    expect(timeToggle).toHaveAttribute(
      "id",
      "add-month-row-2026-11-07-startTime",
    );
  });

  it("lets the page focus the end time the server named", async () => {
    await renderCard({
      serverMessage: "The end time on Sat 7 Nov is not a time.",
      issues: [{ field: "endTime", problem: "server" }],
    });
    expect(
      screen.getByRole("button", { name: "Change time for this date" }),
    ).toHaveAttribute("id", "add-month-row-2026-11-07-endTime");
  });

  it("reads back the shared time and a night that ends the next day", async () => {
    await renderCard({
      context: { sharedTimes: { startTime: "22:00", endTime: "02:00" } },
    });
    expect(
      screen.getByText("22:00 to 02:00, ends the next day"),
    ).toBeInTheDocument();
  });

  it("opens its own time pair and goes back to the shared time", async () => {
    const { unmount } = await renderCard();
    await userEvent.click(
      screen.getByRole("button", { name: "Change time for this date" }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "setRowTime",
      date: DATE,
      timeOverride: { startTime: "19:00", endTime: "23:00" },
    });
    unmount();
    dispatch.mockClear();

    await renderCard({
      row: { timeOverride: { startTime: "20:00", endTime: null } },
    });
    expect(screen.getByText("From 20:00")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Use the shared time" }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "setRowTime",
      date: DATE,
      timeOverride: null,
    });
  });

  it("removes its date", async () => {
    await renderCard();
    await userEvent.click(
      screen.getByRole("button", { name: "Remove this date" }),
    );
    expect(dispatch).toHaveBeenCalledWith({ type: "removeDate", date: DATE });
  });
});
