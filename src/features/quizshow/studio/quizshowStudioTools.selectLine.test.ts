import { describe, expect, it } from "vitest";
import { selectLineIn } from "./quizshowStudioTools";

const TEXT = "# Music\nQ: Who sang Vogue?\n- Cher\n* Madonna";

function textareaWith(text: string): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.append(textarea);
  return textarea;
}

describe("selectLineIn", () => {
  it("focuses the box and selects the whole line, 1-based", () => {
    const textarea = textareaWith(TEXT);
    selectLineIn(textarea, TEXT, 2);
    expect(document.activeElement).toBe(textarea);
    expect(
      textarea.value.slice(textarea.selectionStart, textarea.selectionEnd),
    ).toBe("Q: Who sang Vogue?");
    textarea.remove();
  });

  it("selects the first line for line 1 and the last for a line past the end", () => {
    const textarea = textareaWith(TEXT);
    selectLineIn(textarea, TEXT, 1);
    expect(
      textarea.value.slice(textarea.selectionStart, textarea.selectionEnd),
    ).toBe("# Music");
    selectLineIn(textarea, TEXT, 99);
    expect(
      textarea.value.slice(textarea.selectionStart, textarea.selectionEnd),
    ).toBe("* Madonna");
    textarea.remove();
  });

  it("scrolls to a finite position", () => {
    const textarea = textareaWith(TEXT);
    selectLineIn(textarea, TEXT, 3);
    expect(Number.isFinite(textarea.scrollTop)).toBe(true);
    textarea.remove();
  });
});
