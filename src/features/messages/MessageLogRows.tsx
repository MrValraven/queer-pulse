import { type RefObject } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { MessageAreaRow, type MessageAreaRowProps } from "./MessageAreaRow";
import { FloatingDayHeader } from "./FloatingDayHeader";
import { ROW_GAP_PX, type MessageRow } from "./messageRows";
import styles from "./MessagesPage.module.css";

/** Everything a row needs except what the virtual item itself supplies. */
export type MessageLogRowsProps = Omit<
  MessageAreaRowProps,
  "row" | "index" | "measureElementRef" | "top" | "paddingBottomPx"
> & {
  areaRef: RefObject<HTMLDivElement | null>;
  conversationId: string;
  rows: MessageRow[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
};

/**
 * The virtualized body of the message log, extracted from `MessageArea`: the
 * sizer, the floating day pill pinned inside it, and the rows the virtualizer
 * currently windows in. Not memoized, so it re-renders with `MessageArea`
 * whenever the virtualizer's range or measurements change.
 */
export function MessageLogRows({
  areaRef,
  conversationId,
  rows,
  rowVirtualizer,
  ...rowProps
}: MessageLogRowsProps) {
  return (
    // The virtualized sizer: its height is the virtualizer's running total
    // across every row's real (or, until measured, estimated) height, and each
    // row below is absolutely positioned within it by its own `top` offset.
    // Only the visible window + a small overscan actually mounts, however long
    // the thread gets.
    <div
      className={styles.virtualSizer}
      role="list"
      style={{ height: rowVirtualizer.getTotalSize() }}
    >
      {/* The pinned "Yesterday / 3 September" pill: a zero-height sticky
          overlay, see `FloatingDayHeader`. */}
      <FloatingDayHeader
        areaRef={areaRef}
        conversationId={conversationId}
        rows={rows}
        rowVirtualizer={rowVirtualizer}
      />
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index];
        if (!row) return null;
        return (
          <MessageAreaRow
            key={virtualRow.key}
            {...rowProps}
            row={row}
            index={virtualRow.index}
            measureElementRef={rowVirtualizer.measureElement}
            top={virtualRow.start}
            paddingBottomPx={ROW_GAP_PX}
          />
        );
      })}
    </div>
  );
}
