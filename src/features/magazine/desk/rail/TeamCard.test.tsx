import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { DEMO_EDITORS, DEMO_PIECES, type Piece } from "../../data/desk.data";
import { TeamCard, type TeamCardProps } from "./TeamCard";

/** A complete demo piece for fixtures to override, so every field is set. */
function firstDemoPiece(): Piece {
  const [demoPiece] = DEMO_PIECES;
  if (!demoPiece) throw new Error("the demo desk needs at least one piece");
  return demoPiece;
}

const BASE_PIECE: Piece = firstDemoPiece();

function makePiece(overrides: Partial<Piece>): Piece {
  return { ...BASE_PIECE, ...overrides };
}

function teamCardProps(overrides: Partial<TeamCardProps> = {}): TeamCardProps {
  return {
    editorLoad: [
      { editorId: "marta", count: 9, cap: 7 },
      { editorId: "sara", count: 3, cap: 7 },
    ],
    editors: DEMO_EDITORS,
    me: "marta",
    editorFilter: null,
    onEditorFilter: vi.fn(),
    ...overrides,
  };
}

function renderTeamCard(overrides: Partial<TeamCardProps> = {}) {
  const props = teamCardProps(overrides);
  render(
    <TestProviders>
      <TeamCard {...props} />
    </TestProviders>,
  );
  return props;
}

/** Mirrors how `DeskRail` holds `editorFilter` state, so clicking "Show
 *  everyone" actually unmounts it, the same as it does on the real desk. */
function ControlledTeamCard(
  props: TeamCardProps & { initialEditorFilter: string | null },
) {
  const [editorFilter, setEditorFilter] = useState(props.initialEditorFilter);
  return (
    <TeamCard
      {...props}
      editorFilter={editorFilter}
      onEditorFilter={setEditorFilter}
    />
  );
}

describe("TeamCard in-flight counts", () => {
  it("counts each editor's in-flight pieces from the scope's pieces over editorLoad's desk-wide count", () => {
    const pieces = [
      makePiece({ id: "1", editorId: "marta", stage: "Drafting" }),
      makePiece({ id: "2", editorId: "marta", stage: "Layout" }),
      makePiece({ id: "3", editorId: "marta", stage: "Published" }),
      makePiece({ id: "4", editorId: "sara", stage: "Drafting" }),
    ];
    renderTeamCard({ pieces });
    const team = screen.getByRole("region", { name: "Team" });

    // editorLoad says 9 and 3; the in-flight pieces in scope say 2 and 1.
    const martaRow = within(team).getByRole("button", { name: /Marta/ });
    expect(within(martaRow).getByText("2")).toBeInTheDocument();
    const saraRow = within(team).getByRole("button", { name: /Sara/ });
    expect(within(saraRow).getByText("1")).toBeInTheDocument();
  });

  it("flags over capacity from the computed count over editorLoad's own count", () => {
    const pieces = [
      makePiece({ id: "1", editorId: "marta", stage: "Drafting" }),
      makePiece({ id: "2", editorId: "marta", stage: "Layout" }),
      makePiece({ id: "3", editorId: "marta", stage: "In review" }),
      makePiece({ id: "4", editorId: "marta", stage: "Edit" }),
      makePiece({ id: "5", editorId: "marta", stage: "Ready" }),
      makePiece({ id: "6", editorId: "marta", stage: "Commissioned" }),
      makePiece({ id: "7", editorId: "marta", stage: "Sensitivity read" }),
      makePiece({ id: "8", editorId: "marta", stage: "Drafting" }),
      makePiece({ id: "9", editorId: "sara", stage: "Drafting" }),
    ];
    // editorLoad reports marta well under cap; the scope's pieces put her
    // over it. The over-capacity flag must follow the computed count.
    renderTeamCard({
      pieces,
      editorLoad: [
        { editorId: "marta", count: 1, cap: 7 },
        { editorId: "sara", count: 3, cap: 7 },
      ],
    });
    const team = screen.getByRole("region", { name: "Team" });
    const martaRow = within(team).getByRole("button", { name: /Marta/ });
    expect(martaRow).toHaveAccessibleName(/over capacity/i);
    const saraRow = within(team).getByRole("button", { name: /Sara/ });
    expect(saraRow).not.toHaveAccessibleName(/over capacity/i);
  });

  it("clicking a row filters to exactly the number it showed", async () => {
    const user = userEvent.setup();
    const pieces = [
      makePiece({ id: "1", editorId: "sara", stage: "Drafting" }),
      makePiece({ id: "2", editorId: "sara", stage: "Published" }),
    ];
    const props = renderTeamCard({ pieces });
    const team = screen.getByRole("region", { name: "Team" });
    const saraRow = within(team).getByRole("button", { name: /Sara/ });

    // Published is excluded, so the row shows 1 for Sara.
    expect(within(saraRow).getByText("1")).toBeInTheDocument();
    await user.click(saraRow);
    expect(props.onEditorFilter).toHaveBeenCalledWith("sara");
  });

  it("falls back to editorLoad's count when no pieces are given", () => {
    renderTeamCard();
    const team = screen.getByRole("region", { name: "Team" });
    const martaRow = within(team).getByRole("button", { name: /Marta/ });
    expect(within(martaRow).getByText("9")).toBeInTheDocument();
  });
});

describe("TeamCard show everyone", () => {
  it("hands focus to the first team row once it unmounts", async () => {
    const user = userEvent.setup();
    const pieces = [
      makePiece({ id: "1", editorId: "marta", stage: "Drafting" }),
      makePiece({ id: "2", editorId: "sara", stage: "Drafting" }),
    ];
    render(
      <TestProviders>
        <ControlledTeamCard
          {...teamCardProps({ pieces })}
          initialEditorFilter="sara"
        />
      </TestProviders>,
    );
    const team = screen.getByRole("region", { name: "Team" });

    await user.click(
      within(team).getByRole("button", { name: "Show everyone" }),
    );
    expect(
      screen.queryByRole("button", { name: "Show everyone" }),
    ).not.toBeInTheDocument();
    // Focus comes back inside a requestAnimationFrame, so the assertion has
    // to wait for it rather than check the instant after the click resolves.
    await waitFor(() =>
      expect(within(team).getByRole("button", { name: /Marta/ })).toHaveFocus(),
    );
  });
});
