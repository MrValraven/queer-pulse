import {
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { htmlToPlainText } from "../../../shared/components/richText/plainText";
import {
  applyEmphasisTo,
  applyStrongTo,
  requestLinkPrompt,
} from "../../../shared/components/richText/selectionCommands";
import {
  extractHtmlAfterCaret,
  focusGuideTarget,
  htmlTextContent,
  type CaretPosition,
} from "./guideCaret";
import {
  changeBlock,
  convertBlock,
  insertBlocksAfter,
  previousBlockLocation,
  removeBlock,
  type SectionsUpdate,
} from "./guideDocumentOps";
import {
  createDraftKey,
  isFormattedKind,
  newDraftBlock,
  textToHtml,
  type DraftBlock,
  type DraftSection,
} from "./guideDraft";
import { matchMarkdownShortcut } from "./guideMarkdownShortcuts";
import { splitPastedText } from "./guidePaste";
import { guideBlockDomId } from "./guideWorkspace.data";

export interface GuideBlockEditing {
  handleBlockChange: (
    sectionKey: string,
    block: DraftBlock,
    value: string,
  ) => void;
  handleBlockKeyDown: (
    sectionKey: string,
    block: DraftBlock,
    event: KeyboardEvent<HTMLDivElement>,
  ) => void;
  handlePaste: (event: ClipboardEvent<HTMLDivElement>) => void;
  /** Focuses `targetId` after the next render, once it exists. */
  focusLater: (targetId: string, position: CaretPosition) => void;
}

function currentRange(): Range | null {
  const selection = document.getSelection();
  return selection && selection.rangeCount > 0
    ? selection.getRangeAt(0).cloneRange()
    : null;
}

/**
 * Typing inside blocks: markdown prefixes, Enter and Shift+Enter, Backspace
 * on an empty block, formatting shortcuts, and paste. Every change goes
 * through `onSectionsChange` as an update of the latest sections.
 */
export function useGuideBlockEditing({
  sections,
  onSectionsChange,
}: {
  sections: DraftSection[];
  onSectionsChange: (update: SectionsUpdate) => void;
}): GuideBlockEditing {
  const pendingFocusRef = useRef<{
    targetId: string;
    position: CaretPosition;
  } | null>(null);

  // Runs after every render: a block inserted by the last change exists now.
  useEffect(() => {
    const request = pendingFocusRef.current;
    if (!request) return;
    pendingFocusRef.current = null;
    focusGuideTarget(request.targetId, request.position);
  });

  function focusLater(targetId: string, position: CaretPosition) {
    pendingFocusRef.current = { targetId, position };
  }

  function convertAndFocus(
    sectionKey: string,
    blockKey: string,
    kind: DraftBlock["kind"],
  ) {
    const nextKey = createDraftKey();
    onSectionsChange((current) =>
      convertBlock(current, sectionKey, blockKey, kind, {
        nextKey,
        shouldClear: true,
      }),
    );
    focusLater(guideBlockDomId(nextKey), "start");
  }

  function handleBlockChange(
    sectionKey: string,
    block: DraftBlock,
    value: string,
  ) {
    const isFormatted = isFormattedKind(block.kind);
    const rawText = isFormatted ? htmlTextContent(value) : value;
    const shortcutKind = matchMarkdownShortcut(rawText, block.kind);
    if (shortcutKind) {
      convertAndFocus(sectionKey, block.key, shortcutKind);
      return;
    }
    const changes = isFormatted
      ? { html: value, text: htmlToPlainText(value) }
      : { text: value };
    onSectionsChange((current) =>
      changeBlock(current, sectionKey, block.key, changes),
    );
  }

  function splitBlock(
    sectionKey: string,
    block: DraftBlock,
    element: HTMLElement,
  ) {
    const isFormatted = isFormattedKind(block.kind);
    const trailingHtml = isFormatted ? extractHtmlAfterCaret(element) : "";
    const trailingText = htmlToPlainText(trailingHtml);
    const leadingHtml = element.innerHTML;
    const nextBlock = newDraftBlock(
      block.kind === "listItem" ? "listItem" : "paragraph",
      trailingText ? trailingHtml : "",
      trailingText,
    );
    onSectionsChange((current) => {
      const updated = isFormatted
        ? changeBlock(current, sectionKey, block.key, {
            html: leadingHtml,
            text: htmlToPlainText(leadingHtml),
          })
        : current;
      return insertBlocksAfter(updated, sectionKey, block.key, [nextBlock]);
    });
    focusLater(guideBlockDomId(nextBlock.key), "start");
  }

  function handleBlockKeyDown(
    sectionKey: string,
    block: DraftBlock,
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    // An IME composition owns Enter and Backspace until it commits. Safari
    // fires the committing Enter with isComposing false and keyCode 229.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    const element = event.currentTarget;
    const isFormatted = isFormattedKind(block.kind);
    if (event.metaKey || event.ctrlKey) {
      const pressedKey = event.key.toLowerCase();
      if (isFormatted && ["b", "i", "k"].includes(pressedKey)) {
        // The browser's own Cmd+B/I write <b>/<i>, which the sanitizer drops.
        event.preventDefault();
        if (pressedKey === "b") applyStrongTo(currentRange());
        else if (pressedKey === "i") applyEmphasisTo(currentRange());
        else requestLinkPrompt();
        return;
      }
      if (["b", "i", "u"].includes(pressedKey)) {
        // Cmd+U anywhere, and Cmd+B/I in a plain-text subheading, would write
        // <b>/<i>/<u> that the saved value never keeps.
        event.preventDefault();
        return;
      }
    }
    if (event.key === "Enter" && event.shiftKey && isFormatted) {
      event.preventDefault();
      document.execCommand("insertLineBreak");
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (block.kind === "listItem" && element.textContent === "") {
        convertAndFocus(sectionKey, block.key, "paragraph");
        return;
      }
      splitBlock(sectionKey, block, element);
      return;
    }
    if (event.key === "Backspace" && element.textContent === "") {
      const previous = previousBlockLocation(sections, sectionKey, block.key);
      if (!previous) return;
      event.preventDefault();
      onSectionsChange((current) =>
        removeBlock(current, sectionKey, block.key),
      );
      focusLater(guideBlockDomId(previous.blockKey), "end");
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-block-key]",
    );
    const sectionKey = target?.dataset.sectionKey;
    const blockKey = target?.dataset.blockKey;
    const text = event.clipboardData.getData("text/plain");
    if (!target || !sectionKey || !blockKey) return;
    // Rich clipboard markup is discarded: only the plain text survives, and a
    // clipboard without plain text pastes nothing.
    event.preventDefault();
    if (!text) return;
    const pasted = splitPastedText(text);
    if (pasted === null || pasted.length === 0) {
      document.execCommand(
        "insertText",
        false,
        text.replace(/\s+/g, " ").trim(),
      );
      return;
    }
    const newBlocks = pasted.map((entry) =>
      newDraftBlock(entry.kind, textToHtml(entry.text), entry.text),
    );
    const isTargetEmpty =
      (target.querySelector('[data-rich="true"]')?.textContent ?? "") === "";
    onSectionsChange((current) => {
      const inserted = insertBlocksAfter(
        current,
        sectionKey,
        blockKey,
        newBlocks,
      );
      return isTargetEmpty
        ? removeBlock(inserted, sectionKey, blockKey)
        : inserted;
    });
    const lastBlock = newBlocks[newBlocks.length - 1];
    if (lastBlock) focusLater(guideBlockDomId(lastBlock.key), "end");
  }

  return { handleBlockChange, handleBlockKeyDown, handlePaste, focusLater };
}
