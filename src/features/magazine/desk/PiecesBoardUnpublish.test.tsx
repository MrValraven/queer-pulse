import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_STAGES, type Piece } from "../data/desk.data";
import { PiecesBoard } from "./PiecesBoard";

/** The unpublish buttons on a Published board card: only that card has them,
 *  and each sends its own landing stage. */

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

describe("PiecesBoard unpublish buttons", () => {
  it("offers both unpublish buttons that send their landing stage", async () => {
    const onUnpublish = vi.fn();
    const piece = makePiece({ title: "Live piece", stage: "Published" });
    const { onOpen } = renderBoard({ pieces: [piece], onUnpublish });

    fireEvent.click(
      await screen.findByRole("button", { name: "Unpublish to draft" }),
    );
    expect(onUnpublish).toHaveBeenLastCalledWith(piece, "drafting");
    fireEvent.click(
      screen.getByRole("button", { name: "Unpublish to review" }),
    );
    expect(onUnpublish).toHaveBeenLastCalledWith(piece, "in_review");
    expect(onUnpublish).toHaveBeenCalledTimes(2);
    expect(onOpen).not.toHaveBeenCalled();
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

  it("shows no unpublish buttons on a card that is not Published", async () => {
    renderBoard({
      pieces: [makePiece({ title: "Working piece", stage: "Edit" })],
      onUnpublish: vi.fn(),
    });

    await screen.findByRole("button", { name: "Working piece" });
    expect(
      screen.queryByRole("button", { name: "Unpublish to draft" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Unpublish to review" }),
    ).toBeNull();
  });

  it("keeps today's locked line when no onUnpublish is passed", async () => {
    renderBoard({
      pieces: [makePiece({ title: "Live piece", stage: "Published" })],
    });

    await screen.findByText("Unpublish from the piece record to move it");
    expect(
      screen.queryByRole("button", { name: "Unpublish to draft" }),
    ).toBeNull();
  });
});
