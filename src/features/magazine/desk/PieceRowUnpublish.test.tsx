import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Piece } from "../data/desk.data";
import { PieceRow, type PieceRowProps } from "./PieceRow";

/** The Unpublish item in a piece row's More menu: only a published row has
 *  it, set apart between the everyday items and Delete, and it raises the
 *  confirm for its own piece (the confirm picks where the piece goes). */

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

describe("PieceRow unpublish item", () => {
  it("lists Unpublish… after the issue item, behind its own rule, before Delete", async () => {
    renderRow();

    const menu = await openMoreMenu();
    const entries = Array.from(
      menu.querySelectorAll('[role="menuitem"], [role="separator"]'),
    ).map((entry) =>
      entry.getAttribute("role") === "separator" ? "|" : entry.textContent,
    );

    expect(entries).toEqual([
      "Edit",
      "Chase",
      "Hand off",
      "Move issue…",
      "|",
      "Unpublish…",
      "|",
      "Delete piece",
    ]);
  });

  it("leaves the Unpublish item out of a row that is not published", async () => {
    renderRow({ piece: makePiece({ stage: "Edit" }) });

    expect(
      within(await openMoreMenu()).queryByRole("menuitem", {
        name: /Unpublish/,
      }),
    ).not.toBeInTheDocument();
  });

  it("leaves the Unpublish item out when the row has no unpublish handler", async () => {
    renderRow({ onUnpublish: undefined });

    expect(
      within(await openMoreMenu()).queryByRole("menuitem", {
        name: /Unpublish/,
      }),
    ).not.toBeInTheDocument();
  });

  it("raises the confirm for its piece from Unpublish… without opening the piece", async () => {
    const props = renderRow();

    fireEvent.click(
      within(await openMoreMenu()).getByRole("menuitem", {
        name: "Unpublish…",
      }),
    );

    expect(props.onUnpublish).toHaveBeenCalledTimes(1);
    expect(props.onUnpublish).toHaveBeenCalledWith(props.piece);
    expect(props.onOpen).not.toHaveBeenCalled();
  });
});
