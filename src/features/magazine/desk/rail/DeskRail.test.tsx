import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type { DeskActivityView } from "../../api/useDeskSummary";
import {
  DEMO_EDITORS,
  DEMO_PIECES,
  DEMO_PITCHES,
  type Piece,
  type Pitch,
} from "../../data/desk.data";
import { DeskRail, type DeskRailProps } from "./DeskRail";
import { sectionSlots, slotsToList, stageShares } from "./issueHealth";

/** A complete demo piece for fixtures to override, so every field is set. */
function firstDemoPiece(): Piece {
  const [demoPiece] = DEMO_PIECES;
  if (!demoPiece) throw new Error("the demo desk needs at least one piece");
  return demoPiece;
}

const BASE_PIECE: Piece = firstDemoPiece();

function makePiece(overrides: Partial<Piece>): Piece {
  return { ...BASE_PIECE, fresh: false, ...overrides };
}

function makePitch(index: number, overrides: Partial<Pitch> = {}): Pitch {
  return {
    id: `pitch-${index}`,
    title: `Pitch number ${index}`,
    byline: `Writer ${index}`,
    note: "",
    tags: [],
    ...overrides,
  };
}

function makeActivity(count: number): DeskActivityView[] {
  return Array.from({ length: count }, (_, entryIndex) => ({
    id: `activity-${entryIndex}`,
    actorId: null,
    who: `Person ${entryIndex}`,
    what: `moved piece ${entryIndex}`,
    when: `${entryIndex}m`,
  }));
}

const PIECES: Piece[] = [
  makePiece({ id: "a", stage: "Drafting", section: "Essays", fresh: true }),
  makePiece({ id: "b", stage: "Drafting", section: "Essays" }),
  makePiece({ id: "c", stage: "Layout", section: "Reported" }),
];

/** `count` of Marta's in-flight (Drafting) pieces. */
function martaDrafts(count: number): Piece[] {
  return Array.from({ length: count }, (_, pieceIndex) =>
    makePiece({
      id: `marta-${pieceIndex}`,
      editorId: "marta",
      stage: "Drafting",
    }),
  );
}

/** The team counts the scope's in-flight pieces: eight of Marta's are past
 *  her cap of seven. */
const MARTA_OVER_CAP_PIECES: Piece[] = martaDrafts(8);

/** Seven in flight sits at her cap; the Published eighth must not count, or
 *  she would read as over it. */
const MARTA_AT_CAP_PIECES: Piece[] = [
  ...martaDrafts(7),
  makePiece({ id: "marta-live", editorId: "marta", stage: "Published" }),
];

function railProps(overrides: Partial<DeskRailProps> = {}): DeskRailProps {
  return {
    track: "issue",
    hasCurrentIssue: true,
    pieces: PIECES,
    sections: [
      { name: "Essays", target: 3, note: "" },
      { name: "Reported", target: 1, note: "" },
    ],
    summary: {
      stageLoad: [],
      editorLoad: [
        { editorId: "marta", count: 9, cap: 7 },
        { editorId: "sara", count: 3, cap: 7 },
      ],
      activity: makeActivity(8),
    },
    editors: DEMO_EDITORS,
    me: "marta",
    pitches: DEMO_PITCHES,
    onOpenTriage: vi.fn(),
    onOpenPitch: vi.fn(),
    editorFilter: null,
    onEditorFilter: vi.fn(),
    ...overrides,
  };
}

function renderRail(overrides: Partial<DeskRailProps> = {}) {
  const props = railProps(overrides);
  render(
    <TestProviders>
      <DeskRail {...props} />
    </TestProviders>,
  );
  return props;
}

describe("issue health counts", () => {
  it("keeps only stages with pieces, in pipeline order", () => {
    expect(stageShares(PIECES)).toEqual([
      { stage: "Drafting", step: 2, count: 2 },
      { stage: "Layout", step: 6, count: 1 },
    ]);
  });

  it("counts filled against target and never reports a negative gap", () => {
    const slots = sectionSlots(PIECES, [
      { name: "Essays", target: 1, note: "" },
      { name: "Reported", target: 3, note: "" },
    ]);
    expect(slots).toEqual([
      { name: "Essays", filled: 2, target: 1, gaps: 0 },
      { name: "Reported", filled: 1, target: 3, gaps: 2 },
    ]);
  });

  it("lists the sections with the most open slots, plus pressed ones, in order", () => {
    const slots = [
      { name: "Cover", filled: 1, target: 1, gaps: 0 },
      { name: "Features", filled: 1, target: 2, gaps: 1 },
      { name: "Essays", filled: 0, target: 3, gaps: 3 },
      { name: "Service", filled: 0, target: 2, gaps: 2 },
      { name: "Review", filled: 0, target: 1, gaps: 1 },
    ];
    expect(slotsToList(slots, [], 2).map((slot) => slot.name)).toEqual([
      "Essays",
      "Service",
    ]);
    expect(slotsToList(slots, ["Cover"], 2).map((slot) => slot.name)).toEqual([
      "Cover",
      "Essays",
      "Service",
    ]);
  });
});

describe("pitches heading count", () => {
  it("opens triage from the Pitches heading count", async () => {
    const user = userEvent.setup();
    const pitches = [1, 2, 3, 4].map((index) => makePitch(index));
    const props = renderRail({ pitches });
    // The region and its heading are named by the title alone; the count
    // button names the action.
    const card = screen.getByRole("region", { name: "Pitches" });
    expect(
      within(card).getByRole("heading", { name: "Pitches" }),
    ).toBeInTheDocument();

    await user.click(
      within(card).getByRole("button", {
        name: "Open pitch triage, 4 waiting",
      }),
    );
    expect(props.onOpenTriage).toHaveBeenCalledTimes(1);
  });

  it("says how long each previewed pitch has waited", () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    renderRail({
      pitches: [makePitch(1, { receivedAt: fiveHoursAgo.toISOString() })],
    });
    const card = screen.getByRole("region", { name: "Pitches" });
    expect(within(card).getByText("5 hours ago")).toHaveAttribute(
      "datetime",
      fiveHoursAgo.toISOString(),
    );
  });
});

describe("DeskRail team counts", () => {
  it("leaves Published pieces out of an editor's count", () => {
    renderRail({ pieces: MARTA_AT_CAP_PIECES });
    const team = screen.getByRole("region", { name: "Team" });
    const martaRow = within(team).getByRole("button", { name: /Marta/ });

    expect(martaRow).toHaveAccessibleName(/7 of 7 pieces/);
    expect(martaRow).not.toHaveAccessibleName(/over capacity/i);
  });
});

describe("DeskRail", () => {
  it("shows issue health only on the issue track with a current issue", () => {
    renderRail({ track: "unassigned" });
    expect(
      screen.queryByRole("region", { name: "Issue health" }),
    ).not.toBeInTheDocument();
  });

  it("lists stages and the new voices line on the issue track", () => {
    renderRail();
    const health = screen.getByRole("region", { name: "Issue health" });
    const legend = within(health).getByRole("list", {
      name: "Pieces by stage",
    });
    expect(within(legend).getAllByRole("listitem")).toHaveLength(2);
    expect(
      within(health).getByText("1 of 3 pieces by first-time writers"),
    ).toBeInTheDocument();
  });

  it("previews the three newest pitches and opens one in triage", async () => {
    const user = userEvent.setup();
    const pitches = [1, 2, 3, 4].map((index) => makePitch(index));
    const props = renderRail({ pitches });
    const card = screen.getByRole("region", { name: /Pitches/ });

    expect(within(card).getAllByRole("listitem")).toHaveLength(3);
    await user.click(
      within(card).getByRole("button", { name: /Pitch number 1/ }),
    );
    expect(props.onOpenPitch).toHaveBeenCalledWith(pitches[0]);

    await user.click(within(card).getByRole("button", { name: "Triage all" }));
    expect(props.onOpenTriage).toHaveBeenCalledTimes(1);
  });

  it("says so when no pitches are waiting", () => {
    renderRail({ pitches: [] });
    expect(screen.getByText("No pitches waiting")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Triage all" }),
    ).not.toBeInTheDocument();
    // A zero count is text: there is nothing to open.
    expect(
      screen.queryByRole("button", { name: /Open pitch triage/ }),
    ).not.toBeInTheDocument();
  });

  it("hides the team card with fewer than two editors", () => {
    renderRail({
      summary: {
        stageLoad: [],
        editorLoad: [{ editorId: "marta", count: 2, cap: 7 }],
        activity: [],
      },
    });
    expect(
      screen.queryByRole("region", { name: "Team" }),
    ).not.toBeInTheDocument();
  });

  it("toggles an editor's queue and flags over capacity", async () => {
    const user = userEvent.setup();
    const props = renderRail({ pieces: MARTA_OVER_CAP_PIECES });
    const team = screen.getByRole("region", { name: "Team" });
    const martaRow = within(team).getByRole("button", { name: /Marta/ });

    expect(martaRow).toHaveAttribute("aria-pressed", "false");
    expect(martaRow).toHaveAccessibleName(/over capacity/i);
    await user.click(within(team).getByRole("button", { name: /Sara/ }));
    expect(props.onEditorFilter).toHaveBeenCalledWith("sara");
  });

  it("offers a way out of someone else's queue", async () => {
    const user = userEvent.setup();
    const props = renderRail({ editorFilter: "sara" });
    const team = screen.getByRole("region", { name: "Team" });

    expect(within(team).getByRole("button", { name: /Sara/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(team).getByText("Viewing Sara's queue")).toBeInTheDocument();
    await user.click(
      within(team).getByRole("button", { name: "Show everyone" }),
    );
    expect(props.onEditorFilter).toHaveBeenCalledWith(null);
  });

  it("shows five activity entries and unfolds the rest", async () => {
    const user = userEvent.setup();
    renderRail();
    const activity = screen.getByRole("region", { name: "Activity" });

    expect(within(activity).getAllByRole("listitem")).toHaveLength(5);
    const seeAll = within(activity).getByRole("button", { name: /See all/ });
    expect(seeAll).toHaveAttribute("aria-expanded", "false");
    await user.click(seeAll);
    expect(seeAll).toHaveAttribute("aria-expanded", "true");
    // Without LazyMotion in the test providers, Collapse keeps its initial
    // inline opacity, so presence is the check here.
    expect(
      await within(activity).findByText("moved piece 7"),
    ).toBeInTheDocument();
  });

  it("keeps stage and slot counts as text without filter callbacks", () => {
    renderRail();
    const health = screen.getByRole("region", { name: "Issue health" });
    // The only button left is the full-sections count, which unfolds them.
    expect(
      within(health)
        .queryAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["1 section full"]);
  });

  it("lists sections with open slots and shows the full ones on request", async () => {
    const user = userEvent.setup();
    renderRail();
    const health = screen.getByRole("region", { name: "Issue health" });

    expect(within(health).getByText("1 section full")).toBeInTheDocument();
    expect(within(health).getByText("Essays")).toBeInTheDocument();
    expect(within(health).queryByText("Reported")).not.toBeInTheDocument();

    // The count opens what it counts: it is the toggle for every section.
    const fullCount = within(health).getByRole("button", {
      name: "1 section full",
    });
    expect(fullCount).toHaveAttribute("aria-expanded", "false");
    expect(
      within(health).queryByRole("button", { name: "Show all sections" }),
    ).not.toBeInTheDocument();
    await user.click(fullCount);
    expect(within(health).getByText("Reported")).toBeInTheDocument();
    expect(fullCount).toHaveAttribute("aria-expanded", "true");
  });

  it("toggles a stage filter from the legend", async () => {
    const user = userEvent.setup();
    const props = renderRail({
      stageFilter: ["Layout"],
      onStageFilter: vi.fn(),
    });
    const legend = screen.getByRole("list", { name: "Pieces by stage" });
    const drafting = within(legend).getByRole("button", { name: /Drafting/ });

    expect(drafting).toHaveAttribute("aria-pressed", "false");
    expect(
      within(legend).getByRole("button", { name: /Layout/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(drafting);
    expect(props.onStageFilter).toHaveBeenCalledWith("Drafting");
  });

  it("toggles a section filter from the slots", async () => {
    const user = userEvent.setup();
    const props = renderRail({
      sectionFilter: ["Essays"],
      onSectionFilter: vi.fn(),
    });
    const health = screen.getByRole("region", { name: "Issue health" });
    const essays = within(health).getByRole("button", { name: /Essays/ });

    expect(essays).toHaveAttribute("aria-pressed", "true");
    // Reported is full, so it waits behind the full-sections count.
    await user.click(
      within(health).getByRole("button", { name: "1 section full" }),
    );
    await user.click(within(health).getByRole("button", { name: /Reported/ }));
    expect(props.onSectionFilter).toHaveBeenCalledWith("Reported");
  });

  it("puts Pitches first in the DOM when stacked", () => {
    renderRail({ isStacked: true });
    const pitches = screen.getByRole("region", { name: /Pitches/ });
    const health = screen.getByRole("region", { name: "Issue health" });
    expect(
      pitches.compareDocumentPosition(health) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps focus on a legend toggle when the layout stacks", () => {
    const props = railProps({ onStageFilter: vi.fn() });
    const { rerender } = render(<DeskRail {...props} />, {
      wrapper: TestProviders,
    });
    const legend = screen.getByRole("list", { name: "Pieces by stage" });
    const drafting = within(legend).getByRole("button", { name: /Drafting/ });
    act(() => drafting.focus());
    expect(drafting).toHaveFocus();

    // Issue health is the card React moves when Pitches goes first.
    rerender(<DeskRail {...props} isStacked />);
    const stackedLegend = screen.getByRole("list", { name: "Pieces by stage" });
    const stackedDrafting = within(stackedLegend).getByRole("button", {
      name: /Drafting/,
    });
    expect(stackedDrafting).toBe(drafting);
    expect(stackedDrafting).toHaveFocus();
  });

  it("leaves focus alone when it left the rail before the layout stacks", () => {
    const props = railProps({ onStageFilter: vi.fn() });
    const { rerender } = render(<DeskRail {...props} />, {
      wrapper: TestProviders,
    });
    const legend = screen.getByRole("list", { name: "Pieces by stage" });
    const drafting = within(legend).getByRole("button", { name: /Drafting/ });
    act(() => drafting.focus());
    // Focus drops to the page (as when tabbing out to the browser chrome).
    act(() => drafting.blur());
    expect(document.body).toHaveFocus();

    rerender(<DeskRail {...props} isStacked />);
    expect(drafting).not.toHaveFocus();
    expect(document.body).toHaveFocus();

    // A later swap back does not reach for the old control either.
    rerender(<DeskRail {...props} />);
    expect(drafting).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });
});

describe("new voices line", () => {
  it("makes the new voices line a toggle for the new-voices chip", async () => {
    const user = userEvent.setup();
    const onNewVoicesFilter = vi.fn();
    renderRail({ onNewVoicesFilter, isNewVoicesFiltered: true });
    const health = screen.getByRole("region", { name: "Issue health" });
    const toggle = within(health).getByRole("button", {
      name: "1 of 3 pieces by first-time writers",
    });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    await user.click(toggle);
    expect(onNewVoicesFilter).toHaveBeenCalledTimes(1);
  });

  it("keeps a zero new voices line as text while its chip is off", () => {
    renderRail({
      pieces: PIECES.map((piece) => ({ ...piece, fresh: false })),
      onNewVoicesFilter: vi.fn(),
    });
    const health = screen.getByRole("region", { name: "Issue health" });
    expect(
      within(health).queryByRole("button", { name: /first-time writers/ }),
    ).not.toBeInTheDocument();
  });
});

describe("issue forecast", () => {
  /** Local noon, so no timezone can push the calendar day either way. */
  const FORECAST_TODAY = new Date(2026, 7, 1, 12, 0, 0);
  const FOUR_LATE_PIECES = [1, 2, 3, 4].map((index) =>
    makePiece({
      id: `late-${index}`,
      title: `Late piece ${index}`,
      stage: "Layout",
      late: true,
      dueDate: "2026-07-20",
    }),
  );

  it("renders nothing without a known close date", () => {
    renderRail({ closesOn: null });
    const health = screen.getByRole("region", { name: "Issue health" });
    expect(within(health).queryByText(/On track/)).not.toBeInTheDocument();
    expect(
      within(health).queryByText(/may miss close/),
    ).not.toBeInTheDocument();
  });

  it("reads on track when nothing is at risk", () => {
    renderRail({
      closesOn: "2026-09-01",
      today: FORECAST_TODAY,
      pieces: [
        makePiece({
          id: "a",
          stage: "Layout",
          late: false,
          dueDate: "2026-08-15",
        }),
      ],
    });
    const health = screen.getByRole("region", { name: "Issue health" });
    expect(within(health).getByText(/On track to close/)).toBeInTheDocument();
  });

  it("lists at-risk pieces with their reason and opens one", async () => {
    const user = userEvent.setup();
    const props = renderRail({
      closesOn: "2026-08-05",
      today: FORECAST_TODAY,
      onOpenPiece: vi.fn(),
      onShowAtRisk: vi.fn(),
      pieces: [
        makePiece({
          id: "late-piece",
          title: "A late piece",
          stage: "Layout",
          late: true,
          dueDate: "2026-07-20",
        }),
        makePiece({
          id: "after-close",
          title: "Past the close",
          stage: "Layout",
          late: false,
          dueDate: "2026-08-20",
        }),
      ],
    });
    const health = screen.getByRole("region", { name: "Issue health" });
    expect(
      within(health).getByText("2 pieces may miss close"),
    ).toBeInTheDocument();
    const atRiskList = within(health).getByRole("list", {
      name: "Pieces at risk of missing the close",
    });
    expect(within(atRiskList).getAllByRole("listitem")).toHaveLength(2);
    expect(within(atRiskList).getByText("Late")).toBeInTheDocument();
    expect(within(atRiskList).getByText("After close")).toBeInTheDocument();

    await user.click(
      within(atRiskList).getByRole("button", { name: /A late piece/ }),
    );
    expect(props.onOpenPiece).toHaveBeenCalledWith(
      expect.objectContaining({ id: "late-piece" }),
    );
  });

  it("unfolds the at-risk pieces past the first three in place", async () => {
    const user = userEvent.setup();
    const props = renderRail({
      closesOn: "2026-08-05",
      today: FORECAST_TODAY,
      onOpenPiece: vi.fn(),
      onShowAtRisk: vi.fn(),
      pieces: FOUR_LATE_PIECES,
    });
    const health = screen.getByRole("region", { name: "Issue health" });
    const atRiskList = within(health).getByRole("list", {
      name: "Pieces at risk of missing the close",
    });
    expect(within(atRiskList).getAllByRole("listitem")).toHaveLength(3);

    const more = within(health).getByRole("button", { name: "+1 more" });
    expect(more).toHaveAttribute("aria-expanded", "false");
    await user.click(more);
    expect(within(atRiskList).getAllByRole("listitem")).toHaveLength(4);
    expect(more).toHaveAttribute("aria-expanded", "true");
    expect(more).toHaveTextContent("Show fewer");
    // Unfolding stays in the rail; only the headline filters the table.
    expect(props.onShowAtRisk).not.toHaveBeenCalled();
  });

  it("makes the headline count the door to the at-risk pieces in the table", async () => {
    const user = userEvent.setup();
    const props = renderRail({
      closesOn: "2026-08-05",
      today: FORECAST_TODAY,
      onShowAtRisk: vi.fn(),
      pieces: FOUR_LATE_PIECES,
    });
    const health = screen.getByRole("region", { name: "Issue health" });
    await user.click(
      within(health).getByRole("button", {
        name: "4 pieces may miss close, show them in the table",
      }),
    );
    expect(props.onShowAtRisk).toHaveBeenCalledTimes(1);
  });

  it("keeps the headline as text without the callback, and still unfolds the list", async () => {
    const user = userEvent.setup();
    renderRail({
      closesOn: "2026-08-05",
      today: FORECAST_TODAY,
      onOpenPiece: vi.fn(),
      pieces: FOUR_LATE_PIECES,
    });
    const health = screen.getByRole("region", { name: "Issue health" });
    expect(within(health).getByText("4 pieces may miss close")).toBeVisible();
    expect(
      within(health).queryByRole("button", { name: /may miss close/ }),
    ).not.toBeInTheDocument();
    await user.click(within(health).getByRole("button", { name: "+1 more" }));
    expect(within(health).getByText("Late piece 4")).toBeInTheDocument();
  });

  it("lists at-risk pieces as plain text without a way to open them", () => {
    renderRail({
      closesOn: "2026-08-05",
      today: FORECAST_TODAY,
      pieces: [
        makePiece({
          id: "late-piece",
          title: "A late piece",
          stage: "Layout",
          late: true,
          dueDate: "2026-07-20",
        }),
      ],
    });
    const health = screen.getByRole("region", { name: "Issue health" });
    expect(within(health).getByText("A late piece")).toBeInTheDocument();
    expect(
      within(health).queryByRole("button", { name: /A late piece/ }),
    ).not.toBeInTheDocument();
  });
});
