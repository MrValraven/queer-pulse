import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Piece, Section } from "../data/desk.data";
import type { DeskTrack } from "./deskTrack";
import { IssuePlan } from "./IssuePlan";

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "A piece",
    format: "article",
    section: "Features",
    kind: "Feature",
    byline: "Someone Writer",
    editorId: "marta",
    stage: "Edit",
    due: "",
    art: "in",
    words: 1200,
    issueId: "issue-1",
    ...overrides,
  };
}

const SECTIONS: Section[] = [
  { name: "Features", target: 2, note: "long reads" },
  { name: "Culture", target: 1, note: "reviews" },
];

function renderPlan(pieces: Piece[], track?: DeskTrack) {
  const onOpen = vi.fn();
  const onCommission = vi.fn();
  render(
    <TestProviders>
      <IssuePlan
        pieces={pieces}
        sections={SECTIONS}
        onOpen={onOpen}
        onCommission={onCommission}
        track={track}
      />
    </TestProviders>,
  );
  return { onOpen, onCommission };
}

describe("IssuePlan", () => {
  it("sums up full sections, sections with gaps and open slots", async () => {
    renderPlan([
      makePiece({ id: "piece-1", section: "Features" }),
      makePiece({ id: "piece-2", section: "Culture" }),
    ]);

    expect(await screen.findByText("1 section full")).toBeInTheDocument();
    expect(screen.getByText("1 with gaps")).toBeInTheDocument();
    expect(screen.getAllByText("1 slot open").length).toBeGreaterThan(0);
  });

  it("counts slots from the whole issue while a filter thins the cards", async () => {
    const issuePieces = [
      makePiece({ id: "piece-1", title: "Kept", section: "Features" }),
      makePiece({ id: "piece-2", title: "Filtered out", section: "Features" }),
      makePiece({ id: "piece-3", title: "Also out", section: "Culture" }),
    ];
    render(
      <TestProviders>
        <IssuePlan
          pieces={issuePieces.slice(0, 1)}
          sections={SECTIONS}
          slotPieces={issuePieces}
          isFiltered
          scopePieceCount={issuePieces.length}
          onOpen={vi.fn()}
          onCommission={vi.fn()}
        />
      </TestProviders>,
    );

    expect(await screen.findByText("2 sections full")).toBeInTheDocument();
    expect(screen.getByText("0 with gaps")).toBeInTheDocument();
    expect(screen.getByText("2 of 2 · long reads")).toBeInTheDocument();
    expect(screen.getByText("Kept")).toBeInTheDocument();
    expect(screen.queryByText("Filtered out")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Commission for/ }),
    ).not.toBeInTheDocument();
  });

  it("offers a commission slot per gap in the issue track", async () => {
    const { onCommission } = renderPlan([], "issue");

    const featureSlots = await screen.findAllByRole("button", {
      name: "Commission for Features",
    });
    expect(featureSlots).toHaveLength(2);

    fireEvent.click(featureSlots[0] as HTMLElement);
    expect(onCommission).toHaveBeenCalledWith("Features");
  });

  it("shows where unfiled pieces would fit, with no commission slots", async () => {
    renderPlan(
      [makePiece({ issueId: null, section: "Culture" })],
      "unassigned",
    );

    expect(
      await screen.findByRole("heading", {
        name: "Where unfiled pieces would fit",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Commission for/ })).toBeNull();
  });

  it("opens a slot's piece from its title", async () => {
    // The title is the slot's real `<button>` (a native
    // button, like the board card's own title, gives Enter and Space
    // activation for free in a real browser; the old `role="button"` div
    // needed its own hand-rolled keydown handling to get the same result).
    const piece = makePiece({ title: "Slot piece" });
    const { onOpen } = renderPlan([piece]);

    fireEvent.click(await screen.findByRole("button", { name: "Slot piece" }));

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(piece);
  });

  it("also opens a slot's piece from a click anywhere on the card", async () => {
    const piece = makePiece({ title: "Slot piece" });
    const { onOpen } = renderPlan([piece]);

    const title = await screen.findByRole("button", { name: "Slot piece" });
    const card = title.closest("h4")?.parentElement;
    if (!card) throw new Error("No card found for Slot piece");
    fireEvent.click(card);

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(piece);
  });
});
