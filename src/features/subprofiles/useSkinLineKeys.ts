import type { ClipboardEvent, KeyboardEvent } from "react";
import type { SkinListFocusTarget } from "./skinListFocus";

type LineField = HTMLInputElement | HTMLTextAreaElement;

const LINE_BREAK = /\r\n|\r|\n/;

/** The slice of `useSkinListRows<string>` the line keys drive. */
interface SkinLineRows {
  items: string[];
  insert: (index: number, newItems: string[]) => void;
  update: (index: number, item: string) => void;
  remove: (index: number) => void;
  requestFocus: (target: SkinListFocusTarget) => void;
}

function hasModifier(event: KeyboardEvent<LineField>) {
  return event.altKey || event.ctrlKey || event.metaKey;
}

/**
 * The quick keyboard flow of a `lines` list, as the chips had it:
 *
 * - Enter on a line with text opens an empty line under it and moves there.
 *   On an empty line it does nothing, and it never types a line break.
 * - Backspace on an empty line, caret at the start, removes it and returns
 *   to the end of the line above (the next line when it was the first, the
 *   add button when none is left).
 * - Pasting text with line breaks splits it: the first piece lands at the
 *   caret, the rest become new lines under this one, blank pieces dropped,
 *   and the caret ends on the last of them.
 *
 * Keys are ignored while an input method is composing. Alt with an arrow
 * stays with `useSkinListRows`, which moves the row.
 */
export function useSkinLineKeys(rows: SkinLineRows) {
  function handleKeyDown(index: number, event: KeyboardEvent<LineField>) {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    const field = event.currentTarget;

    if (event.key === "Enter") {
      event.preventDefault();
      if (hasModifier(event) || field.value.trim() === "") return;
      rows.insert(index + 1, [""]);
      return;
    }

    const isCaretAtStart =
      field.selectionStart === 0 && field.selectionEnd === 0;
    if (
      event.key !== "Backspace" ||
      hasModifier(event) ||
      field.value !== "" ||
      !isCaretAtStart
    ) {
      return;
    }
    event.preventDefault();
    const remainingCount = rows.items.length - 1;
    rows.remove(index);
    rows.requestFocus(
      index > 0
        ? { rowIndex: index - 1, caret: "end" }
        : remainingCount > 0
          ? { rowIndex: 0 }
          : { isAddButton: true },
    );
  }

  function handlePaste(index: number, event: ClipboardEvent<LineField>) {
    const text = event.clipboardData.getData("text/plain");
    if (!LINE_BREAK.test(text)) return;
    event.preventDefault();
    const pieces = text
      .split(LINE_BREAK)
      .map((piece) => piece.trim())
      .filter((piece) => piece !== "");
    const [firstPiece, ...laterPieces] = pieces;
    if (firstPiece === undefined) return;

    const field = event.currentTarget;
    const selectionStart = field.selectionStart ?? field.value.length;
    const selectionEnd = field.selectionEnd ?? selectionStart;
    rows.update(
      index,
      field.value.slice(0, selectionStart) +
        firstPiece +
        field.value.slice(selectionEnd),
    );
    if (laterPieces.length > 0) {
      rows.insert(index + 1, laterPieces);
    } else {
      rows.requestFocus({
        rowIndex: index,
        caret: selectionStart + firstPiece.length,
      });
    }
  }

  return {
    /** Spread onto line `index`'s field. */
    fieldHandlers: (index: number) => ({
      onKeyDown: (event: KeyboardEvent<LineField>) =>
        handleKeyDown(index, event),
      onPaste: (event: ClipboardEvent<LineField>) => handlePaste(index, event),
    }),
  };
}
