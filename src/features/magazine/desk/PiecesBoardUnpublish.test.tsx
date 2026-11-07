import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_STAGES, type Piece } from "../data/desk.data";
import { PiecesBoard } from "./PiecesBoard";

/** The Unpublish button on a Published board card: only that card has it,
 *  and it raises the confirm for its own piece (the confirm picks where the
 *  piece goes back to). */

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "A piece",
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Someone Writer",
    editorId: "marta",
    stage: "Edit",
    due: "",
    art: "in",
    issueId: null,
    ...overrides,
  };
}

/** A stand-in for the browser's DataTransfer, which jsdom does not ship. */
function makeDataTransfer() {
  return { setData: vi.fn(), effectAllowed: "", dropEffect: "" };
}

function renderBoard(
  props: Partial<Parameters<typeof PiecesBoard>[0]> & { pieces: Piece[] },
) {
  const onMove = vi.fn();
  const onOpen = vi.fn();
  render(
    <TestProviders>
      <PiecesBoard
        stages={DEMO_STAGES}
        onOpen={onOpen}
        onMove={onMove}
        {...props}
      />
    </TestProviders>,
  );
  return { onMove, onOpen };
}

describe("PiecesBoard unpublish button", () => {
  it("offers one Unpublish button that raises the confirm for its piece", async () => {
    const onUnpublish = vi.fn();
    const piece = makePiece({ title: "Live piece", stage: "Published" });
    const { onOpen } = renderBoard({ pieces: [piece], onUnpublish });

    const unpublishButton = await screen.findByRole("button", {
      name: "Unpublish",
    });
    expect(
      screen.queryByRole("button", { name: "Unpublish to draft" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Unpublish to review" }),
    ).toBeNull();

    fireEvent.click(unpublishButton);
    expect(onUnpublish).toHaveBeenCalledTimes(1);
    expect(onUnpublish).toHaveBeenCalledWith(piece);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("describes the Unpublish button by the card's own title", async () => {
    renderBoard({
      pieces: [makePiece({ title: "Live piece", stage: "Published" })],
      onUnpublish: vi.fn(),
    });

    expect(
      await screen.findByRole("button", { name: "Unpublish" }),
    ).toHaveAccessibleDescription("Live piece");
  });

  it("keeps the card undraggable and drops the piece-record hint", async () => {
    const { onMove } = renderBoard({
      pieces: [makePiece({ title: "Live piece", stage: "Published" })],
      onUnpublish: vi.fn(),
    });
    const card = (
      await screen.findByRole("button", { name: "Live piece" })
    ).closest<HTMLElement>("[draggable]");

    expect(card).toHaveAttribute("draggable", "false");
    fireEvent.dragStart(card as HTMLElement, {
      dataTransfer: makeDataTransfer(),
    });
    expect(onMove).not.toHaveBeenCalled();
    expect(
      screen.queryByText("Unpublish from the piece record to move it"),
    ).toBeNull();
  });

  it("shows no Unpublish button on a card that is not Published", async () => {
    renderBoard({
      pieces: [makePiece({ title: "Working piece", stage: "Edit" })],
      onUnpublish: vi.fn(),
    });

    await screen.findByRole("button", { name: "Working piece" });
    expect(screen.queryByRole("button", { name: "Unpublish" })).toBeNull();
  });

  it("keeps today's locked line when no onUnpublish is passed", async () => {
    renderBoard({
      pieces: [makePiece({ title: "Live piece", stage: "Published" })],
    });

    await screen.findByText("Unpublish from the piece record to move it");
    expect(screen.queryByRole("button", { name: "Unpublish" })).toBeNull();
  });
});
