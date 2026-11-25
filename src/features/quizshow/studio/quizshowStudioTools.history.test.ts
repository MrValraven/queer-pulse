import { describe, expect, it, vi } from "vitest";
import { historyEntriesOf } from "./quizshowStudioTools";

const t = (key: string) => key;

function studioOf(overrides: {
  isWide: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  hasHistory?: boolean;
}) {
  const history = { undo: vi.fn(), redo: vi.fn() };
  return {
    history,
    studio: {
      isWide: overrides.isWide,
      history: overrides.hasHistory === false ? null : history,
      controller: { canUndo: overrides.canUndo, canRedo: overrides.canRedo },
    },
  };
}

describe("historyEntriesOf", () => {
  it("adds nothing on a wide screen, where the keys are", () => {
    expect(historyEntriesOf(studioOf({ isWide: true }).studio, t)).toEqual([]);
  });

  it("adds nothing while the draft has no history", () => {
    const { studio } = studioOf({ isWide: false, hasHistory: false });
    expect(historyEntriesOf(studio, t)).toEqual([]);
  });

  it("disables each entry while there is nothing to step to", () => {
    const { studio } = studioOf({ isWide: false });
    const entries = historyEntriesOf(studio, t);
    expect(entries.map((entry) => entry.key)).toEqual(["undo", "redo"]);
    expect(
      entries.map((entry) => "isDisabled" in entry && entry.isDisabled),
    ).toEqual([true, true]);
  });

  it("enables Undo and Redo on their own flags and calls the keyboard paths", () => {
    const { studio, history } = studioOf({
      isWide: false,
      canUndo: true,
      canRedo: false,
    });
    const [undoEntry, redoEntry] = historyEntriesOf(studio, t);
    if (undoEntry === undefined || redoEntry === undefined) {
      throw new Error("expected Undo and Redo entries");
    }
    expect("isDisabled" in undoEntry && undoEntry.isDisabled).toBe(false);
    expect("isDisabled" in redoEntry && redoEntry.isDisabled).toBe(true);
    if ("onSelect" in undoEntry) undoEntry.onSelect();
    expect(history.undo).toHaveBeenCalledTimes(1);
    expect(history.redo).not.toHaveBeenCalled();
  });
});
