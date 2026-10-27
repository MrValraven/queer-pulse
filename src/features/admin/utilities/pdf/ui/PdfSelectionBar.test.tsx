import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../../app/providers/I18nProvider";
import { PdfSelectionBar, type PdfSelectionBarProps } from "./PdfSelectionBar";

const onSelectAll = vi.fn();
const onClearSelection = vi.fn();
const onRemove = vi.fn();
const onRotate = vi.fn();
const onNudge = vi.fn();
const onUndo = vi.fn();
const onRedo = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function barWith(overrides: Partial<PdfSelectionBarProps>) {
  return (
    <I18nProvider>
      <PdfSelectionBar
        selectedCount={0}
        isWholeGridSelected={false}
        isUndoAvailable={false}
        isRedoAvailable={false}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
        onRemove={onRemove}
        onRotate={onRotate}
        onNudge={onNudge}
        onUndo={onUndo}
        onRedo={onRedo}
        {...overrides}
      />
    </I18nProvider>
  );
}

/** Renders the bar; `rerenderWith` swaps in the props a press would bring. */
function renderBar(overrides: Partial<PdfSelectionBarProps> = {}) {
  const view = render(barWith(overrides));
  return {
    rerenderWith: (nextOverrides: Partial<PdfSelectionBarProps>) =>
      view.rerender(barWith({ ...overrides, ...nextOverrides })),
  };
}

/** Matches only the phone-width query, the way a 390px screen would. */
function stubPhoneWidth() {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query === "(max-width: 640px)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

describe("PdfSelectionBar", () => {
  it("disables Remove pages with its reason when every page is selected", async () => {
    // A one-page grid: its single page is the whole grid.
    renderBar({ selectedCount: 1, isWholeGridSelected: true });
    const remove = await screen.findByRole("button", { name: "Remove pages" });
    expect(remove).toBeDisabled();
    expect(remove).toHaveAccessibleDescription(
      "Keep at least one page. Unselect a page to remove the rest",
    );
  });

  it("enables Remove pages without the reason while some pages stay unselected", async () => {
    renderBar({ selectedCount: 2, isWholeGridSelected: false });
    const remove = await screen.findByRole("button", { name: "Remove pages" });
    expect(remove).toBeEnabled();
    expect(remove).not.toHaveAttribute("aria-describedby");
    await userEvent.setup().click(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("disables page actions with nothing selected", async () => {
    renderBar({ selectedCount: 0 });
    for (const name of [
      "Remove pages",
      "Rotate left",
      "Rotate right",
      "Move pages earlier",
      "Move pages later",
    ]) {
      expect(await screen.findByRole("button", { name })).toBeDisabled();
    }
    expect(
      screen.getByRole("button", { name: "Clear selection" }),
    ).toBeDisabled();
  });

  it("announces the selected page count", async () => {
    renderBar({ selectedCount: 3 });
    // Waits for the admin catalog to load before reading the status text.
    await screen.findByRole("button", { name: "Select all pages" });
    expect(screen.getByRole("status")).toHaveTextContent("3 pages selected");
  });

  it("announces the selection hint while nothing is selected", async () => {
    renderBar({ selectedCount: 0 });
    // Waits for the admin catalog to load before reading the status text.
    await screen.findByRole("button", { name: "Select all pages" });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Select pages to rotate, move or remove them",
    );
  });

  it("rotates and nudges in the named direction", async () => {
    const user = userEvent.setup();
    renderBar({ selectedCount: 2 });
    await user.click(
      await screen.findByRole("button", { name: "Rotate left" }),
    );
    expect(onRotate).toHaveBeenCalledWith("left");
    await user.click(screen.getByRole("button", { name: "Rotate right" }));
    expect(onRotate).toHaveBeenCalledWith("right");
    await user.click(screen.getByRole("button", { name: "Move pages later" }));
    expect(onNudge).toHaveBeenCalledWith(1);
    await user.click(
      screen.getByRole("button", { name: "Move pages earlier" }),
    );
    expect(onNudge).toHaveBeenCalledWith(-1);
  });

  it("selects all and clears the selection", async () => {
    const user = userEvent.setup();
    renderBar({ selectedCount: 2 });
    await user.click(
      await screen.findByRole("button", { name: "Select all pages" }),
    );
    expect(onSelectAll).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });

  it("disables undo and redo when there is nothing to step through", async () => {
    renderBar({ isUndoAvailable: false, isRedoAvailable: false });
    expect(
      await screen.findByRole("button", { name: "Undo edit" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redo edit" })).toBeDisabled();
  });

  it("steps back and forward through the edit history when it can", async () => {
    const user = userEvent.setup();
    renderBar({ isUndoAvailable: true, isRedoAvailable: true });
    await user.click(await screen.findByRole("button", { name: "Undo edit" }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Redo edit" }));
    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  it("names the undo and redo keyboard shortcuts", async () => {
    renderBar({ isUndoAvailable: true, isRedoAvailable: true });
    expect(
      await screen.findByRole("button", { name: "Undo edit" }),
    ).toHaveAttribute("aria-keyshortcuts", "Control+Z Meta+Z");
    expect(screen.getByRole("button", { name: "Redo edit" })).toHaveAttribute(
      "aria-keyshortcuts",
      "Shift+Control+Z Shift+Meta+Z",
    );
  });

  it("hands focus to Clear selection once Select all switches itself off", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderBar({ selectedCount: 2 });
    await user.click(
      await screen.findByRole("button", { name: "Select all pages" }),
    );
    rerenderWith({ selectedCount: 6, isWholeGridSelected: true });
    expect(
      screen.getByRole("button", { name: "Clear selection" }),
    ).toHaveFocus();
  });

  it("hands focus to Select all once Clear selection switches itself off", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderBar({ selectedCount: 2 });
    await user.click(
      await screen.findByRole("button", { name: "Clear selection" }),
    );
    rerenderWith({ selectedCount: 0 });
    expect(
      screen.getByRole("button", { name: "Select all pages" }),
    ).toHaveFocus();
  });

  it("hands focus between undo and redo as each runs out", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderBar({
      isUndoAvailable: true,
      isRedoAvailable: false,
    });
    await user.click(await screen.findByRole("button", { name: "Undo edit" }));
    rerenderWith({ isUndoAvailable: false, isRedoAvailable: true });
    const redo = screen.getByRole("button", { name: "Redo edit" });
    expect(redo).toHaveFocus();
    await user.click(redo);
    rerenderWith({ isUndoAvailable: true, isRedoAvailable: false });
    expect(screen.getByRole("button", { name: "Undo edit" })).toHaveFocus();
  });

  it("keeps focus on undo while more history remains", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderBar({
      isUndoAvailable: true,
      isRedoAvailable: false,
    });
    const undo = await screen.findByRole("button", { name: "Undo edit" });
    await user.click(undo);
    rerenderWith({ isUndoAvailable: true, isRedoAvailable: true });
    expect(undo).toHaveFocus();
  });

  it("shows Remove pages as an icon button with the same name on a phone", async () => {
    stubPhoneWidth();
    renderBar({ selectedCount: 1, isWholeGridSelected: true });
    const remove = await screen.findByRole("button", { name: "Remove pages" });
    expect(remove).toBeDisabled();
    expect(remove).toHaveAccessibleDescription(
      "Keep at least one page. Unselect a page to remove the rest",
    );
    // The icon button carries its name as a label, with no visible text.
    expect(remove).toHaveAttribute("aria-label", "Remove pages");
  });
});
