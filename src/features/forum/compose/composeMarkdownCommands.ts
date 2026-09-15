// ── The formatting toolbar's seven edits, as pure functions ─────────────────
// Every button in the body toolbar (and `⌘B` / `⌘I`) is one selection in and
// one selection out. No DOM, no React, no i18n: the caller reads
// `value`/`selectionStart`/`selectionEnd` off its textarea, hands them here,
// and writes the result back. That is what makes "wrapping the caret in `**`
// leaves the caret between the markers" a unit test rather than a click.
//
// The words a command drops in when nothing is selected ("text", "Heading",
// "link text") arrive as `placeholders`, so an English scaffold never lands in
// a Portuguese draft.

/** A textarea's value and its selection, before or after one command. */
export interface ComposeSelection {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/** Which toolbar button was pressed. */
export type ComposeMarkdownCommandId =
  | "bold"
  | "italic"
  | "heading"
  | "bulletList"
  | "numberedList"
  | "quote"
  | "link";

/** The stand-in words a command inserts when the member selected nothing. */
export interface ComposeMarkdownPlaceholders {
  /** Wrapped by bold and italic. */
  text: string;
  /** Wrapped by the heading command. */
  heading: string;
  /** The label half of an inserted link. */
  linkText: string;
  /** The href half, which the caret lands on so it can be typed over. */
  linkHref: string;
}

/** The scheme an inserted link starts with, ready for the member to finish. */
export const COMPOSE_LINK_HREF_STUB = "https://";

/**
 * Wrap the selection in `marker` on both sides, and leave the wrapped text
 * selected so a second press reads as a correction rather than as a new edit.
 *
 * `shouldAppendNewline` is what makes a heading a heading: the markdown-lite
 * parser only treats a fully-bold line as an `<h4>`, so the command has to end
 * the line it just made.
 */
export function wrapSelection(
  selection: ComposeSelection,
  marker: string,
  placeholder: string,
  shouldAppendNewline = false,
): ComposeSelection {
  const { value, selectionStart, selectionEnd } = selection;
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const suffix = shouldAppendNewline ? "\n" : "";
  const wrapped = `${marker}${selected}${marker}${suffix}`;
  const innerStart = selectionStart + marker.length;
  return {
    value: value.slice(0, selectionStart) + wrapped + value.slice(selectionEnd),
    selectionStart: innerStart,
    selectionEnd: innerStart + selected.length,
  };
}

/**
 * Put a prefix in front of every line the selection touches, whole lines at a
 * time. `buildPrefix` takes the line's position inside the selection, which is
 * how a numbered list counts up while a bulleted list repeats itself.
 */
export function prefixSelectedLines(
  selection: ComposeSelection,
  buildPrefix: (lineIndex: number) => string,
): ComposeSelection {
  const { value, selectionStart, selectionEnd } = selection;
  const blockStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const nextBreak = value.indexOf("\n", selectionEnd);
  const blockEnd = nextBreak === -1 ? value.length : nextBreak;
  const block = value.slice(blockStart, blockEnd);
  const prefixedBlock = block
    .split("\n")
    .map((line, lineIndex) => buildPrefix(lineIndex) + line)
    .join("\n");
  return {
    value: value.slice(0, blockStart) + prefixedBlock + value.slice(blockEnd),
    // The first line's prefix is the only one inserted BEFORE the caret, so it
    // is the only one that moves the start.
    selectionStart: selectionStart + buildPrefix(0).length,
    selectionEnd: selectionEnd + (prefixedBlock.length - block.length),
  };
}

/**
 * Turn the selection into a link's label and leave the caret at the end of the
 * href stub, ready to be typed onto. Nothing selected inserts the placeholder
 * label instead.
 */
export function insertLink(
  selection: ComposeSelection,
  placeholders: ComposeMarkdownPlaceholders,
): ComposeSelection {
  const { value, selectionStart, selectionEnd } = selection;
  const label =
    value.slice(selectionStart, selectionEnd) || placeholders.linkText;
  const inserted = `[${label}](${placeholders.linkHref})`;
  // "[" + label + "](" is what sits before the href.
  const caret =
    selectionStart + label.length + 3 + placeholders.linkHref.length;
  return {
    value:
      value.slice(0, selectionStart) + inserted + value.slice(selectionEnd),
    selectionStart: caret,
    selectionEnd: caret,
  };
}

/** One toolbar press (or keyboard shortcut) applied to the selection. */
export function applyComposeMarkdownCommand(
  commandId: ComposeMarkdownCommandId,
  selection: ComposeSelection,
  placeholders: ComposeMarkdownPlaceholders,
): ComposeSelection {
  switch (commandId) {
    case "bold":
      return wrapSelection(selection, "**", placeholders.text);
    case "italic":
      return wrapSelection(selection, "*", placeholders.text);
    case "heading":
      return wrapSelection(selection, "**", placeholders.heading, true);
    case "bulletList":
      return prefixSelectedLines(selection, () => "- ");
    case "numberedList":
      return prefixSelectedLines(
        selection,
        (lineIndex) => `${lineIndex + 1}. `,
      );
    case "quote":
      return prefixSelectedLines(selection, () => "> ");
    case "link":
      return insertLink(selection, placeholders);
  }
}
