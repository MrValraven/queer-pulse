import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Piece } from "../data/desk.data";
import { PieceDueDatePopover } from "./PieceDueDatePopover";
import { PieceRow, type PieceRowProps } from "./PieceRow";
import { PieceDueDateContext, type PieceDueDateEditor } from "./pieceDueDate";

const TITLE_ID = "piece-title";

/** Phone width is read through `useMediaQuery`; every other query keeps the
 *  jsdom answer (no match). */
const viewportState = vi.hoisted(() => ({ isMobile: false }));

vi.mock("../../../shared/hooks/useMediaQuery", () => ({
  useMediaQuery: () => viewportState.isMobile,
}));

afterEach(() => {
  viewportState.isMobile = false;
});

/** Today as the calendar's own ISO day, on the viewer's local calendar. */
function todayIso(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function renderPopover(
  onSave: (dueOn: string) => Promise<void> = vi
    .fn()
    .mockResolvedValue(undefined),
) {
  render(
    <TestProviders>
      <button type="button" id={TITLE_ID}>
        Letters from the coast
      </button>
      <PieceDueDatePopover titleId={TITLE_ID} onSave={onSave} />
    </TestProviders>,
  );
  return { onSave, trigger: screen.getByRole("button", { name: "Set date" }) };
}

describe("PieceDueDatePopover", () => {
  it("opens a labelled date dialog from Set date", () => {
    const { trigger } = renderPopover();

    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-describedby", TITLE_ID);

    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Choose a due date" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", dialog.id);
  });

  it("closes on Escape and returns focus to Set date", () => {
    const { trigger, onSave } = renderPopover();
    fireEvent.click(trigger);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("closes on a press outside and returns focus to Set date", () => {
    const { trigger, onSave } = renderPopover();
    fireEvent.click(trigger);

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("opens a labelled bottom sheet on phones and saves from it", async () => {
    viewportState.isMobile = true;
    const { trigger, onSave } = renderPopover();

    fireEvent.click(trigger);

    const sheet = screen.getByRole("dialog", { name: "Choose a due date" });
    expect(sheet).toHaveAttribute("aria-modal", "true");
    // The sheet carries no id of its own, so nothing points at it.
    expect(trigger).not.toHaveAttribute("aria-controls");

    fireEvent.click(screen.getByRole("button", { name: "Today" }));

    expect(onSave).toHaveBeenCalledWith(todayIso());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Letters from the coast" }),
      ).toHaveFocus(),
    );
  });

  it("saves the picked day and hands focus to the row title", async () => {
    const { trigger, onSave } = renderPopover();
    fireEvent.click(trigger);

    fireEvent.click(screen.getByRole("button", { name: "Today" }));

    expect(onSave).toHaveBeenCalledWith(todayIso());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Letters from the coast" }),
      ).toHaveFocus(),
    );
  });

  it("keeps focus on Set date when the save fails", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("offline"));
    const { trigger } = renderPopover(onSave);
    fireEvent.click(trigger);

    fireEvent.click(screen.getByRole("button", { name: "Today" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(trigger).not.toHaveAttribute("aria-disabled"));
    expect(trigger).toHaveFocus();
  });
});

describe("PieceRow Set date inside the desk", () => {
  function makeUndatedPiece(): Piece {
    return {
      id: "piece-7",
      title: "Letters from the coast",
      format: "article",
      section: "Essays",
      kind: "Essay",
      byline: "Rui Sol",
      editorId: "marta",
      stage: "Edit",
      due: "",
      art: "in",
      issueId: "issue-1",
    };
  }

  it("opens the date popover and saves through the desk's editor", async () => {
    const saveDueOn = vi.fn().mockResolvedValue(undefined);
    const editor: PieceDueDateEditor = { saveDueOn };
    const props: PieceRowProps = {
      piece: makeUndatedPiece(),
      focused: false,
      track: "issue",
      hasAnyIssue: true,
      selected: false,
      onToggleSelect: vi.fn(),
      onOpen: vi.fn(),
      onEdit: vi.fn(),
      onChase: vi.fn(),
      onHandoff: vi.fn(),
      onAssignIssue: vi.fn(),
      onDelete: vi.fn(),
      onSetDue: vi.fn(),
    };
    render(
      <TestProviders>
        <PieceDueDateContext.Provider value={editor}>
          <PieceRow {...props} />
        </PieceDueDateContext.Provider>
      </TestProviders>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Set date" }));
    fireEvent.click(screen.getByRole("button", { name: "Today" }));

    await waitFor(() =>
      expect(saveDueOn).toHaveBeenCalledWith("piece-7", todayIso()),
    );
    // The save settles with focus on the row's title, the row's own control.
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Letters from the coast" }),
      ).toHaveFocus(),
    );
    expect(props.onSetDue).not.toHaveBeenCalled();
    expect(props.onEdit).not.toHaveBeenCalled();
    expect(props.onOpen).not.toHaveBeenCalled();
  });
});
