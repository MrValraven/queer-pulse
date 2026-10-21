import { useEffect, type RefObject } from "react";
import { findHelpMatchRanges } from "./studioHelpSearch";

/** The name the stylesheet's `::highlight()` rule paints. */
export const HELP_HIGHLIGHT_NAME = "studio-help-match";
/** Marks an element whose text the highlight may paint. */
export const HELP_HIGHLIGHT_SELECTOR = "[data-help-highlight]";

interface HighlightRegistry {
  set: (name: string, highlight: unknown) => void;
  delete: (name: string) => void;
}

/**
 * Paints the search terms inside the open answers with the CSS Custom
 * Highlight API, so the answer's own markup (links, emphasis) is never
 * touched. A browser without the API simply shows no highlight there; the
 * questions carry their own `<mark>`.
 */
export function useStudioHelpHighlight(
  containerRef: RefObject<HTMLElement | null>,
  terms: readonly string[],
  openKey: string,
): void {
  const termsKey = terms.join(" ");
  useEffect(() => {
    if (typeof CSS === "undefined" || !("highlights" in CSS)) return;
    const registry = (CSS as unknown as { highlights?: HighlightRegistry })
      .highlights;
    const HighlightConstructor = (
      window as unknown as {
        Highlight?: new (...ranges: Range[]) => unknown;
      }
    ).Highlight;
    const container = containerRef.current;
    if (!registry || !HighlightConstructor || !container) return;
    const ranges: Range[] = [];
    if (termsKey) {
      // Only the FAQ answers carry the marker, so the search box, the
      // headings and the contact cards stay unpainted.
      for (const answer of container.querySelectorAll(
        HELP_HIGHLIGHT_SELECTOR,
      )) {
        const walker = document.createTreeWalker(answer, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = node.textContent ?? "";
          for (const [start, end] of findHelpMatchRanges(
            text,
            termsKey.split(" "),
          )) {
            const range = document.createRange();
            range.setStart(node, start);
            range.setEnd(node, end);
            ranges.push(range);
          }
        }
      }
    }
    if (ranges.length > 0)
      registry.set(HELP_HIGHLIGHT_NAME, new HighlightConstructor(...ranges));
    else registry.delete(HELP_HIGHLIGHT_NAME);
    return () => registry.delete(HELP_HIGHLIGHT_NAME);
  }, [containerRef, termsKey, openKey]);
}
