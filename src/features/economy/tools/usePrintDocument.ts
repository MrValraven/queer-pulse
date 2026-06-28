import { useCallback } from 'react'

/**
 * Native browser print-to-PDF. Temporarily swaps `document.title` (which drives
 * the suggested filename in "Save as PDF") to `filename`, calls
 * `window.print()`, and restores the title afterwards. The print stylesheet
 * (`tools.print.css`) isolates the `[data-print-root]` region so only the
 * document preview is printed.
 *
 * No PDF library — the on-screen preview IS the print target, giving real
 * vector text and full brand fidelity.
 */
export function usePrintDocument() {
  return useCallback((filename: string) => {
    const previous = document.title
    const restore = () => {
      document.title = previous
      window.removeEventListener('afterprint', restore)
    }
    document.title = filename
    window.addEventListener('afterprint', restore)
    window.print()
    // Fallback for browsers that don't fire afterprint reliably.
    window.setTimeout(restore, 1000)
  }, [])
}
