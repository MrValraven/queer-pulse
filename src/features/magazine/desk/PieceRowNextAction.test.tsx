import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
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

async function renderCell(
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
  await awaitCatalog("magazine");
  return { ...view, onRun };
}

describe("PieceRowNextAction", () => {
  it("runs the row's verb from its button", async () => {
    const piece = makePiece();
    const action = pieceNextAction(piece, "issue");
    if (!action) throw new Error("Layout work should have a verb");
    const { onRun } = await renderCell(action, piece);

    fireEvent.click(screen.getByRole("button"));

    expect(onRun).toHaveBeenCalledWith(action);
    expect(screen.queryByText(/Goes live/)).toBeNull();
  });

  it("notes a live Ready piece above Publish and describes the button by it", async () => {
    const piece = makePiece({ stage: "Ready", publishedAt: hoursFromNow(-2) });
    const action = pieceNextAction(piece, "issue");
    if (action?.kind !== "publish") throw new Error("expected Publish");
    await renderCell(action, piece);

    const note = screen.getByText(
      /^Live since \S.*Publish it to tell the writer\.$/,
    );
    expect(note).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Publish" }),
    ).toHaveAccessibleDescription(
      /Live since \S.*Publish it to tell the writer\./,
    );
  });

  it("carries the note's short form for compact rows, hidden from assistive tech", async () => {
    const piece = makePiece({ stage: "Ready", publishedAt: hoursFromNow(-2) });
    const action = pieceNextAction(piece, "issue");
    if (action?.kind !== "publish") throw new Error("expected Publish");
    await renderCell(action, piece);

    const shortForm = screen.getByText(/^Live since [^.]+$/);
    expect(shortForm).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.getByRole("button", { name: "Publish" }),
    ).toHaveAccessibleDescription(
      /Live since \S.*Publish it to tell the writer\.$/,
    );
  });

  it("leads a live Edit-stage piece with Publish and its live note", async () => {
    const piece = makePiece({ stage: "Edit", publishedAt: hoursFromNow(-2) });
    const action = pieceNextAction(piece, "issue");
    if (action?.kind !== "publish") throw new Error("expected Publish");
    await renderCell(action, piece);

    expect(
      screen.getByRole("button", { name: "Publish" }),
    ).toHaveAccessibleDescription(
      /Live since \S.*Publish it to tell the writer\.$/,
    );
  });

  it("leaves a verb other than Publish without a live note", async () => {
    const piece = makePiece({ stage: "Edit", publishedAt: hoursFromNow(40) });
    const action = pieceNextAction(piece, "issue");
    if (!action) throw new Error("Edit work should have a verb");
    await renderCell(action, piece);

    expect(screen.queryByText(/Live since/)).toBeNull();
  });

  it("names when a scheduled piece goes live as its next action", async () => {
    await renderCell(
      null,
      makePiece({ stage: "Ready", publishedAt: hoursFromNow(40) }),
    );

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText(/^Goes live \S/)).toBeInTheDocument();
  });

  it("says a piece is live, and to publish it, once its date has passed", async () => {
    await renderCell(
      null,
      makePiece({ stage: "Ready", publishedAt: hoursFromNow(-2) }),
    );

    expect(
      screen.getByText(/^Live since \S.*Publish it to tell the writer\.$/),
    ).toBeInTheDocument();
  });

  it("marks the cell as a status only when a go-live line shows", async () => {
    const { container, unmount } = await renderCell(
      null,
      makePiece({ stage: "Ready", publishedAt: hoursFromNow(40) }),
    );
    expect(container.querySelector("[data-status]")).not.toBeNull();
    unmount();

    const published = await renderCell(
      null,
      makePiece({ stage: "Published", publishedAt: hoursFromNow(-2) }),
    );
    expect(published.container.querySelector("[data-status]")).toBeNull();
  });

  it("leaves the cell empty for a Published piece", async () => {
    const { container } = await renderCell(
      null,
      makePiece({ stage: "Published", publishedAt: hoursFromNow(-2) }),
    );

    expect(container.querySelector("svg")).toBeNull();
    expect(screen.queryByText(/Goes live|Live since/)).toBeNull();
  });

  it("leaves the cell empty when no piece is passed", async () => {
    const { container } = await renderCell(null);

    expect(container.querySelector("svg")).toBeNull();
  });
});
