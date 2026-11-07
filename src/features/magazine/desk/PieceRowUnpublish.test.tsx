import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Piece } from "../data/desk.data";
import { PieceRow, type PieceRowProps } from "./PieceRow";

/** The unpublish items in a piece row's More menu: only a published row has
 *  them, and each sends its own landing stage. */

const TODAY = new Date(2026, 7, 5);
const PIECE_TITLE = "Letters from the coast";

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: PIECE_TITLE,
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Rui Sol",
    editorId: "marta",
    stage: "Published",
    due: "ready",
    art: "in",
    wait: "nobody",
    issueId: "issue-1",
    ...overrides,
  };
}

function renderRow(overrides: Partial<PieceRowProps> = {}) {
  const props: PieceRowProps = {
    piece: makePiece(),
    focused: false,
    track: "issue",
    hasAnyIssue: true,
    selected: false,
    today: TODAY,
    onToggleSelect: vi.fn(),
    onOpen: vi.fn(),
    onEdit: vi.fn(),
    onChase: vi.fn(),
    onHandoff: vi.fn(),
    onAssignIssue: vi.fn(),
    onDelete: vi.fn(),
    onUnpublish: vi.fn(),
    ...overrides,
  };
  render(
    <TestProviders>
      <PieceRow {...props} />
    </TestProviders>,
  );
  return props;
}

/** The magazine catalog loads on demand, so the trigger's name is blank on
 *  the first render; `findByRole` waits for the loaded copy. */
async function openMoreMenu(): Promise<HTMLElement> {
  fireEvent.click(
    await screen.findByRole("button", {
      name: `More actions for ${PIECE_TITLE}`,
    }),
  );
  return screen.findByRole("menu");
}

describe("PieceRow unpublish items", () => {
  it("lists Unpublish to draft and Unpublish to review after Hand off on a published row", async () => {
    renderRow();

    const labels = within(await openMoreMenu())
      .getAllByRole("menuitem")
      .map((item) => item.textContent);

    expect(labels).toEqual([
      "Edit",
      "Chase",
      "Hand off",
      "Unpublish to draft",
      "Unpublish to review",
      "Move issue…",
      "Delete piece",
    ]);
  });

  it("leaves the unpublish items out of a row that is not published", async () => {
    renderRow({ piece: makePiece({ stage: "Edit" }) });

    expect(
      within(await openMoreMenu()).queryByRole("menuitem", {
        name: /Unpublish/,
      }),
    ).not.toBeInTheDocument();
  });

  it("leaves the unpublish items out when the row has no unpublish handler", async () => {
    renderRow({ onUnpublish: undefined });

    expect(
      within(await openMoreMenu()).queryByRole("menuitem", {
        name: /Unpublish/,
      }),
    ).not.toBeInTheDocument();
  });

  it("sends the drafting stage from Unpublish to draft without opening the piece", async () => {
    const props = renderRow();

    fireEvent.click(
      within(await openMoreMenu()).getByRole("menuitem", {
        name: "Unpublish to draft",
      }),
    );

    expect(props.onUnpublish).toHaveBeenCalledWith(props.piece, "drafting");
    expect(props.onOpen).not.toHaveBeenCalled();
  });

  it("sends the in_review stage from Unpublish to review", async () => {
    const props = renderRow();

    fireEvent.click(
      within(await openMoreMenu()).getByRole("menuitem", {
        name: "Unpublish to review",
      }),
    );

    expect(props.onUnpublish).toHaveBeenCalledWith(props.piece, "in_review");
  });
});
