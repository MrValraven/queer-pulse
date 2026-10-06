import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_STAGES, type Piece } from "../data/desk.data";
import { PiecesBoard } from "./PiecesBoard";
import { canDropOnStage, isCardDraggable } from "./useBoardDrag";

/** An instant a day ahead, so a piece carrying it reads as scheduled. */
function tomorrowIso(): string {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

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

/** The column whose heading starts with the stage's English label. */
function columnFor(label: string): HTMLElement {
  const heading = screen
    .getAllByRole("heading", { level: 3 })
    .find((candidate) => candidate.textContent?.startsWith(label));
  if (!heading?.parentElement) throw new Error(`No column for ${label}`);
  return heading.parentElement;
}

function cardFor(title: string): HTMLElement {
  const card = screen
    .getByRole("button", { name: title })
    .closest<HTMLElement>('[draggable="true"]');
  if (!card) throw new Error(`No card for ${title}`);
  return card;
}

/** A locked card's status line: the paragraph holding its hidden way-out
 *  reason, which is also the line's accessible description. */
async function lockedStageLine(reason: string): Promise<HTMLElement> {
  const reasonText = await screen.findByText(reason);
  const line = reasonText.closest<HTMLElement>("p");
  if (!line) throw new Error(`No status line for "${reason}"`);
  return line;
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

describe("canDropOnStage", () => {
  it("accepts another working stage", () => {
    expect(canDropOnStage(makePiece({ stage: "Edit" }), "Layout")).toBe(true);
  });

  it("refuses Published and the piece's own stage", () => {
    expect(canDropOnStage(makePiece({ stage: "Ready" }), "Published")).toBe(
      false,
    );
    expect(canDropOnStage(makePiece({ stage: "Edit" }), "Edit")).toBe(false);
  });
});

describe("PiecesBoard", () => {
  it("draws one column per stage with its count", async () => {
    renderBoard({ pieces: [makePiece({ stage: "Drafting" })] });

    expect(await screen.findAllByRole("heading", { level: 3 })).toHaveLength(
      DEMO_STAGES.length,
    );
    expect(within(columnFor("Drafting")).getByText("1")).toBeInTheDocument();
  });

  it("moves a piece when its card is dropped on another column", async () => {
    const piece = makePiece({ title: "Moving piece", stage: "Edit" });
    const { onMove } = renderBoard({ pieces: [piece] });
    const dataTransfer = makeDataTransfer();

    fireEvent.dragStart(cardFor("Moving piece"), { dataTransfer });
    fireEvent.dragOver(columnFor("Layout"), { dataTransfer });
    fireEvent.drop(columnFor("Layout"), { dataTransfer });

    expect(onMove).toHaveBeenCalledWith(piece, "Layout");
    expect(dataTransfer.setData).toHaveBeenCalledWith("text/plain", piece.id);
    await screen.findByRole("button", { name: "Moving piece" });
  });

  it("never moves a piece by dropping it on Published", async () => {
    const { onMove } = renderBoard({
      pieces: [makePiece({ title: "Almost live", stage: "Ready" })],
    });
    const dataTransfer = makeDataTransfer();

    fireEvent.dragStart(cardFor("Almost live"), { dataTransfer });
    fireEvent.dragOver(columnFor("Published"), { dataTransfer });
    fireEvent.drop(columnFor("Published"), { dataTransfer });

    expect(onMove).not.toHaveBeenCalled();
    await screen.findByRole("button", { name: "Almost live" });
  });

  it("keeps a Published card in place: no drag and no drop elsewhere", async () => {
    const { onMove } = renderBoard({
      pieces: [makePiece({ title: "Live piece", stage: "Published" })],
    });
    const dataTransfer = makeDataTransfer();
    const card = (
      await screen.findByRole("button", { name: "Live piece" })
    ).closest<HTMLElement>("[draggable]");

    expect(card).toHaveAttribute("draggable", "false");
    fireEvent.dragStart(card as HTMLElement, { dataTransfer });
    fireEvent.dragOver(columnFor("Ready"), { dataTransfer });
    fireEvent.drop(columnFor("Ready"), { dataTransfer });

    expect(onMove).not.toHaveBeenCalled();
    expect(canDropOnStage(makePiece({ stage: "Published" }), "Ready")).toBe(
      false,
    );
  });

  it("shows a Published piece's live line in place of its stage picker", async () => {
    renderBoard({
      pieces: [makePiece({ title: "Live piece", stage: "Published" })],
    });

    const line = await lockedStageLine(
      "Unpublish from the piece record to move it",
    );
    expect(line).toHaveTextContent(/^Live on the site/);
    expect(line).toHaveTextContent(
      "Unpublish from the piece record to move it",
    );
    expect(line).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("button", { name: "Move stage" })).toBeNull();
  });

  it("keeps a scheduled card in place: no drag and no drop elsewhere", () => {
    const scheduled = makePiece({
      stage: "Ready",
      issueId: "issue-14",
      publishedAt: tomorrowIso(),
    });

    expect(isCardDraggable(scheduled)).toBe(false);
    expect(canDropOnStage(scheduled, "Layout")).toBe(false);
  });

  it("keeps a live Ready card in place once its publish instant has passed", () => {
    const live = makePiece({
      stage: "Ready",
      issueId: "issue-14",
      publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    });

    expect(isCardDraggable(live)).toBe(false);
    expect(canDropOnStage(live, "Edit")).toBe(false);
  });

  it("shows a live Ready piece's live line and says to unpublish", async () => {
    renderBoard({
      pieces: [
        makePiece({
          title: "Live Ready piece",
          stage: "Ready",
          issueId: "issue-14",
          publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        }),
      ],
    });

    const line = await lockedStageLine(
      "Unpublish from the piece record to move it",
    );
    expect(line).toHaveTextContent(
      /^Live since \S.*Publish it to tell the writer\./,
    );
    expect(line).toHaveTextContent(
      "Unpublish from the piece record to move it",
    );
    expect(line).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("button", { name: "Move stage" })).toBeNull();
  });

  it("shows a scheduled piece's go-live date and points to the record", async () => {
    renderBoard({
      pieces: [
        makePiece({
          title: "Scheduled piece",
          stage: "Ready",
          issueId: "issue-14",
          publishedAt: tomorrowIso(),
        }),
      ],
    });

    const reason =
      "Scheduled to publish. Unschedule it from the piece record to move it";
    const line = await lockedStageLine(reason);
    expect(line).toHaveTextContent(/^Goes live \S/);
    expect(line).toHaveTextContent(reason);
    expect(line).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("button", { name: "Move stage" })).toBeNull();
  });

  it("starts no drag from a press on the card's controls", async () => {
    const { onMove } = renderBoard({
      pieces: [makePiece({ title: "Held piece", stage: "Edit" })],
    });
    const dataTransfer = makeDataTransfer();
    const picker = await screen.findByRole("button", { name: "Move stage" });

    fireEvent.pointerDown(picker);
    fireEvent.dragStart(cardFor("Held piece"), { dataTransfer });
    fireEvent.dragOver(columnFor("Layout"), { dataTransfer });
    fireEvent.drop(columnFor("Layout"), { dataTransfer });

    expect(dataTransfer.setData).not.toHaveBeenCalled();
    expect(onMove).not.toHaveBeenCalled();
  });

  it("flags a column holding more pieces than the team cap", async () => {
    renderBoard({
      teamCap: 1,
      pieces: [
        makePiece({ id: "piece-1", title: "First", stage: "Edit" }),
        makePiece({ id: "piece-2", title: "Second", stage: "Edit" }),
      ],
    });

    expect(
      await within(columnFor("Edit")).findByText("Over 1"),
    ).toBeInTheDocument();
    expect(within(columnFor("Layout")).queryByText(/Over/)).toBeNull();
  });

  it("runs the card's next action through onNextAction", async () => {
    const onNextAction = vi.fn();
    // "In review" leads with Edit. The stage picker is named "Move stage",
    // so the one button named "Edit" is the next action.
    const piece = makePiece({ title: "Needs an edit", stage: "In review" });
    renderBoard({ pieces: [piece], onNextAction });

    fireEvent.click(await screen.findByRole("button", { name: "Edit" }));

    expect(onNextAction).toHaveBeenCalledWith(
      piece,
      expect.objectContaining({ kind: "edit" }),
    );
  });

  it("opens the piece from its title", async () => {
    const piece = makePiece({ title: "Open me" });
    const { onOpen } = renderBoard({ pieces: [piece] });

    fireEvent.click(await screen.findByRole("button", { name: "Open me" }));

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(piece);
  });
});
