import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Piece } from "../data/desk.data";
import { pieceNextAction, type PieceNextAction } from "./pieceNextAction";
import { PieceRowNextAction } from "./PieceRowNextAction";

const HOUR_MS = 60 * 60 * 1000;

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * HOUR_MS).toISOString();
}

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "Letters from the coast",
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Rui Sol",
    editorId: "marta",
    stage: "Layout",
    due: "",
    art: "in",
    issueId: "issue-1",
    ...overrides,
  };
}

function renderCell(
  action: PieceNextAction | null,
  piece?: Pick<Piece, "publishedAt" | "stage">,
) {
  const onRun = vi.fn();
  const view = render(
    <TestProviders>
      <span id="row-title" />
      <PieceRowNextAction
        action={action}
        piece={piece}
        titleId="row-title"
        onRun={onRun}
      />
    </TestProviders>,
  );
  return { ...view, onRun };
}

describe("PieceRowNextAction", () => {
  it("runs the row's verb from its button", () => {
    const piece = makePiece();
    const action = pieceNextAction(piece, "issue");
    if (!action) throw new Error("Layout work should have a verb");
    const { onRun } = renderCell(action, piece);

    fireEvent.click(screen.getByRole("button"));

    expect(onRun).toHaveBeenCalledWith(action);
    expect(screen.queryByText(/Goes live/)).toBeNull();
  });

  it("says when a scheduled piece goes live in place of a verb", () => {
    renderCell(
      null,
      makePiece({ stage: "Ready", publishedAt: hoursFromNow(40) }),
    );

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText(/^Goes live \S/)).toBeInTheDocument();
  });

  it("says a piece is live on the site once its date has passed", () => {
    renderCell(
      null,
      makePiece({ stage: "Ready", publishedAt: hoursFromNow(-2) }),
    );

    expect(screen.getByText("Live on the site")).toBeInTheDocument();
  });

  it("marks the cell as a status only when a go-live line shows", () => {
    const { container, unmount } = renderCell(
      null,
      makePiece({ stage: "Ready", publishedAt: hoursFromNow(40) }),
    );
    expect(container.querySelector("[data-status]")).not.toBeNull();
    unmount();

    const published = renderCell(
      null,
      makePiece({ stage: "Published", publishedAt: hoursFromNow(-2) }),
    );
    expect(published.container.querySelector("[data-status]")).toBeNull();
  });

  it("leaves the cell empty for a Published piece", () => {
    const { container } = renderCell(
      null,
      makePiece({ stage: "Published", publishedAt: hoursFromNow(-2) }),
    );

    expect(container.querySelector("svg")).toBeNull();
    expect(screen.queryByText(/Goes live|Live on the site/)).toBeNull();
  });

  it("leaves the cell empty when no piece is passed", () => {
    const { container } = renderCell(null);

    expect(container.querySelector("svg")).toBeNull();
  });
});
