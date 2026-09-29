import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SLOT_VALUE_PREFIX } from "../../../shared/i18n/translate";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_ISSUE, DEMO_ISSUES, type Issue } from "../data/desk.data";
import { formattedCountValues, issueCloseState } from "./deskHeaderCopy";
import { DeskPulseHeader, type DeskPulseHeaderProps } from "./DeskPulseHeader";

function renderHeader(overrides: Partial<DeskPulseHeaderProps> = {}) {
  const props: DeskPulseHeaderProps = {
    issue: DEMO_ISSUE,
    issues: DEMO_ISSUES,
    onSelectIssueScope: vi.fn(),
    track: "issue",
    onTrack: vi.fn(),
    hasCurrentIssue: true,
    unassignedCount: 3,
    everythingCount: 14,
    everythingIssueCount: 2,
    onNewIssue: vi.fn(),
    onWrite: vi.fn(),
    isWriting: false,
    onBuildDeck: vi.fn(),
    onCommission: vi.fn(),
    onProduce: vi.fn(),
    ...overrides,
  };
  render(
    <TestProviders>
      <DeskPulseHeader {...props} />
    </TestProviders>,
  );
  return props;
}

function issueWith(changes: Partial<Issue>): Issue {
  return { ...DEMO_ISSUE, ...changes };
}

/** A local calendar day `offsetDays` from today, as `YYYY-MM-DD`. */
function isoDayFromToday(offsetDays: number): string {
  const day = new Date();
  day.setDate(day.getDate() + offsetDays);
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const date = String(day.getDate()).padStart(2, "0");
  return `${day.getFullYear()}-${month}-${date}`;
}

describe("DeskPulseHeader", () => {
  it("puts the h1 before every control", async () => {
    renderHeader();
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("The desk");
    const [firstButton] = screen.getAllByRole("button");
    expect(
      heading.compareDocumentPosition(firstButton!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows the title on screen", async () => {
    renderHeader();
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).not.toHaveClass("visuallyHidden");
  });

  it("names the scope trigger by what it does and the scope it shows", async () => {
    renderHeader({ track: "everything" });
    expect(
      await screen.findByRole("button", {
        name: "Change what the desk shows: Everything in flight",
      }),
    ).toBeInTheDocument();
  });

  it("reads the close date, days left and slots while the issue is open", async () => {
    renderHeader({
      issue: issueWith({ closesOn: isoDayFromToday(9), daysLeft: 9 }),
    });
    expect(await screen.findByText("Closes 12 Aug")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "9 days left Change close date" }),
    ).toBeInTheDocument();
    expect(screen.getByText("11 of 15 slots filled")).toBeInTheDocument();
    const meter = screen.getByRole("progressbar", {
      name: "Issue slots filled",
    });
    expect(meter).toHaveAttribute("aria-valuenow", "11");
    expect(meter).toHaveAttribute("aria-valuemax", "15");
  });

  it("falls back to the publish date when the close date is blank", async () => {
    renderHeader({
      issue: issueWith({ closes: "", closesOn: null, daysLeft: 0 }),
    });
    expect(await screen.findByText("Publishes 1 Sep")).toBeInTheDocument();
    expect(screen.queryByText(/days? left/)).not.toBeInTheDocument();
  });

  it("shows the slot count alone when neither date is set", async () => {
    renderHeader({
      issue: issueWith({ closes: "", closesOn: null, publishes: "" }),
    });
    expect(
      await screen.findByText("11 of 15 slots filled"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Closes|Publishes/)).not.toBeInTheDocument();
  });

  it("drops the slot count and the meter when the issue has no slots", async () => {
    renderHeader({ issue: issueWith({ filled: 0, slots: 0 }) });
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByText(/slots filled/)).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("marks days left as closing soon only while slots are still open", async () => {
    renderHeader({
      issue: issueWith({ closesOn: isoDayFromToday(2), daysLeft: 2 }),
    });
    const countdown = await screen.findByRole("button", {
      name: /^2 days left/,
    });
    expect(countdown.closest("[data-closing-soon]")).toHaveAttribute(
      "data-closing-soon",
      "true",
    );
  });

  it("keeps days left calm once every slot is filled", async () => {
    renderHeader({
      issue: issueWith({
        closesOn: isoDayFromToday(1),
        daysLeft: 1,
        filled: 15,
        slots: 15,
      }),
    });
    const countdown = await screen.findByRole("button", {
      name: /^1 day left/,
    });
    expect(countdown.closest("[data-closing-soon]")).toBeNull();
  });

  it("reads a passed close date as closed, in the neutral tone", async () => {
    renderHeader({
      issue: issueWith({ closesOn: isoDayFromToday(-3), daysLeft: 0 }),
    });
    expect(await screen.findByText("Closed 12 Aug")).not.toHaveAttribute(
      "data-closing-soon",
    );
    expect(screen.queryByText(/days? left/)).not.toBeInTheDocument();
  });

  it("turns the slot count into a door to the issue plan when asked", async () => {
    const user = userEvent.setup();
    const onOpenPlan = vi.fn();
    renderHeader({ onOpenPlan });
    await user.click(
      await screen.findByRole("button", {
        name: "11 of 15 slots filled Open the issue plan",
      }),
    );
    expect(onOpenPlan).toHaveBeenCalledTimes(1);
  });

  it("reads the slot count from the pieces when slot totals are given", async () => {
    renderHeader({ slotTotals: { filled: 9, slots: 15, open: 6 } });
    expect(await screen.findByText("9 of 15 slots filled")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Issue slots filled" }),
    ).toHaveAttribute("aria-valuenow", "9");
  });

  it("opens Issue production from the scope menu", async () => {
    const user = userEvent.setup();
    const props = renderHeader();
    await user.click(
      await screen.findByRole("button", { name: /Change what the desk shows/ }),
    );
    await user.click(
      within(screen.getByRole("menu")).getByRole("menuitem", {
        name: /Issue production/,
      }),
    );
    expect(props.onProduce).toHaveBeenCalledTimes(1);
  });

  it("shows the unfiled count and keeps Issue production out of the header row", async () => {
    renderHeader({ track: "unassigned", unassignedCount: 3 });
    expect(
      await screen.findByText("3 pieces not in an issue yet"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Issue production/ }),
    ).not.toBeInTheDocument();
  });

  it("counts pieces across issues on the everything scope", async () => {
    renderHeader({ track: "everything" });
    expect(
      await screen.findByText("14 pieces in flight across 2 issues"),
    ).toBeInTheDocument();
  });

  it("counts unfiled in-flight pieces apart from the issue that holds the rest", async () => {
    const onlyIssue = DEMO_ISSUES[0]!;
    renderHeader({
      track: "everything",
      everythingCount: 12,
      everythingIssueCount: 1,
      pieceCountByIssueId: { [onlyIssue.id]: 9 },
    });
    expect(await screen.findByText("12 pieces in flight")).toBeInTheDocument();
    expect(
      screen.getByText(`9 in Issue ${onlyIssue.number}`),
    ).toBeInTheDocument();
    expect(screen.getByText("3 unfiled")).toBeInTheDocument();
  });

  it("opens the close-date calendar from the countdown", async () => {
    const user = userEvent.setup();
    renderHeader({
      issue: issueWith({ closesOn: isoDayFromToday(9), daysLeft: 9 }),
    });
    await user.click(
      await screen.findByRole("button", { name: /^9 days left/ }),
    );
    expect(
      screen.getByRole("dialog", { name: "Choose a close date" }),
    ).toBeInTheDocument();
  });

  it("picks an issue scope with one callback", async () => {
    const user = userEvent.setup();
    const props = renderHeader({ track: "unassigned" });
    await user.click(await screen.findByRole("button", { name: /Unfiled/ }));
    const issueOption = DEMO_ISSUES[1]!;
    await user.click(
      within(screen.getByRole("menu")).getByRole("menuitemradio", {
        name: `Issue ${issueOption.number} · ${issueOption.title}`,
      }),
    );
    expect(props.onSelectIssueScope).toHaveBeenCalledExactlyOnceWith(
      issueOption.number,
    );
    expect(props.onTrack).not.toHaveBeenCalled();
  });

  it("offers every way to start work from the New menu", async () => {
    const user = userEvent.setup();
    const props = renderHeader({ isWriting: true });
    await user.click(await screen.findByRole("button", { name: /^New/ }));
    const menu = screen.getByRole("menu");
    expect(
      within(menu).getByRole("menuitem", { name: "Write an article" }),
    ).toHaveAttribute("aria-disabled", "true");
    await user.click(
      within(menu).getByRole("menuitem", { name: "Commission a writer" }),
    );
    expect(props.onCommission).toHaveBeenCalledTimes(1);
  });
});

describe("desk header helpers", () => {
  it("tells today, a passed day and a future day apart", () => {
    const today = new Date();
    const issueClosing = (offsetDays: number) =>
      issueWith({ closesOn: isoDayFromToday(offsetDays) });
    expect(issueCloseState(issueClosing(0), today)).toBe("today");
    expect(issueCloseState(issueClosing(-1), today)).toBe("closed");
    expect(issueCloseState(issueClosing(4), today)).toBe("open");
    expect(issueCloseState(issueWith({ closes: "" }), today)).toBe("none");
  });

  it("keeps the raw count for plurals and the formatted one for display", () => {
    const values = formattedCountValues(1234, () => "1 234");
    expect(values.count).toBe(1234);
    expect(values[`${SLOT_VALUE_PREFIX}count`]).toBe("1 234");
  });
});
