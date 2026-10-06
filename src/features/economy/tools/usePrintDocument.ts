import { useCallback } from "react";
import {
  getDocumentBaseTitle,
  writeDocumentTitle,
} from "../../../shared/seo/documentTitleBadge";

/**
 * Native browser print-to-PDF. Temporarily swaps `document.title` (which drives
 * the suggested filename in "Save as PDF") to `filename`, calls
 * `window.print()`, and restores the title afterwards through
 * `writeDocumentTitle`, so the unread count comes back while the filename
 * itself never carries it. The print stylesheet
 * (`tools.print.css`) isolates the `[data-print-root]` region so only the
 * document preview is printed.
 *
 * No PDF library — the on-screen preview IS the print target, giving real
 * vector text and full brand fidelity.
 */
export function usePrintDocument() {
  return useCallback((filename: string) => {
    const previous = getDocumentBaseTitle();
    const restore = () => {
      writeDocumentTitle(previous);
      window.removeEventListener("afterprint", restore);
    };
    document.title = filename;
    window.addEventListener("afterprint", restore);
    window.print();
    // Fallback for browsers that don't fire afterprint reliably.
    window.setTimeout(restore, 1000);
  }, []);
}
