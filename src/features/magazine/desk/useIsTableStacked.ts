import { useLayoutEffect, useState, type RefObject } from "react";

/** The `desk-pieces` container width under which rows stack into phone
 *  cards. Must match the `@container desk-pieces (width < 660px)` steps in
 *  PiecesPipeline.module.css and PieceRow.module.css. */
export const DESK_TABLE_STACK_WIDTH = 660;

/**
 * Whether the pipeline table is narrow enough that its rows stack, read
 * from the same box the CSS container query reads (`.pieces`, content box).
 *
 * CSS alone places a stacked row's cells, but it cannot reorder them for
 * the keyboard: the phone card shows the verb and More on the title's line,
 * so the row renders those controls earlier in the DOM while this is true,
 * and Tab then walks the card in the order it reads. A box with no width
 * yet reads as wide: a test DOM lays nothing out (jsdom's `clientWidth` is
 * 0, and the suite's global ResizeObserver stub never fires), and an engine
 * with no ResizeObserver at all keeps the wide order too.
 */
export function useIsTableStacked(
  tableRef: RefObject<HTMLElement | null>,
): boolean {
  const [isStacked, setIsStacked] = useState(false);

  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!table || typeof ResizeObserver === "undefined") return;
    const update = (width: number) =>
      setIsStacked(width > 0 && width < DESK_TABLE_STACK_WIDTH);
    update(table.clientWidth);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) update(entry.contentRect.width);
    });
    observer.observe(table);
    return () => observer.disconnect();
  }, [tableRef]);

  return isStacked;
}
