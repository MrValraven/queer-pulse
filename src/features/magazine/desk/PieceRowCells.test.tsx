import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Editor, Piece } from "../data/desk.data";
import { PieceRowWait } from "./PieceRowCells";

const EDITORS: readonly Editor[] = [
  { id: "marta", name: "Marta Reis", initials: "MR", tint: "coral", cap: 7 },
  { id: "sara", name: "Sara Pinheiro", initials: "SP", tint: "jade", cap: 7 },
];

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "Letters from the coast",
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Rui Sol",
    editorId: "marta",
    stage: "Edit",
    due: "",
    art: "in",
    wait: "you",
    issueId: "issue-1",
    ...overrides,
  };
}

function renderWait(piece: Piece, me: string) {
  return render(
    <TestProviders>
      <PieceRowWait piece={piece} me={me} editors={EDITORS} />
    </TestProviders>,
  );
}

describe("PieceRowWait", () => {
  it("reads the viewer's own turn as one sentence", () => {
    const { container } = renderWait(makePiece(), "marta");

    expect(screen.getByText("Waiting on you")).toHaveClass("visuallyHidden");
    // The visible word stays on screen and out of the spoken text.
    expect(screen.getByText("You")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("[data-tone]")).toHaveAttribute(
      "data-tone",
      "you",
    );
  });

  it("names another editor inside the sentence", () => {
    renderWait(makePiece(), "sara");

    expect(screen.getByText("Waiting on Marta")).toHaveClass("visuallyHidden");
    expect(screen.getByText("Marta")).toHaveAttribute("aria-hidden", "true");
  });

  it("names the writer inside the sentence", () => {
    renderWait(makePiece({ wait: "writer", stage: "Drafting" }), "marta");

    expect(screen.getByText("Waiting on Writer")).toHaveClass("visuallyHidden");
  });
});
