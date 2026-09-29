import { useState } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Piece } from "../data/desk.data";
import type { DeskFocusId } from "./deskFocus";
import { DeskFocusBar } from "./DeskFocusBar";

const ME = "marta";

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "A piece",
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Someone",
    editorId: ME,
    stage: "Edit",
    due: "",
    art: "in",
    issueId: null,
    ...overrides,
  };
}

// Exactly 4 chips are non-zero (your-turn, late, with-writers, mine) and 7
// are zero (stalled, needs-art, sensitivity, ready, unpaid, new-voices,
// at-risk, which counts nothing without a close date) with no active
// filters.
// Deliberately fewer than the 5-chip cap, so this fixture is the regression
// case for the fix-round-1 bug: a zero-count, inactive chip must never fill
// a visible slot just because there was room for one.
const PIECES: Piece[] = [
  makePiece({
    id: "p1",
    wait: "you",
    editorId: ME,
    late: false,
    art: "in",
    stage: "Edit",
    paymentStatus: "paid",
  }),
  makePiece({
    id: "p2",
    wait: "writer",
    editorId: "sara",
    late: true,
    art: "in",
    stage: "Drafting",
    paymentStatus: "paid",
  }),
];

function renderBar(
  overrides: Partial<Parameters<typeof DeskFocusBar>[0]> = {},
) {
  const onToggleFocus = vi.fn();
  const onClearFocus = vi.fn();
  const onOpenPitches = vi.fn();
  render(
    <TestProviders>
      <DeskFocusBar
        pieces={PIECES}
        me={ME}
        activeFocusIds={[]}
        onToggleFocus={onToggleFocus}
        onClearFocus={onClearFocus}
        pitchCount={4}
        onOpenPitches={onOpenPitches}
        {...overrides}
      />
    </TestProviders>,
  );
  return { onToggleFocus, onClearFocus, onOpenPitches };
}

function toggleChipLabels(group: HTMLElement): string[] {
  return within(group)
    .getAllByRole("button")
    .filter((button) => button.hasAttribute("aria-pressed"))
    .map((button) => button.textContent ?? "");
}

/** `DeskFocusBar` with its own focus state, the way the desk page holds it:
 *  needed for the focus-loss regression tests, where the fix only shows up
 *  once a toggle actually removes a chip from the DOM on a re-render. */
function StatefulDeskFocusBar({
  initialActiveFocusIds = [],
  ...props
}: Omit<
  Parameters<typeof DeskFocusBar>[0],
  "activeFocusIds" | "onToggleFocus" | "onClearFocus"
> & { initialActiveFocusIds?: DeskFocusId[] }) {
  const [activeFocusIds, setActiveFocusIds] = useState<DeskFocusId[]>(
    initialActiveFocusIds,
  );
  return (
    <DeskFocusBar
      {...props}
      activeFocusIds={activeFocusIds}
      onToggleFocus={(id) =>
        setActiveFocusIds((current) =>
          current.includes(id)
            ? current.filter((entry) => entry !== id)
            : [...current, id],
        )
      }
      onClearFocus={() => setActiveFocusIds([])}
    />
  );
}

function renderStatefulBar(
  overrides: Partial<Parameters<typeof StatefulDeskFocusBar>[0]> = {},
) {
  const onOpenPitches = vi.fn();
  render(
    <TestProviders>
      <StatefulDeskFocusBar
        pieces={PIECES}
        me={ME}
        pitchCount={4}
        onOpenPitches={onOpenPitches}
        {...overrides}
      />
    </TestProviders>,
  );
  return { onOpenPitches };
}

describe("DeskFocusBar ordering", () => {
  it("shows only chips with a match or an active filter, in registry order, keeping zero chips out of the visible slots", () => {
    renderBar();
    const group = screen.getByRole("group", { name: "Focus the desk" });
    const labels = toggleChipLabels(group);
    // Only the 4 non-zero chips show, in registry order, with a space
    // between the label and the count (the chip's accessible name reads
    // "Late 1", the label and count kept as separate text nodes). The 7
    // zero-count chips (stalled, needs-art, sensitivity, ready, unpaid,
    // new-voices, at-risk) leave the remaining 1 free slot below the 5-chip cap empty
    // and sit behind "+N".
    expect(labels).toEqual([
      "Your turn 1",
      "Late 1",
      "With writers 1",
      "Mine 1",
    ]);
    expect(
      screen.getByRole("button", { name: "Show 7 more filters" }),
    ).toHaveTextContent("+7");
  });
});

describe("DeskFocusBar zero handling", () => {
  it("shows a tone dot for a chip with a match", () => {
    renderBar();
    const lateChip = screen.getByRole("button", { name: /^Late/ });
    expect(lateChip.querySelector("[data-tone='late']")).not.toBeNull();
  });

  it("marks Stalled with a clock in place of the amber dot With writers wears", () => {
    const longAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    renderBar({
      pieces: [
        ...PIECES,
        makePiece({
          id: "p3",
          wait: "writer",
          stage: "Drafting",
          stageEnteredAt: longAgo.toISOString(),
        }),
      ],
    });
    const stalledChip = screen.getByRole("button", { name: /^Stalled/ });
    expect(stalledChip.querySelector("svg")).not.toBeNull();
    expect(stalledChip.querySelector("[data-tone]")).toBeNull();
    const writersChip = screen.getByRole("button", { name: /^With writers/ });
    expect(writersChip.querySelector("[data-tone='writer']")).not.toBeNull();
  });

  it("shows a muted 'none' with no tone dot for a zero-count chip once revealed from behind '+N'", () => {
    renderBar();
    fireEvent.click(
      screen.getByRole("button", { name: "Show 7 more filters" }),
    );
    const needsArtChip = screen.getByRole("button", { name: /^Needs art/ });
    expect(needsArtChip.textContent).toBe("Needs art none");
    expect(needsArtChip.querySelector("[data-tone]")).toBeNull();
  });
});

describe("DeskFocusBar active chip visibility", () => {
  it("shows a zero-count active chip in its own registry position, without needing the overflow", () => {
    renderBar({ activeFocusIds: ["unpaid"] });
    const group = screen.getByRole("group", { name: "Focus the desk" });
    // "unpaid" sits between "with-writers" and "mine" in the registry, and
    // that is exactly where it renders: an active chip is not pulled to the
    // front or appended at the end, it just stops being excluded.
    expect(toggleChipLabels(group)).toEqual([
      "Your turn 1",
      "Late 1",
      "With writers 1",
      "Unpaid after filing none",
      "Mine 1",
    ]);
    const unpaidChip = screen.getByRole("button", {
      name: /^Unpaid after filing/,
    });
    expect(unpaidChip).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Show 6 more filters" }),
    ).toHaveTextContent("+6");
  });

  it("shows Clear only once a focus is active, and calls onClearFocus", () => {
    const { onClearFocus } = renderBar({ activeFocusIds: ["late"] });
    const clearButton = screen.getByRole("button", { name: "Clear" });
    fireEvent.click(clearButton);
    expect(onClearFocus).toHaveBeenCalledTimes(1);
  });

  it("renders no Clear button when nothing is active", () => {
    renderBar();
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });
});

describe("DeskFocusBar overflow", () => {
  it("expands the row inline instead of opening a popover", () => {
    renderBar();
    expect(
      screen.queryByRole("button", { name: /^Ready to publish/ }),
    ).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Show 7 more filters" }),
    );

    expect(
      screen.getByRole("button", { name: /^In sensitivity read/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Ready to publish/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Unpaid after filing/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Needs art/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Show \d+ more/ })).toBeNull();
  });

  it("caps the eligible set (matches or active) at 5 in registry order, so even a matching chip can overflow", () => {
    renderBar({ activeFocusIds: ["sensitivity", "ready"] });
    const group = screen.getByRole("group", { name: "Focus the desk" });
    // Eligible chips are your-turn, late, with-writers, sensitivity, ready
    // and mine (6, since sensitivity/ready are active despite a zero count).
    // The cap keeps the first 5 in registry order; "mine" is a real match
    // but sits 6th, so it overflows along with the still-excluded zero chips.
    expect(toggleChipLabels(group)).toEqual([
      "Your turn 1",
      "Late 1",
      "With writers 1",
      "In sensitivity read none",
      "Ready to publish none",
    ]);
    fireEvent.click(
      screen.getByRole("button", { name: "Show 6 more filters" }),
    );
    expect(screen.getByRole("button", { name: /^Mine/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Needs art/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Unpaid after filing/ }),
    ).toBeInTheDocument();
  });

  it("shows only the '+N' expander and Pitches when every chip is zero", () => {
    renderBar({ pieces: [] });
    const group = screen.getByRole("group", { name: "Focus the desk" });
    expect(toggleChipLabels(group)).toEqual([]);
    expect(
      screen.getByRole("button", { name: "Show 11 more filters" }),
    ).toHaveTextContent("+11");
    expect(
      screen.getByRole("button", { name: /^Pitches/ }),
    ).toBeInTheDocument();
  });
});

describe("DeskFocusBar keeps focus off the page", () => {
  it("keeps '+N' mounted as 'Show fewer' once pressed, so the button that was just activated stays put", () => {
    renderBar();
    const moreButton = screen.getByRole("button", {
      name: "Show 7 more filters",
    });
    moreButton.focus();
    fireEvent.click(moreButton);
    expect(moreButton).toHaveAttribute("aria-expanded", "true");
    expect(moreButton).toHaveTextContent("Show fewer");
    expect(moreButton).toHaveFocus();

    fireEvent.click(moreButton);
    expect(moreButton).toHaveAttribute("aria-expanded", "false");
    expect(moreButton).toHaveTextContent("+7");
    expect(moreButton).toHaveFocus();
  });

  it("focuses a stable neighbour once Clear empties the active set and removes itself", async () => {
    renderStatefulBar({ initialActiveFocusIds: ["late"] });
    const clearButton = screen.getByRole("button", { name: "Clear" });
    clearButton.focus();
    fireEvent.click(clearButton);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Your turn/ })).toHaveFocus(),
    );
  });

  it("focuses a stable neighbour once a switched-off zero-count chip leaves the visible set", async () => {
    renderStatefulBar({ initialActiveFocusIds: ["unpaid"] });
    const unpaidChip = screen.getByRole("button", {
      name: /^Unpaid after filing/,
    });
    unpaidChip.focus();
    fireEvent.click(unpaidChip);
    expect(
      screen.queryByRole("button", { name: /^Unpaid after filing/ }),
    ).toBeNull();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Your turn/ })).toHaveFocus(),
    );
  });
});

describe("DeskFocusBar at risk", () => {
  it("counts At risk against the issue's close date", () => {
    // A close date years away: only the late piece (p2) is at risk.
    renderBar({ activeFocusIds: ["at-risk"], closesOn: "2999-12-31" });
    const atRiskChip = screen.getByRole("button", { name: /^At risk/ });
    expect(atRiskChip.textContent).toBe("At risk 1");
    expect(
      atRiskChip.querySelector("svg"),
      "At risk wears the warning icon in place of Late's red dot",
    ).not.toBeNull();
  });

  it("counts nothing At risk without a close date", () => {
    renderBar({ activeFocusIds: ["at-risk"] });
    expect(screen.getByRole("button", { name: /^At risk/ }).textContent).toBe(
      "At risk none",
    );
  });
});

describe("DeskFocusBar pitches", () => {
  it("renders the pitches count as a plain action button with no aria-pressed", () => {
    const { onOpenPitches } = renderBar({ pitchCount: 4 });
    const pitchesChip = screen.getByRole("button", { name: /^Pitches/ });
    expect(pitchesChip).not.toHaveAttribute("aria-pressed");
    // It opens the pitch triage dialog, so assistive tech gets that warning
    // ahead of the click.
    expect(pitchesChip).toHaveAttribute("aria-haspopup", "dialog");
    // The accessible name reads "Pitches 4": the label and count are
    // separate text nodes, joined by a space.
    expect(pitchesChip.textContent).toBe("Pitches 4");
    fireEvent.click(pitchesChip);
    expect(onOpenPitches).toHaveBeenCalledTimes(1);
  });

  it("mutes the pitches count to 'none' at zero, like any other chip", () => {
    renderBar({ pitchCount: 0 });
    expect(screen.getByRole("button", { name: /^Pitches/ }).textContent).toBe(
      "Pitches none",
    );
  });
});
