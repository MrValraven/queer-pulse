import { useEffect, type RefObject } from "react";
import {
  findRichAncestor,
  RICH_TEXT_LINK_REQUEST_EVENT,
} from "./selectionCommands";

/**
 * Listens for `requestLinkPrompt()` and hands the current selection's range
 * to `onRange` when it sits inside `scopeRef` and inside a formatted block
 * (plain-text fields take no links, see `plainText.ts`).
 */
export function useRichTextLinkRequest(
  scopeRef: RefObject<HTMLElement | null>,
  onRange: (range: Range) => void,
): void {
  useEffect(() => {
    function handleLinkRequest() {
      const selection = document.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        return;
      }
      const range = selection.getRangeAt(0);
      if (!scopeRef.current?.contains(range.commonAncestorContainer)) return;
      const richElement = findRichAncestor(range.commonAncestorContainer);
      if (richElement?.dataset.plainText === "true") return;
      onRange(range.cloneRange());
    }
    document.addEventListener(RICH_TEXT_LINK_REQUEST_EVENT, handleLinkRequest);
    return () =>
      document.removeEventListener(
        RICH_TEXT_LINK_REQUEST_EVENT,
        handleLinkRequest,
      );
  }, [scopeRef, onRange]);
}
