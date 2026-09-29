import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Viewer } from "../api/useDeskPresence";
import type { Piece } from "../data/desk.data";
import { PieceRow, type PieceRowProps } from "./PieceRow";

/** A fixed day, so relative due text never depends on when the suite runs. */
const TODAY = new Date(2026, 7, 5);

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
    ...overrides,
  };
  const view = render(
    <TestProviders>
      <PieceRow {...props} />
    </TestProviders>,
  );
  return { ...view, props };
}

function openMoreMenu(title = "Letters from the coast"): HTMLElement {
  fireEvent.click(
    screen.getByRole("button", { name: `More actions for ${title}` }),
  );
  return screen.getByRole("menu");
}

describe("PieceRow", () => {
  it("makes the title the row's control and opens the piece from it", () => {
    const { props } = renderRow();

    fireEvent.click(
      screen.getByRole("button", { name: "Letters from the coast" }),
    );

    expect(props.onOpen).toHaveBeenCalledWith(props.piece);
    expect(document.querySelector('[role="button"]')).toBeNull();
  });

  it("opens the piece from a click on empty row space", () => {
    const { props, container } = renderRow();
    const row = container.querySelector<HTMLElement>("[data-focus]");
    if (!row) throw new Error("No row rendered");

    fireEvent.click(row);

    expect(props.onOpen).toHaveBeenCalledTimes(1);
  });

  it("selects with a real checkbox without opening the piece", () => {
    const { props } = renderRow();

    const checkbox = screen.getByRole("checkbox", {
      name: "Select Letters from the coast",
    });
    fireEvent.click(checkbox);

    expect(props.onToggleSelect).toHaveBeenCalledWith(props.piece);
    expect(props.onOpen).not.toHaveBeenCalled();
  });

  it("joins only the meta parts that have text", () => {
    renderRow({ piece: makePiece({ section: "", byline: "Rui Sol" }) });

    expect(screen.getByText("Rui Sol")).toBeInTheDocument();
    expect(screen.queryByText("·")).not.toBeInTheDocument();
  });

  it("joins section and byline with a dot when both are set", () => {
    renderRow();

    expect(screen.getByText("Essays")).toBeInTheDocument();
    expect(screen.getByText("·")).toHaveAttribute("aria-hidden", "true");
  });

  it("says so when nobody writes the piece yet", () => {
    renderRow({ piece: makePiece({ byline: "  " }) });

    expect(screen.getByText("No writer yet")).toBeInTheDocument();
  });

  it("names who the piece waits on", () => {
    renderRow({ piece: makePiece({ wait: "writer", stage: "Drafting" }) });

    // The column's name leads the cell for screen readers.
    expect(screen.getByText("Writer").parentElement).toHaveTextContent(
      "Waiting on Writer",
    );
  });

  it("counts the due day from today and marks it late", () => {
    renderRow({ piece: makePiece({ due: "2 Aug", dueDate: "2026-08-02" }) });

    const dueCell = screen.getByText("3 days late");
    expect(dueCell).toHaveAttribute("data-late", "true");
    expect(dueCell).toHaveTextContent("Due 3 days late");
  });

  it("offers Set date on an undated piece, falling back to edit", () => {
    const { props } = renderRow();

    fireEvent.click(screen.getByRole("button", { name: "Set date" }));

    expect(props.onEdit).toHaveBeenCalledWith(props.piece);
    expect(props.onOpen).not.toHaveBeenCalled();
  });

  it("sends Set date to onSetDue when one is given", () => {
    const onSetDue = vi.fn();
    const { props } = renderRow({ onSetDue });

    fireEvent.click(screen.getByRole("button", { name: "Set date" }));

    expect(onSetDue).toHaveBeenCalledWith(props.piece);
    expect(props.onEdit).not.toHaveBeenCalled();
  });

  it("reads out No due date for finished work", () => {
    renderRow({ piece: makePiece({ stage: "Ready", due: "ready" }) });

    expect(screen.getByText("No due date")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Set date" }),
    ).not.toBeInTheDocument();
  });

  it("says when a scheduled piece goes live in place of a verb", () => {
    renderRow({
      piece: makePiece({
        stage: "Ready",
        publishedAt: new Date(Date.now() + 40 * 60 * 60 * 1000).toISOString(),
      }),
    });

    expect(screen.getByText(/^Goes live \S/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Publish" })).toBeNull();
  });

  it("hands the next action to onNextAction", () => {
    const onNextAction = vi.fn();
    const { props } = renderRow({ onNextAction });

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(onNextAction).toHaveBeenCalledWith(
      props.piece,
      expect.objectContaining({ kind: "edit" }),
    );
    expect(props.onEdit).not.toHaveBeenCalled();
  });

  it("falls back to the row handlers without onNextAction", () => {
    const { props } = renderRow({
      piece: makePiece({ wait: "writer", stage: "Drafting" }),
    });

    fireEvent.click(screen.getByRole("button", { name: "Chase" }));

    expect(props.onChase).toHaveBeenCalledWith(props.piece);
    expect(props.onOpen).not.toHaveBeenCalled();
  });

  it("keeps the other verbs in the More menu, Delete last", () => {
    renderRow();

    const menu = openMoreMenu();
    const labels = within(menu)
      .getAllByRole("menuitem")
      .map((item) => item.textContent);

    expect(labels).toEqual([
      "Edit",
      "Chase",
      "Hand off",
      "Move issue…",
      "Delete piece",
    ]);
    expect(within(menu).getByRole("separator")).toBeInTheDocument();
  });

  it("leaves the issue item out when there is no issue", () => {
    renderRow({ hasAnyIssue: false });

    const menu = openMoreMenu();

    expect(
      within(menu).queryByRole("menuitem", { name: /issue/ }),
    ).not.toBeInTheDocument();
  });

  it("reads Add to issue for unfiled work in the everything scope", () => {
    renderRow({ track: "everything", piece: makePiece({ issueId: null }) });

    const menu = openMoreMenu();

    expect(
      within(menu).getByRole("menuitem", { name: "Add to issue…" }),
    ).toBeInTheDocument();
  });

  it("runs a menu item without opening the piece", () => {
    const { props } = renderRow();

    const menu = openMoreMenu();
    fireEvent.click(within(menu).getByRole("menuitem", { name: "Hand off" }));

    expect(props.onHandoff).toHaveBeenCalledWith(props.piece);
    expect(props.onOpen).not.toHaveBeenCalled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("marks the row open in the peek panel", () => {
    renderRow({ isOpen: true });

    expect(
      screen.getByRole("button", { name: "Letters from the coast" }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("shows a presence stack for an editor already viewing the piece", () => {
    const viewers: Viewer[] = [
      { userId: "sara", name: "Sara Pinheiro", initials: "SP" },
    ];
    renderRow({ viewers });

    // A single grid area ("presence" in PieceRow.module.css) holds the stack
    // at every width step, so exactly one is ever in the row: getByRole
    // throws if the piece cell rendered it twice.
    expect(
      screen.getByRole("img", { name: "Sara Pinheiro viewing" }),
    ).toBeInTheDocument();
  });

  it("renders no presence stack without viewers", () => {
    renderRow();

    expect(
      screen.queryByRole("img", { name: /viewing/ }),
    ).not.toBeInTheDocument();
  });

  describe("control order", () => {
    /** The row's focusable controls, in DOM (and so Tab) order. */
    function controlOrder(container: HTMLElement): string[] {
      return [...container.querySelectorAll("input, button")].map(
        (control) =>
          control.getAttribute("aria-label") ??
          control.textContent?.trim() ??
          "",
      );
    }

    it("keeps the table order when the rows are wide", () => {
      const { container } = renderRow({ isStacked: false });

      expect(controlOrder(container)).toEqual([
        "Select Letters from the coast",
        "Letters from the coast",
        "Set date",
        "Edit",
        "More actions for Letters from the coast",
      ]);
    });

    it("puts the verb and More before the lower-line cells in a phone card", () => {
      const { container } = renderRow({ isStacked: true });

      expect(controlOrder(container)).toEqual([
        "Select Letters from the coast",
        "Letters from the coast",
        "Edit",
        "More actions for Letters from the coast",
        "Set date",
      ]);
    });
  });
});
